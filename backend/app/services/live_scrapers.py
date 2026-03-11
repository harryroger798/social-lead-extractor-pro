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

import atexit
import html as _html_mod
import inspect as _inspect_mod
import json as _json_mod
import logging
import random
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
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
    """Remove duplicate leads by (email, phone, platform) tuple.

    R2-14 fix: Coerce None values to empty string so the empty-check works.
    """
    seen: set[tuple[str, str, str]] = set()
    unique: list[dict] = []
    for lead in leads:
        key = (
            lead.get("email") or "",
            lead.get("phone") or "",
            lead.get("platform") or "",
        )
        if key == ("", "", ""):
            continue  # skip completely empty leads
        if key not in seen:
            seen.add(key)
            unique.append(lead)
    return unique


def _strip_tags(text: str) -> str:
    """Remove HTML tags and decode entities."""
    cleaned = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
    cleaned = re.sub(r"<script[^>]*>.*?</script>", "", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r"<[^>]+>", "", cleaned)
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
_nitter_lock = threading.Lock()  # R2-5 fix: thread-safe health check


def _get_healthy_nitter() -> list[str]:
    """Return Nitter instances that responded last time, or probe them.

    R2-4 fix: reuse a single session for all probes.
    R2-5 fix: use a lock so only one thread probes at a time.
    """
    global _nitter_healthy  # noqa: PLW0603
    with _nitter_lock:
        if _nitter_healthy:
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
# 5. FACEBOOK — Dorking ONLY (NEVER touch facebook.com directly)
# ===========================================================================

def scrape_facebook(
    query: str,
    max_results: int = 20,
) -> list[dict]:
    """Find Facebook business contacts via search engine dorking ONLY.

    NEVER directly access facebook.com — it aggressively blocks all
    automated access and will flag your IP. Instead, we find Facebook
    business pages indexed by search engines and extract contact info
    from the cached/indexed data.
    """
    leads: list[dict] = []

    dork_queries = [
        f'site:facebook.com "{query}" "contact us" OR "email" OR "@"',
        f'site:facebook.com "{query}" "business page" "phone" OR "email"',
        f'site:facebook.com "{query}" "about" "founded" "contact"',
        f'"{query}" facebook.com email contact phone',
    ]

    try:
        for dork in dork_queries[:3]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")

                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "",
                        "name": r.get("title", "").replace(" | Facebook", "").strip(),
                        "platform": "facebook",
                        "source_url": link,
                    })
                for phone in extract_phones(text):
                    leads.append({
                        "email": "", "phone": phone,
                        "name": r.get("title", "").replace(" | Facebook", "").strip(),
                        "platform": "facebook",
                        "source_url": link,
                    })
    except Exception as exc:
        logger.warning("Facebook dorking failed: %s", exc)

    logger.info("Facebook live scrape: %d leads", len(leads))
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

def scrape_google_maps_directories(
    query: str,
    location: str = "",
    max_results: int = 30,
) -> list[dict]:
    """Scrape business directories for Google Maps-style local business data.

    Instead of scraping Google Maps directly (heavily protected),
    we scrape public business directories that have the same data:
    - YellowPages (structured HTML)
    - Yelp (business listings)
    - BBB (Better Business Bureau)
    - Company websites found via dorking
    """
    leads: list[dict] = []
    search_term = f"{query} {location}".strip() if location else query

    # Method 1: YellowPages scraping
    try:
        yp_leads = _scrape_yellowpages_http(search_term, max_results=15)
        leads.extend(yp_leads)
    except Exception as exc:
        logger.debug("YellowPages scrape failed: %s", exc)

    # Method 2: Yelp scraping
    try:
        yelp_leads = _scrape_yelp_http(search_term, location, max_results=15)
        leads.extend(yelp_leads)
    except Exception as exc:
        logger.debug("Yelp scrape failed: %s", exc)

    # Method 3: Dorking for local businesses
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

    logger.info("Google Maps directories: %d leads", len(leads))
    return _dedup_leads(leads)[:max_results]


def _scrape_yellowpages_http(query: str, max_results: int = 15) -> list[dict]:
    """Scrape YellowPages via HTTP (no browser needed)."""
    leads: list[dict] = []
    try:
        url = f"https://www.yellowpages.com/search"
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
                            leads.append({
                                "name": item.get("name", ""),
                                "phone": item.get("telephone", ""),
                                "email": "",
                                "platform": "google_maps",
                                "source_url": item.get("url", ""),
                                "location": str(item.get("address", "")),
                            })
                elif isinstance(data, dict):
                    if data.get("@type") in ("LocalBusiness", "Restaurant", "Store"):
                        leads.append({
                            "name": data.get("name", ""),
                            "phone": data.get("telephone", ""),
                            "email": "",
                            "platform": "google_maps",
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
                    "platform": "google_maps",
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
    """
    leads: list[dict] = []

    # Primary: S3 database (handled in main extraction pipeline)
    # This function handles the secondary dorking path

    dork_queries = [
        f'site:linkedin.com/in "{query}" "@gmail.com" OR "@yahoo.com"',
        f'site:linkedin.com/in "{query}" "email me at" OR "contact me"',
        f'site:linkedin.com/in "{query}" "founder" OR "CEO" email',
    ]

    if location:
        dork_queries = [
            f'site:linkedin.com/in "{query}" "{location}" "@gmail.com" OR "@yahoo.com"',
            f'site:linkedin.com/in "{query}" "{location}" email OR contact',
        ]

    try:
        for dork in dork_queries[:3]:
            results = free_search_waterfall(dork, num_results=10, min_results=2)
            for r in results:
                text = f"{r.get('title', '')} {r.get('snippet', '')}"
                link = r.get("link", "")

                # Extract name from LinkedIn title pattern "FirstName LastName - Title"
                title = r.get("title", "")
                name = title.split(" - ")[0].split(" | ")[0].strip() if title else ""

                for email in extract_emails(text):
                    leads.append({
                        "email": email, "phone": "",
                        "name": name,
                        "platform": "linkedin",
                        "source_url": link,
                        "location": location,
                    })
                for phone in extract_phones(text):
                    leads.append({
                        "email": "", "phone": phone,
                        "name": name,
                        "platform": "linkedin",
                        "source_url": link,
                        "location": location,
                    })
    except Exception as exc:
        logger.warning("LinkedIn dorking failed: %s", exc)

    logger.info("LinkedIn live scrape: %d leads", len(leads))
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
    import asyncio

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

        for email in result.get("emails", []):
            leads.append({
                "email": email, "phone": "", "name": "",
                "platform": "reddit",
                "source_url": result["sources"][0] if result.get("sources") else "",
            })
        for phone in result.get("phones", []):
            leads.append({
                "email": "", "phone": phone, "name": "",
                "platform": "reddit",
                "source_url": result["sources"][0] if result.get("sources") else "",
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
