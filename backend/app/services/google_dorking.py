"""Google dorking engine — extracts emails/phones from Google search results.

Supports two methods:
  1. **Patchright** (PRIMARY, FREE): Scrapes Google search results directly
     using Patchright anti-detection browser. Zero API cost.
  2. **Serper.dev API** (FALLBACK): Uses Serper.dev REST API. Free tier
     gives 2,500 searches/month. API key loaded from DB settings.

Extraction flow:
  Patchright scrape Google -> if CAPTCHA -> try Whisper solver -> if fail -> Serper API fallback
"""

import os
import re
import asyncio
import logging
import requests
from typing import Optional

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

# Environment variable fallback (used if DB setting not available)
SERPER_API_KEY = os.environ.get("SERPER_API_KEY", "")

PLATFORM_DORK_TEMPLATES: dict[str, str] = {
    "linkedin": 'site:linkedin.com "{keyword}" "@gmail.com" OR "@yahoo.com" OR "@outlook.com"',
    "facebook": 'site:facebook.com "{keyword}" email OR contact OR "@"',
    "instagram": 'site:instagram.com "{keyword}" email OR "@gmail.com"',
    "twitter": 'site:twitter.com OR site:x.com "{keyword}" email OR contact',
    "youtube": 'site:youtube.com "{keyword}" email OR business OR contact',
    "pinterest": 'site:pinterest.com "{keyword}" email OR contact',
    "tumblr": 'site:tumblr.com "{keyword}" email OR "@gmail.com"',
    "tiktok": 'site:tiktok.com "{keyword}" email OR contact',
}


def _build_dork_query(keyword: str, platform: str) -> str:
    """Build a Google dork query for a given keyword and platform."""
    template = PLATFORM_DORK_TEMPLATES.get(platform, '"{keyword}" email OR contact')
    return template.replace("{keyword}", keyword)


# ─── Method 1: Patchright (FREE) ─────────────────────────────────────────────

async def _search_google_patchright(
    query: str,
    num_results: int = 10,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Search Google directly using Patchright (anti-detection browser).

    This is the PRIMARY extraction method — completely free, no API key needed.
    Scrapes Google search results directly and extracts emails/phones from snippets.
    """
    try:
        from app.services.patchright_engine import new_page, safe_goto, random_delay
        from app.services.captcha_solver import detect_captcha, solve_recaptcha
    except ImportError:
        logger.warning("Patchright not available, skipping browser-based dorking")
        return []

    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)
        from urllib.parse import quote_plus

        url = f"https://www.google.com/search?q={quote_plus(query)}&num={num_results}"
        success = await safe_goto(page, url)
        if not success:
            return []

        await random_delay(1.5, 3.0)

        # Check for CAPTCHA
        has_captcha = await detect_captcha(page)
        if has_captcha:
            logger.info("Google CAPTCHA detected, attempting Whisper solve...")
            solved = await solve_recaptcha(page)
            if not solved:
                logger.warning("CAPTCHA not solved, falling back to Serper API")
                return []
            await random_delay(1.0, 2.0)

        # Extract search results from Google page
        results = await page.evaluate("""() => {
            const items = [];
            const containers = document.querySelectorAll('div.g, div.MjjYud');
            containers.forEach(el => {
                const linkEl = el.querySelector('a[href]');
                const titleEl = el.querySelector('h3');
                const snippetEl = el.querySelector('div[data-sncf], span.st, div.VwiC3b, div[style*="line-clamp"]');
                if (linkEl && titleEl) {
                    const href = linkEl.href || '';
                    if (href.startsWith('http') && !href.includes('google.com/search')) {
                        items.push({
                            title: titleEl.innerText || '',
                            snippet: snippetEl ? snippetEl.innerText : '',
                            link: href
                        });
                    }
                }
            });
            return items;
        }""")

        logger.info("Patchright Google dorking: %d results for query", len(results or []))
        return results or []

    except Exception as e:
        logger.error("Patchright Google search error: %s", e)
        return []
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass


# ─── Method 2: Serper.dev API (FALLBACK) ─────────────────────────────────────

def _search_serper(query: str, num_results: int = 10) -> list[dict]:
    """Search using Serper.dev API (legacy, uses module-level key)."""
    if not SERPER_API_KEY:
        return []
    return _search_serper_with_key(query, num_results, SERPER_API_KEY)


def _search_serper_with_key(query: str, num_results: int, api_key: str) -> list[dict]:
    """Search using Serper.dev API with explicit key."""
    if not api_key:
        return []
    try:
        response = requests.post(
            "https://google.serper.dev/search",
            json={"q": query, "num": num_results},
            headers={
                "X-API-KEY": api_key,
                "Content-Type": "application/json",
            },
            timeout=15,
        )
        if response.status_code == 200:
            data = response.json()
            results = []
            for item in data.get("organic", []):
                results.append({
                    "title": item.get("title", ""),
                    "snippet": item.get("snippet", ""),
                    "link": item.get("link", ""),
                })
            return results
    except Exception:
        pass
    return []


# ─── Combined Dorking Search ─────────────────────────────────────────────────

async def dorking_search(
    keyword: str,
    platform: str,
    pages: int = 3,
    serper_api_key: Optional[str] = None,
    use_patchright: bool = True,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> dict:
    """Perform Google dorking search for a keyword on a platform.

    Tries Patchright first (free), falls back to Serper API if needed.

    Returns:
        Dict with emails, phones, sources, query, platform, keyword, method.
    """
    query = _build_dork_query(keyword, platform)
    all_emails: list[str] = []
    all_phones: list[str] = []
    all_sources: list[str] = []
    method_used = "none"

    num_results = pages * 10

    # Method 1: Patchright (FREE)
    if use_patchright:
        results = await _search_google_patchright(
            query, num_results, headless=headless, proxy=proxy
        )
        if results:
            method_used = "patchright"
            for result in results:
                text = f"{result.get('title', '')} {result.get('snippet', '')}"
                all_emails.extend(extract_emails(text))
                all_phones.extend(extract_phones(text))
                link = result.get("link", "")
                if link:
                    all_sources.append(link)

    # Method 2: Serper API (FALLBACK) — only if Patchright found nothing
    if not all_emails and not all_phones:
        api_key = serper_api_key or SERPER_API_KEY
        if api_key:
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None, _search_serper_with_key, query, num_results, api_key
            )
            if results:
                method_used = "serper" if method_used == "none" else f"{method_used}+serper"
                for result in results:
                    text = f"{result.get('title', '')} {result.get('snippet', '')}"
                    all_emails.extend(extract_emails(text))
                    all_phones.extend(extract_phones(text))
                    link = result.get("link", "")
                    if link:
                        all_sources.append(link)

    # Deduplicate
    seen_emails: set[str] = set()
    unique_emails = []
    for email in all_emails:
        lower = email.lower()
        if lower not in seen_emails:
            seen_emails.add(lower)
            unique_emails.append(email)

    seen_phones: set[str] = set()
    unique_phones = []
    for phone in all_phones:
        cleaned = re.sub(r'[^\d+]', '', phone)
        if cleaned not in seen_phones:
            seen_phones.add(cleaned)
            unique_phones.append(phone)

    return {
        "emails": unique_emails,
        "phones": unique_phones,
        "sources": list(set(all_sources)),
        "query": query,
        "platform": platform,
        "keyword": keyword,
        "method": method_used,
    }


async def dorking_search_multi(
    keywords: list[str],
    platforms: list[str],
    pages: int = 3,
    delay: float = 2.0,
    serper_api_key: Optional[str] = None,
    use_patchright: bool = True,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """Search multiple keywords across multiple platforms.

    Tries Patchright first (free), falls back to Serper API.
    """
    all_results = []
    for keyword in keywords:
        for platform in platforms:
            if platform == "reddit":
                continue  # Reddit uses RSS/PullPush instead
            result = await dorking_search(
                keyword, platform, pages,
                serper_api_key=serper_api_key,
                use_patchright=use_patchright,
                headless=headless,
                proxy=proxy,
            )
            all_results.append(result)
            if delay > 0:
                await asyncio.sleep(delay)
    return all_results
