"""Additional features module for SnapLeads v3.5.1.

Implements the remaining 22+ features that were missing or non-functional:
  - Email Finder (dorking + pattern generation + SMTP verify)
  - Directory Scraper (7 directories)
  - Job Boards (Indeed, RemoteOK)
  - Lead Enrichment pipeline
  - Citation Checker + GBP Detection
  - SMTP Checker (DNS MX verification)
  - Clean Feature (data normalization)

All methods: Zero API keys | Zero browser automation | 100% ban-free.
Works in PyInstaller bundle on Windows/macOS/Linux.
"""

from __future__ import annotations

import csv
import html as _html_mod
import io
import ipaddress
import logging
import re
import socket
from urllib.parse import quote_plus

try:
    import dns.resolver as _dns_resolver  # type: ignore[import-untyped]
    _HAS_DNSPYTHON = True
except ImportError:
    _dns_resolver = None  # type: ignore[assignment]
    _HAS_DNSPYTHON = False

from app.services.anti_detection import AdSession
from app.services.extractor import extract_emails, extract_phones
from app.services.multi_engine_search import free_search_waterfall

logger = logging.getLogger(__name__)


def _is_private_ip(hostname: str) -> bool:
    """Check if a hostname resolves to a private/loopback IP (SSRF protection).

    NOTE on DNS rebinding: A sophisticated attacker could return a public IP on
    first resolution, then a private IP on subsequent resolutions.  For a
    *desktop* app (not a server-side proxy) the risk is negligible because the
    attacker would need to control DNS for a domain the *local user* visits.
    We accept this as a known limitation — no server-side secrets to exfiltrate.
    """
    try:
        addr_infos = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
        for _family, _, _, _, sockaddr in addr_infos:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                return True
        return False
    except (socket.gaierror, ValueError, OSError):
        # Can't resolve → treat as potentially unsafe
        return True


def _vcard_escape(value: str) -> str:
    """Escape special characters in vCard field values per RFC 6868."""
    # Order matters: escape backslash first
    value = value.replace("\\", "\\\\")
    value = value.replace(",", "\\,")
    value = value.replace(";", "\\;")
    value = value.replace("\n", "\\n")
    return value


def _strip_tags(text: str) -> str:
    """Remove HTML tags, inserting a space so adjacent fields don't merge."""
    cleaned = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
    cleaned = re.sub(r"<script[^>]*>.*?</script>", "", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)  # space, not empty string
    cleaned = _html_mod.unescape(cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


# ===========================================================================
# 1. EMAIL FINDER — Dorking + pattern generation + SMTP verify
# ===========================================================================

# Common email patterns for businesses
_EMAIL_PATTERNS = [
    "{first}@{domain}",
    "{first}.{last}@{domain}",
    "{first}{last}@{domain}",
    "{f}{last}@{domain}",
    "{first}_{last}@{domain}",
    "info@{domain}",
    "contact@{domain}",
    "hello@{domain}",
    "admin@{domain}",
    "support@{domain}",
    "sales@{domain}",
    "team@{domain}",
    "hr@{domain}",
    "careers@{domain}",
]


def find_emails_by_domain(
    domain: str,
    first_name: str = "",
    last_name: str = "",
    max_results: int = 10,
) -> list[dict]:
    """Find email addresses for a domain using dorking + pattern generation.

    Strategy:
    1. Search engine dorking for publicly exposed emails
    2. Generate likely email patterns
    3. Optionally verify via SMTP (if caller wants)
    """
    results: list[dict] = []
    found_emails: set[str] = set()

    # Step 1: Dorking for exposed emails
    dork_queries = [
        f'"@{domain}" email',
        f'site:{domain} email OR contact OR "@{domain}"',
        f'"{domain}" "contact us" email',
    ]

    try:
        for dork in dork_queries[:2]:
            search_results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in search_results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                for email in extract_emails(text):
                    if email.lower().endswith(f"@{domain.lower()}"):
                        if email.lower() not in found_emails:
                            found_emails.add(email.lower())
                            results.append({
                                "email": email,
                                "source": "dorking",
                                "confidence": "high",
                                "verified": False,
                            })
    except Exception as exc:
        logger.debug("Email finder dorking error: %s", exc)

    # Step 2: Visit domain contact pages (with SSRF protection)
    if _is_private_ip(domain):
        logger.warning("Skipping private/loopback domain: %s", domain)
        return results[:max_results]

    try:
        contact_paths = ["/contact", "/about", "/contact-us", "/about-us", "/team"]
        with AdSession(timeout=10.0, min_delay=1.5) as session:
            for path in contact_paths[:3]:
                try:
                    url = f"https://{domain}{path}"
                    resp = session.get(url)
                    if resp.status_code == 200:
                        page_text = _strip_tags(resp.text[:100_000])
                        for email in extract_emails(page_text):
                            if email.lower() not in found_emails:
                                found_emails.add(email.lower())
                                results.append({
                                    "email": email,
                                    "source": "website",
                                    "confidence": "high",
                                    "verified": False,
                                })
                except Exception:
                    continue
    except Exception as exc:
        logger.debug("Email finder website scrape error: %s", exc)

    # Step 3: Generate email pattern guesses (lower confidence)
    if first_name and last_name:
        first = first_name.lower().strip()
        last = last_name.lower().strip()
        f_initial = first[0] if first else ""

        for pattern in _EMAIL_PATTERNS[:6]:
            try:
                email = pattern.format(
                    first=first, last=last, f=f_initial, domain=domain.lower(),
                )
                if email and email not in found_emails and "@" in email:
                    found_emails.add(email)
                    results.append({
                        "email": email,
                        "source": "pattern",
                        "confidence": "medium",
                        "verified": False,
                    })
            except (KeyError, IndexError):
                continue

    # Also add generic patterns (no first/last needed)
    for pattern in _EMAIL_PATTERNS[6:]:
        try:
            email = pattern.format(domain=domain.lower())
            if email and email not in found_emails and "@" in email:
                found_emails.add(email)
                results.append({
                    "email": email,
                    "source": "pattern",
                    "confidence": "low",
                    "verified": False,
                })
        except (KeyError, IndexError):
            continue

    return results[:max_results]


# ===========================================================================
# 2. DIRECTORY SCRAPER — 7 directory sites
# ===========================================================================

_DIRECTORY_SITES = [
    ("yellowpages", "https://www.yellowpages.com/search?search_terms={query}"),
    ("yelp", "https://www.yelp.com/search?find_desc={query}"),
    ("bbb", "https://www.bbb.org/search?find_text={query}"),
    ("manta", "https://www.manta.com/search?search_source=nav&search={query}"),
    ("hotfrog", "https://www.hotfrog.com/search/{query}"),
    ("superpages", "https://www.superpages.com/search?search_terms={query}"),
    ("cylex", "https://www.cylex.us.com/search/{query}"),
]


def scrape_directories(
    query: str,
    location: str = "",
    max_per_directory: int = 10,
) -> list[dict]:
    """Scrape business directories for leads.

    Visits 7 major directories and extracts business contact info.
    All via HTTP — no browser automation needed.
    """
    leads: list[dict] = []
    search_term = f"{query} {location}".strip() if location else query
    encoded_query = quote_plus(search_term)

    with AdSession(timeout=12.0, min_delay=2.5) as session:
        for dir_name, url_template in _DIRECTORY_SITES:
            try:
                url = url_template.format(query=encoded_query)
                resp = session.get(url)

                if resp.status_code != 200:
                    logger.debug("Directory %s: HTTP %d", dir_name, resp.status_code)
                    continue

                page_text = _strip_tags(resp.text[:200_000])
                emails = extract_emails(page_text)
                phones = extract_phones(page_text)

                for email in emails[:max_per_directory]:
                    leads.append({
                        "email": email, "phone": "", "name": "",
                        "platform": "directories",
                        "source_url": url,
                        "directory": dir_name,
                    })
                for phone in phones[:max_per_directory]:
                    leads.append({
                        "email": "", "phone": phone, "name": "",
                        "platform": "directories",
                        "source_url": url,
                        "directory": dir_name,
                    })

                logger.info("Directory %s: %d emails, %d phones", dir_name, len(emails), len(phones))

            except Exception as exc:
                logger.debug("Directory %s scrape error: %s", dir_name, exc)
                continue

    return leads


# ===========================================================================
# 3. JOB BOARDS — Indeed + RemoteOK
# ===========================================================================

def _scrape_indeed_rss(
    query: str,
    location: str = "",
    max_results: int = 15,
) -> list[dict]:
    """v3.5.60: Try Indeed RSS feed first (free, no auth, no dorking needed).

    Indeed RSS returns XML with job title, company, location, link.
    Falls back to dorking if RSS returns nothing.
    """
    leads: list[dict] = []

    india_locations = {"india", "delhi", "mumbai", "bangalore", "chennai",
                       "hyderabad", "pune", "kolkata", "ahmedabad", "jaipur",
                       "noida", "gurugram", "gurgaon"}
    is_india = location.lower() in india_locations
    domain = "in.indeed.com" if is_india else "www.indeed.com"

    rss_url = (
        f"https://{domain}/rss?q={quote_plus(query)}"
        f"&l={quote_plus(location)}&limit={min(max_results, 25)}"
    )

    try:
        with AdSession(timeout=12.0, min_delay=1.0) as session:
            resp = session.get(
                rss_url,
                headers={"Accept": "application/rss+xml, application/xml, text/xml"},
            )
            if resp.status_code == 200 and "<item>" in resp.text:
                import xml.etree.ElementTree as ET
                try:
                    root = ET.fromstring(resp.text)
                    for item in root.iter("item"):
                        title_el = item.find("title")
                        link_el = item.find("link")
                        source_el = item.find("source")

                        title = title_el.text.strip() if title_el is not None and title_el.text else ""
                        link = link_el.text.strip() if link_el is not None and link_el.text else ""
                        company = source_el.text.strip() if source_el is not None and source_el.text else ""

                        if not company and " - " in title:
                            parts = title.split(" - ")
                            if len(parts) >= 2:
                                company = parts[-2].strip() if len(parts) >= 3 else parts[-1].strip()

                        if title or company:
                            leads.append({
                                "name": company or title,
                                "email": "",
                                "phone": "",
                                "platform": "job_boards",
                                "source_url": link,
                                "location": location,
                                "job_title": title,
                            })
                        if len(leads) >= max_results:
                            break
                    if leads:
                        logger.info("Indeed RSS: %d leads for '%s'", len(leads), query)
                        return leads[:max_results]
                except ET.ParseError:
                    logger.debug("Indeed RSS: XML parse error, falling back to dorking")
    except Exception as exc:
        logger.debug("Indeed RSS error: %s — falling back to dorking", exc)

    return leads[:max_results]


def _scrape_indeed_dorking(
    query: str,
    location: str = "",
    max_results: int = 15,
) -> list[dict]:
    """Find Indeed job listings via Google dorking.

    R2-B01 fix: Indeed RSS was deprecated in 2023. Replace with dorking
    approach that still works reliably.
    R2-B02 fix: Use in.indeed.com for India, www.indeed.com for others.
    """
    leads: list[dict] = []
    search_term = f"{query} {location}".strip() if location else query

    # R2-B02 fix: Use correct domain for India
    india_locations = {"india", "delhi", "mumbai", "bangalore", "chennai",
                       "hyderabad", "pune", "kolkata", "ahmedabad", "jaipur"}
    domain = "in.indeed.com" if location.lower() in india_locations else "indeed.com"

    dork_queries = [
        f'site:{domain} "{search_term}"',
        f'site:{domain} "{query}" "{location}" company',
    ]

    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")
                title = r.get("title", "")

                # Extract company from Indeed title: "Job Title - Company - Location"
                company = ""
                if " - " in title:
                    parts = title.split(" - ")
                    if len(parts) >= 2:
                        company = parts[-2].strip() if len(parts) >= 3 else parts[-1].strip()

                emails_found = extract_emails(text)
                phones_found = extract_phones(text)

                # R2-B03 fix: Don't require email — add lead if we have company name
                lead_entry: dict[str, str] = {
                    "name": company or title,
                    "email": emails_found[0] if emails_found else "",
                    "phone": phones_found[0] if phones_found else "",
                    "platform": "job_boards",
                    "source_url": link,
                    "location": location,
                    "job_title": title,
                }
                leads.append(lead_entry)

                if len(leads) >= max_results:
                    break
            if len(leads) >= max_results:
                break

    except Exception as exc:
        logger.debug("Indeed dorking error: %s", exc)

    return leads[:max_results]


def _scrape_craigslist(
    query: str,
    location: str = "",
    max_results: int = 10,
) -> list[dict]:
    """Scrape Craigslist job listings via dorking.

    v3.5.1: Craigslist blocks direct scraping but search engines
    index job listings with contact info in snippets.
    """
    leads: list[dict] = []
    search_term = f"{query} {location}".strip() if location else query

    dork_queries = [
        f'site:craigslist.org "{search_term}" email OR contact',
        f'craigslist.org "{search_term}" hiring phone OR email',
    ]

    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")
                title = r.get("title", "")

                emails_found = extract_emails(text)
                phones_found = extract_phones(text)

                if emails_found or phones_found:
                    leads.append({
                        "email": emails_found[0] if emails_found else "",
                        "phone": phones_found[0] if phones_found else "",
                        "name": title,
                        "platform": "job_boards",
                        "source_url": link,
                        "location": location,
                    })
    except Exception as exc:
        logger.debug("Craigslist dorking error: %s", exc)

    return leads[:max_results]


def scrape_job_boards(
    query: str,
    location: str = "",
    max_results: int = 20,
    boards: list[str] | None = None,
) -> list[dict]:
    """Scrape job boards for company hiring contacts.

    v3.5.1: Enhanced with Indeed RSS, Craigslist dorking, Glassdoor dorking,
    OLX dorking. Boards parameter lets caller select specific boards.

    Supported boards: indeed, glassdoor, craigslist, olx, remoteok
    """
    leads: list[dict] = []
    target_boards = set(b.lower() for b in (boards or ["indeed", "glassdoor", "craigslist", "olx", "remoteok"]))

    # Method 1: Indeed — try RSS first (v3.5.60), then dorking fallback
    if "indeed" in target_boards:
        try:
            indeed_leads = _scrape_indeed_rss(query, location, max_results=15)
            if indeed_leads:
                leads.extend(indeed_leads)
                logger.info("Indeed RSS: %d leads", len(indeed_leads))
            else:
                indeed_leads = _scrape_indeed_dorking(query, location, max_results=15)
                leads.extend(indeed_leads)
                logger.info("Indeed dorking: %d leads", len(indeed_leads))
        except Exception as exc:
            logger.debug("Indeed error: %s", exc)

    # Method 2: Glassdoor dorking (R2-B03 fix: remove email guard)
    if "glassdoor" in target_boards:
        search_term = f"{query} {location}".strip() if location else query
        dork_queries = [
            f'site:glassdoor.com "{search_term}" company',
            f'site:glassdoor.co.in "{search_term}" company',
        ]
        try:
            for dork in dork_queries:
                results = free_search_waterfall(dork, num_results=10, min_results=2)
                for r in results:
                    text = f"{r.get('title', '')} {r.get('snippet', '')}"
                    link = r.get("link", "")
                    title = r.get("title", "")
                    company = title.split(" Reviews")[0].split(" | ")[0].strip() if title else ""

                    emails_found = extract_emails(text)
                    phones_found = extract_phones(text)
                    # R2-B03 fix: Don't require email — company name is valuable
                    leads.append({
                        "email": emails_found[0] if emails_found else "",
                        "phone": phones_found[0] if phones_found else "",
                        "name": company,
                        "platform": "job_boards",
                        "source_url": link,
                        "location": location,
                    })
        except Exception as exc:
            logger.debug("Glassdoor dorking error: %s", exc)

    # Method 3: Craigslist dorking (v3.5.1)
    if "craigslist" in target_boards:
        try:
            cl_leads = _scrape_craigslist(query, location, max_results=10)
            leads.extend(cl_leads)
            logger.info("Craigslist: %d leads", len(cl_leads))
        except Exception as exc:
            logger.debug("Craigslist error: %s", exc)

    # Method 4: OLX dorking (R2-B05 fix: split into separate dork per domain)
    if "olx" in target_boards:
        search_term = f"{query} {location}".strip() if location else query
        # R2-B05 fix: separate dorks — DDG/Brave don't support multi-site OR
        for olx_domain in ["olx.in", "olx.com"]:
            try:
                results = free_search_waterfall(
                    f'site:{olx_domain} "{search_term}"',
                    num_results=8, min_results=2,
                )
                for r in results:
                    text = f"{r.get('title', '')} {r.get('snippet', '')}"
                    link = r.get("link", "")
                    emails_found = extract_emails(text)
                    phones_found = extract_phones(text)
                    # R2-B03 fix: Don't require email
                    leads.append({
                        "email": emails_found[0] if emails_found else "",
                        "phone": phones_found[0] if phones_found else "",
                        "name": r.get("title", ""),
                        "platform": "job_boards",
                        "source_url": link,
                        "location": location,
                    })
            except Exception as exc:
                logger.debug("OLX %s dorking error: %s", olx_domain, exc)

    # Method 5: Indian job boards (R2-B04 fix: Naukri, Shine, Foundit)
    india_locations = {"india", "delhi", "mumbai", "bangalore", "chennai",
                       "hyderabad", "pune", "kolkata", "ahmedabad", "jaipur",
                       "noida", "gurugram", "gurgaon"}
    if location.lower() in india_locations:
        indian_boards = [
            ("naukri", "naukri.com"),
            ("shine", "shine.com"),
            ("foundit", "foundit.in"),
        ]
        for board_name, board_domain in indian_boards:
            if boards and board_name not in target_boards:
                continue
            try:
                dork = f'site:{board_domain} "{query}" "{location}"'
                results = free_search_waterfall(dork, num_results=8, min_results=2)
                for r in results:
                    text = f"{r.get('title', '')} {r.get('snippet', '')}"
                    link = r.get("link", "")
                    title = r.get("title", "")
                    company = ""
                    if " - " in title:
                        parts = title.split(" - ")
                        company = parts[-1].strip() if len(parts) >= 2 else ""

                    emails_found = extract_emails(text)
                    phones_found = extract_phones(text)
                    leads.append({
                        "email": emails_found[0] if emails_found else "",
                        "phone": phones_found[0] if phones_found else "",
                        "name": company or title,
                        "platform": "job_boards",
                        "source_url": link,
                        "location": location,
                        "job_title": title,
                    })
            except Exception as exc:
                logger.debug("%s dorking error: %s", board_name, exc)

    # Method 6: RemoteOK JSON API (public, no auth)
    if "remoteok" in target_boards:
        try:
            with AdSession(timeout=10.0, min_delay=2.0) as session:
                resp = session.get(
                    "https://remoteok.com/api",
                    headers={"Accept": "application/json"},
                )
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list):
                    for job in data[1:max_results + 1]:
                        if not isinstance(job, dict):
                            continue
                        company = job.get("company", "")
                        url = job.get("url", "")
                        position = job.get("position", "")
                        job_location = job.get("location", "")

                        text = f"{company} {position} {job.get('description', '')}".lower()
                        if query.lower() in text:
                            leads.append({
                                "name": company,
                                "email": "",
                                "phone": "",
                                "platform": "job_boards",
                                "source_url": url or "https://remoteok.com",
                                "location": job_location,
                                "job_title": position,
                            })
        except Exception as exc:
            logger.debug("RemoteOK scrape error: %s", exc)

    logger.info("Job boards total: %d leads", len(leads))
    return leads[:max_results]


# ===========================================================================
# 4. LEAD ENRICHMENT — Add missing data to existing leads
# ===========================================================================

def enrich_lead(lead: dict) -> dict:
    """Enrich a lead with additional data from public sources.

    If we have a domain, try to find:
    - Company name
    - Phone number
    - Social media profiles
    - Location
    """
    enriched = dict(lead)

    email = lead.get("email", "")
    if not email or "@" not in email:
        return enriched

    domain = email.split("@")[-1].lower()

    # Skip personal email domains
    personal_domains = {
        "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
        "aol.com", "icloud.com", "protonmail.com",
    }
    if domain in personal_domains:
        return enriched

    # SSRF protection: reject private/loopback IPs (Issue #33 fix)
    if _is_private_ip(domain):
        logger.warning("Skipping private/loopback domain in enrichment: %s", domain)
        return enriched

    # Try to fetch company website
    try:
        with AdSession(timeout=8.0, min_delay=1.0) as session:
            resp = session.get(f"https://{domain}")

        if resp.status_code == 200:
            html = resp.text[:100_000]
            page_text = _strip_tags(html)

            # Extract company name from title
            title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.DOTALL | re.IGNORECASE)
            if title_match and not enriched.get("company"):
                enriched["company"] = _strip_tags(title_match.group(1))[:100]

            # Extract phone if missing
            if not enriched.get("phone"):
                phones = extract_phones(page_text)
                if phones:
                    enriched["phone"] = phones[0]

            # Extract location
            if not enriched.get("location"):
                # Look for address patterns
                addr_match = re.search(
                    r'(?:address|location|headquarters)[:\s]*([^<\n]{10,100})',
                    page_text, re.IGNORECASE,
                )
                if addr_match:
                    enriched["location"] = addr_match.group(1).strip()

    except Exception as exc:
        logger.debug("Enrichment error for %s: %s", domain, exc)

    return enriched


def enrich_leads_batch(leads: list[dict], max_enrich: int = 20) -> list[dict]:
    """Enrich multiple leads (limited to avoid rate limiting)."""
    enriched: list[dict] = []
    for i, lead in enumerate(leads):
        if i < max_enrich:
            enriched.append(enrich_lead(lead))
        else:
            enriched.append(lead)
    return enriched


# ===========================================================================
# 5. CITATION CHECKER — Check if business is cited on major directories
# ===========================================================================

def check_citations(
    business_name: str,
    location: str = "",
) -> dict:
    """Check if a business appears on major citation sites.

    Returns a dict of directory -> bool (found/not found).
    """
    search_term = f'"{business_name}" "{location}"' if location else f'"{business_name}"'
    citations: dict[str, bool] = {}

    citation_sites = [
        ("google_maps", "site:google.com/maps"),
        ("yelp", "site:yelp.com"),
        ("yellowpages", "site:yellowpages.com"),
        ("bbb", "site:bbb.org"),
        ("facebook", "site:facebook.com"),
        ("linkedin", "site:linkedin.com"),
        ("tripadvisor", "site:tripadvisor.com"),
    ]

    try:
        for site_name, site_prefix in citation_sites:
            try:
                dork = f'{site_prefix} {search_term}'
                results = free_search_waterfall(dork, num_results=3, min_results=1, max_engines=1)
                citations[site_name] = len(results) > 0
            except Exception:
                citations[site_name] = False
    except Exception as exc:
        logger.debug("Citation check error: %s", exc)

    return {
        "business_name": business_name,
        "location": location,
        "citations": citations,
        "total_found": sum(1 for v in citations.values() if v),
        "total_checked": len(citations),
    }


# ===========================================================================
# 6. GBP (Google Business Profile) DETECTION
# ===========================================================================

def detect_gbp(
    business_name: str,
    location: str = "",
) -> dict:
    """Check if a business has a Google Business Profile.

    Uses dorking to find Google Maps/Business listings.
    """
    search_term = f"{business_name} {location}".strip()
    result: dict = {
        "business_name": business_name,
        "location": location,
        "has_gbp": False,
        "gbp_url": "",
        "details": {},
    }

    dork_queries = [
        f'site:google.com/maps/place "{search_term}"',
        f'"{search_term}" google maps business',
    ]

    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=5, min_results=1, max_engines=1)
            for r in results:
                link = r.get("link", "")
                if "google.com/maps" in link or "goo.gl/maps" in link:
                    result["has_gbp"] = True
                    result["gbp_url"] = link
                    result["details"] = {
                        "title": r.get("title", ""),
                        "snippet": r.get("snippet", ""),
                    }
                    return result
    except Exception as exc:
        logger.debug("GBP detection error: %s", exc)

    return result


# ===========================================================================
# 7. SMTP CHECKER — DNS MX verification
# ===========================================================================

def check_smtp(email: str) -> dict:
    """Verify an email address via DNS MX record lookup.

    Does NOT send emails — only checks if the domain has valid MX records.
    This is the safest verification method (no SMTP connection needed).
    """
    result: dict = {
        "email": email,
        "valid_format": False,
        "has_mx": False,
        "mx_records": [],
        "is_disposable": False,
        "is_role_based": False,
    }

    # Format check
    email_regex = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    if not email_regex.match(email):
        return result
    result["valid_format"] = True

    domain = email.split("@")[-1].lower()

    # Disposable check
    disposable_domains = {
        "mailinator.com", "guerrillamail.com", "tempmail.com",
        "throwaway.email", "10minutemail.com", "trashmail.com",
        "yopmail.com", "dispostable.com", "maildrop.cc",
    }
    if domain in disposable_domains:
        result["is_disposable"] = True

    # Role-based check
    local_part = email.split("@")[0].lower()
    role_prefixes = {
        "info", "contact", "admin", "support", "sales", "help",
        "billing", "noreply", "no-reply", "postmaster", "webmaster",
        "abuse", "spam", "marketing", "pr", "media", "press",
    }
    if local_part in role_prefixes:
        result["is_role_based"] = True

    # MX record lookup
    if _HAS_DNSPYTHON and _dns_resolver is not None:
        try:
            mx_records = _dns_resolver.resolve(domain, "MX")
            result["has_mx"] = True
            result["mx_records"] = [
                str(r.exchange).rstrip(".") for r in mx_records
            ]
        except (_dns_resolver.NoAnswer, _dns_resolver.NXDOMAIN):
            result["has_mx"] = False
        except _dns_resolver.NoNameservers:
            result["has_mx"] = False
    else:
        # dnspython not available, try socket fallback
        try:
            socket.getaddrinfo(domain, 25)
            result["has_mx"] = True
        except socket.gaierror:
            result["has_mx"] = False

    return result


def check_smtp_batch(emails: list[str]) -> list[dict]:
    """Verify multiple email addresses."""
    return [check_smtp(email) for email in emails]


# ===========================================================================
# 8. CLEAN FEATURE — Data normalization for pro users
# ===========================================================================

def clean_lead(lead: dict) -> dict:
    """Normalize and clean a lead's data.

    - Normalize email casing
    - Format phone numbers
    - Trim whitespace
    - Remove duplicates within fields
    - Validate email format
    """
    cleaned = dict(lead)

    # Clean email
    email = cleaned.get("email", "")
    if email:
        email = email.strip().lower()
        # Remove mailto: prefix
        if email.startswith("mailto:"):
            email = email[7:]
        # Validate format
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            email = ""
        cleaned["email"] = email

    # Clean phone
    phone = cleaned.get("phone", "")
    if phone:
        phone = phone.strip()
        # Remove common prefixes
        phone = re.sub(r'^tel:', '', phone, flags=re.IGNORECASE)
        phone = re.sub(r'^phone:', '', phone, flags=re.IGNORECASE)
        # Normalize format: keep digits, +, -, (, ), spaces
        cleaned_phone = re.sub(r'[^\d+\-() ]', '', phone)
        # Must have at least 7 digits
        digits_only = re.sub(r'[^\d]', '', cleaned_phone)
        if len(digits_only) >= 7:
            cleaned["phone"] = cleaned_phone.strip()
        else:
            cleaned["phone"] = ""

    # Clean name
    name = cleaned.get("name", "")
    if name:
        name = name.strip()
        # Remove excess whitespace
        name = re.sub(r'\s+', ' ', name)
        # Title case if all lower/upper
        if name.isupper() or name.islower():
            name = name.title()
        cleaned["name"] = name

    # Clean location
    location = cleaned.get("location", "")
    if location:
        location = location.strip()
        location = re.sub(r'\s+', ' ', location)
        cleaned["location"] = location

    return cleaned


def clean_leads_batch(leads: list[dict]) -> list[dict]:
    """Clean and normalize multiple leads."""
    cleaned: list[dict] = []
    seen_emails: set[str] = set()
    seen_phones: set[str] = set()

    for lead in leads:
        cl = clean_lead(lead)

        # Dedup by email
        email = cl.get("email", "")
        if email:
            if email.lower() in seen_emails:
                continue
            seen_emails.add(email.lower())

        # Dedup by phone (R3-9 fix: also dedup when lead has both email AND phone)
        phone = cl.get("phone", "")
        if phone:
            digits = re.sub(r'[^\d]', '', phone)
            if digits in seen_phones and not email:
                # Only skip if this lead has NO email — leads with unique
                # emails but duplicate phones are still valuable
                continue
            seen_phones.add(digits)

        # Must have at least email or phone
        if email or phone:
            cleaned.append(cl)

    return cleaned


# ===========================================================================
# 9. CRM EXPORT — CSV/Excel/vCard formats
# ===========================================================================

def export_leads_csv(leads: list[dict]) -> str:
    """Export leads to CSV string."""
    output = io.StringIO()
    if not leads:
        return ""

    fieldnames = ["name", "email", "phone", "platform", "location", "source_url", "quality_score"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for lead in leads:
        writer.writerow(lead)

    return output.getvalue()


def export_leads_vcard(leads: list[dict]) -> str:
    """Export leads to vCard format with proper escaping (RFC 6868)."""
    vcards: list[str] = []
    for lead in leads:
        name = _vcard_escape(lead.get("name", "") or "Unknown")
        email = lead.get("email", "")
        phone = lead.get("phone", "")

        # R2-17 fix: validate email format before including in vCard
        if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            email = ""

        vcard = "BEGIN:VCARD\nVERSION:3.0\n"
        vcard += f"FN:{name}\n"
        if email:
            vcard += f"EMAIL:{email}\n"
        if phone:
            vcard += f"TEL:{phone}\n"
        if lead.get("company"):
            vcard += f"ORG:{_vcard_escape(lead['company'])}\n"
        if lead.get("location"):
            vcard += f"ADR:;;{_vcard_escape(lead['location'])};;;;\n"
        vcard += "END:VCARD"
        vcards.append(vcard)

    return "\n".join(vcards)


# ===========================================================================
# 10. PDF EXPORT
# ===========================================================================


def _pdf_safe(text: str) -> str:
    """Sanitize text for PDF output — replace characters that can't be encoded.

    R3-8 fix: When the Unicode font (DejaVu) is unavailable and we fall back to
    Helvetica (latin1), non-ASCII characters would raise an encoding error.
    This strips them gracefully.
    """
    try:
        text.encode("latin-1")
        return text
    except (UnicodeEncodeError, UnicodeDecodeError):
        # Replace non-latin1 chars with '?' so the PDF doesn't crash
        return text.encode("latin-1", errors="replace").decode("latin-1")

def export_leads_pdf(leads: list[dict], title: str = "SnapLeads Export") -> bytes:
    """Export leads to PDF using fpdf2 (already in dependencies)."""
    try:
        from fpdf import FPDF
    except ImportError:
        logger.warning("fpdf2 not installed, cannot generate PDF")
        return b""

    pdf = FPDF()
    # R3-8 fix: Locate DejaVuSans font reliably in PyInstaller bundles.
    # Try multiple paths: fpdf2 bundled font dir, system fonts, then fallback.
    _font_family = "Helvetica"  # safe default (latin1 only)
    try:
        import importlib.resources as _pkg_res
        # fpdf2 ≥2.7.5 ships DejaVuSans in its font directory
        _fpdf_font_dir = str(_pkg_res.files("fpdf").joinpath("font"))
        import os as _os
        _djv_path = _os.path.join(_fpdf_font_dir, "DejaVuSans.ttf")
        _djv_bold = _os.path.join(_fpdf_font_dir, "DejaVuSans-Bold.ttf")
        if _os.path.isfile(_djv_path):
            pdf.add_font("DejaVu", "", _djv_path, uni=True)
            if _os.path.isfile(_djv_bold):
                pdf.add_font("DejaVu", "B", _djv_bold, uni=True)
            else:
                pdf.add_font("DejaVu", "B", _djv_path, uni=True)
            _font_family = "DejaVu"
    except Exception:
        pass  # Helvetica fallback is fine for ASCII leads

    pdf.add_page()
    pdf.set_font(_font_family, "B", 16)
    pdf.cell(0, 10, _pdf_safe(title), new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(5)

    pdf.set_font(_font_family, "B", 10)
    # Table header
    col_widths = [38, 52, 34, 24, 32]   # V7-fix: sum=180mm, 10mm safety margin
    headers = ["Name", "Email", "Phone", "Platform", "Location"]
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], 8, header, border=1, align="C")
    pdf.ln()

    pdf.set_font(_font_family, "", 8)
    for lead in leads[:500]:  # Limit to 500 for PDF
        name = _pdf_safe((lead.get("name", "") or "")[:25])
        email = _pdf_safe((lead.get("email", "") or "")[:35])
        phone = _pdf_safe((lead.get("phone", "") or "")[:20])
        platform = _pdf_safe((lead.get("platform", "") or "")[:15])
        location = _pdf_safe((lead.get("location", "") or "")[:20])

        pdf.cell(col_widths[0], 6, name, border=1)
        pdf.cell(col_widths[1], 6, email, border=1)
        pdf.cell(col_widths[2], 6, phone, border=1)
        pdf.cell(col_widths[3], 6, platform, border=1)
        pdf.cell(col_widths[4], 6, location, border=1)
        pdf.ln()

    return pdf.output()
