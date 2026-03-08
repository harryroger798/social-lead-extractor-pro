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


# ─── DuckDuckGo Search (no API key needed) ─────────────────────────────────


def _get_ddg_vqd(query: str, session: requests.Session) -> str:
    """Get a DuckDuckGo vqd token required for search API calls."""
    try:
        resp = session.post(
            "https://duckduckgo.com",
            data={"q": query},
            timeout=10,
        )
        if resp.status_code == 200:
            import re as _re
            match = _re.search(r'vqd=["\']([^"\']+)', resp.text)
            if match:
                return match.group(1)
            # Also check for vqd in script tags
            match2 = _re.search(r'vqd=([\d-]+)', resp.text)
            if match2:
                return match2.group(1)
    except Exception as e:
        logger.debug("DDG vqd token fetch failed: %s", e)
    return ""


def _simplify_query_for_ddg(query: str) -> str:
    """Convert Google dorking queries to DDG-friendly natural language.

    DDG's internal API doesn't handle site: operator well. Convert
    'site:linkedin.com "keyword" "email"' to 'keyword linkedin email contact'.
    """
    import re as _re

    # Extract site domain if present
    site_match = _re.search(r'site:(\S+)', query)
    domain = ""
    if site_match:
        domain = site_match.group(1)
        # Extract just the domain name (e.g., linkedin from linkedin.com/in)
        domain_parts = domain.replace("/", " ").split(".")
        domain = domain_parts[0] if domain_parts else domain

    # Remove site: operators and OR keywords
    cleaned = _re.sub(r'site:\S+', '', query)
    cleaned = _re.sub(r'\bOR\b', '', cleaned, flags=_re.IGNORECASE)
    # Remove quotes but keep the content
    cleaned = cleaned.replace('"', '').replace("'", '')
    # Collapse whitespace
    cleaned = _re.sub(r'\s+', ' ', cleaned).strip()

    # Rebuild as natural language query with domain name
    if domain and domain.lower() not in cleaned.lower():
        cleaned = f"{cleaned} {domain}"

    # Add "email contact" if not already present (helps find lead data)
    has_contact_terms = any(
        t in cleaned.lower() for t in ["email", "contact", "@gmail", "@yahoo", "@outlook"]
    )
    if not has_contact_terms:
        cleaned += " email contact"

    return cleaned


def search_duckduckgo(
    query: str,
    num_results: int = 10,
) -> list[dict]:
    """Search DuckDuckGo via internal API (free, no API key needed).

    Uses DDG's internal links.duckduckgo.com/d.js endpoint which returns
    JSON results. This bypasses the HTML captcha/JS challenge that blocks
    the old html.duckduckgo.com/html/ approach.

    Automatically converts Google dorking queries (with site: operator) to
    DDG-friendly natural language format.

    Falls back to the HTML lite endpoint if the API approach fails.
    """
    import re as _re
    from urllib.parse import unquote

    results: list[dict] = []

    # Convert dorking queries to DDG-friendly format
    ddg_query = _simplify_query_for_ddg(query) if "site:" in query else query

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://duckduckgo.com/",
    })

    # Method 1: DDG internal JSON API (most reliable)
    try:
        vqd = _get_ddg_vqd(ddg_query, session)
        if vqd:
            api_resp = session.get(
                "https://links.duckduckgo.com/d.js",
                params={
                    "q": ddg_query,
                    "vqd": vqd,
                    "kl": "wt-wt",
                    "l": "wt-wt",
                    "dl": "en",
                    "ct": "US",
                    "ss_mkt": "us",
                    "df": "",
                    "ex": "-1",
                    "sp": "0",
                    "s": "0",
                    "o": "json",
                },
                timeout=15,
            )
            if api_resp.status_code == 200:
                import json
                # Response is JSONP-like; extract the JSON array
                text = api_resp.text.strip()
                # Try to parse as JSON directly
                try:
                    data = json.loads(text)
                except json.JSONDecodeError:
                    # Try extracting JSON from JSONP wrapper
                    json_match = _re.search(r'\[.*\]', text, _re.DOTALL)
                    data = json.loads(json_match.group(0)) if json_match else []

                if isinstance(data, dict):
                    data = data.get("results", [])

                for item in data:
                    if not isinstance(item, dict):
                        continue
                    url = item.get("u", item.get("c", ""))
                    title = item.get("t", "")
                    snippet = item.get("a", "")
                    if url and url.startswith("http"):
                        # Strip HTML tags from title and snippet
                        title = _re.sub(r'<[^>]+>', '', title).strip()
                        snippet = _re.sub(r'<[^>]+>', '', snippet).strip()
                        results.append({
                            "title": title,
                            "snippet": snippet,
                            "link": url,
                        })
                    if len(results) >= num_results:
                        break

                if results:
                    logger.info("DDG API: %d results for query", len(results))
                    return results
    except Exception as e:
        logger.debug("DDG API search failed: %s", e)

    # Method 2: DDG HTML endpoint (fallback, may hit captcha)
    try:
        response = session.get(
            "https://html.duckduckgo.com/html/",
            params={"q": ddg_query},
            timeout=15,
        )
        if response.status_code in (200, 202):
            html = response.text
            # Try the standard result pattern
            result_pattern = _re.compile(
                r'<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)</a>.*?'
                r'<a[^>]*class="result__snippet"[^>]*>(.*?)</a>',
                _re.DOTALL,
            )
            for match in result_pattern.finditer(html):
                url = match.group(1)
                title = _re.sub(r'<[^>]+>', '', match.group(2)).strip()
                snippet = _re.sub(r'<[^>]+>', '', match.group(3)).strip()

                if "uddg=" in url:
                    from urllib.parse import urlparse, parse_qs
                    parsed = urlparse(url)
                    params = parse_qs(parsed.query)
                    url = unquote(params.get("uddg", [url])[0])

                if url.startswith("http"):
                    results.append({
                        "title": title,
                        "snippet": snippet,
                        "link": url,
                    })
                if len(results) >= num_results:
                    break

    except Exception as e:
        logger.debug("DDG HTML search failed: %s", e)

    if results:
        logger.info("DDG HTML: %d results for query", len(results))

    return results


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
