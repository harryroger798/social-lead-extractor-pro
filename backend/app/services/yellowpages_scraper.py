"""YellowPages + Yelp + Superpages scraper — 100% free, no API keys needed.

Uses DIRECT HTTP scraping of YellowPages and Superpages pages.
Extracts business names, phone numbers, addresses directly from HTML.

Yelp Fusion API support added as optional power-up (free tier: 5K/day).
When no Yelp API key is available, Superpages is used as a free replacement.
"""
import asyncio
import logging
import re
import requests
from typing import Optional

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


async def scrape_yellowpages_direct(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Scrape YellowPages via DIRECT HTTP — 30 businesses per page with phones."""
    leads: list[dict] = []
    loop = asyncio.get_event_loop()

    try:
        def _fetch_yp() -> list[dict]:
            results: list[dict] = []
            search_terms = query.replace(" ", "+")
            geo = location.replace(" ", "+") if location else "United+States"
            pages_to_fetch = min((max_results // 30) + 1, 3)

            for page_num in range(1, pages_to_fetch + 1):
                url = (
                    f"https://www.yellowpages.com/search?"
                    f"search_terms={search_terms}&geo_location_terms={geo}"
                )
                if page_num > 1:
                    url += f"&page={page_num}"

                try:
                    resp = requests.get(url, headers=HEADERS, timeout=15)
                    if resp.status_code != 200:
                        continue

                    html = resp.text
                    names = re.findall(
                        r'class="business-name"[^>]*>.*?<span>([^<]+)</span>',
                        html, re.DOTALL,
                    )
                    phones = re.findall(r'class="phones[^"]*"[^>]*>([^<]+)', html)
                    addresses = re.findall(r'class="street-address"[^>]*>([^<]+)', html)
                    localities = re.findall(r'class="locality"[^>]*>([^<]+)', html)

                    count = max(len(names), len(phones))
                    for i in range(count):
                        name = names[i].strip() if i < len(names) else ""
                        phone = phones[i].strip() if i < len(phones) else ""
                        addr = addresses[i].strip() if i < len(addresses) else ""
                        city = localities[i].strip() if i < len(localities) else ""
                        full_addr = f"{addr}, {city}" if addr and city else addr or city

                        if name or phone:
                            results.append({
                                "name": name, "phone": phone, "email": "",
                                "address": full_addr, "platform": "yellowpages",
                                "source_url": url, "keyword": query,
                                "category": "business_directory",
                            })
                except Exception as e:
                    logger.debug("YP direct page %d error: %s", page_num, e)

            return results

        leads = await loop.run_in_executor(None, _fetch_yp)
    except Exception as e:
        logger.warning("YellowPages direct scraping failed: %s", e)

    return leads[:max_results]


async def scrape_yellowpages(
    query: str, location: str = "", max_results: int = 50, delay: float = 3.0,
) -> list[dict]:
    """Scrape YellowPages via direct HTTP. No dorking or browser needed."""
    leads = await scrape_yellowpages_direct(query, location, max_results)
    if leads:
        logger.info("YP direct: got %d leads for '%s'", len(leads), query)
    else:
        logger.info("YP direct returned 0 leads for '%s'", query)
    return leads


async def scrape_superpages_direct(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """Scrape Superpages via DIRECT HTTP — 30 businesses per page.

    Superpages is a sister site of YellowPages with the same data.
    Used as a free replacement for Yelp when no API key is provided.
    """
    leads: list[dict] = []
    loop = asyncio.get_event_loop()

    try:
        def _fetch_sp() -> list[dict]:
            results: list[dict] = []
            search_terms = query.replace(" ", "+")
            geo = location.replace(" ", "+") if location else "New+York%2C+NY"
            pages_to_fetch = min((max_results // 30) + 1, 3)

            for page_num in range(1, pages_to_fetch + 1):
                url = (
                    f"https://www.superpages.com/search?"
                    f"search_terms={search_terms}&geo_location_terms={geo}"
                )
                if page_num > 1:
                    url += f"&page={page_num}"

                try:
                    resp = requests.get(url, headers=HEADERS, timeout=15)
                    if resp.status_code != 200:
                        logger.debug("SP page %d returned %d", page_num, resp.status_code)
                        continue

                    html = resp.text

                    # Superpages uses business-name class for names
                    names = re.findall(
                        r'class="business-name[^"]*"[^>]*>.*?<span>([^<]+)</span>',
                        html, re.DOTALL,
                    )

                    # Superpages uses tel: links for phone numbers
                    phones = re.findall(r'tel:([0-9-]+)', html)

                    # Addresses
                    addresses = re.findall(
                        r'class="street-address"[^>]*>([^<]+)', html,
                    )
                    localities = re.findall(
                        r'class="locality"[^>]*>([^<]+)', html,
                    )

                    count = max(len(names), len(phones))
                    for i in range(count):
                        name = names[i].strip() if i < len(names) else ""
                        raw_phone = phones[i].strip() if i < len(phones) else ""
                        # Format phone from 212-941-7994 to (212) 941-7994
                        phone = raw_phone
                        phone_match = re.match(r'(\d{3})-(\d{3})-(\d{4})', raw_phone)
                        if phone_match:
                            phone = f"({phone_match.group(1)}) {phone_match.group(2)}-{phone_match.group(3)}"

                        addr = addresses[i].strip() if i < len(addresses) else ""
                        city = localities[i].strip() if i < len(localities) else ""
                        full_addr = f"{addr}, {city}" if addr and city else addr or city

                        if name or phone:
                            results.append({
                                "name": name, "phone": phone, "email": "",
                                "address": full_addr, "platform": "yelp",
                                "source_url": url, "keyword": query,
                                "category": "business_directory",
                            })
                except Exception as e:
                    logger.debug("SP direct page %d error: %s", page_num, e)

            return results

        leads = await loop.run_in_executor(None, _fetch_sp)
    except Exception as e:
        logger.warning("Superpages direct scraping failed: %s", e)

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
    loop = asyncio.get_event_loop()

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
                resp = requests.get(url, params=params, headers=headers, timeout=15)
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

        leads = await loop.run_in_executor(None, _fetch_yelp)
    except Exception as e:
        logger.warning("Yelp Fusion API failed: %s", e)

    return leads[:max_results]


async def scrape_yelp(
    query: str, location: str = "", max_results: int = 50,
    delay: float = 3.0, api_key: str = "",
) -> list[dict]:
    """Scrape Yelp — tries Fusion API first, falls back to Superpages.

    Yelp blocks direct HTTP scraping (403/CAPTCHA), so when no API key
    is available we use Superpages as a free alternative source. Results
    are tagged as platform='yelp' for consistency.
    """
    if api_key:
        leads = await scrape_yelp_fusion(query, location, max_results, api_key)
        if leads:
            logger.info("Yelp Fusion: got %d leads for '%s'", len(leads), query)
            return leads

    # Yelp blocks direct HTTP (403/CAPTCHA). Use Superpages as free replacement.
    logger.info("No Yelp API key, using Superpages as free alternative for '%s'", query)
    leads = await scrape_superpages_direct(query, location, max_results)
    if leads:
        logger.info("Superpages (Yelp replacement): got %d leads for '%s'", len(leads), query)
    else:
        logger.info("Superpages returned 0 leads for '%s'", query)
    return leads


async def scrape_directories(
    query: str, location: str = "", sources: list[str] | None = None,
    max_results: int = 100, delay: float = 3.0, yelp_api_key: str = "",
) -> list[dict]:
    """Scrape multiple business directories. Returns combined leads.

    100% free — no API keys required. Uses direct HTTP scraping of
    YellowPages and Superpages (Yelp replacement when no API key).
    """
    if sources is None:
        sources = ["yellowpages", "yelp"]

    all_leads: list[dict] = []
    per_source = max_results // len(sources)

    for source in sources:
        try:
            if source == "yellowpages":
                results = await scrape_yellowpages(query, location, per_source, delay)
                all_leads.extend(results)
            elif source == "yelp":
                results = await scrape_yelp(query, location, per_source, delay, yelp_api_key)
                all_leads.extend(results)
        except Exception as e:
            logger.warning("Directory source '%s' failed: %s", source, e)
        if len(sources) > 1:
            await asyncio.sleep(delay)

    return all_leads[:max_results]
