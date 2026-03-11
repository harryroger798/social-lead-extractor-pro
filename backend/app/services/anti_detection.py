"""Anti-detection HTTP engine using curl_cffi for TLS fingerprint impersonation.

curl_cffi impersonates real browser JA3/JA4 TLS fingerprints at the C level,
making requests indistinguishable from genuine Chrome/Firefox/Safari traffic.
This eliminates the #1 cause of bot detection (TLS fingerprint mismatch)
that httpx/requests/aiohttp all suffer from.

Falls back to httpx gracefully if curl_cffi is not installed (e.g. during
development without C compiler), so the app never crashes.

Usage:
    from app.services.anti_detection import ad_get, ad_post, AdSession

    # Quick one-off request:
    resp = ad_get("https://example.com")

    # Session with connection reuse:
    with AdSession() as s:
        resp = s.get("https://example.com/page1")
        resp = s.get("https://example.com/page2")
"""

from __future__ import annotations

import logging
import random
import time
from typing import Any, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Try to import curl_cffi; fall back to httpx if unavailable
# ---------------------------------------------------------------------------
_HAS_CURL_CFFI = False
try:
    from curl_cffi.requests import Session as CffiSession  # type: ignore[import-untyped]
    _HAS_CURL_CFFI = True
    logger.info("curl_cffi available — using TLS fingerprint impersonation")
except ImportError:
    CffiSession = None  # type: ignore[assignment,misc]
    logger.warning(
        "curl_cffi not installed — falling back to httpx (no TLS impersonation)"
    )

try:
    import httpx
except ImportError:
    httpx = None  # type: ignore[assignment]

# ---------------------------------------------------------------------------
# Browser fingerprint rotation
# ---------------------------------------------------------------------------

# curl_cffi impersonate targets — rotate to avoid single-fingerprint detection
_IMPERSONATE_TARGETS = [
    "chrome131",
    "chrome130",
    "chrome124",
    "chrome120",
    "chrome119",
    "safari18_0",
    "safari17_5",
    "edge131",
    "edge127",
]

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


def _random_impersonate() -> str:
    """Pick a random browser impersonation target."""
    return random.choice(_IMPERSONATE_TARGETS)


def _browser_headers(extra: Optional[dict[str, str]] = None) -> dict[str, str]:
    """Generate realistic browser headers."""
    headers = {
        "User-Agent": random.choice(_USER_AGENTS),
        "Accept": (
            "text/html,application/xhtml+xml,application/xml;"
            "q=0.9,image/webp,*/*;q=0.8"
        ),
        "Accept-Language": random.choice(_ACCEPT_LANGUAGES),
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }
    if extra:
        headers.update(extra)
    return headers


# ---------------------------------------------------------------------------
# Rate limiter — per-domain request throttling
# ---------------------------------------------------------------------------

_domain_last_request: dict[str, float] = {}
_DEFAULT_DELAY = 2.0  # seconds between requests to the same domain


def _rate_limit(domain: str, min_delay: float = _DEFAULT_DELAY) -> None:
    """Sleep if needed to respect per-domain rate limits."""
    now = time.time()
    last = _domain_last_request.get(domain, 0.0)
    elapsed = now - last
    if elapsed < min_delay:
        jitter = random.uniform(0.1, 0.5)
        time.sleep(min_delay - elapsed + jitter)
    _domain_last_request[domain] = time.time()


def _extract_domain(url: str) -> str:
    """Extract domain from URL for rate limiting."""
    try:
        from urllib.parse import urlparse
        return urlparse(url).netloc.lower()
    except Exception:
        return "unknown"


# ---------------------------------------------------------------------------
# Unified session class
# ---------------------------------------------------------------------------

class AdSession:
    """Anti-detection HTTP session with TLS fingerprint impersonation.

    Uses curl_cffi when available, httpx as fallback.
    Supports context manager protocol.
    """

    def __init__(
        self,
        timeout: float = 15.0,
        impersonate: Optional[str] = None,
        rate_limit: bool = True,
        min_delay: float = _DEFAULT_DELAY,
    ) -> None:
        self._timeout = timeout
        self._impersonate = impersonate or _random_impersonate()
        self._rate_limit = rate_limit
        self._min_delay = min_delay
        self._session: Any = None

        if _HAS_CURL_CFFI and CffiSession is not None:
            self._session = CffiSession(
                impersonate=self._impersonate,
                timeout=timeout,
                headers=_browser_headers(),
            )
            self._backend = "curl_cffi"
        elif httpx is not None:
            self._session = httpx.Client(
                follow_redirects=True,
                timeout=timeout,
                headers=_browser_headers(),
            )
            self._backend = "httpx"
        else:
            raise RuntimeError(
                "Neither curl_cffi nor httpx is installed. "
                "Install one: pip install curl_cffi OR pip install httpx"
            )

    def __enter__(self) -> "AdSession":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()

    def close(self) -> None:
        """Close the underlying session."""
        if self._session is not None:
            try:
                self._session.close()
            except Exception:
                pass

    def get(
        self,
        url: str,
        params: Optional[dict[str, Any]] = None,
        headers: Optional[dict[str, str]] = None,
        allow_redirects: bool = True,
        timeout: Optional[float] = None,
    ) -> Any:
        """Perform GET request with anti-detection."""
        if self._rate_limit:
            _rate_limit(_extract_domain(url), self._min_delay)

        merged_headers = _browser_headers(headers)
        effective_timeout = timeout or self._timeout

        if self._backend == "curl_cffi":
            return self._session.get(
                url,
                params=params,
                headers=merged_headers,
                allow_redirects=allow_redirects,
                timeout=effective_timeout,
            )
        else:
            return self._session.get(
                url,
                params=params,
                headers=merged_headers,
                follow_redirects=allow_redirects,
                timeout=effective_timeout,
            )

    def post(
        self,
        url: str,
        data: Optional[dict[str, Any]] = None,
        json: Optional[dict[str, Any]] = None,
        headers: Optional[dict[str, str]] = None,
        allow_redirects: bool = True,
        timeout: Optional[float] = None,
    ) -> Any:
        """Perform POST request with anti-detection."""
        if self._rate_limit:
            _rate_limit(_extract_domain(url), self._min_delay)

        merged_headers = _browser_headers(headers)
        effective_timeout = timeout or self._timeout

        if self._backend == "curl_cffi":
            return self._session.post(
                url,
                data=data,
                json=json,
                headers=merged_headers,
                allow_redirects=allow_redirects,
                timeout=effective_timeout,
            )
        else:
            return self._session.post(
                url,
                data=data,
                json=json,
                headers=merged_headers,
                follow_redirects=allow_redirects,
                timeout=effective_timeout,
            )

    @property
    def backend(self) -> str:
        """Return which HTTP backend is in use."""
        return self._backend


# ---------------------------------------------------------------------------
# Module-level convenience functions
# ---------------------------------------------------------------------------

def ad_get(
    url: str,
    params: Optional[dict[str, Any]] = None,
    headers: Optional[dict[str, str]] = None,
    timeout: float = 15.0,
    rate_limit: bool = True,
) -> Any:
    """One-off GET request with anti-detection."""
    with AdSession(timeout=timeout, rate_limit=rate_limit) as s:
        return s.get(url, params=params, headers=headers)


def ad_post(
    url: str,
    data: Optional[dict[str, Any]] = None,
    json: Optional[dict[str, Any]] = None,
    headers: Optional[dict[str, str]] = None,
    timeout: float = 15.0,
    rate_limit: bool = True,
) -> Any:
    """One-off POST request with anti-detection."""
    with AdSession(timeout=timeout, rate_limit=rate_limit) as s:
        return s.post(url, data=data, json=json, headers=headers)
