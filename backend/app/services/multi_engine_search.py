"""Multi-engine search: Bing and Brave Search APIs for lead discovery.

Supplements Google dorking with alternative search engines that index
different content. Bing indexes MORE LinkedIn profiles than Google.
Brave Search indexes fresher content.

All methods: 100% FREE tiers | 100% NON-BAN | Public data only.

Free tiers:
  - Bing Web Search API: 1,000 calls/month (via Azure free tier)
  - Brave Search API: 2,000 calls/month (free plan)
  - DuckDuckGo HTML: Unlimited (no official API, HTML scraping)
"""

import logging
import requests
from typing import Optional

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)


# ─── Bing Web Search ─────────────────────────────────────────────────────────

def search_bing(
    query: str,
    num_results: int = 10,
    api_key: Optional[str] = None,
) -> list[dict]:
    """Search using Bing Web Search API v7 (free tier: 1K/month).

    Bing indexes MORE LinkedIn profiles than Google and finds different
    content for Facebook, Instagram etc.
    """
    if not api_key:
        return []

    try:
        response = requests.get(
            "https://api.bing.microsoft.com/v7.0/search",
            params={"q": query, "count": min(num_results, 50)},
            headers={"Ocp-Apim-Subscription-Key": api_key},
            timeout=15,
        )
        if response.status_code == 200:
            data = response.json()
            results = []
            for item in data.get("webPages", {}).get("value", []):
                results.append({
                    "title": item.get("name", ""),
                    "snippet": item.get("snippet", ""),
                    "link": item.get("url", ""),
                })
            return results
        else:
            logger.warning("Bing API returned %d: %s", response.status_code, response.text[:200])
    except Exception as e:
        logger.error("Bing search error: %s", e)
    return []


# ─── Brave Search ────────────────────────────────────────────────────────────

def search_brave(
    query: str,
    num_results: int = 10,
    api_key: Optional[str] = None,
) -> list[dict]:
    """Search using Brave Search API (free tier: 2K/month).

    Brave indexes fresher content and finds pages Google may have deindexed.
    """
    if not api_key:
        return []

    try:
        response = requests.get(
            "https://api.search.brave.com/res/v1/web/search",
            params={"q": query, "count": min(num_results, 20)},
            headers={
                "X-Subscription-Token": api_key,
                "Accept": "application/json",
            },
            timeout=15,
        )
        if response.status_code == 200:
            data = response.json()
            results = []
            for item in data.get("web", {}).get("results", []):
                results.append({
                    "title": item.get("title", ""),
                    "snippet": item.get("description", ""),
                    "link": item.get("url", ""),
                })
            return results
        else:
            logger.warning("Brave API returned %d: %s", response.status_code, response.text[:200])
    except Exception as e:
        logger.error("Brave search error: %s", e)
    return []


# ─── DuckDuckGo HTML Search (no API key needed) ────────────────────────────

def search_duckduckgo(
    query: str,
    num_results: int = 10,
) -> list[dict]:
    """Search DuckDuckGo via HTML endpoint (free, no API key needed).

    DuckDuckGo uses Bing's index but may surface different results.
    Returns fewer structured results but requires zero setup.
    """
    import re as _re

    try:
        response = requests.get(
            "https://html.duckduckgo.com/html/",
            params={"q": query},
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            timeout=15,
        )
        if response.status_code != 200:
            return []

        html = response.text
        results = []

        # Extract result blocks from DuckDuckGo HTML
        # Each result has class "result" with a link and snippet
        result_pattern = _re.compile(
            r'<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)</a>.*?'
            r'<a[^>]*class="result__snippet"[^>]*>(.*?)</a>',
            _re.DOTALL,
        )

        for match in result_pattern.finditer(html):
            url = match.group(1)
            title = _re.sub(r'<[^>]+>', '', match.group(2)).strip()
            snippet = _re.sub(r'<[^>]+>', '', match.group(3)).strip()

            # DuckDuckGo wraps URLs in a redirect; extract actual URL
            if "uddg=" in url:
                from urllib.parse import unquote, urlparse, parse_qs
                parsed = urlparse(url)
                params = parse_qs(parsed.query)
                actual_url = unquote(params.get("uddg", [url])[0])
                url = actual_url

            if url.startswith("http"):
                results.append({
                    "title": title,
                    "snippet": snippet,
                    "link": url,
                })

            if len(results) >= num_results:
                break

        return results

    except Exception as e:
        logger.error("DuckDuckGo search error: %s", e)
        return []


# ─── Multi-Engine Search Dispatcher ─────────────────────────────────────────

def extract_leads_from_results(results: list[dict]) -> tuple[list[str], list[str], list[str]]:
    """Extract emails, phones, and source URLs from search results."""
    emails: list[str] = []
    phones: list[str] = []
    sources: list[str] = []

    for result in results:
        text = f"{result.get('title', '')} {result.get('snippet', '')}"
        emails.extend(extract_emails(text))
        phones.extend(extract_phones(text))
        link = result.get("link", "")
        if link:
            sources.append(link)

    return emails, phones, sources


def multi_engine_search(
    query: str,
    num_results: int = 10,
    bing_api_key: Optional[str] = None,
    brave_api_key: Optional[str] = None,
    use_duckduckgo: bool = True,
) -> dict:
    """Search across multiple engines and combine results.

    Returns combined emails, phones, sources from all engines that have keys.
    DuckDuckGo is always available (no key needed).
    """
    all_emails: list[str] = []
    all_phones: list[str] = []
    all_sources: list[str] = []
    engines_used: list[str] = []

    # Bing
    if bing_api_key:
        results = search_bing(query, num_results, bing_api_key)
        if results:
            emails, phones, sources = extract_leads_from_results(results)
            all_emails.extend(emails)
            all_phones.extend(phones)
            all_sources.extend(sources)
            engines_used.append("bing")
            logger.info("Bing: %d results, %d emails, %d phones", len(results), len(emails), len(phones))

    # Brave
    if brave_api_key:
        results = search_brave(query, num_results, brave_api_key)
        if results:
            emails, phones, sources = extract_leads_from_results(results)
            all_emails.extend(emails)
            all_phones.extend(phones)
            all_sources.extend(sources)
            engines_used.append("brave")
            logger.info("Brave: %d results, %d emails, %d phones", len(results), len(emails), len(phones))

    # DuckDuckGo (always free)
    if use_duckduckgo:
        results = search_duckduckgo(query, num_results)
        if results:
            emails, phones, sources = extract_leads_from_results(results)
            all_emails.extend(emails)
            all_phones.extend(phones)
            all_sources.extend(sources)
            engines_used.append("duckduckgo")
            logger.info("DuckDuckGo: %d results, %d emails, %d phones", len(results), len(emails), len(phones))

    # Deduplicate
    seen_emails: set[str] = set()
    unique_emails = [e for e in all_emails if not (e.lower() in seen_emails or seen_emails.add(e.lower()))]  # type: ignore[func-returns-value]

    import re
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
        "engines_used": engines_used,
    }
