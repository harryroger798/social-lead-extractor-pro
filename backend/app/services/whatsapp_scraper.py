"""WhatsApp group member scraper using Selenium headless.

CRITICAL BAN/SAFETY NOTES FOR USERS:
======================================

BAN RISK: MEDIUM-HIGH
- WhatsApp actively monitors for automation
- Accounts CAN be temporarily or permanently banned
- Use a secondary/burner WhatsApp number, NOT your primary number

BAN PREVENTION TECHNIQUES:
1. Random delays between actions (5-15 seconds)
2. Don't scrape more than 3 groups per session
3. Wait at least 2 hours between scraping sessions
4. Use a WhatsApp Business account (more lenient with automation)
5. Don't scroll too fast through member lists
6. Keep sessions under 30 minutes
7. Use mobile proxy or residential IP (datacenter IPs are flagged)

WHAT YOU GET:
- Phone numbers (international format)
- Display names
- Group membership
- NOT emails (WhatsApp doesn't expose emails)

HOW TO GET MORE NUMBERS:
1. Join more groups related to your niche
2. WhatsApp allows up to 512 members per group
3. Export contacts, then use the Website Email Finder to get their emails from business websites
4. Cross-reference with LinkedIn using Google dorking

QR CODE REQUIREMENT:
- User MUST scan QR code manually the first time
- Session persists for ~30 days after initial scan
- If banned, you'll need a new number

TERMS OF SERVICE WARNING:
- WhatsApp ToS explicitly prohibits scraping
- Use at your own risk
- We recommend using this for your OWN groups only
"""
import asyncio
import logging
import time
from typing import Optional

logger = logging.getLogger(__name__)


async def scrape_whatsapp_group(
    group_name: str,
    max_members: int = 100,
    delay: float = 8.0,
    session_data_dir: str = "/tmp/whatsapp_session",
) -> dict:
    """
    Scrape WhatsApp group members using Selenium headless.
    User must have already authenticated via QR code.

    Returns dict with members list and metadata.
    """
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    result = {
        "group_name": group_name,
        "members": [],
        "total_found": 0,
        "requires_qr": False,
        "error": None,
    }

    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
    options.add_argument(f'--user-data-dir={session_data_dir}')

    driver = None
    try:
        driver = await asyncio.get_event_loop().run_in_executor(
            None, lambda: webdriver.Chrome(options=options)
        )

        # Navigate to WhatsApp Web
        await asyncio.get_event_loop().run_in_executor(
            None, lambda: driver.get("https://web.whatsapp.com")
        )

        # Wait for page load
        await asyncio.sleep(10)

        # Check if QR code is showing (not authenticated)
        def _check_qr():
            try:
                qr_elements = driver.find_elements(By.CSS_SELECTOR, 'canvas[aria-label="Scan this QR code to link a device!"]')
                if qr_elements:
                    return True
                # Also check for the QR code container
                qr_containers = driver.find_elements(By.CSS_SELECTOR, '[data-testid="qrcode"]')
                return len(qr_containers) > 0
            except Exception:
                return False

        has_qr = await asyncio.get_event_loop().run_in_executor(None, _check_qr)
        if has_qr:
            result["requires_qr"] = True
            result["error"] = "QR code scan required. Please scan the QR code in WhatsApp Web first."
            return result

        # Wait for chats to load
        await asyncio.sleep(delay)

        # Search for the group
        def _search_group():
            try:
                search_box = driver.find_element(By.CSS_SELECTOR, '[data-testid="chat-list-search"]')
                search_box.clear()
                search_box.click()
                time.sleep(1)
                search_box.send_keys(group_name)
                time.sleep(3)

                # Click on the group result
                results = driver.find_elements(By.CSS_SELECTOR, '[data-testid="cell-frame-container"]')
                for r in results:
                    if group_name.lower() in r.text.lower():
                        r.click()
                        return True
                return False
            except Exception as e:
                logger.error(f"Error searching group: {e}")
                return False

        found = await asyncio.get_event_loop().run_in_executor(None, _search_group)
        if not found:
            result["error"] = f"Group '{group_name}' not found"
            return result

        await asyncio.sleep(delay)

        # Click on group header to see members
        def _open_group_info():
            try:
                header = driver.find_element(By.CSS_SELECTOR, '[data-testid="conversation-info-header"]')
                header.click()
                time.sleep(3)
                return True
            except Exception:
                try:
                    # Alternative: click the group name in the header
                    headers = driver.find_elements(By.CSS_SELECTOR, 'header span[title]')
                    for h in headers:
                        if group_name.lower() in (h.get_attribute("title") or "").lower():
                            h.click()
                            time.sleep(3)
                            return True
                except Exception:
                    pass
                return False

        opened = await asyncio.get_event_loop().run_in_executor(None, _open_group_info)
        if not opened:
            result["error"] = "Could not open group info panel"
            return result

        await asyncio.sleep(delay)

        # Extract members
        def _extract_members():
            members = []
            try:
                # Look for participant elements
                member_elements = driver.find_elements(By.CSS_SELECTOR, '[data-testid="cell-frame-container"]')
                for el in member_elements[:max_members]:
                    try:
                        name = ""
                        phone = ""

                        # Get name/phone from the element
                        title_el = el.find_elements(By.CSS_SELECTOR, 'span[title]')
                        if title_el:
                            text = title_el[0].get_attribute("title") or ""
                            # Check if it's a phone number
                            if text.startswith("+") or text.replace(" ", "").replace("-", "").isdigit():
                                phone = text
                            else:
                                name = text

                        # Check for phone in subtitle
                        subtitle_els = el.find_elements(By.CSS_SELECTOR, 'span[class*="subtitle"]')
                        for sub in subtitle_els:
                            sub_text = sub.text
                            if sub_text.startswith("+") or (sub_text.replace(" ", "").replace("-", "").replace("+", "").isdigit() and len(sub_text) > 7):
                                phone = sub_text

                        if name or phone:
                            members.append({
                                "name": name,
                                "phone": phone,
                                "platform": "whatsapp",
                                "source": f"WhatsApp Group: {group_name}",
                            })

                    except Exception:
                        continue

            except Exception as e:
                logger.error(f"Error extracting members: {e}")

            return members

        members = await asyncio.get_event_loop().run_in_executor(None, _extract_members)
        result["members"] = members
        result["total_found"] = len(members)

    except Exception as e:
        result["error"] = str(e)
        logger.error(f"WhatsApp scrape error: {e}")
    finally:
        if driver:
            try:
                await asyncio.get_event_loop().run_in_executor(None, driver.quit)
            except Exception:
                pass

    return result


def get_whatsapp_safety_guide() -> dict:
    """Return safety guide for WhatsApp scraping."""
    return {
        "title": "WhatsApp Scraper Safety Guide",
        "ban_risk": "MEDIUM-HIGH",
        "prevention": [
            "Use a secondary/burner WhatsApp number, NOT your primary",
            "Random delays of 5-15 seconds between actions",
            "Max 3 groups per scraping session",
            "Wait 2+ hours between sessions",
            "Use WhatsApp Business account (more automation-tolerant)",
            "Keep sessions under 30 minutes",
            "Use residential/mobile proxy (datacenter IPs get flagged)",
        ],
        "what_you_get": [
            "Phone numbers (international format)",
            "Display names",
            "Group membership info",
            "NOT emails (WhatsApp doesn't expose them)",
        ],
        "how_to_get_more": [
            "Join more niche-relevant groups",
            "Export contacts, use Website Email Finder for business emails",
            "Cross-reference with LinkedIn via Google dorking",
            "Use Telegram groups as alternative (lower ban risk)",
        ],
        "tos_warning": "WhatsApp ToS prohibits scraping. Use at your own risk. "
                       "Recommended: only scrape your OWN groups.",
        "qr_code": "First-time use requires scanning a QR code manually. "
                   "Session persists for ~30 days.",
    }
