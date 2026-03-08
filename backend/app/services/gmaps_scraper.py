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
from typing import Optional

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
    """Find ChromeDriver — check bundled location first, then webdriver-manager, then system PATH."""
    import os
    import sys
    import shutil

    # Check bundled locations (for .exe / PyInstaller builds)
    base_dirs = [
        os.path.dirname(__file__),
        os.path.join(os.path.dirname(__file__), "..", ".."),
        os.path.join(os.path.dirname(__file__), "..", "..", ".."),
    ]
    # Also check PyInstaller _MEIPASS directory
    if hasattr(sys, '_MEIPASS'):
        base_dirs.insert(0, sys._MEIPASS)
        base_dirs.insert(1, os.path.join(sys._MEIPASS, 'chromedriver'))
    # Check next to the executable itself
    if getattr(sys, 'frozen', False):
        base_dirs.insert(0, os.path.dirname(sys.executable))

    for base in base_dirs:
        for name in ['chromedriver', 'chromedriver.exe']:
            path = os.path.join(base, name)
            if os.path.exists(path):
                logger.info("Found bundled ChromeDriver at: %s", path)
                return os.path.abspath(path)

    # Check system PATH
    system_driver = shutil.which("chromedriver")
    if system_driver:
        logger.info("Found ChromeDriver in system PATH: %s", system_driver)
        return system_driver

    # Use webdriver-manager to auto-download matching ChromeDriver
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        driver_path = ChromeDriverManager().install()
        logger.info("webdriver-manager installed ChromeDriver at: %s", driver_path)
        return driver_path
    except Exception as e:
        logger.warning("webdriver-manager could not install ChromeDriver: %s", e)

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

        # Try to find ChromeDriver (bundled → webdriver-manager → system)
        chromedriver_path = _get_chromedriver_path()
        if chromedriver_path:
            logger.info("Using ChromeDriver at: %s", chromedriver_path)
            service = Service(executable_path=chromedriver_path)
            driver = webdriver.Chrome(service=service, options=options)
        else:
            # Let Selenium find it automatically as last resort
            logger.info("No ChromeDriver found, letting Selenium auto-detect...")
            driver = webdriver.Chrome(options=options)

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
      3. Returns empty list with error log if both fail

    No API key or user account needed.

    Returns:
        List of dicts with: name, phone, website, address, rating, category, etc.
    """
    # Method 1: Selenium (PRIMARY)
    logger.info("Google Maps: Trying Selenium + ChromeDriver...")
    results = await _scrape_gmaps_selenium(query, max_results, delay)
    if results:
        logger.info("Google Maps: Selenium returned %d results", len(results))
        return results

    # Method 2: Patchright (FALLBACK)
    logger.info("Google Maps: Selenium returned no results, trying Patchright fallback...")
    results = await _scrape_gmaps_patchright(query, max_results, delay, use_proxy)
    if results:
        logger.info("Google Maps: Patchright returned %d results", len(results))
        return results

    logger.warning("Google Maps: Both Selenium and Patchright returned no results for query: %s", query)
    return []


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
