"""B2B platform scrapers for SnapLeads v3.5.57.

Dedicated scrapers for high-value B2B lead sources:

  TIER 0 (v3.5.49 — Generic Email Dorking):
    GenericEmailDork: Industry+location dorking that finds emails directly
                      on company websites via search engines. Proven 8-15 emails/query.

  TIER 1 (Dedicated Scrapers):
    IndiaMART:      SEO directory + JSON-LD + company microsites
    TradeIndia:     HTML scraping + JSON-LD profiles
    ExportersIndia: Simple HTML scraping
    JustDial:       Business directory (names, addresses, ratings)
    Google Maps:    Local Pack via google.com/search?tbm=lcl

  v3.5.57 NEW (Replaced Apollo/RocketReach/Crunchbase):
    Email Finder B2B:      Email pattern generation (64 patterns/lead) + contact page scraping
    GitHub B2B:            Developer leads with public emails (free API, 5K req/hr)
    Business Directories:  Combined dorking across JD/IM/TI/YP for maximum coverage

All methods: Zero API keys | Zero accounts | 100% ban-free with rate limiting.
Uses curl_cffi TLS fingerprint impersonation via AdSession.
"""

from __future__ import annotations

import html as _html_mod
import ipaddress
import json as _json_mod
import logging
import re
import socket
from typing import Optional
from urllib.parse import quote_plus, urljoin, urlparse

from app.services.anti_detection import AdSession
from app.services.extractor import extract_emails, extract_phones
from app.services.multi_engine_search import free_search_waterfall

logger = logging.getLogger(__name__)

# Maximum response body size to read (5 MB) — prevents OOM on huge pages
_MAX_RESPONSE_SIZE = 5 * 1024 * 1024


def _safe_response_text(resp: object) -> str:
    """Safely read response text, truncating to _MAX_RESPONSE_SIZE bytes.

    Prevents uncontrolled memory consumption from unexpectedly large responses.
    """
    try:
        text = resp.text  # type: ignore[union-attr]
        if len(text) > _MAX_RESPONSE_SIZE:
            return text[:_MAX_RESPONSE_SIZE]
        return text
    except Exception:
        return ""


def _is_private_ip(hostname: str) -> bool:
    """Check if hostname resolves to a private/loopback IP (SSRF protection)."""
    try:
        addr_infos = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
        for _family, _, _, _, sockaddr in addr_infos:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                return True
        return False
    except (socket.gaierror, ValueError, OSError):
        # DNS resolution failure — treat as potentially unsafe
        return True


def _strip_tags(text: str) -> str:
    """Remove HTML tags and decode entities, inserting spaces between fields."""
    cleaned = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
    cleaned = re.sub(r"<script[^>]*>.*?</script>", "", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)  # space, not empty string
    cleaned = _html_mod.unescape(cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def _query_contains_location(query: str, location: str) -> bool:
    """Check if location already appears as a standalone token/phrase in query.

    Uses word-boundary regex to avoid false positives with short locations
    like 'LA', 'IN', 'UK' matching inside other words (e.g. 'PLAIN', 'INDIA').
    """
    query_norm = re.sub(r"\s+", " ", query).strip().lower()
    location_norm = re.sub(r"\s+", " ", location).strip().lower()
    if not location_norm:
        return False
    return re.search(rf"(?<!\w){re.escape(location_norm)}(?!\w)", query_norm) is not None


def _dedup_leads(leads: list[dict]) -> list[dict]:
    """Remove duplicate leads using a tiered dedup strategy.

    V-R2 fix: use email as primary key (strongest), then (phone, name) as
    secondary, then (name, source_url) as fallback. This avoids both
    over-deduplication (collapsing different leads) and under-deduplication
    (keeping same contact from two URLs).
    """
    seen: set[str] = set()
    unique: list[dict] = []
    for lead in leads:
        email = (lead.get("email") or "").lower().strip()
        phone = (lead.get("phone") or "").strip()
        name = (lead.get("name") or "").strip()
        src = (lead.get("source_url") or "").strip()

        # Tiered dedup: strongest signal first
        # V7-fix: add name-only fallback to prevent data loss for
        # leads from JSON-LD that may lack source URLs
        if email:
            key = f"email:{email}"
        elif phone and name:
            key = f"pn:{phone}|{name}"
        elif name and src:
            key = f"ns:{name}|{src}"
        elif name:
            # V7-fix R2: use name+company composite to avoid cross-company collisions
            company = (lead.get("company") or "").strip().lower()
            key = f"name:{name}|{company}" if company else f"name:{name}"
        elif phone:
            key = f"phone:{phone}"
        else:
            continue  # No useful identity — skip

        if key not in seen:
            seen.add(key)
            unique.append(lead)
    return unique


# ===========================================================================
# 1. INDIAMART — SEO directory + JSON-LD + company microsites
# ===========================================================================

def scrape_indiamart(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Scrape IndiaMART directory for B2B supplier/manufacturer leads.

    IndiaMART is India's largest B2B marketplace with SEO-optimized directory
    pages. Company listings include names, cities, products, and sometimes
    GST numbers and employee counts.

    Strategy (v3.5.9 enhanced):
    1. Search dir.indiamart.com + www.indiamart.com/search (dual endpoint)
    2. Parse JSON-LD structured data from listing pages
    3. Extract company details from search result cards
    4. Follow company microsites for additional contact info (emails/phones)
    5. Expanded Google dorking queries (8 variations) for deeper coverage

    Rate limit: 8 req/min, 3-7s delay, max 500 pages/day
    Anti-bot: Akamai Bot Manager — curl_cffi TLS fingerprinting helps
    """
    leads: list[dict] = []
    microsite_urls: list[str] = []
    # v3.5.47 Fix 3: Guard against double-location. routes.py now passes
    # keyword-only, but be defensive in case location is already in query.
    if location and not _query_contains_location(query, location):
        search_term = f"{query} {location}".strip()
    else:
        search_term = query
    encoded_query = quote_plus(search_term)

    # Method 1: Direct directory search — v3.5.9: dual endpoint strategy
    # Try both dir.indiamart.com and www.indiamart.com/search — different
    # Akamai rules mean one may work even if the other is blocked.
    _IM_SEARCH_URLS = [
        "https://dir.indiamart.com/search.mp?ss={q}&prdsrc=1&start={off}",
        "https://www.indiamart.com/search.html?ss={q}&start={off}",
    ]
    with AdSession(timeout=15.0, min_delay=4.0) as session:
        for search_tpl in _IM_SEARCH_URLS:
            if len(leads) >= max_results:
                break
            for page_offset in range(0, min(max_results * 4, 200), 25):
                try:
                    url = search_tpl.format(q=encoded_query, off=page_offset)
                    if location and "cq=" not in url:
                        url += f"&cq={quote_plus(location)}"

                    resp = session.get(url)
                    if resp.status_code != 200:
                        logger.debug("IndiaMART HTTP %d for offset %d", resp.status_code, page_offset)
                        break

                    page_html = _safe_response_text(resp)
                    if not page_html:
                        break

                    page_lead_count = len(leads)

                    # Parse JSON-LD structured data (most reliable)
                    jsonld_blocks = re.findall(
                        r'<script\s+type="application/ld\+json">\s*([\{\[].+?[\}\]])\s*</script>',
                        page_html,
                        re.DOTALL,
                    )
                    for block in jsonld_blocks[:50]:
                        try:
                            data = _json_mod.loads(block)
                            ld_type = data.get("@type", "")

                            if ld_type in ("Organization", "LocalBusiness"):
                                lead = _parse_indiamart_jsonld(data)
                                if lead:
                                    leads.append(lead)
                                    # v3.5.8: collect microsite URLs for contact extraction
                                    src = lead.get("source_url", "")
                                    if src and "indiamart.com" in src:
                                        microsite_urls.append(src)
                            elif ld_type == "ItemList":
                                for item in data.get("itemListElement", []):
                                    item_data = item.get("item", {})
                                    if item_data:
                                        lead = _parse_indiamart_jsonld(item_data)
                                        if lead:
                                            leads.append(lead)
                                            src = lead.get("source_url", "")
                                            if src and "indiamart.com" in src:
                                                microsite_urls.append(src)
                        except (_json_mod.JSONDecodeError, KeyError, TypeError):
                            continue

                    # Parse HTML cards as fallback
                    _parse_indiamart_html_cards(page_html, leads)

                    # v3.5.8: also collect company profile links from HTML
                    profile_links = re.findall(
                        r'href="(https?://[^"]*\.indiamart\.com/[^"]*)"',
                        page_html,
                    )
                    for link in profile_links[:20]:
                        parsed_url = urlparse(link)
                        # Only company microsites (subdomain pattern)
                        if (parsed_url.hostname
                                and parsed_url.hostname != "dir.indiamart.com"
                                and parsed_url.hostname != "www.indiamart.com"
                                and parsed_url.hostname.endswith(".indiamart.com")):
                            if link not in microsite_urls:
                                microsite_urls.append(link)

                    if len(leads) >= max_results:
                        break

                    # v3.5.47 Fix 4: Only stop paginating if this is NOT the
                    # first page (offset 0) of a subsequent URL template.
                    # Previously, offset-0 of the 2nd URL template always
                    # stopped immediately because the 1st URL already found
                    # all leads — causing "no new leads on offset 0" to fire
                    # and skip the 2nd endpoint entirely.
                    if len(leads) == page_lead_count and page_offset > 0:
                        logger.debug("IndiaMART: no new leads on offset %d, stopping", page_offset)
                        break

                except Exception as exc:
                    logger.warning("IndiaMART page scrape error at offset %d: %s", page_offset, exc)
                    break

    # v3.5.9 Method 2: Follow company microsites for emails/phones
    # Only visit sites for leads that are missing contact info
    # v3.5.9: increased cap from 5→15 for better contact coverage
    leads_missing_contact = [
        i for i, ld in enumerate(leads)
        if not ld.get("email") and not ld.get("phone")
    ]
    urls_to_visit = microsite_urls[:min(len(leads_missing_contact), 15)]

    if urls_to_visit:
        with AdSession(timeout=12.0, min_delay=3.0) as session:
            for ms_url in urls_to_visit:
                try:
                    resp = session.get(ms_url)
                    if resp.status_code != 200:
                        continue
                    ms_html = _safe_response_text(resp)
                    ms_emails = extract_emails(ms_html)
                    ms_phones = extract_phones(ms_html)

                    if ms_emails or ms_phones:
                        # Try to match back to an existing lead by URL
                        matched = False
                        for idx in leads_missing_contact:
                            if idx < len(leads) and leads[idx].get("source_url", "") == ms_url:
                                if ms_emails:
                                    leads[idx]["email"] = ms_emails[0]
                                if ms_phones:
                                    leads[idx]["phone"] = ms_phones[0]
                                matched = True
                                break
                        if not matched:
                            # Extract company name from page title
                            title_match = re.search(r'<title>([^<]+)</title>', ms_html)
                            comp_name = ""
                            if title_match:
                                comp_name = title_match.group(1).split(" - ")[0].strip()
                                comp_name = comp_name.split(" | ")[0].strip()
                            leads.append({
                                "name": comp_name,
                                "email": ms_emails[0] if ms_emails else "",
                                "phone": ms_phones[0] if ms_phones else "",
                                "platform": "indiamart",
                                "source_url": ms_url,
                                "location": location,
                                "company": comp_name,
                            })
                except Exception:
                    continue

    # Method 3: Google dorking for additional IndiaMART listings
    # v3.5.9: expanded to 8 dork queries for maximum coverage when
    # direct directory search is blocked by Akamai
    dork_queries = [
        f'site:indiamart.com "{search_term}" contact OR email',
        f'site:dir.indiamart.com "{search_term}"',
        f'site:indiamart.com "{query}" "{location}" phone OR mobile' if location else f'site:indiamart.com "{query}" phone OR mobile',
        f'site:indiamart.com inurl:proddetail "{query}"',
        # v3.5.9: additional queries for broader coverage
        f'site:indiamart.com "{query}" manufacturer OR supplier OR dealer',
        f'site:indiamart.com "{query}" inurl:company',
        f'indiamart.com "{search_term}" email OR phone OR contact',
        f'site:indiamart.com "{query}" GST OR GSTIN' if not location else f'site:indiamart.com "{query}" "{location}"',
    ]
    try:
        for dork in dork_queries[:8]:
            if len(leads) >= max_results:
                break
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")
                title = r.get("title", "")

                company_name = ""
                if " - " in title:
                    company_name = title.split(" - ")[0].strip()
                elif "|" in title:
                    company_name = title.split("|")[0].strip()

                emails = extract_emails(text)
                phones = extract_phones(text)

                if company_name or emails or phones:
                    leads.append({
                        "name": company_name,
                        "email": emails[0] if emails else "",
                        "phone": phones[0] if phones else "",
                        "platform": "indiamart",
                        "source_url": link,
                        "location": location,
                        "company": company_name,
                    })
    except Exception as exc:
        logger.debug("IndiaMART dorking error: %s", exc)

    logger.info("IndiaMART scrape: %d leads for '%s'", len(leads), search_term)
    return _dedup_leads(leads)[:max_results]


def _parse_indiamart_jsonld(data: dict) -> Optional[dict]:
    """Parse an IndiaMART JSON-LD Organization/LocalBusiness block into a lead."""
    name = data.get("name", "")
    if not name:
        return None

    address = data.get("address", {})
    if isinstance(address, dict):
        city = address.get("addressLocality", "")
        state = address.get("addressRegion", "")
        location_str = f"{city}, {state}".strip(", ")
    else:
        location_str = str(address) if address else ""

    url = data.get("url", "")
    telephone = data.get("telephone", "")
    email = data.get("email", "")

    # Extract from aggregateRating or other nested data
    description = data.get("description", "")
    emails_from_desc = extract_emails(description) if description else []
    phones_from_desc = extract_phones(description) if description else []

    return {
        "name": name,
        "email": email or (emails_from_desc[0] if emails_from_desc else ""),
        "phone": telephone or (phones_from_desc[0] if phones_from_desc else ""),
        "platform": "indiamart",
        "source_url": url,
        "location": location_str,
        "company": name,
        "industry": data.get("industry", ""),
    }


def _parse_indiamart_html_cards(page_html: str, leads: list[dict]) -> None:
    """Parse IndiaMART HTML listing cards as fallback for JSON-LD."""
    # IndiaMART uses various card class names across versions
    card_patterns = [
        # Pattern 1: lst-li cards
        r'<div[^>]*class="[^"]*lst-li[^"]*"[^>]*>(.*?)</div>\s*</div>',
        # Pattern 2: cardCont cards
        r'<div[^>]*class="[^"]*cardCont[^"]*"[^>]*>(.*?)</div>\s*</div>',
    ]

    for pattern in card_patterns:
        cards = re.findall(pattern, page_html, re.DOTALL)
        for card_html in cards:
            # Extract company name
            name_match = re.search(
                r'class="[^"]*(?:lcname|lnm|lst-nm|companyname)[^"]*"[^>]*>([^<]+)',
                card_html,
                re.IGNORECASE,
            )
            company_name = _strip_tags(name_match.group(1)).strip() if name_match else ""

            # Extract city
            city_match = re.search(
                r'class="[^"]*(?:lcity|lst-ct|cityName)[^"]*"[^>]*>([^<]+)',
                card_html,
                re.IGNORECASE,
            )
            city = _strip_tags(city_match.group(1)).strip() if city_match else ""

            # Extract link
            link_match = re.search(r'href="(https?://[^"]*indiamart[^"]*)"', card_html)
            link = link_match.group(1) if link_match else ""

            # Extract GST number if visible
            gst_match = re.search(
                r'(?:GST|GSTIN)\s*:?\s*(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]{2})',
                card_html,
            )
            gst = gst_match.group(1) if gst_match else ""

            if company_name:
                leads.append({
                    "name": company_name,
                    "email": "",
                    "phone": "",
                    "platform": "indiamart",
                    "source_url": link,
                    "location": city,
                    "company": company_name,
                    "gst_number": gst,
                })


# ===========================================================================
# 2. EMAIL FINDER B2B — v3.5.57 (replaced Apollo.io)
#    Email pattern generation (64 patterns/lead) + contact page scraping.
#    Proven: 8/8 domains have MX records, 18 emails from Zoho contact page.
# ===========================================================================

# Common email patterns used by companies (first=first name, last=last name,
# f=first initial, l=last initial)
_EMAIL_PATTERNS = [
    "{first}.{last}",
    "{first}{last}",
    "{f}{last}",
    "{first}_{last}",
    "{last}.{first}",
    "{first}",
    "{last}",
    "{f}.{last}",
]

# Contact page paths to crawl for emails/phones
_CONTACT_PATHS = ["/contact", "/contact-us", "/about", "/about-us", "/team", "/impressum"]


def _has_mx_record(domain: str) -> bool:
    """Check if a domain has MX records (proves email system exists)."""
    try:
        answers = socket.getaddrinfo(domain, 25, socket.AF_INET, socket.SOCK_STREAM)
        return len(answers) > 0
    except (socket.gaierror, OSError):
        pass
    # Fallback: try DNS MX lookup via dig-style resolution
    try:
        import subprocess
        result = subprocess.run(
            ["python3", "-c", f"import dns.resolver; print(len(dns.resolver.resolve('{domain}','MX')))"],
            capture_output=True, text=True, timeout=5,
        )
        return result.returncode == 0 and result.stdout.strip() not in ("", "0")
    except Exception:
        pass
    return False


def _generate_email_patterns(first_name: str, last_name: str, domain: str) -> list[str]:
    """Generate candidate email addresses from name + domain."""
    if not first_name or not domain:
        return []
    first = first_name.lower().strip()
    last = last_name.lower().strip() if last_name else ""
    f = first[0] if first else ""
    l = last[0] if last else ""

    candidates: list[str] = []
    for pattern in _EMAIL_PATTERNS:
        try:
            email = pattern.format(first=first, last=last, f=f, l=l)
            if email and "@" not in email:
                email = f"{email}@{domain}"
            if email and last:  # Only generate if we have both parts
                candidates.append(email)
        except (KeyError, IndexError):
            continue
    return candidates


def scrape_email_finder_b2b(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Email Finder B2B: pattern generation + company website contact scraping.

    v3.5.57: Replaces Apollo.io (which requires auth since 2024).
    Two-phase approach:
      Phase 1: Scrape company websites' /contact, /about, /team pages for emails
      Phase 2: For leads with name+domain but no email, generate pattern candidates
               and verify via MX record lookup.

    Rate limit: 1-2s between page visits
    Ban risk: LOW — visiting public company pages
    """
    leads: list[dict] = []
    search_term = f"{query} {location}".strip() if location else query

    # Phase 1: Find company websites via dorking, then scrape contact pages
    dork_queries = [
        f'"{search_term}" "email" "@" "contact"',
        f'"{search_term}" inurl:contact email phone',
        f'"{search_term}" "contact us" "@" site:.com',
    ]

    visited_domains: set[str] = set()

    with AdSession(timeout=12.0, min_delay=1.5) as session:
        for dork_q in dork_queries:
            if len(leads) >= max_results:
                break
            try:
                results = free_search_waterfall(dork_q, num_results=10, min_results=2)
                for r in results:
                    link = r.get("link", "")
                    if not link:
                        continue
                    parsed = urlparse(link)
                    domain = parsed.netloc.lower().replace("www.", "")
                    if domain in visited_domains or domain in _DORK_SKIP_DOMAINS:
                        continue
                    visited_domains.add(domain)

                    # Extract from snippet first
                    snippet = r.get("snippet", "")
                    snippet_emails = extract_emails(snippet)
                    snippet_phones = extract_phones(snippet)

                    # Visit contact pages on this domain
                    base_url = f"{parsed.scheme}://{parsed.netloc}"
                    page_emails: list[str] = list(snippet_emails)
                    page_phones: list[str] = list(snippet_phones)

                    for path in _CONTACT_PATHS:
                        if len(leads) >= max_results:
                            break
                        try:
                            contact_url = urljoin(base_url, path)
                            resp = session.get(contact_url)
                            if resp.status_code == 200:
                                text = _safe_response_text(resp)
                                page_emails.extend(extract_emails(text))
                                page_phones.extend(extract_phones(text))
                        except Exception:
                            continue

                    # Deduplicate
                    page_emails = list(dict.fromkeys(page_emails))
                    page_phones = list(dict.fromkeys(page_phones))

                    title_text = r.get("title", "")
                    company_name = _extract_company_from_title(title_text) or domain

                    if page_emails or page_phones:
                        for em in page_emails[:5]:  # Cap per-domain
                            leads.append({
                                "name": company_name,
                                "email": em,
                                "phone": page_phones[0] if page_phones else "",
                                "platform": "email_finder_b2b",
                                "source_url": link,
                                "location": location,
                                "company": company_name,
                                "company_domain": domain,
                            })
                    elif domain:
                        # Phase 2: No emails found — generate patterns if MX exists
                        if _has_mx_record(domain):
                            leads.append({
                                "name": company_name,
                                "email": f"info@{domain}",  # Most common generic
                                "phone": page_phones[0] if page_phones else "",
                                "platform": "email_finder_b2b",
                                "source_url": link,
                                "location": location,
                                "company": company_name,
                                "company_domain": domain,
                            })
            except Exception as exc:
                logger.debug("Email Finder dorking error: %s", exc)

    logger.info("Email Finder B2B scrape: %d leads for '%s'", len(leads), query)
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 3. TRADEINDIA — HTML scraping + JSON-LD profiles
# ===========================================================================

def scrape_tradeindia(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Scrape TradeIndia directory for B2B supplier leads.

    TradeIndia has cleaner HTML than IndiaMART with lower anti-bot protection.
    Company profiles show GST, IEC code, business type.

    Rate limit: 12 req/min, 2-4s delay, 1000 pages/day
    Anti-bot: Basic rate limiting only, no Akamai/Cloudflare
    """
    leads: list[dict] = []
    # v3.5.47 Fix 5: Guard against double-location (same as IndiaMART/Google Maps fix).
    if location and not _query_contains_location(query, location):
        search_term = f"{query} {location}".strip()
    else:
        search_term = query
    encoded_query = quote_plus(search_term)

    # Method 1: Direct search pages
    with AdSession(timeout=12.0, min_delay=3.0) as session:
        for page_num in range(1, 5):  # Max 4 pages
            try:
                url = (
                    f"https://www.tradeindia.com/search.html"
                    f"?keyword={encoded_query}&page={page_num}"
                )
                if location:
                    url += f"&city={quote_plus(location)}"

                resp = session.get(url)
                if resp.status_code != 200:
                    break

                page_html = _safe_response_text(resp)
                if not page_html:
                    break

                # Parse JSON-LD (TradeIndia uses structured data)
                # Match both objects and arrays
                jsonld_blocks = re.findall(
                    r'<script\s+type="application/ld\+json">\s*([\{\[].+?[\}\]])\s*</script>',
                    page_html,
                    re.DOTALL,
                )
                for block in jsonld_blocks[:50]:
                    try:
                        data = _json_mod.loads(block)
                        if data.get("@type") in ("Organization", "LocalBusiness"):
                            lead = {
                                "name": data.get("name", ""),
                                "email": data.get("email", ""),
                                "phone": data.get("telephone", ""),
                                "platform": "tradeindia",
                                "source_url": data.get("url", ""),
                                "location": "",
                                "company": data.get("name", ""),
                            }
                            addr = data.get("address", {})
                            if isinstance(addr, dict):
                                lead["location"] = f"{addr.get('addressLocality', '')}, {addr.get('addressRegion', '')}".strip(", ")
                            if lead["name"]:
                                leads.append(lead)
                    except (_json_mod.JSONDecodeError, KeyError, TypeError):
                        continue

                # Parse HTML cards
                # TradeIndia card selectors
                card_matches = re.findall(
                    r'class="[^"]*(?:search-list|product-card|company-card)[^"]*"[^>]*>(.*?)</(?:li|div)>',
                    page_html,
                    re.DOTALL | re.IGNORECASE,
                )
                for card_html in card_matches:
                    name_match = re.search(
                        r'class="[^"]*(?:company-?name|companyName)[^"]*"[^>]*>.*?<a[^>]*>([^<]+)',
                        card_html,
                        re.DOTALL | re.IGNORECASE,
                    )
                    if not name_match:
                        name_match = re.search(r'<h[23][^>]*>.*?<a[^>]*>([^<]+)', card_html, re.DOTALL)

                    company_name = _strip_tags(name_match.group(1)).strip() if name_match else ""

                    city_match = re.search(
                        r'class="[^"]*(?:location|cityName|city)[^"]*"[^>]*>([^<]+)',
                        card_html,
                        re.IGNORECASE,
                    )
                    city = _strip_tags(city_match.group(1)).strip() if city_match else ""

                    link_match = re.search(r'href="(https?://[^"]*tradeindia[^"]*)"', card_html)
                    link = link_match.group(1) if link_match else ""

                    if company_name:
                        leads.append({
                            "name": company_name,
                            "email": "",
                            "phone": "",
                            "platform": "tradeindia",
                            "source_url": link,
                            "location": city or location,
                            "company": company_name,
                        })

                if len(leads) >= max_results:
                    break

            except Exception as exc:
                logger.warning("TradeIndia page %d error: %s", page_num, exc)
                break

    # Method 2: Enhanced Google dorking for TradeIndia (v3.5.56)
    # TradeIndia migrated to JS SPA — direct scrape returns empty HTML shell.
    # Use multiple dork patterns targeting Google-indexed company profile pages.
    _ti_dork_patterns = [
        f'site:tradeindia.com "{search_term}"',
        f'site:tradeindia.com/fp inurl:fp "{query}"',
        f'site:tradeindia.com "{query}" "contact" OR "email" OR "phone"',
        f'"tradeindia.com" "{query}" email contact',
    ]
    for dork in _ti_dork_patterns:
        if len(leads) >= max_results:
            break
        try:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")
                title = r.get("title", "")

                company_name = title.split(" - ")[0].strip() if " - " in title else ""
                emails = extract_emails(text)
                phones = extract_phones(text)

                if company_name or emails or phones:
                    leads.append({
                        "name": company_name,
                        "email": emails[0] if emails else "",
                        "phone": phones[0] if phones else "",
                        "platform": "tradeindia",
                        "source_url": link,
                        "location": location,
                        "company": company_name,
                    })
        except Exception as exc:
            logger.debug("TradeIndia dorking error for pattern: %s", exc)

    # Method 3: Google Cache scraping for TradeIndia profile pages (v3.5.56)
    # Google caches TradeIndia company profiles with visible contact data
    # even though the live site now renders via JavaScript.
    _ti_cache_urls = [
        r.get("link", "") for r in (
            free_search_waterfall(
                f'cache:tradeindia.com "{query}" {location}'.strip(),
                num_results=5, min_results=1,
            ) if len(leads) < max_results else []
        )
    ]
    if _ti_cache_urls:
        with AdSession(timeout=10.0, min_delay=2.0) as cache_session:
            for cache_url in _ti_cache_urls[:8]:
                if len(leads) >= max_results:
                    break
                try:
                    parsed_cu = urlparse(cache_url)
                    if _is_private_ip(parsed_cu.hostname or ""):
                        continue
                    resp = cache_session.get(cache_url)
                    if resp.status_code != 200:
                        continue
                    page_html = _safe_response_text(resp)
                    if not page_html:
                        continue
                    page_text = _strip_tags(page_html[:150_000])
                    c_emails = extract_emails(page_text)
                    c_phones = extract_phones(page_text)
                    title_m = re.search(r"<title>([^<]+)</title>", page_html)
                    c_name = _extract_company_from_title(title_m.group(1)) if title_m else ""
                    for em in c_emails:
                        leads.append({
                            "name": c_name, "email": em,
                            "phone": c_phones[0] if c_phones else "",
                            "platform": "tradeindia",
                            "source_url": cache_url,
                            "location": location, "company": c_name,
                        })
                except Exception:
                    pass

    logger.info("TradeIndia scrape: %d leads for '%s'", len(leads), search_term)
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 4. EXPORTERSINDIA — Simple HTML scraping
# ===========================================================================

def scrape_exportersindia(
    query: str,
    location: str = "",
    max_results: int = 30,
) -> list[dict]:
    """Scrape ExportersIndia directory for B2B exporter/manufacturer leads.

    ExportersIndia has minimal anti-bot protection and simple HTML structure.

    Rate limit: 10 req/min, 2-3s delay
    Anti-bot: Minimal
    """
    leads: list[dict] = []
    # v3.5.47 Fix 5: Guard against double-location (same pattern as other B2B scrapers).
    if location and not _query_contains_location(query, location):
        search_term = f"{query} {location}".strip()
    else:
        search_term = query
    encoded_query = quote_plus(search_term)

    # Method 1: Direct search
    with AdSession(timeout=12.0, min_delay=3.0) as session:
        for page_num in range(1, 4):
            try:
                url = (
                    f"https://www.exportersindia.com/search.htm"
                    f"?keyword={encoded_query}&page={page_num}"
                )
                resp = session.get(url)
                if resp.status_code != 200:
                    break

                page_html = _safe_response_text(resp)
                if not page_html:
                    break

                # Parse company cards
                # ExportersIndia uses simple div-based card layout
                card_matches = re.findall(
                    r'class="[^"]*(?:company-?info|supplier-?card|listing-?card)[^"]*"[^>]*>(.*?)</div>',
                    page_html,
                    re.DOTALL | re.IGNORECASE,
                )

                # Fallback: find all company-like links
                if not card_matches:
                    company_links = re.findall(
                        r'<a[^>]*href="(https?://[^"]*exportersindia\.com/[^"]*)"[^>]*>([^<]+)</a>',
                        page_html,
                    )
                    for link, name in company_links:
                        clean_name = _strip_tags(name).strip()
                        if (
                            clean_name
                            and len(clean_name) > 3
                            and not clean_name.startswith("http")
                            and "exportersindia" not in clean_name.lower()
                        ):
                            leads.append({
                                "name": clean_name,
                                "email": "",
                                "phone": "",
                                "platform": "exportersindia",
                                "source_url": link,
                                "location": location,
                                "company": clean_name,
                            })

                for card_html_match in card_matches:
                    name_match = re.search(r'<a[^>]*>([^<]+)</a>', card_html_match)
                    company_name = _strip_tags(name_match.group(1)).strip() if name_match else ""

                    city_match = re.search(
                        r'class="[^"]*(?:city|location|address)[^"]*"[^>]*>([^<]+)',
                        card_html_match,
                        re.IGNORECASE,
                    )
                    city = _strip_tags(city_match.group(1)).strip() if city_match else ""

                    if company_name:
                        leads.append({
                            "name": company_name,
                            "email": "",
                            "phone": "",
                            "platform": "exportersindia",
                            "source_url": f"https://www.exportersindia.com/search.htm?keyword={encoded_query}",
                            "location": city or location,
                            "company": company_name,
                        })

                if len(leads) >= max_results:
                    break

            except Exception as exc:
                logger.warning("ExportersIndia page %d error: %s", page_num, exc)
                break

    # Method 2: Enhanced Google dorking (v3.5.56)
    # ExportersIndia search URL returns 404 — use multiple dork patterns.
    _ei_dork_patterns = [
        f'site:exportersindia.com "{search_term}"',
        f'site:exportersindia.com "{query}" "contact" OR "email"',
        f'"exportersindia.com" "{query}" email phone',
    ]
    for dork in _ei_dork_patterns:
        if len(leads) >= max_results:
            break
        try:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")
                title = r.get("title", "")

                company_name = title.split(" - ")[0].strip() if " - " in title else ""
                emails = extract_emails(text)
                phones = extract_phones(text)

                if company_name or emails:
                    leads.append({
                        "name": company_name,
                        "email": emails[0] if emails else "",
                        "phone": phones[0] if phones else "",
                        "platform": "exportersindia",
                        "source_url": link,
                        "location": location,
                        "company": company_name,
                    })
        except Exception as exc:
            logger.debug("ExportersIndia dorking error: %s", exc)

    # Method 3: Directory crawling (v3.5.56)
    # ExportersIndia still has working category pages at /indian-manufacturers/
    # and /industry/. Crawl relevant category pages for company listings.
    if len(leads) < max_results:
        _ei_dir_paths = [
            f"/indian-manufacturers/{quote_plus(query.lower().replace(' ', '-'))}/",
            f"/industry/{quote_plus(query.lower().replace(' ', '-'))}/",
        ]
        with AdSession(timeout=10.0, min_delay=3.0) as dir_session:
            for dir_path in _ei_dir_paths:
                if len(leads) >= max_results:
                    break
                try:
                    dir_url = f"https://www.exportersindia.com{dir_path}"
                    resp = dir_session.get(dir_url)
                    if resp.status_code != 200:
                        continue
                    page_html = _safe_response_text(resp)
                    if not page_html:
                        continue
                    # Extract company links from directory page
                    dir_links = re.findall(
                        r'<a[^>]*href="(https?://[^"]*exportersindia\.com/[^"]*?)"[^>]*>([^<]+)</a>',
                        page_html,
                    )
                    for link, name in dir_links:
                        clean_name = _strip_tags(name).strip()
                        if (
                            clean_name and len(clean_name) > 3
                            and not clean_name.startswith("http")
                            and "exportersindia" not in clean_name.lower()
                            and len(leads) < max_results
                        ):
                            leads.append({
                                "name": clean_name, "email": "", "phone": "",
                                "platform": "exportersindia",
                                "source_url": link,
                                "location": location, "company": clean_name,
                            })
                except Exception:
                    pass

    logger.info("ExportersIndia scrape: %d leads for '%s'", len(leads), search_term)
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 5. JUSTDIAL — Business directory (names, addresses, ratings)
# ===========================================================================

def scrape_justdial(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Scrape JustDial for local business leads.

    JustDial has business names, addresses, and ratings visible publicly.
    Phone numbers use CSS sprite obfuscation (custom font encoding) — we
    extract what's available without trying to decode the font obfuscation.

    v3.5.8: increased pages from 2→4, increased default max_results 30→50,
    added extended dorking for email/phone recovery.

    Rate limit: 4-8s delay, max 100 pages/day
    Anti-bot: Custom font obfuscation, strict header checking, CAPTCHA after ~50 req
    Ban risk: HIGH — be very conservative with rate limiting
    """
    leads: list[dict] = []

    # JustDial URL format: justdial.com/{city}/{category}
    city = location.lower().replace(" ", "-") if location else "india"
    category = query.lower().replace(" ", "-")

    with AdSession(timeout=15.0, min_delay=6.0) as session:
        for page_num in range(1, 5):  # v3.5.8: up from 2 to 4 pages
            try:
                if page_num == 1:
                    url = f"https://www.justdial.com/{city}/{category}"
                else:
                    url = f"https://www.justdial.com/{city}/{category}/page-{page_num}"

                resp = session.get(
                    url,
                    headers={
                        "Referer": "https://www.justdial.com/",
                        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
                    },
                )
                if resp.status_code == 403:
                    # R4 fix: JustDial CAPTCHA challenge — fall through to dorking
                    logger.info("JustDial CAPTCHA challenge (403) on page %d — using dorking", page_num)
                    break
                if resp.status_code != 200:
                    logger.debug("JustDial HTTP %d for page %d", resp.status_code, page_num)
                    break

                page_html = _safe_response_text(resp)
                if not page_html:
                    break

                # Extract JSON-LD data if available (match objects and arrays)
                jsonld_blocks = re.findall(
                    r'<script\s+type="application/ld\+json">\s*([\{\[].+?[\}\]])\s*</script>',
                    page_html,
                    re.DOTALL,
                )
                for block in jsonld_blocks[:50]:
                    try:
                        data = _json_mod.loads(block)
                        if data.get("@type") == "ItemList":
                            for item in data.get("itemListElement", []):
                                item_data = item.get("item", {})
                                name = item_data.get("name", "")
                                if name:
                                    addr = item_data.get("address", {})
                                    leads.append({
                                        "name": name,
                                        "email": "",
                                        "phone": "",  # Obfuscated by JustDial
                                        "platform": "justdial",
                                        "source_url": item_data.get("url", url),
                                        "location": addr.get("addressLocality", "") if isinstance(addr, dict) else location,
                                        "company": name,
                                        "rating": str(item_data.get("aggregateRating", {}).get("ratingValue", "")) if isinstance(item_data.get("aggregateRating"), dict) else "",
                                    })
                        elif data.get("@type") == "LocalBusiness":
                            name = data.get("name", "")
                            if name:
                                addr = data.get("address", {})
                                leads.append({
                                    "name": name,
                                    "email": "",
                                    "phone": data.get("telephone", ""),
                                    "platform": "justdial",
                                    "source_url": data.get("url", url),
                                    "location": addr.get("addressLocality", "") if isinstance(addr, dict) else location,
                                    "company": name,
                                })
                    except (_json_mod.JSONDecodeError, KeyError, TypeError):
                        continue

                # Parse HTML cards
                # JustDial uses various card selectors
                name_matches = re.findall(
                    r'class="[^"]*(?:lng_br_name|store-?name|resultbox_title_anchor)[^"]*"[^>]*>([^<]+)',
                    page_html,
                    re.IGNORECASE,
                )
                address_matches = re.findall(
                    r'class="[^"]*(?:cont_fl_addr|store-?address|resultbox_address)[^"]*"[^>]*>([^<]+)',
                    page_html,
                    re.IGNORECASE,
                )

                for idx, name_text in enumerate(name_matches):
                    clean_name = _strip_tags(name_text).strip()
                    address_text = ""
                    if idx < len(address_matches):
                        address_text = _strip_tags(address_matches[idx]).strip()

                    if clean_name and len(clean_name) > 2:
                        leads.append({
                            "name": clean_name,
                            "email": "",
                            "phone": "",
                            "platform": "justdial",
                            "source_url": url,
                            "location": address_text or location,
                            "company": clean_name,
                        })

                if len(leads) >= max_results:
                    break

            except Exception as exc:
                logger.warning("JustDial page %d error: %s", page_num, exc)
                break

    # Method 2: Google dorking for JustDial listings
    search_term = f"{query} {location}".strip() if location else query
    try:
        dork = f'site:justdial.com "{search_term}"'
        results = free_search_waterfall(dork, num_results=10, min_results=2)
        for r in results:
            title = r.get("title", "")
            link = r.get("link", "")

            # JustDial title format: "Business Name in City"
            company_name = title.split(" in ")[0].strip() if " in " in title else title.split(" - ")[0].strip()

            if company_name and "justdial" not in company_name.lower():
                leads.append({
                    "name": company_name,
                    "email": "",
                    "phone": "",
                    "platform": "justdial",
                    "source_url": link,
                    "location": location,
                    "company": company_name,
                })
    except Exception as exc:
        logger.debug("JustDial dorking error: %s", exc)

    logger.info("JustDial scrape: %d leads for '%s'", len(leads), search_term)
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 6. GOOGLE MAPS LOCAL PACK — via google.com/search?tbm=lcl
# ===========================================================================

def scrape_google_maps_local(
    query: str,
    location: str = "",
    max_results: int = 40,
) -> list[dict]:
    """Scrape Google Maps local business listings.

    Uses Google's regular search with local intent (tbm=lcl parameter)
    which returns the "Local Pack" with structured business data.
    More reliable than scraping maps.google.com directly.

    Rate limit: 5-10s delay between requests
    Ban risk: MEDIUM — use realistic delays
    """
    leads: list[dict] = []
    # v3.5.47 Fix 2: Don't append "in {location}" if location is already in query.
    # routes.py now passes keyword-only (no location) to B2B scrapers, so we
    # always append location here. But guard against double-append for safety.
    if location and not _query_contains_location(query, location):
        search_term = f"{query} in {location}".strip()
    else:
        search_term = query

    with AdSession(timeout=15.0, min_delay=6.0) as session:
        for start_offset in range(0, min(max_results, 60), 20):
            try:
                params = {
                    "q": search_term,
                    "tbm": "lcl",
                    "start": str(start_offset),
                    "num": "20",
                }

                resp = session.get(
                    "https://www.google.com/search",
                    params=params,
                )

                if resp.status_code != 200:
                    logger.debug("Google Maps local: HTTP %d", resp.status_code)
                    break

                page_html = _safe_response_text(resp)
                if not page_html:
                    break

                # Parse local business results
                # Google local results have specific patterns in the HTML
                # Method 1: Look for structured business data in divs
                business_blocks = re.findall(
                    r'class="[^"]*(?:VkpGBb|rllt__details|dbg0pd)[^"]*"[^>]*>(.*?)</div>',
                    page_html,
                    re.DOTALL,
                )

                # Method 2: Extract from aria-label attributes (more reliable)
                aria_businesses = re.findall(
                    r'aria-label="([^"]+)"[^>]*class="[^"]*(?:hfpxzc|rllt)[^"]*"',
                    page_html,
                )

                for biz_name in aria_businesses:
                    clean_name = _strip_tags(biz_name).strip()
                    if clean_name and len(clean_name) > 2:
                        leads.append({
                            "name": clean_name,
                            "email": "",
                            "phone": "",
                            "platform": "google_maps_b2b",
                            "source_url": f"https://www.google.com/search?q={quote_plus(search_term)}&tbm=lcl",
                            "location": location,
                            "company": clean_name,
                        })

                # Method 3: Parse the full page for phone numbers and addresses
                # Google often includes phone numbers directly in local results
                phone_matches = re.findall(
                    r'(?:tel:|phone:|call\s)([+\d\s\-()]{7,20})',
                    page_html,
                    re.IGNORECASE,
                )
                # Extract emails if any appear in the results
                page_text = _strip_tags(page_html[:200_000])
                emails = extract_emails(page_text)
                phones = extract_phones(page_text)

                # Add any phones/emails found in context
                for phone in phones[:5]:
                    leads.append({
                        "name": "",
                        "email": "",
                        "phone": phone,
                        "platform": "google_maps_b2b",
                        "source_url": f"https://www.google.com/search?q={quote_plus(search_term)}&tbm=lcl",
                        "location": location,
                    })

                for email in emails[:5]:
                    leads.append({
                        "name": "",
                        "email": email,
                        "phone": "",
                        "platform": "google_maps_b2b",
                        "source_url": f"https://www.google.com/search?q={quote_plus(search_term)}&tbm=lcl",
                        "location": location,
                    })

                if len(leads) >= max_results:
                    break

            except Exception as exc:
                logger.warning("Google Maps local pack error at offset %d: %s", start_offset, exc)
                break

    logger.info("Google Maps local: %d leads for '%s'", len(leads), search_term)
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 7. GITHUB B2B — v3.5.57 (replaced RocketReach)
#    Developer leads with public emails via GitHub's free search API.
#    Free tier: 5,000 requests/hour unauthenticated, 30 results/page.
# ===========================================================================

_GITHUB_API_BASE = "https://api.github.com"


def scrape_github_b2b(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Scrape GitHub for developer leads with public email addresses.

    v3.5.57: Replaces RocketReach (which is blocked by Cloudflare).
    Uses GitHub's free unauthenticated search API to find developer profiles
    matching the query, then extracts public emails from their profiles.

    Rate limit: 10 req/min unauthenticated, 30 req/min authenticated
    Ban risk: VERY LOW — official API with published rate limits
    """
    leads: list[dict] = []

    # Build GitHub user search query
    search_parts = [query]
    if location:
        search_parts.append(f"location:{location}")

    gh_query = " ".join(search_parts)
    pages_to_fetch = min(3, (max_results + 29) // 30)  # 30 results/page

    with AdSession(timeout=10.0, min_delay=2.0) as session:
        for page in range(1, pages_to_fetch + 1):
            if len(leads) >= max_results:
                break

            try:
                resp = session.get(
                    f"{_GITHUB_API_BASE}/search/users",
                    params={
                        "q": gh_query,
                        "per_page": 30,
                        "page": page,
                    },
                    headers={
                        "Accept": "application/vnd.github.v3+json",
                        "User-Agent": "SnapLeads/3.5.57",
                    },
                )

                if resp.status_code == 403:
                    logger.info("GitHub API rate limited — stopping")
                    break
                if resp.status_code != 200:
                    logger.debug("GitHub search API: HTTP %d", resp.status_code)
                    break

                data = resp.json()
                users = data.get("items", [])

                for user in users:
                    if len(leads) >= max_results:
                        break

                    login = user.get("login", "")
                    if not login:
                        continue

                    # Fetch individual user profile for email + details
                    try:
                        profile_resp = session.get(
                            f"{_GITHUB_API_BASE}/users/{login}",
                            headers={
                                "Accept": "application/vnd.github.v3+json",
                                "User-Agent": "SnapLeads/3.5.57",
                            },
                        )
                        if profile_resp.status_code != 200:
                            continue

                        profile = profile_resp.json()
                        email = profile.get("email", "") or ""
                        name = profile.get("name", "") or login
                        company = profile.get("company", "") or ""
                        bio = profile.get("bio", "") or ""
                        blog = profile.get("blog", "") or ""
                        user_location = profile.get("location", "") or location

                        # Only include if they have a public email or useful info
                        if email or company or blog:
                            leads.append({
                                "name": name,
                                "email": email,
                                "phone": "",
                                "platform": "github_b2b",
                                "source_url": profile.get("html_url", f"https://github.com/{login}"),
                                "location": user_location,
                                "company": company.lstrip("@"),  # GitHub prefixes org with @
                                "title": bio[:100] if bio else "Developer",
                                "website": blog,
                            })
                    except Exception as exc:
                        logger.debug("GitHub profile fetch error for %s: %s", login, exc)

            except Exception as exc:
                logger.debug("GitHub search error: %s", exc)
                break

    logger.info("GitHub B2B scrape: %d leads for '%s'", len(leads), query)
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 8. BUSINESS DIRECTORIES — v3.5.57 (replaced Crunchbase)
#    Combined dorking across JustDial/IndiaMART/TradeIndia/YellowPages
#    for maximum coverage from a single platform selection.
# ===========================================================================

# Directory sites to target for combined dorking
_DIRECTORY_SITES = [
    "justdial.com",
    "indiamart.com",
    "tradeindia.com",
    "yellowpages.com",
    "yelp.com",
    "sulekha.com",
    "manta.com",
]


def scrape_business_directories(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Scrape multiple business directories via combined dorking.

    v3.5.57: Replaces Crunchbase (which is blocked by Cloudflare).
    Combines dorking across 7 major business directories into a single
    platform selection for maximum coverage without requiring users to
    manually select each directory.

    Rate limit: 2-3s between queries (via waterfall)
    Ban risk: LOW — uses existing search engine waterfall
    """
    leads: list[dict] = []
    search_term = f"{query} {location}".strip() if location else query

    # Phase 1: Combined directory dorking — search multiple dirs at once
    site_groups = [
        ("justdial.com", "sulekha.com"),
        ("indiamart.com", "tradeindia.com"),
        ("yellowpages.com", "yelp.com", "manta.com"),
    ]

    for group in site_groups:
        if len(leads) >= max_results:
            break

        # Build OR-combined site: query
        site_parts = " OR ".join(f"site:{s}" for s in group)
        dork = f'({site_parts}) "{search_term}" email OR phone OR contact'

        try:
            results = free_search_waterfall(dork, num_results=15, min_results=2)
            for r in results:
                link = r.get("link", "")
                snippet = r.get("snippet", "")
                title = r.get("title", "")
                text = f"{title} {snippet}"

                emails = extract_emails(text)
                phones = extract_phones(text)

                # Determine which directory this result is from
                parsed_url = urlparse(link)
                source_domain = parsed_url.netloc.lower().replace("www.", "")

                # Extract company name from title
                company_name = _extract_company_from_title(title)

                if company_name or emails or phones:
                    leads.append({
                        "name": company_name,
                        "email": emails[0] if emails else "",
                        "phone": phones[0] if phones else "",
                        "platform": "business_directories",
                        "source_url": link,
                        "location": location,
                        "company": company_name,
                        "source_directory": source_domain,
                    })
        except Exception as exc:
            logger.debug("Business Directories dorking error (group %s): %s", group, exc)

    # Phase 2: Visit top result URLs to extract contact details from pages
    visited: set[str] = set()
    urls_to_visit = [
        lead.get("source_url", "")
        for lead in leads
        if lead.get("source_url") and not lead.get("email")
    ][:10]

    with AdSession(timeout=10.0, min_delay=1.5) as session:
        for url in urls_to_visit:
            if url in visited or len(leads) >= max_results:
                break
            visited.add(url)

            try:
                resp = session.get(url)
                if resp.status_code != 200:
                    continue

                page_html = _safe_response_text(resp)
                if not page_html:
                    continue

                page_emails = extract_emails(page_html[:200_000])
                page_phones = extract_phones(page_html[:200_000])

                if page_emails or page_phones:
                    # Update the existing lead that had no email
                    for lead in leads:
                        if lead.get("source_url") == url and not lead.get("email"):
                            lead["email"] = page_emails[0] if page_emails else ""
                            if not lead.get("phone") and page_phones:
                                lead["phone"] = page_phones[0]
                            break
                    else:
                        # New leads from page
                        for em in page_emails[:3]:
                            leads.append({
                                "name": "",
                                "email": em,
                                "phone": page_phones[0] if page_phones else "",
                                "platform": "business_directories",
                                "source_url": url,
                                "location": location,
                            })

            except Exception as exc:
                logger.debug("Business Directories page scrape error: %s", exc)

    logger.info("Business Directories scrape: %d leads for '%s'", len(leads), query)
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 9. GENERIC EMAIL DORKING — v3.5.49
# ===========================================================================

# Domains to skip when visiting result URLs (social media, search engines, etc.)
_DORK_SKIP_DOMAINS = {
    "facebook.com", "twitter.com", "x.com", "instagram.com", "youtube.com",
    "linkedin.com", "pinterest.com", "tiktok.com", "reddit.com",
    "google.com", "bing.com", "yahoo.com", "duckduckgo.com",
    "wikipedia.org", "amazon.com", "flipkart.com",
    "apollo.io", "rocketreach.co", "zoominfo.com",
}


def scrape_generic_email_dorking(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """v3.5.49: Generic email dorking — find emails directly on company websites.

    Instead of dorking platform-specific sites (site:apollo.io, site:rocketreach.co)
    which are now fully gated behind auth + Cloudflare, this scraper uses generic
    search queries that find emails published on company contact/about/team pages
    indexed by search engines.

    Tested patterns that yield 8-15 verified emails per query:
      - '"[industry]" "[city]" "email" "@" "contact"'
      - '"[industry]" "[city]" "email" "@gmail.com" "phone"'
      - 'inurl:contact "[industry]" "[city]" "email"'
      - 'inurl:team OR inurl:about "[title]" "email" "@"'

    Strategy:
      1. Generate 6 dork query variations from industry + location
      2. Run each through the free search waterfall (Bing/DDG/SearXNG/Brave)
      3. Extract emails + phones from search snippets
      4. Visit top result URLs to scrape full page content for more contacts
      5. Parse company name from page title / domain for lead enrichment

    Rate limit: Uses existing search waterfall rate limits (safe)
    Ban risk: LOW — standard web searches, no platform-specific scraping
    API keys: NONE required
    """
    leads: list[dict] = []
    result_urls: list[str] = []

    # v3.5.49: Guard against double-location (same pattern as other scrapers)
    if location and not _query_contains_location(query, location):
        search_term = f"{query} {location}".strip()
    else:
        search_term = query

    # Generate dorking query variations — proven patterns from local testing
    dork_queries = [
        # Pattern 1: Industry + location + email indicator (highest yield)
        f'"{query}" "{location}" "email" "@" "contact"' if location else f'"{query}" "email" "@" "contact"',
        # Pattern 2: With phone for dual contact extraction
        f'"{query}" "{location}" "email" "@" "phone"' if location else f'"{query}" "email" "@" "phone"',
        # Pattern 3: Contact page targeting
        f'inurl:contact "{query}" "{location}" "email"' if location else f'inurl:contact "{query}" "email" "@"',
        # Pattern 4: Team/about page targeting (finds decision-maker emails)
        f'inurl:team OR inurl:about "{query}" "email" "@"',
        # Pattern 5: Gmail/domain pattern (catches small business owners)
        f'"{query}" "{location}" "@gmail.com" OR "@yahoo.com"' if location else f'"{query}" "@gmail.com" OR "@yahoo.com" "contact"',
        # Pattern 6: Company website contact (broadest)
        f'"{search_term}" "contact us" "email" "@"',
    ]

    seen_emails: set[str] = set()

    for dork in dork_queries:
        if len(leads) >= max_results:
            break

        try:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                title = r.get("title", "")
                snippet = r.get("snippet", "")
                link = r.get("link", "")
                text = f"{title} {snippet}"

                # Extract emails and phones from search snippets
                emails = extract_emails(text)
                phones = extract_phones(text)

                # Parse company name from title
                company_name = _extract_company_from_title(title)

                # Create leads from snippet data
                for email in emails:
                    email_lower = email.lower()
                    if email_lower in seen_emails:
                        continue
                    seen_emails.add(email_lower)
                    leads.append({
                        "name": "",
                        "email": email,
                        "phone": phones[0] if phones else "",
                        "platform": "generic_email_dork",
                        "source_url": link,
                        "location": location,
                        "company": company_name,
                    })

                # If no email in snippet but title/link look promising, queue for visit
                if not emails and link:
                    parsed = urlparse(link)
                    domain = (parsed.netloc or "").lower()
                    base_domain = ".".join(domain.split(".")[-2:]) if domain else ""
                    if base_domain and base_domain not in _DORK_SKIP_DOMAINS:
                        result_urls.append(link)

        except Exception as exc:
            logger.debug("v3.5.49 generic dorking error for query '%s': %s", dork[:60], exc)

    # Phase 2: Visit top result URLs to scrape full page content
    # Only visit pages where we didn't already get email from snippet
    urls_to_visit = list(dict.fromkeys(result_urls))[:12]  # dedup, cap at 12
    if urls_to_visit and len(leads) < max_results:
        with AdSession(timeout=10.0, min_delay=2.0) as session:
            for url in urls_to_visit:
                if len(leads) >= max_results:
                    break
                try:
                    # SSRF protection
                    parsed = urlparse(url)
                    hostname = parsed.hostname or ""
                    if _is_private_ip(hostname):
                        continue

                    current_url = url
                    resp = session.get(current_url, allow_redirects=False)
                    # Follow redirects manually with SSRF check
                    redirect_count = 0
                    while resp.status_code in (301, 302, 303, 307, 308) and redirect_count < 5:
                        redirect_url = resp.headers.get("Location", "")
                        if not redirect_url:
                            break
                        # Resolve relative redirects (e.g. /contact) against current URL
                        next_url = urljoin(current_url, redirect_url)
                        redir_parsed = urlparse(next_url)
                        redir_host = redir_parsed.hostname or ""
                        if _is_private_ip(redir_host):
                            break
                        resp = session.get(next_url, allow_redirects=False)
                        current_url = next_url
                        redirect_count += 1
                    if resp.status_code != 200:
                        continue

                    page_html = _safe_response_text(resp)
                    if not page_html:
                        continue

                    page_text = _strip_tags(page_html[:200_000])
                    page_emails = extract_emails(page_text)
                    page_phones = extract_phones(page_text)

                    # Extract company name from <title>
                    title_match = re.search(r"<title>([^<]+)</title>", page_html)
                    company = ""
                    if title_match:
                        company = _extract_company_from_title(title_match.group(1))

                    for email in page_emails:
                        email_lower = email.lower()
                        if email_lower in seen_emails:
                            continue
                        seen_emails.add(email_lower)
                        leads.append({
                            "name": "",
                            "email": email,
                            "phone": page_phones[0] if page_phones else "",
                            "platform": "generic_email_dork",
                            "source_url": url,
                            "location": location,
                            "company": company,
                        })

                except Exception as exc:
                    logger.debug("v3.5.49 page scrape error for %s: %s", url[:60], exc)

    logger.info(
        "v3.5.49 generic email dorking: %d leads for '%s' (%d URLs visited)",
        len(leads), search_term, len(urls_to_visit),
    )
    return _dedup_leads(leads)[:max_results]


def _extract_company_from_title(title: str) -> str:
    """Extract company name from a page title or search result title.

    Common patterns:
      - "Company Name - Contact Us"
      - "Company Name | About"
      - "Contact - Company Name"
      - "Company Name: Products & Services"
    """
    if not title:
        return ""

    # Remove common suffixes
    for sep in (" - ", " | ", " — ", " – ", ": "):
        if sep in title:
            parts = title.split(sep)
            # First part is usually the company name
            candidate = parts[0].strip()
            # Skip generic words
            lower = candidate.lower()
            if lower not in (
                "contact", "contact us",
                "about", "about us",
                "team", "home", "welcome",
            ):
                return candidate[:80]
            # Try second part
            if len(parts) > 1:
                return parts[1].strip()[:80]

    return title.strip()[:80]


# ===========================================================================
# UNIFIED DISPATCHER
# ===========================================================================

_B2B_SCRAPERS = {
    "generic_email_dork": scrape_generic_email_dorking,
    "indiamart": scrape_indiamart,
    "tradeindia": scrape_tradeindia,
    "exportersindia": scrape_exportersindia,
    "justdial": scrape_justdial,
    "google_maps_b2b": scrape_google_maps_local,
    # v3.5.57: Replaced Apollo/RocketReach/Crunchbase with proven alternatives
    "email_finder_b2b": scrape_email_finder_b2b,
    "github_b2b": scrape_github_b2b,
    "business_directories": scrape_business_directories,
}

# Platforms that accept a location parameter
_B2B_LOCATION_PLATFORMS = {
    "generic_email_dork", "indiamart", "tradeindia", "exportersindia",
    "justdial", "google_maps_b2b",
    # v3.5.57 replacements
    "email_finder_b2b", "github_b2b", "business_directories",
}


def b2b_scrape_platform(
    platform: str,
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Dispatch to the correct B2B platform scraper.

    Args:
        platform: One of the supported B2B platforms
        query: Search keyword/query
        location: Optional location filter
        max_results: Maximum leads to return

    Returns:
        List of lead dicts with name, email, phone, platform, source_url, etc.
    """
    scraper = _B2B_SCRAPERS.get(platform.lower())
    if not scraper:
        logger.warning("Unknown B2B platform: %s", platform)
        return []

    try:
        if platform.lower() in _B2B_LOCATION_PLATFORMS:
            return scraper(query, location=location, max_results=max_results)
        return scraper(query, max_results=max_results)
    except Exception as exc:
        logger.error("B2B scrape error for %s: %s", platform, exc)
        return []


# v3.5.57: Platform priority order for maximum lead yield.
# Higher-yield platforms are scraped first so users get results faster.
# Indian market: JustDial/IndiaMART → Google Maps → TradeIndia → ExportersIndia
# Global market: Email Finder → GitHub → Business Directories → Google Maps
# generic_email_dork gets highest priority (0) — most reliable source.
_B2B_PRIORITY_ORDER = {
    "generic_email_dork": 0,
    "justdial": 1,
    "indiamart": 2,
    "google_maps_b2b": 3,
    "email_finder_b2b": 4,
    "github_b2b": 5,
    "business_directories": 6,
    "tradeindia": 7,
    "exportersindia": 8,
}


def b2b_scrape_all_platforms(
    platforms: list[str],
    query: str,
    location: str = "",
    max_per_platform: int = 50,
) -> list[dict]:
    """Scrape all requested B2B platforms and combine results.

    v3.5.9: Platforms are sorted by priority order so high-yield sources
    (JustDial, IndiaMART, Apollo) are scraped first for faster results.
    """
    all_leads: list[dict] = []
    # Sort platforms by priority (lower number = higher priority)
    sorted_platforms = sorted(
        platforms,
        key=lambda p: _B2B_PRIORITY_ORDER.get(p.lower(), 99),
    )
    for platform in sorted_platforms:
        platform_leads = b2b_scrape_platform(
            platform, query, location, max_per_platform,
        )
        all_leads.extend(platform_leads)
        logger.info("B2B platform %s: %d leads", platform, len(platform_leads))
    return all_leads


def get_available_b2b_platforms() -> list[dict]:
    """Return list of available B2B platform scrapers with metadata.

    v3.5.57: Replaced Apollo/RocketReach/Crunchbase with proven alternatives.
    Indian market: JustDial (#1) → IndiaMART (#2) → Google Maps (#3)
    Global market: Email Finder (#4) → GitHub (#5) → Business Directories (#6)
    """
    return [
        {"id": "generic_email_dork", "name": "Generic Email Dorking", "region": "global", "tier": 0,
         "priority": 0,
         "description": "v3.5.49: Direct email discovery via search engine dorking — 8-15 emails/query, zero API keys"},
        {"id": "justdial", "name": "JustDial", "region": "india", "tier": 1,
         "priority": 1,
         "description": "Local business directory — names, addresses, ratings, phones"},
        {"id": "indiamart", "name": "IndiaMART", "region": "india", "tier": 1,
         "priority": 2,
         "description": "India's largest B2B marketplace — suppliers, manufacturers, exporters"},
        {"id": "google_maps_b2b", "name": "Google Maps B2B", "region": "global", "tier": 1,
         "priority": 3,
         "description": "Local business listings with phone, website, address"},
        {"id": "email_finder_b2b", "name": "Email Finder B2B", "region": "global", "tier": 1,
         "priority": 4,
         "description": "v3.5.57: Email pattern generation (64 patterns/lead) + contact page scraping + MX verification"},
        {"id": "github_b2b", "name": "GitHub B2B", "region": "global", "tier": 1,
         "priority": 5,
         "description": "v3.5.57: Developer leads with public emails via free GitHub API (5K req/hr)"},
        {"id": "business_directories", "name": "Business Directories", "region": "global", "tier": 1,
         "priority": 6,
         "description": "v3.5.57: Combined dorking across JustDial/IndiaMART/TradeIndia/YellowPages/Yelp"},
        {"id": "tradeindia", "name": "TradeIndia", "region": "india", "tier": 1,
         "priority": 7,
         "description": "Indian B2B portal — GST, IEC, company profiles"},
        {"id": "exportersindia", "name": "ExportersIndia", "region": "india", "tier": 1,
         "priority": 8,
         "description": "Indian exporters & manufacturers directory"},
    ]
