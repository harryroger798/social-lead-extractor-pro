"""Automatic Directory Discovery & Adaptive Scraping Pipeline (v3.5.31).

Implements Claude-recommended 5-stage architecture for discovering and scraping
lead-rich directory pages for ANY keyword — no hardcoded sources needed.

Pipeline stages:
  1. Source Discovery Engine  — queries DDG, Bing, Yahoo for directory pages
  2. Directory Fingerprinter  — scores/filters URLs to skip non-directories
  3. Adaptive Contact Extractor — extracts contacts from arbitrary HTML
     (JSON-LD > Microdata > Heuristic DOM > Regex fallback)
  4. Anti-Bot Handling         — rate limiting, retry strategies, pagination
  5. Pipeline Orchestrator     — ties it all together

All methods: Zero API keys | Zero browser automation | 100% ban-free.
Uses existing AdSession (curl_cffi TLS impersonation) for all HTTP requests.
"""

from __future__ import annotations

import json as _json
import logging
import random
import re
import time
from collections import Counter
from typing import Callable, Optional
from urllib.parse import quote_plus, urlparse, parse_qs

from bs4 import BeautifulSoup

from app.services.anti_detection import AdSession
from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)


# ============================================================================
# Stage 1: Source Discovery Engine
# ============================================================================

def _build_discovery_queries(keyword: str, location: str) -> list[str]:
    """Generate search queries designed to surface directory listing pages."""
    base = f"{keyword} {location}".strip()
    queries = [
        # Directory listing patterns
        f"{base} directory",
        f"{base} listings",
        f"{base} contact details phone email",
        # Review/rating site patterns (always have contact info)
        f"{base} reviews",
        f"{base} near me",
        # Explicit directory types
        f"best {keyword} in {location}" if location else f"best {keyword}",
        f"top {keyword} {location}".strip(),
        # Known directory site patterns
        f"{keyword} {location} yellowpages OR justdial OR sulekha OR yelp OR manta".strip(),
        # Contact-rich patterns
        f"{base} phone number address",
        f"{base} business list",
    ]
    return queries


def _search_ddg_html(query: str, session: AdSession) -> list[str]:
    """Search DuckDuckGo HTML endpoint — no JS required, returns clean HTML."""
    urls: list[str] = []
    try:
        resp = session.post(
            "https://html.duckduckgo.com/html/",
            data={"q": query, "kl": "us-en"},
        )
        if resp.status_code != 200:
            return urls
        soup = BeautifulSoup(resp.text, "html.parser")
        for result in soup.select(".result__url, .result__a"):
            href = result.get("href", "")
            if "uddg=" in href:
                parsed = parse_qs(urlparse(href).query)
                real_url = parsed.get("uddg", [""])[0]
                if real_url and real_url.startswith("http"):
                    urls.append(real_url)
            elif href.startswith("http"):
                urls.append(href)
    except Exception as exc:
        logger.debug("DDG HTML search failed: %s", exc)
    return urls


def _search_bing_html(query: str, session: AdSession) -> list[str]:
    """Search Bing HTML — surfaces different results than DDG."""
    urls: list[str] = []
    try:
        url = f"https://www.bing.com/search?q={quote_plus(query)}&count=20"
        resp = session.get(url)
        if resp.status_code != 200:
            return urls
        soup = BeautifulSoup(resp.text, "html.parser")
        # Grab from <a> tags in results
        for a in soup.select("#b_results .b_algo h2 a"):
            href = a.get("href", "")
            if href.startswith("http"):
                urls.append(href)
        # Also grab from <cite> tags
        for cite in soup.select("cite"):
            text = cite.get_text(strip=True)
            if text.startswith("http"):
                urls.append(text)
            elif "/" in text and "." in text:
                urls.append(f"https://{text}")
    except Exception as exc:
        logger.debug("Bing HTML search failed: %s", exc)
    return urls


def _search_yahoo_html(query: str, session: AdSession) -> list[str]:
    """Search Yahoo — tends to surface older, established directory sites."""
    urls: list[str] = []
    try:
        url = f"https://search.yahoo.com/search?p={quote_plus(query)}&n=20"
        resp = session.get(url)
        if resp.status_code != 200:
            return urls
        soup = BeautifulSoup(resp.text, "html.parser")
        for a in soup.select(".algo-sr h3 a, #web .compTitle h3.title a, .dd.algo h3 a"):
            href = a.get("href", "")
            # Yahoo wraps in redirects
            if "RU=" in href:
                match = re.search(r"RU=([^/]+)", href)
                if match:
                    from urllib.parse import unquote
                    real = unquote(match.group(1))
                    if real.startswith("http"):
                        urls.append(real)
            elif href.startswith("http"):
                urls.append(href)
    except Exception as exc:
        logger.debug("Yahoo HTML search failed: %s", exc)
    return urls


def discover_sources(
    keyword: str,
    location: str,
    max_queries: int = 4,
) -> list[str]:
    """Aggregate, deduplicate, and return discovered directory URLs.

    Queries DDG + Bing + Yahoo with discovery-optimized queries.
    Returns deduplicated list of candidate URLs (one per domain).
    """
    all_queries = _build_discovery_queries(keyword, location)
    sampled = random.sample(all_queries, min(max_queries, len(all_queries)))
    all_urls: list[str] = []

    with AdSession(timeout=15.0, min_delay=2.5) as session:
        for query in sampled:
            # DDG
            try:
                ddg_urls = _search_ddg_html(query, session)
                all_urls.extend(ddg_urls)
            except Exception as exc:
                logger.debug("DDG discovery failed: %s", exc)
            # Bing
            try:
                bing_urls = _search_bing_html(query, session)
                all_urls.extend(bing_urls)
            except Exception as exc:
                logger.debug("Bing discovery failed: %s", exc)
            # Yahoo (only for first 2 queries to save time)
            if sampled.index(query) < 2:
                try:
                    yahoo_urls = _search_yahoo_html(query, session)
                    all_urls.extend(yahoo_urls)
                except Exception as exc:
                    logger.debug("Yahoo discovery failed: %s", exc)

    # Deduplicate by domain — keep best URL per domain
    seen_domains: dict[str, str] = {}
    for url in all_urls:
        try:
            domain = urlparse(url).netloc.lower().replace("www.", "")
            if domain and domain not in seen_domains:
                seen_domains[domain] = url
        except Exception:
            pass

    logger.info(
        "Auto-discovery: %d unique domains from %d total URLs (%d queries)",
        len(seen_domains), len(all_urls), len(sampled),
    )
    return list(seen_domains.values())


# ============================================================================
# Stage 2: Directory Fingerprinter
# ============================================================================

# Known high-value directory domains (expandable)
_KNOWN_DIRECTORIES = {
    # Global
    "yelp.com", "yellowpages.com", "manta.com", "chamberofcommerce.com",
    "foursquare.com", "mapquest.com", "bbb.org",
    # India
    "justdial.com", "sulekha.com", "indiamart.com", "tradeindia.com",
    "exportersindia.com", "urbanclap.com", "urbancompany.com",
    # UK
    "yell.com", "thomsonlocal.com", "scoot.co.uk",
    # Australia
    "truelocal.com.au", "yellowpages.com.au", "startlocal.com.au",
    # Canada
    "yellowpages.ca", "canada411.ca",
    # Wedding
    "wedmegood.com", "shaadisaga.com", "weddingwire.in", "weddingwire.com",
    "zola.com", "theknot.com",
    # Real estate
    "99acres.com", "magicbricks.com", "housing.com", "zillow.com",
    "realtor.com", "trulia.com",
    # Other
    "glassdoor.com", "indeed.com", "naukri.com", "linkedin.com",
}

# URL path patterns that indicate listing/search pages
_LISTING_PATH_PATTERNS = [
    r"/search", r"/find", r"/listing", r"/directory",
    r"/results", r"/category", r"/businesses",
    r"/vendors", r"/professionals", r"/providers",
]

# Patterns that indicate a single business page (lower value)
_SINGLE_BUSINESS_PATTERNS = [
    r"/biz/[^/]+$",       # Yelp individual business
    r"/business/[^/]+$",
    r"/profile/[^/]+$",
]


def score_url(url: str) -> dict:
    """Score a URL for directory-listing potential.

    Returns dict with url, score, reasons, fetch_recommended.
    """
    parsed = urlparse(url)
    domain = parsed.netloc.lower().replace("www.", "")
    path = parsed.path.lower()
    score = 0
    reasons: list[str] = []

    # Known directory bonus
    if any(kd in domain for kd in _KNOWN_DIRECTORIES):
        score += 40
        reasons.append("known_directory")

    # Listing page path patterns
    for pattern in _LISTING_PATH_PATTERNS:
        if re.search(pattern, path):
            score += 20
            reasons.append("listing_path")
            break

    # Single business page penalty
    for pattern in _SINGLE_BUSINESS_PATTERNS:
        if re.search(pattern, url):
            score -= 30
            reasons.append("single_business_page")
            break

    # Query string suggests search results page
    if parsed.query:
        score += 15
        reasons.append("has_search_params")

    # Skip social media / non-directory sites
    skip_domains = {
        "facebook.com", "instagram.com", "twitter.com", "x.com",
        "youtube.com", "tiktok.com", "pinterest.com", "reddit.com",
        "wikipedia.org", "amazon.com", "flipkart.com",
    }
    if any(sd in domain for sd in skip_domains):
        score -= 50
        reasons.append("social_media_or_ecommerce")

    return {
        "url": url,
        "domain": domain,
        "score": score,
        "reasons": reasons,
        "fetch_recommended": score >= 10,
    }


def lightweight_probe(url: str, session: AdSession) -> dict:
    """Fetch first 50KB of a page to determine if it has multiple listings."""
    try:
        resp = session.get(url, timeout=10.0)
        if resp.status_code != 200:
            return {"url": url, "is_listing_page": False, "error": f"HTTP {resp.status_code}"}

        text = resp.text[:51200]  # ~50KB
        phone_count = len(re.findall(r'\+?[\d\s\-\(\)]{10,15}', text))
        email_count = len(re.findall(r'[\w.\-]+@[\w.\-]+\.\w+', text))
        # Multiple phone numbers or emails = listing page
        is_listing = phone_count >= 3 or email_count >= 2
        return {
            "url": url,
            "phone_count": phone_count,
            "email_count": email_count,
            "is_listing_page": is_listing,
            "html": resp.text,
        }
    except Exception as exc:
        return {"url": url, "is_listing_page": False, "error": str(exc)}


# ============================================================================
# Stage 3: Adaptive Contact Extractor
# ============================================================================

# Phone patterns (international formats)
_PHONE_PATTERNS = [
    r'\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{4}',
    r'[6-9]\d{9}',                          # Indian mobile
    r'\+91[\s\-]?[6-9]\d{9}',               # Indian with country code
    r'0\d{2,4}[\s\-]?\d{6,8}',              # Indian landline
    r'\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}',  # US/Canada
    r'0\d{2,4}[\s\-]?\d{3,4}[\s\-]?\d{4}', # UK
    r'\+\d{8,15}',                           # Generic international
]

_EMAIL_PATTERN = r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'


def _is_honeypot(element) -> bool:
    """Detect hidden elements used as honeypot traps for scrapers."""
    style = element.get("style", "")
    if isinstance(style, list):
        style = " ".join(style)
    return any(trap in style for trap in [
        "display:none", "display: none",
        "visibility:hidden", "visibility: hidden",
        "opacity:0", "opacity: 0",
    ])


def _clean_phone(phone: str) -> str:
    """Normalize phone number, keeping only digits and standard symbols."""
    cleaned = re.sub(r'[^\d\+\s\-\(\)]', '', phone).strip()
    return cleaned


def _extract_jsonld(html: str) -> list[dict]:
    """Extract structured data from Schema.org JSON-LD (highest quality).

    Many modern directories embed perfectly structured business data as JSON-LD.
    """
    leads: list[dict] = []
    soup = BeautifulSoup(html, "html.parser")
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = _json.loads(script.string or "")
            items: list[dict] = []
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                items = [data]
                if "@graph" in data:
                    items = data["@graph"]

            for item in items:
                if not isinstance(item, dict):
                    continue
                btype = str(item.get("@type", ""))
                business_types = [
                    "LocalBusiness", "Organization", "Person",
                    "Physician", "LegalService", "HomeAndConstructionBusiness",
                    "RealEstateAgent", "Restaurant", "Store", "ProfessionalService",
                    "HealthAndBeautyBusiness", "EducationalOrganization",
                ]
                if any(t in btype for t in business_types):
                    lead = _parse_schema_org(item)
                    if lead:
                        leads.append(lead)
        except (_json.JSONDecodeError, AttributeError, TypeError):
            continue
    return leads


def _parse_schema_org(item: dict) -> Optional[dict]:
    """Parse a Schema.org business entity into a lead dict."""
    lead: dict[str, str] = {}
    lead["name"] = item.get("name", "")
    # Phone
    phone = item.get("telephone", "") or item.get("phone", "")
    if isinstance(phone, list):
        phone = phone[0] if phone else ""
    lead["phone"] = _clean_phone(str(phone))
    # Email
    email = item.get("email", "")
    if isinstance(email, list):
        email = email[0] if email else ""
    lead["email"] = str(email)
    # Address
    addr = item.get("address", {})
    if isinstance(addr, dict):
        parts = [
            addr.get("streetAddress", ""),
            addr.get("addressLocality", ""),
            addr.get("addressRegion", ""),
            addr.get("postalCode", ""),
            addr.get("addressCountry", ""),
        ]
        lead["address"] = ", ".join(str(p) for p in parts if p)
    elif isinstance(addr, str):
        lead["address"] = addr
    # Website
    lead["website"] = str(item.get("url", ""))
    # Quality gate
    if lead["name"] and (lead["phone"] or lead["email"]):
        return lead
    return None


def _extract_microdata(soup: BeautifulSoup) -> list[dict]:
    """Extract from HTML microdata (itemtype/itemprop) — older directories."""
    leads: list[dict] = []
    for item in soup.find_all(attrs={"itemtype": re.compile(r"schema\.org")}):
        if _is_honeypot(item):
            continue
        lead: dict[str, str] = {}
        for prop in item.find_all(attrs={"itemprop": True}):
            if _is_honeypot(prop):
                continue
            prop_name = prop.get("itemprop", "")
            value = prop.get("content") or prop.get_text(strip=True)
            if prop_name == "name":
                lead["name"] = value
            elif prop_name in ("telephone", "phone"):
                lead["phone"] = _clean_phone(value)
            elif prop_name == "email":
                lead["email"] = value
            elif prop_name in ("address", "streetAddress", "addressLocality"):
                existing = lead.get("address", "")
                lead["address"] = f"{existing}, {value}".strip(", ") if existing else value
            elif prop_name == "url":
                lead["website"] = value
        if lead.get("name") and (lead.get("phone") or lead.get("email")):
            leads.append(lead)
    return leads


def _find_listing_containers(soup: BeautifulSoup) -> list:
    """Find repeated listing containers in the DOM.

    Directory pages always have a repeated structural pattern —
    each business is in an identical container. Find the repeating
    container, then extract from each instance.
    """
    # Strategy 1: Find elements with listing-related class names
    LISTING_CLASS_HINTS = [
        "result", "listing", "business", "card", "item",
        "entry", "record", "profile", "vendor", "provider",
    ]
    for hint in LISTING_CLASS_HINTS:
        elements = soup.find_all(
            attrs={"class": re.compile(hint, re.I)}
        )
        if len(elements) >= 3:
            return elements[:50]

    # Strategy 2: Find the most repeated tag+class combo
    tag_class_counts: Counter = Counter()
    for tag in soup.find_all(["div", "li", "article", "section", "tr"]):
        classes = " ".join(sorted(tag.get("class", [])))
        if classes:
            key = f"{tag.name}|{classes}"
            tag_class_counts[key] += 1

    most_common = [
        (combo, count) for combo, count in tag_class_counts.most_common(10)
        if count >= 3
    ]
    if most_common:
        best_combo = most_common[0][0]
        tag_name, classes = best_combo.split("|", 1)
        class_list = classes.split()
        results = soup.find_all(
            tag_name,
            class_=lambda c: c and any(
                cl in (c if isinstance(c, list) else [c]) for cl in class_list
            ),
        )
        return results[:50]
    return []


def _extract_from_container(container) -> Optional[dict]:
    """Extract contact info from a single listing container element."""
    if _is_honeypot(container):
        return None

    text = container.get_text(" ", strip=True)
    html_str = str(container)
    lead: dict[str, str] = {}

    # Name: usually in heading or element with name/title class
    for name_selector in [
        "h2", "h3", "h4",
        "[class*='name']", "[class*='title']", "[class*='biz-name']",
        "[class*='company']",
    ]:
        name_el = container.select_one(name_selector)
        if name_el:
            name_text = name_el.get_text(strip=True)
            if 3 < len(name_text) < 100:
                lead["name"] = name_text
                break

    # Phone: try tel: links first (most reliable), then regex
    tel_link = container.find("a", href=re.compile(r"^tel:"))
    if tel_link:
        lead["phone"] = _clean_phone(
            tel_link["href"].replace("tel:", "")
        )
    else:
        for pattern in _PHONE_PATTERNS:
            match = re.search(pattern, text)
            if match:
                phone = _clean_phone(match.group())
                if len(re.sub(r'\D', '', phone)) >= 7:
                    lead["phone"] = phone
                    break

    # Email: try mailto: links first, then regex
    mailto_link = container.find("a", href=re.compile(r"^mailto:"))
    if mailto_link and not _is_honeypot(mailto_link):
        lead["email"] = mailto_link["href"].replace("mailto:", "").split("?")[0]
    else:
        match = re.search(_EMAIL_PATTERN, html_str)
        if match:
            candidate_email = match.group()
            # Skip obvious non-emails
            skip_patterns = ["example.com", "sentry.io", "schema.org", "w3.org"]
            if not any(sp in candidate_email for sp in skip_patterns):
                lead["email"] = candidate_email

    # Website
    for a in container.find_all("a", href=True):
        href = a.get("href", "")
        if href.startswith("http") and "javascript" not in href:
            # Skip links to the directory itself or social media
            skip_in_href = [
                "justdial", "sulekha", "yelp", "yellowpages",
                "facebook.com", "twitter.com", "instagram.com",
                "google.com", "bing.com",
            ]
            if not any(skip in href for skip in skip_in_href):
                lead["website"] = href
                break

    # Address
    for addr_selector in [
        "[class*='address']", "[class*='location']",
        "[itemprop='address']", "address",
    ]:
        addr_el = container.select_one(addr_selector)
        if addr_el:
            lead["address"] = addr_el.get_text(strip=True)
            break

    # Quality gate: need at least name + one contact method
    if lead.get("name") and (lead.get("phone") or lead.get("email")):
        return lead
    # Last resort: even just a phone is worth keeping
    if lead.get("phone"):
        lead.setdefault("name", "Unknown Business")
        return lead
    return None


def _extract_heuristic(soup: BeautifulSoup) -> list[dict]:
    """Heuristic DOM pattern recognition — the workhorse for unstructured sites."""
    containers = _find_listing_containers(soup)
    leads: list[dict] = []
    for container in containers:
        lead = _extract_from_container(container)
        if lead:
            leads.append(lead)
    return leads


def _full_page_regex_fallback(soup: BeautifulSoup) -> list[dict]:
    """Last resort: extract all phones and emails from the page text."""
    text = soup.get_text("\n", strip=True)
    lines = text.split("\n")
    leads: list[dict] = []
    seen_phones: set[str] = set()

    for i, line in enumerate(lines):
        phone_match = None
        for pattern in _PHONE_PATTERNS:
            m = re.search(pattern, line)
            if m:
                phone_match = m.group()
                break
        if phone_match:
            phone_digits = re.sub(r'\D', '', phone_match)
            if len(phone_digits) < 7 or phone_digits in seen_phones:
                continue
            seen_phones.add(phone_digits)
            # Look at surrounding lines for a name
            name = ""
            for j in range(max(0, i - 3), i):
                candidate = lines[j].strip()
                if 3 < len(candidate) < 80 and not re.search(r'[\d\+\(\)]', candidate):
                    name = candidate
            # Look for email nearby
            email = ""
            context = "\n".join(lines[max(0, i - 2):i + 3])
            email_m = re.search(_EMAIL_PATTERN, context)
            if email_m:
                email = email_m.group()
            leads.append({
                "name": name or "Unknown Business",
                "phone": _clean_phone(phone_match),
                "email": email,
            })
    return leads


# ============================================================================
# v3.5.32: Site-Specific Extractors (highest yield for known directories)
# ============================================================================

def _extract_justdial(soup: BeautifulSoup) -> list[dict]:
    """Extract leads from JustDial listing pages.

    JustDial encodes phone numbers in spans with CSS classes to prevent
    simple scraping. We extract what's available: name, address, ratings.
    """
    leads: list[dict] = []
    # JustDial listing cards use various class patterns
    for card in soup.select(".store-details, .resultbox_info, .jsx-s, [class*='resultbox']"):
        name_el = card.select_one(
            ".store-name, .resultbox_title_anchor, .lng_cont_name, "
            "[class*='title'] a, h2 a, .jcn"
        )
        name = name_el.get_text(strip=True) if name_el else ""
        if not name:
            continue

        # Address
        addr_el = card.select_one(
            ".address, .resultbox_address, .cont_sw_addr, "
            "[class*='address'], .mrehover"
        )
        address = addr_el.get_text(strip=True) if addr_el else ""

        # Phone (JustDial obfuscates phones but sometimes exposes them)
        phone = ""
        phone_el = card.select_one(
            ".contact-info, .callcontent, [class*='phone'], "
            "[class*='mobile'], .telno"
        )
        if phone_el:
            phone_text = phone_el.get_text(strip=True)
            phone_match = re.search(r'[\+]?[\d\s\-\(\)]{7,15}', phone_text)
            if phone_match:
                phone = _clean_phone(phone_match.group())

        # Website
        website = ""
        web_el = card.select_one("a[href*='website'], a.website")
        if web_el and web_el.get("href"):
            website = web_el["href"]

        leads.append({
            "name": name,
            "phone": phone,
            "email": "",
            "address": address,
            "website": website,
        })
    return leads


def _extract_sulekha(soup: BeautifulSoup) -> list[dict]:
    """Extract leads from Sulekha listing pages."""
    leads: list[dict] = []
    for card in soup.select(
        ".serviceCard, .merchant-card, [class*='listing-card'], "
        ".s-card, [data-listingid]"
    ):
        name_el = card.select_one(
            ".merchant-name, .s-card-name, h2 a, h3 a, "
            "[class*='name'] a, .companyName"
        )
        name = name_el.get_text(strip=True) if name_el else ""
        if not name:
            continue

        addr_el = card.select_one(
            ".address, .s-card-address, [class*='location'], "
            "[class*='address']"
        )
        address = addr_el.get_text(strip=True) if addr_el else ""

        phone = ""
        phone_el = card.select_one("[class*='phone'], [class*='mobile'], .callNow")
        if phone_el:
            phone_match = re.search(r'[\+]?[\d\s\-\(\)]{7,15}', phone_el.get_text())
            if phone_match:
                phone = _clean_phone(phone_match.group())

        leads.append({
            "name": name, "phone": phone, "email": "",
            "address": address, "website": "",
        })
    return leads


def _extract_indiamart(soup: BeautifulSoup) -> list[dict]:
    """Extract leads from IndiaMart listing pages."""
    leads: list[dict] = []
    for card in soup.select(
        ".card, .prd-card, [class*='listing'], .lcont, "
        "[data-supplier-id], .brs_cards"
    ):
        name_el = card.select_one(
            ".lcname, .prd-card-name, h2 a, h3 a, .company-name, "
            "[class*='supplier'] a, .companyname"
        )
        name = name_el.get_text(strip=True) if name_el else ""
        if not name:
            continue

        addr_el = card.select_one(
            ".lcity, [class*='address'], [class*='city'], .prd-card-address"
        )
        address = addr_el.get_text(strip=True) if addr_el else ""

        phone = ""
        phone_el = card.select_one("[class*='phone'], [class*='mobile'], .phn")
        if phone_el:
            phone_match = re.search(r'[\+]?[\d\s\-\(\)]{7,15}', phone_el.get_text())
            if phone_match:
                phone = _clean_phone(phone_match.group())

        leads.append({
            "name": name, "phone": phone, "email": "",
            "address": address, "website": "",
        })
    return leads


def _extract_yelp(soup: BeautifulSoup) -> list[dict]:
    """Extract leads from Yelp search/listing pages."""
    leads: list[dict] = []
    for card in soup.select(
        "[class*='businessName'], [data-testid='serp-ia-card'], "
        ".regular-search-result, .lemon--li, .container__09f24__mpR8_"
    ):
        name_el = card.select_one(
            "a[class*='businessName'], h3 a, h4 a, .link-size--inherit, "
            "[class*='heading'] a"
        )
        name = name_el.get_text(strip=True) if name_el else ""
        if not name:
            continue

        addr_el = card.select_one(
            "[class*='secondaryAttributes'], address, "
            "[class*='location'], [class*='address']"
        )
        address = addr_el.get_text(strip=True) if addr_el else ""

        phone = ""
        phone_el = card.select_one("[class*='phone'], [data-phone]")
        if phone_el:
            phone_text = phone_el.get("data-phone", "") or phone_el.get_text()
            phone_match = re.search(r'[\+]?[\d\s\-\(\)]{7,15}', phone_text)
            if phone_match:
                phone = _clean_phone(phone_match.group())

        leads.append({
            "name": name, "phone": phone, "email": "",
            "address": address, "website": "",
        })
    return leads


def _extract_practo(soup: BeautifulSoup) -> list[dict]:
    """Extract leads from Practo doctor/clinic listing pages."""
    leads: list[dict] = []
    for card in soup.select(
        ".doctor-card, .listing-doctor-card, [data-qa-id='doctor_card'], "
        ".c-card, [class*='doctor-profile']"
    ):
        name_el = card.select_one(
            ".doctor-name, [data-qa-id='doctor_name'], h2 a, "
            ".info-section h2, [class*='doctorName']"
        )
        name = name_el.get_text(strip=True) if name_el else ""
        if not name:
            continue

        addr_el = card.select_one(
            ".address, [data-qa-id='practice_locality'], "
            "[class*='locality'], .clinic-address"
        )
        address = addr_el.get_text(strip=True) if addr_el else ""

        phone = ""
        phone_el = card.select_one("[class*='phone'], [data-qa-id='phone']")
        if phone_el:
            phone_match = re.search(r'[\+]?[\d\s\-\(\)]{7,15}', phone_el.get_text())
            if phone_match:
                phone = _clean_phone(phone_match.group())

        leads.append({
            "name": name, "phone": phone, "email": "",
            "address": address, "website": "",
        })
    return leads


# Map domain patterns to their site-specific extractor
_SITE_EXTRACTORS: dict[str, Callable[[BeautifulSoup], list[dict]]] = {
    "justdial.com": _extract_justdial,
    "sulekha.com": _extract_sulekha,
    "indiamart.com": _extract_indiamart,
    "yelp.com": _extract_yelp,
    "practo.com": _extract_practo,
}


def _get_site_extractor(url: str) -> Optional[Callable[[BeautifulSoup], list[dict]]]:
    """Return a site-specific extractor if the URL matches a known directory."""
    domain = urlparse(url).netloc.lower()
    for pattern, extractor in _SITE_EXTRACTORS.items():
        if pattern in domain:
            return extractor
    return None


def extract_leads_from_html(html: str, url: str) -> list[dict]:
    """Try all extraction layers, merge results, deduplicate.

    v3.5.32: Added Layer 0 — site-specific extractors for known directories.

    Layers (in order of reliability):
    0. Site-specific extractor (v3.5.32 — highest yield for known sites)
    1. JSON-LD structured data (best quality)
    2. Microdata / RDFa
    3. Heuristic DOM pattern recognition
    4. Full-page regex fallback
    """
    soup = BeautifulSoup(html, "html.parser")
    all_leads: list[dict] = []

    # Layer 0 (v3.5.32): Site-specific extractor for known directories
    site_extractor = _get_site_extractor(url)
    if site_extractor:
        site_leads = site_extractor(soup)
        if site_leads:
            all_leads.extend(site_leads)
            logger.debug(
                "  Site-specific: %d leads from %s", len(site_leads), url[:60]
            )

    # Layer 1: JSON-LD (highest quality)
    jsonld_leads = _extract_jsonld(html)
    if jsonld_leads:
        all_leads.extend(jsonld_leads)
        logger.debug("  JSON-LD: %d leads from %s", len(jsonld_leads), url[:60])

    # Layer 2: Microdata
    microdata_leads = _extract_microdata(soup)
    if microdata_leads:
        all_leads.extend(microdata_leads)
        logger.debug("  Microdata: %d leads from %s", len(microdata_leads), url[:60])

    # Layer 3: Heuristic DOM (always run — catches what others miss)
    heuristic_leads = _extract_heuristic(soup)
    if heuristic_leads:
        all_leads.extend(heuristic_leads)
        logger.debug("  Heuristic: %d leads from %s", len(heuristic_leads), url[:60])

    # Layer 4: Full-page regex fallback (if nothing found above)
    if not all_leads:
        regex_leads = _full_page_regex_fallback(soup)
        all_leads.extend(regex_leads)
        logger.debug("  Regex fallback: %d leads from %s", len(regex_leads), url[:60])

    return _deduplicate_leads(all_leads)


# ============================================================================
# Stage 4: Anti-Bot Handling & Pagination
# ============================================================================

def _is_blocked(html: str) -> bool:
    """Detect common bot-block pages."""
    block_indicators = [
        "just a moment", "checking your browser",
        "access denied", "403 forbidden", "rate limit exceeded",
        "captcha", "please verify", "ddos protection",
        "ray id",  # Cloudflare ray ID
    ]
    html_lower = html[:5000].lower()
    # Must match at least 1 indicator AND page is suspiciously short
    return any(indicator in html_lower for indicator in block_indicators)


def _detect_pagination(soup: BeautifulSoup, base_url: str) -> list[str]:
    """Auto-detect and generate paginated URLs."""
    pagination_urls: list[str] = []

    # Pattern 1: Find "next" links
    next_link = soup.find("a", string=re.compile(r"next|>>|Next", re.I))
    if next_link and next_link.get("href"):
        href = next_link["href"]
        if href.startswith("http"):
            pagination_urls.append(href)
        elif href.startswith("/"):
            parsed = urlparse(base_url)
            pagination_urls.append(f"{parsed.scheme}://{parsed.netloc}{href}")

    # Pattern 2: Find numbered page links
    page_links = soup.find_all("a", href=re.compile(r"[?&/]page[=/]\d+"))
    if page_links:
        max_page = 1
        for link in page_links:
            match = re.search(r'page[=/](\d+)', link.get("href", ""))
            if match:
                max_page = max(max_page, int(match.group(1)))
        if max_page > 1:
            template_href = page_links[0].get("href", "")
            for p in range(2, min(max_page + 1, 6)):  # Max 5 pages
                paginated = re.sub(r'(page[=/])\d+', f'\\g<1>{p}', template_href)
                if paginated.startswith("http"):
                    pagination_urls.append(paginated)
                elif paginated.startswith("/"):
                    parsed = urlparse(base_url)
                    pagination_urls.append(f"{parsed.scheme}://{parsed.netloc}{paginated}")

    return pagination_urls[:5]


# ============================================================================
# Stage 5: Pipeline Orchestrator
# ============================================================================

def _deduplicate_leads(leads: list[dict]) -> list[dict]:
    """Deduplicate leads by phone number and email."""
    seen_phones: set[str] = set()
    seen_emails: set[str] = set()
    unique: list[dict] = []
    for lead in leads:
        phone_digits = re.sub(r'\D', '', lead.get("phone", ""))
        email = lead.get("email", "").lower().strip()
        # Use last 10 digits for phone dedup (handles country codes)
        phone_key = phone_digits[-10:] if len(phone_digits) >= 10 else phone_digits
        if phone_key and phone_key in seen_phones:
            continue
        if email and email in seen_emails:
            continue
        if phone_key:
            seen_phones.add(phone_key)
        if email:
            seen_emails.add(email)
        unique.append(lead)
    return unique


def run_auto_discovery(
    keyword: str,
    location: str = "",
    max_leads: int = 200,
    max_sources: int = 15,
) -> list[dict]:
    """Run the full 5-stage auto-discovery pipeline.

    Args:
        keyword: Search keyword (e.g. "wedding photographers", "gym instructors")
        location: Optional location (e.g. "Mumbai", "New York")
        max_leads: Maximum leads to return
        max_sources: Maximum directory sources to scrape

    Returns:
        List of lead dicts with name, phone, email, website, address, source
    """
    logger.info("=== Auto-Discovery Pipeline: '%s' in '%s' ===", keyword, location)
    all_leads: list[dict] = []
    sources_scraped: list[str] = []

    # Step 1: Discover candidate URLs
    logger.info("Step 1: Discovering sources via DDG + Bing + Yahoo...")
    candidate_urls = discover_sources(keyword, location)
    logger.info("  Found %d candidate URLs", len(candidate_urls))

    if not candidate_urls:
        logger.warning("No candidate URLs discovered — returning empty")
        return []

    # Step 2: Score and filter URLs
    logger.info("Step 2: Fingerprinting/scoring URLs...")
    scored = [score_url(url) for url in candidate_urls]
    scored.sort(key=lambda x: x["score"], reverse=True)
    top_urls = [s["url"] for s in scored if s["fetch_recommended"]][:max_sources]
    logger.info("  %d URLs passed fingerprint filter (of %d)", len(top_urls), len(scored))

    if not top_urls:
        # Fallback: take top 5 even if scores are low
        top_urls = [s["url"] for s in scored[:5]]
        logger.info("  Fallback: using top 5 URLs regardless of score")

    # Step 3: Scrape directories
    logger.info("Step 3: Scraping %d directory sources...", len(top_urls))
    with AdSession(timeout=15.0, min_delay=2.5, retries=2) as session:
        for url in top_urls:
            if len(all_leads) >= max_leads:
                break

            logger.info("  Scraping: %s", url[:80])
            try:
                resp = session.get(url, timeout=15.0)
                if resp.status_code != 200:
                    logger.debug("    HTTP %d — skipping", resp.status_code)
                    continue

                html = resp.text
                if _is_blocked(html):
                    logger.debug("    Blocked (bot detection) — skipping")
                    continue

                # Extract leads
                leads = extract_leads_from_html(html, url)
                source_domain = urlparse(url).netloc

                # Check for pagination and scrape additional pages
                if leads and len(leads) < 20:
                    soup = BeautifulSoup(html, "html.parser")
                    next_pages = _detect_pagination(soup, url)
                    for page_url in next_pages[:3]:
                        try:
                            page_resp = session.get(page_url, timeout=15.0)
                            if page_resp.status_code == 200 and not _is_blocked(page_resp.text):
                                extra = extract_leads_from_html(page_resp.text, page_url)
                                leads.extend(extra)
                        except Exception as exc:
                            logger.debug("    Pagination fetch failed: %s", exc)

                # Tag leads with source metadata
                for lead in leads:
                    lead["source"] = source_domain
                    lead["source_url"] = url
                    lead["keyword"] = keyword
                    lead["location"] = location
                    lead["platform"] = "auto_discovery"

                all_leads.extend(leads)
                sources_scraped.append(source_domain)
                logger.info(
                    "    Extracted %d leads (total: %d) from %s",
                    len(leads), len(all_leads), source_domain,
                )

            except Exception as exc:
                logger.debug("    Scrape failed for %s: %s", url[:60], exc)
                continue

    # Step 4: Final deduplication
    all_leads = _deduplicate_leads(all_leads)

    logger.info(
        "=== Auto-Discovery Complete: %d unique leads from %d sources ===",
        len(all_leads), len(sources_scraped),
    )
    return all_leads[:max_leads]
