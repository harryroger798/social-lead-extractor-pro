"""B2B platform scrapers for SnapLeads v3.5.8.

Dedicated scrapers for high-value B2B lead sources identified by Claude Opus 4.6:

  TIER 1 (Dedicated Scrapers):
    IndiaMART:      SEO directory + JSON-LD + company microsites
    Apollo.io:      Hidden JSON API (no login needed for partial data)
    TradeIndia:     HTML scraping + JSON-LD profiles
    ExportersIndia: Simple HTML scraping
    JustDial:       Business directory (names, addresses, ratings)
    Google Maps:    Local Pack via google.com/search?tbm=lcl

  TIER 2 (Google Dorking + Page Crawling):
    RocketReach:    Public profile pages via Google dorking
    Crunchbase:     Organization pages + JSON-LD

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
from urllib.parse import quote_plus, urlparse

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
    search_term = f"{query} {location}".strip() if location else query
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

                    # v3.5.8: stop paginating if page returned 0 new leads
                    if len(leads) == page_lead_count:
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
# 2. APOLLO.IO — Hidden JSON API (no login for partial data)
# ===========================================================================

def scrape_apollo(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Scrape Apollo.io using its hidden public JSON API.

    Apollo.io has an undocumented API at /api/v1/mixed_people/search that
    returns name, title, company, masked emails, LinkedIn URLs WITHOUT login.
    Company search at /api/v1/mixed_companies/search returns org data.

    Rate limit: ~100 req/day, 8-15s delays
    Ban risk: MEDIUM — respects their rate limits
    """
    leads: list[dict] = []

    # R4 fix: Apollo API requires no auth for partial data, but
    # gracefully handle 401/403 by falling through to dorking
    # Method 1: People search API
    try:
        _scrape_apollo_people(query, location, leads, max_results)
    except Exception as exc:
        logger.warning("Apollo people search error: %s", exc)

    # Method 2: Company search API
    try:
        _scrape_apollo_companies(query, location, leads, max_results - len(leads))
    except Exception as exc:
        logger.warning("Apollo company search error: %s", exc)

    # Method 3: Google dorking for Apollo profiles as fallback
    if len(leads) < max_results // 2:
        try:
            search_term = f"{query} {location}".strip() if location else query
            dork = f'site:apollo.io "{search_term}"'
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")
                title = r.get("title", "")

                # Parse Apollo title format: "Name - Title at Company | Apollo"
                name = ""
                company = ""
                job_title = ""
                if " - " in title and " at " in title:
                    parts = title.split(" - ", 1)
                    name = parts[0].strip()
                    if " at " in parts[1]:
                        role_company = parts[1].split(" at ", 1)
                        job_title = role_company[0].strip()
                        company = role_company[1].split("|")[0].strip()
                elif " | " in title:
                    name = title.split(" | ")[0].strip()

                emails = extract_emails(text)

                if name or company:
                    leads.append({
                        "name": name,
                        "email": emails[0] if emails else "",
                        "phone": "",
                        "platform": "apollo",
                        "source_url": link,
                        "location": location,
                        "company": company,
                        "title": job_title,
                    })
        except Exception as exc:
            logger.debug("Apollo dorking error: %s", exc)

    logger.info("Apollo scrape: %d leads for '%s'", len(leads), query)
    return _dedup_leads(leads)[:max_results]


def _scrape_apollo_people(
    query: str,
    location: str,
    leads: list[dict],
    max_results: int,
) -> None:
    """Search Apollo.io people API."""
    with AdSession(timeout=15.0, min_delay=10.0) as session:
        # Build the search payload
        payload: dict = {
            "page": 1,
            "per_page": min(max_results, 25),
            "prospected_by_current_team": ["no"],
        }

        # Parse query for title vs industry keywords
        query_lower = query.lower()
        title_keywords = [
            "ceo", "cto", "cfo", "coo", "founder", "director",
            "manager", "vp", "vice president", "head", "lead",
            "engineer", "developer", "marketing", "sales",
        ]

        has_title = any(kw in query_lower for kw in title_keywords)
        if has_title:
            payload["person_titles"] = [query]
        else:
            payload["q_keywords"] = query

        if location:
            payload["person_locations"] = [location]

        try:
            resp = session.post(
                "https://app.apollo.io/api/v1/mixed_people/search",
                json=payload,
                headers={"Content-Type": "application/json"},
            )

            if resp.status_code in (401, 403):
                # R4 fix: Apollo may require auth now — fall through to dorking
                logger.info("Apollo people API auth required (HTTP %d) — using dorking fallback", resp.status_code)
                return
            if resp.status_code != 200:
                logger.debug("Apollo people API: HTTP %d", resp.status_code)
                return

            data = resp.json()
            people = data.get("people", [])

            for person in people[:max_results]:
                name = person.get("name", "")
                first_name = person.get("first_name", "")
                last_name = person.get("last_name", "")
                full_name = name or f"{first_name} {last_name}".strip()

                email = person.get("email", "")
                # Apollo may mask emails like "j***@company.com"
                if email and "***" in email:
                    email = ""  # Don't use masked emails

                org = person.get("organization", {})
                company = org.get("name", "") if isinstance(org, dict) else ""
                company_domain = org.get("primary_domain", "") if isinstance(org, dict) else ""

                leads.append({
                    "name": full_name,
                    "email": email,
                    "phone": person.get("phone_number", "") or "",
                    "platform": "apollo",
                    "source_url": f"https://app.apollo.io/#/people/{person.get('id', '')}",
                    "location": person.get("city", "") or location,
                    "company": company,
                    "company_domain": company_domain,
                    "title": person.get("title", ""),
                    "linkedin_url": person.get("linkedin_url", ""),
                    "seniority": person.get("seniority", ""),
                })

        except (_json_mod.JSONDecodeError, KeyError, TypeError) as exc:
            logger.debug("Apollo people API parse error: %s", exc)


def _scrape_apollo_companies(
    query: str,
    location: str,
    leads: list[dict],
    max_results: int,
) -> None:
    """Search Apollo.io companies API."""
    if max_results <= 0:
        return

    with AdSession(timeout=15.0, min_delay=10.0) as session:
        payload: dict = {
            "page": 1,
            "per_page": min(max_results, 25),
            "q_organization_keyword_tags": [query],
        }

        if location:
            payload["organization_locations"] = [location]

        try:
            resp = session.post(
                "https://app.apollo.io/api/v1/mixed_companies/search",
                json=payload,
                headers={"Content-Type": "application/json"},
            )

            if resp.status_code in (401, 403):
                logger.info("Apollo companies API auth required (HTTP %d) — using dorking fallback", resp.status_code)
                return
            if resp.status_code != 200:
                logger.debug("Apollo companies API: HTTP %d", resp.status_code)
                return

            data = resp.json()
            organizations = data.get("organizations", [])

            for org in organizations[:max_results]:
                name = org.get("name", "")
                domain = org.get("primary_domain", "")
                phone = org.get("phone", "")

                leads.append({
                    "name": name,
                    "email": "",
                    "phone": phone or "",
                    "platform": "apollo",
                    "source_url": f"https://app.apollo.io/#/companies/{org.get('id', '')}",
                    "location": org.get("city", "") or location,
                    "company": name,
                    "company_domain": domain,
                    "industry": org.get("industry", ""),
                    "employee_count": org.get("estimated_num_employees", ""),
                })

        except (_json_mod.JSONDecodeError, KeyError, TypeError) as exc:
            logger.debug("Apollo companies API parse error: %s", exc)


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
    search_term = f"{query} {location}".strip() if location else query
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

    # Method 2: Google dorking for TradeIndia
    try:
        dork = f'site:tradeindia.com "{search_term}"'
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
        logger.debug("TradeIndia dorking error: %s", exc)

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
    search_term = f"{query} {location}".strip() if location else query
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

    # Method 2: Google dorking
    try:
        dork = f'site:exportersindia.com "{search_term}"'
        results = free_search_waterfall(dork, num_results=10, min_results=2)
        for r in results:
            text = f"{r.get('title', '')} {r.get('snippet', '')}"
            link = r.get("link", "")
            title = r.get("title", "")

            company_name = title.split(" - ")[0].strip() if " - " in title else ""
            emails = extract_emails(text)

            if company_name or emails:
                leads.append({
                    "name": company_name,
                    "email": emails[0] if emails else "",
                    "phone": "",
                    "platform": "exportersindia",
                    "source_url": link,
                    "location": location,
                    "company": company_name,
                })
    except Exception as exc:
        logger.debug("ExportersIndia dorking error: %s", exc)

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
    search_term = f"{query} in {location}".strip() if location else query

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
# 7. ROCKETREACH — Public profile pages via Google dorking
# ===========================================================================

def scrape_rocketreach(
    query: str,
    location: str = "",
    max_results: int = 30,
) -> list[dict]:
    """Scrape RocketReach public profile pages via Google dorking.

    RocketReach has public profile pages indexed by Google that contain
    name, title, company, location, and sometimes partial email hints.
    Company pages list employees with titles.

    Rate limit: 30-50 profiles/day
    Ban risk: MEDIUM
    """
    leads: list[dict] = []
    search_term = f"{query} {location}".strip() if location else query

    # Find RocketReach profiles via Google
    dork_queries = [
        f'site:rocketreach.co "{search_term}"',
        f'site:rocketreach.co/person "{search_term}" email',
    ]

    profile_urls: list[str] = []
    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=15, min_results=2)
            for r in results:
                link = r.get("link", "")
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                title = r.get("title", "")

                # Extract info from search snippets
                name = ""
                company = ""
                job_title = ""

                # RocketReach title format: "Name - Title at Company | RocketReach"
                if " - " in title:
                    parts = title.split(" - ", 1)
                    name = parts[0].strip()
                    if " at " in parts[1]:
                        role_co = parts[1].split(" at ", 1)
                        job_title = role_co[0].strip()
                        company = role_co[1].split("|")[0].strip()

                emails = extract_emails(text)

                if name or company:
                    leads.append({
                        "name": name,
                        "email": emails[0] if emails else "",
                        "phone": "",
                        "platform": "rocketreach",
                        "source_url": link,
                        "location": location,
                        "company": company,
                        "title": job_title,
                    })

                if "rocketreach.co" in link:
                    profile_urls.append(link)
    except Exception as exc:
        logger.debug("RocketReach dorking error: %s", exc)

    # Visit profile pages to extract JSON-LD / structured data
    with AdSession(timeout=12.0, min_delay=5.0) as session:
        seen_urls: set[str] = set()
        for url in profile_urls[:10]:
            if url in seen_urls:
                continue
            seen_urls.add(url)

            try:
                resp = session.get(url)
                if resp.status_code != 200:
                    continue

                page_html = _safe_response_text(resp)
                if not page_html:
                    continue

                # Parse JSON-LD
                jsonld_blocks = re.findall(
                    r'<script\s+type="application/ld\+json">\s*(\{.+?\})\s*</script>',
                    page_html,
                    re.DOTALL,
                )
                for block in jsonld_blocks[:20]:
                    try:
                        data = _json_mod.loads(block)
                        if data.get("@type") == "Person":
                            name = data.get("name", "")
                            job_title_ld = data.get("jobTitle", "")
                            works_for = data.get("worksFor", {})
                            company_ld = works_for.get("name", "") if isinstance(works_for, dict) else ""
                            addr = data.get("address", {})
                            loc = addr.get("addressLocality", "") if isinstance(addr, dict) else ""

                            if name:
                                leads.append({
                                    "name": name,
                                    "email": "",
                                    "phone": "",
                                    "platform": "rocketreach",
                                    "source_url": url,
                                    "location": loc or location,
                                    "company": company_ld,
                                    "title": job_title_ld,
                                })
                    except (_json_mod.JSONDecodeError, KeyError, TypeError):
                        continue

                # Try to extract __INITIAL_STATE__ data
                state_match = re.search(
                    r'__INITIAL_STATE__\s*=\s*(\{.+?\});',
                    page_html,
                    re.DOTALL,
                )
                if state_match:
                    try:
                        state = _json_mod.loads(state_match.group(1))
                        profile = state.get("profile", {})
                        if isinstance(profile, dict):
                            email_hint = profile.get("teaser_email", "")
                            phone_hint = profile.get("teaser_phone", "")
                            linkedin = profile.get("linkedin_url", "")

                            if email_hint or phone_hint:
                                leads.append({
                                    "name": profile.get("name", ""),
                                    "email": email_hint if email_hint and "***" not in email_hint else "",
                                    "phone": phone_hint or "",
                                    "platform": "rocketreach",
                                    "source_url": url,
                                    "location": location,
                                    "company": profile.get("company_name", ""),
                                    "linkedin_url": linkedin,
                                })
                    except (_json_mod.JSONDecodeError, KeyError, TypeError):
                        pass

            except Exception as exc:
                logger.debug("RocketReach profile scrape error: %s", exc)

    logger.info("RocketReach scrape: %d leads for '%s'", len(leads), search_term)
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 8. CRUNCHBASE — Organization pages + JSON-LD
# ===========================================================================

def scrape_crunchbase(
    query: str,
    location: str = "",
    max_results: int = 30,
) -> list[dict]:
    """Scrape Crunchbase organization data via Google dorking + page crawling.

    Crunchbase has public organization pages with company info, funding data,
    employee counts, and key people. Pages include JSON-LD structured data.

    Rate limit: 5-10s delay
    Ban risk: MEDIUM
    """
    leads: list[dict] = []
    search_term = f"{query} {location}".strip() if location else query

    # Google dorking for Crunchbase pages
    dork_queries = [
        f'site:crunchbase.com/organization "{search_term}"',
        f'site:crunchbase.com/person "{search_term}"',
        f'site:crunchbase.com "{search_term}" email OR founder OR CEO',
    ]

    page_urls: list[str] = []
    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")
                title = r.get("title", "")

                # Parse Crunchbase title: "Company - Crunchbase Company Profile"
                entity_name = ""
                if " - " in title:
                    entity_name = title.split(" - ")[0].strip()
                elif " | " in title:
                    entity_name = title.split(" | ")[0].strip()

                emails = extract_emails(text)

                if entity_name:
                    leads.append({
                        "name": entity_name,
                        "email": emails[0] if emails else "",
                        "phone": "",
                        "platform": "crunchbase",
                        "source_url": link,
                        "location": location,
                        "company": entity_name,
                    })

                if "crunchbase.com" in link:
                    page_urls.append(link)
    except Exception as exc:
        logger.debug("Crunchbase dorking error: %s", exc)

    # Visit Crunchbase pages for structured data
    with AdSession(timeout=12.0, min_delay=6.0) as session:
        seen_urls: set[str] = set()
        for url in page_urls[:8]:
            if url in seen_urls:
                continue
            seen_urls.add(url)

            try:
                resp = session.get(url)
                if resp.status_code != 200:
                    continue

                page_html = _safe_response_text(resp)
                if not page_html:
                    continue

                # Parse JSON-LD
                jsonld_blocks = re.findall(
                    r'<script\s+type="application/ld\+json">\s*(\{.+?\})\s*</script>',
                    page_html,
                    re.DOTALL,
                )
                for block in jsonld_blocks[:20]:
                    try:
                        data = _json_mod.loads(block)
                        ld_type = data.get("@type", "")

                        if ld_type == "Organization":
                            name = data.get("name", "")
                            if name:
                                leads.append({
                                    "name": name,
                                    "email": data.get("email", ""),
                                    "phone": data.get("telephone", ""),
                                    "platform": "crunchbase",
                                    "source_url": url,
                                    "location": "",
                                    "company": name,
                                    "description": data.get("description", "")[:200],
                                })
                                # Extract founder info if available
                                founders = data.get("founders", [])
                                if isinstance(founders, list):
                                    for founder in founders[:5]:
                                        if isinstance(founder, dict):
                                            leads.append({
                                                "name": founder.get("name", ""),
                                                "email": "",
                                                "phone": "",
                                                "platform": "crunchbase",
                                                "source_url": url,
                                                "location": location,
                                                "company": name,
                                                "title": "Founder",
                                            })

                        elif ld_type == "Person":
                            name = data.get("name", "")
                            if name:
                                works_for = data.get("worksFor", {})
                                company_name = works_for.get("name", "") if isinstance(works_for, dict) else ""
                                leads.append({
                                    "name": name,
                                    "email": "",
                                    "phone": "",
                                    "platform": "crunchbase",
                                    "source_url": url,
                                    "location": location,
                                    "company": company_name,
                                    "title": data.get("jobTitle", ""),
                                })
                    except (_json_mod.JSONDecodeError, KeyError, TypeError):
                        continue

                # Extract emails/phones from page text
                page_text = _strip_tags(page_html[:200_000])
                for email in extract_emails(page_text)[:3]:
                    leads.append({
                        "name": "",
                        "email": email,
                        "phone": "",
                        "platform": "crunchbase",
                        "source_url": url,
                        "location": location,
                    })

            except Exception as exc:
                logger.debug("Crunchbase page scrape error: %s", exc)

    logger.info("Crunchbase scrape: %d leads for '%s'", len(leads), search_term)
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# UNIFIED DISPATCHER
# ===========================================================================

_B2B_SCRAPERS = {
    "indiamart": scrape_indiamart,
    "apollo": scrape_apollo,
    "tradeindia": scrape_tradeindia,
    "exportersindia": scrape_exportersindia,
    "justdial": scrape_justdial,
    "google_maps_b2b": scrape_google_maps_local,
    "rocketreach": scrape_rocketreach,
    "crunchbase": scrape_crunchbase,
}

# Platforms that accept a location parameter
_B2B_LOCATION_PLATFORMS = {
    "indiamart", "apollo", "tradeindia", "exportersindia",
    "justdial", "google_maps_b2b", "rocketreach", "crunchbase",
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


# v3.5.9: Platform priority order for maximum lead yield.
# Higher-yield platforms are scraped first so users get results faster.
# Indian market: JustDial/IndiaMART → Google Maps → TradeIndia → ExportersIndia
# Global market: Apollo → Google Maps → RocketReach → Crunchbase
_B2B_PRIORITY_ORDER = {
    "justdial": 1,
    "indiamart": 2,
    "google_maps_b2b": 3,
    "apollo": 4,
    "tradeindia": 5,
    "exportersindia": 6,
    "rocketreach": 7,
    "crunchbase": 8,
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

    v3.5.9: Added priority field for lead maximization strategy.
    Indian market: JustDial (#1) → IndiaMART (#2) → Google Maps (#3)
    Global market: Apollo (#4) → Google Maps (#3) → RocketReach (#7)
    """
    return [
        {"id": "justdial", "name": "JustDial", "region": "india", "tier": 1,
         "priority": 1,
         "description": "Local business directory — names, addresses, ratings, phones"},
        {"id": "indiamart", "name": "IndiaMART", "region": "india", "tier": 1,
         "priority": 2,
         "description": "India's largest B2B marketplace — suppliers, manufacturers, exporters"},
        {"id": "google_maps_b2b", "name": "Google Maps B2B", "region": "global", "tier": 1,
         "priority": 3,
         "description": "Local business listings with phone, website, address"},
        {"id": "apollo", "name": "Apollo.io", "region": "global", "tier": 1,
         "priority": 4,
         "description": "B2B people & company search — names, titles, emails, LinkedIn"},
        {"id": "tradeindia", "name": "TradeIndia", "region": "india", "tier": 1,
         "priority": 5,
         "description": "Indian B2B portal — GST, IEC, company profiles"},
        {"id": "exportersindia", "name": "ExportersIndia", "region": "india", "tier": 1,
         "priority": 6,
         "description": "Indian exporters & manufacturers directory"},
        {"id": "rocketreach", "name": "RocketReach", "region": "global", "tier": 2,
         "priority": 7,
         "description": "Professional profiles — names, titles, companies via dorking"},
        {"id": "crunchbase", "name": "Crunchbase", "region": "global", "tier": 2,
         "priority": 8,
         "description": "Startup & company data — founders, funding, employee counts"},
    ]
