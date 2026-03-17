"""Google dorking engine — extracts emails/phones from Google search results.

Supports multiple methods:
  1. **Serper.dev API** (PRIMARY, RELIABLE): Uses Serper.dev REST API. Free tier
     gives 2,500 searches/month. API key loaded from DB settings first,
     falls back to SERPER_API_KEY environment variable.
  2. **Bing Web Search API** (SECONDARY): Free tier 1K/month. Indexes MORE
     LinkedIn profiles than Google.
  3. **Brave Search API** (SECONDARY): Free tier 2K/month. Fresher content.
  4. **DuckDuckGo HTML** (FREE FALLBACK): No API key needed. Always available.
  5. **Patchright** (OPTIONAL, FREE): Scrapes Google search results directly
     using Patchright anti-detection browser. Zero API cost but requires
     Chromium installed.

Extraction flow:
  Serper API (primary) -> Bing/Brave/DDG (secondary) -> Patchright (fallback)

Enhanced with 10+ dork query templates per platform (vs original 1 per platform)
for 3-5x higher lead yield from the same search volume.
"""

import os
import random
import re
import asyncio
import logging
from typing import Optional

try:
    import httpx as _httpx
except ImportError:
    _httpx = None  # type: ignore[assignment]

try:
    from bs4 import BeautifulSoup as _BS
except ImportError:
    _BS = None  # type: ignore[assignment]

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

# Environment variable fallback (used if DB setting not available)
SERPER_API_KEY = os.environ.get("SERPER_API_KEY", "")

# Legacy single-template dict (kept for backward compatibility)
PLATFORM_DORK_TEMPLATES: dict[str, str] = {
    "linkedin": 'site:linkedin.com "{keyword}" "@gmail.com" OR "@yahoo.com" OR "@outlook.com"',
    "facebook": 'site:facebook.com "{keyword}" email OR contact OR "@"',
    "instagram": 'site:instagram.com "{keyword}" email OR "@gmail.com"',
    "twitter": 'site:twitter.com OR site:x.com "{keyword}" email OR contact',
    "youtube": 'site:youtube.com "{keyword}" email OR business OR contact',
    "pinterest": 'site:pinterest.com "{keyword}" email OR contact',
    "tumblr": 'site:tumblr.com "{keyword}" email OR "@gmail.com"',
    "tiktok": 'site:tiktok.com "{keyword}" email OR contact',
}

# ─── Enhanced multi-template dork queries (10+ per platform) ────────────────
# Based on research: using multiple query variations per platform yields
# 3-5x more leads because different queries surface different indexed pages.

PLATFORM_DORK_MULTI_TEMPLATES: dict[str, list[str]] = {
    "linkedin": [
        'site:linkedin.com/in "{keyword}" "@gmail.com" OR "@yahoo.com" OR "@outlook.com"',
        'site:linkedin.com/in "{keyword}" "email me at" OR "contact me"',
        'site:linkedin.com/in "{keyword}" "founder" OR "CEO" "email"',
        'site:linkedin.com/in "{keyword}" "freelance" OR "available for hire" "portfolio"',
        'site:linkedin.com/in "{keyword}" "consultant" "book a call" OR "website"',
        'site:linkedin.com/in "{keyword}" "agency" OR "services" "contact"',
        'site:linkedin.com/in "{keyword}" "coach" OR "speaker" "bookings"',
        'site:linkedin.com/company "{keyword}" "contact" OR "email" OR "hiring"',
        'site:linkedin.com/pulse "{keyword}" "author" OR "email" OR "reach out"',
        'site:linkedin.com/in "{keyword}" "open to work" OR "looking for opportunities"',
    ],
    "facebook": [
        'site:facebook.com "{keyword}" email OR contact OR "@"',
        'site:facebook.com "{keyword}" "business page" "contact us" "email"',
        'site:facebook.com/groups "{keyword}" "marketing" OR "business" "join"',
        'site:facebook.com/events "{keyword}" "conference" OR "workshop"',
        'site:facebook.com "{keyword}" "reviews" "business"',
        'site:facebook.com "{keyword}" "about" "founded" "contact"',
        'site:facebook.com "{keyword}" "marketplace" OR "seller" "contact"',
        'site:facebook.com "{keyword}" "community" "business owners"',
    ],
    "instagram": [
        'site:instagram.com "{keyword}" email OR "@gmail.com" OR "@yahoo.com"',
        'site:instagram.com "{keyword}" "link in bio" "founder" OR "CEO"',
        'site:instagram.com "{keyword}" "bookings" OR "inquiries" "email"',
        'site:instagram.com "{keyword}" "work with me" "contact"',
        'site:instagram.com "{keyword}" "for collabs" "DM" OR "email"',
        'site:instagram.com "{keyword}" "services" OR "pricing" "book"',
        'site:instagram.com "{keyword}" "coach" OR "consultant" "link"',
        'site:instagram.com "{keyword}" "agency" "portfolio" "email"',
    ],
    "twitter": [
        'site:twitter.com OR site:x.com "{keyword}" email OR contact',
        'site:twitter.com "{keyword}" "founder" "launched" "website"',
        'site:twitter.com "{keyword}" "freelance" OR "hire me" "DM" OR "email"',
        'site:twitter.com "{keyword}" "agency" "services" "contact"',
        'site:twitter.com "{keyword}" "building in public" "website" OR "link"',
        'site:twitter.com "{keyword}" "newsletter" "subscribe" "email"',
        'site:twitter.com "{keyword}" "SaaS" OR "startup" "launched" "link"',
        'site:twitter.com "{keyword}" "open for freelance" "portfolio"',
        'site:twitter.com "{keyword}" "we\'re hiring" "apply" "link"',
        'site:twitter.com "{keyword}" "podcast" OR "speaker" "book" "email"',
    ],
    "youtube": [
        'site:youtube.com "{keyword}" email OR business OR contact',
        'site:youtube.com "{keyword}" "business inquiries" "@gmail.com"',
        'site:youtube.com "{keyword}" "collaboration" "email" "business"',
        'site:youtube.com "{keyword}" "sponsorship" "contact"',
        'site:youtube.com "{keyword}" "tutorial" "services" OR "hire" "contact"',
        'site:youtube.com "{keyword}" "course" OR "coaching" "website" "email"',
        'site:youtube.com "{keyword}" "about" "partnerships" "email"',
        'site:youtube.com "{keyword}" "agency" "services" "contact"',
    ],
    "tiktok": [
        'site:tiktok.com "{keyword}" email OR contact',
        'site:tiktok.com "{keyword}" "founder" OR "CEO" "email" OR "contact"',
        'site:tiktok.com "{keyword}" "link in bio" "business"',
        'site:tiktok.com "{keyword}" "small business" "shop" OR "order"',
        'site:tiktok.com "{keyword}" "coach" OR "consultant" "book a call"',
        'site:tiktok.com "{keyword}" "freelance" OR "hire me" "portfolio"',
        'site:tiktok.com "{keyword}" "agency" "services" "contact"',
    ],
    "pinterest": [
        'site:pinterest.com "{keyword}" email OR contact',
        'site:pinterest.com "{keyword}" "website" OR "blog" "contact"',
        'site:pinterest.com "{keyword}" "business" "services"',
        'site:pinterest.com "{keyword}" "portfolio" OR "shop"',
    ],
    "tumblr": [
        'site:tumblr.com "{keyword}" email OR "@gmail.com" OR contact',
        'site:tumblr.com "{keyword}" "portfolio" "email" OR "hire"',
        'site:tumblr.com "{keyword}" "commissions" OR "services" "contact"',
        'site:tumblr.com "{keyword}" "about me" "contact"',
    ],
    # Non-site-specific queries that find company websites, directories, etc.
    # These produce higher yield because they search the entire web.
    "google_maps": [
        '"{keyword}" "contact us" email phone',
        '"{keyword}" "get in touch" email',
        '"{keyword}" directory listing email phone address',
    ],
    "whatsapp": [
        '"{keyword}" whatsapp contact email',
        '"{keyword}" whatsapp business email phone',
    ],
    "telegram": [
        '"{keyword}" telegram contact email',
        '"{keyword}" t.me email contact',
    ],
    "email": [
        '"{keyword}" "@gmail.com" OR "@yahoo.com" OR "@outlook.com" OR "@hotmail.com"',
        '"{keyword}" "contact us" "email" -site:linkedin.com -site:facebook.com',
        '"{keyword}" "reach out" OR "get in touch" email',
        '"{keyword}" company directory email phone',
    ],
}


def _build_dork_query(keyword: str, platform: str) -> str:
    """Build a Google dork query for a given keyword and platform.

    Uses the first (primary) template from the multi-template list.
    """
    templates = PLATFORM_DORK_MULTI_TEMPLATES.get(platform)
    if templates:
        return templates[0].replace("{keyword}", keyword)
    template = PLATFORM_DORK_TEMPLATES.get(platform, '"{keyword}" email OR contact')
    return template.replace("{keyword}", keyword)


def _build_all_dork_queries(keyword: str, platform: str, max_queries: int = 5) -> list[str]:
    """Build multiple dork queries for a keyword+platform for higher yield.

    Returns up to max_queries variations to find more indexed pages.
    """
    templates = PLATFORM_DORK_MULTI_TEMPLATES.get(platform, [])
    if not templates:
        template = PLATFORM_DORK_TEMPLATES.get(platform, '"{keyword}" email OR contact')
        return [template.replace("{keyword}", keyword)]
    return [t.replace("{keyword}", keyword) for t in templates[:max_queries]]


# ─── v3.5.34 P2: DDG-compatible location-aware dork queries ──────────────────
# v3.5.32 had 7 intent categories with complex operators (filetype:, inurl:,
# nested OR chains) that DDG/Brave/Mojeek don't support well → 0 results.
# v3.5.34 P2 fix: Simplified, shorter queries that work across all engines.
# Key changes:
#   - Removed advanced operators (filetype:, inurl:) for non-Google engines
#   - Shorter query strings (DDG truncates after ~80 chars)
#   - Fewer OR chains (DDG handles max 2-3 ORs reliably)
#   - Kept site: operator (works on DDG) for directory targeting

def build_location_aware_queries(
    keyword: str,
    location: str,
    max_queries: int = 20,
) -> list[str]:
    """v3.5.34 P2: Generate DDG-compatible dork queries.

    Simplified from v3.5.32's 7-intent system that was too complex for DDG.
    Now uses shorter, engine-agnostic queries that actually return results.

    Args:
        keyword: e.g. "Dentists"
        location: e.g. "Delhi" (can be empty)
        max_queries: max queries to return (prioritized)

    Returns:
        List of dork query strings, highest priority first.
    """
    kw = keyword.strip()
    loc = location.strip()
    kw_loc = f"{kw} {loc}" if loc else kw

    templates: list[str] = [
        # ── TIER 1: Simple contact queries (DDG-friendly, highest yield) ──
        f'{kw_loc} email phone contact',
        f'{kw_loc} email address',
        f'{kw_loc} contact number',
        f'{kw_loc} "@gmail.com"',
        f'{kw_loc} "contact us" email',

        # ── TIER 2: Directory site: queries (site: works on DDG) ──
        f'site:justdial.com {kw_loc}',
        f'site:sulekha.com {kw_loc}',
        f'site:indiamart.com {kw_loc}',
        f'site:yellowpages.com {kw_loc}',
        f'site:yelp.com {kw_loc}',
        f'site:hotfrog.com {kw_loc}',

        # ── TIER 3: Social profile queries ──
        f'site:linkedin.com/in {kw_loc}',
        f'site:linkedin.com/company {kw_loc}',
        f'site:facebook.com {kw_loc}',

        # ── TIER 4: Open web contact pages ──
        f'{kw_loc} "phone" "email" directory',
        f'{kw_loc} business listing contact',
        f'{kw_loc} company directory email',
    ]

    # Shuffle within priority tiers for fingerprint diversity
    high = templates[:5]    # simple contact queries
    med = templates[5:11]   # directory sites
    low = templates[11:]    # social + open web
    random.shuffle(high)
    random.shuffle(med)
    random.shuffle(low)

    return (high + med + low)[:max_queries]


# ─── v3.5.34 P2: Engine health check ────────────────────────────────────────

async def check_engine_health() -> dict[str, bool]:
    """v3.5.34 P2: Quick health check of search engines at session start.

    Tests each engine with a simple query to see which ones are reachable.
    Returns a dict of engine_name -> is_healthy.
    """
    health: dict[str, bool] = {}
    test_query = "test contact email"

    # Test Serper API
    api_key = SERPER_API_KEY
    if api_key:
        try:
            results = _search_serper_with_key(test_query, 1, api_key)
            health["serper"] = len(results) > 0
        except Exception:
            health["serper"] = False
    else:
        health["serper"] = False

    # Test DDG Lite via HTTP (quick check)
    if _httpx is not None:
        try:
            from urllib.parse import quote_plus
            resp = _httpx.get(
                f"https://lite.duckduckgo.com/lite/?q={quote_plus(test_query)}",
                timeout=8.0,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0"},
            )
            health["ddg_lite"] = resp.status_code == 200 and len(resp.text) > 500
        except Exception:
            health["ddg_lite"] = False
    else:
        health["ddg_lite"] = False

    # Test Google HTTP
    if _httpx is not None:
        try:
            resp = _httpx.get(
                f"https://www.google.com/search?q=test",
                timeout=8.0,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0"},
                follow_redirects=True,
            )
            health["google_http"] = resp.status_code == 200 and "captcha" not in resp.text.lower()
        except Exception:
            health["google_http"] = False
    else:
        health["google_http"] = False

    logger.info("Engine health check: %s", health)
    return health


# ─── Method 1: Patchright (FREE) ─────────────────────────────────────────────

def _extract_real_url(href: str) -> str:
    """v3.5.30 Fix 2: Unwrap DDG redirect URLs.

    DDG wraps all href values in //duckduckgo.com/l/?uddg=<encoded_url>.
    This function extracts the real destination URL.
    """
    if not href:
        return href
    if "uddg=" in href:
        try:
            from urllib.parse import parse_qs, unquote, urlparse as _urlparse
            parsed = _urlparse(href)
            params = parse_qs(parsed.query)
            real = params.get("uddg", [None])[0]
            if real:
                return unquote(real)
        except Exception:
            pass
    # Also handle //duckduckgo.com/l/... without uddg
    if href.startswith("//"):
        href = "https:" + href
    if "duckduckgo.com" in href and "/l/" in href:
        return ""  # can't unwrap, skip
    return href


async def _search_ddg_patchright(
    query: str,
    num_results: int = 10,
    headless: bool = True,
    proxy: Optional[dict] = None,
) -> list[dict]:
    """v3.5.30 Fix 2: Search DuckDuckGo using Patchright with cookie priming.

    Root cause of 0 results in v3.5.29 — 3 compounding bugs:
      1. Missing cookies: DDG requires dc= and s= cookies from visiting
         duckduckgo.com before the HTML endpoint works.
      2. Wrong wait condition: domcontentloaded fires before results render.
      3. DDG URL redirect not unwrapped: href values are wrapped in uddg=.

    Fix: Navigate to duckduckgo.com first (primes cookies), type query in
    search box, press Enter, wait for .results--main or #links selector.
    Falls back to DDG Lite if main endpoint yields 0.
    """
    try:
        from app.services.patchright_engine import new_page, safe_goto, random_delay
    except ImportError:
        logger.info("Patchright not available, skipping browser-based dorking")
        return []

    page = None
    try:
        page = await new_page(headless=headless, proxy=proxy)
        if page is None:
            logger.info("Patchright page creation returned None — skipping")
            return []

        # Step 1: Navigate to duckduckgo.com to prime cookies (dc=, s=)
        success = await safe_goto(page, "https://duckduckgo.com/")
        if not success:
            return []
        await random_delay(1.0, 2.0)

        # Step 2: Type query in search box and press Enter (human-like)
        search_input = await page.query_selector(
            'input[name="q"], input#searchbox_input, input[type="text"]'
        )
        if search_input:
            await search_input.fill(query)
            await random_delay(0.3, 0.8)
            await page.keyboard.press("Enter")
        else:
            # Fallback: direct navigation with cookies already set
            from urllib.parse import quote_plus
            url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
            await safe_goto(page, url)

        # Step 3: Wait for results to render (not just DOM loaded)
        try:
            await page.wait_for_selector(
                ".results--main, #links, .web-result, article[data-testid='result']",
                timeout=12000,
            )
        except Exception:
            logger.debug("DDG wait_for_selector timed out — extracting anyway")
        await random_delay(1.5, 3.0)

        # Step 4: Extract results with URL unwrapping
        results = await page.evaluate("""() => {
            const items = [];
            // Try multiple selector strategies (SPA vs HTML endpoint)
            const containers = document.querySelectorAll(
                'article[data-testid="result"], .web-result, .result, a[rel="nofollow"]'
            );
            const seen = new Set();
            containers.forEach(el => {
                let linkEl, titleEl, snippetEl;
                // SPA results
                linkEl = el.querySelector('a[data-testid="result-title-a"], a.result__a, a[href]');
                titleEl = el.querySelector('h2, h3, a[data-testid="result-title-a"], a.result__a');
                snippetEl = el.querySelector(
                    'span[data-testid="result-snippet"], .result__snippet, .result-snippet'
                );
                // If the element itself is an <a> (HTML endpoint)
                if (!linkEl && el.tagName === 'A') {
                    linkEl = el;
                    titleEl = el;
                    const row = el.closest('tr') || el.parentElement;
                    if (row) snippetEl = row.querySelector('.result-snippet, td.result-snippet');
                }
                if (!linkEl) return;
                let href = linkEl.href || '';
                // Unwrap DDG redirect URLs
                if (href.includes('uddg=')) {
                    try {
                        const u = new URL(href);
                        href = decodeURIComponent(u.searchParams.get('uddg') || href);
                    } catch(e) {}
                }
                if (!href.startsWith('http') || href.includes('duckduckgo.com')) return;
                if (seen.has(href)) return;
                seen.add(href);
                const title = (titleEl ? titleEl.textContent : '').trim();
                const snippet = (snippetEl ? snippetEl.textContent : '').trim();
                if (title.length > 3) {
                    items.push({ title, snippet, link: href });
                }
            });
            return items;
        }""")

        logger.info("Patchright DDG dorking: %d results for query", len(results or []))

        # Step 5: If main endpoint yielded 0, try DDG Lite fallback
        if not results:
            results = await _search_ddg_lite_patchright(page, query)

        return (results or [])[:num_results]

    except Exception as e:
        logger.error("Patchright DDG search error: %s", e)
        return []
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass


async def _search_ddg_lite_patchright(page, query: str) -> list[dict]:
    """v3.5.30 Fix 2: DDG Lite fallback — table-based layout, fewer bot checks.

    lite.duckduckgo.com uses a simple HTML table layout that is more
    reliable for extraction and has minimal bot protection.
    """
    try:
        from app.services.patchright_engine import safe_goto, random_delay
        from urllib.parse import quote_plus

        url = f"https://lite.duckduckgo.com/lite/?q={quote_plus(query)}"
        success = await safe_goto(page, url)
        if not success:
            return []
        await random_delay(1.5, 2.5)

        results = await page.evaluate("""() => {
            const items = [];
            const seen = new Set();
            // DDG Lite uses table rows with class="result-link"
            const links = document.querySelectorAll('a.result-link, td a[href]');
            links.forEach(el => {
                let href = el.href || '';
                if (href.includes('uddg=')) {
                    try {
                        const u = new URL(href);
                        href = decodeURIComponent(u.searchParams.get('uddg') || href);
                    } catch(e) {}
                }
                if (!href.startsWith('http') || href.includes('duckduckgo.com')) return;
                if (seen.has(href)) return;
                seen.add(href);
                const title = el.textContent.trim();
                // Get snippet from next row
                const row = el.closest('tr');
                let snippet = '';
                if (row && row.nextElementSibling) {
                    const snippetTd = row.nextElementSibling.querySelector('td.result-snippet');
                    if (snippetTd) snippet = snippetTd.textContent.trim();
                }
                if (title.length > 3) {
                    items.push({ title, snippet, link: href });
                }
            });
            return items;
        }""")

        logger.info("Patchright DDG Lite fallback: %d results", len(results or []))
        return results or []
    except Exception as e:
        logger.debug("DDG Lite fallback error: %s", e)
        return []


# Legacy alias for backward compatibility
_search_google_patchright = _search_ddg_patchright


# ─── Method 1b: HTTP fallback for Google dorking (no browser needed) ─────────

def _search_google_http(query: str, num_results: int = 10) -> list[dict]:
    """Scrape Google search results using plain HTTP + BeautifulSoup.

    This is the non-Patchright fallback for Google dorking.  It sends a
    standard HTTP GET to Google with a realistic User-Agent and parses the
    returned HTML with BeautifulSoup.  No browser, no API key required.

    Returns a list of dicts with keys: title, snippet, link.
    Returns an empty list on any error (graceful degradation).
    """
    if _httpx is None or _BS is None:
        logger.info("httpx or beautifulsoup4 not available — skipping HTTP Google dorking")
        return []

    try:
        from urllib.parse import quote_plus

        url = f"https://www.google.com/search?q={quote_plus(query)}&num={num_results}"
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate",
        }

        response = _httpx.get(url, headers=headers, timeout=15.0, follow_redirects=True, verify=False)  # v3.5.40 Fix 8 (RC12): tolerate expired/self-signed certs on dorking targets
        if response.status_code != 200:
            logger.warning("HTTP Google dorking got status %d", response.status_code)
            return []

        soup = _BS(response.text, "html.parser")
        results: list[dict] = []

        # Google wraps each organic result in a <div class="g"> or similar
        for g_div in soup.select("div.g, div.MjjYud"):
            link_tag = g_div.find("a", href=True)
            title_tag = g_div.find("h3")
            if not link_tag or not title_tag:
                continue

            href = link_tag.get("href", "")
            if not href.startswith("http") or "google.com/search" in href:
                continue

            # Extract snippet from common Google snippet containers
            snippet = ""
            for sel in ["div.VwiC3b", "span.st", "div[data-sncf]"]:
                snippet_el = g_div.select_one(sel)
                if snippet_el:
                    snippet = snippet_el.get_text(separator=" ", strip=True)
                    break

            results.append({
                "title": title_tag.get_text(strip=True),
                "snippet": snippet,
                "link": href,
            })

        logger.info("HTTP Google dorking: %d results for query", len(results))
        return results

    except Exception as e:
        logger.warning("HTTP Google dorking error: %s", e)
        return []


# ─── Method 2: Serper.dev API (FALLBACK) ─────────────────────────────────────

def _search_serper(query: str, num_results: int = 10) -> list[dict]:
    """Search using Serper.dev API (legacy, uses module-level key)."""
    if not SERPER_API_KEY:
        return []
    return _search_serper_with_key(query, num_results, SERPER_API_KEY)


def _search_serper_with_key(query: str, num_results: int, api_key: str) -> list[dict]:
    """Search using Serper.dev API with explicit key."""
    if not api_key:
        return []
    try:
        if _httpx is None:
            logger.warning("httpx not available for Serper API call")
            return []
        response = _httpx.post(
            "https://google.serper.dev/search",
            json={"q": query, "num": num_results},
            headers={
                "X-API-KEY": api_key,
                "Content-Type": "application/json",
            },
            timeout=15.0,
        )
        if response.status_code == 200:
            data = response.json()
            results = []
            for item in data.get("organic", []):
                results.append({
                    "title": item.get("title", ""),
                    "snippet": item.get("snippet", ""),
                    "link": item.get("link", ""),
                })
            return results
    except Exception as exc:
        logger.warning("Serper API error: %s", exc)
    return []


async def _check_google_captcha(page) -> bool:
    """Check if Google is showing a CAPTCHA page."""
    try:
        html = await page.content()
        html_lower = html.lower()
        captcha_indicators = [
            "g-recaptcha",
            "recaptcha",
            "captcha-form",
            "unusual traffic",
            "not a robot",
            "verify you are human",
        ]
        return any(indicator in html_lower for indicator in captcha_indicators)
    except Exception:
        return False


# ─── Combined Dorking Search ─────────────────────────────────────────────────

async def dorking_search(
    keyword: str,
    platform: str,
    pages: int = 3,
    serper_api_key: Optional[str] = None,
    use_patchright: bool = True,
    headless: bool = True,
    proxy: Optional[dict] = None,
    bing_api_key: Optional[str] = None,
    brave_api_key: Optional[str] = None,
    use_duckduckgo: bool = True,
    multi_query: bool = True,
    max_queries: int = 3,
    location: str = "",
) -> dict:
    """Perform multi-engine dorking search for a keyword on a platform.

    Enhanced strategy (waterfall):
      1. Try Serper API first (reliable, fast, no browser needed)
      2. Try Bing/Brave/DuckDuckGo for additional coverage
      3. If all APIs fail -> try Patchright (if installed)
      4. Use multiple query templates for higher yield
      5. v3.5.32: Use location-aware queries across 7 intents

    Returns:
        Dict with emails, phones, sources, queries, platform, keyword, method.
    """
    all_emails: list[str] = []
    all_phones: list[str] = []
    all_sources: list[str] = []
    methods_used: list[str] = []
    queries_used: list[str] = []

    # v3.5.32: Use location-aware queries when location is available
    # These target directories, review sites, PDFs, and the open web
    # instead of only site:facebook.com (which gets blocked).
    if location and multi_query:
        location_queries = build_location_aware_queries(
            keyword, location, max_queries=min(max_queries + 2, 8)
        )
        # Merge with platform-specific queries for best coverage
        platform_queries = _build_all_dork_queries(keyword, platform, max_queries)
        # Interleave: location-aware first (higher yield), then platform-specific
        seen: set[str] = set()
        queries: list[str] = []
        for q in location_queries + platform_queries:
            if q not in seen:
                seen.add(q)
                queries.append(q)
        queries = queries[:max_queries + 4]  # Allow extra budget for location queries
    elif multi_query:
        queries = _build_all_dork_queries(keyword, platform, max_queries)
    else:
        queries = [_build_dork_query(keyword, platform)]

    num_results = pages * 10

    for query in queries:
        queries_used.append(query)

        # Method 1: Serper API (PRIMARY — reliable, no browser dependency)
        api_key = serper_api_key or SERPER_API_KEY
        if api_key:
            loop = asyncio.get_running_loop()
            results = await loop.run_in_executor(
                None, _search_serper_with_key, query, num_results, api_key
            )
            if results:
                if "serper" not in methods_used:
                    methods_used.append("serper")
                for result in results:
                    text = f"{result.get('title', '')} {result.get('snippet', '')}"
                    all_emails.extend(extract_emails(text))
                    all_phones.extend(extract_phones(text))
                    link = result.get("link", "")
                    if link:
                        all_sources.append(link)

        # Method 2: Free multi-engine waterfall (Brave/Startpage/DDG Lite/
        # Mojeek/Qwant/SearXNG) + API engines if keys provided + page scraping.
        try:
            import functools
            from app.services.multi_engine_search import multi_engine_search
            loop = asyncio.get_running_loop()
            _bound = functools.partial(
                multi_engine_search,
                query, num_results,
                bing_api_key=bing_api_key,
                brave_api_key=brave_api_key,
                use_duckduckgo=use_duckduckgo,
                scrape_pages=True,
            )
            alt_results = await loop.run_in_executor(None, _bound)
            all_emails.extend(alt_results.get("emails", []))
            all_phones.extend(alt_results.get("phones", []))
            all_sources.extend(alt_results.get("sources", []))
            for eng in alt_results.get("engines_used", []):
                if eng not in methods_used:
                    methods_used.append(eng)
        except ImportError:
            logger.debug("multi_engine_search module not available")
        except Exception as exc:
            logger.warning("Multi-engine search error: %s", exc)

    # v3.5.36 Fix 1: Skip Patchright entirely — it triggers Google CAPTCHA
    # (2,394 blocks in test logs). The multi-engine waterfall above (Brave,
    # Startpage, DDG Lite, Mojeek, Qwant, SearXNG) is 100% ban-free and
    # API-key-free. Patchright browser automation is unnecessary and harmful.
    # Only use HTTP-based DDG Lite as a last resort (no browser needed).
    if not all_emails and not all_phones:
        primary_query = queries[0] if queries else _build_dork_query(keyword, platform)
        logger.info("v3.5.36: Skipping Patchright (CAPTCHA-blocked) — trying DDG Lite HTTP")
        loop = asyncio.get_running_loop()
        try:
            from app.services.multi_engine_search import search_ddg_lite
            ddg_results = await loop.run_in_executor(
                None, search_ddg_lite, primary_query, num_results
            )
            if ddg_results:
                if "ddg_lite_fallback" not in methods_used:
                    methods_used.append("ddg_lite_fallback")
                for result in ddg_results:
                    text = f"{result.get('title', '')} {result.get('snippet', '')}"
                    all_emails.extend(extract_emails(text))
                    all_phones.extend(extract_phones(text))
                    link = result.get("link", "")
                    if link:
                        all_sources.append(link)
        except Exception as exc:
            logger.debug("DDG Lite fallback failed: %s", exc)

    # Deduplicate
    seen_emails: set[str] = set()
    unique_emails = []
    for email in all_emails:
        lower = email.lower()
        if lower not in seen_emails:
            seen_emails.add(lower)
            unique_emails.append(email)

    seen_phones: set[str] = set()
    unique_phones = []
    for phone in all_phones:
        cleaned = re.sub(r'[^\d+]', '', phone)
        if cleaned not in seen_phones:
            seen_phones.add(cleaned)
            unique_phones.append(phone)

    method_str = "+".join(methods_used) if methods_used else "none"

    return {
        "emails": unique_emails,
        "phones": unique_phones,
        "sources": list(set(all_sources)),
        "query": queries_used[0] if queries_used else "",
        "queries_used": queries_used,
        "platform": platform,
        "keyword": keyword,
        "method": method_str,
    }


async def dorking_search_multi(
    keywords: list[str],
    platforms: list[str],
    pages: int = 3,
    delay: float = 2.0,
    serper_api_key: Optional[str] = None,
    use_patchright: bool = True,
    headless: bool = True,
    proxy: Optional[dict] = None,
    max_total_queries: int = 30,
    location: str = "",
) -> list[dict]:
    """Search multiple keywords across multiple platforms.

    v3.5.1: Added query budgeting (max_total_queries) and anti-bot delays.
    v3.5.12: Raised default from 8 to 30 — covers all 20 platforms with
    multiple keywords while still staying within safe rate limits.
    v3.5.32: Added location parameter for location-aware dork queries.
    """
    all_results = []
    total_queries = 0

    for keyword in keywords:
        for platform in platforms:
            if platform == "reddit":
                continue  # Reddit uses RSS/PullPush instead
            if total_queries >= max_total_queries:
                logger.info(
                    "Query budget exhausted (%d/%d), stopping dorking",
                    total_queries, max_total_queries,
                )
                return all_results

            result = await dorking_search(
                keyword, platform, pages,
                serper_api_key=serper_api_key,
                use_patchright=use_patchright,
                headless=headless,
                proxy=proxy,
                max_queries=min(3, max_total_queries - total_queries),
                location=location,
            )
            all_results.append(result)
            total_queries += len(result.get("queries_used", [1]))

            # v3.5.36: Reduced delay (2-4s) — multi-engine waterfall uses
            # curl_cffi anti-detection, not browser automation.
            anti_bot_delay = max(delay, 2.0)
            await asyncio.sleep(anti_bot_delay)
    return all_results
