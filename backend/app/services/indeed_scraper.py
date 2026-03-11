"""Indeed + Glassdoor + Craigslist + OLX Job Scraper — v3.5.1.

v3.5.1: Rewritten to use free_search_waterfall + Indeed RSS instead of
Patchright-dependent Google dorking. 100% ban-free, no API keys, no browser.

Hiring companies = spending money = warm leads.
"""
import asyncio
import logging

from app.services.features import scrape_job_boards as _scrape_job_boards_sync

logger = logging.getLogger(__name__)


async def scrape_job_boards(
    query: str,
    location: str = "",
    sources: list[str] | None = None,
    max_results: int = 100,
    delay: float = 3.0,
) -> list[dict]:
    """Scrape multiple job boards and classifieds.

    v3.5.1: Delegates to features.scrape_job_boards which uses:
    - Indeed RSS feed (real job data, no API key)
    - Glassdoor dorking via free search engines
    - Craigslist dorking via free search engines
    - OLX dorking via free search engines
    - RemoteOK JSON API (public, no auth)

    All methods are 100% ban-free and use curl_cffi TLS fingerprinting.
    """
    if sources is None:
        sources = ["indeed", "glassdoor"]

    # Run synchronous scraper in thread pool to avoid blocking event loop
    loop = asyncio.get_running_loop()
    leads = await loop.run_in_executor(
        None,
        _scrape_job_boards_sync,
        query,
        location,
        max_results,
        sources,
    )

    return leads[:max_results]
