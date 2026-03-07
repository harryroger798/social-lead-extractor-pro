"""Google Maps scraper using Selenium headless browser."""
import asyncio
import re
import time
import logging
from typing import Optional

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

# Selectors for Google Maps
SELECTORS = {
    "search_input": 'input#searchboxinput',
    "result_item": 'div.Nv2PK',
    "name": 'div.qBF1Pd',
    "rating": 'span.MW4etd',
    "review_count": 'span.UY7F9',
    "category": 'button.DkEaL',
    "address": 'button[data-item-id="address"]',
    "phone": 'button[data-item-id^="phone"]',
    "website": 'a[data-item-id="authority"]',
    "hours": 'div.t39EBf',
}


def _clean_phone(raw: str) -> str:
    """Clean phone number from Google Maps format."""
    cleaned = re.sub(r'[^\d+\-\(\)\s]', '', raw).strip()
    return cleaned if len(re.sub(r'[^\d]', '', cleaned)) >= 7 else ''


async def scrape_google_maps(
    query: str,
    max_results: int = 50,
    delay: float = 3.0,
    use_proxy: Optional[dict] = None,
) -> list[dict]:
    """
    Scrape Google Maps for business listings.
    Uses Selenium in headless mode.
    Returns list of dicts with: name, phone, website, address, rating, category, etc.
    """
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    results: list[dict] = []

    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option('excludeSwitches', ['enable-automation'])

    if use_proxy:
        proxy_str = f"{use_proxy.get('protocol', 'http')}://"
        if use_proxy.get('username') and use_proxy.get('password'):
            proxy_str += f"{use_proxy['username']}:{use_proxy['password']}@"
        proxy_str += f"{use_proxy['host']}:{use_proxy['port']}"
        options.add_argument(f'--proxy-server={proxy_str}')

    driver = None
    try:
        driver = await asyncio.get_event_loop().run_in_executor(
            None, lambda: webdriver.Chrome(options=options)
        )

        # Navigate to Google Maps
        await asyncio.get_event_loop().run_in_executor(
            None, lambda: driver.get(f"https://www.google.com/maps/search/{query.replace(' ', '+')}")
        )

        # Wait for results to load
        await asyncio.sleep(delay + 2)

        # Scroll through results to load more
        scroll_attempts = 0
        max_scrolls = max(3, max_results // 8)

        def _scroll_results():
            try:
                scrollable = driver.find_element(By.CSS_SELECTOR, 'div[role="feed"]')
                driver.execute_script(
                    "arguments[0].scrollTop = arguments[0].scrollHeight", scrollable
                )
            except Exception:
                pass

        while scroll_attempts < max_scrolls:
            await asyncio.get_event_loop().run_in_executor(None, _scroll_results)
            await asyncio.sleep(delay)
            scroll_attempts += 1

            # Check how many results we have
            def _count_results():
                return len(driver.find_elements(By.CSS_SELECTOR, SELECTORS["result_item"]))

            count = await asyncio.get_event_loop().run_in_executor(None, _count_results)
            if count >= max_results:
                break

        # Extract listing data
        def _get_listings():
            listings = driver.find_elements(By.CSS_SELECTOR, SELECTORS["result_item"])
            return listings[:max_results]

        listings = await asyncio.get_event_loop().run_in_executor(None, _get_listings)

        for i, listing in enumerate(listings):
            try:
                # Click listing to open details panel
                def _click_listing(el):
                    try:
                        el.click()
                        time.sleep(delay)
                    except Exception:
                        pass

                await asyncio.get_event_loop().run_in_executor(
                    None, lambda: _click_listing(listing)
                )

                business = {
                    "name": "",
                    "phone": "",
                    "website": "",
                    "address": "",
                    "rating": "",
                    "review_count": "",
                    "category": "",
                    "source": "google_maps",
                    "query": query,
                }

                def _extract_detail():
                    try:
                        # Name
                        name_els = driver.find_elements(By.CSS_SELECTOR, 'h1.DUwDvf')
                        if name_els:
                            business["name"] = name_els[0].text.strip()

                        # Phone
                        phone_els = driver.find_elements(By.CSS_SELECTOR, SELECTORS["phone"])
                        if phone_els:
                            raw = phone_els[0].get_attribute("aria-label") or phone_els[0].text
                            cleaned = raw.replace("Phone:", "").replace("phone:", "").strip()
                            business["phone"] = _clean_phone(cleaned)

                        # Website
                        web_els = driver.find_elements(By.CSS_SELECTOR, SELECTORS["website"])
                        if web_els:
                            business["website"] = web_els[0].get_attribute("href") or ""

                        # Address
                        addr_els = driver.find_elements(By.CSS_SELECTOR, SELECTORS["address"])
                        if addr_els:
                            raw = addr_els[0].get_attribute("aria-label") or addr_els[0].text
                            business["address"] = raw.replace("Address:", "").replace("address:", "").strip()

                        # Rating
                        rating_els = driver.find_elements(By.CSS_SELECTOR, SELECTORS["rating"])
                        if rating_els:
                            business["rating"] = rating_els[0].text.strip()

                        # Review count
                        review_els = driver.find_elements(By.CSS_SELECTOR, SELECTORS["review_count"])
                        if review_els:
                            raw = review_els[0].text.strip()
                            business["review_count"] = re.sub(r'[^\d]', '', raw)

                        # Category
                        cat_els = driver.find_elements(By.CSS_SELECTOR, SELECTORS["category"])
                        if cat_els:
                            business["category"] = cat_els[0].text.strip()
                    except Exception as e:
                        logger.warning(f"Error extracting detail: {e}")

                await asyncio.get_event_loop().run_in_executor(None, _extract_detail)

                if business["name"]:
                    results.append(business)

            except Exception as e:
                logger.warning(f"Error processing listing {i}: {e}")
                continue

    except Exception as e:
        logger.error(f"Google Maps scrape error: {e}")
    finally:
        if driver:
            try:
                await asyncio.get_event_loop().run_in_executor(None, driver.quit)
            except Exception:
                pass

    return results


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
