"""Google Maps scraper — extracts business listings from Google Maps.

Supports two browser engines with automatic fallback:
  1. **Selenium + ChromeDriver** (PRIMARY): Reliable, well-tested, works in .exe builds.
     Uses headless Chrome with ChromeDriver bundled or from system PATH.
  2. **Patchright** (OPTIONAL FALLBACK): Anti-detection browser, used only if
     Selenium is unavailable AND Patchright is installed.

No API key or user account needed — scrapes Google Maps directly.
"""

import asyncio
import re
import logging
import time
import json
from typing import Optional
from urllib.parse import quote_plus

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

# Selectors for Google Maps
SELECTORS = {
    "search_input": 'input#searchboxinput',
    "result_item": 'div.Nv2PK',
    "name": 'h1.DUwDvf',
    "rating": 'span.MW4etd',
    "review_count": 'span.UY7F9',
    "category": 'button.DkEaL',
    "address": 'button[data-item-id="address"]',
    "phone": 'button[data-item-id^="phone"]',
    "website": 'a[data-item-id="authority"]',
}


def _clean_phone(raw: str) -> str:
    """Clean phone number from Google Maps format."""
    cleaned = re.sub(r'[^\d+\-\(\)\s]', '', raw).strip()
    return cleaned if len(re.sub(r'[^\d]', '', cleaned)) >= 7 else ''


def _get_chromedriver_path() -> str:
    """Get ChromeDriver path — webdriver-manager first (auto-downloads correct version),
    then bundled, then system PATH.

    webdriver-manager is prioritized because it downloads the ChromeDriver version
    matching the user's installed Chrome, avoiding version mismatch errors.
    """
    import os
    import sys
    import shutil

    # Method 1: webdriver-manager (auto-downloads correct ChromeDriver for user's Chrome)
    # This is the BEST method because it matches the user's actual Chrome version
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        driver_path = ChromeDriverManager().install()
        logger.info("webdriver-manager installed/found ChromeDriver at: %s", driver_path)
        return driver_path
    except Exception as e:
        logger.warning("webdriver-manager failed: %s", e)

    # Method 2: Check system PATH
    system_driver = shutil.which("chromedriver")
    if system_driver:
        logger.info("Found ChromeDriver in system PATH: %s", system_driver)
        return system_driver

    # Method 3: Check bundled locations (PyInstaller builds) — last resort
    # Note: bundled ChromeDriver may not match user's Chrome version
    base_dirs = [
        os.path.dirname(__file__),
        os.path.join(os.path.dirname(__file__), "..", ".."),
        os.path.join(os.path.dirname(__file__), "..", "..", ".."),
    ]
    if hasattr(sys, '_MEIPASS'):
        base_dirs.insert(0, sys._MEIPASS)
        base_dirs.insert(1, os.path.join(sys._MEIPASS, 'chromedriver'))
    if getattr(sys, 'frozen', False):
        base_dirs.insert(0, os.path.dirname(sys.executable))

    for base in base_dirs:
        for name in ['chromedriver', 'chromedriver.exe']:
            path = os.path.join(base, name)
            if os.path.exists(path):
                logger.info("Found bundled ChromeDriver at: %s", path)
                return os.path.abspath(path)

    return ""


def _find_chrome_binary() -> str:
    """Find Google Chrome or Chromium binary path on any OS."""
    import os
    import sys
    import shutil

    # Common Chrome/Chromium binary names
    binary_names = [
        'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser',
        'chrome', 'chrome.exe',
    ]

    # Check system PATH first
    for name in binary_names:
        found = shutil.which(name)
        if found:
            return found

    # Check common installation paths (Windows, macOS, Linux)
    common_paths = [
        # Windows
        os.path.expandvars(r'%PROGRAMFILES%\Google\Chrome\Application\chrome.exe'),
        os.path.expandvars(r'%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe'),
        os.path.expandvars(r'%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe'),
        # macOS
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        # Linux
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
    ]

    # PyInstaller bundled location
    if hasattr(sys, '_MEIPASS'):
        common_paths.insert(0, os.path.join(sys._MEIPASS, 'chrome', 'chrome.exe'))
        common_paths.insert(1, os.path.join(sys._MEIPASS, 'chrome', 'chrome'))
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(sys.executable)
        common_paths.insert(0, os.path.join(exe_dir, 'chrome', 'chrome.exe'))
        common_paths.insert(1, os.path.join(exe_dir, 'chrome', 'chrome'))

    for path in common_paths:
        if os.path.exists(path):
            return path

    return ""


# ─── Method 1: Selenium + ChromeDriver (PRIMARY) ────────────────────────────

async def _scrape_gmaps_selenium(
    query: str,
    max_results: int = 50,
    delay: float = 3.0,
) -> list[dict]:
    """Scrape Google Maps using Selenium + ChromeDriver (headless).

    This is the PRIMARY method — reliable, works in .exe builds.
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
    except ImportError:
        logger.warning("Selenium not installed — cannot use Selenium Google Maps scraper")
        raise RuntimeError("Selenium is not installed. Please reinstall the application or run: pip install selenium webdriver-manager")

    results: list[dict] = []
    driver = None

    try:
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

        # Try to find Chrome binary
        chrome_binary = _find_chrome_binary()
        if chrome_binary:
            options.binary_location = chrome_binary
            logger.info("Using Chrome binary at: %s", chrome_binary)
        else:
            logger.warning("Chrome/Chromium binary not found on this system")

        # Strategy: Try webdriver-manager first (downloads correct ChromeDriver),
        # then Selenium auto-detect, then bundled ChromeDriver as last resort.
        driver = None
        last_error = None

        # Attempt 1: webdriver-manager (auto-downloads matching ChromeDriver)
        try:
            chromedriver_path = _get_chromedriver_path()
            if chromedriver_path:
                logger.info("Using ChromeDriver at: %s", chromedriver_path)
                service = Service(executable_path=chromedriver_path)
                driver = webdriver.Chrome(service=service, options=options)
                logger.info("Selenium: ChromeDriver started successfully")
        except Exception as e:
            last_error = e
            logger.warning("ChromeDriver from webdriver-manager failed: %s", e)
            driver = None

        # Attempt 2: Let Selenium auto-detect (uses built-in selenium-manager)
        if driver is None:
            try:
                logger.info("Trying Selenium auto-detect (selenium-manager)...")
                driver = webdriver.Chrome(options=options)
                logger.info("Selenium: auto-detect started successfully")
            except Exception as e:
                last_error = e
                logger.warning("Selenium auto-detect failed: %s", e)
                driver = None

        if driver is None:
            error_msg = str(last_error) if last_error else "Could not start Chrome"
            raise RuntimeError(
                f"Failed to start Chrome/ChromeDriver: {error_msg}. "
                f"Make sure Google Chrome is installed on your system."
            )

        driver.set_page_load_timeout(30)

        # Navigate to Google Maps search
        maps_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        driver.get(maps_url)
        time.sleep(delay + 2)

        # Scroll through results to load more
        max_scrolls = max(3, max_results // 8)
        for _ in range(max_scrolls):
            try:
                driver.execute_script("""
                    const feed = document.querySelector('div[role="feed"]');
                    if (feed) feed.scrollTop = feed.scrollHeight;
                """)
            except Exception:
                pass
            time.sleep(delay)

            # Check count
            try:
                items = driver.find_elements(By.CSS_SELECTOR, SELECTORS["result_item"])
                if len(items) >= max_results:
                    break
            except Exception:
                break

        # Get all listing elements
        try:
            listings = driver.find_elements(By.CSS_SELECTOR, SELECTORS["result_item"])
        except Exception:
            listings = []

        for i in range(min(len(listings), max_results)):
            try:
                # Re-fetch in case DOM changed
                listings = driver.find_elements(By.CSS_SELECTOR, SELECTORS["result_item"])
                if i >= len(listings):
                    break

                listings[i].click()
                time.sleep(delay)

                # Extract business details
                business = {
                    "name": "", "phone": "", "website": "", "address": "",
                    "rating": "", "review_count": "", "category": "",
                    "source": "google_maps",
                }

                try:
                    name_el = driver.find_element(By.CSS_SELECTOR, "h1.DUwDvf")
                    business["name"] = name_el.text.strip()
                except Exception:
                    pass

                try:
                    phone_el = driver.find_element(By.CSS_SELECTOR, 'button[data-item-id^="phone"]')
                    raw = phone_el.get_attribute("aria-label") or phone_el.text or ""
                    business["phone"] = re.sub(r'Phone:|phone:', '', raw).strip()
                except Exception:
                    pass

                try:
                    web_el = driver.find_element(By.CSS_SELECTOR, 'a[data-item-id="authority"]')
                    business["website"] = web_el.get_attribute("href") or ""
                except Exception:
                    pass

                try:
                    addr_el = driver.find_element(By.CSS_SELECTOR, 'button[data-item-id="address"]')
                    raw = addr_el.get_attribute("aria-label") or addr_el.text or ""
                    business["address"] = re.sub(r'Address:|address:', '', raw).strip()
                except Exception:
                    pass

                try:
                    rating_el = driver.find_element(By.CSS_SELECTOR, "span.MW4etd")
                    business["rating"] = rating_el.text.strip()
                except Exception:
                    pass

                try:
                    review_el = driver.find_element(By.CSS_SELECTOR, "span.UY7F9")
                    business["review_count"] = re.sub(r'[^\d]', '', review_el.text)
                except Exception:
                    pass

                try:
                    cat_el = driver.find_element(By.CSS_SELECTOR, "button.DkEaL")
                    business["category"] = cat_el.text.strip()
                except Exception:
                    pass

                if business.get("name"):
                    business["phone"] = _clean_phone(business.get("phone", ""))
                    business["query"] = query
                    results.append(business)

            except Exception as e:
                logger.warning("Selenium: Error processing listing %d: %s", i, e)
                continue

    except Exception as e:
        logger.error("Selenium Google Maps scrape error: %s", e)
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass

    return results


# ─── Method 2: Patchright (OPTIONAL FALLBACK) ───────────────────────────────

async def _scrape_gmaps_patchright(
    query: str,
    max_results: int = 50,
    delay: float = 3.0,
    use_proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape Google Maps using Patchright (anti-detection browser).

    OPTIONAL fallback — only used if Selenium is not available.
    """
    try:
        from app.services.patchright_engine import new_page, safe_goto, random_delay
    except ImportError:
        logger.info("Patchright not available for Google Maps fallback")
        return []

    results: list[dict] = []
    page = None

    try:
        proxy_config = None
        if use_proxy:
            proxy_config = {
                "server": f"{use_proxy.get('protocol', 'http')}://{use_proxy['host']}:{use_proxy['port']}",
            }
            if use_proxy.get("username") and use_proxy.get("password"):
                proxy_config["username"] = use_proxy["username"]
                proxy_config["password"] = use_proxy["password"]

        page = await new_page(headless=True, proxy=proxy_config)

        # Navigate to Google Maps search
        maps_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        success = await safe_goto(page, maps_url, timeout=30000)
        if not success:
            logger.error("Patchright: Failed to load Google Maps")
            return results

        await random_delay(delay, delay + 2)

        # Scroll through results to load more
        max_scrolls = max(3, max_results // 8)
        for scroll_i in range(max_scrolls):
            try:
                await page.evaluate("""() => {
                    const feed = document.querySelector('div[role="feed"]');
                    if (feed) feed.scrollTop = feed.scrollHeight;
                }""")
            except Exception:
                pass
            await random_delay(delay * 0.8, delay * 1.2)
            count = await page.evaluate(f"""() => {{
                return document.querySelectorAll('{SELECTORS["result_item"]}').length;
            }}""")
            if count >= max_results:
                break

        listing_count = await page.evaluate(f"""() => {{
            return document.querySelectorAll('{SELECTORS["result_item"]}').length;
        }}""")

        for i in range(min(listing_count, max_results)):
            try:
                clicked = await page.evaluate(f"""(idx) => {{
                    const items = document.querySelectorAll('{SELECTORS["result_item"]}');
                    if (items[idx]) {{ items[idx].click(); return true; }}
                    return false;
                }}""", i)
                if not clicked:
                    continue
                await random_delay(delay * 0.8, delay * 1.2)

                business = await page.evaluate("""() => {
                    const biz = {
                        name: '', phone: '', website: '', address: '',
                        rating: '', review_count: '', category: '',
                        source: 'google_maps',
                    };
                    const nameEl = document.querySelector('h1.DUwDvf');
                    if (nameEl) biz.name = nameEl.innerText.trim();
                    const phoneEl = document.querySelector('button[data-item-id^="phone"]');
                    if (phoneEl) {
                        const raw = phoneEl.getAttribute('aria-label') || phoneEl.innerText || '';
                        biz.phone = raw.replace(/Phone:|phone:/g, '').trim();
                    }
                    const webEl = document.querySelector('a[data-item-id="authority"]');
                    if (webEl) biz.website = webEl.href || '';
                    const addrEl = document.querySelector('button[data-item-id="address"]');
                    if (addrEl) {
                        const raw = addrEl.getAttribute('aria-label') || addrEl.innerText || '';
                        biz.address = raw.replace(/Address:|address:/g, '').trim();
                    }
                    const ratingEl = document.querySelector('span.MW4etd');
                    if (ratingEl) biz.rating = ratingEl.innerText.trim();
                    const reviewEl = document.querySelector('span.UY7F9');
                    if (reviewEl) biz.review_count = reviewEl.innerText.replace(/[^\d]/g, '');
                    const catEl = document.querySelector('button.DkEaL');
                    if (catEl) biz.category = catEl.innerText.trim();
                    return biz;
                }""")

                if business and business.get("name"):
                    business["phone"] = _clean_phone(business.get("phone", ""))
                    business["query"] = query
                    results.append(business)

            except Exception as e:
                logger.warning("Patchright: Error processing listing %d: %s", i, e)
                continue

    except Exception as e:
        logger.error("Patchright Google Maps scrape error: %s", e)
    finally:
        if page:
            try:
                await page.context.close()
            except Exception:
                pass

    return results


# ─── Public API ──────────────────────────────────────────────────────────────

async def scrape_google_maps(
    query: str,
    max_results: int = 50,
    delay: float = 3.0,
    use_proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape Google Maps for business listings.

    Automatic fallback chain:
      1. Selenium + ChromeDriver (primary, reliable, works in .exe)
      2. Patchright (optional fallback if Selenium unavailable)
      3. httpx (lightweight HTTP backup — no browser needed)

    No API key or user account needed.

    Returns:
        List of dicts with: name, phone, website, address, rating, category, etc.
    """
    errors: list[str] = []

    # Method 1: Selenium (PRIMARY)
    logger.info("Google Maps: Trying Selenium + ChromeDriver...")
    try:
        results = await _scrape_gmaps_selenium(query, max_results, delay)
        if results:
            logger.info("Google Maps: Selenium returned %d results", len(results))
            return results
        errors.append("Selenium returned 0 results")
    except Exception as e:
        errors.append(f"Selenium: {e}")
        logger.warning("Google Maps: Selenium failed: %s", e)

    # Method 2: Patchright (FALLBACK)
    logger.info("Google Maps: Selenium returned no results, trying Patchright fallback...")
    try:
        results = await _scrape_gmaps_patchright(query, max_results, delay, use_proxy)
        if results:
            logger.info("Google Maps: Patchright returned %d results", len(results))
            return results
        errors.append("Patchright returned 0 results")
    except Exception as e:
        errors.append(f"Patchright: {e}")
        logger.warning("Google Maps: Patchright failed: %s", e)

    # Method 3: httpx (BACKUP — lightweight, no browser needed)
    logger.info("Google Maps: Browser methods failed, trying httpx backup...")
    try:
        results = await _scrape_gmaps_httpx(query, max_results)
        if results:
            logger.info("Google Maps: httpx returned %d results", len(results))
            return results
        errors.append("httpx returned 0 results")
    except Exception as e:
        errors.append(f"httpx: {e}")
        logger.warning("Google Maps: httpx failed: %s", e)

    # All methods failed — raise exception with details so frontend shows real error
    error_detail = " | ".join(errors) if errors else "Unknown error"
    raise RuntimeError(f"All Google Maps extraction methods failed: {error_detail}")


# ─── Method 3: httpx (BACKUP — no browser needed) ────────────────────────────

async def _scrape_gmaps_httpx(
    query: str,
    max_results: int = 50,
) -> list[dict]:
    """Scrape Google Maps using httpx + regex parsing (lightweight backup).

    This is the BACKUP method — used only when both Selenium and Patchright fail.
    It searches Google for Google Maps listings and parses the HTML response.
    Less accurate than browser methods but works without Chrome/ChromeDriver.
    """
    try:
        import httpx
    except ImportError:
        try:
            import requests as httpx  # type: ignore[no-redef]
        except ImportError:
            logger.warning("Neither httpx nor requests installed — cannot use httpx backup")
            return []

    results: list[dict] = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        # Search Google for Google Maps business listings
        search_url = f"https://www.google.com/search?q={quote_plus(query + ' site:google.com/maps')}&num={min(max_results, 20)}"

        if hasattr(httpx, 'AsyncClient'):
            async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
                resp = await client.get(search_url, headers=headers)
                html = resp.text
        else:
            resp = httpx.get(search_url, headers=headers, timeout=20)  # type: ignore[union-attr]
            html = resp.text

        # Also try the Google Maps search directly
        maps_search_url = f"https://www.google.com/maps/search/{quote_plus(query)}"
        if hasattr(httpx, 'AsyncClient'):
            async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
                maps_resp = await client.get(maps_search_url, headers=headers)
                maps_html = maps_resp.text
        else:
            maps_resp = httpx.get(maps_search_url, headers=headers, timeout=20)  # type: ignore[union-attr]
            maps_html = maps_resp.text

        # Parse business names and phone numbers from the response
        # Look for structured data in Google search results
        phone_pattern = re.compile(r'[\(\+]?\d{1,3}[\s\-\.]?\(?\d{2,4}\)?[\s\-\.]?\d{3,4}[\s\-\.]?\d{3,4}')
        name_pattern = re.compile(r'class="[^"]*"[^>]*>([^<]{3,60})</(?:h3|span|div|a)')

        all_html = html + maps_html

        # Extract phone numbers
        phones_found = phone_pattern.findall(all_html)
        phones_found = list(set(phones_found))[:max_results]

        # Try to extract business info from JSON-LD or structured data
        json_ld_pattern = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.DOTALL)
        json_blocks = json_ld_pattern.findall(all_html)

        for block in json_blocks:
            try:
                data = json.loads(block)
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and item.get('name'):
                            biz = {
                                'name': item.get('name', ''),
                                'phone': item.get('telephone', ''),
                                'website': item.get('url', ''),
                                'address': '',
                                'rating': str(item.get('aggregateRating', {}).get('ratingValue', '')) if isinstance(item.get('aggregateRating'), dict) else '',
                                'review_count': str(item.get('aggregateRating', {}).get('reviewCount', '')) if isinstance(item.get('aggregateRating'), dict) else '',
                                'category': item.get('@type', ''),
                                'source': 'google_maps_httpx',
                                'query': query,
                            }
                            addr = item.get('address', {})
                            if isinstance(addr, dict):
                                biz['address'] = f"{addr.get('streetAddress', '')} {addr.get('addressLocality', '')} {addr.get('addressRegion', '')}".strip()
                            if biz['name']:
                                results.append(biz)
                elif isinstance(data, dict) and data.get('name'):
                    biz = {
                        'name': data.get('name', ''),
                        'phone': data.get('telephone', ''),
                        'website': data.get('url', ''),
                        'address': '',
                        'rating': str(data.get('aggregateRating', {}).get('ratingValue', '')) if isinstance(data.get('aggregateRating'), dict) else '',
                        'review_count': str(data.get('aggregateRating', {}).get('reviewCount', '')) if isinstance(data.get('aggregateRating'), dict) else '',
                        'category': data.get('@type', ''),
                        'source': 'google_maps_httpx',
                        'query': query,
                    }
                    addr = data.get('address', {})
                    if isinstance(addr, dict):
                        biz['address'] = f"{addr.get('streetAddress', '')} {addr.get('addressLocality', '')} {addr.get('addressRegion', '')}".strip()
                    if biz['name']:
                        results.append(biz)
            except (json.JSONDecodeError, TypeError):
                continue

        # If no structured data, create basic entries from phone numbers found
        if not results and phones_found:
            for phone in phones_found[:max_results]:
                cleaned = _clean_phone(phone)
                if cleaned:
                    results.append({
                        'name': f'Business near {query}',
                        'phone': cleaned,
                        'website': '',
                        'address': '',
                        'rating': '',
                        'review_count': '',
                        'category': '',
                        'source': 'google_maps_httpx',
                        'query': query,
                    })

    except Exception as e:
        logger.error("httpx Google Maps scrape error: %s", e)

    return results[:max_results]


async def enrich_gmaps_with_emails(
    businesses: list[dict],
    firecrawl_key: str = "",
) -> list[dict]:
    """
    Enrich Google Maps results by scraping business websites for emails.
    Uses the website_email_finder as fallback if no Firecrawl key.
    """
    from app.services.website_email_finder import scrape_website_for_emails

    enriched = []
    for biz in businesses:
        website = biz.get("website", "")
        if website:
            try:
                emails_found = await scrape_website_for_emails(website, max_pages=3)
                for email in emails_found:
                    entry = dict(biz)
                    entry["email"] = email
                    enriched.append(entry)
            except Exception as e:
                logger.warning(f"Failed to enrich {website}: {e}")

    return enriched
