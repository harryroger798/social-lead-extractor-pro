"""Multi-engine search: FREE waterfall across 6+ search engines for lead discovery.

Replaces broken DuckDuckGo-only path with robust waterfall:
  1. Brave Search (web scrape) - best quality, supports site: operators
  2. Startpage (web scrape) - proxied Google results, excellent quality
  3. DuckDuckGo Lite - simpler endpoint, more reliable than main DDG
  4. Mojeek - independent UK search engine, supports site: operator
  5. Qwant Lite - European privacy search, no-JS endpoint
  6. SearXNG public instances - meta-search, rotates across instances

Also retains API-key-based engines (Bing, Brave API) for users who have keys.

All free methods: Zero API keys | Zero browser automation | 100% ban-free.
Works in PyInstaller bundle on Windows/Mac/Linux.
"""

import asyncio
import concurrent.futures
import hashlib
import html as html_module
import json
import logging
import random
import re
import time
from dataclasses import dataclass, field
from typing import Optional
from urllib.parse import quote_plus, unquote, urlparse, parse_qs

import httpx
import requests

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)


# --- Engine Health Tracking ---------------------------------------------------

@dataclass
class _EngineHealth:
    """Track per-engine success/failure for adaptive ordering."""

    consecutive_failures: int = 0
    cooldown_until: float = 0.0
    total_queries: int = 0
    total_results: int = 0

    def record_success(self, result_count: int) -> None:
        self.consecutive_failures = 0
        self.total_queries += 1
        self.total_results += result_count

    def record_failure(self) -> None:
        self.consecutive_failures += 1
        if self.consecutive_failures >= 3:
            self.cooldown_until = time.time() + 3600  # 1hr cooldown
        elif self.consecutive_failures >= 2:
            self.cooldown_until = time.time() + 300  # 5min cooldown

    @property
    def is_available(self) -> bool:
        if self.consecutive_failures >= 3:
            if time.time() > self.cooldown_until:
                self.consecutive_failures = 0  # auto-recovery
                return True
            return False
        if self.consecutive_failures >= 2:
            return time.time() > self.cooldown_until
        return True


_engine_health: dict[str, _EngineHealth] = {}


def _get_health(engine: str) -> _EngineHealth:
    if engine not in _engine_health:
        _engine_health[engine] = _EngineHealth()
    return _engine_health[engine]


# --- User Agent Rotation -----------------------------------------------------

_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) "
    "Gecko/20100101 Firefox/133.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/18.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
]

_ACCEPT_LANGUAGES = [
    "en-US,en;q=0.9",
    "en-GB,en;q=0.9",
    "en-US,en;q=0.9,es;q=0.8",
    "en,en-US;q=0.9",
]


def _get_headers() -> dict[str, str]:
    """Generate realistic browser headers. Rotated per-request."""
    return {
        "User-Agent": random.choice(_USER_AGENTS),
        "Accept": (
            "text/html,application/xhtml+xml,application/xml;"
            "q=0.9,image/webp,*/*;q=0.8"
        ),
        "Accept-Language": random.choice(_ACCEPT_LANGUAGES),
        "Accept-Encoding": "gzip, deflate",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }


# --- Search Result Model -----------------------------------------------------

@dataclass
class SearchResult:
    """A single search result from any engine."""

    title: str
    url: str
    snippet: str
    engine: str
    position: int = 0
    _url_hash: str = field(default="", repr=False)

    def __post_init__(self) -> None:
        parsed = urlparse(self.url.rstrip("/").lower())
        clean = f"{parsed.netloc}{parsed.path}"
        self._url_hash = hashlib.md5(clean.encode()).hexdigest()

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, SearchResult):
            return NotImplemented
        return self._url_hash == other._url_hash

    def __hash__(self) -> int:
        return hash(self._url_hash)

    def to_dict(self) -> dict[str, str]:
        return {"title": self.title, "link": self.url, "snippet": self.snippet}


# --- Helper: strip HTML tags -------------------------------------------------

def _strip_tags(text: str) -> str:
    """Remove HTML tags and inline CSS-in-JS style declarations."""
    # Remove <style>...</style> blocks
    cleaned = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
    # Remove HTML tags
    cleaned = re.sub(r"<[^>]+>", "", cleaned)
    # Remove inline CSS: .css-xxx{...} (Startpage embeds these)
    cleaned = re.sub(r"\.[a-zA-Z0-9_-]+\{[^}]+\}", "", cleaned)
    return cleaned.strip()


# ==============================================================================
# Free Engine Implementations (no API key needed)
# ==============================================================================


async def _search_brave_free(
    client: httpx.AsyncClient,
    query: str,
    num_results: int = 20,
) -> list[SearchResult]:
    """Brave Search web scraping -- no API key needed.

    Brave HTML is clean and predictable. Supports full dorking syntax
    including site: operator. Low ban risk.
    """
    results: list[SearchResult] = []
    try:
        resp = await client.get(
            "https://search.brave.com/search",
            params={"q": query, "source": "web"},
            headers=_get_headers(),
            follow_redirects=True,
            timeout=15.0,
        )
        if resp.status_code != 200:
            logger.warning("Brave returned %d", resp.status_code)
            return []

        text = resp.text

        # Primary: extract from snippet blocks
        snippet_pat = re.compile(
            r'<div[^>]*class="snippet[^"]*"[^>]*data-pos="(\d+)"'
            r'[^>]*>(.*?)</div>\s*</div>',
            re.DOTALL,
        )
        snippet_blocks = snippet_pat.findall(text)
        if snippet_blocks:
            for pos_str, block in snippet_blocks:
                url_m = re.search(r'href="(https?://[^"]+)"', block)
                title_m = re.search(
                    r'class="snippet-title[^"]*"[^>]*>(.*?)</span>',
                    block, re.DOTALL,
                )
                desc_m = re.search(
                    r'class="snippet-description[^"]*"[^>]*>(.*?)</p>',
                    block, re.DOTALL,
                )
                if url_m:
                    results.append(SearchResult(
                        title=html_module.unescape(
                            _strip_tags(title_m.group(1))
                        ) if title_m else "",
                        url=url_m.group(1),
                        snippet=html_module.unescape(
                            _strip_tags(desc_m.group(1))
                        ) if desc_m else "",
                        engine="brave_free",
                        position=int(pos_str),
                    ))
        else:
            # Fallback: extract from results section
            rs = re.search(
                r'<div[^>]*id="results"[^>]*>(.*?)<footer',
                text, re.DOTALL,
            )
            body = rs.group(1) if rs else text
            link_pat = re.compile(
                r'<a[^>]+href="(https?://(?!search\.brave\.com)[^"]+)"'
                r'[^>]*>\s*(?:<span[^>]*>)?\s*(.*?)\s*(?:</span>)?\s*</a>',
            )
            links = link_pat.findall(body)
            seen_urls: set[str] = set()
            pos = 0
            for url, raw_title in links:
                if "brave.com" in url or "brave.software" in url:
                    continue
                if url in seen_urls:
                    continue
                seen_urls.add(url)
                title = _strip_tags(raw_title)
                if not title or len(title) < 3:
                    continue
                results.append(SearchResult(
                    title=html_module.unescape(title),
                    url=url,
                    snippet="",
                    engine="brave_free",
                    position=pos,
                ))
                pos += 1
                if pos >= num_results:
                    break

        logger.info(
            "Brave free: %d results for '%s'", len(results), query[:60],
        )
    except httpx.TimeoutException:
        logger.warning("Brave free: timeout")
    except Exception as e:
        logger.error("Brave free: %s", e)

    return results[:num_results]


async def _search_startpage(
    client: httpx.AsyncClient,
    query: str,
    num_results: int = 20,
) -> list[SearchResult]:
    """Startpage -- proxied Google results. Excellent quality.

    Requires POST form submission. Supports full dorking.
    Startpage uses CSS-in-JS with hashed class names, so we match
    on stable class prefixes like 'result-title result-link'.
    """
    results: list[SearchResult] = []
    try:
        hdrs = _get_headers()
        hdrs.update({
            "Referer": "https://www.startpage.com/",
            "Origin": "https://www.startpage.com",
            "Content-Type": "application/x-www-form-urlencoded",
        })
        resp = await client.post(
            "https://www.startpage.com/sp/search",
            data={"query": query, "cat": "web", "language": "english"},
            headers=hdrs,
            follow_redirects=True,
            timeout=15.0,
        )
        if resp.status_code != 200:
            logger.warning("Startpage returned %d", resp.status_code)
            return []

        text = resp.text

        # Primary pattern: Startpage uses class="result-title result-link css-*"
        link_pat = re.compile(
            r'<a[^>]*class="[^"]*result-title[^"]*result-link[^"]*"'
            r'[^>]*href="(https?://[^"]+)"[^>]*>(.*?)</a>',
            re.DOTALL,
        )
        # Also try href before class
        link_pat2 = re.compile(
            r'<a[^>]*href="(https?://[^"]+)"[^>]*'
            r'class="[^"]*result-title[^"]*result-link[^"]*"[^>]*>(.*?)</a>',
            re.DOTALL,
        )
        matches = link_pat.findall(text) or link_pat2.findall(text)
        for pos, (url, raw_title) in enumerate(matches):
            title = html_module.unescape(_strip_tags(raw_title))
            results.append(SearchResult(
                title=title,
                url=url,
                snippet="",
                engine="startpage",
                position=pos,
            ))
            if pos >= num_results:
                break

        # Fallback: section-based w-gl__result (older Startpage layout)
        if not results:
            result_blocks = re.findall(
                r'<section[^>]*class="[^"]*w-gl__result[^"]*"'
                r'[^>]*>(.*?)</section>',
                text, re.DOTALL,
            )
            for pos, block in enumerate(result_blocks):
                url_m = re.search(r'href="(https?://[^"]+)"', block)
                title_m = re.search(
                    r'<h3[^>]*>(.*?)</h3>', block, re.DOTALL,
                )
                if url_m:
                    results.append(SearchResult(
                        title=html_module.unescape(
                            _strip_tags(title_m.group(1))
                        ) if title_m else "",
                        url=url_m.group(1),
                        snippet="",
                        engine="startpage",
                        position=pos,
                    ))

        logger.info(
            "Startpage: %d results for '%s'", len(results), query[:60],
        )
    except httpx.TimeoutException:
        logger.warning("Startpage: timeout")
    except Exception as e:
        logger.error("Startpage: %s", e)

    return results[:num_results]


async def _search_ddg_lite(
    client: httpx.AsyncClient,
    query: str,
    num_results: int = 20,
) -> list[SearchResult]:
    """DuckDuckGo LITE -- simpler endpoint, more reliable than main DDG.

    DDG Lite uses table-based layout with rel="nofollow" links
    and class="result-link" on the <a> tags.
    """
    results: list[SearchResult] = []
    try:
        hdrs = _get_headers()
        hdrs.update({
            "Referer": "https://lite.duckduckgo.com/",
            "Origin": "https://lite.duckduckgo.com",
            "Content-Type": "application/x-www-form-urlencoded",
        })
        resp = await client.post(
            "https://lite.duckduckgo.com/lite/",
            data={"q": query, "kl": ""},
            headers=hdrs,
            follow_redirects=True,
            timeout=15.0,
        )
        if resp.status_code == 202:
            logger.warning("DDG Lite: 202 (rate limited)")
            return []
        if resp.status_code != 200:
            logger.warning("DDG Lite returned %d", resp.status_code)
            return []

        text = resp.text
        # DDG Lite: <a rel="nofollow" href="URL" class='result-link'>Title</a>
        # Note: rel comes before href, class uses single quotes
        link_pat = re.compile(
            r'<a[^>]*rel="nofollow"[^>]*href="(https?://[^"]+)"'
            r'[^>]*>(.*?)</a>',
            re.DOTALL,
        )
        links = link_pat.findall(text)
        # Also try with class='result-link' in different order
        if not links:
            link_pat2 = re.compile(
                r"<a[^>]*href='(https?://[^']+)'[^>]*"
                r"class='result-link'[^>]*>(.*?)</a>",
                re.DOTALL,
            )
            links = link_pat2.findall(text)

        for pos, (url, raw_title) in enumerate(links):
            title = html_module.unescape(_strip_tags(raw_title))
            if not title or len(title) < 3:
                continue
            results.append(SearchResult(
                title=title,
                url=url,
                snippet="",
                engine="ddg_lite",
                position=pos,
            ))
            if len(results) >= num_results:
                break

        logger.info(
            "DDG Lite: %d results for '%s'", len(results), query[:60],
        )
    except Exception as e:
        logger.error("DDG Lite: %s", e)

    return results[:num_results]


async def _search_mojeek(
    client: httpx.AsyncClient,
    query: str,
    num_results: int = 20,
) -> list[SearchResult]:
    """Mojeek -- independent UK search engine with own crawler."""
    results: list[SearchResult] = []
    try:
        resp = await client.get(
            "https://www.mojeek.com/search",
            params={"q": query, "fmt": "html"},
            headers=_get_headers(),
            follow_redirects=True,
            timeout=15.0,
        )
        if resp.status_code != 200:
            logger.warning("Mojeek returned %d", resp.status_code)
            return []

        text = resp.text
        blocks = re.findall(
            r'<li[^>]*class="[^"]*results-standard[^"]*"'
            r'[^>]*>(.*?)</li>',
            text, re.DOTALL,
        )
        if blocks:
            for pos, block in enumerate(blocks):
                url_m = re.search(r'href="(https?://[^"]+)"', block)
                title_m = re.search(
                    r'<h2[^>]*>(.*?)</h2>', block, re.DOTALL,
                )
                desc_m = re.search(
                    r'<p[^>]*class="s"[^>]*>(.*?)</p>',
                    block, re.DOTALL,
                )
                if url_m:
                    results.append(SearchResult(
                        title=html_module.unescape(
                            _strip_tags(title_m.group(1))
                        ) if title_m else "",
                        url=url_m.group(1),
                        snippet=html_module.unescape(
                            _strip_tags(desc_m.group(1))
                        ) if desc_m else "",
                        engine="mojeek",
                        position=pos,
                    ))
        else:
            # Alternative extraction
            links = re.findall(
                r'<a[^>]*class="ob"[^>]*href="(https?://[^"]+)"'
                r'[^>]*>\s*<h2[^>]*>(.*?)</h2>',
                text, re.DOTALL,
            )
            snips = re.findall(
                r'<p[^>]*class="s"[^>]*>(.*?)</p>',
                text, re.DOTALL,
            )
            for pos, (url, raw_t) in enumerate(links):
                snippet = (
                    _strip_tags(snips[pos]) if pos < len(snips) else ""
                )
                results.append(SearchResult(
                    title=html_module.unescape(_strip_tags(raw_t)),
                    url=url,
                    snippet=html_module.unescape(snippet),
                    engine="mojeek",
                    position=pos,
                ))
                if pos >= num_results:
                    break

        logger.info(
            "Mojeek: %d results for '%s'", len(results), query[:60],
        )
    except Exception as e:
        logger.error("Mojeek: %s", e)

    return results[:num_results]


async def _search_qwant_lite(
    client: httpx.AsyncClient,
    query: str,
    num_results: int = 20,
) -> list[SearchResult]:
    """Qwant Lite -- European privacy search engine.

    Qwant Lite embeds search results in a JavaScript INITIAL_PROPS object.
    We extract JSON data from the script tag and parse results from the
    nested structure.
    """
    results: list[SearchResult] = []
    try:
        resp = await client.get(
            "https://lite.qwant.com/",
            params={"q": query, "t": "web"},
            headers=_get_headers(),
            follow_redirects=True,
            timeout=15.0,
        )
        if resp.status_code != 200:
            logger.warning("Qwant Lite returned %d", resp.status_code)
            return []

        text = resp.text

        # Primary: extract INITIAL_PROPS JSON
        props_match = re.search(
            r'INITIAL_PROPS\s*=\s*({.*?})\s*;?\s*</script>',
            text, re.DOTALL,
        )
        if props_match:
            raw_json = props_match.group(1).replace("\\u002F", "/")
            try:
                data = json.loads(raw_json)
                # Navigate to results: data.initialResults.items or similar
                items: list[dict[str, str]] = []
                _extract_qwant_items(data, items, depth=0)
                for pos, item in enumerate(items[:num_results]):
                    results.append(SearchResult(
                        title=item.get("title", ""),
                        url=item.get("url", ""),
                        snippet=item.get("desc", ""),
                        engine="qwant",
                        position=pos,
                    ))
            except (json.JSONDecodeError, ValueError):
                logger.debug("Qwant: INITIAL_PROPS JSON parse failed")

        # Fallback: HTML link extraction
        if not results:
            links = re.findall(
                r'<a[^>]*href="(https?://(?!lite\.qwant\.com|'
                r'www\.qwant\.com|qwant\.com)[^"]+)"'
                r'[^>]*>(.*?)</a>',
                text, re.DOTALL,
            )
            for pos, (url, raw_title) in enumerate(links):
                title = _strip_tags(raw_title)
                if title and len(title) > 5:
                    results.append(SearchResult(
                        title=html_module.unescape(title),
                        url=url,
                        snippet="",
                        engine="qwant",
                        position=pos,
                    ))
                    if len(results) >= num_results:
                        break

        logger.info(
            "Qwant Lite: %d results for '%s'", len(results), query[:60],
        )
    except Exception as e:
        logger.error("Qwant Lite: %s", e)

    return results[:num_results]


def _extract_qwant_items(
    obj: object,
    items: list[dict[str, str]],
    depth: int,
) -> None:
    """Recursively find web result items in Qwant's INITIAL_PROPS JSON."""
    if depth > 8 or len(items) >= 30:
        return
    if isinstance(obj, dict):
        # Check if this dict looks like a search result
        if "url" in obj and "title" in obj:
            url = str(obj["url"])
            if url.startswith("http") and "qwant.com" not in url:
                items.append({
                    "title": str(obj.get("title", "")),
                    "url": url,
                    "desc": str(obj.get("desc", obj.get("description", ""))),
                })
        for val in obj.values():
            _extract_qwant_items(val, items, depth + 1)
    elif isinstance(obj, list):
        for val in obj:
            _extract_qwant_items(val, items, depth + 1)


# --- SearXNG Public Instance Search -------------------------------------------

_SEARXNG_INSTANCES = [
    "https://search.sapti.me",
    "https://searx.tiekoetter.com",
    "https://search.bus-hit.me",
    "https://searx.be",
    "https://searxng.site",
    "https://search.ononoki.org",
    "https://paulgo.io",
    "https://opnxng.com",
    "https://priv.au",
    "https://search.rhscz.eu",
]


async def _search_searxng(
    client: httpx.AsyncClient,
    query: str,
    num_results: int = 20,
) -> list[SearchResult]:
    """SearXNG meta-search via public instances. Rotates instances."""
    results: list[SearchResult] = []
    instances = random.sample(
        _SEARXNG_INSTANCES, min(3, len(_SEARXNG_INSTANCES)),
    )

    for inst in instances:
        try:
            resp = await client.get(
                f"{inst}/search",
                params={
                    "q": query, "format": "json",
                    "categories": "general", "language": "en",
                    "pageno": 1,
                },
                headers=_get_headers(),
                follow_redirects=True,
                timeout=10.0,
            )
            if resp.status_code != 200:
                continue

            # Some instances return HTML even when format=json
            content_type = resp.headers.get("content-type", "")
            host = inst.split("//")[1].split("/")[0]
            if "json" in content_type or resp.text.strip().startswith("{"):
                try:
                    data = resp.json()
                except (json.JSONDecodeError, ValueError):
                    continue
                for pos, item in enumerate(data.get("results", [])):
                    results.append(SearchResult(
                        title=item.get("title", ""),
                        url=item.get("url", ""),
                        snippet=item.get("content", ""),
                        engine=f"searxng:{host}",
                        position=pos,
                    ))
            else:
                # Fallback: parse HTML response
                text = resp.text
                h_links = re.findall(
                    r'<a[^>]*href="(https?://(?!' + re.escape(host)
                    + r')[^"]+)"[^>]*>(.*?)</a>',
                    text, re.DOTALL,
                )
                for pos, (url, raw_t) in enumerate(h_links):
                    title = _strip_tags(raw_t)
                    if title and len(title) > 5:
                        results.append(SearchResult(
                            title=html_module.unescape(title),
                            url=url,
                            snippet="",
                            engine=f"searxng:{host}",
                            position=pos,
                        ))

            if results:
                logger.info(
                    "SearXNG (%s): %d results", inst, len(results),
                )
                break
        except Exception as e:
            logger.debug("SearXNG %s failed: %s", inst, e)
            continue

    return results[:num_results]


# ==============================================================================
# Legacy API-key-based engines (kept for users who have keys)
# ==============================================================================

def search_bing(
    query: str,
    num_results: int = 10,
    api_key: Optional[str] = None,
) -> list[dict]:
    """Search using Bing Web Search API v7 (free tier: 1K/month)."""
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
            return [
                {
                    "title": it.get("name", ""),
                    "snippet": it.get("snippet", ""),
                    "link": it.get("url", ""),
                }
                for it in data.get("webPages", {}).get("value", [])
            ]
        else:
            logger.warning(
                "Bing API returned %d: %s",
                response.status_code, response.text[:200],
            )
    except Exception as e:
        logger.error("Bing search error: %s", e)
    return []


def search_brave(
    query: str,
    num_results: int = 10,
    api_key: Optional[str] = None,
) -> list[dict]:
    """Search using Brave Search API (free tier: 2K/month)."""
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
            return [
                {
                    "title": it.get("title", ""),
                    "snippet": it.get("description", ""),
                    "link": it.get("url", ""),
                }
                for it in data.get("web", {}).get("results", [])
            ]
        else:
            logger.warning(
                "Brave API returned %d: %s",
                response.status_code, response.text[:200],
            )
    except Exception as e:
        logger.error("Brave search error: %s", e)
    return []


# ==============================================================================
# Legacy DuckDuckGo (kept as additional fallback)
# ==============================================================================

def _get_ddg_vqd(query: str, session: requests.Session) -> str:
    """Get a DuckDuckGo vqd token required for search API calls."""
    try:
        resp = session.post(
            "https://duckduckgo.com", data={"q": query}, timeout=10,
        )
        if resp.status_code == 200:
            match = re.search(r'vqd=["\']([^"\']+)', resp.text)
            if match:
                return match.group(1)
            match2 = re.search(r'vqd=([\d-]+)', resp.text)
            if match2:
                return match2.group(1)
    except Exception as e:
        logger.debug("DDG vqd token fetch failed: %s", e)
    return ""


def _simplify_query_for_ddg(query: str) -> str:
    """Convert Google dorking queries to DDG-friendly natural language."""
    site_match = re.search(r'site:(\S+)', query)
    domain = ""
    if site_match:
        domain = site_match.group(1)
        domain_parts = domain.replace("/", " ").split(".")
        domain = domain_parts[0] if domain_parts else domain

    cleaned = re.sub(r'site:\S+', '', query)
    cleaned = re.sub(r'\bOR\b', '', cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.replace('"', '').replace("'", '')
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    if domain and domain.lower() not in cleaned.lower():
        cleaned = f"{cleaned} {domain}"

    has_contact = any(
        t in cleaned.lower()
        for t in ["email", "contact", "@gmail", "@yahoo", "@outlook"]
    )
    if not has_contact:
        cleaned += " email contact"

    return cleaned


def search_duckduckgo(query: str, num_results: int = 10) -> list[dict]:
    """Search DuckDuckGo via internal API (free, no API key needed)."""
    results: list[dict] = []
    ddg_query = (
        _simplify_query_for_ddg(query) if "site:" in query else query
    )

    session = requests.Session()
    session.headers.update({
        "User-Agent": random.choice(_USER_AGENTS),
        "Referer": "https://duckduckgo.com/",
    })

    # Method 1: DDG internal JSON API
    try:
        vqd = _get_ddg_vqd(ddg_query, session)
        if vqd:
            api_resp = session.get(
                "https://links.duckduckgo.com/d.js",
                params={
                    "q": ddg_query, "vqd": vqd, "kl": "wt-wt",
                    "l": "wt-wt", "dl": "en", "ct": "US",
                    "ss_mkt": "us", "df": "", "ex": "-1",
                    "sp": "0", "s": "0", "o": "json",
                },
                timeout=15,
            )
            if api_resp.status_code == 200:
                text = api_resp.text.strip()
                try:
                    data = json.loads(text)
                except json.JSONDecodeError:
                    json_match = re.search(r'\[.*\]', text, re.DOTALL)
                    data = (
                        json.loads(json_match.group(0))
                        if json_match else []
                    )
                if isinstance(data, dict):
                    data = data.get("results", [])
                for item in data:
                    if not isinstance(item, dict):
                        continue
                    url = item.get("u", item.get("c", ""))
                    title = item.get("t", "")
                    snippet = item.get("a", "")
                    if url and url.startswith("http"):
                        results.append({
                            "title": _strip_tags(title),
                            "snippet": _strip_tags(snippet),
                            "link": url,
                        })
                    if len(results) >= num_results:
                        break
                if results:
                    logger.info("DDG API: %d results", len(results))
                    return results
    except Exception as e:
        logger.debug("DDG API search failed: %s", e)

    # Method 2: DDG HTML endpoint
    try:
        response = session.get(
            "https://html.duckduckgo.com/html/",
            params={"q": ddg_query},
            timeout=15,
        )
        if response.status_code in (200, 202):
            html_text = response.text
            pat = re.compile(
                r'<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>'
                r'(.*?)</a>.*?'
                r'<a[^>]*class="result__snippet"[^>]*>(.*?)</a>',
                re.DOTALL,
            )
            for m in pat.finditer(html_text):
                url = m.group(1)
                title = _strip_tags(m.group(2))
                snippet = _strip_tags(m.group(3))
                if "uddg=" in url:
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
        logger.info("DDG HTML: %d results", len(results))
    return results


# ==============================================================================
# Main Free Search Waterfall
# ==============================================================================

# Typed as Any to avoid mypy complaints about callable signatures
_FREE_ENGINE_ORDER: list[tuple[str, object]] = [
    ("brave_free", _search_brave_free),
    ("startpage", _search_startpage),
    ("ddg_lite", _search_ddg_lite),
    ("mojeek", _search_mojeek),
    ("qwant", _search_qwant_lite),
    ("searxng", _search_searxng),
]


async def free_search_waterfall(
    query: str,
    num_results: int = 20,
    min_results: int = 5,
    max_engines: int = 3,
) -> list[SearchResult]:
    """Search across free engines in waterfall order until enough results.

    Tries engines in order of quality. Stops once min_results found
    or max_engines tried. Deduplicates across engines.
    """
    all_results: list[SearchResult] = []
    seen: set[str] = set()
    engines_tried = 0

    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=20.0,
        limits=httpx.Limits(max_connections=10),
    ) as client:
        for engine_name, engine_fn in _FREE_ENGINE_ORDER:
            health = _get_health(engine_name)
            if not health.is_available:
                logger.debug("Skipping %s (cooldown)", engine_name)
                continue

            engines_tried += 1
            try:
                engine_results = await engine_fn(  # type: ignore[operator]
                    client, query, num_results,
                )
                if engine_results:
                    health.record_success(len(engine_results))
                    for r in engine_results:
                        if r._url_hash not in seen:
                            seen.add(r._url_hash)
                            all_results.append(r)
                else:
                    health.record_failure()
            except Exception as e:
                logger.error("Engine %s failed: %s", engine_name, e)
                health.record_failure()

            if len(all_results) >= min_results:
                break
            if engines_tried >= max_engines:
                break

            await asyncio.sleep(0.5)

    logger.info(
        "Free search waterfall: %d results from %d engines for '%s'",
        len(all_results), engines_tried, query[:60],
    )
    return all_results[:num_results]


async def free_search_parallel(
    query: str,
    num_results: int = 30,
    engines: Optional[list[str]] = None,
) -> list[SearchResult]:
    """Search multiple free engines in parallel for maximum coverage."""
    if engines is None:
        engines = ["brave_free", "startpage", "ddg_lite"]

    engine_map = dict(_FREE_ENGINE_ORDER)
    tasks: list = []
    active_engines: list[str] = []

    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=20.0,
        limits=httpx.Limits(max_connections=10),
    ) as client:
        for eng in engines:
            if eng in engine_map and _get_health(eng).is_available:
                tasks.append(
                    engine_map[eng](  # type: ignore[operator]
                        client, query, num_results,
                    ),
                )
                active_engines.append(eng)
        if not tasks:
            return []
        results_lists = await asyncio.gather(
            *tasks, return_exceptions=True,
        )

    all_results: list[SearchResult] = []
    seen: set[str] = set()
    for idx, result in enumerate(results_lists):
        eng = (
            active_engines[idx] if idx < len(active_engines) else "unknown"
        )
        if isinstance(result, BaseException):
            logger.error("Parallel engine %s failed: %s", eng, result)
            _get_health(eng).record_failure()
            continue
        if isinstance(result, list) and result:
            _get_health(eng).record_success(len(result))
            for r in result:
                if r._url_hash not in seen:
                    seen.add(r._url_hash)
                    all_results.append(r)

    return all_results[:num_results]


# ==============================================================================
# Convenience Functions
# ==============================================================================

def extract_leads_from_results(
    results: list[dict],
) -> tuple[list[str], list[str], list[str]]:
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

    Enhanced: Now uses free waterfall (Brave/Startpage/DDG Lite/Mojeek/
    Qwant/SearXNG) as primary method, with API-key engines as additional
    coverage.
    """
    all_emails: list[str] = []
    all_phones: list[str] = []
    all_sources: list[str] = []
    engines_used: list[str] = []

    # -- FREE waterfall (always available, no API keys needed) --
    try:
        with concurrent.futures.ThreadPoolExecutor() as pool:
            future = pool.submit(
                asyncio.run, free_search_waterfall(query, num_results),
            )
            free_results = future.result(timeout=60)
        if free_results:
            for r in free_results:
                rd = r.to_dict()
                text = f"{rd.get('title', '')} {rd.get('snippet', '')}"
                all_emails.extend(extract_emails(text))
                all_phones.extend(extract_phones(text))
                link = rd.get("link", "")
                if link:
                    all_sources.append(link)
            engines_used.append("free_waterfall")
            logger.info(
                "Free waterfall: %d results, %d emails, %d phones",
                len(free_results), len(all_emails), len(all_phones),
            )
    except Exception as e:
        logger.warning("Free search waterfall failed: %s", e)

    # -- Bing API (if key provided) --
    if bing_api_key:
        results = search_bing(query, num_results, bing_api_key)
        if results:
            emails, phones, sources = extract_leads_from_results(results)
            all_emails.extend(emails)
            all_phones.extend(phones)
            all_sources.extend(sources)
            engines_used.append("bing")

    # -- Brave API (if key provided) --
    if brave_api_key:
        results = search_brave(query, num_results, brave_api_key)
        if results:
            emails, phones, sources = extract_leads_from_results(results)
            all_emails.extend(emails)
            all_phones.extend(phones)
            all_sources.extend(sources)
            engines_used.append("brave_api")

    # -- Legacy DuckDuckGo (only if free waterfall failed) --
    if use_duckduckgo and "free_waterfall" not in engines_used:
        results = search_duckduckgo(query, num_results)
        if results:
            emails, phones, sources = extract_leads_from_results(results)
            all_emails.extend(emails)
            all_phones.extend(phones)
            all_sources.extend(sources)
            engines_used.append("duckduckgo")

    # Deduplicate
    seen_emails: set[str] = set()
    unique_emails = [
        e for e in all_emails
        if not (
            e.lower() in seen_emails
            or seen_emails.add(e.lower())  # type: ignore[func-returns-value]
        )
    ]

    seen_phones: set[str] = set()
    unique_phones: list[str] = []
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
