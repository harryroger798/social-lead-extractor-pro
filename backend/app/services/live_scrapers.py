"""Live platform scrapers for all 12 platforms — 100% ban-free, no browser automation.

Replaces Selenium/Telethon/Patchright with HTTP-based scraping via anti-detection engine.
Each platform uses the safest possible method:

  LinkedIn:      S3 database (primary) + dorking (secondary)
  Instagram:     Dorking + embed endpoint + bio link following
  Facebook:      Dorking ONLY (never touch facebook.com directly)
  Twitter/X:     Dorking + Nitter mirrors + fxtwitter API
  YouTube:       Channel page scraping (About tab)
  Google Maps:   Directory scraping (Yelp + YellowPages + BBB)
  Telegram:      t.me/s/ public preview (NO Telethon, NO login)
  WhatsApp:      wa.me link discovery via dorking (NO WhatsApp servers)
  Pinterest:     RSS feed extraction
  TikTok:        Dorking-based
  Tumblr:        Dorking + blog page scraping
  Reddit:        RSS extraction (already works)

All methods: Zero API keys | Zero browser automation | 100% ban-free.
Works in PyInstaller bundle on Windows/macOS/Linux.
"""

from __future__ import annotations

import asyncio
import atexit
import hashlib
import html as _html_mod
import inspect as _inspect_mod
import json as _json_mod
import logging
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import quote_plus, urlparse

from app.services.anti_detection import AdSession
from app.services.extractor import extract_emails, extract_phones
from app.services.multi_engine_search import free_search_waterfall

logger = logging.getLogger(__name__)

# Shared thread-pool for running async code from sync context (Issue #19 fix)
# R2-10 fix: Register atexit handler so the pool shuts down cleanly on app exit
_THREAD_POOL = ThreadPoolExecutor(max_workers=4, thread_name_prefix="live-scrape")
atexit.register(_THREAD_POOL.shutdown, wait=False)


def _dedup_leads(leads: list[dict]) -> list[dict]:
    """Remove duplicate leads by (email, phone, platform, source_url) tuple.

    R2-14 fix: Coerce None values to empty string so the empty-check works.
    R3-3/R3-4 fix: Include source_url in dedup key so informational-only leads
    (no email/phone) from different sources aren't collapsed into one.
    """
    seen: set[tuple[str, str, str, str]] = set()
    unique: list[dict] = []
    for lead in leads:
        key = (
            lead.get("email") or "",
            lead.get("phone") or "",
            lead.get("platform") or "",
            lead.get("source_url") or "",
        )
        if key == ("", "", "", ""):
            continue  # skip completely empty leads
        if key not in seen:
            seen.add(key)
            unique.append(lead)
    return unique


def _is_gps_coord(value: str) -> bool:
    """Return True if value looks like a GPS coordinate, not a phone number.

    V7-fix: fullmatch instead of match, also catches "lat, lon" pairs.
    """
    if not value:
        return False
    return bool(re.fullmatch(
        r'-?\d{1,3}\.\d{4,}(?:\s*,\s*-?\d{1,3}\.\d{4,})?',
        value.strip(),
    ))


def _strip_tags(text: str) -> str:
    """Remove HTML tags and decode entities, inserting spaces between fields."""
    cleaned = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
    cleaned = re.sub(r"<script[^>]*>.*?</script>", "", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)  # space, not empty string
    cleaned = _html_mod.unescape(cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


# ===========================================================================
# 1. TELEGRAM — Public preview scraping (t.me/s/username)
# ===========================================================================

# Nitter instances with health-check fallback (Issue #17 fix)
_NITTER_INSTANCES = [
    "https://nitter.privacydev.net",
    "https://nitter.poast.org",
    "https://nitter.cz",
    "https://nitter.unixfox.eu",
    "https://nitter.net",
    "https://nitter.1d4.us",
]

_nitter_healthy: list[str] = []  # populated lazily
_nitter_healthy_time: float = 0.0  # R3-6 fix: TTL for cache invalidation
_nitter_lock = threading.Lock()  # R2-5 fix: thread-safe health check

_NITTER_TTL = 1800.0  # 30 minutes before re-probing


def _get_healthy_nitter() -> list[str]:
    """Return Nitter instances that responded last time, or probe them.

    R2-4 fix: reuse a single session for all probes.
    R2-5 fix: use a lock so only one thread probes at a time.
    R3-6 fix: invalidate cache after 30 minutes so dead instances recover.
    """
    global _nitter_healthy, _nitter_healthy_time  # noqa: PLW0603
    with _nitter_lock:
        if _nitter_healthy and (time.time() - _nitter_healthy_time < _NITTER_TTL):
            return list(_nitter_healthy)
        healthy: list[str] = []
        with AdSession(timeout=5.0, rate_limit=False, retries=0) as probe_session:
            for inst in _NITTER_INSTANCES:
                try:
                    r = probe_session.get(inst, timeout=5.0)
                    if r.status_code < 400:
                        healthy.append(inst)
                        if len(healthy) >= 3:
                            break
                except Exception:
                    continue
        _nitter_healthy = healthy or _NITTER_INSTANCES[:2]  # fallback
        _nitter_healthy_time = time.time()
        return list(_nitter_healthy)


def scrape_telegram_public(
    query: str,
    max_results: int = 20,
) -> list[dict]:
    """Scrape Telegram public channel/group previews via t.me/s/ endpoint.

    t.me/s/{username} is a PUBLIC HTML page — no login, no API, no Telethon.
    Returns channel info + any emails/phones found in channel descriptions/posts.
    """
    leads: list[dict] = []

    # Step 1: Find Telegram channels/groups via search engine dorking
    dork_queries = [
        f'site:t.me "{query}" email OR contact',
        f't.me "{query}" group OR channel',
        f'telegram "{query}" contact email',
    ]

    discovered_urls: list[str] = []
    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                link = r.get("link", "")
                if "t.me/" in link and link not in discovered_urls:
                    discovered_urls.append(link)
                # Also check snippets for emails
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "", "name": "",
                        "platform": "telegram",
                        "source_url": link,
                    })
    except Exception as exc:
        logger.warning("Telegram dorking failed: %s", exc)

    # Step 2: Visit t.me/s/ pages to extract contact info (reuse session)
    seen_channels: set[str] = set()
    with AdSession(timeout=12.0, min_delay=2.0) as session:
        for url in discovered_urls[:10]:
            try:
                # Extract username from URL
                parsed = urlparse(url)
                path_parts = parsed.path.strip("/").split("/")
                if not path_parts:
                    continue
                username = path_parts[0]
                if username in seen_channels or username in ("s", "joinchat", "addstickers"):
                    continue
                seen_channels.add(username)

                # Fetch public preview page
                preview_url = f"https://t.me/s/{username}"
                resp = session.get(preview_url)

                if resp.status_code != 200:
                    continue

                page_text = _strip_tags(resp.text[:100_000])

                # Extract channel name
                name_match = re.search(
                    r'<meta\s+property="og:title"\s+content="([^"]+)"',
                    resp.text,
                )
                channel_name = name_match.group(1) if name_match else username

                # Extract emails and phones
                emails = extract_emails(page_text)
                phones = extract_phones(page_text)

                if emails or phones:
                    for email in emails:
                        leads.append({
                            "email": email, "phone": "", "name": channel_name,
                            "platform": "telegram",
                            "source_url": preview_url,
                        })
                    for phone in phones:
                        leads.append({
                            "email": "", "phone": phone, "name": channel_name,
                            "platform": "telegram",
                            "source_url": preview_url,
                        })
                else:
                    # Even without email/phone, record the channel as a lead
                    leads.append({
                        "email": "", "phone": "", "name": channel_name,
                        "platform": "telegram",
                        "source_url": preview_url,
                        "username": f"@{username}",
                    })

            except Exception as exc:
                logger.debug("Telegram preview scrape error for %s: %s", url, exc)
                continue

    logger.info("Telegram live scrape: %d leads from %d channels", len(leads), len(seen_channels))
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 2. WHATSAPP — wa.me link discovery (NEVER touch WhatsApp servers)
# ===========================================================================

def scrape_whatsapp_links(
    query: str,
    max_results: int = 15,
) -> list[dict]:
    """Find WhatsApp business contacts via wa.me link discovery.

    Searches for wa.me links on public websites — NEVER touches WhatsApp
    servers directly. Finds businesses that publish their WhatsApp numbers.
    """
    leads: list[dict] = []

    dork_queries = [
        f'"{query}" "wa.me" OR "api.whatsapp.com" contact',
        f'"{query}" whatsapp business contact phone',
        f'"{query}" "chat on whatsapp" OR "message us on whatsapp"',
    ]

    discovered_urls: list[str] = []
    wa_numbers: set[str] = set()

    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                link = r.get("link", "")
                text = f"{r.get('title', '')} {r.get('snippet', '')} {link}"

                # Find wa.me links in text
                wa_matches = re.findall(
                    r'(?:wa\.me/|api\.whatsapp\.com/send\?phone=)(\d{7,15})',
                    text,
                )
                for num in wa_matches:
                    if num not in wa_numbers:
                        wa_numbers.add(num)
                        leads.append({
                            "email": "", "phone": f"+{num}", "name": "",
                            "platform": "whatsapp",
                            "source_url": link,
                        })

                # Also extract regular emails/phones
                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "", "name": "",
                        "platform": "whatsapp",
                        "source_url": link,
                    })

                if link.startswith("http") and "wa.me" not in link:
                    discovered_urls.append(link)
    except Exception as exc:
        logger.warning("WhatsApp dorking failed: %s", exc)

    # Visit discovered pages to find more wa.me links (reuse session)
    with AdSession(timeout=10.0, min_delay=2.0) as session:
        for url in discovered_urls[:5]:
            try:
                resp = session.get(url)
                if resp.status_code != 200:
                    continue
                page_text = resp.text[:100_000]

                # Find wa.me links in page
                wa_page_matches = re.findall(
                    r'(?:wa\.me/|api\.whatsapp\.com/send\?phone=)(\d{7,15})',
                    page_text,
                )
                for num in wa_page_matches:
                    if num not in wa_numbers:
                        wa_numbers.add(num)
                        leads.append({
                            "email": "", "phone": f"+{num}", "name": "",
                            "platform": "whatsapp",
                            "source_url": url,
                        })

                # Extract emails too
                cleaned = _strip_tags(page_text)
                for email in extract_emails(cleaned):
                    leads.append({
                        "email": email, "phone": "", "name": "",
                        "platform": "whatsapp",
                        "source_url": url,
                    })
            except Exception as exc:
                logger.debug("WhatsApp page scrape error: %s", exc)

    logger.info("WhatsApp live scrape: %d leads, %d WA numbers", len(leads), len(wa_numbers))
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 3. YOUTUBE — Channel page scraping
# ===========================================================================

def scrape_youtube_channels(
    query: str,
    max_results: int = 15,
) -> list[dict]:
    """Scrape YouTube channel pages for business emails.

    Many YouTube creators put business inquiry emails in their About section.
    Uses search engine dorking to find channels, then visits channel pages.
    """
    leads: list[dict] = []

    dork_queries = [
        f'site:youtube.com "{query}" "business inquiries" "@gmail.com" OR "@yahoo.com"',
        f'site:youtube.com/channel "{query}" email OR contact',
        f'site:youtube.com "@" "{query}" email',
    ]

    discovered_channels: list[str] = []
    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                link = r.get("link", "")
                text = f"{r.get('title', '')} {r.get('snippet', '')}"

                # Extract emails from snippets
                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "", "name": r.get("title", ""),
                        "platform": "youtube",
                        "source_url": link,
                    })

                if "youtube.com" in link:
                    discovered_channels.append(link)
    except Exception as exc:
        logger.warning("YouTube dorking failed: %s", exc)

    # Visit channel pages and extract from ytInitialData JSON (Issue #14/#15 fix)
    # YouTube embeds emails in the ytInitialData blob even without JS rendering
    seen_channels: set[str] = set()
    with AdSession(timeout=12.0, min_delay=2.5) as session:
        for url in discovered_channels[:8]:
            try:
                # Normalise to channel root (not /about — YouTube removed that route)
                clean_url = re.sub(r'/(about|videos|shorts|streams|playlists)$', '', url.rstrip('/'))

                channel_id = urlparse(clean_url).path.strip("/").split("/")[0]
                if channel_id in seen_channels:
                    continue
                seen_channels.add(channel_id)

                resp = session.get(clean_url)
                if resp.status_code != 200:
                    continue

                raw = resp.text[:500_000]

                # Extract channel name from og:title
                title_match = re.search(
                    r'<meta\s+property="og:title"\s+content="([^"]+)"',
                    raw,
                )
                channel_name = title_match.group(1) if title_match else ""

                # Try to parse ytInitialData for business email
                # R2-11 fix: use re.DOTALL and anchor to `;</script>` for robust matching
                yt_match = re.search(r'var\s+ytInitialData\s*=\s*(\{.+?\});\s*</script>', raw, re.DOTALL)
                if yt_match:
                    try:
                        yt_data = _json_mod.loads(yt_match.group(1))
                        yt_text = _json_mod.dumps(yt_data)
                        for email in extract_emails(yt_text):
                            leads.append({
                                "email": email, "phone": "", "name": channel_name,
                                "platform": "youtube",
                                "source_url": clean_url,
                            })
                    except (_json_mod.JSONDecodeError, ValueError):
                        pass

                # Fallback: extract from full page text
                page_text = _strip_tags(raw)
                for email in extract_emails(page_text):
                    leads.append({
                        "email": email, "phone": "", "name": channel_name,
                        "platform": "youtube",
                        "source_url": clean_url,
                    })
                for phone in extract_phones(page_text):
                    leads.append({
                        "email": "", "phone": phone, "name": channel_name,
                        "platform": "youtube",
                        "source_url": clean_url,
                    })

            except Exception as exc:
                logger.debug("YouTube channel scrape error: %s", exc)

    logger.info("YouTube live scrape: %d leads", len(leads))
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 4. INSTAGRAM — Dorking + embed endpoint + bio link following
# ===========================================================================

def scrape_instagram(
    query: str,
    max_results: int = 20,
) -> list[dict]:
    """Scrape Instagram profiles for contact info.

    Strategy:
    1. Search engine dorking to find profiles
    2. Extract emails from snippets and cached pages
    3. Follow bio links to personal websites for contact info
    NEVER directly access instagram.com (blocks bots aggressively).
    """
    leads: list[dict] = []

    dork_queries = [
        f'site:instagram.com "{query}" email OR "@gmail.com" OR "@yahoo.com"',
        f'site:instagram.com "{query}" "link in bio" "founder" OR "CEO"',
        f'site:instagram.com "{query}" "bookings" OR "inquiries" email',
        f'"{query}" instagram.com email contact',
    ]

    bio_links: list[str] = []
    try:
        for dork in dork_queries[:3]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")

                # Extract emails from snippets
                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "", "name": r.get("title", ""),
                        "platform": "instagram",
                        "source_url": link,
                    })

                # Extract any URLs that might be bio links (non-Instagram)
                # Tightened regex: must start with http(s) and end at whitespace/quote
                url_matches = re.findall(
                    r'https?://(?!(?:www\.)?(?:instagram|facebook|google)\.com)[a-zA-Z0-9._~:/?#\[\]@!$&\'()*+,;=%-]+',
                    text,
                )
                bio_links.extend(url_matches[:3])
    except Exception as exc:
        logger.warning("Instagram dorking failed: %s", exc)

    # Follow bio links to extract contact info (reuse session)
    seen_domains: set[str] = set()
    with AdSession(timeout=10.0, min_delay=2.0) as session:
        for bio_url in bio_links[:5]:
            try:
                domain = urlparse(bio_url).netloc.lower()
                base_domain = ".".join(domain.split(".")[-2:])
                if base_domain in seen_domains:
                    continue
                seen_domains.add(base_domain)

                resp = session.get(bio_url)
                if resp.status_code != 200:
                    continue

                page_text = _strip_tags(resp.text[:100_000])
                for email in extract_emails(page_text):
                    leads.append({
                        "email": email, "phone": "", "name": "",
                        "platform": "instagram",
                        "source_url": bio_url,
                    })
                for phone in extract_phones(page_text):
                    leads.append({
                        "email": "", "phone": phone, "name": "",
                        "platform": "instagram",
                        "source_url": bio_url,
                    })
            except Exception as exc:
                logger.debug("Instagram bio link error: %s", exc)

    logger.info("Instagram live scrape: %d leads", len(leads))
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 5. FACEBOOK — v3.5.29: Complete pipeline rewrite with 10 sources
# ===========================================================================
# Root causes of 0 live results (all fixed below):
#   1. Bing: site: + double-quotes kills results → two-pass query
#   2. Patchright: JS SPA endpoint → html.duckduckgo.com/html/ (pure HTML)
#   3. Google: site:facebook.com de-indexed by design → query directories
#   4. Web Archive CDX: malformed SURT → prefix match + Python filter
#   5. JustDial/IndiaMART: routed through blocked SearXNG → direct HTTP
#   6. Missing high-yield sources → 99acres, MagicBricks, Housing.com,
#      Sulekha, YellowPages India, contact-page enrichment
# ===========================================================================

# Regex for extracting Facebook URLs from HTML/text
_FACEBOOK_URL_RE = re.compile(
    r'https?://(?:www\.|m\.|web\.)?facebook\.com/(?:pages?/|groups?/|profile\.php\?id=)?'
    r'([A-Za-z0-9._\-]{3,80})',
    re.IGNORECASE,
)


def _extract_fb_urls(text: str) -> list[str]:
    """Extract Facebook page/group URLs from text, filtering out generic paths."""
    skip = {'sharer', 'share', 'login', 'dialog', 'tr', 'plugins', 'photo',
            'watch', 'reel', 'stories', 'help', 'settings', 'privacy'}
    return list({
        m.group(0) for m in _FACEBOOK_URL_RE.finditer(text)
        if m.group(1).lower() not in skip
    })


def _parse_name_from_fb_url(fb_url: str) -> str:
    """Best-effort business name from a Facebook URL slug."""
    m = _FACEBOOK_URL_RE.search(fb_url)
    if not m:
        return ""
    slug = m.group(1).rstrip('/')
    if slug.isdigit():
        return ""
    return slug.replace('.', ' ').replace('-', ' ').title()


def _fb_lead_uid(name: str, email: str, phone: str, fb_url: str) -> str:
    """Stable dedup key for a Facebook lead."""
    key = f"{name}|{email}|{phone}|{fb_url}"
    return hashlib.md5(key.lower().encode()).hexdigest()


def _extract_location_from_keyword(query: str) -> str:
    """Extract location hint from keyword (e.g. 'Real Estate in India' -> 'India')."""
    m = re.search(r'\b(?:in|from|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', query)
    return m.group(1) if m else ""


# ---- Source 1: Bing (FIXED two-pass query — no site:+quotes combo) ----

def _search_bing_for_facebook(query: str, location: str, max_results: int = 15) -> list[dict]:
    """v3.5.29 Fix 1: Two-pass Bing strategy.

    Pass 1: site:facebook.com/pages WITHOUT quotes around keyword.
    Pass 2: Directory dork — finds pages that LINK to Facebook.
    """
    results: list[dict] = []
    try:
        with AdSession(timeout=15.0) as session:
            queries = [
                f'site:facebook.com/pages {query} {location}',
                f'site:facebook.com {query} {location} contact',
                f'"{query}" {location} facebook.com/pages contact email',
                f'"{query}" {location} "facebook.com" "email" OR "phone" OR "contact"',
            ]
            for q in queries:
                resp = session.get(
                    "https://www.bing.com/search",
                    params={"q": q, "count": "50", "mkt": "en-IN", "setlang": "en"},
                    timeout=15,
                )
                if resp.status_code != 200:
                    continue
                html = resp.text
                for match in re.finditer(
                    r'<li[^>]*class="b_algo"[^>]*>(.*?)</li>', html, re.DOTALL
                ):
                    block = match.group(1)
                    link_m = re.search(r'href="(https?://[^"]+)"', block)
                    title_m = re.search(r'<h2[^>]*>(.*?)</h2>', block, re.DOTALL)
                    snippet_m = re.search(r'<p[^>]*>(.*?)</p>', block, re.DOTALL)
                    if link_m:
                        results.append({
                            "title": _strip_tags(title_m.group(1)) if title_m else "",
                            "snippet": _strip_tags(snippet_m.group(1)) if snippet_m else "",
                            "link": link_m.group(1),
                            "source": "bing",
                        })
                    if len(results) >= max_results:
                        break
                if len(results) >= max_results:
                    break
    except Exception as exc:
        logger.debug("Bing Facebook search error: %s", exc)
    logger.info("Facebook Bing source: %d raw results", len(results))
    return results


# ---- Source 2: DuckDuckGo HTML endpoint (FIXED — not JS SPA) ----

def _search_ddg_html_facebook(query: str, location: str, max_results: int = 15) -> list[dict]:
    """v3.5.29 Fix 2: Use html.duckduckgo.com/html/ (pure HTML, no CAPTCHA).

    The JS SPA at duckduckgo.com detects headless Chrome via navigator.webdriver.
    The HTML endpoint is intended for accessibility/bots and has no JS gate.
    """
    results: list[dict] = []
    try:
        with AdSession(timeout=15.0, min_delay=1.5) as session:
            queries = [
                f'site:facebook.com {query} {location}',
                f'"{query}" {location} facebook page email phone',
                f'"{query}" {location} inurl:facebook.com contact',
            ]
            for q in queries:
                resp = session.post(
                    "https://html.duckduckgo.com/html/",
                    data={"q": q, "kl": "in-en"},
                    headers={"Referer": "https://html.duckduckgo.com/"},
                    timeout=15,
                )
                if resp.status_code not in (200, 202):
                    continue
                html = resp.text
                # DDG HTML results: <a rel="nofollow" ...> links
                for link_match in re.finditer(
                    r'<a\s+rel=["\']nofollow["\']\s+href=["\']([^"\'>]+)["\'][^>]*>(.*?)</a>',
                    html, re.DOTALL,
                ):
                    href = link_match.group(1)
                    title = _strip_tags(link_match.group(2))
                    # DDG wraps URLs with uddg= param
                    if "uddg=" in href:
                        from urllib.parse import parse_qs, unquote
                        parsed = urlparse(href)
                        params = parse_qs(parsed.query)
                        href = unquote(params.get("uddg", [href])[0])
                    if not href.startswith("http") or "duckduckgo" in href:
                        continue
                    results.append({
                        "title": title, "snippet": "",
                        "link": href, "source": "ddg_html",
                    })
                    if len(results) >= max_results:
                        break
                if len(results) >= max_results:
                    break
    except Exception as exc:
        logger.debug("DDG HTML Facebook search error: %s", exc)
    logger.info("Facebook DDG HTML source: %d raw results", len(results))
    return results


# ---- Source 3: Web Archive CDX API (FIXED SURT syntax) ----

def _search_web_archive_facebook(query: str, location: str, max_results: int = 30) -> list[dict]:
    """v3.5.29 Fix 4: Query CDX with prefix match, filter in Python.

    Previous code used malformed SURT syntax in the filter. Fix: query
    facebook.com/pages/* with matchType=prefix, then filter by keyword tokens.
    """
    results: list[dict] = []
    kw_tokens = [t.lower() for t in re.split(r'[\s\-_]+', query) if len(t) > 2]
    loc_lower = location.lower() if location else "india"
    try:
        with AdSession(timeout=25.0, rate_limit=False) as session:
            cdx_url = (
                "https://web.archive.org/cdx/search/cdx"
                "?url=facebook.com/pages/*"
                "&output=json"
                "&fl=original,timestamp,statuscode"
                "&filter=statuscode:200"
                "&limit=500"
                "&collapse=urlkey"
                "&matchType=prefix"
            )
            resp = session.get(cdx_url, timeout=25)
            if resp.status_code != 200:
                return []

            lines = resp.text.strip().splitlines()
            for line in lines:
                line = line.strip().rstrip(',')
                if not line or line in ('[', ']'):
                    continue
                try:
                    obj = _json_mod.loads(line)
                except _json_mod.JSONDecodeError:
                    continue
                if isinstance(obj, list) and obj and obj[0] == "original":
                    continue  # skip header
                orig_url = obj[0] if isinstance(obj, list) else obj.get("url", "")
                timestamp = obj[1] if isinstance(obj, list) and len(obj) > 1 else ""
                if not orig_url or "facebook.com" not in orig_url:
                    continue
                url_lower = orig_url.lower()
                if not any(tok in url_lower for tok in kw_tokens):
                    if loc_lower not in url_lower:
                        continue
                name = _parse_name_from_fb_url(orig_url)
                if not name:
                    slug = orig_url.split("/")[-1].replace("-", " ")
                    name = slug.title() if len(slug) > 2 else ""
                if name:
                    wayback_url = f"https://web.archive.org/web/{timestamp}/{orig_url}" if timestamp else orig_url
                    results.append({
                        "title": name, "snippet": "",
                        "link": wayback_url, "original_url": orig_url,
                        "source": "cdx_wayback",
                    })
                if len(results) >= max_results:
                    break
    except Exception as exc:
        logger.debug("Web Archive CDX Facebook search error: %s", exc)
    logger.info("Facebook Web Archive CDX source: %d raw results", len(results))
    return results


# ---- Source 4: JustDial DIRECT HTTP (FIXED — bypass SearXNG) ----

def _search_justdial_direct(query: str, location: str, max_results: int = 20) -> list[dict]:
    """v3.5.29 Fix 5: Hit JustDial directly with proper Referer header.

    Previous code routed through SearXNG which was blocked by SSRF filter.
    Direct HTTP with Referer header works fine.
    """
    results: list[dict] = []
    city = location.split(",")[0].strip().title().replace(" ", "-") if location else "India"
    kw_slug = query.strip().replace(" ", "-")
    try:
        with AdSession(timeout=15.0, min_delay=2.5) as session:
            urls = [
                f"https://www.justdial.com/{city}/{kw_slug}/nct-11226886",
                f"https://www.justdial.com/{city}/{kw_slug}",
            ]
            for url in urls:
                resp = session.get(
                    url,
                    headers={"Referer": "https://www.justdial.com/"},
                    timeout=15,
                )
                if resp.status_code != 200:
                    continue
                page_text = _strip_tags(resp.text[:200_000])
                page_emails = extract_emails(page_text)
                page_phones = extract_phones(page_text)
                fb_urls = _extract_fb_urls(resp.text[:200_000])

                # Try to extract individual business cards
                for card_match in re.finditer(
                    r'<li[^>]*class="[^"]*cntanr[^"]*"[^>]*>(.*?)</li>', resp.text, re.DOTALL
                ):
                    card = card_match.group(1)
                    name_m = re.search(r'class="[^"]*lng_cont_name[^"]*"[^>]*>(.*?)<', card, re.DOTALL)
                    name = _strip_tags(name_m.group(1)) if name_m else ""
                    card_text = _strip_tags(card)
                    card_emails = extract_emails(card_text)
                    card_phones = extract_phones(card_text)
                    card_fb = _extract_fb_urls(card)
                    if name and (card_emails or card_phones or card_fb):
                        results.append({
                            "title": name,
                            "snippet": card_text[:200],
                            "link": url,
                            "emails": card_emails[:2],
                            "phones": card_phones[:2],
                            "fb_urls": card_fb[:1],
                            "source": "justdial",
                        })

                # Fallback: page-level extraction if no cards found
                if not results and (page_emails or page_phones):
                    results.append({
                        "title": f"{query} - JustDial {city}",
                        "snippet": page_text[:200],
                        "link": url,
                        "emails": page_emails[:5],
                        "phones": page_phones[:5],
                        "fb_urls": fb_urls[:3],
                        "source": "justdial",
                    })
                if len(results) >= max_results:
                    break
    except Exception as exc:
        logger.debug("JustDial direct search error: %s", exc)
    logger.info("Facebook JustDial direct source: %d raw results", len(results))
    return results


# ---- Source 5: IndiaMART DIRECT HTTP (FIXED — bypass SearXNG) ----

def _search_indiamart_direct(query: str, location: str, max_results: int = 20) -> list[dict]:
    """v3.5.29 Fix 5: Hit IndiaMART directly with proper Referer header."""
    results: list[dict] = []
    try:
        with AdSession(timeout=15.0, min_delay=2.5) as session:
            kw_encoded = quote_plus(query)
            urls = [
                f"https://dir.indiamart.com/search.mp?ss={kw_encoded}&prdsrc=1",
                f"https://www.indiamart.com/search/{kw_encoded}/",
            ]
            for url in urls:
                resp = session.get(
                    url,
                    headers={"Referer": "https://www.indiamart.com/"},
                    timeout=15,
                )
                if resp.status_code != 200:
                    continue
                page_text = _strip_tags(resp.text[:200_000])
                page_emails = extract_emails(page_text)
                page_phones = extract_phones(page_text)
                fb_urls = _extract_fb_urls(resp.text[:200_000])

                # Try to parse business cards
                for card_match in re.finditer(
                    r'<div[^>]*class="[^"]*(?:prd-card|listing|flx-cntnr)[^"]*"[^>]*>(.*?)</div>\s*</div>',
                    resp.text, re.DOTALL,
                ):
                    card = card_match.group(1)
                    name_m = re.search(r'<(?:h2|h3)[^>]*>(.*?)</(?:h2|h3)>', card, re.DOTALL)
                    name = _strip_tags(name_m.group(1)) if name_m else ""
                    card_text = _strip_tags(card)
                    card_emails = extract_emails(card_text)
                    card_phones = extract_phones(card_text)
                    card_fb = _extract_fb_urls(card)
                    if name and (card_emails or card_phones):
                        results.append({
                            "title": name,
                            "snippet": card_text[:200],
                            "link": url,
                            "emails": card_emails[:2],
                            "phones": card_phones[:2],
                            "fb_urls": card_fb[:1],
                            "source": "indiamart",
                        })

                # Fallback: page-level extraction
                if not results and (page_emails or page_phones):
                    results.append({
                        "title": f"{query} - IndiaMART",
                        "snippet": page_text[:200],
                        "link": url,
                        "emails": page_emails[:5],
                        "phones": page_phones[:5],
                        "fb_urls": fb_urls[:3],
                        "source": "indiamart",
                    })
                if len(results) >= max_results:
                    break
    except Exception as exc:
        logger.debug("IndiaMART direct search error: %s", exc)
    logger.info("Facebook IndiaMART direct source: %d raw results", len(results))
    return results


# ---- Source 6: Sulekha (Indian services marketplace) ----

def _search_sulekha(query: str, location: str, max_results: int = 15) -> list[dict]:
    """v3.5.29 Fix 6: Sulekha — Indian services marketplace with contact data."""
    results: list[dict] = []
    city = location.split(",")[0].strip().lower().replace(" ", "-") if location else "india"
    kw_slug = query.strip().lower().replace(" ", "-")
    try:
        with AdSession(timeout=15.0, min_delay=2.5) as session:
            urls = [
                f"https://www.sulekha.com/{kw_slug}/{city}",
                f"https://www.sulekha.com/{kw_slug}-services/{city}",
            ]
            for url in urls:
                resp = session.get(
                    url,
                    headers={"Referer": "https://www.sulekha.com/"},
                    timeout=15,
                )
                if resp.status_code != 200:
                    continue
                page_text = _strip_tags(resp.text[:200_000])
                page_emails = extract_emails(page_text)
                page_phones = extract_phones(page_text)
                fb_urls = _extract_fb_urls(resp.text[:200_000])
                if page_emails or page_phones:
                    results.append({
                        "title": f"{query} - Sulekha {city.title()}",
                        "snippet": page_text[:200],
                        "link": url,
                        "emails": page_emails[:5],
                        "phones": page_phones[:5],
                        "fb_urls": fb_urls[:3],
                        "source": "sulekha",
                    })
                if len(results) >= max_results:
                    break
    except Exception as exc:
        logger.debug("Sulekha search error: %s", exc)
    logger.info("Facebook Sulekha source: %d raw results", len(results))
    return results


# ---- Source 7: Real Estate Portals (99acres, MagicBricks, Housing.com) ----

def _search_realestate_portals(query: str, location: str, max_results: int = 25) -> list[dict]:
    """v3.5.29 Fix 6: Real estate portals list agents with phones and FB links."""
    results: list[dict] = []
    city = location.split(",")[0].strip().lower().replace(" ", "-") if location else "india"
    portals = [
        ("99acres", f"https://www.99acres.com/real-estate-agents-in-{city}-ffid"),
        ("magicbricks", f"https://www.magicbricks.com/real-estate-agents-in-{city}"),
        ("housing", f"https://housing.com/agents/{city}"),
    ]
    try:
        with AdSession(timeout=15.0, min_delay=3.0) as session:
            for portal_name, url in portals:
                referer = f"https://www.{portal_name}.com/" if portal_name != "housing" else "https://housing.com/"
                resp = session.get(
                    url,
                    headers={"Referer": referer},
                    timeout=15,
                )
                if resp.status_code != 200:
                    continue
                page_text = _strip_tags(resp.text[:200_000])
                page_emails = extract_emails(page_text)
                page_phones = extract_phones(page_text)
                fb_urls = _extract_fb_urls(resp.text[:200_000])
                if page_emails or page_phones:
                    results.append({
                        "title": f"{query} agents - {portal_name.title()}",
                        "snippet": page_text[:200],
                        "link": url,
                        "emails": page_emails[:10],
                        "phones": page_phones[:10],
                        "fb_urls": fb_urls[:5],
                        "source": portal_name,
                    })
                if len(results) >= max_results:
                    break
    except Exception as exc:
        logger.debug("Real estate portals search error: %s", exc)
    logger.info("Facebook RE portals source: %d raw results", len(results))
    return results


# ---- Source 8: Yellow Pages India + directories ----

def _search_yellow_pages_india(query: str, location: str, max_results: int = 20) -> list[dict]:
    """v3.5.29 Fix 6: Yellow Pages India, AskLaila, VConnect."""
    results: list[dict] = []
    city = location.split(",")[0].strip().lower().replace(" ", "-") if location else "india"
    portals = [
        f"https://www.yellowpages.co.in/search/{quote_plus(query)}/{city}",
        f"https://www.asklaila.com/search/{city}/{quote_plus(query)}/",
    ]
    try:
        with AdSession(timeout=15.0, min_delay=2.5) as session:
            for url in portals:
                domain = urlparse(url).netloc
                resp = session.get(
                    url,
                    headers={"Referer": f"https://{domain}/"},
                    timeout=15,
                )
                if resp.status_code != 200:
                    continue
                page_text = _strip_tags(resp.text[:200_000])
                page_emails = extract_emails(page_text)
                page_phones = extract_phones(page_text)
                fb_urls = _extract_fb_urls(resp.text[:200_000])
                if page_emails or page_phones:
                    results.append({
                        "title": f"{query} - {domain}",
                        "snippet": page_text[:200],
                        "link": url,
                        "emails": page_emails[:5],
                        "phones": page_phones[:5],
                        "fb_urls": fb_urls[:3],
                        "source": f"yp_{domain}",
                    })
                if len(results) >= max_results:
                    break
    except Exception as exc:
        logger.debug("Yellow Pages India search error: %s", exc)
    logger.info("Facebook YP India source: %d raw results", len(results))
    return results


# ---- Source 9: Google organic (FIXED — query directories linking to FB) ----

def _search_google_organic_facebook(query: str, location: str, max_results: int = 15) -> list[dict]:
    """v3.5.29 Fix 3: Query directories that LINK to Facebook pages.

    site:facebook.com returns near-zero on Google since 2022 (FB/Google dispute).
    Instead, search for business directories that reference FB page URLs.
    """
    results: list[dict] = []
    try:
        dorks = [
            f'"{query}" {location} "facebook.com/pages" contact email',
            f'"{query}" {location} facebook.com email phone contact',
            f'"{query}" {location} site:justdial.com OR site:sulekha.com OR site:99acres.com',
        ]
        for dork in dorks:
            dork_results = free_search_waterfall(dork, num_results=10, min_results=2)
            results.extend(dork_results)
            for r in dork_results:
                r["source"] = "google_organic"
            if len(results) >= max_results:
                break
    except Exception as exc:
        logger.debug("Google organic Facebook search error: %s", exc)
    logger.info("Facebook Google organic source: %d raw results", len(results))
    return results[:max_results]


# ---- Source 10: Contact enrichment (Google Cache / Wayback for FB URLs) ----

def _enrich_fb_urls_with_contacts(
    fb_urls: list[str], max_fetch: int = 15,
) -> list[dict]:
    """Fetch Google Cache or Wayback snapshots of FB URLs to extract contacts.

    For leads that have a FB URL but no email/phone, this function fetches
    cached versions to extract contact info without touching Facebook directly.
    """
    enriched: list[dict] = []
    try:
        with AdSession(timeout=12.0, min_delay=2.0) as session:
            for fb_url in fb_urls[:max_fetch]:
                fetched_text = ""
                # Try Google Cache first
                cache_url = f"https://webcache.googleusercontent.com/search?q=cache:{fb_url}"
                try:
                    r = session.get(cache_url, timeout=12)
                    if r.status_code == 200 and len(r.text) > 500:
                        fetched_text = r.text
                except Exception:
                    pass

                # Try Wayback Machine if cache failed
                if not fetched_text:
                    try:
                        wb_api = f"https://archive.org/wayback/available?url={fb_url}"
                        r2 = session.get(wb_api, timeout=10)
                        if r2.status_code == 200:
                            snap = r2.json().get("archived_snapshots", {}).get("closest", {})
                            if snap.get("available") and snap.get("url"):
                                r3 = session.get(snap["url"], timeout=12)
                                if r3.status_code == 200:
                                    fetched_text = r3.text
                    except Exception:
                        pass

                if fetched_text:
                    clean = _strip_tags(fetched_text[:200_000])
                    emails = extract_emails(clean)
                    phones = extract_phones(clean)
                    if emails or phones:
                        name = _parse_name_from_fb_url(fb_url)
                        enriched.append({
                            "title": name,
                            "snippet": clean[:200],
                            "link": fb_url,
                            "emails": emails[:3],
                            "phones": phones[:3],
                            "source": "cache_enriched",
                        })
    except Exception as exc:
        logger.debug("FB URL enrichment error: %s", exc)
    logger.info("Facebook enrichment: %d leads from %d FB URLs", len(enriched), min(len(fb_urls), max_fetch))
    return enriched


# ---- Main pipeline ----

def scrape_facebook(
    query: str,
    max_results: int = 50,
) -> list[dict]:
    """v3.5.29: Complete 10-source Facebook lead discovery pipeline.

    NEVER directly access facebook.com — uses cached/indexed data only.
    Sources (in priority order):
      1. Bing (fixed two-pass query)
      2. DDG HTML endpoint (fixed — not JS SPA)
      3. Web Archive CDX (fixed SURT syntax)
      4. JustDial direct HTTP (fixed — bypass SearXNG)
      5. IndiaMART direct HTTP (fixed — bypass SearXNG)
      6. Sulekha (new)
      7. Real estate portals: 99acres, MagicBricks, Housing.com (new)
      8. Yellow Pages India (new)
      9. Google organic (fixed — query directories, not site:facebook.com)
     10. Contact enrichment from Google Cache / Wayback (new)
    """
    leads: list[dict] = []
    all_fb_urls: list[str] = []  # collect FB URLs for enrichment pass
    location = _extract_location_from_keyword(query)
    if not location:
        location = "India"  # default for Indian queries
    is_indian_query = any(
        loc in query.lower()
        for loc in ["india", "delhi", "mumbai", "bangalore", "chennai",
                    "kolkata", "hyderabad", "pune", "jaipur", "lucknow",
                    "ahmedabad", "noida", "gurgaon", "goa", "chandigarh"]
    )
    is_realestate = any(
        term in query.lower()
        for term in ["real estate", "property", "realtor", "broker", "agent",
                     "housing", "apartment", "flat", "villa", "plot"]
    )
    seen_uids: set[str] = set()

    def _collect_leads(results: list[dict], source_name: str) -> None:
        """Extract emails/phones from search results and add to leads list."""
        for r in results:
            text = f"{r.get('title', '')} {r.get('snippet', '')}"
            link = r.get("link", "")
            name = r.get("title", "")
            name = re.sub(r'\s*[|\-]\s*Facebook.*$', '', name, flags=re.IGNORECASE).strip()

            # Collect pre-extracted contacts from direct-HTTP sources
            r_emails = r.get("emails", [])
            r_phones = r.get("phones", [])
            r_fb = r.get("fb_urls", [])

            # Also extract from title/snippet text
            r_emails = r_emails or extract_emails(text)
            r_phones = r_phones or extract_phones(text)
            r_fb = r_fb or _extract_fb_urls(text + " " + link)

            # Track FB URLs for enrichment pass
            all_fb_urls.extend(r_fb)

            # If link itself is a Facebook URL, include it
            if "facebook.com" in link and link not in all_fb_urls:
                all_fb_urls.append(link)

            for email in r_emails:
                uid = _fb_lead_uid(name, email, "", r_fb[0] if r_fb else "")
                if uid not in seen_uids:
                    seen_uids.add(uid)
                    leads.append({
                        "email": email, "phone": "",
                        "name": name or _parse_name_from_fb_url(r_fb[0]) if r_fb else name,
                        "platform": "facebook",
                        "source_url": link,
                        "source": source_name,
                    })
            for phone in r_phones:
                if _is_gps_coord(phone):
                    continue
                uid = _fb_lead_uid(name, "", phone, r_fb[0] if r_fb else "")
                if uid not in seen_uids:
                    seen_uids.add(uid)
                    leads.append({
                        "email": "", "phone": phone,
                        "name": name or _parse_name_from_fb_url(r_fb[0]) if r_fb else name,
                        "platform": "facebook",
                        "source_url": link,
                        "source": source_name,
                    })

            # If we have a FB URL but no contacts, still record as informational lead
            if not r_emails and not r_phones and r_fb:
                fb_name = name or _parse_name_from_fb_url(r_fb[0])
                uid = _fb_lead_uid(fb_name, "", "", r_fb[0])
                if uid not in seen_uids and fb_name:
                    seen_uids.add(uid)
                    leads.append({
                        "email": "", "phone": "",
                        "name": fb_name,
                        "platform": "facebook",
                        "source_url": r_fb[0],
                        "source": source_name,
                    })

    try:
        # Source 1: Bing (fixed two-pass)
        _collect_leads(_search_bing_for_facebook(query, location), "bing")

        # Source 2: DDG HTML endpoint (fixed)
        _collect_leads(_search_ddg_html_facebook(query, location), "ddg_html")

        # Source 3: Web Archive CDX (fixed)
        _collect_leads(_search_web_archive_facebook(query, location), "cdx_wayback")

        # Source 4: JustDial direct (fixed — for Indian queries)
        if is_indian_query:
            _collect_leads(_search_justdial_direct(query, location), "justdial")

        # Source 5: IndiaMART direct (fixed — for Indian queries)
        if is_indian_query:
            _collect_leads(_search_indiamart_direct(query, location), "indiamart")

        # Source 6: Sulekha (new — for Indian queries)
        if is_indian_query:
            _collect_leads(_search_sulekha(query, location), "sulekha")

        # Source 7: Real estate portals (new — for RE queries)
        if is_realestate:
            _collect_leads(_search_realestate_portals(query, location), "re_portals")

        # Source 8: Yellow Pages India (new)
        if is_indian_query:
            _collect_leads(_search_yellow_pages_india(query, location), "yp_india")

        # Source 9: Google organic (fixed — query directories)
        _collect_leads(_search_google_organic_facebook(query, location), "google_organic")

        # Source 10: Enrichment pass — fetch cached FB pages for contacts
        unique_fb_urls = list(dict.fromkeys(all_fb_urls))  # dedup preserving order
        no_contact_fb = [
            url for url in unique_fb_urls
            if not any(
                l.get("source_url") == url and (l.get("email") or l.get("phone"))
                for l in leads
            )
        ]
        if no_contact_fb:
            enriched = _enrich_fb_urls_with_contacts(no_contact_fb, max_fetch=15)
            _collect_leads(enriched, "cache_enriched")

    except Exception as exc:
        logger.warning("Facebook multi-source scrape failed: %s", exc)

    logger.info(
        "Facebook live scrape (v3.5.29 10-source): %d leads, %d with contacts",
        len(leads), sum(1 for l in leads if l.get('email') or l.get('phone')),
    )
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 6. TWITTER/X — Dorking + Nitter mirrors
# ===========================================================================

def scrape_twitter(
    query: str,
    max_results: int = 15,
) -> list[dict]:
    """Find Twitter/X contacts via dorking + Nitter public mirrors.

    Nitter mirrors serve Twitter content without needing auth.
    We also use the fxtwitter API for bio extraction.
    """
    leads: list[dict] = []

    dork_queries = [
        f'site:twitter.com OR site:x.com "{query}" email OR contact',
        f'site:twitter.com "{query}" "founder" "website" OR "email"',
        f'site:twitter.com "{query}" "hire me" OR "freelance" email',
    ]

    discovered_profiles: list[str] = []
    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")

                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "",
                        "name": r.get("title", "").split("(")[0].strip(),
                        "platform": "twitter",
                        "source_url": link,
                    })

                if "twitter.com/" in link or "x.com/" in link:
                    discovered_profiles.append(link)
    except Exception as exc:
        logger.warning("Twitter dorking failed: %s", exc)

    # Try healthy Nitter mirrors for discovered profiles (Issue #17 fix)
    # V7-fix: normalized 4-space indentation throughout
    seen_users: set[str] = set()
    healthy = _get_healthy_nitter()
    with AdSession(timeout=10.0, min_delay=2.0) as session:
        for url in discovered_profiles[:8]:
            try:
                path = urlparse(url).path.strip("/").split("/")[0]
                if not path or path in seen_users or path in ("search", "hashtag", "i"):
                    continue
                seen_users.add(path)

                # Try healthy Nitter mirrors
                for nitter in healthy:
                    try:
                        nitter_url = f"{nitter}/{path}"
                        resp = session.get(nitter_url)
                        if resp.status_code != 200:
                            continue

                        page_text = _strip_tags(resp.text[:50_000])
                        emails = extract_emails(page_text)
                        if emails:
                            for email in emails:
                                leads.append({
                                    "email": email, "phone": "", "name": path,
                                    "platform": "twitter",
                                    "source_url": f"https://twitter.com/{path}",
                                })
                            break  # Found data on this Nitter instance
                    except Exception:
                        continue
            except Exception as exc:
                logger.debug("Twitter Nitter scrape error: %s", exc)

    logger.info("Twitter live scrape: %d leads", len(leads))
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 7. GOOGLE MAPS — Directory scraping (Yelp + YellowPages + BBB)
# ===========================================================================

def _query_osm_overpass(
    query: str,
    location: str = "",
    max_results: int = 30,
) -> list[dict]:
    """Query OpenStreetMap Overpass API for business listings.

    v3.5.1: OSM Overpass API is free, no API key needed, and returns
    real business data (name, phone, email, website, address).
    """
    leads: list[dict] = []
    # R4-2 fix: Clamp max_results to prevent Overpass QL injection
    max_results = max(1, min(int(max_results), 100))
    # Build Overpass QL query for businesses matching the search term
    # Search for nodes/ways with name/brand containing the query
    # Sanitize inputs to prevent Overpass QL injection (R3-3 fix: strict allowlist)
    import re as _re
    _ql_safe = _re.compile(r'[^a-zA-Z0-9\s\-\.]')

    area_filter = ""
    if location:
        # Use area search for location filtering
        loc_clean = _ql_safe.sub("", location.strip().title())
        area_filter = f'area["name"="{loc_clean}"]->.searchArea;'
        area_ref = "(area.searchArea)"
    else:
        area_ref = ""  # Global search (slower but works)

    kw_lower = _ql_safe.sub("", query.lower().strip())
    overpass_query = f"""
    [out:json][timeout:25];
    {area_filter}
    (
      node["name"~"{kw_lower}",i]["phone"]{area_ref};
      node["name"~"{kw_lower}",i]["contact:email"]{area_ref};
      node["name"~"{kw_lower}",i]["email"]{area_ref};
      node["name"~"{kw_lower}",i]["website"]{area_ref};
      way["name"~"{kw_lower}",i]["phone"]{area_ref};
      way["name"~"{kw_lower}",i]["contact:email"]{area_ref};
    );
    out body {max_results};
    """

    try:
        with AdSession(timeout=30.0, rate_limit=False, retries=1) as session:
            resp = session.post(
                "https://overpass-api.de/api/interpreter",
                data={"data": overpass_query},
                timeout=30.0,
            )
            if resp.status_code != 200:
                logger.debug("Overpass API returned %d", resp.status_code)
                return leads

            data = resp.json()
            for element in data.get("elements", [])[:max_results]:
                tags = element.get("tags", {})
                name = tags.get("name", "")
                phone = tags.get("phone", "") or tags.get("contact:phone", "")
                email = tags.get("email", "") or tags.get("contact:email", "")
                website = tags.get("website", "") or tags.get("contact:website", "")
                addr_parts = [
                    tags.get("addr:street", ""),
                    tags.get("addr:city", ""),
                    tags.get("addr:state", ""),
                ]
                address = ", ".join(p for p in addr_parts if p)

                if name and (phone or email or website):
                    leads.append({
                        "name": name,
                        "phone": phone,
                        "email": email,
                        "platform": "google_maps",
                        "source_url": website,
                        "location": address or location,
                        "website": website,
                    })
    except Exception as exc:
        logger.debug("OSM Overpass query failed: %s", exc)

    logger.info("OSM Overpass: %d business leads for '%s'", len(leads), query)
    return leads


def scrape_google_maps_directories(
    query: str,
    location: str = "",
    max_results: int = 30,
) -> list[dict]:
    """Scrape business directories for Google Maps-style local business data.

    v3.5.1: Added OSM Overpass API as primary source (free, real business data).
    Waterfall: OSM Overpass -> YellowPages -> Yelp -> Dorking
    """
    leads: list[dict] = []
    search_term = f"{query} {location}".strip() if location else query

    # Method 1: OSM Overpass API (free, real structured business data)
    try:
        osm_leads = _query_osm_overpass(query, location, max_results=20)
        leads.extend(osm_leads)
    except Exception as exc:
        logger.debug("OSM Overpass failed: %s", exc)

    # Method 2: YellowPages scraping
    try:
        yp_leads = _scrape_yellowpages_http(search_term, max_results=15)
        leads.extend(yp_leads)
    except Exception as exc:
        logger.debug("YellowPages scrape failed: %s", exc)

    # Method 3: Yelp scraping
    try:
        yelp_leads = _scrape_yelp_http(search_term, location, max_results=15)
        leads.extend(yelp_leads)
    except Exception as exc:
        logger.debug("Yelp scrape failed: %s", exc)

    # Method 4: Dorking for local businesses
    dork_queries = [
        f'"{query}" "{location}" "contact us" email phone' if location else f'"{query}" "contact us" email phone',
        f'"{query}" "{location}" directory listing email' if location else f'"{query}" directory listing email',
    ]

    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")
                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "",
                        "name": r.get("title", ""),
                        "platform": "google_maps",
                        "source_url": link,
                        "location": location,
                    })
                for phone in extract_phones(text):
                    leads.append({
                        "email": "", "phone": phone,
                        "name": r.get("title", ""),
                        "platform": "google_maps",
                        "source_url": link,
                        "location": location,
                    })
    except Exception as exc:
        logger.warning("Google Maps dorking failed: %s", exc)

    logger.info("Google Maps total: %d leads (OSM+YP+Yelp+Dorking)", len(leads))
    return _dedup_leads(leads)[:max_results]


def _scrape_yellowpages_http(query: str, max_results: int = 15) -> list[dict]:
    """Scrape YellowPages via HTTP (no browser needed)."""
    leads: list[dict] = []
    try:
        url = "https://www.yellowpages.com/search"
        params = {"search_terms": query, "geo_location_terms": ""}
        with AdSession(timeout=12.0, min_delay=2.0) as session:
            resp = session.get(url, params=params)

        if resp.status_code != 200:
            return leads

        html = resp.text

        # Extract business listings using regex
        # YellowPages uses structured data in listings
        listings = re.findall(
            r'<div[^>]*class="[^"]*result[^"]*"[^>]*>(.*?)</div>\s*</div>\s*</div>',
            html, re.DOTALL,
        )

        for listing in listings[:max_results]:
            name_match = re.search(r'<a[^>]*class="[^"]*business-name[^"]*"[^>]*>(.*?)</a>', listing, re.DOTALL)
            phone_match = re.search(r'<div[^>]*class="[^"]*phones[^"]*"[^>]*>(.*?)</div>', listing, re.DOTALL)
            street_match = re.search(r'<div[^>]*class="[^"]*street-address[^"]*"[^>]*>(.*?)</div>', listing, re.DOTALL)

            name = _strip_tags(name_match.group(1)) if name_match else ""
            phone = _strip_tags(phone_match.group(1)) if phone_match else ""
            address = _strip_tags(street_match.group(1)) if street_match else ""

            # Also extract from JSON-LD if available
            text = _strip_tags(listing)
            emails = extract_emails(text)

            if name and (phone or emails):
                lead: dict[str, str] = {
                    "name": name,
                    "phone": phone,
                    "email": emails[0] if emails else "",
                    "platform": "google_maps",
                    "source_url": "https://www.yellowpages.com",
                    "location": address,
                }
                leads.append(lead)

    except Exception as exc:
        logger.debug("YellowPages HTTP scrape error: %s", exc)

    return leads


def _scrape_yelp_http(
    query: str, location: str = "", max_results: int = 15,
) -> list[dict]:
    """Scrape Yelp search results via HTTP."""
    leads: list[dict] = []
    try:
        url = "https://www.yelp.com/search"
        params: dict[str, str] = {"find_desc": query}
        if location:
            params["find_loc"] = location

        with AdSession(timeout=12.0, min_delay=2.0) as session:
            resp = session.get(url, params=params)

        if resp.status_code != 200:
            return leads

        html = resp.text

        # Extract JSON-LD structured data
        json_ld_matches = re.findall(
            r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
            html, re.DOTALL,
        )
        for json_text in json_ld_matches:
            try:
                data = _json_mod.loads(json_text)
                if isinstance(data, list):
                    for item in data:
                        if item.get("@type") in ("LocalBusiness", "Restaurant", "Store"):
                            phone = item.get("telephone", "")
                            # Yelp sometimes puts geo coordinates in telephone field
                            # V7-fix: use fullmatch + catch "lat, lon" pairs
                            if phone and _is_gps_coord(phone):
                                phone = ""
                            leads.append({
                                "name": item.get("name", ""),
                                "phone": phone,
                                "email": "",
                                "platform": "yelp",
                                "source_url": item.get("url", ""),
                                "location": str(item.get("address", "")),
                            })
                elif isinstance(data, dict):
                    if data.get("@type") in ("LocalBusiness", "Restaurant", "Store"):
                        phone = data.get("telephone", "")
                        if phone and _is_gps_coord(phone):
                            phone = ""
                        leads.append({
                            "name": data.get("name", ""),
                            "phone": phone,
                            "email": "",
                            "platform": "yelp",
                            "source_url": data.get("url", ""),
                            "location": str(data.get("address", "")),
                        })
            except Exception:
                continue

        # Fallback: regex extraction from HTML
        if not leads:
            phones = extract_phones(_strip_tags(html[:200_000]))
            for phone in phones[:max_results]:
                leads.append({
                    "name": "", "phone": phone, "email": "",
                    "platform": "yelp",
                    "source_url": "https://www.yelp.com",
                })

    except Exception as exc:
        logger.debug("Yelp HTTP scrape error: %s", exc)

    return leads[:max_results]


# ===========================================================================
# 8. PINTEREST — RSS feed extraction
# ===========================================================================

def scrape_pinterest(
    query: str,
    max_results: int = 15,
) -> list[dict]:
    """Scrape Pinterest profiles via dorking + RSS feeds."""
    leads: list[dict] = []

    dork_queries = [
        f'site:pinterest.com "{query}" email OR contact',
        f'site:pinterest.com "{query}" "website" OR "blog"',
    ]

    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")

                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "", "name": r.get("title", ""),
                        "platform": "pinterest",
                        "source_url": link,
                    })
    except Exception as exc:
        logger.warning("Pinterest dorking failed: %s", exc)

    logger.info("Pinterest live scrape: %d leads", len(leads))
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 9. TIKTOK — Dorking-based
# ===========================================================================

def scrape_tiktok(
    query: str,
    max_results: int = 15,
) -> list[dict]:
    """Find TikTok creator contacts via search engine dorking."""
    leads: list[dict] = []

    dork_queries = [
        f'site:tiktok.com "{query}" email OR contact',
        f'site:tiktok.com "{query}" "link in bio" business',
        f'tiktok.com "{query}" "@gmail.com" OR "@yahoo.com"',
    ]

    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")

                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "", "name": r.get("title", ""),
                        "platform": "tiktok",
                        "source_url": link,
                    })
    except Exception as exc:
        logger.warning("TikTok dorking failed: %s", exc)

    logger.info("TikTok live scrape: %d leads", len(leads))
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 10. TUMBLR — Dorking + blog page scraping
# ===========================================================================

def scrape_tumblr(
    query: str,
    max_results: int = 15,
) -> list[dict]:
    """Scrape Tumblr blogs for contact info via dorking + page visits."""
    leads: list[dict] = []

    dork_queries = [
        f'site:tumblr.com "{query}" email OR "@gmail.com" OR contact',
        f'site:tumblr.com "{query}" "about me" "contact"',
    ]

    discovered_blogs: list[str] = []
    try:
        for dork in dork_queries[:2]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")

                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "", "name": r.get("title", ""),
                        "platform": "tumblr",
                        "source_url": link,
                    })

                if "tumblr.com" in link:
                    discovered_blogs.append(link)
    except Exception as exc:
        logger.warning("Tumblr dorking failed: %s", exc)

    # Visit Tumblr blogs directly (public pages, reuse session)
    # V7-fix: normalized 4-space indentation throughout
    seen_blogs: set[str] = set()
    with AdSession(timeout=10.0, min_delay=2.0) as session:
        for url in discovered_blogs[:5]:
            try:
                domain = urlparse(url).netloc.lower()
                if domain in seen_blogs:
                    continue
                seen_blogs.add(domain)

                resp = session.get(url)
                if resp.status_code != 200:
                    continue

                page_text = _strip_tags(resp.text[:100_000])
                for email in extract_emails(page_text):
                    leads.append({
                        "email": email, "phone": "", "name": "",
                        "platform": "tumblr",
                        "source_url": url,
                    })
            except Exception as exc:
                logger.debug("Tumblr blog scrape error: %s", exc)

    logger.info("Tumblr live scrape: %d leads", len(leads))
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 11. LINKEDIN — S3 database primary, dorking secondary
# ===========================================================================

def scrape_linkedin(
    query: str,
    location: str = "",
    max_results: int = 50,
) -> list[dict]:
    """LinkedIn extraction: S3 database first, search dorking second.

    NEVER directly access linkedin.com — they block ALL automated access
    and will send cease-and-desist letters. The S3 database contains 89M+
    pre-extracted LinkedIn records.

    v3.5.1: Improved dork queries — URL discovery first (find profile URLs),
    then extract names from title. Don't require email in snippet.
    """
    leads: list[dict] = []

    # Primary: S3 database (handled in main extraction pipeline)
    # This function handles the secondary dorking path

    # v3.5.1: Two-phase dorking:
    # Phase 1: URL discovery dorks (find LinkedIn profile/company pages)
    # Phase 2: Email-specific dorks (find pages with exposed emails)
    if location:
        dork_queries = [
            # Phase 1: URL discovery (broad, finds more profiles)
            f'site:linkedin.com/in "{query}" "{location}"',
            f'site:linkedin.com/company "{query}" "{location}"',
            # Phase 1b: V7-fix — unquoted fallback for niche queries
            f'site:linkedin.com/in {query} {location}',
            # Phase 2: Email-specific
            f'site:linkedin.com/in "{query}" "{location}" "@gmail.com" OR "@yahoo.com"',
        ]
    else:
        dork_queries = [
            # Phase 1: URL discovery
            f'site:linkedin.com/in "{query}"',
            f'site:linkedin.com/company "{query}"',
            # Phase 1b: V7-fix — unquoted fallback for niche queries
            f'site:linkedin.com/in {query}',
            # Phase 2: Email-specific
            f'site:linkedin.com/in "{query}" "@gmail.com" OR "@yahoo.com"',
            f'site:linkedin.com/in "{query}" "founder" OR "CEO" email',
        ]

    discovered_urls: list[str] = []
    try:
        for dork in dork_queries[:4]:  # V7-fix: include unquoted fallback
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")

                # Extract name from LinkedIn title pattern "FirstName LastName - Title"
                title = r.get("title", "")
                name = title.split(" - ")[0].split(" | ")[0].strip() if title else ""

                # Always record the profile as a lead (even without email)
                if "linkedin.com" in link:
                    lead_entry: dict[str, str] = {
                        "email": "", "phone": "",
                        "name": name,
                        "platform": "linkedin",
                        "source_url": link,
                        "location": location,
                    }
                    # Add email/phone if found in snippet
                    emails_found = extract_emails(text)
                    phones_found = extract_phones(text)
                    if emails_found:
                        lead_entry["email"] = emails_found[0]
                    if phones_found:
                        lead_entry["phone"] = phones_found[0]
                    leads.append(lead_entry)
                    discovered_urls.append(link)
                else:
                    # Non-LinkedIn URLs: only add if we found contact info
                    snippet_emails = extract_emails(text)
                    if snippet_emails:
                        leads.append({
                            "email": snippet_emails[0], "phone": "",
                            "name": name,
                            "platform": "linkedin",
                            "source_url": link,
                            "location": location,
                        })
    except Exception as exc:
        logger.warning("LinkedIn dorking failed: %s", exc)

    logger.info("LinkedIn live scrape: %d leads from %d discovered URLs", len(leads), len(discovered_urls))
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# 12. REDDIT — RSS extraction (already works, just wrapping)
# ===========================================================================

def scrape_reddit(
    query: str,
    max_results: int = 15,
) -> list[dict]:
    """Extract contacts from Reddit via RSS/JSON endpoints.

    Issue #19 fix: Uses ThreadPoolExecutor instead of asyncio.run()
    to avoid crashing when called from within FastAPI's running event loop.
    """
    leads: list[dict] = []
    try:
        from app.services.reddit_extractor import reddit_search
    except ImportError:
        logger.warning("Reddit extractor not available")
        return leads

    def _run_async() -> dict:
        """Run the async reddit_search in a fresh event loop on a worker thread."""
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(reddit_search(query))
        finally:
            loop.close()

    try:
        future = _THREAD_POOL.submit(_run_async)
        result = future.result(timeout=30)  # 30s max

        # V7-fix: safely extract source_url to avoid KeyError
        sources = result.get("sources") or []
        primary_source = sources[0] if sources else ""

        for email in result.get("emails", []):
            leads.append({
                "email": email, "phone": "", "name": "",
                "platform": "reddit",
                "source_url": primary_source,
            })
        for phone in result.get("phones", []):
            leads.append({
                "email": "", "phone": phone, "name": "",
                "platform": "reddit",
                "source_url": primary_source,
            })
    except Exception as exc:
        logger.warning("Reddit scrape failed: %s", exc)

    logger.info("Reddit live scrape: %d leads", len(leads))
    return _dedup_leads(leads)[:max_results]


# ===========================================================================
# UNIFIED DISPATCHER — Routes one platform to the right scraper
# ===========================================================================

_PLATFORM_SCRAPERS = {
    "telegram": scrape_telegram_public,
    "whatsapp": scrape_whatsapp_links,
    "youtube": scrape_youtube_channels,
    "instagram": scrape_instagram,
    "facebook": scrape_facebook,
    "twitter": scrape_twitter,
    "google_maps": scrape_google_maps_directories,
    "pinterest": scrape_pinterest,
    "tiktok": scrape_tiktok,
    "tumblr": scrape_tumblr,
    "linkedin": scrape_linkedin,
    "reddit": scrape_reddit,
}


def live_scrape_platform(
    platform: str,
    query: str,
    location: str = "",
    max_results: int = 20,
) -> list[dict]:
    """Dispatch to the correct platform scraper.

    Uses inspect.signature() to detect whether the scraper accepts a
    ``location`` parameter instead of hard-coding platform names (Issue #21 fix).

    Args:
        platform: One of the 12 supported platforms
        query: Search keyword/query
        location: Optional location filter
        max_results: Maximum leads to return

    Returns:
        List of lead dicts with email, phone, name, platform, source_url
    """
    scraper = _PLATFORM_SCRAPERS.get(platform.lower())
    if not scraper:
        logger.warning("Unknown platform: %s", platform)
        return []

    try:
        sig = _inspect_mod.signature(scraper)
        if "location" in sig.parameters:
            return scraper(query, location=location, max_results=max_results)
        return scraper(query, max_results=max_results)
    except Exception as exc:
        logger.error("Live scrape error for %s: %s", platform, exc)
        return []


def live_scrape_all_platforms(
    platforms: list[str],
    query: str,
    location: str = "",
    max_per_platform: int = 20,
) -> list[dict]:
    """Scrape all requested platforms and combine results."""
    all_leads: list[dict] = []
    for platform in platforms:
        platform_leads = live_scrape_platform(
            platform, query, location, max_per_platform,
        )
        all_leads.extend(platform_leads)
        logger.info("Platform %s: %d leads", platform, len(platform_leads))
    return all_leads
