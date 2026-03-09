"""Indeed + Glassdoor Job Scraper — Find hiring companies.
Hiring companies = spending money = warm leads.
100% free, uses Google Dorking.
"""
import asyncio
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)


async def scrape_indeed(
    query: str,
    location: str = "",
    max_results: int = 50,
    delay: float = 3.0,
) -> list[dict]:
    """
    Scrape Indeed job listings via Google Dorking.
    Hiring companies are warm leads because they're spending money.
    """
    leads: list[dict] = []

    try:
        from app.services.google_dorking import dorking_search_multi

        search_query = f"{query} {location}".strip()
        dork_keywords = [
            f'site:indeed.com "{search_query}" hiring email',
            f'site:indeed.com {query} {location} "apply" contact',
        ]

        results = await dorking_search_multi(
            keywords=dork_keywords,
            platforms=["indeed"],
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
                    "platform": "indeed",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "hiring_company",
                })
            for phone in result.get("phones", []):
                leads.append({
                    "email": "",
                    "phone": phone,
                    "name": "",
                    "platform": "indeed",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "hiring_company",
                })

    except Exception as e:
        logger.warning("Indeed scraping failed: %s", e)

    return leads[:max_results]


async def scrape_glassdoor(
    query: str,
    location: str = "",
    max_results: int = 50,
    delay: float = 3.0,
) -> list[dict]:
    """Scrape Glassdoor job listings via Google Dorking."""
    leads: list[dict] = []

    try:
        from app.services.google_dorking import dorking_search_multi

        search_query = f"{query} {location}".strip()
        dork_keywords = [
            f'site:glassdoor.com "{search_query}" hiring',
            f'site:glassdoor.com {query} {location} jobs email',
        ]

        results = await dorking_search_multi(
            keywords=dork_keywords,
            platforms=["glassdoor"],
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
                    "platform": "glassdoor",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "hiring_company",
                })
            for phone in result.get("phones", []):
                leads.append({
                    "email": "",
                    "phone": phone,
                    "name": "",
                    "platform": "glassdoor",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "hiring_company",
                })

    except Exception as e:
        logger.warning("Glassdoor scraping failed: %s", e)

    return leads[:max_results]


async def scrape_craigslist(
    query: str,
    location: str = "",
    max_results: int = 50,
    delay: float = 3.0,
) -> list[dict]:
    """Scrape Craigslist listings via Google Dorking."""
    leads: list[dict] = []

    try:
        from app.services.google_dorking import dorking_search_multi

        search_query = f"{query} {location}".strip()
        dork_keywords = [
            f'site:craigslist.org "{search_query}" email',
            f'site:craigslist.org {query} contact phone',
        ]

        results = await dorking_search_multi(
            keywords=dork_keywords,
            platforms=["craigslist"],
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
                    "platform": "craigslist",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "classifieds",
                })
            for phone in result.get("phones", []):
                leads.append({
                    "email": "",
                    "phone": phone,
                    "name": "",
                    "platform": "craigslist",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "classifieds",
                })

    except Exception as e:
        logger.warning("Craigslist scraping failed: %s", e)

    return leads[:max_results]


async def scrape_olx(
    query: str,
    location: str = "",
    max_results: int = 50,
    delay: float = 3.0,
) -> list[dict]:
    """Scrape OLX listings via Google Dorking."""
    leads: list[dict] = []

    try:
        from app.services.google_dorking import dorking_search_multi

        search_query = f"{query} {location}".strip()
        dork_keywords = [
            f'site:olx.in "{search_query}" phone',
            f'site:olx.com {query} contact email',
        ]

        results = await dorking_search_multi(
            keywords=dork_keywords,
            platforms=["olx"],
            pages=min(max_results // 10, 3),
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
                    "platform": "olx",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "classifieds",
                })
            for phone in result.get("phones", []):
                leads.append({
                    "email": "",
                    "phone": phone,
                    "name": "",
                    "platform": "olx",
                    "source_url": result.get("sources", [""])[0],
                    "keyword": query,
                    "category": "classifieds",
                })

    except Exception as e:
        logger.warning("OLX scraping failed: %s", e)

    return leads[:max_results]


async def scrape_job_boards(
    query: str,
    location: str = "",
    sources: list[str] | None = None,
    max_results: int = 100,
    delay: float = 3.0,
) -> list[dict]:
    """Scrape multiple job boards and classifieds. Returns combined leads."""
    if sources is None:
        sources = ["indeed", "glassdoor"]

    all_leads: list[dict] = []
    per_source = max_results // len(sources)

    for source in sources:
        if source == "indeed":
            results = await scrape_indeed(query, location, per_source, delay)
            all_leads.extend(results)
        elif source == "glassdoor":
            results = await scrape_glassdoor(query, location, per_source, delay)
            all_leads.extend(results)
        elif source == "craigslist":
            results = await scrape_craigslist(query, location, per_source, delay)
            all_leads.extend(results)
        elif source == "olx":
            results = await scrape_olx(query, location, per_source, delay)
            all_leads.extend(results)

        if len(sources) > 1:
            await asyncio.sleep(delay)

    return all_leads[:max_results]
