"""YellowPages + Yelp scraper — 100% free, no API keys needed.

Enhanced with DIRECT HTTP scraping of YellowPages pages (not just dorking).
Extracts business names, phone numbers, addresses directly from YellowPages.

Yelp Fusion API support added as optional power-up (free tier: 5K/day).

R6 rewrite: Uses BeautifulSoup for card parsing instead of regex splitting
to fix the garbled output bug ("72812info@dentzz.comShantanu").
"""
import asyncio
import logging
import re
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from app.services.anti_detection import AdSession
from app.services.extractor import extract_emails, extract_phones

# V-R1 fix: bounded executor for YP/Yelp scraping (avoids unbounded default)
_YP_EXECUTOR = ThreadPoolExecutor(max_workers=3, thread_name_prefix="yp-scrape")

import atexit as _atexit_yp  # noqa: E402
_atexit_yp.register(_YP_EXECUTOR.shutdown, wait=False)

logger = logging.getLogger(__name__)

# Lazy-load BeautifulSoup to avoid import overhead if not used
_bs4_available = False
try:
    from bs4 import BeautifulSoup
    _bs4_available = True
except ImportError:
    logger.debug("bs4 not available — YP will use regex fallback")


def _parse_yp_page_bs4(html: str, url: str, query: str) -> list[dict]:
    """R6-B1..B5 fix: Parse one YP page using BeautifulSoup.

    Replaces regex card-splitting which caused garbled output by splitting
    on inner <div class="info"> sub-elements instead of outer card wrappers.
    """
    soup = BeautifulSoup(html, "html.parser")
    results: list[dict] = []

    # YP uses <div class="result"> wrapping <div class="v-card">
    cards = soup.select("div.result") or soup.select("div.v-card")

    if len(cards) < 3:
        logger.warning(
            "YP: only %d cards found at %s — layout may have changed",
            len(cards), url,
        )

    for card in cards:
        # R6-B2 fix: Business name via .business-name get_text
        name_tag = card.select_one(".business-name")
        name = name_tag.get_text(strip=True) if name_tag else ""

        # R6-B3 fix: Phone via .phones get_text (handles nested <a> tags)
        phone_tag = card.select_one(".phones")
        phone = phone_tag.get_text(strip=True) if phone_tag else ""

        # R6-B4 fix: Address from <p class="adr"> containing street + locality
        adr_tag = card.select_one("p.adr")
        if adr_tag:
            street = adr_tag.select_one(".street-address")
            locality = adr_tag.select_one(".locality")
            parts = [
                street.get_text(strip=True) if street else "",
                locality.get_text(strip=True) if locality else "",
            ]
            # R6-B5 fix: join with filter to avoid ", " when both empty
            full_addr = ", ".join(p for p in parts if p)
        else:
            full_addr = ""

        # R6-B9 fix: extract emails from card HTML
        card_text = str(card)
        emails = extract_emails(card_text)
        email = emails[0] if emails else ""

        if name or phone:
            results.append({
                "name": name,
                "phone": phone,
                "email": email,
                "address": full_addr,
                "platform": "yellowpages",
                "source_url": url,
                "keyword": query,
                "category": "business_directory",
            })

    return results


def _parse_yp_page_regex(html: str, url: str, query: str) -> list[dict]:
    """Fallback regex parser if BeautifulSoup is not available."""
    results: list[dict] = []
    # R6-B2 fix: improved regex to skip intermediate tags
    card_pattern = re.compile(
        r'<div[^>]+class="[^"]*\bresult\b[^"]*"[^>]*>(.*?)</div>\s*(?=<div[^>]+class="[^"]*\bresult\b|$)',
        re.DOTALL,
    )
    cards = card_pattern.findall(html)

    for card_html in cards:
        name_m = re.search(
            r'class="business-name\b[^"]*"[^>]*>\s*(?:<[^>]+>)*([^<]+)',
            card_html,
        )
        # R6-B3 fix: skip optional child tag for phone
        phone_m = re.search(
            r'class="phones\b[^"]*"[^>]*>(?:<[^>]+>)?([^<]+)',
            card_html,
        )
        # R6-B4 fix: parse full adr block
        adr_m = re.search(
            r'class="adr"[^>]*>(.*?)</p>', card_html, re.DOTALL,
        )
        if adr_m:
            adr_text = re.sub(r'<[^>]+>', ' ', adr_m.group(1)).strip()
            adr_text = re.sub(r'\s+', ' ', adr_text)
        else:
            adr_text = ""

        name = name_m.group(1).strip() if name_m else ""
        phone = phone_m.group(1).strip() if phone_m else ""

        # R6-B9 fix: extract emails from card
        emails = extract_emails(card_html)
        email = emails[0] if emails else ""

        if name or phone:
            results.append({
                "name": name,
                "phone": phone,
                "email": email,
                "address": adr_text,
                "platform": "yellowpages",
                "source_url": url,
                "keyword": query,
                "category": "business_directory",
            })

    return results


async def scrape_yellowpages_direct(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Scrape YellowPages via DIRECT HTTP — 30 businesses per page with phones.

    R6 rewrite: Uses BeautifulSoup for reliable card parsing.
    Falls back to improved regex if bs4 is not installed.
    """
    leads: list[dict] = []
    loop = asyncio.get_running_loop()

    try:
        def _fetch_yp() -> list[dict]:
            results: list[dict] = []
            search_terms = query.replace(" ", "+")
            geo = location.replace(" ", "+") if location else "United+States"
            pages_to_fetch = min((max_results // 30) + 1, 3)
            # R6-B6 fix: warn if max_results > 90 (3 pages × 30)
            if max_results > 90:
                logger.warning("YP direct: capped at 90 results (3 pages)")

            # R6-B7 fix: add Referer, Accept-Language, cookie persistence
            with AdSession(timeout=15.0, min_delay=2.0) as ad_session:
                for page_num in range(1, pages_to_fetch + 1):
                    url = (
                        f"https://www.yellowpages.com/search?"
                        f"search_terms={search_terms}&geo_location_terms={geo}"
                    )
                    if page_num > 1:
                        url += f"&page={page_num}"

                    try:
                        resp = ad_session.get(
                            url,
                            headers={
                                "Referer": "https://www.yellowpages.com/",
                                "Accept-Language": "en-US,en;q=0.9",
                            },
                        )
                        if resp.status_code != 200:
                            logger.debug("YP page %d: HTTP %d", page_num, resp.status_code)
                            continue

                        html = resp.text

                        # R6-B1 fix: use BeautifulSoup if available
                        if _bs4_available:
                            page_results = _parse_yp_page_bs4(html, url, query)
                        else:
                            page_results = _parse_yp_page_regex(html, url, query)

                        # R6-B8 fix: sanity check card count
                        if len(page_results) < 3:
                            logger.warning(
                                "YP page %d: only %d cards — selector may be wrong",
                                page_num, len(page_results),
                            )

                        results.extend(page_results)

                    except Exception as e:
                        logger.warning("YP direct page %d error: %s", page_num, e)

            return results

        # V-R1 fix: use bounded executor instead of default
        leads = await loop.run_in_executor(_YP_EXECUTOR, _fetch_yp)
    except Exception as e:
        logger.warning("YellowPages direct scraping failed: %s", e)

    return leads[:max_results]


async def scrape_yellowpages(
    query: str, location: str = "", max_results: int = 50, delay: float = 3.0,
) -> list[dict]:
    """Scrape YellowPages — tries direct HTTP first, falls back to dorking."""
    leads = await scrape_yellowpages_direct(query, location, max_results)
    if leads:
        logger.info("YP direct: got %d leads for '%s'", len(leads), query)
        return leads

    # R6-B11 fix: dorking fallback emits one lead per result (not per email/phone)
    logger.info("YP direct returned 0, falling back to dorking for '%s'", query)
    try:
        from app.services.multi_engine_search import free_search_waterfall
        search_query = f"{query} {location}".strip()
        dork_queries = [
            f'site:yellowpages.com "{search_query}"',
            f'site:yellowpages.com "{query}" "{location}" phone',
        ]
        # V-R3 fix: dedup across dork queries to prevent duplicate leads
        seen_urls: set[str] = set()
        for dork in dork_queries:
            results = free_search_waterfall(dork, num_results=15, min_results=2)
            for r in results:
                link = r.get("link", "")
                if link and link in seen_urls:
                    continue
                if link:
                    seen_urls.add(link)
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                emails_found = extract_emails(text)
                phones_found = extract_phones(text)
                # R6-B11 fix: emit one unified lead per result
                leads.append({
                    "email": emails_found[0] if emails_found else "",
                    "phone": phones_found[0] if phones_found else "",
                    "name": r.get("title", ""),
                    "platform": "yellowpages",
                    "source_url": link,
                    "keyword": query, "category": "business_directory",
                })
    except Exception as e:
        logger.warning("YellowPages dorking fallback failed: %s", e)

    return leads[:max_results]


async def scrape_yelp_fusion(
    query: str, location: str = "", max_results: int = 50, api_key: str = "",
) -> list[dict]:
    """Scrape Yelp via Fusion API (free tier: 5,000 calls/day).
    Requires free Yelp Fusion API key. Set in Settings as 'yelp_api_key'.
    """
    if not api_key:
        return []

    leads: list[dict] = []
    loop = asyncio.get_running_loop()

    try:
        def _fetch_yelp() -> list[dict]:
            results: list[dict] = []
            url = "https://api.yelp.com/v3/businesses/search"
            params = {
                "term": query, "location": location or "United States",
                "limit": min(max_results, 50), "sort_by": "best_match",
            }
            headers = {"Authorization": f"Bearer {api_key}", "Accept": "application/json"}
            try:
                # R3-1 fix: use AdSession for SSRF protection + retries
                # rate_limit=False because Yelp handles its own 5K/day quota
                with AdSession(timeout=15.0, rate_limit=False) as ad_sess:
                    resp = ad_sess.get(url, params=params, headers=headers)
                if resp.status_code != 200:
                    logger.debug("Yelp API returned %d", resp.status_code)
                    return []
                data = resp.json()
                for biz in data.get("businesses", []):
                    name = biz.get("name", "")
                    phone = biz.get("display_phone", "") or biz.get("phone", "")
                    addr_parts = biz.get("location", {}).get("display_address", [])
                    address = ", ".join(addr_parts) if addr_parts else ""
                    website = biz.get("url", "")
                    categories = ", ".join(c.get("title", "") for c in biz.get("categories", []))
                    if name and (phone or address):
                        results.append({
                            "name": name, "phone": phone, "email": "",
                            "address": address, "platform": "yelp",
                            "source_url": website, "keyword": query,
                            "category": categories or "business_directory",
                        })
            except Exception as e:
                logger.debug("Yelp API error: %s", e)
            return results

        # V-R1 fix: use bounded executor instead of default
        leads = await loop.run_in_executor(_YP_EXECUTOR, _fetch_yelp)
    except Exception as e:
        logger.warning("Yelp Fusion API failed: %s", e)

    return leads[:max_results]


async def scrape_yelp(
    query: str, location: str = "", max_results: int = 50,
    delay: float = 3.0, api_key: str = "",
) -> list[dict]:
    """Scrape Yelp — tries Fusion API first, falls back to dorking."""
    if api_key:
        leads = await scrape_yelp_fusion(query, location, max_results, api_key)
        if leads:
            logger.info("Yelp Fusion: got %d leads for '%s'", len(leads), query)
            return leads

    # R6-B11 fix: dorking fallback emits one lead per result
    leads: list[dict] = []
    try:
        from app.services.multi_engine_search import free_search_waterfall
        search_query = f"{query} {location}".strip()
        dork_queries = [
            f'site:yelp.com "{search_query}"',
            f'site:yelp.com "{query}" "{location}" business',
        ]
        # V-R3 fix: dedup across dork queries to prevent duplicate leads
        seen_urls: set[str] = set()
        for dork in dork_queries:
            results = free_search_waterfall(dork, num_results=15, min_results=2)
            for r in results:
                link = r.get("link", "")
                if link and link in seen_urls:
                    continue
                if link:
                    seen_urls.add(link)
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                emails_found = extract_emails(text)
                phones_found = extract_phones(text)
                leads.append({
                    "email": emails_found[0] if emails_found else "",
                    "phone": phones_found[0] if phones_found else "",
                    "name": r.get("title", ""),
                    "platform": "yelp",
                    "source_url": link,
                    "keyword": query, "category": "business_directory",
                })
    except Exception as e:
        logger.warning("Yelp scraping failed: %s", e)

    return leads[:max_results]


async def scrape_directories(
    query: str, location: str = "", sources: list[str] | None = None,
    max_results: int = 100, delay: float = 3.0, yelp_api_key: str = "",
) -> list[dict]:
    """Scrape multiple business directories. Returns combined leads."""
    if not sources:
        sources = ["yellowpages", "yelp"]

    all_leads: list[dict] = []
    # R6-B13 fix: use full max_results per source, let final slice deduplicate
    per_source = max_results

    for source in sources:
        if source == "yellowpages":
            results = await scrape_yellowpages(query, location, per_source, delay)
            all_leads.extend(results)
        elif source == "yelp":
            results = await scrape_yelp(query, location, per_source, delay, yelp_api_key)
            all_leads.extend(results)
        if len(sources) > 1:
            await asyncio.sleep(delay)

    return all_leads[:max_results]
