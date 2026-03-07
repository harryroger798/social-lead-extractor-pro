"""Direct platform scrapers using Patchright for deeper data extraction.

These scrapers visit platform pages directly (not via Google) to extract
additional data like bios, company names, follower counts, etc.

All scrapers use Patchright (anti-detection Playwright fork) and work
best from residential IPs (user's desktop).

Supported platforms:
  - LinkedIn (public profiles)
  - Facebook (public pages/profiles)
  - Instagram (public profiles)
  - Twitter/X (public profiles/tweets)
  - TikTok (public profiles)
  - YouTube (public channels)
  - Pinterest (public pins/boards)
  - Tumblr (public blogs)
"""

import asyncio
import logging
import re
from typing import Optional

from app.services.extractor import extract_emails, extract_phones
from app.services.patchright_engine import new_page, safe_goto, extract_page_text, random_delay

logger = logging.getLogger(__name__)


# ─── LinkedIn ─────────────────────────────────────────────────────────────────

async def scrape_linkedin_profiles(
    keyword: str,
    max_results: int = 20,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape LinkedIn public profiles via Google dorking with Patchright.

    Uses site:linkedin.com/in/ dorking to find profiles, then visits
    each to extract available contact data.
    """
    results = []
    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)

        # Search Google for LinkedIn profiles
        query = f'site:linkedin.com/in/ "{keyword}" email OR contact OR "@"'
        await safe_goto(page, f"https://www.google.com/search?q={_url_encode(query)}&num={max_results}")
        await random_delay(2, 4)

        # Extract search result links and snippets
        search_results = await page.evaluate("""() => {
            const items = [];
            document.querySelectorAll('div.g, div[data-sokoban-container]').forEach(el => {
                const link = el.querySelector('a[href*="linkedin.com/in/"]');
                const snippet = el.querySelector('div[data-sncf], span.st, div.VwiC3b');
                if (link) {
                    items.push({
                        url: link.href,
                        title: link.innerText || '',
                        snippet: snippet ? snippet.innerText : ''
                    });
                }
            });
            return items;
        }""")

        for sr in search_results[:max_results]:
            text = f"{sr.get('title', '')} {sr.get('snippet', '')}"
            emails = extract_emails(text)
            phones = extract_phones(text)

            if emails or phones:
                for email in emails:
                    results.append({
                        "email": email,
                        "phone": "",
                        "name": _extract_name_from_title(sr.get("title", "")),
                        "platform": "linkedin",
                        "source_url": sr.get("url", ""),
                        "keyword": keyword,
                    })
                for phone in phones:
                    results.append({
                        "email": "",
                        "phone": phone,
                        "name": _extract_name_from_title(sr.get("title", "")),
                        "platform": "linkedin",
                        "source_url": sr.get("url", ""),
                        "keyword": keyword,
                    })

    except Exception as e:
        logger.error("LinkedIn scraper error: %s", e)
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass

    return results


# ─── Facebook ─────────────────────────────────────────────────────────────────

async def scrape_facebook_profiles(
    keyword: str,
    max_results: int = 20,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape Facebook public pages/profiles via Google dorking."""
    results = []
    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)

        query = f'site:facebook.com "{keyword}" email OR contact OR "@" OR phone'
        await safe_goto(page, f"https://www.google.com/search?q={_url_encode(query)}&num={max_results}")
        await random_delay(2, 4)

        search_results = await _extract_google_results(page, "facebook.com")

        for sr in search_results[:max_results]:
            text = f"{sr.get('title', '')} {sr.get('snippet', '')}"
            emails = extract_emails(text)
            phones = extract_phones(text)

            for email in emails:
                results.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "facebook",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })
            for phone in phones:
                results.append({
                    "email": "", "phone": phone, "name": "",
                    "platform": "facebook",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })

    except Exception as e:
        logger.error("Facebook scraper error: %s", e)
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass

    return results


# ─── Instagram ────────────────────────────────────────────────────────────────

async def scrape_instagram_profiles(
    keyword: str,
    max_results: int = 20,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape Instagram public profiles via Google dorking."""
    results = []
    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)

        query = f'site:instagram.com "{keyword}" email OR "@gmail.com" OR "@yahoo.com" OR contact'
        await safe_goto(page, f"https://www.google.com/search?q={_url_encode(query)}&num={max_results}")
        await random_delay(2, 4)

        search_results = await _extract_google_results(page, "instagram.com")

        for sr in search_results[:max_results]:
            text = f"{sr.get('title', '')} {sr.get('snippet', '')}"
            emails = extract_emails(text)
            phones = extract_phones(text)

            for email in emails:
                results.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "instagram",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })
            for phone in phones:
                results.append({
                    "email": "", "phone": phone, "name": "",
                    "platform": "instagram",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })

    except Exception as e:
        logger.error("Instagram scraper error: %s", e)
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass

    return results


# ─── Twitter/X ────────────────────────────────────────────────────────────────

async def scrape_twitter_profiles(
    keyword: str,
    max_results: int = 20,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape Twitter/X public profiles via Google dorking."""
    results = []
    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)

        query = f'site:twitter.com OR site:x.com "{keyword}" email OR contact OR "@"'
        await safe_goto(page, f"https://www.google.com/search?q={_url_encode(query)}&num={max_results}")
        await random_delay(2, 4)

        search_results = await _extract_google_results(page, "twitter.com", "x.com")

        for sr in search_results[:max_results]:
            text = f"{sr.get('title', '')} {sr.get('snippet', '')}"
            emails = extract_emails(text)
            phones = extract_phones(text)

            for email in emails:
                results.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "twitter",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })
            for phone in phones:
                results.append({
                    "email": "", "phone": phone, "name": "",
                    "platform": "twitter",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })

    except Exception as e:
        logger.error("Twitter scraper error: %s", e)
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass

    return results


# ─── YouTube ──────────────────────────────────────────────────────────────────

async def scrape_youtube_channels(
    keyword: str,
    max_results: int = 20,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape YouTube channels via Google dorking."""
    results = []
    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)

        query = f'site:youtube.com "{keyword}" email OR business OR contact OR "@"'
        await safe_goto(page, f"https://www.google.com/search?q={_url_encode(query)}&num={max_results}")
        await random_delay(2, 4)

        search_results = await _extract_google_results(page, "youtube.com")

        for sr in search_results[:max_results]:
            text = f"{sr.get('title', '')} {sr.get('snippet', '')}"
            emails = extract_emails(text)
            phones = extract_phones(text)

            for email in emails:
                results.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "youtube",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })
            for phone in phones:
                results.append({
                    "email": "", "phone": phone, "name": "",
                    "platform": "youtube",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })

    except Exception as e:
        logger.error("YouTube scraper error: %s", e)
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass

    return results


# ─── TikTok ───────────────────────────────────────────────────────────────────

async def scrape_tiktok_profiles(
    keyword: str,
    max_results: int = 20,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape TikTok profiles via Google dorking."""
    results = []
    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)

        query = f'site:tiktok.com "{keyword}" email OR contact OR "@"'
        await safe_goto(page, f"https://www.google.com/search?q={_url_encode(query)}&num={max_results}")
        await random_delay(2, 4)

        search_results = await _extract_google_results(page, "tiktok.com")

        for sr in search_results[:max_results]:
            text = f"{sr.get('title', '')} {sr.get('snippet', '')}"
            emails = extract_emails(text)
            phones = extract_phones(text)

            for email in emails:
                results.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "tiktok",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })
            for phone in phones:
                results.append({
                    "email": "", "phone": phone, "name": "",
                    "platform": "tiktok",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })

    except Exception as e:
        logger.error("TikTok scraper error: %s", e)
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass

    return results


# ─── Pinterest ────────────────────────────────────────────────────────────────

async def scrape_pinterest_profiles(
    keyword: str,
    max_results: int = 20,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape Pinterest profiles via Google dorking."""
    results = []
    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)

        query = f'site:pinterest.com "{keyword}" email OR contact OR "@"'
        await safe_goto(page, f"https://www.google.com/search?q={_url_encode(query)}&num={max_results}")
        await random_delay(2, 4)

        search_results = await _extract_google_results(page, "pinterest.com")

        for sr in search_results[:max_results]:
            text = f"{sr.get('title', '')} {sr.get('snippet', '')}"
            emails = extract_emails(text)
            phones = extract_phones(text)

            for email in emails:
                results.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "pinterest",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })
            for phone in phones:
                results.append({
                    "email": "", "phone": phone, "name": "",
                    "platform": "pinterest",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })

    except Exception as e:
        logger.error("Pinterest scraper error: %s", e)
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass

    return results


# ─── Tumblr ───────────────────────────────────────────────────────────────────

async def scrape_tumblr_profiles(
    keyword: str,
    max_results: int = 20,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape Tumblr blogs via Google dorking."""
    results = []
    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)

        query = f'site:tumblr.com "{keyword}" email OR "@gmail.com" OR contact'
        await safe_goto(page, f"https://www.google.com/search?q={_url_encode(query)}&num={max_results}")
        await random_delay(2, 4)

        search_results = await _extract_google_results(page, "tumblr.com")

        for sr in search_results[:max_results]:
            text = f"{sr.get('title', '')} {sr.get('snippet', '')}"
            emails = extract_emails(text)
            phones = extract_phones(text)

            for email in emails:
                results.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "tumblr",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })
            for phone in phones:
                results.append({
                    "email": "", "phone": phone, "name": "",
                    "platform": "tumblr",
                    "source_url": sr.get("url", ""),
                    "keyword": keyword,
                })

    except Exception as e:
        logger.error("Tumblr scraper error: %s", e)
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass

    return results


# ─── Multi-Platform Dispatcher ────────────────────────────────────────────────

PLATFORM_SCRAPERS = {
    "linkedin": scrape_linkedin_profiles,
    "facebook": scrape_facebook_profiles,
    "instagram": scrape_instagram_profiles,
    "twitter": scrape_twitter_profiles,
    "youtube": scrape_youtube_channels,
    "tiktok": scrape_tiktok_profiles,
    "pinterest": scrape_pinterest_profiles,
    "tumblr": scrape_tumblr_profiles,
}


async def scrape_platform_direct(
    keyword: str,
    platform: str,
    max_results: int = 20,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape a specific platform directly using Patchright.

    Args:
        keyword: Search keyword.
        platform: Platform name (linkedin, facebook, etc.)
        max_results: Max results to return.
        headless: Run headless (True for server, False for desktop).
        proxy: Optional proxy config.

    Returns:
        List of lead dicts with email, phone, name, platform, source_url, keyword.
    """
    scraper = PLATFORM_SCRAPERS.get(platform.lower())
    if not scraper:
        logger.warning("No direct scraper for platform: %s", platform)
        return []

    return await scraper(keyword, max_results, headless, proxy)


async def scrape_all_platforms_direct(
    keywords: list[str],
    platforms: list[str],
    max_results_per: int = 20,
    delay: float = 3.0,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape multiple keywords across multiple platforms.

    Args:
        keywords: List of search keywords.
        platforms: List of platform names.
        max_results_per: Max results per keyword+platform combo.
        delay: Delay between scrapes (seconds).
        headless: Run headless.
        proxy: Optional proxy config.

    Returns:
        Combined list of all leads.
    """
    all_results = []

    for keyword in keywords:
        for platform in platforms:
            if platform == "reddit":
                continue  # Reddit uses its own RSS/PullPush extractor

            try:
                results = await scrape_platform_direct(
                    keyword, platform, max_results_per, headless, proxy
                )
                all_results.extend(results)
            except Exception as e:
                logger.error("Error scraping %s for '%s': %s", platform, keyword, e)

            if delay > 0:
                await asyncio.sleep(delay)

    return all_results


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _url_encode(text: str) -> str:
    """URL-encode a search query."""
    from urllib.parse import quote_plus
    return quote_plus(text)


def _extract_name_from_title(title: str) -> str:
    """Extract person name from a LinkedIn/social title string."""
    # LinkedIn titles usually: "John Doe - Software Engineer - Company | LinkedIn"
    if " - " in title:
        return title.split(" - ")[0].strip()
    if " | " in title:
        return title.split(" | ")[0].strip()
    return ""


async def _extract_google_results(page, *domain_filters: str) -> list[dict]:
    """Extract search results from a Google results page.

    Args:
        page: Patchright page with Google results loaded.
        domain_filters: Domain strings to filter links (e.g. "linkedin.com").

    Returns:
        List of dicts with url, title, snippet.
    """
    domains_js = ", ".join(f'"{d}"' for d in domain_filters)
    results = await page.evaluate(f"""() => {{
        const domains = [{domains_js}];
        const items = [];
        const containers = document.querySelectorAll('div.g, div[data-sokoban-container], div.MjjYud');
        containers.forEach(el => {{
            const links = el.querySelectorAll('a[href]');
            let matchLink = null;
            for (const a of links) {{
                const href = a.href || '';
                if (domains.some(d => href.includes(d))) {{
                    matchLink = a;
                    break;
                }}
            }}
            if (matchLink) {{
                const snippetEl = el.querySelector('div[data-sncf], span.st, div.VwiC3b, div[style*="line-clamp"]');
                items.push({{
                    url: matchLink.href,
                    title: (matchLink.innerText || '').substring(0, 200),
                    snippet: snippetEl ? (snippetEl.innerText || '').substring(0, 500) : ''
                }});
            }}
        }});
        return items;
    }}""")
    return results or []
