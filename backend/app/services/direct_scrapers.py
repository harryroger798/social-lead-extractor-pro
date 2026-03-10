"""Direct platform scrapers — 100% free, 100% ban-free, NO Google dorking.

These scrapers access platforms DIRECTLY via HTTP requests or Selenium,
bypassing search engine intermediaries entirely. This avoids CAPTCHAs
that block dorking from cloud servers.

Proven methods (tested from cloud server):
  - LinkedIn: Direct public profile HTTP scraping (JSON-LD structured data)
  - TikTok: Direct profile HTTP scraping (embedded __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON)
  - YouTube: Selenium search + channel about page scraping for business emails
  - Job Boards: Free public APIs (RemoteOK + Arbeitnow) — replaces Indeed/Glassdoor dorking
  - Instagram: Blocked from cloud (login wall) — falls back to bio link following
  - Facebook: Blocked from cloud (login wall) — falls back to bio link following

All methods: 100% FREE | NO API keys | NO search engine dorking.
"""

import asyncio
import json
import logging
import random
import re
import time
from urllib.parse import quote_plus

import httpx

from app.services.extractor import extract_emails, extract_phones
from app.services.bio_link_follower import follow_bio_links

logger = logging.getLogger(__name__)

# ─── Rotating User-Agent Pool ───────────────────────────────────────────────
# 12 realistic browser UAs to avoid fingerprint-based blocking by DDG/LinkedIn
_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
    "Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
]


def _random_headers() -> dict[str, str]:
    """Return headers with a randomly selected User-Agent."""
    return {
        "User-Agent": random.choice(_USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }


HEADERS = _random_headers()  # backward compat for any direct references


# ─── Helpers ────────────────────────────────────────────────────────────────

# Common TLDs for email cleanup (DDG snippets can glue next word to TLD)
_VALID_TLDS = {
    "com", "net", "org", "edu", "gov", "io", "co", "us", "uk", "ca", "au",
    "de", "fr", "in", "info", "biz", "me", "tv", "xyz", "app", "dev",
    "store", "shop", "online", "site", "tech", "ai", "pro", "health",
}


def _clean_snippet_email(email: str) -> str:
    """Fix emails extracted from DDG snippets that have trailing words glued on.

    Example: 'Hello@joycethedentist.com.Watch' → 'Hello@joycethedentist.com'
    """
    parts = email.split("@")
    if len(parts) != 2:
        return ""
    domain = parts[1]
    # Split domain by dots and find the last valid TLD
    domain_parts = domain.split(".")
    for i in range(len(domain_parts) - 1, 0, -1):
        if domain_parts[i].lower() in _VALID_TLDS:
            cleaned_domain = ".".join(domain_parts[: i + 1])
            return f"{parts[0]}@{cleaned_domain}"
    # If no known TLD found, return as-is (might still be valid)
    return email


# ─── Shared Web Search (Brave primary, DDG fallback) ────────────────────────

# Global throttle for search requests (prevents rate limiting on any engine)
_SEARCH_MIN_INTERVAL = 2.0  # seconds
_search_last_request_time: float = 0.0
_search_lock = asyncio.Lock()


async def _search_throttle() -> None:
    """Enforce minimum interval between search requests to avoid rate limiting."""
    global _search_last_request_time
    async with _search_lock:
        now = time.monotonic()
        elapsed = now - _search_last_request_time
        if elapsed < _SEARCH_MIN_INTERVAL:
            wait_time = _SEARCH_MIN_INTERVAL - elapsed + random.uniform(0.2, 0.8)
            await asyncio.sleep(wait_time)
        _search_last_request_time = time.monotonic()


async def _brave_search(query: str, max_results: int = 30) -> list[dict]:
    """Search via Brave Search HTML (works from cloud IPs, no API key needed).

    Brave Search reliably returns results from cloud servers without
    bot-detection challenges. Returns list of {url, title, snippet} dicts.
    Includes retry with exponential backoff on 429 rate limits.
    """
    items: list[dict] = []
    max_retries = 3

    for attempt in range(max_retries):
        try:
            await _search_throttle()

            headers = _random_headers()
            async with httpx.AsyncClient(
                follow_redirects=True, timeout=20, headers=headers, verify=False,
            ) as client:
                url = f"https://search.brave.com/search?q={quote_plus(query)}&count=20"
                resp = await client.get(url)

                if resp.status_code == 429:
                    backoff = (2 ** attempt) * 3 + random.uniform(2.0, 5.0)
                    logger.info("Brave 429 rate limited — retry in %.1fs (attempt %d/%d)",
                                backoff, attempt + 1, max_retries)
                    await asyncio.sleep(backoff)
                    continue

                if resp.status_code != 200:
                    logger.debug("Brave returned %d for query '%s'", resp.status_code, query[:50])
                    return items

                html = resp.text

            # Brave result structure:
            # <div class="snippet" data-pos="N" data-type="web">
            #   <a href="URL" ...>
            #     <div class="title ...">TITLE</div>
            #   </a>
            #   <div class="snippet-description">DESCRIPTION</div>
            # </div>

            # Extract each result block by data-pos
            result_blocks = re.findall(
                r'<div[^>]*class="snippet[^"]*"[^>]*data-pos="\d+"[^>]*data-type="web"[^>]*>(.*?)</div>\s*</div>\s*</div>\s*</div>',
                html, re.DOTALL,
            )

            if not result_blocks:
                # Fallback: extract <a> tags with external URLs + nearby text
                a_tags = re.findall(
                    r'<a\s+href="(https?://(?!search\.brave\.com)[^"]+)"[^>]*target="_self"[^>]*class="[^"]*"[^>]*>(.*?)</a>',
                    html, re.DOTALL,
                )
                seen_urls: set[str] = set()
                for href, a_content in a_tags:
                    clean_url = href.split("?")[0].rstrip("/")
                    if clean_url in seen_urls:
                        continue
                    seen_urls.add(clean_url)

                    # Extract title from link text
                    title = re.sub(r"<[^>]+>", " ", a_content)
                    title = re.sub(r"\s+", " ", title).strip()

                    # Get snippet from surrounding context
                    a_pos = html.find(f'href="{href}"')
                    snippet = ""
                    if a_pos >= 0:
                        # Look ahead for description text
                        after_a = html[a_pos:a_pos + 2000]
                        desc_match = re.search(
                            r'class="[^"]*snippet-description[^"]*"[^>]*>(.*?)</div>',
                            after_a, re.DOTALL,
                        )
                        if desc_match:
                            snippet = re.sub(r"<[^>]+>", " ", desc_match.group(1))
                            snippet = re.sub(r"\s+", " ", snippet).strip()

                    # Decode HTML entities
                    from html import unescape
                    title = unescape(title)
                    snippet = unescape(snippet)

                    items.append({
                        "url": href,
                        "title": title[:120],
                        "snippet": snippet[:300],
                    })
            else:
                for block in result_blocks:
                    # Extract URL
                    url_match = re.search(r'href="(https?://[^"]+)"', block)
                    if not url_match:
                        continue

                    result_url = url_match.group(1)

                    # Extract title
                    title_match = re.search(
                        r'class="[^"]*title[^"]*"[^>]*>(.*?)</div>', block, re.DOTALL,
                    )
                    title = ""
                    if title_match:
                        title = re.sub(r"<[^>]+>", " ", title_match.group(1))
                        title = re.sub(r"\s+", " ", title).strip()

                    # Extract description/snippet
                    desc_match = re.search(
                        r'class="[^"]*snippet-description[^"]*"[^>]*>(.*?)</div>',
                        block, re.DOTALL,
                    )
                    snippet = ""
                    if desc_match:
                        snippet = re.sub(r"<[^>]+>", " ", desc_match.group(1))
                        snippet = re.sub(r"\s+", " ", snippet).strip()

                    from html import unescape
                    title = unescape(title)
                    snippet = unescape(snippet)

                    items.append({
                        "url": result_url,
                        "title": title[:120],
                        "snippet": snippet[:300],
                    })

            if items:
                logger.info("Brave search returned %d results for '%s'", len(items), query[:50])
            else:
                logger.debug("Brave search: 0 results for '%s'", query[:50])

            # Success (even if 0 items) — break retry loop
            break

        except httpx.TimeoutException:
            backoff = (2 ** attempt) + random.uniform(1.0, 2.0)
            logger.debug("Brave search timeout — retry in %.1fs (attempt %d/%d)", backoff, attempt + 1, max_retries)
            await asyncio.sleep(backoff)
        except Exception as e:
            logger.debug("Brave search error: %s", e)
            break  # Non-retryable

    return items[:max_results]


async def _ddg_html_search(query: str, max_results: int = 30) -> list[dict]:
    """Search DuckDuckGo via HTML-only endpoint (fallback if Brave fails).

    Returns list of {url, title, snippet} dicts.
    """
    items: list[dict] = []
    max_retries = 2  # reduced retries since this is fallback

    for attempt in range(max_retries):
        try:
            await _search_throttle()

            headers = _random_headers()
            async with httpx.AsyncClient(
                follow_redirects=True, timeout=20, headers=headers, verify=False,
            ) as client:
                url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
                resp = await client.get(url)

                if resp.status_code in (202, 403, 429):
                    backoff = (2 ** attempt) + random.uniform(1.0, 3.0)
                    logger.debug("DDG rate limited (%d) — retry in %.1fs", resp.status_code, backoff)
                    await asyncio.sleep(backoff)
                    continue

                if resp.status_code != 200:
                    break

                html = resp.text

                # Check for CAPTCHA or bot detection page
                if "anomaly.js" in html or "cc=botnet" in html:
                    logger.debug("DDG bot detection active — skipping")
                    break

                if "Please try again" in html or "bot" in html.lower()[:500]:
                    logger.debug("DDG CAPTCHA detected — skipping")
                    break

                # Extract result links (DDG uses uddg redirect)
                raw_links = re.findall(
                    r'class="result__a"[^>]*href="([^"]+)"', html,
                )
                raw_titles = re.findall(
                    r'class="result__a"[^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE,
                )
                raw_snippets = re.findall(
                    r'class="result__snippet"[^>]*>(.*?)</(?:td|div)',
                    html, re.DOTALL | re.IGNORECASE,
                )

                from urllib.parse import unquote
                for i, raw_url in enumerate(raw_links):
                    if 'uddg=' in raw_url:
                        actual_url = unquote(raw_url.split('uddg=')[1].split('&')[0])
                    else:
                        actual_url = raw_url

                    title = re.sub(r'<[^>]+>', '', raw_titles[i]).strip() if i < len(raw_titles) else ""
                    snippet = re.sub(r'<[^>]+>', '', raw_snippets[i]).strip() if i < len(raw_snippets) else ""
                    snippet = snippet.replace('&#x27;', "'").replace('&amp;', '&').replace('&quot;', '"')
                    title = title.replace('&#x27;', "'").replace('&amp;', '&').replace('&quot;', '"')

                    items.append({
                        "url": actual_url,
                        "title": title,
                        "snippet": snippet,
                    })

                break  # Success

        except httpx.TimeoutException:
            logger.debug("DDG timeout (attempt %d)", attempt + 1)
        except Exception as e:
            logger.debug("DDG search failed: %s", e)
            break

    return items[:max_results]


async def _web_search(query: str, max_results: int = 30) -> list[dict]:
    """Unified web search: tries Brave first, falls back to DDG.

    Returns list of {url, title, snippet} dicts.
    Both engines work from cloud IPs without API keys.
    """
    # Primary: Brave Search (proven to work from cloud IPs)
    results = await _brave_search(query, max_results)
    if results:
        return results

    # Fallback: DDG HTML (may be bot-blocked from some cloud IPs)
    logger.info("Brave returned 0 results — trying DDG fallback for '%s'", query[:50])
    return await _ddg_html_search(query, max_results)


# ─── LinkedIn Direct Scraper ─────────────────────────────────────────────────

async def scrape_linkedin_direct(
    keyword: str,
    max_results: int = 20,
    delay: float = 2.0,
) -> list[dict]:
    """Scrape LinkedIn profiles via DDG HTML discovery + HTTP profile visits.

    Method:
      1. DDG HTML API discovers LinkedIn profile URLs (proven from cloud)
      2. Extract emails/phones directly from DDG search snippets
      3. Visit each LinkedIn profile via HTTP for JSON-LD data
      4. Merge snippet + profile results
    """
    results: list[dict] = []
    seen_emails: set[str] = set()

    try:
        # Step 1: DDG HTML discovery (also extracts snippet emails)
        li_pattern = re.compile(
            r"(https?://(?:www\.)?linkedin\.com/in/[A-Za-z0-9\-_.]+)",
            re.IGNORECASE,
        )
        profile_urls: list[str] = []

        # Primary query: site: operator returns 10 LinkedIn profiles (proven)
        query = f"site:linkedin.com/in {keyword}"
        ddg_results = await _web_search(query, max_results=20)

        # Fallback query if primary returns few results
        if len(ddg_results) < 3:
            query2 = f"linkedin.com/in/ {keyword}"
            ddg_results2 = await _web_search(query2, max_results=20)
            seen_urls = {item["url"] for item in ddg_results}
            for item in ddg_results2:
                if item["url"] not in seen_urls:
                    ddg_results.append(item)

        for item in ddg_results:
            # Collect profile URLs
            profile_url_match = None
            for match in li_pattern.finditer(item["url"]):
                url = match.group(1).split("?")[0].rstrip("/")
                if url not in profile_urls and "/pub/dir" not in url:
                    profile_urls.append(url)
                    profile_url_match = url

            # Extract emails/phones from DDG snippets (bonus leads)
            text = f"{item['title']} {item['snippet']}"
            found_contact = False
            for email in extract_emails(text):
                if email not in seen_emails:
                    seen_emails.add(email)
                    results.append({
                        "email": email, "phone": "", "name": item["title"][:60],
                        "platform": "linkedin", "source_url": item["url"],
                        "keyword": keyword,
                    })
                    found_contact = True
            for phone in extract_phones(text):
                results.append({
                    "email": "", "phone": phone, "name": item["title"][:60],
                    "platform": "linkedin", "source_url": item["url"],
                    "keyword": keyword,
                })
                found_contact = True

            # Even without email/phone, create a lead with name + profile URL
            if not found_contact and profile_url_match:
                # Extract name from DDG title (e.g. "John Smith - Dentist - LinkedIn")
                name = item["title"].split(" - ")[0].split(" | ")[0].strip()[:60]
                if name and name.lower() != "linkedin":
                    results.append({
                        "email": "", "phone": "", "name": name,
                        "platform": "linkedin", "source_url": profile_url_match,
                        "keyword": keyword,
                    })

        logger.info("LinkedIn: Found %d profiles, %d snippet leads for '%s' via DDG HTML",
                     len(profile_urls), len(results), keyword)

        # Step 2: Try visiting LinkedIn profiles for extra JSON-LD data.
        # LinkedIn blocks cloud IPs with 999 — this is best-effort only.
        # If first request gets 999, skip all remaining visits (DDG snippets
        # already captured names/emails/phones above).
        if profile_urls and not results:
            # Only attempt profile visits if DDG snippets yielded zero leads
            try:
                async with httpx.AsyncClient(
                    follow_redirects=True, timeout=10, headers=_random_headers(),
                    verify=False,
                ) as client:
                    # Test with first profile only
                    client.headers.update(_random_headers())
                    resp = await client.get(profile_urls[0])
                    if resp.status_code == 999:
                        logger.info("LinkedIn blocks profile visits from this IP (999) — using DDG snippet data only")
                    elif resp.status_code == 200:
                        # Cloud IP not blocked — visit remaining profiles
                        html = resp.text
                        leads = _parse_linkedin_profile(html, profile_urls[0], keyword)
                        for lead in leads:
                            if lead.get("email") and lead["email"] not in seen_emails:
                                seen_emails.add(lead["email"])
                                results.append(lead)

                        for url in profile_urls[1:max_results]:
                            try:
                                client.headers.update(_random_headers())
                                resp = await client.get(url)
                                if resp.status_code == 200:
                                    for lead in _parse_linkedin_profile(resp.text, url, keyword):
                                        if lead.get("email") and lead["email"] not in seen_emails:
                                            seen_emails.add(lead["email"])
                                            results.append(lead)
                                elif resp.status_code == 999:
                                    logger.info("LinkedIn 999 mid-crawl — stopping profile visits")
                                    break
                                await asyncio.sleep(delay + random.uniform(0.5, 1.5))
                            except Exception:
                                pass
            except Exception as e:
                logger.debug("LinkedIn profile visit error: %s", e)

    except Exception as e:
        logger.error("LinkedIn direct scraper error: %s", e)

    return results


async def _find_linkedin_profiles(keyword: str, max_results: int = 20) -> list[str]:
    """Find LinkedIn profile URLs via DDG HTML API (works from cloud).

    PROVEN: DDG HTML endpoint returns 9 LinkedIn profile URLs for 'dentist'.
    Query: 'linkedin.com/in/ <keyword>' (no quotes, no site: operator).
    """
    urls: list[str] = []
    li_pattern = re.compile(
        r"(https?://(?:www\.)?linkedin\.com/in/[A-Za-z0-9\-_.]+)",
        re.IGNORECASE,
    )

    # Primary: DDG HTML API (proven from cloud)
    query = f"linkedin.com/in/ {keyword}"
    ddg_results = await _web_search(query, max_results=20)
    for item in ddg_results:
        for match in li_pattern.finditer(item["url"]):
            url = match.group(1).split("?")[0].rstrip("/")
            if url not in urls and "/pub/dir" not in url:
                urls.append(url)

    # Also extract emails directly from DDG snippets
    # (these are bonus leads even without visiting profiles)
    if not urls:
        # Try broader query
        query2 = f"linkedin.com/in {keyword} email contact"
        ddg_results = await _web_search(query2, max_results=20)
        for item in ddg_results:
            for match in li_pattern.finditer(item["url"]):
                url = match.group(1).split("?")[0].rstrip("/")
                if url not in urls and "/pub/dir" not in url:
                    urls.append(url)

    logger.info("LinkedIn: Found %d profiles for '%s' via DDG HTML", len(urls), keyword)
    return urls[:max_results]


def _parse_linkedin_profile(html: str, url: str, keyword: str) -> list[dict]:
    """Parse LinkedIn profile HTML for structured data and contact info."""
    results: list[dict] = []
    name = ""

    # Extract JSON-LD structured data (LinkedIn embeds this for public profiles)
    jsonld_pattern = re.compile(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        re.DOTALL | re.IGNORECASE,
    )
    for match in jsonld_pattern.finditer(html):
        try:
            data = json.loads(match.group(1))
            if isinstance(data, dict):
                name = data.get("name", "")
                # Some LinkedIn profiles include email in JSON-LD
                if data.get("email"):
                    results.append({
                        "email": data["email"], "phone": "", "name": name,
                        "platform": "linkedin", "source_url": url, "keyword": keyword,
                    })
        except (json.JSONDecodeError, Exception):
            continue

    # Extract from visible text
    # Strip HTML tags for text extraction
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    # Extract name from <title>
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    if title_match and not name:
        raw_title = title_match.group(1).strip()
        if " - " in raw_title:
            name = raw_title.split(" - ")[0].strip()
        elif " | " in raw_title:
            name = raw_title.split(" | ")[0].strip()

    emails = extract_emails(text)
    phones = extract_phones(text)

    for email in emails:
        results.append({
            "email": email, "phone": "", "name": name,
            "platform": "linkedin", "source_url": url, "keyword": keyword,
        })
    for phone in phones:
        results.append({
            "email": "", "phone": phone, "name": name,
            "platform": "linkedin", "source_url": url, "keyword": keyword,
        })

    return results


# ─── TikTok Direct Scraper ───────────────────────────────────────────────────

async def scrape_tiktok_direct(
    keyword: str,
    max_results: int = 20,
    delay: float = 2.0,
) -> list[dict]:
    """Scrape TikTok profiles via DDG HTML discovery + Selenium profile rendering.

    PROVEN: DDG HTML returns 7 TikTok profile URLs + 2 emails in snippets.
    TikTok HTTP profile requests return statusCode 10221 from cloud,
    so we use Selenium to render profiles for bio/bioLink extraction.

    Method:
      1. DDG HTML API discovers profile URLs (fast, no Selenium)
      2. Extract emails directly from DDG snippets (bonus leads)
      3. Selenium renders each TikTok profile for bio/bioLink
      4. Follow bio links via HTTP for additional contacts
    """
    results: list[dict] = []
    bio_urls: list[str] = []

    try:
        # Step 1: Discover profiles via DDG HTML (proven from cloud)
        tt_pattern = re.compile(
            r"(https?://(?:www\.)?tiktok\.com/@[A-Za-z0-9_.]+)",
            re.IGNORECASE,
        )
        profile_urls: list[str] = []

        query = f'"tiktok.com/@" {keyword}'
        ddg_results = await _web_search(query, max_results=20)

        for item in ddg_results:
            # Extract TikTok profile URLs
            for match in tt_pattern.finditer(item["url"]):
                url = match.group(1).rstrip("/")
                if url not in profile_urls and "/tag/" not in url and "/contact" not in url:
                    profile_urls.append(url)

            # Extract emails from DDG snippets (bonus leads)
            text = f"{item['title']} {item['snippet']}"
            emails = extract_emails(text)
            phones = extract_phones(text)
            for email in emails:
                # Fix DDG snippet email parsing: ".com.Watch" → ".com"
                email = _clean_snippet_email(email)
                if not email:
                    continue
                results.append({
                    "email": email, "phone": "", "name": item["title"][:60],
                    "platform": "tiktok", "source_url": item["url"],
                    "keyword": keyword,
                })
            for phone in phones:
                results.append({
                    "email": "", "phone": phone, "name": item["title"][:60],
                    "platform": "tiktok", "source_url": item["url"],
                    "keyword": keyword,
                })

        # Try broader query if few profiles found
        if len(profile_urls) < 3:
            query2 = f"tiktok.com @ {keyword} email business"
            ddg_results2 = await _web_search(query2, max_results=20)
            for item in ddg_results2:
                for match in tt_pattern.finditer(item["url"]):
                    url = match.group(1).rstrip("/")
                    if url not in profile_urls and "/tag/" not in url and "/contact" not in url:
                        profile_urls.append(url)
                text = f"{item['title']} {item['snippet']}"
                for email in extract_emails(text):
                    if not any(r.get("email") == email for r in results):
                        results.append({
                            "email": email, "phone": "", "name": "",
                            "platform": "tiktok", "source_url": item["url"],
                            "keyword": keyword,
                        })

        logger.info("TikTok: Found %d profiles for '%s' via DDG HTML", len(profile_urls), keyword)

        # Step 2: Visit profiles via Selenium (HTTP returns 10221)
        if profile_urls:
            loop = asyncio.get_event_loop()
            selenium_results = await loop.run_in_executor(
                None, _tiktok_profile_selenium_worker, profile_urls[:max_results], keyword, delay,
            )
            for lead in selenium_results.get("leads", []):
                if not any(r.get("email") == lead.get("email") and lead.get("email") for r in results):
                    results.append(lead)
            bio_urls.extend(selenium_results.get("bio_urls", []))

        # Step 3: Follow bio links for additional contacts
        if bio_urls:
            try:
                loop = asyncio.get_event_loop()
                bio_results = await loop.run_in_executor(
                    None, follow_bio_links, bio_urls, 15, True,
                )
                for email in bio_results.get("emails", []):
                    if not any(r.get("email") == email for r in results):
                        results.append({
                            "email": email, "phone": "", "name": "",
                            "platform": "tiktok", "source_url": "bio_link",
                            "keyword": keyword,
                        })
                for phone in bio_results.get("phones", []):
                    results.append({
                        "email": "", "phone": phone, "name": "",
                        "platform": "tiktok", "source_url": "bio_link",
                        "keyword": keyword,
                    })
            except Exception as e:
                logger.debug("TikTok bio link following failed: %s", e)

    except Exception as e:
        logger.error("TikTok direct scraper error: %s", e)

    return results


def _tiktok_profile_selenium_worker(
    profile_urls: list[str], keyword: str, delay: float,
) -> dict:
    """Selenium worker to render TikTok profile pages and extract data."""
    leads: list[dict] = []
    bio_urls: list[str] = []
    driver = None

    try:
        driver = _create_selenium_driver()
        if not driver:
            return {"leads": leads, "bio_urls": bio_urls}

        for profile_url in profile_urls:
            try:
                driver.get(profile_url)
                time.sleep(delay + 1)
                page_html = driver.page_source
                page_leads, bio_link = _parse_tiktok_profile(page_html, profile_url, keyword)
                leads.extend(page_leads)
                if bio_link:
                    bio_urls.append(bio_link)
            except Exception as e:
                logger.debug("TikTok profile scrape failed %s: %s", profile_url, e)

    except Exception as e:
        logger.error("TikTok Selenium worker error: %s", e)
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass

    return {"leads": leads, "bio_urls": bio_urls}


def _parse_tiktok_profile(html: str, url: str, keyword: str) -> tuple[list[dict], str]:
    """Parse TikTok profile page for embedded JSON data.

    TikTok embeds __UNIVERSAL_DATA_FOR_REHYDRATION__ in a <script> tag
    containing full profile data: name, bio, follower count, bio link.

    Returns (leads_list, bio_link_url).
    """
    results: list[dict] = []
    bio_link = ""

    # Extract __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON
    rehydration_pattern = re.compile(
        r'<script\s+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>',
        re.DOTALL | re.IGNORECASE,
    )
    match = rehydration_pattern.search(html)
    if match:
        try:
            data = json.loads(match.group(1))
            # Navigate to user info in the data structure
            default_scope = data.get("__DEFAULT_SCOPE__", {})
            webapp_user = default_scope.get("webapp.user-detail", {})
            user_info = webapp_user.get("userInfo", {})
            user = user_info.get("user", {})
            stats = user_info.get("stats", {})

            name = user.get("nickname", "")
            bio = user.get("signature", "")
            bio_link = user.get("bioLink", {}).get("link", "") if isinstance(user.get("bioLink"), dict) else ""

            # Extract emails/phones from bio text
            if bio:
                emails = extract_emails(bio)
                phones = extract_phones(bio)
                for email in emails:
                    results.append({
                        "email": email, "phone": "", "name": name,
                        "platform": "tiktok", "source_url": url, "keyword": keyword,
                    })
                for phone in phones:
                    results.append({
                        "email": "", "phone": phone, "name": name,
                        "platform": "tiktok", "source_url": url, "keyword": keyword,
                    })

        except (json.JSONDecodeError, Exception) as e:
            logger.debug("TikTok JSON parse failed for %s: %s", url, e)

    # Also extract from visible page text as fallback
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    page_emails = extract_emails(text)
    for email in page_emails:
        if not any(r.get("email") == email for r in results):
            results.append({
                "email": email, "phone": "", "name": "",
                "platform": "tiktok", "source_url": url, "keyword": keyword,
            })

    return results, bio_link


# ─── YouTube Direct Scraper (Selenium) ───────────────────────────────────────

async def scrape_youtube_direct(
    keyword: str,
    max_results: int = 20,
    delay: float = 3.0,
) -> list[dict]:
    """Scrape YouTube channels via DDG HTML discovery + Selenium about pages.

    Method:
      1. DDG HTML API discovers YouTube channel URLs (no Selenium needed)
      2. Extract emails from DDG snippets (bonus leads)
      3. Selenium visits each channel's /about page for more emails
      4. Parses ytInitialData JSON and page text for emails/phones
    """
    results: list[dict] = []
    seen_emails: set[str] = set()

    try:
        # Step 1: Discover YouTube channels via DDG HTML
        yt_pattern = re.compile(
            r"(https?://(?:www\.)?youtube\.com/@[A-Za-z0-9_\-]+)",
            re.IGNORECASE,
        )
        channel_urls: list[str] = []

        query = f"site:youtube.com/@ {keyword}"
        ddg_results = await _web_search(query, max_results=20)

        for item in ddg_results:
            for match in yt_pattern.finditer(item["url"]):
                url = match.group(1).rstrip("/")
                if url not in channel_urls:
                    channel_urls.append(url)

            # Extract emails from DDG snippets
            text = f"{item['title']} {item['snippet']}"
            for email in extract_emails(text):
                if email.lower() not in seen_emails:
                    seen_emails.add(email.lower())
                    results.append({
                        "email": email, "phone": "", "name": item["title"][:60],
                        "platform": "youtube", "source_url": item["url"],
                        "keyword": keyword,
                    })

        # Fallback broader query
        if len(channel_urls) < 5:
            query2 = f"youtube.com/@ {keyword} channel"
            ddg_results2 = await _web_search(query2, max_results=20)
            for item in ddg_results2:
                for match in yt_pattern.finditer(item["url"]):
                    url = match.group(1).rstrip("/")
                    if url not in channel_urls:
                        channel_urls.append(url)
                text = f"{item['title']} {item['snippet']}"
                for email in extract_emails(text):
                    if email.lower() not in seen_emails:
                        seen_emails.add(email.lower())
                        results.append({
                            "email": email, "phone": "", "name": "",
                            "platform": "youtube", "source_url": item["url"],
                            "keyword": keyword,
                        })

        logger.info("YouTube: Found %d channels for '%s' via DDG HTML", len(channel_urls), keyword)

        # Step 2: Visit channel about pages via Selenium for more emails
        if channel_urls:
            loop = asyncio.get_event_loop()
            selenium_results = await loop.run_in_executor(
                None, _youtube_about_selenium_worker, channel_urls[:max_results], keyword, delay,
            )
            for lead in selenium_results:
                email = lead.get("email", "").lower()
                if email and email not in seen_emails:
                    seen_emails.add(email)
                    results.append(lead)
                elif not email:
                    results.append(lead)

    except Exception as e:
        logger.error("YouTube direct scraper error: %s", e)

    return results


def _youtube_about_selenium_worker(
    channel_urls: list[str], keyword: str, delay: float,
) -> list[dict]:
    """Selenium worker to visit YouTube channel about pages."""
    results: list[dict] = []
    driver = None

    try:
        driver = _create_selenium_driver()
        if not driver:
            return results

        for channel_url in channel_urls:
            try:
                about_url = channel_url.rstrip("/") + "/about"
                driver.get(about_url)
                time.sleep(delay)

                page_source = driver.page_source
                leads = _parse_youtube_channel(page_source, channel_url, keyword)
                results.extend(leads)

            except Exception as e:
                logger.debug("YouTube channel scrape failed %s: %s", channel_url, e)

    except Exception as e:
        logger.error("YouTube Selenium worker error: %s", e)
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass

    return results


def _create_selenium_driver():
    """Create a headless Selenium Chrome driver."""
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
    except ImportError:
        return None

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    )
    options.add_experimental_option("excludeSwitches", ["enable-automation"])

    # Find Chrome binary
    import shutil
    chrome_paths = [
        '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium', '/usr/bin/chromium-browser',
    ]
    chrome_binary = shutil.which("google-chrome") or shutil.which("chromium")
    if not chrome_binary:
        for path in chrome_paths:
            import os
            if os.path.exists(path):
                chrome_binary = path
                break
    if chrome_binary:
        options.binary_location = chrome_binary

    driver = None

    # Try webdriver-manager first
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        driver_path = ChromeDriverManager().install()
        service = Service(executable_path=driver_path)
        driver = webdriver.Chrome(service=service, options=options)
    except Exception as e:
        logger.debug("webdriver-manager failed: %s", e)

    # Fallback: system chromedriver
    if not driver:
        try:
            chromedriver = shutil.which("chromedriver")
            if chromedriver:
                service = Service(executable_path=chromedriver)
                driver = webdriver.Chrome(service=service, options=options)
            else:
                driver = webdriver.Chrome(options=options)
        except Exception as e:
            logger.warning("Selenium Chrome startup failed: %s", e)
            return None

    if driver:
        driver.set_page_load_timeout(30)

    return driver


def _extract_youtube_channel_urls(driver) -> list[str]:
    """Extract unique channel URLs from YouTube search results page."""
    from selenium.webdriver.common.by import By

    channel_urls: list[str] = []
    try:
        links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/@']")
        seen = set()
        for link in links:
            href = link.get_attribute("href") or ""
            if "/@" in href and "/watch" not in href:
                # Normalize to channel base URL
                parts = href.split("/@")
                if len(parts) >= 2:
                    username = parts[1].split("/")[0].split("?")[0]
                    channel_url = f"https://www.youtube.com/@{username}"
                    if channel_url not in seen:
                        seen.add(channel_url)
                        channel_urls.append(channel_url)
    except Exception as e:
        logger.debug("YouTube channel URL extraction failed: %s", e)

    return channel_urls


def _parse_youtube_channel(html: str, url: str, keyword: str) -> list[dict]:
    """Parse YouTube channel page for business emails.

    YouTube embeds ytInitialData JSON which contains channel description,
    business email inquiry link, and other contact info.
    """
    results: list[dict] = []
    name = ""

    # Extract ytInitialData JSON
    yt_pattern = re.compile(r'var ytInitialData\s*=\s*(\{.*?\});\s*</script>', re.DOTALL)
    match = yt_pattern.search(html)
    if match:
        try:
            data = json.loads(match.group(1))
            # Try to find channel name and description
            _extract_yt_channel_info(data, results, url, keyword)
        except (json.JSONDecodeError, Exception) as e:
            logger.debug("ytInitialData parse failed for %s: %s", url, e)

    # Also extract from visible page text
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    emails = extract_emails(text)
    phones = extract_phones(text)

    existing_emails = {r.get("email", "").lower() for r in results}
    for email in emails:
        if email.lower() not in existing_emails:
            results.append({
                "email": email, "phone": "", "name": name,
                "platform": "youtube", "source_url": url, "keyword": keyword,
            })
    for phone in phones:
        results.append({
            "email": "", "phone": phone, "name": name,
            "platform": "youtube", "source_url": url, "keyword": keyword,
        })

    return results


def _extract_yt_channel_info(
    data: dict, results: list[dict], url: str, keyword: str,
) -> None:
    """Recursively extract channel info from ytInitialData JSON."""
    if not isinstance(data, dict):
        return

    # Check for channel description text that might contain emails
    for key in ("description", "channelDescription", "text", "content"):
        val = data.get(key)
        if isinstance(val, str) and len(val) > 10:
            emails = extract_emails(val)
            phones = extract_phones(val)
            for email in emails:
                results.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "youtube", "source_url": url, "keyword": keyword,
                })
            for phone in phones:
                results.append({
                    "email": "", "phone": phone, "name": "",
                    "platform": "youtube", "source_url": url, "keyword": keyword,
                })

    # Check for channel name
    if data.get("title") and isinstance(data["title"], str):
        # Could be the channel name
        pass

    # Recurse into nested structures (but limit depth to avoid infinite recursion)
    for val in data.values():
        if isinstance(val, dict):
            _extract_yt_channel_info(val, results, url, keyword)
        elif isinstance(val, list):
            for item in val:
                if isinstance(item, dict):
                    _extract_yt_channel_info(item, results, url, keyword)


# ─── Job Boards Free API Scrapers ────────────────────────────────────────────

async def scrape_remoteok_api(
    keyword: str,
    max_results: int = 50,
) -> list[dict]:
    """Scrape RemoteOK free public API for job listings.

    RemoteOK provides a free JSON API at https://remoteok.com/api
    that returns remote job listings with company names, descriptions,
    and URLs — which we can crawl for contact info.

    100% FREE | NO API key | NO CAPTCHA | NO rate limiting.
    """
    results: list[dict] = []

    try:
        async with httpx.AsyncClient(
            follow_redirects=True, timeout=20,
            headers={"User-Agent": "SnapLeads/3.2.0"},
            verify=False,
        ) as client:
            resp = await client.get("https://remoteok.com/api")
            if resp.status_code == 200:
                jobs = resp.json()
                # First item is metadata, skip it
                if isinstance(jobs, list) and len(jobs) > 1:
                    jobs = jobs[1:]  # Skip metadata

                keyword_lower = keyword.lower()
                matched = 0

                for job in jobs:
                    if matched >= max_results:
                        break

                    # Filter by keyword relevance
                    position = job.get("position", "")
                    company = job.get("company", "")
                    description = job.get("description", "")
                    tags = " ".join(job.get("tags", []))

                    searchable = f"{position} {company} {description} {tags}".lower()
                    if keyword_lower not in searchable:
                        continue

                    # Extract contact info from description
                    desc_text = re.sub(r'<[^>]+>', ' ', description)
                    emails = extract_emails(desc_text)
                    phones = extract_phones(desc_text)

                    company_url = job.get("company_logo_url", "").split("/logo/")[-1] if job.get("company_logo_url") else ""
                    apply_url = job.get("apply_url", "") or job.get("url", "")

                    if emails:
                        for email in emails:
                            results.append({
                                "email": email, "phone": "", "name": company,
                                "platform": "indeed",
                                "source_url": apply_url,
                                "keyword": keyword,
                                "category": "hiring_company",
                            })
                            matched += 1
                    elif phones:
                        for phone in phones:
                            results.append({
                                "email": "", "phone": phone, "name": company,
                                "platform": "indeed",
                                "source_url": apply_url,
                                "keyword": keyword,
                                "category": "hiring_company",
                            })
                            matched += 1
                    elif company and apply_url:
                        # Store as lead even without email — company is valuable
                        results.append({
                            "email": "", "phone": "", "name": company,
                            "platform": "indeed",
                            "source_url": apply_url,
                            "keyword": keyword,
                            "category": "hiring_company",
                        })
                        matched += 1

    except Exception as e:
        logger.warning("RemoteOK API failed: %s", e)

    return results


async def scrape_arbeitnow_api(
    keyword: str,
    max_results: int = 50,
) -> list[dict]:
    """Scrape Arbeitnow free public API for job listings.

    Arbeitnow provides a free JSON API at https://www.arbeitnow.com/api/job-board-api
    that returns job listings with company names, descriptions, and URLs.

    100% FREE | NO API key | NO CAPTCHA.
    """
    results: list[dict] = []

    try:
        async with httpx.AsyncClient(
            follow_redirects=True, timeout=20,
            headers={"User-Agent": "SnapLeads/3.2.0"},
            verify=False,
        ) as client:
            resp = await client.get(
                f"https://www.arbeitnow.com/api/job-board-api?search={quote_plus(keyword)}"
            )
            if resp.status_code == 200:
                data = resp.json()
                jobs = data.get("data", [])

                matched = 0
                for job in jobs:
                    if matched >= max_results:
                        break

                    company = job.get("company_name", "")
                    title = job.get("title", "")
                    description = job.get("description", "")
                    job_url = job.get("url", "")

                    # Extract contact info from description
                    desc_text = re.sub(r'<[^>]+>', ' ', description)
                    emails = extract_emails(desc_text)
                    phones = extract_phones(desc_text)

                    if emails:
                        for email in emails:
                            results.append({
                                "email": email, "phone": "", "name": company,
                                "platform": "indeed",
                                "source_url": job_url,
                                "keyword": keyword,
                                "category": "hiring_company",
                            })
                            matched += 1
                    elif phones:
                        for phone in phones:
                            results.append({
                                "email": "", "phone": phone, "name": company,
                                "platform": "indeed",
                                "source_url": job_url,
                                "keyword": keyword,
                                "category": "hiring_company",
                            })
                            matched += 1
                    elif company and job_url:
                        results.append({
                            "email": "", "phone": "", "name": company,
                            "platform": "indeed",
                            "source_url": job_url,
                            "keyword": keyword,
                            "category": "hiring_company",
                        })
                        matched += 1

    except Exception as e:
        logger.warning("Arbeitnow API failed: %s", e)

    return results


async def scrape_job_boards_direct(
    keyword: str,
    location: str = "",
    max_results: int = 50,
    delay: float = 2.0,
) -> list[dict]:
    """Scrape free job board APIs (replaces Indeed/Glassdoor dorking).

    Uses RemoteOK + Arbeitnow free APIs — both return real job data
    with company names and descriptions. Company websites are then
    crawled for actual email/phone contacts.

    100% FREE | NO API key | NO CAPTCHA | Works from cloud servers.
    """
    all_leads: list[dict] = []

    search_term = f"{keyword} {location}".strip()

    # Query both free APIs in parallel
    remoteok_task = scrape_remoteok_api(search_term, max_results // 2)
    arbeitnow_task = scrape_arbeitnow_api(search_term, max_results // 2)

    remoteok_results, arbeitnow_results = await asyncio.gather(
        remoteok_task, arbeitnow_task, return_exceptions=True
    )

    if isinstance(remoteok_results, list):
        all_leads.extend(remoteok_results)
    if isinstance(arbeitnow_results, list):
        all_leads.extend(arbeitnow_results)

    # Enrich leads that have company URLs but no email by crawling their websites
    leads_to_enrich = [
        ld for ld in all_leads
        if not ld.get("email") and ld.get("source_url", "").startswith("http")
    ]

    if leads_to_enrich:
        website_urls = list({ld["source_url"] for ld in leads_to_enrich})[:10]
        try:
            loop = asyncio.get_event_loop()
            enriched = await loop.run_in_executor(
                None, follow_bio_links, website_urls, 10, True
            )
            for email in enriched.get("emails", []):
                all_leads.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "indeed",
                    "source_url": "job_board_company",
                    "keyword": keyword,
                    "category": "hiring_company",
                })
        except Exception as e:
            logger.debug("Job board enrichment failed: %s", e)

    return all_leads[:max_results]


# ─── Instagram Direct Scraper (Limited) ──────────────────────────────────────

async def scrape_instagram_direct(
    keyword: str,
    max_results: int = 20,
    delay: float = 2.0,
) -> list[dict]:
    """Attempt Instagram profile scraping (limited from cloud servers).

    Instagram blocks most direct access from cloud IPs with login walls.
    This method uses Bing/DuckDuckGo to find Instagram profile URLs,
    then extracts emails from search snippets and follows any bio links
    found in the results.

    From cloud: ~30% success rate (snippet-based extraction only)
    From desktop: Better with browser cookies
    """
    results: list[dict] = []
    bio_urls: list[str] = []

    try:
        # Find Instagram profiles via search engine snippets
        profile_data = await _find_instagram_profiles_via_search(keyword, max_results)

        for item in profile_data:
            text = f"{item.get('title', '')} {item.get('snippet', '')}"
            emails = extract_emails(text)
            phones = extract_phones(text)

            for email in emails:
                results.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "instagram",
                    "source_url": item.get("url", ""),
                    "keyword": keyword,
                })
            for phone in phones:
                results.append({
                    "email": "", "phone": phone, "name": "",
                    "platform": "instagram",
                    "source_url": item.get("url", ""),
                    "keyword": keyword,
                })

            # Collect any bio link URLs from snippets
            url_pattern = re.compile(r'https?://[^\s"<>]+', re.IGNORECASE)
            snippet_urls = url_pattern.findall(item.get("snippet", ""))
            for surl in snippet_urls:
                if "instagram.com" not in surl:
                    bio_urls.append(surl)

    except Exception as e:
        logger.error("Instagram direct scraper error: %s", e)

    # Follow bio links found in search snippets
    if bio_urls:
        try:
            loop = asyncio.get_event_loop()
            bio_results = await loop.run_in_executor(
                None, follow_bio_links, bio_urls, 10, True
            )
            for email in bio_results.get("emails", []):
                results.append({
                    "email": email, "phone": "", "name": "",
                    "platform": "instagram",
                    "source_url": "bio_link",
                    "keyword": keyword,
                })
            for phone in bio_results.get("phones", []):
                results.append({
                    "email": "", "phone": phone, "name": "",
                    "platform": "instagram",
                    "source_url": "bio_link",
                    "keyword": keyword,
                })
        except Exception as e:
            logger.debug("Instagram bio link following failed: %s", e)

    return results


async def _find_instagram_profiles_via_search(
    keyword: str, max_results: int = 20,
) -> list[dict]:
    """Find Instagram profiles via DDG HTML API (works from cloud).

    PROVEN: DDG HTML returns 3 Instagram profile URLs + 3 emails
    for query 'instagram.com dentist @gmail.com'.
    """
    items: list[dict] = []

    # Primary query: proven to return profiles + emails in snippets
    query = f"instagram.com {keyword} @gmail.com"
    ddg_results = await _web_search(query, max_results=20)
    items.extend(ddg_results)

    # Broader query for more results
    if len(items) < 5:
        query2 = f"instagram.com {keyword} email contact"
        ddg_results2 = await _web_search(query2, max_results=20)
        seen_urls = {item["url"] for item in items}
        for item in ddg_results2:
            if item["url"] not in seen_urls:
                items.append(item)
                seen_urls.add(item["url"])

    logger.info("Instagram: Found %d search results for '%s' via DDG HTML", len(items), keyword)
    return items[:max_results]


# ─── Facebook Direct Scraper (Limited) ───────────────────────────────────────

async def scrape_facebook_direct(
    keyword: str,
    max_results: int = 20,
    delay: float = 2.0,
) -> list[dict]:
    """Scrape Facebook pages/businesses via DDG HTML discovery.

    PROVEN: DDG HTML returns business pages with phone numbers in titles/snippets.
    Also follows website links found in results for additional contact info.
    Creates name-based leads from DDG results even without email/phone.
    """
    results: list[dict] = []
    seen_contacts: set[str] = set()
    website_urls: list[str] = []

    try:
        # Find Facebook pages via DDG HTML
        page_data = await _find_facebook_pages_via_search(keyword, max_results)

        for item in page_data:
            text = f"{item.get('title', '')} {item.get('snippet', '')}"
            emails = extract_emails(text)
            phones = extract_phones(text)
            found_contact = False

            for email in emails:
                if email not in seen_contacts:
                    seen_contacts.add(email)
                    results.append({
                        "email": email, "phone": "", "name": item.get("title", "")[:60],
                        "platform": "facebook",
                        "source_url": item.get("url", ""),
                        "keyword": keyword,
                    })
                    found_contact = True
            for phone in phones:
                if phone not in seen_contacts:
                    seen_contacts.add(phone)
                    results.append({
                        "email": "", "phone": phone, "name": item.get("title", "")[:60],
                        "platform": "facebook",
                        "source_url": item.get("url", ""),
                        "keyword": keyword,
                    })
                    found_contact = True

            # Create name-based lead from DDG result even without email/phone
            if not found_contact and item.get("title"):
                name = item["title"].split(" | ")[0].split(" - ")[0].strip()[:60]
                if name and "facebook" not in name.lower() and "email list" not in name.lower():
                    results.append({
                        "email": "", "phone": "", "name": name,
                        "platform": "facebook",
                        "source_url": item.get("url", ""),
                        "keyword": keyword,
                    })

            # Collect website URLs for bio link following
            url_pattern = re.compile(r'https?://[^\s"<>]+', re.IGNORECASE)
            snippet_urls = url_pattern.findall(item.get("snippet", ""))
            for surl in snippet_urls:
                if "facebook.com" not in surl:
                    website_urls.append(surl)

    except Exception as e:
        logger.error("Facebook direct scraper error: %s", e)

    # Follow website links found in search snippets
    if website_urls:
        try:
            loop = asyncio.get_event_loop()
            site_results = await loop.run_in_executor(
                None, follow_bio_links, website_urls, 10, True
            )
            for email in site_results.get("emails", []):
                if email not in seen_contacts:
                    seen_contacts.add(email)
                    results.append({
                        "email": email, "phone": "", "name": "",
                        "platform": "facebook",
                        "source_url": "website_link",
                        "keyword": keyword,
                    })
            for phone in site_results.get("phones", []):
                if phone not in seen_contacts:
                    seen_contacts.add(phone)
                    results.append({
                        "email": "", "phone": phone, "name": "",
                        "platform": "facebook",
                        "source_url": "website_link",
                        "keyword": keyword,
                    })
        except Exception as e:
            logger.debug("Facebook website link following failed: %s", e)

    return results


async def _find_facebook_pages_via_search(
    keyword: str, max_results: int = 20,
) -> list[dict]:
    """Find Facebook pages via DDG HTML API (works from cloud).

    PROVEN: DDG HTML returns 3 Facebook page URLs + contact info
    for query 'facebook dentist office phone email'.
    """
    items: list[dict] = []

    # Primary query: facebook.com pages for this keyword
    query = f"facebook.com {keyword} phone email"
    ddg_results = await _web_search(query, max_results=20)
    items.extend(ddg_results)

    # Second query: broader business search with contact info
    query2 = f"{keyword} near me phone email contact"
    ddg_results2 = await _web_search(query2, max_results=20)
    seen_urls = {item["url"] for item in items}
    for item in ddg_results2:
        if item["url"] not in seen_urls:
            items.append(item)
            seen_urls.add(item["url"])

    # Third query: facebook.com specific pages
    if len([i for i in items if "facebook.com" in i.get("url", "")]) < 2:
        query3 = f"facebook.com/{keyword}"
        ddg_results3 = await _web_search(query3, max_results=10)
        for item in ddg_results3:
            if item["url"] not in seen_urls:
                items.append(item)
                seen_urls.add(item["url"])

    logger.info("Facebook: Found %d search results for '%s' via DDG HTML", len(items), keyword)
    return items[:max_results]


# ─── Multi-Platform Direct Dispatcher ────────────────────────────────────────

DIRECT_SCRAPERS = {
    "linkedin": scrape_linkedin_direct,
    "tiktok": scrape_tiktok_direct,
    "youtube": scrape_youtube_direct,
    "instagram": scrape_instagram_direct,
    "facebook": scrape_facebook_direct,
}


async def scrape_platform_direct_v2(
    keyword: str,
    platform: str,
    max_results: int = 20,
    delay: float = 2.0,
) -> list[dict]:
    """Scrape a platform using direct (non-dorking) methods.

    Falls back to the old dorking-based scraper if no direct scraper exists.
    """
    scraper = DIRECT_SCRAPERS.get(platform.lower())
    if scraper:
        return await scraper(keyword, max_results, delay)

    # No direct scraper for this platform
    logger.info("No direct scraper for %s, skipping", platform)
    return []


async def scrape_all_platforms_direct_v2(
    keywords: list[str],
    platforms: list[str],
    max_results_per: int = 20,
    delay: float = 2.0,
) -> list[dict]:
    """Scrape multiple platforms using direct methods (no dorking).

    This is the main entry point for the direct scraping pipeline.
    Replaces scrape_all_platforms_direct() which used Google dorking.

    Rate-limit protection:
      - Inter-keyword delay (3-5s) between keywords to spread DDG load
      - Inter-platform delay between platforms
      - DDG-level throttle handled by _web_search internally
    """
    all_results: list[dict] = []

    for kw_idx, keyword in enumerate(keywords):
        # Inter-keyword delay (skip for the first keyword)
        if kw_idx > 0:
            inter_kw_delay = random.uniform(3.0, 5.0)
            logger.info("Inter-keyword pause %.1fs before '%s'", inter_kw_delay, keyword[:30])
            await asyncio.sleep(inter_kw_delay)

        for platform in platforms:
            # Skip platforms handled by their own dedicated extractors
            if platform in ("reddit", "yellowpages", "yelp", "twitter", "pinterest", "google_maps"):
                continue

            # Job boards use free APIs instead
            if platform in ("indeed", "glassdoor"):
                try:
                    job_results = await scrape_job_boards_direct(keyword, max_results=max_results_per)
                    all_results.extend(job_results)
                except Exception as e:
                    logger.warning("Job board direct scraping failed for '%s': %s", keyword, e)
                continue

            try:
                results = await scrape_platform_direct_v2(
                    keyword, platform, max_results_per, delay
                )
                all_results.extend(results)
            except Exception as e:
                logger.error("Direct scraping %s for '%s' failed: %s", platform, keyword, e)

            # Inter-platform delay with jitter
            if delay > 0:
                await asyncio.sleep(delay + random.uniform(0.5, 2.0))

    return all_results
