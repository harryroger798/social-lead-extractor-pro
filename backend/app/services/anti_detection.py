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

import ipaddress
import logging
import random
import socket
import threading
import time
from typing import Any, Optional
from urllib.parse import urlparse

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

# Fail-fast: warn at import time if NEITHER backend is available
if not _HAS_CURL_CFFI and httpx is None:
    logger.critical(
        "No HTTP backend available! Install curl_cffi or httpx. "
        "All scraping will fail."
    )

# ---------------------------------------------------------------------------
# Browser fingerprint rotation — PAIRED profiles
# ---------------------------------------------------------------------------
# Each profile pairs an impersonate target with a matching User-Agent
# so TLS fingerprint and UA header always agree (Issue #3 fix).

_FINGERPRINT_PROFILES = [
    {
        "impersonate": "chrome131",
        "ua": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        ),
    },
    {
        "impersonate": "chrome130",
        "ua": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
        ),
    },
    {
        "impersonate": "chrome124",
        "ua": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        ),
    },
    {
        "impersonate": "chrome120",
        "ua": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
    },
    # R3-B10/B11 fix: use curl_cffi validated impersonate strings only
    # safari18_0 is not supported in most curl_cffi versions; use safari17_0
    {
        "impersonate": "safari17_0",
        "ua": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
            "(KHTML, like Gecko) Version/17.0 Safari/605.1.15"
        ),
    },
    {
        "impersonate": "safari15_5",
        "ua": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
            "(KHTML, like Gecko) Version/15.5 Safari/605.1.15"
        ),
    },
    # R3-B11 fix: edge131 not supported; use edge101 which is validated
    {
        "impersonate": "edge101",
        "ua": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36 Edg/101.0.1210.47"
        ),
    },
]

_ACCEPT_LANGUAGES = [
    "en-US,en;q=0.9",
    "en-GB,en;q=0.9",
    "en-US,en;q=0.9,es;q=0.8",
    "en,en-US;q=0.9",
]


def _random_profile() -> dict[str, str]:
    """Pick a random paired fingerprint profile."""
    return random.choice(_FINGERPRINT_PROFILES)


def _browser_headers(
    ua: str,
    extra: Optional[dict[str, str]] = None,
    accept_lang: Optional[str] = None,
    impersonate: Optional[str] = None,
) -> dict[str, str]:
    """Generate realistic browser headers with a specific User-Agent.

    R3-7 fix: Safari does NOT send Sec-Fetch-User header. Only add it
    for Chrome/Edge profiles to avoid fingerprint inconsistency.
    """
    headers = {
        "User-Agent": ua,
        "Accept": (
            "text/html,application/xhtml+xml,application/xml;"
            "q=0.9,image/webp,*/*;q=0.8"
        ),
        "Accept-Language": accept_lang or random.choice(_ACCEPT_LANGUAGES),
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
    }
    # R3-7 fix: Safari doesn't send Sec-Fetch-User; only Chrome/Edge do
    is_safari = impersonate and "safari" in impersonate.lower()
    if not is_safari:
        headers["Sec-Fetch-User"] = "?1"
    if extra:
        headers.update(extra)
    return headers


# ---------------------------------------------------------------------------
# Rate limiter — per-domain request throttling (thread-safe, Issue #1 fix)
# ---------------------------------------------------------------------------

_domain_lock = threading.Lock()
_domain_last_request: dict[str, float] = {}
_DEFAULT_DELAY = 2.0  # seconds between requests to the same domain
_MAX_QUEUE_DELAY = 10.0  # cap max queued delay to prevent unbounded accumulation


def _rate_limit(domain: str, min_delay: float = _DEFAULT_DELAY) -> None:
    """Sleep if needed to respect per-domain rate limits (thread-safe).

    Uses atomic check-and-set inside the lock to avoid TOCTOU race conditions.
    The sleep happens OUTSIDE the lock so other domains aren't blocked.
    """
    sleep_time = 0.0
    with _domain_lock:
        now = time.time()
        last = _domain_last_request.get(domain, 0.0)
        elapsed = now - last
        if elapsed < min_delay:
            jitter = random.uniform(0.1, 0.5)
            sleep_time = min_delay - elapsed + jitter
        # V7-fix: store the expected completion time (now + sleep_time).
        # This correctly serializes concurrent threads: the next caller sees
        # a future timestamp, computes negative elapsed, and queues behind us.
        _domain_last_request[domain] = now + max(sleep_time, 0.0)
    if sleep_time > 0:
        time.sleep(min(sleep_time, _MAX_QUEUE_DELAY))


# R3-B14 / R4-B08/B09 fix: comprehensive SSRF protection
_PRIVATE_NETWORKS = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]


def _is_private_ip(hostname: str) -> bool:
    """Check if hostname resolves to a private/reserved IP.

    R4-B09 fix: reject raw IP literals like 0.0.0.0, [::], etc.
    R4-B08 fix: DNS rebinding protection via strict IP validation.
    """
    # Reject hostnames containing ':' (port injection)
    if ':' in hostname and not hostname.startswith('['):
        return True
    # Check if hostname is a raw IP literal
    try:
        ip = ipaddress.ip_address(hostname.strip('[]'))
        if ip.is_private or ip.is_reserved or ip.is_loopback or ip.is_link_local:
            return True
        if str(ip) in ('0.0.0.0', '::'):
            return True
        for network in _PRIVATE_NETWORKS:
            if ip in network:
                return True
        return False
    except ValueError:
        pass  # Not an IP literal, resolve DNS
    # DNS resolution check
    try:
        infos = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        for info in infos:
            addr = info[4][0]
            try:
                ip = ipaddress.ip_address(addr)
                if ip.is_private or ip.is_reserved or ip.is_loopback or ip.is_link_local:
                    return True
                if str(ip) in ('0.0.0.0', '::'):
                    return True
                for network in _PRIVATE_NETWORKS:
                    if ip in network:
                        return True
            except ValueError:
                return True  # Unparseable IP, block conservatively
    except socket.gaierror:
        logger.debug("DNS resolution failed for %r — treating as potentially unsafe", hostname)
        return True
    return False


def _validate_url_scheme(url: str) -> bool:
    """Validate that a URL uses an allowed scheme (http or https only).

    Rejects file://, ftp://, gopher://, data:, etc. to prevent SSRF
    via scheme confusion. Also checks for private IP addresses.
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme.lower() not in ("http", "https"):
            return False
        hostname = parsed.hostname or ""
        if not hostname:
            return False
        if _is_private_ip(hostname):
            logger.warning("Blocked SSRF attempt to private IP: %s", hostname)
            return False
        return True
    except Exception:
        return False


def _extract_domain(url: str) -> str:
    """Extract domain from URL for rate limiting."""
    try:
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

    The same paired profile (impersonate target + matching UA) is used
    for the entire session lifetime to avoid fingerprint inconsistencies.
    """

    def __init__(
        self,
        timeout: float = 15.0,
        impersonate: Optional[str] = None,
        rate_limit: bool = True,
        min_delay: float = _DEFAULT_DELAY,
        retries: int = 2,
    ) -> None:
        self._timeout = timeout
        self._rate_limit_enabled = rate_limit
        self._min_delay = min_delay
        self._retries = retries
        self._session: Any = None

        # Pick a paired profile for consistent TLS + UA
        # R3-1 fix: When custom impersonate is provided, look up the matching UA
        # to avoid TLS fingerprint / User-Agent mismatch
        profile = _random_profile()
        if impersonate:
            matched = next(
                (p for p in _FINGERPRINT_PROFILES if p["impersonate"] == impersonate),
                None,
            )
            if matched:
                self._impersonate = matched["impersonate"]
                self._ua = matched["ua"]
            else:
                # N3 fix: unrecognized impersonate target — fall back to random profile
                # to avoid passing unknown string to curl_cffi which may raise ValueError
                logger.warning(
                    "Unknown impersonate target %r — using random profile", impersonate
                )
                self._impersonate = profile["impersonate"]
                self._ua = profile["ua"]
        else:
            self._impersonate = profile["impersonate"]
            self._ua = profile["ua"]
        # Fix R2-8: Accept-Language is consistent per session (not randomised per request)
        self._accept_language = random.choice(_ACCEPT_LANGUAGES)

        # R3-3 fix: pass accept_lang to session-level headers so they match
        # the per-request headers (avoids stale random Accept-Language in session)
        _init_headers = _browser_headers(
            self._ua, accept_lang=self._accept_language,
            impersonate=self._impersonate,
        )

        if _HAS_CURL_CFFI and CffiSession is not None:
            try:
                self._session = CffiSession(
                    impersonate=self._impersonate,
                    timeout=timeout,
                    headers=_init_headers,
                )
            except TypeError:
                # Older curl_cffi versions don't accept timeout in constructor
                self._session = CffiSession(
                    impersonate=self._impersonate,
                    headers=_init_headers,
                )
            self._backend = "curl_cffi"
        elif httpx is not None:
            self._session = httpx.Client(
                follow_redirects=True,
                timeout=timeout,
                headers=_init_headers,
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
        """Perform GET request with anti-detection and retry logic."""
        if not _validate_url_scheme(url):
            raise ValueError(f"Blocked non-HTTP(S) URL scheme: {url[:80]}")
        if self._rate_limit_enabled:
            _rate_limit(_extract_domain(url), self._min_delay)

        merged_headers = _browser_headers(self._ua, headers, accept_lang=self._accept_language, impersonate=self._impersonate)
        effective_timeout = self._timeout if timeout is None else timeout

        last_exc: Optional[Exception] = None
        for attempt in range(self._retries + 1):
            try:
                if self._backend == "curl_cffi":
                    resp = self._session.get(
                        url,
                        params=params,
                        headers=merged_headers,
                        allow_redirects=allow_redirects,
                        timeout=effective_timeout,
                    )
                else:
                    resp = self._session.get(
                        url,
                        params=params,
                        headers=merged_headers,
                        follow_redirects=allow_redirects,
                        timeout=effective_timeout,
                    )

                # Retry on 429 (rate limited) or 503 (service unavailable)
                if resp.status_code in (429, 503) and attempt < self._retries:
                    wait = (2 ** attempt) + random.random()
                    logger.debug(
                        "HTTP %d from %s, retrying in %.1fs (attempt %d/%d)",
                        resp.status_code, _extract_domain(url), wait,
                        attempt + 1, self._retries,
                    )
                    time.sleep(wait)
                    continue

                return resp

            except Exception as exc:
                last_exc = exc
                if attempt < self._retries:
                    wait = (2 ** attempt) + random.random()
                    logger.debug(
                        "Request error for %s: %s, retrying in %.1fs",
                        _extract_domain(url), exc, wait,
                    )
                    time.sleep(wait)
                else:
                    raise

        if last_exc:
            raise last_exc
        raise RuntimeError("Unexpected retry loop exit")

    def post(
        self,
        url: str,
        data: Optional[dict[str, Any]] = None,
        json: Optional[dict[str, Any]] = None,
        headers: Optional[dict[str, str]] = None,
        allow_redirects: bool = True,
        timeout: Optional[float] = None,
    ) -> Any:
        """Perform POST request with anti-detection and retry logic."""
        if not _validate_url_scheme(url):
            raise ValueError(f"Blocked non-HTTP(S) URL scheme: {url[:80]}")
        if self._rate_limit_enabled:
            _rate_limit(_extract_domain(url), self._min_delay)

        merged_headers = _browser_headers(self._ua, headers, accept_lang=self._accept_language, impersonate=self._impersonate)
        effective_timeout = self._timeout if timeout is None else timeout

        last_exc: Optional[Exception] = None
        for attempt in range(self._retries + 1):
            try:
                if self._backend == "curl_cffi":
                    resp = self._session.post(
                        url,
                        data=data,
                        json=json,
                        headers=merged_headers,
                        allow_redirects=allow_redirects,
                        timeout=effective_timeout,
                    )
                else:
                    resp = self._session.post(
                        url,
                        data=data,
                        json=json,
                        headers=merged_headers,
                        follow_redirects=allow_redirects,
                        timeout=effective_timeout,
                    )

                if resp.status_code in (429, 503) and attempt < self._retries:
                    wait = (2 ** attempt) + random.random()
                    time.sleep(wait)
                    continue

                return resp

            except Exception as exc:
                last_exc = exc
                if attempt < self._retries:
                    time.sleep((2 ** attempt) + random.random())
                else:
                    raise

        if last_exc:
            raise last_exc
        raise RuntimeError("Unexpected retry loop exit")

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
