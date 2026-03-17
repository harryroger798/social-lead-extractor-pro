"""Multi-engine free search waterfall for lead discovery.

Robust free search waterfall -- no API keys required:
  1. Brave Search (web scrape) - best quality, supports site: operators
  2. Startpage (web scrape) - proxied Google results, excellent quality
  3. DuckDuckGo Lite - simpler endpoint, more reliable than main DDG
  4. Mojeek - independent UK search engine, supports site: operator
  5. Qwant Lite - European privacy search, no-JS endpoint
  6. SearXNG public instances - meta-search, rotates across instances

Also includes page content scraping: visits discovered URLs with httpx
to extract emails/phones from full page content (not just snippets).

Retains API-key-based engines (Bing, Brave API) for users who have keys.

All free methods: Zero API keys | Zero browser automation | 100% ban-free.
Works in PyInstaller bundle on Windows/macOS/Linux.
"""

import html as _html_mod
import logging
import random
import re
import time
from typing import Optional
from urllib.parse import unquote, urlparse, parse_qs

try:
    import httpx
except ImportError:
    httpx = None  # type: ignore[assignment]

from app.services.anti_detection import AdSession
from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# User-Agent rotation
# ---------------------------------------------------------------------------

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
    """Generate realistic browser headers (rotated per-request)."""
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
    }


# ---------------------------------------------------------------------------
# Engine health tracking
# ---------------------------------------------------------------------------

class _EngineHealth:
    """Track per-engine success/failure for adaptive ordering."""

    def __init__(self) -> None:
        self.consecutive_failures: int = 0
        self.cooldown_until: float = 0.0

    def record_success(self) -> None:
        self.consecutive_failures = 0

    def record_failure(self) -> None:
        self.consecutive_failures += 1
        if self.consecutive_failures >= 3:
            self.cooldown_until = time.time() + 3600
        elif self.consecutive_failures >= 2:
            self.cooldown_until = time.time() + 300

    def try_reset(self) -> bool:
        """Attempt to reset cooldown if expired. Returns True if available.

        V7-fix: Do NOT reset consecutive_failures here — let record_success()
        do that after a confirmed success. This prevents a repeatedly-failing
        engine from escaping its cooldown on every waterfall call.
        """
        if self.consecutive_failures >= 2:
            if time.time() > self.cooldown_until:
                return True   # allow one probe; reset only on confirmed success
            return False
        return True

    @property
    def is_available(self) -> bool:
        """Check availability without side effects (read-only)."""
        if self.consecutive_failures >= 2:
            return time.time() > self.cooldown_until
        return True


_engine_health: dict[str, _EngineHealth] = {}


def _health(name: str) -> _EngineHealth:
    if name not in _engine_health:
        _engine_health[name] = _EngineHealth()
    return _engine_health[name]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _strip_tags(text: str) -> str:
    """Remove HTML tags and decode entities.

    Inserts a space when removing tags so adjacent text nodes don't concatenate
    (e.g., ``<span>phone</span><span>email</span>`` → ``phone email`` not
    ``phoneemail``).
    """
    cleaned = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
    cleaned = re.sub(r"<script[^>]*>.*?</script>", "", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)  # space, not empty string
    cleaned = _html_mod.unescape(cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def _make_client(timeout: float = 15.0) -> AdSession:
    """Create an anti-detection HTTP session (curl_cffi with httpx fallback)."""
    return AdSession(timeout=timeout, rate_limit=False)


# ===========================================================================
# FREE search engines (web scraping, no API keys needed)
# ===========================================================================

def search_brave_free(query: str, num_results: int = 10) -> list[dict]:
    """Scrape Brave Search HTML results (no API key needed).

    v3.5.39: Added Accept-Encoding: identity to prevent brotli/zstd
    compressed responses that cause curl error (23) CURLE_WRITE_ERROR.
    """
    health = _health("brave_free")
    if not health.is_available:
        return []
    try:
        with _make_client() as client:
            resp = client.get(
                "https://search.brave.com/search",
                params={"q": query, "source": "web"},
                headers={"Accept-Encoding": "identity"},  # v3.5.39: prevent brotli CURLE_WRITE_ERROR
                timeout=15.0,
            )
        if resp.status_code != 200:
            health.record_failure()
            logger.debug("Brave free: HTTP %d", resp.status_code)
            return []

        html = resp.text
        results: list[dict] = []

        for block in re.finditer(
            r'<div[^>]*class="snippet[^"]*"[^>]*>(.*?)</div>\s*</div>\s*</div>',
            html, re.DOTALL,
        ):
            content = block.group(1)
            url_m = re.search(r'<a[^>]*href="(https?://[^"]+)"', content)
            title_m = re.search(
                r'<span[^>]*class="snippet-title"[^>]*>(.*?)</span>',
                content, re.DOTALL,
            )
            if not title_m:
                title_m = re.search(
                    r'<div[^>]*class="title"[^>]*>(.*?)</div>',
                    content, re.DOTALL,
                )
            desc_m = re.search(
                r'<p[^>]*class="snippet-description"[^>]*>(.*?)</p>',
                content, re.DOTALL,
            )
            if not desc_m:
                desc_m = re.search(
                    r'<div[^>]*class="snippet-description"[^>]*>(.*?)</div>',
                    content, re.DOTALL,
                )

            if url_m:
                results.append({
                    "title": _strip_tags(title_m.group(1)) if title_m else "",
                    "snippet": _strip_tags(desc_m.group(1)) if desc_m else "",
                    "link": url_m.group(1),
                })
            if len(results) >= num_results:
                break

        # Fallback: simpler link extraction
        if not results:
            for m in re.finditer(
                r'<a[^>]*href="(https?://(?!search\.brave)[^"]+)"[^>]*>(.*?)</a>',
                html, re.DOTALL,
            ):
                url = m.group(1)
                title = _strip_tags(m.group(2))
                if url.startswith("http") and len(title) > 5 and "brave.com" not in url:
                    results.append({"title": title, "snippet": "", "link": url})
                if len(results) >= num_results:
                    break

        if results:
            health.record_success()
            logger.info("Brave free: %d results", len(results))
        else:
            health.record_failure()
        return results

    except Exception as exc:
        health.record_failure()
        logger.debug("Brave free error: %s", exc)
        return []


def search_startpage(query: str, num_results: int = 10) -> list[dict]:
    """Scrape Startpage results (proxied Google, no tracking)."""
    health = _health("startpage")
    if not health.is_available:
        return []
    try:
        with _make_client() as client:
            resp = client.post(
                "https://www.startpage.com/do/search",
                data={"query": query, "cat": "web", "language": "english"},
                timeout=15.0,
            )
        if resp.status_code != 200:
            health.record_failure()
            return []

        html = resp.text
        results: list[dict] = []

        for block in re.finditer(
            r'<a[^>]*class="w-gl__result-url[^"]*"[^>]*href="(https?://[^"]+)"'
            r'[^>]*>.*?<h3[^>]*>(.*?)</h3>.*?'
            r'<p[^>]*class="w-gl__description[^"]*"[^>]*>(.*?)</p>',
            html, re.DOTALL,
        ):
            results.append({
                "title": _strip_tags(block.group(2)),
                "snippet": _strip_tags(block.group(3)),
                "link": block.group(1),
            })
            if len(results) >= num_results:
                break

        if not results:
            for m in re.finditer(
                r'<a[^>]*href="(https?://(?!www\.startpage)[^"]+)"[^>]*'
                r'class="[^"]*result[^"]*"[^>]*>(.*?)</a>',
                html, re.DOTALL,
            ):
                results.append({
                    "title": _strip_tags(m.group(2)),
                    "snippet": "",
                    "link": m.group(1),
                })
                if len(results) >= num_results:
                    break

        if results:
            health.record_success()
            logger.info("Startpage: %d results", len(results))
        else:
            health.record_failure()
        return results

    except Exception as exc:
        health.record_failure()
        logger.debug("Startpage error: %s", exc)
        return []


def search_ddg_lite(query: str, num_results: int = 10) -> list[dict]:
    """Scrape DuckDuckGo Lite (simplified endpoint, more reliable)."""
    health = _health("ddg_lite")
    if not health.is_available:
        return []

    # DDG Lite supports site: and OR operators natively — pass query through
    # Previous code stripped these operators, destroying search quality for
    # LinkedIn, job boards, and all platform-scoped dorking queries.
    ddg_query = query

    try:
        with _make_client() as client:
            resp = client.post(
                "https://lite.duckduckgo.com/lite/",
                data={"q": ddg_query},
                timeout=15.0,
            )
        if resp.status_code not in (200, 202):
            health.record_failure()
            return []

        html = resp.text
        results: list[dict] = []

        # R3-B03 fix: DDG Lite HTML selectors — try multiple patterns
        # Pattern 1: Current DDG Lite layout (nofollow links)
        links = re.findall(
            r'<a\s+rel=["\']nofollow["\']\s+href=["\']([^"\'>]+)["\'][^>]*>(.*?)</a>',
            html, re.DOTALL,
        )
        # Pattern 2: Fallback — result-link class
        if not links:
            links = re.findall(
                r"<a[^>]*class=['\"]result-link['\"][^>]*href=['\"]([^'\"]+)['\"][^>]*>(.*?)</a>",
                html, re.DOTALL,
            )
        # Pattern 3: Fallback — any link in result table rows
        if not links:
            links = re.findall(
                r'<a[^>]*href=["\']((https?://[^"\'>]+))["\'][^>]*>(.*?)</a>',
                html, re.DOTALL,
            )
            # Reformat to (url, title) tuples
            links = [(m[0], m[2]) for m in links if not m[0].startswith('https://lite.duckduckgo')]
        snippets = re.findall(
            r"<td[^>]*class=['\"]result-snippet['\"][^>]*>(.*?)</td>",
            html, re.DOTALL,
        )
        if not snippets:
            snippets = re.findall(
                r'<span[^>]*class=["\']result-snippet["\'][^>]*>(.*?)</span>',
                html, re.DOTALL,
            )

        for i, (url, title) in enumerate(links):
            if url.startswith("//"):
                url = "https:" + url
            if "uddg=" in url:
                parsed = urlparse(url)
                params = parse_qs(parsed.query)
                url = unquote(params.get("uddg", [url])[0])
            if not url.startswith("http"):
                continue
            snippet = _strip_tags(snippets[i]) if i < len(snippets) else ""
            results.append({
                "title": _strip_tags(title),
                "snippet": snippet,
                "link": url,
            })
            if len(results) >= num_results:
                break

        if results:
            health.record_success()
            logger.info("DDG Lite: %d results", len(results))
        else:
            health.record_failure()
        return results

    except Exception as exc:
        health.record_failure()
        logger.debug("DDG Lite error: %s", exc)
        return []


def search_mojeek(query: str, num_results: int = 10) -> list[dict]:
    """Scrape Mojeek search results (independent UK engine)."""
    health = _health("mojeek")
    if not health.is_available:
        return []
    try:
        with _make_client() as client:
            resp = client.get(
                "https://www.mojeek.com/search",
                params={"q": query, "fmt": "html"},
                timeout=15.0,
            )
        if resp.status_code != 200:
            health.record_failure()
            return []

        html = resp.text
        results: list[dict] = []

        for block in re.finditer(
            r'<a[^>]*class="ob"[^>]*href="(https?://[^"]+)"[^>]*>(.*?)</a>'
            r'.*?<p[^>]*class="s"[^>]*>(.*?)</p>',
            html, re.DOTALL,
        ):
            results.append({
                "title": _strip_tags(block.group(2)),
                "snippet": _strip_tags(block.group(3)),
                "link": block.group(1),
            })
            if len(results) >= num_results:
                break

        if results:
            health.record_success()
            logger.info("Mojeek: %d results", len(results))
        else:
            health.record_failure()
        return results

    except Exception as exc:
        health.record_failure()
        logger.debug("Mojeek error: %s", exc)
        return []


def search_qwant_lite(query: str, num_results: int = 10) -> list[dict]:
    """Scrape Qwant Lite results (European privacy search)."""
    health = _health("qwant_lite")
    if not health.is_available:
        return []
    try:
        with _make_client() as client:
            resp = client.get(
                "https://lite.qwant.com/",
                params={"q": query, "t": "web"},
                timeout=15.0,
            )
        if resp.status_code != 200:
            health.record_failure()
            return []

        html = resp.text
        results: list[dict] = []

        for block in re.finditer(
            r'<a[^>]*href="(https?://(?!lite\.qwant)[^"]+)"[^>]*'
            r'class="[^"]*url[^"]*"[^>]*>'
            r'.*?</a>.*?<p[^>]*>(.*?)</p>',
            html, re.DOTALL,
        ):
            url = block.group(1)
            snippet = _strip_tags(block.group(2))
            results.append({"title": "", "snippet": snippet, "link": url})
            if len(results) >= num_results:
                break

        if not results:
            for m in re.finditer(
                r'<a[^>]*href="(https?://(?!lite\.qwant)[^"]+)"[^>]*>(.*?)</a>',
                html, re.DOTALL,
            ):
                url = m.group(1)
                title = _strip_tags(m.group(2))
                if len(title) > 5 and "qwant" not in url:
                    results.append({"title": title, "snippet": "", "link": url})
                if len(results) >= num_results:
                    break

        if results:
            health.record_success()
            logger.info("Qwant Lite: %d results", len(results))
        else:
            health.record_failure()
        return results

    except Exception as exc:
        health.record_failure()
        logger.debug("Qwant Lite error: %s", exc)
        return []


# v3.5.39: Replaced dead instances (bus-hit.me, tiekoetter.com, fmac.xyz)
# with verified-live instances. Dead instances caused DNS failures and
# JSON parse errors, wasting 12s+ per waterfall cycle.
_SEARXNG_INSTANCES = [
    "https://searx.be",
    "https://search.inetol.net",
    "https://paulgo.io",
    "https://search.ononoki.org",
    "https://searx.work",
]


def search_searxng(query: str, num_results: int = 10) -> list[dict]:
    """Query a random SearXNG public instance (JSON API)."""
    health = _health("searxng")
    if not health.is_available:
        return []

    instances = list(_SEARXNG_INSTANCES)
    random.shuffle(instances)

    for instance in instances[:3]:
        try:
            with _make_client(timeout=12.0) as client:
                resp = client.get(
                    f"{instance}/search",
                    params={
                        "q": query, "format": "json", "categories": "general",
                    },
                    timeout=12.0,
                )
            if resp.status_code != 200:
                continue

            data = resp.json()
            results: list[dict] = []
            for item in data.get("results", []):
                results.append({
                    "title": item.get("title", ""),
                    "snippet": item.get("content", ""),
                    "link": item.get("url", ""),
                })
                if len(results) >= num_results:
                    break

            if results:
                health.record_success()
                logger.info("SearXNG (%s): %d results", instance, len(results))
                return results

        except Exception as exc:
            logger.debug("SearXNG %s error: %s", instance, exc)
            continue

    health.record_failure()
    return []


# ===========================================================================
# API-key-based engines (optional, for users who have keys)
# ===========================================================================

def search_bing(
    query: str,
    num_results: int = 10,
    api_key: Optional[str] = None,
) -> list[dict]:
    """Search using Bing Web Search API v7 (free tier: 1K/month)."""
    if not api_key:
        return []
    try:
        with _make_client() as client:
            resp = client.get(
                "https://api.bing.microsoft.com/v7.0/search",
                params={"q": query, "count": min(num_results, 50)},
                headers={"Ocp-Apim-Subscription-Key": api_key},
                timeout=15.0,
            )
        if resp.status_code == 200:
            data = resp.json()
            return [
                {
                    "title": item.get("name", ""),
                    "snippet": item.get("snippet", ""),
                    "link": item.get("url", ""),
                }
                for item in data.get("webPages", {}).get("value", [])
            ]
        else:
            logger.warning("Bing API: HTTP %d", resp.status_code)
    except Exception as exc:
        logger.error("Bing search error: %s", exc)
    return []


def search_brave_api(
    query: str,
    num_results: int = 10,
    api_key: Optional[str] = None,
) -> list[dict]:
    """Search using Brave Search API (free tier: 2K/month)."""
    if not api_key:
        return []
    try:
        with _make_client() as client:
            resp = client.get(
                "https://api.search.brave.com/res/v1/web/search",
                params={"q": query, "count": min(num_results, 20)},
                headers={
                    "X-Subscription-Token": api_key,
                    "Accept": "application/json",
                },
                timeout=15.0,
            )
        if resp.status_code == 200:
            data = resp.json()
            return [
                {
                    "title": item.get("title", ""),
                    "snippet": item.get("description", ""),
                    "link": item.get("url", ""),
                }
                for item in data.get("web", {}).get("results", [])
            ]
        else:
            logger.warning("Brave API: HTTP %d", resp.status_code)
    except Exception as exc:
        logger.error("Brave API error: %s", exc)
    return []


# ===========================================================================
# Page content scraping -- visit URLs and extract emails/phones from pages
# ===========================================================================

_SKIP_DOMAINS = {
    "linkedin.com", "www.linkedin.com",
    "facebook.com", "www.facebook.com", "m.facebook.com",
    "instagram.com", "www.instagram.com",
    "twitter.com", "www.twitter.com", "x.com", "www.x.com",
    "tiktok.com", "www.tiktok.com",
    "pinterest.com", "www.pinterest.com",
    "reddit.com", "www.reddit.com", "old.reddit.com",
    "youtube.com", "www.youtube.com",
    "google.com", "www.google.com",
    "bing.com", "www.bing.com",
    "duckduckgo.com", "search.brave.com",
}


def scrape_page_emails(
    urls: list[str],
    max_urls: int = 8,
    delay: float = 2.0,
) -> dict:
    """Visit URLs with httpx and extract emails/phones from full page content.

    Skips social media domains (they block bots). Focuses on company websites,
    blogs, directories, news sites where contact info is publicly available.
    """
    all_emails: list[str] = []
    all_phones: list[str] = []
    urls_visited: list[str] = []

    seen_domains: set[str] = set()
    filtered_urls: list[str] = []
    for url in urls:
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            if domain in _SKIP_DOMAINS:
                continue
            base_domain = ".".join(domain.split(".")[-2:])
            if base_domain in seen_domains:
                continue
            seen_domains.add(base_domain)
            filtered_urls.append(url)
        except Exception:
            continue

    with AdSession(timeout=10.0, rate_limit=True, min_delay=2.0) as client:
        for url in filtered_urls[:max_urls]:
            try:
                resp = client.get(url, timeout=10.0)

                if resp.status_code != 200:
                    continue

                content_type = resp.headers.get("content-type", "")
                if "text/html" not in content_type and "text/plain" not in content_type:
                    continue

                text = resp.text[:200_000]
                page_text = _strip_tags(text)

                emails = extract_emails(page_text)
                phones = extract_phones(page_text)

                if emails or phones:
                    all_emails.extend(emails)
                    all_phones.extend(phones)
                    urls_visited.append(url)
                    logger.info(
                        "Page scrape %s: %d emails, %d phones",
                        url[:80], len(emails), len(phones),
                    )

                if delay > 0:
                    time.sleep(delay + random.uniform(0, 1))

            except Exception as exc:
                logger.debug("Page scrape error for %s: %s", url[:80], exc)
                continue

    return {
        "emails": all_emails,
        "phones": all_phones,
        "urls_visited": urls_visited,
    }


# ===========================================================================
# Free search waterfall
# ===========================================================================

_FREE_ENGINES: list[tuple[str, object]] = [
    ("brave_free", search_brave_free),
    ("startpage", search_startpage),
    ("ddg_lite", search_ddg_lite),
    ("mojeek", search_mojeek),
    ("qwant_lite", search_qwant_lite),
    ("searxng", search_searxng),
]


def free_search_waterfall(
    query: str,
    num_results: int = 10,
    min_results: int = 3,
    max_engines: int = 3,
) -> list[dict]:
    """Try free search engines in order until enough results found."""
    all_results: list[dict] = []
    seen_urls: set[str] = set()
    engines_tried = 0
    engines_used: list[str] = []

    for engine_name, engine_fn in _FREE_ENGINES:
        # R3-B07 fix: check both conditions independently
        if engines_tried >= max_engines:
            break
        if len(all_results) >= num_results:
            break

        health = _health(engine_name)
        if not health.try_reset():
            continue

        try:
            results = engine_fn(query, num_results)  # type: ignore[operator]
            engines_tried += 1

            if results:
                engines_used.append(engine_name)
                for r in results:
                    url_key = r.get("link", "").rstrip("/").lower()
                    if url_key not in seen_urls:
                        seen_urls.add(url_key)
                        all_results.append(r)

                if len(all_results) >= num_results:
                    break
        except Exception as exc:
            logger.debug("Waterfall engine %s failed: %s", engine_name, exc)

    logger.info(
        "Free waterfall: %d results from %s",
        len(all_results), "+".join(engines_used) or "none",
    )
    return all_results[:num_results]


# ===========================================================================
# Combined dispatcher (public API)
# ===========================================================================

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
    scrape_pages: bool = True,
) -> dict:
    """Search across multiple engines, combine results, scrape pages.

    Enhanced flow:
      1. Free waterfall (Brave/Startpage/DDG Lite/Mojeek/Qwant/SearXNG)
      2. API-key engines (Bing/Brave API) if keys provided
      3. Page content scraping -- visit discovered URLs for more emails/phones

    Returns dict with emails, phones, sources, engines_used.
    """
    all_emails: list[str] = []
    all_phones: list[str] = []
    all_sources: list[str] = []
    engines_used: list[str] = []

    # -- FREE waterfall (always available, no API keys needed) --
    try:
        free_results = free_search_waterfall(query, num_results)
        if free_results:
            emails, phones, sources = extract_leads_from_results(free_results)
            all_emails.extend(emails)
            all_phones.extend(phones)
            all_sources.extend(sources)
            engines_used.append("free_waterfall")
            logger.info(
                "Free waterfall: %d results, %d emails, %d phones",
                len(free_results), len(emails), len(phones),
            )
    except Exception as exc:
        logger.warning("Free search waterfall failed: %s", exc)

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
        results = search_brave_api(query, num_results, brave_api_key)
        if results:
            emails, phones, sources = extract_leads_from_results(results)
            all_emails.extend(emails)
            all_phones.extend(phones)
            all_sources.extend(sources)
            engines_used.append("brave_api")

    # -- Page content scraping (visit discovered URLs for more emails) --
    if scrape_pages and all_sources:
        try:
            page_results = scrape_page_emails(
                all_sources, max_urls=8, delay=2.0,
            )
            if page_results.get("emails"):
                all_emails.extend(page_results["emails"])
                engines_used.append("page_scrape")
                logger.info(
                    "Page scraping: %d extra emails, %d phones from %d URLs",
                    len(page_results["emails"]),
                    len(page_results.get("phones", [])),
                    len(page_results.get("urls_visited", [])),
                )
            if page_results.get("phones"):
                all_phones.extend(page_results["phones"])
        except Exception as exc:
            logger.warning("Page content scraping failed: %s", exc)

    # -- Deduplicate --
    seen_emails: set[str] = set()
    unique_emails: list[str] = []
    for email in all_emails:
        lower = email.lower()
        if lower not in seen_emails:
            seen_emails.add(lower)
            unique_emails.append(email)

    seen_phones: set[str] = set()
    unique_phones: list[str] = []
    for phone in all_phones:
        cleaned = re.sub(r"[^\d+]", "", phone)
        if cleaned not in seen_phones:
            seen_phones.add(cleaned)
            unique_phones.append(phone)

    return {
        "emails": unique_emails,
        "phones": unique_phones,
        "sources": list(set(all_sources)),
        "engines_used": engines_used,
    }
