"""Google dorking engine — extracts emails/phones from Google search results.

Supports two methods:
  1. **Serper.dev API** (PRIMARY, RELIABLE): Uses Serper.dev REST API. Free tier
     gives 2,500 searches/month. API key loaded from DB settings first,
     falls back to SERPER_API_KEY environment variable.
  2. **Patchright** (OPTIONAL, FREE): Scrapes Google search results directly
     using Patchright anti-detection browser. Zero API cost but requires
     Chromium installed. Used only if available and Serper has no results.

Extraction flow:
  Serper API (primary) -> if no key or no results -> try Patchright (if installed) -> if CAPTCHA -> skip
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

    OPTIONAL fallback — only used if Serper API returns no results.
    Scrapes Google search results directly and extracts emails/phones from snippets.
    Returns empty list if Patchright is not available (graceful degradation).
    """
    try:
        from app.services.patchright_engine import new_page, safe_goto, random_delay
    except ImportError:
        logger.info("Patchright not available, skipping browser-based dorking")
        return []

    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)
        if page is None:
            logger.info("Patchright page creation returned None — skipping")
            return []
        from urllib.parse import quote_plus

        url = f"https://www.google.com/search?q={quote_plus(query)}&num={num_results}"
        success = await safe_goto(page, url)
        if not success:
            return []

        await random_delay(1.5, 3.0)

        # Check for CAPTCHA — if detected, skip immediately (no Whisper needed)
        has_captcha = await _check_google_captcha(page)
        if has_captcha:
            logger.warning("Google CAPTCHA detected — skipping to Serper API")
            return []

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


async def _check_google_captcha(page) -> bool:
    """Check if Google is showing a CAPTCHA page."""
    try:
        html = await page.content()
        html_lower = html.lower()
        captcha_indicators = [
            "g-recaptcha",
            "recaptcha",
            "captcha-form",
            "unusual traffic",
            "not a robot",
            "verify you are human",
        ]
        return any(indicator in html_lower for indicator in captcha_indicators)
    except Exception:
        return False


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

    Strategy:
      1. Try Serper API first (reliable, fast, no browser needed)
      2. If Serper fails/no key -> try Patchright (if installed)
      3. If both fail -> return empty results

    Returns:
        Dict with emails, phones, sources, query, platform, keyword, method.
    """
    query = _build_dork_query(keyword, platform)
    all_emails: list[str] = []
    all_phones: list[str] = []
    all_sources: list[str] = []
    method_used = "none"

    num_results = pages * 10

    # Method 1: Serper API (PRIMARY — reliable, no browser dependency)
    api_key = serper_api_key or SERPER_API_KEY
    if api_key:
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None, _search_serper_with_key, query, num_results, api_key
        )
        if results:
            method_used = "serper"
            for result in results:
                text = f"{result.get('title', '')} {result.get('snippet', '')}"
                all_emails.extend(extract_emails(text))
                all_phones.extend(extract_phones(text))
                link = result.get("link", "")
                if link:
                    all_sources.append(link)

    # Method 2: Patchright (OPTIONAL — only if Serper found nothing)
    if not all_emails and not all_phones and use_patchright:
        results = await _search_google_patchright(
            query, num_results, headless=headless, proxy=proxy
        )
        if results:
            method_used = "patchright" if method_used == "none" else f"{method_used}+patchright"
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

    Tries Serper API first (reliable), falls back to Patchright if installed.
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
