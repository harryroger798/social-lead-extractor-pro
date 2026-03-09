"""YellowPages + Yelp scraper — 100% free, no API keys needed.
Uses Google Dorking to find business listings from these directories.
"""
import asyncio
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# Email/phone regex patterns
EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
PHONE_RE = re.compile(r'[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,15}')


async def scrape_yellowpages(
    query: str,
    location: str = "",
    max_results: int = 50,
    delay: float = 3.0,
) -> list[dict]:
    """
    Scrape YellowPages listings via Google Dorking.
    Returns list of lead dicts with business info.
    """
    leads: list[dict] = []

    try:
        from app.services.google_dorking import dorking_search_multi

        search_query = f"{query} {location}".strip()
        # Use site-specific dorking to target YellowPages
        dork_keywords = [
            f'site:yellowpages.com "{search_query}"',
            f'site:yellowpages.com {query} {location} phone email',
        ]

        results = await dorking_search_multi(
            keywords=dork_keywords,
            platforms=["yellowpages"],
            pages=min(max_results // 10, 5),
            delay=delay,
            use_patchright=True,
            headless=True,
        )

        for result in results:
            for email in result.get("emails", []):
                leads.append({
                    "email": email,
                    "phone": "",
                    "name": "",
                    "platform": "yellowpages",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "business_directory",
                })
            for phone in result.get("phones", []):
                leads.append({
                    "email": "",
                    "phone": phone,
                    "name": "",
                    "platform": "yellowpages",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "business_directory",
                })

    except Exception as e:
        logger.warning("YellowPages scraping failed: %s", e)

    return leads[:max_results]


async def scrape_yelp(
    query: str,
    location: str = "",
    max_results: int = 50,
    delay: float = 3.0,
) -> list[dict]:
    """
    Scrape Yelp listings via Google Dorking.
    Returns list of lead dicts with business info.
    """
    leads: list[dict] = []

    try:
        from app.services.google_dorking import dorking_search_multi

        search_query = f"{query} {location}".strip()
        dork_keywords = [
            f'site:yelp.com "{search_query}"',
            f'site:yelp.com {query} {location} phone email',
        ]

        results = await dorking_search_multi(
            keywords=dork_keywords,
            platforms=["yelp"],
            pages=min(max_results // 10, 5),
            delay=delay,
            use_patchright=True,
            headless=True,
        )

        for result in results:
            for email in result.get("emails", []):
                leads.append({
                    "email": email,
                    "phone": "",
                    "name": "",
                    "platform": "yelp",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "business_directory",
                })
            for phone in result.get("phones", []):
                leads.append({
                    "email": "",
                    "phone": phone,
                    "name": "",
                    "platform": "yelp",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "business_directory",
                })

    except Exception as e:
        logger.warning("Yelp scraping failed: %s", e)

    return leads[:max_results]


async def scrape_directories(
    query: str,
    location: str = "",
    sources: list[str] | None = None,
    max_results: int = 100,
    delay: float = 3.0,
) -> list[dict]:
    """Scrape multiple business directories. Returns combined leads."""
    if sources is None:
        sources = ["yellowpages", "yelp"]

    all_leads: list[dict] = []
    per_source = max_results // len(sources)

    for source in sources:
        if source == "yellowpages":
            results = await scrape_yellowpages(query, location, per_source, delay)
            all_leads.extend(results)
        elif source == "yelp":
            results = await scrape_yelp(query, location, per_source, delay)
            all_leads.extend(results)

        if len(sources) > 1:
            await asyncio.sleep(delay)

    return all_leads[:max_results]
