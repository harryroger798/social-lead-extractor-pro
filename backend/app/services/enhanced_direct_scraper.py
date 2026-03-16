"""Enhanced Direct Scraper v3.5.32 — Smart routing for directory scraping.

Uses a two-tier approach:
  Tier 1 (curl_cffi — parallel): For static/SSR directory sites that don't
      need JavaScript rendering.  Fast, low resource, can run 5-10 in parallel.
  Tier 2 (Patchright — sequential): For JS-heavy SPAs (React/Angular sites)
      that require full browser rendering.

The router decides which tier to use based on domain heuristics.
"""

from __future__ import annotations

import asyncio
import logging
import re
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
from urllib.parse import urlparse

from bs4 import BeautifulSoup

from app.services.anti_detection import AdSession
from app.services.auto_discovery import extract_leads_from_html, _is_blocked
from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

# ── v3.5.33 Fix #5: Location-aware directory URL builder ───────────────────
# Instead of relying solely on dorking to find directory pages, we
# pre-build URLs for known directory sites that have predictable URL
# patterns. This guarantees at least some location-relevant results
# even when search engines return nothing.

_DIRECTORY_URL_TEMPLATES: dict[str, list[str]] = {
    # Indian directories
    "justdial.com": [
        "https://www.justdial.com/{location}/{keyword}",
        "https://www.justdial.com/{location}/{keyword}-near-me",
    ],
    "sulekha.com": [
        "https://www.sulekha.com/{keyword}/{location}",
    ],
    "indiamart.com": [
        "https://dir.indiamart.com/{keyword}/{location}.html",
    ],
    # International directories
    "yellowpages.com": [
        "https://www.yellowpages.com/{location}/{keyword}",
    ],
    "yelp.com": [
        "https://www.yelp.com/search?find_desc={keyword}&find_loc={location}",
    ],
    # Niche directories
    "clutch.co": [
        "https://clutch.co/directory?q={keyword}&location={location}",
    ],
    "bark.com": [
        "https://www.bark.com/{location}/{keyword}",
    ],
}


def build_location_aware_urls(
    keyword: str,
    location: str,
    max_urls: int = 15,
) -> list[str]:
    """v3.5.33 Fix #5: Build directory URLs with location baked in.

    For known directory sites with predictable URL patterns, we can
    construct direct URLs instead of relying on search engines.

    Args:
        keyword: Business type (e.g. "Interior Designers").
        location: City/region (e.g. "Kolkata").
        max_urls: Max URLs to return.

    Returns:
        List of fully-formed directory URLs.
    """
    if not keyword or not location:
        return []

    kw_slug = keyword.lower().strip().replace(" ", "-")
    loc_slug = location.lower().strip().replace(" ", "-")
    # URL-encoded versions for query-string based sites
    kw_enc = keyword.strip().replace(" ", "+")
    loc_enc = location.strip().replace(" ", "+")

    urls: list[str] = []
    for _domain, templates in _DIRECTORY_URL_TEMPLATES.items():
        for tmpl in templates:
            url = tmpl.replace("{keyword}", kw_slug).replace("{location}", loc_slug)
            # Some sites use query strings with spaces as +
            url = url.replace(kw_slug, kw_enc) if "?" in tmpl else url
            url = url.replace(loc_slug, loc_enc) if "?" in tmpl else url
            urls.append(url)

    logger.info(
        "Built %d location-aware directory URLs for '%s' in '%s'",
        len(urls), keyword, location,
    )
    return urls[:max_urls]

# Thread pool for parallel curl_cffi requests (I/O bound)
_CURL_POOL = ThreadPoolExecutor(max_workers=5, thread_name_prefix="curl_scraper")

# ---------------------------------------------------------------------------
# Domain classification — which tier to use
# ---------------------------------------------------------------------------

# Sites that work fine with curl_cffi (server-rendered HTML)
_CURL_FRIENDLY_DOMAINS = {
    "justdial.com", "sulekha.com", "indiamart.com", "tradeindia.com",
    "yellowpages.com", "hotfrog.com", "cybo.com", "brownbook.net",
    "mouthshut.com", "asklaila.com", "fundoodata.com",
    "healthgrades.com", "vitals.com", "zocdoc.com",
    "thomasnet.com", "kompass.com", "europages.com",
    "infobel.com", "yelu.com", "tuugo.com",
}

# Sites that REQUIRE JavaScript rendering (SPAs, React/Angular)
_JS_REQUIRED_DOMAINS = {
    "yelp.com", "practo.com", "lybrate.com",
    "linkedin.com", "facebook.com", "instagram.com",
    "zomato.com", "swiggy.com",
}


def _classify_url(url: str) -> str:
    """Classify a URL into 'curl' or 'patchright' tier.

    Returns:
        'curl' for static sites, 'patchright' for JS-heavy sites.
    """
    domain = urlparse(url).netloc.lower()
    for pattern in _JS_REQUIRED_DOMAINS:
        if pattern in domain:
            return "patchright"
    for pattern in _CURL_FRIENDLY_DOMAINS:
        if pattern in domain:
            return "curl"
    # Default: try curl first (faster, less resource-intensive)
    return "curl"


# ---------------------------------------------------------------------------
# Tier 1: curl_cffi parallel scraping
# ---------------------------------------------------------------------------

def _scrape_url_sync(url: str, keyword: str, location: str) -> list[dict]:
    """Synchronously scrape a single URL using curl_cffi (for thread pool).

    Returns list of lead dicts extracted from the page.
    """
    try:
        with AdSession(timeout=15.0, min_delay=2.0, retries=1) as session:
            resp = session.get(url, timeout=15.0)
            if resp.status_code != 200:
                logger.debug("HTTP %d from %s", resp.status_code, url[:60])
                return []

            html = resp.text
            if _is_blocked(html):
                logger.debug("Blocked by bot detection: %s", url[:60])
                return []

            leads = extract_leads_from_html(html, url)
            source_domain = urlparse(url).netloc

            # Tag leads with metadata
            for lead in leads:
                lead["source"] = source_domain
                lead["source_url"] = url
                lead["keyword"] = keyword
                lead["location"] = location
                lead["platform"] = "enhanced_direct"

            logger.info(
                "curl_cffi: %d leads from %s", len(leads), source_domain
            )
            return leads

    except Exception as exc:
        logger.debug("curl_cffi scrape failed for %s: %s", url[:60], exc)
        return []


async def _scrape_urls_parallel(
    urls: list[str],
    keyword: str,
    location: str,
) -> list[dict]:
    """Scrape multiple URLs in parallel using curl_cffi thread pool."""
    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(_CURL_POOL, _scrape_url_sync, url, keyword, location)
        for url in urls
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    all_leads: list[dict] = []
    for result in results:
        if isinstance(result, list):
            all_leads.extend(result)
        elif isinstance(result, Exception):
            logger.debug("Parallel scrape exception: %s", result)
    return all_leads


# ---------------------------------------------------------------------------
# Tier 2: Patchright sequential scraping (for JS-heavy sites)
# ---------------------------------------------------------------------------

async def _scrape_url_patchright(
    url: str,
    keyword: str,
    location: str,
    headless: bool = True,
) -> list[dict]:
    """Scrape a single URL using Patchright browser for JS rendering."""
    try:
        from app.services.patchright_engine import (
            new_page, safe_goto, extract_page_text, random_delay,
        )

        page = await new_page(headless=headless)
        try:
            await safe_goto(page, url)
            await random_delay(2, 4)

            # Get rendered HTML
            html = await page.content()
            if _is_blocked(html):
                logger.debug("Patchright: blocked at %s", url[:60])
                return []

            leads = extract_leads_from_html(html, url)
            source_domain = urlparse(url).netloc

            # Also extract from visible text (catches dynamically loaded content)
            page_text = await extract_page_text(page)
            emails = extract_emails(page_text)
            phones = extract_phones(page_text)

            # Merge text-extracted contacts with DOM-extracted leads
            existing_emails = {l.get("email", "").lower() for l in leads}
            existing_phones = {re.sub(r'\D', '', l.get("phone", "")) for l in leads}

            for email in emails:
                if email.lower() not in existing_emails:
                    leads.append({
                        "name": "", "email": email, "phone": "",
                        "source": source_domain, "source_url": url,
                        "keyword": keyword, "location": location,
                        "platform": "enhanced_direct",
                    })
                    existing_emails.add(email.lower())

            for phone in phones:
                phone_digits = re.sub(r'\D', '', phone)
                if phone_digits not in existing_phones:
                    leads.append({
                        "name": "", "email": "", "phone": phone,
                        "source": source_domain, "source_url": url,
                        "keyword": keyword, "location": location,
                        "platform": "enhanced_direct",
                    })
                    existing_phones.add(phone_digits)

            # Tag all leads
            for lead in leads:
                lead.setdefault("source", source_domain)
                lead.setdefault("source_url", url)
                lead.setdefault("keyword", keyword)
                lead.setdefault("location", location)
                lead.setdefault("platform", "enhanced_direct")

            logger.info(
                "Patchright: %d leads from %s", len(leads), source_domain
            )
            return leads

        finally:
            try:
                await page.context.close()
            except Exception:
                pass

    except ImportError:
        logger.warning("Patchright not available — skipping JS scraping for %s", url[:60])
        return []
    except Exception as exc:
        logger.debug("Patchright scrape failed for %s: %s", url[:60], exc)
        return []


# ---------------------------------------------------------------------------
# Main entry point: Smart router
# ---------------------------------------------------------------------------

async def run_enhanced_direct_scraping(
    urls: list[str],
    keyword: str,
    location: str = "",
    headless: bool = True,
    max_leads: int = 200,
) -> list[dict]:
    """Route URLs to the appropriate scraping tier and merge results.

    Args:
        urls: List of directory/listing URLs to scrape.
        keyword: Search keyword for tagging results.
        location: Location for tagging results.
        headless: Whether to run Patchright in headless mode.
        max_leads: Maximum leads to return.

    Returns:
        Deduplicated list of lead dicts.
    """
    if not urls:
        urls = []

    # v3.5.33 Fix #5: Auto-add location-aware directory URLs so we always
    # have at least some location-relevant scraping targets even when
    # dorking returns 0 URLs.
    if location:
        loc_urls = build_location_aware_urls(keyword, location)
        existing = set(urls)
        for u in loc_urls:
            if u not in existing:
                urls.append(u)
                existing.add(u)

    if not urls:
        return []

    logger.info(
        "=== Enhanced Direct Scraper: %d URLs for '%s' in '%s' ===",
        len(urls), keyword, location,
    )

    # Classify URLs into tiers
    curl_urls: list[str] = []
    patchright_urls: list[str] = []

    for url in urls:
        tier = _classify_url(url)
        if tier == "patchright":
            patchright_urls.append(url)
        else:
            curl_urls.append(url)

    logger.info(
        "  Routing: %d curl_cffi (parallel), %d Patchright (sequential)",
        len(curl_urls), len(patchright_urls),
    )

    all_leads: list[dict] = []

    # Tier 1: Parallel curl_cffi scraping (fast)
    if curl_urls:
        curl_leads = await _scrape_urls_parallel(curl_urls, keyword, location)
        all_leads.extend(curl_leads)
        logger.info("  Tier 1 (curl_cffi): %d leads from %d URLs", len(curl_leads), len(curl_urls))

    # Tier 2: Sequential Patchright scraping (slower but handles JS)
    if patchright_urls and len(all_leads) < max_leads:
        for url in patchright_urls:
            if len(all_leads) >= max_leads:
                break
            pr_leads = await _scrape_url_patchright(url, keyword, location, headless)
            all_leads.extend(pr_leads)

        logger.info(
            "  Tier 2 (Patchright): total %d leads after JS scraping",
            len(all_leads),
        )

    # Deduplicate
    seen_phones: set[str] = set()
    seen_emails: set[str] = set()
    unique: list[dict] = []
    for lead in all_leads:
        phone_digits = re.sub(r'\D', '', lead.get("phone", ""))
        email = lead.get("email", "").lower().strip()
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

    logger.info(
        "=== Enhanced Direct Scraper Complete: %d unique leads ===",
        len(unique),
    )
    return unique[:max_leads]
