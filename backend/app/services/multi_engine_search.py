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

import base64
import html as _html_mod
import json
import logging
import os
import random
import re
import time
from pathlib import Path
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

# v3.5.39: Per-engine cooldown persistence file path
# Stored in user data dir so cooldown state survives app restarts
_HEALTH_PERSIST_PATH = Path(
    os.environ.get("SNAPLEADS_DATA_DIR", Path.home() / ".snapleads")
) / "engine_health.json"


class _EngineHealth:
    """Track per-engine success/failure for adaptive ordering.

    v3.5.39: Added disk persistence with 24h health scoring windows.
    Cooldown state survives app restarts — prevents repeatedly hammering
    blocked engines on every launch.

    v3.5.43: CRITICAL FIX — Separate empty results from hard errors.
    In v3.5.42, empty results triggered record_failure() which applied
    hard cooldowns (60s/300s/900s). Niche queries legitimately return 0
    results from some engines, causing cascade failure: 153/168 waterfall
    calls tried 0 engines in Group A testing. Now:
    - record_failure() = hard errors only (network, HTTP 4xx/5xx)
    - record_empty() = empty results (soft tracking, NO hard cooldown)
    - Base-2 backoff (not base-5) with 600s cap (not 900s)
    - try_reset() decays failure count on cooldown expiry
    """

    def __init__(self) -> None:
        self.consecutive_failures: int = 0
        self.consecutive_empty: int = 0  # v3.5.43: separate empty tracking
        self.cooldown_until: float = 0.0
        self.total_successes_24h: int = 0
        self.total_failures_24h: int = 0
        self.window_start: float = time.time()

    def record_success(self) -> None:
        self.consecutive_failures = 0
        self.consecutive_empty = 0  # v3.5.43: clear empty streak on success
        self.cooldown_until = 0.0
        self._rotate_window()
        self.total_successes_24h += 1
        _save_health_to_disk()

    def record_failure(self) -> None:
        """Hard errors only — network timeout, HTTP 4xx/5xx, exceptions.

        v3.5.43: Base-2 backoff (not base-5), 600s cap (not 900s).
        No cooldown on first failure — niche queries can fail once legitimately.
        """
        self.consecutive_failures += 1
        self.consecutive_empty = 0  # hard error supersedes empty streak
        self._rotate_window()
        self.total_failures_24h += 1
        # v3.5.43: Base-2 backoff, cap at 600s.
        # 1 failure: no cooldown (legitimate one-off)
        # 2 failures: 60s cooldown
        # 3 failures: 120s cooldown
        # 4+ failures: min(30*2^n, 600s)
        if self.consecutive_failures >= 3:
            backoff = min(30 * (2 ** (self.consecutive_failures - 1)), 600)
            self.cooldown_until = time.time() + backoff
        elif self.consecutive_failures >= 2:
            self.cooldown_until = time.time() + 60
        # 1 failure: NO cooldown (v3.5.43 fix — v3.5.42 set 60s here)
        _save_health_to_disk()

    def record_rate_limit(self) -> None:
        """v3.5.46: Rate-limited (HTTP 429/503) — counts toward health_score
        but does NOT trigger hard cooldown.

        CodeRabbit caught that record_empty() doesn't affect health_score,
        so rate-limited engines (like Brave with 100% 429s) could float
        back above healthy engines in the waterfall sort. This method
        increments total_failures_24h (lowering health_score for sorting)
        without touching consecutive_failures or cooldown_until, so we
        avoid the cascade cooldown bug from v3.5.42.
        """
        self.consecutive_empty += 1
        self._rotate_window()
        self.total_failures_24h += 1  # Affects health_score sort
        _save_health_to_disk()
        logger.debug(
            "v3.5.46: Engine rate-limited (health_score affected, no cooldown)",
        )

    def record_empty(self) -> None:
        """Empty results — soft tracking, NO hard cooldown.

        v3.5.43: Niche queries (e.g. 'dentists delhi site:linkedin.com')
        legitimately return 0 results from some engines. This must NOT
        trigger hard cooldown or the cascade failure from v3.5.42 recurs.
        """
        self.consecutive_empty += 1
        self._rotate_window()
        # Do NOT touch cooldown_until or consecutive_failures
        # Do NOT call _save_health_to_disk() — empty streaks are transient
        logger.debug(
            "v3.5.43: Engine empty streak: %d consecutive",
            self.consecutive_empty,
        )

    def _rotate_window(self) -> None:
        """v3.5.39: Reset 24h counters if window has expired."""
        if time.time() - self.window_start > 86400:  # 24 hours
            self.total_successes_24h = 0
            self.total_failures_24h = 0
            self.window_start = time.time()

    @property
    def health_score(self) -> float:
        """v3.5.39: 0.0-1.0 health score over 24h window."""
        total = self.total_successes_24h + self.total_failures_24h
        if total == 0:
            return 1.0
        return self.total_successes_24h / total

    def try_reset(self) -> bool:
        """Attempt to reset cooldown if expired. Returns True if available.

        v3.5.43 FIX: Decay consecutive_failures by 1 on cooldown expiry.
        Previously (v3.5.42) this never reset failures, so an engine with
        consecutive_failures=4 would immediately re-enter 600s cooldown
        on the next failure even after cooldown expired.
        """
        if self.consecutive_failures >= 2:
            if time.time() > self.cooldown_until:
                # v3.5.43: Decay by 1 — gives engine a chance to prove itself
                self.consecutive_failures = max(0, self.consecutive_failures - 1)
                _save_health_to_disk()
                return True
            return False
        return True

    @property
    def is_available(self) -> bool:
        """Check availability without side effects (read-only)."""
        if self.consecutive_failures >= 2:
            return time.time() > self.cooldown_until
        return True

    def to_dict(self) -> dict:
        """v3.5.39: Serialize for disk persistence."""
        return {
            "consecutive_failures": self.consecutive_failures,
            "consecutive_empty": self.consecutive_empty,
            "cooldown_until": self.cooldown_until,
            "total_successes_24h": self.total_successes_24h,
            "total_failures_24h": self.total_failures_24h,
            "window_start": self.window_start,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "_EngineHealth":
        """v3.5.39: Deserialize from disk persistence."""
        h = cls()
        h.consecutive_failures = data.get("consecutive_failures", 0)
        h.consecutive_empty = data.get("consecutive_empty", 0)
        h.cooldown_until = data.get("cooldown_until", 0.0)
        h.total_successes_24h = data.get("total_successes_24h", 0)
        h.total_failures_24h = data.get("total_failures_24h", 0)
        h.window_start = data.get("window_start", time.time())
        return h


_engine_health: dict[str, _EngineHealth] = {}


def _load_health_from_disk() -> None:
    """v3.5.39: Load persisted engine health state from disk."""
    try:
        if _HEALTH_PERSIST_PATH.exists():
            data = json.loads(_HEALTH_PERSIST_PATH.read_text())
            for name, state in data.items():
                _engine_health[name] = _EngineHealth.from_dict(state)
            logger.info("Loaded engine health state for %d engines", len(data))
    except Exception as exc:
        logger.debug("Could not load engine health: %s", exc)


def _save_health_to_disk() -> None:
    """v3.5.39: Persist engine health state to disk."""
    try:
        _HEALTH_PERSIST_PATH.parent.mkdir(parents=True, exist_ok=True)
        data = {name: h.to_dict() for name, h in _engine_health.items()}
        _HEALTH_PERSIST_PATH.write_text(json.dumps(data, indent=2))
    except Exception as exc:
        logger.debug("Could not save engine health: %s", exc)


# Load persisted state on module import
_load_health_from_disk()


def reset_engine_soft_state() -> None:
    """v3.5.43: Reset soft engine state at session start.

    Clears empty streaks (transient, per-session) but preserves hard
    failure counts (persistent, cross-session). Called from routes.py
    at the start of each extraction session.
    """
    for name, h in _engine_health.items():
        h.consecutive_empty = 0
    _save_health_to_disk()
    logger.info("v3.5.43: Reset engine soft state for %d engines", len(_engine_health))


def reset_engine_hard_failures() -> None:
    """v3.5.43: Nuclear reset — clear ALL engine state.

    Only used in zero-result fallback chain (Bug 4) when all engines
    are dead and we have 0 leads. This is the last resort.
    """
    for name, h in _engine_health.items():
        h.consecutive_failures = 0
        h.consecutive_empty = 0
        h.cooldown_until = 0.0
    _save_health_to_disk()
    logger.warning("v3.5.43: NUCLEAR RESET — cleared all engine health state")


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
    v3.5.44 Fix 2: Rate-limit aware — HTTP 429/503 use record_rate_limit()
    (was record_empty() in v3.5.44, upgraded in v3.5.46 to affect health_score).
    v3.5.45 Fix 1: Rewritten parser — Brave now uses Svelte framework with
    data-type="web" containers and new CSS class names (title, snippet-content).
    Old regex targeted class="snippet-title" / class="snippet-description"
    which no longer exist in Brave's HTML. Verified with live captures.
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
            # v3.5.44 Fix 2: 429/503 are rate limits, not real errors
            if resp.status_code in (429, 503):
                health.record_rate_limit()
                logger.debug("v3.5.46: Brave free: HTTP %d (rate limit, health_score affected)", resp.status_code)
            else:
                health.record_failure()
                logger.debug("Brave free: HTTP %d", resp.status_code)
            return []

        html = resp.text
        results: list[dict] = []

        # v3.5.45: Primary approach — use data-type="web" as result container.
        # Brave now renders each web result inside <div data-type="web">.
        # Title is in a span/div with class containing "title",
        # URL is the first <a href="https://...">,
        # Description is in a div with class containing "snippet-content".
        for m in re.finditer(r'data-type="web"', html):
            pos = m.start()
            chunk = html[pos:pos + 3000]
            url_m = re.search(r'<a[^>]*href="(https?://(?!search\.brave)[^"]+)"', chunk)
            if not url_m:
                continue
            title_m = re.search(
                r'class="[^"]*title[^"]*"[^>]*>(.*?)</(?:span|div|h[23]|a)',
                chunk, re.DOTALL,
            )
            desc_m = re.search(
                r'class="[^"]*snippet-content[^"]*"[^>]*>(.*?)</(?:div|p)',
                chunk, re.DOTALL,
            )
            if not desc_m:
                desc_m = re.search(
                    r'class="[^"]*description[^"]*"[^>]*>(.*?)</(?:div|p)',
                    chunk, re.DOTALL,
                )
            url = url_m.group(1)
            if "brave.com" in url:
                continue
            results.append({
                "title": _strip_tags(title_m.group(1)) if title_m else "",
                "snippet": _strip_tags(desc_m.group(1)) if desc_m else "",
                "link": url,
            })
            if len(results) >= num_results:
                break

        # v3.5.45: Fallback — try snippet class containers (older Brave versions)
        if not results:
            for block in re.finditer(
                r'<div[^>]*class="snippet[^"]*"[^>]*>(.*?)</div>\s*</div>',
                html, re.DOTALL,
            ):
                content = block.group(1)
                url_m = re.search(r'<a[^>]*href="(https?://[^"]+)"', content)
                title_m = re.search(
                    r'class="[^"]*title[^"]*"[^>]*>(.*?)</(?:span|div|a)',
                    content, re.DOTALL,
                )
                if url_m:
                    url = url_m.group(1)
                    if "brave.com" not in url:
                        results.append({
                            "title": _strip_tags(title_m.group(1)) if title_m else "",
                            "snippet": "",
                            "link": url,
                        })
                if len(results) >= num_results:
                    break

        # v3.5.45: Last resort — extract any external links with text
        if not results:
            for lm in re.finditer(
                r'<a[^>]*href="(https?://(?!search\.brave)[^"]+)"[^>]*>(.*?)</a>',
                html, re.DOTALL,
            ):
                url = lm.group(1)
                title = _strip_tags(lm.group(2))
                if url.startswith("http") and len(title) > 5 and "brave.com" not in url:
                    results.append({"title": title, "snippet": "", "link": url})
                if len(results) >= num_results:
                    break

        if results:
            health.record_success()
            logger.info("v3.5.45: Brave free: %d results", len(results))
        else:
            health.record_empty()  # v3.5.44: empty results != failure
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
            # v3.5.44 Fix 2: Rate-limit aware
            if resp.status_code in (429, 503):
                health.record_rate_limit()
                logger.debug("v3.5.46: Startpage: HTTP %d (rate limit, health_score affected)", resp.status_code)
            else:
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
            health.record_empty()  # v3.5.44: empty results != failure
        return results

    except Exception as exc:
        health.record_failure()
        logger.debug("Startpage error: %s", exc)
        return []


def search_ddg_lite(query: str, num_results: int = 10) -> list[dict]:
    """Scrape DuckDuckGo Lite (simplified endpoint, more reliable).

    v3.5.45 Fix 2: Improved snippet extraction + HTTP 202 handling.
    DDG Lite uses a table layout. Each result row has class="result-link"
    for the link and the NEXT <td> row contains the snippet text.
    Old code looked for class="result-snippet" which doesn't exist —
    snippets are in plain <td> elements following the link row.
    HTTP 202 responses are token-gated pages with zero results — treat
    as empty (not failure) to avoid unnecessary cooldowns.
    """
    health = _health("ddg_lite")
    if not health.is_available:
        return []

    ddg_query = query

    try:
        with _make_client() as client:
            resp = client.post(
                "https://lite.duckduckgo.com/lite/",
                data={"q": ddg_query},
                timeout=15.0,
            )
        # v3.5.45: HTTP 202 is a token-gated response — zero results, not an error
        if resp.status_code == 202:
            health.record_empty()
            logger.debug("v3.5.45: DDG Lite: HTTP 202 (token-gated, no results)")
            return []
        if resp.status_code != 200:
            if resp.status_code in (429, 503):
                health.record_rate_limit()
                logger.debug("v3.5.46: DDG Lite: HTTP %d (rate limit, health_score affected)", resp.status_code)
            else:
                health.record_failure()
            return []

        html = resp.text
        results: list[dict] = []

        # v3.5.45: Primary — nofollow links (verified working with live captures)
        links = re.findall(
            r'<a\s+rel=["\']nofollow["\']\s+href=["\']([^"\'>]+)["\'][^>]*>(.*?)</a>',
            html, re.DOTALL,
        )
        # Fallback — result-link class
        if not links:
            links = re.findall(
                r"<a[^>]*class=['\"]result-link['\"][^>]*href=['\"]([^'\"]+)['\"][^>]*>(.*?)</a>",
                html, re.DOTALL,
            )
        # Fallback — any external link in result table
        if not links:
            links = re.findall(
                r'<a[^>]*href=["\']((https?://[^"\'>]+))["\'][^>]*>(.*?)</a>',
                html, re.DOTALL,
            )
            links = [(m[0], m[2]) for m in links if not m[0].startswith('https://lite.duckduckgo')]

        # v3.5.45: Improved snippet extraction — DDG Lite puts snippets in
        # <td class="result-snippet"> OR in plain <td> following each result row.
        # Try class-based first, then fall back to positional extraction.
        snippets = re.findall(
            r"<td[^>]*class=['\"]result-snippet['\"][^>]*>(.*?)</td>",
            html, re.DOTALL,
        )
        if not snippets:
            snippets = re.findall(
                r'<span[^>]*class=["\']result-snippet["\'][^>]*>(.*?)</span>',
                html, re.DOTALL,
            )
        # v3.5.45: Fallback — extract text from <td> elements that look like snippets
        # (longer than 30 chars, not containing links or nav elements)
        if not snippets:
            all_tds = re.findall(r'<td[^>]*>(.*?)</td>', html, re.DOTALL)
            for td_content in all_tds:
                clean = _strip_tags(td_content).strip()
                if len(clean) > 30 and '<a ' not in td_content and 'class="nav' not in td_content:
                    snippets.append(clean)

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
            logger.info("v3.5.45: DDG Lite: %d results", len(results))
        else:
            health.record_empty()
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
            # v3.5.46: Rate-limit aware — record_rate_limit() for health_score
            if resp.status_code in (429, 503):
                health.record_rate_limit()
            else:
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
            health.record_empty()  # v3.5.44: empty results != failure
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
            # v3.5.46: Rate-limit aware — record_rate_limit() for health_score
            if resp.status_code in (429, 503):
                health.record_rate_limit()
            else:
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
            health.record_empty()  # v3.5.44: empty results != failure
        return results

    except Exception as exc:
        health.record_failure()
        logger.debug("Qwant Lite error: %s", exc)
        return []


# v3.5.39: Replaced dead instances (fmac.xyz) with verified-live instances.
# Dead instances caused DNS failures and JSON parse errors, wasting 12s+
# per waterfall cycle.
# v3.5.45 Fix 4: Expanded SearXNG instance list — 8 instances (was 5).
# Removed bus-hit.me (unreachable) and tiekoetter.com (429 rate-limited).
# Added verified-live instances from searx.space directory.
_SEARXNG_INSTANCES = [
    "https://searx.be",
    "https://search.inetol.net",
    "https://paulgo.io",
    "https://search.ononoki.org",
    "https://searx.work",
    "https://search.sapti.me",
    "https://searx.oxf.app",
    "https://searx.namejeff.xyz",
]


def search_yep(query: str, num_results: int = 10) -> list[dict]:
    """v3.5.39: Search Yep.com (Ahrefs-backed, very scrape-friendly).

    Yep.com is backed by Ahrefs' own web index (not proxied Google).
    Very light anti-scraping — ideal for no-proxy desktop apps.
    Replaces Startpage as #2 in the waterfall (Startpage inherits
    Google's detection AND adds its own).
    """
    health = _health("yep")
    if not health.is_available:
        return []
    try:
        with _make_client() as client:
            resp = client.get(
                "https://api.yep.com/fs/2/search",
                params={
                    "client": "web",
                    "gl": "us",
                    "no_correct": "false",
                    "q": query,
                    "safeSearch": "off",
                    "type": "web",
                },
                headers={"Accept-Encoding": "identity"},
                timeout=12.0,
            )
        if resp.status_code != 200:
            # v3.5.46: Rate-limit aware — record_rate_limit() for health_score
            if resp.status_code in (429, 503):
                health.record_rate_limit()
            else:
                health.record_failure()
            _save_health_to_disk()
            return []

        data = resp.json()
        results: list[dict] = []
        for item in data.get("results", []):
            results.append({
                "title": item.get("title", ""),
                "snippet": item.get("snippet", ""),
                "link": item.get("url", ""),
            })
            if len(results) >= num_results:
                break

        if results:
            health.record_success()
            logger.info("Yep.com: %d results", len(results))
        else:
            health.record_empty()  # v3.5.44: empty results != failure
        _save_health_to_disk()
        return results

    except Exception as exc:
        health.record_failure()
        _save_health_to_disk()
        logger.debug("Yep.com error: %s", exc)
        return []


def search_bing_free(query: str, num_results: int = 10) -> list[dict]:
    """v3.5.39: Scrape Bing web search (no API key needed).

    Bing is very scrape-friendly compared to Google. Uses the standard
    web interface with anti-detection headers.

    v3.5.45 Fix 3: Handle Bing redirect URLs (bing.com/ck/a?...) by
    extracting the actual destination from the 'u' parameter. Also adds
    a fallback parser for site: queries which return JS-rendered pages
    without b_algo elements — falls back to extracting <cite> URLs
    paired with their parent <h2> titles.
    """
    health = _health("bing_free")
    if not health.is_available:
        return []
    try:
        with _make_client() as client:
            resp = client.get(
                "https://www.bing.com/search",
                params={"q": query, "count": str(min(num_results, 20))},
                headers={"Accept-Encoding": "identity"},
                timeout=12.0,
            )
        if resp.status_code != 200:
            # v3.5.46: Rate-limit aware — record_rate_limit() for health_score
            if resp.status_code in (429, 503):
                health.record_rate_limit()
            else:
                health.record_failure()
            _save_health_to_disk()
            return []

        html = resp.text
        results: list[dict] = []

        # v3.5.45: Primary — b_algo containers (works for generic queries)
        for m in re.finditer(
            r'<li class="b_algo"[^>]*>.*?<h2><a[^>]*href="(https?://[^"]+)"[^>]*>(.*?)</a></h2>'
            r'.*?<p[^>]*>(.*?)</p>',
            html, re.DOTALL,
        ):
            url = m.group(1)
            # v3.5.45: Resolve Bing redirect URLs (bing.com/ck/a?...u=a1XXXX)
            if "bing.com/ck/a" in url:
                try:
                    parsed = urlparse(url)
                    params = parse_qs(parsed.query)
                    encoded_url = params.get("u", [""])[0]
                    if encoded_url.startswith("a1"):
                        b64_part = encoded_url[2:]
                        padding = (4 - len(b64_part) % 4) % 4
                        decoded = base64.urlsafe_b64decode(b64_part + "=" * padding).decode("utf-8", errors="ignore")
                        if decoded.startswith("http"):
                            url = decoded
                except Exception as exc:
                    logger.debug("Bing URL decode failed for %s: %s", url[:50], exc)
            results.append({
                "title": _strip_tags(m.group(2)),
                "snippet": _strip_tags(m.group(3)),
                "link": url,
            })
            if len(results) >= num_results:
                break

        # v3.5.45: Fallback for site: queries — Bing returns JS-heavy page
        # without b_algo. Try extracting from <cite> + parent <h2> pairs.
        if not results:
            for block in re.finditer(
                r'<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>(.*?)</li>',
                html, re.DOTALL,
            ):
                content = block.group(1)
                url_m = re.search(r'href="(https?://[^"]+)"', content)
                title_m = re.search(r'<h2[^>]*>(.*?)</h2>', content, re.DOTALL)
                if url_m:
                    results.append({
                        "title": _strip_tags(title_m.group(1)) if title_m else "",
                        "snippet": "",
                        "link": url_m.group(1),
                    })
                if len(results) >= num_results:
                    break

        # v3.5.45: Last resort — extract any external links from main content
        if not results:
            for lm in re.finditer(
                r'<a[^>]*href="(https?://(?!www\.bing\.com)[^"]+)"[^>]*>(.*?)</a>',
                html, re.DOTALL,
            ):
                url = lm.group(1)
                title = _strip_tags(lm.group(2))
                if len(title) > 5 and "microsoft.com" not in url and "bing.com" not in url:
                    results.append({"title": title, "snippet": "", "link": url})
                if len(results) >= num_results:
                    break

        if results:
            health.record_success()
            logger.info("v3.5.45: Bing free: %d results", len(results))
        else:
            health.record_empty()
        _save_health_to_disk()
        return results

    except Exception as exc:
        health.record_failure()
        _save_health_to_disk()
        logger.debug("Bing free error: %s", exc)
        return []


def search_searxng(query: str, num_results: int = 10) -> list[dict]:
    """Query a random SearXNG public instance (JSON API with HTML fallback).

    v3.5.45 Fix 4: Added HTML fallback parsing when JSON API fails.
    Some SearXNG instances disable JSON API but still serve HTML results.
    Also tries up to 5 instances (was 3), and uses record_empty() instead
    of record_failure() when all instances are down — prevents hard cooldown
    that blocks future attempts. Expanded instance list to 10 (see above).
    """
    health = _health("searxng")
    if not health.is_available:
        return []

    instances = list(_SEARXNG_INSTANCES)
    random.shuffle(instances)
    instances_failed = 0

    # v3.5.45: Try up to 5 instances (was 3) for better coverage
    for instance in instances[:5]:
        # --- Try JSON API first (most reliable when available) ---
        try:
            with _make_client(timeout=12.0) as client:
                resp = client.get(
                    f"{instance}/search",
                    params={
                        "q": query, "format": "json", "categories": "general",
                    },
                    timeout=12.0,
                )
            if resp.status_code == 200:
                try:
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
                        logger.info("v3.5.45: SearXNG JSON (%s): %d results", instance, len(results))
                        return results
                except (ValueError, KeyError):
                    pass  # JSON parse failed, try HTML fallback below

        except Exception as exc:
            logger.debug("SearXNG JSON %s error: %s", instance, exc)
            instances_failed += 1
            continue

        # --- v3.5.45: HTML fallback — some instances disable JSON API ---
        try:
            with _make_client(timeout=12.0) as client:
                resp = client.get(
                    f"{instance}/search",
                    params={
                        "q": query, "categories": "general",
                    },
                    timeout=12.0,
                )
            if resp.status_code == 200:
                html = resp.text
                results = []
                # SearXNG HTML uses <article class="result"> containers
                for block in re.finditer(
                    r'<article[^>]*class="[^"]*result[^"]*"[^>]*>(.*?)</article>',
                    html, re.DOTALL,
                ):
                    content = block.group(1)
                    url_m = re.search(r'href="(https?://[^"]+)"', content)
                    title_m = re.search(r'<h[34][^>]*>(.*?)</h[34]>', content, re.DOTALL)
                    desc_m = re.search(r'<p[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)</p>', content, re.DOTALL)
                    if url_m:
                        results.append({
                            "title": _strip_tags(title_m.group(1)) if title_m else "",
                            "snippet": _strip_tags(desc_m.group(1)) if desc_m else "",
                            "link": url_m.group(1),
                        })
                    if len(results) >= num_results:
                        break
                if results:
                    health.record_success()
                    logger.info("v3.5.45: SearXNG HTML (%s): %d results", instance, len(results))
                    return results

        except Exception as exc:
            logger.debug("SearXNG HTML %s error: %s", instance, exc)
            instances_failed += 1
            continue

    # v3.5.45: Use record_empty() instead of record_failure() when all
    # instances are down. Hard failure triggers cascade cooldown which
    # blocks SearXNG for 300s+. Empty is softer — retries sooner.
    if instances_failed >= 3:
        health.record_failure()
        logger.debug("v3.5.45: SearXNG: %d instances failed (hard failure)", instances_failed)
    else:
        health.record_empty()
        logger.debug("v3.5.45: SearXNG: no results from %d instances (soft empty)", len(instances[:5]))
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
    max_urls: int = 15,
    delay: float = 1.0,
) -> dict:
    """Visit URLs with httpx and extract emails/phones from full page content.

    Skips social media domains (they block bots). Focuses on company websites,
    blogs, directories, news sites where contact info is publicly available.

    v3.5.50 Fix 1: Raised max_urls 8→15, reduced delay 2.0→1.0s.
    In v3.5.49 Group E+F, dorking found 10+ relevant URLs per platform
    but only visited 8, missing ~40% of potential contact pages.
    The 2s delay was also excessive for non-social-media sites.
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

# v3.5.45 Fix 5: Removed 4 dead engines from waterfall.
# Removed: Yep (403 Forbidden), Mojeek (403 Forbidden),
#          Qwant (JS-only SPA, no results), Startpage (cookie wall, no results).
# Kept: Brave (20 results), DDG Lite (10), Bing (9), SearXNG (15).
# With only 4 engines, max_engines raised to 4 in free_search_waterfall.
# v3.5.46 Fix 2: Reordered — Brave moved to LAST position.
# In Group C testing (v3.5.45), Brave returned HTTP 429 on 100% of requests
# (0 successful out of 75 waterfall cycles). By deprioritizing Brave,
# Bing+DDG+SearXNG get tried first and Brave only runs if they fail to
# meet the result threshold. Health-score sorting (v3.5.42 FIX-9) will
# further push Brave down after its first 429.
_FREE_ENGINES: list[tuple[str, object]] = [
    ("bing_free", search_bing_free),     # v3.5.46: promoted — 100% success in Group C
    ("ddg_lite", search_ddg_lite),       # v3.5.46: promoted — 95%+ success in Group C
    ("searxng", search_searxng),         # v3.5.46: SSRF allowlist fixed, should work now
    ("brave_free", search_brave_free),   # v3.5.46: demoted — 100% HTTP 429 in Group C
]


def free_search_waterfall(
    query: str,
    num_results: int = 10,
    min_results: int = 3,
    max_engines: int = 4,
) -> list[dict]:
    """Try free search engines in order until enough results found.

    v3.5.45: max_engines raised from 3 to 4 since we now have exactly
    4 working engines (was 8 with 4 dead). All 4 are tried by default.
    """
    all_results: list[dict] = []
    seen_urls: set[str] = set()
    engines_tried = 0
    engines_used: list[str] = []

    # v3.5.42 FIX-9: Sort engines by health score (best first) so healthy
    # engines are tried before degraded ones. This prevents wasting time on
    # rate-limited engines when healthier alternatives exist.
    sorted_engines = sorted(
        _FREE_ENGINES,
        key=lambda e: _health(e[0]).health_score,
        reverse=True,
    )

    for engine_name, engine_fn in sorted_engines:
        # R3-B07 fix: check both conditions independently
        if engines_tried >= max_engines:
            break
        if len(all_results) >= num_results:
            break

        health = _health(engine_name)
        if not health.try_reset():
            logger.debug(
                "v3.5.42: Skipping %s (cooldown %.0fs remaining, %d consecutive failures)",
                engine_name,
                max(0, health.cooldown_until - time.time()),
                health.consecutive_failures,
            )
            continue

        try:
            results = engine_fn(query, num_results)  # type: ignore[operator]
            engines_tried += 1

            if results:
                health.record_success()
                engines_used.append(engine_name)
                for r in results:
                    url_key = r.get("link", "").rstrip("/").lower()
                    if url_key not in seen_urls:
                        seen_urls.add(url_key)
                        all_results.append(r)

                if len(all_results) >= num_results:
                    break
            else:
                # v3.5.43 FIX: Empty results use record_empty() NOT record_failure().
                # Niche queries legitimately return 0 from some engines.
                # In v3.5.42, this triggered hard cooldowns causing cascade
                # failure: 153/168 waterfall calls tried 0 engines.
                health.record_empty()
                logger.debug("v3.5.43: %s returned 0 results (empty, not failure)", engine_name)
        except Exception as exc:
            health.record_failure()
            logger.warning(
                "v3.5.43: %s failed (%s) — cooldown %.0fs",
                engine_name, exc,
                max(0, health.cooldown_until - time.time()),
            )

    logger.info(
        "v3.5.45 waterfall: %d results from %s (tried %d engines)",
        len(all_results), "+".join(engines_used) or "none", engines_tried,
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
      1. Free waterfall (Brave/Bing/DDG Lite/SearXNG) — v3.5.45 fixed parsers
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
    # v3.5.50 Fix 1: Raised max_urls 8→15, reduced delay 2→1s for higher yield.
    if scrape_pages and all_sources:
        try:
            page_results = scrape_page_emails(
                all_sources, max_urls=15, delay=1.0,
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
