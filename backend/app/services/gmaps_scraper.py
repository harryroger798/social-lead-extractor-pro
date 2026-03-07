"""Google Maps scraper using Patchright anti-detection browser.

Replaces Selenium with Patchright for better anti-detection and reliability.
No API key or user account needed — scrapes Google Maps directly.
"""

import asyncio
import re
import logging
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


async def scrape_google_maps(
    query: str,
    max_results: int = 50,
    delay: float = 3.0,
    use_proxy: Optional[dict] = None,
) -> list[dict]:
    """Scrape Google Maps for business listings using Patchright.

    No API key or user account needed. Uses Patchright anti-detection browser
    to scrape Google Maps directly.

    Returns:
        List of dicts with: name, phone, website, address, rating, category, etc.
    """
    from app.services.patchright_engine import new_page, safe_goto, random_delay

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
            logger.error("Failed to load Google Maps")
            return results

        # Wait for results to load
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

            # Check count
            count = await page.evaluate(f"""() => {{
                return document.querySelectorAll('{SELECTORS["result_item"]}').length;
            }}""")
            if count >= max_results:
                break

        # Get all listing elements and click each to extract details
        listing_count = await page.evaluate(f"""() => {{
            return document.querySelectorAll('{SELECTORS["result_item"]}').length;
        }}""")

        for i in range(min(listing_count, max_results)):
            try:
                # Click the listing
                clicked = await page.evaluate(f"""(idx) => {{
                    const items = document.querySelectorAll('{SELECTORS["result_item"]}');
                    if (items[idx]) {{ items[idx].click(); return true; }}
                    return false;
                }}""", i)

                if not clicked:
                    continue

                await random_delay(delay * 0.8, delay * 1.2)

                # Extract business details from the detail panel
                business = await page.evaluate("""() => {
                    const biz = {
                        name: '', phone: '', website: '', address: '',
                        rating: '', review_count: '', category: '',
                        source: 'google_maps',
                    };

                    // Name
                    const nameEl = document.querySelector('h1.DUwDvf');
                    if (nameEl) biz.name = nameEl.innerText.trim();

                    // Phone
                    const phoneEl = document.querySelector('button[data-item-id^="phone"]');
                    if (phoneEl) {
                        const raw = phoneEl.getAttribute('aria-label') || phoneEl.innerText || '';
                        biz.phone = raw.replace(/Phone:|phone:/g, '').trim();
                    }

                    // Website
                    const webEl = document.querySelector('a[data-item-id="authority"]');
                    if (webEl) biz.website = webEl.href || '';

                    // Address
                    const addrEl = document.querySelector('button[data-item-id="address"]');
                    if (addrEl) {
                        const raw = addrEl.getAttribute('aria-label') || addrEl.innerText || '';
                        biz.address = raw.replace(/Address:|address:/g, '').trim();
                    }

                    // Rating
                    const ratingEl = document.querySelector('span.MW4etd');
                    if (ratingEl) biz.rating = ratingEl.innerText.trim();

                    // Review count
                    const reviewEl = document.querySelector('span.UY7F9');
                    if (reviewEl) biz.review_count = reviewEl.innerText.replace(/[^\d]/g, '');

                    // Category
                    const catEl = document.querySelector('button.DkEaL');
                    if (catEl) biz.category = catEl.innerText.trim();

                    return biz;
                }""")

                if business and business.get("name"):
                    business["phone"] = _clean_phone(business.get("phone", ""))
                    business["query"] = query
                    results.append(business)

            except Exception as e:
                logger.warning("Error processing listing %d: %s", i, e)
                continue

    except Exception as e:
        logger.error("Google Maps scrape error: %s", e)
    finally:
        if page:
            try:
                await page.context.close()
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
