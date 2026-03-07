"""WhatsApp group member scraper with Selenium fallback.

Supports two browser engines with automatic fallback:
  1. **Selenium + ChromeDriver** (PRIMARY): Reliable, works in .exe builds.
  2. **Patchright** (OPTIONAL FALLBACK): Anti-detection browser.

CRITICAL LIMITATION:
  WhatsApp Web requires QR code scanning which CANNOT be done in headless mode.
  The scraper will detect this and return a clear error message guiding the user.

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

QR CODE REQUIREMENT:
- User MUST scan QR code manually the first time
- Session persists for ~30 days after initial scan
- Headless mode CANNOT scan QR codes — requires visible browser window
- If banned, you'll need a new number

TERMS OF SERVICE WARNING:
- WhatsApp ToS explicitly prohibits scraping
- Use at your own risk
- We recommend using this for your OWN groups only
"""

import asyncio
import logging
import time
import re
from typing import Optional

logger = logging.getLogger(__name__)


# ─── Method 1: Selenium + ChromeDriver (PRIMARY) ────────────────────────────

async def _scrape_whatsapp_selenium(
    group_name: str,
    max_members: int = 100,
    delay: float = 8.0,
    session_data_dir: str = "/tmp/whatsapp_session",
) -> dict:
    """Scrape WhatsApp group members using Selenium + ChromeDriver.

    IMPORTANT: WhatsApp Web requires QR code scanning. In headless mode,
    the QR code cannot be scanned. This function will detect the QR code
    requirement and return a clear error message.
    """
    result = {
        "group_name": group_name,
        "members": [],
        "total_found": 0,
        "requires_qr": False,
        "error": None,
    }

    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.common.by import By
    except ImportError:
        result["error"] = "Selenium not installed"
        return result

    driver = None
    try:
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument(f"--user-data-dir={session_data_dir}")
        options.add_argument(
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        )

        driver = webdriver.Chrome(options=options)
        driver.set_page_load_timeout(30)

        # Navigate to WhatsApp Web
        driver.get("https://web.whatsapp.com")
        time.sleep(10)

        # Check if QR code is showing
        page_source = driver.page_source.lower()
        qr_indicators = ["qrcode", "scan", "link a device", "use whatsapp on your computer"]
        has_qr = any(indicator in page_source for indicator in qr_indicators)

        if has_qr:
            result["requires_qr"] = True
            result["error"] = (
                "WhatsApp requires QR code scan to authenticate. "
                "This CANNOT be done in headless/automated mode. "
                "Options:\n"
                "1. Open WhatsApp Web manually in your browser, scan QR code, "
                "then re-run the scraper (session persists ~30 days)\n"
                "2. Use the desktop app with a visible browser window\n"
                "3. Disable WhatsApp scraper and use other extraction methods"
            )
            return result

        # If we get past QR check, search for the group
        time.sleep(delay)

        try:
            search_box = driver.find_element(By.CSS_SELECTOR, '[data-testid="chat-list-search"]')
            search_box.click()
            search_box.clear()
            search_box.send_keys(group_name)
            time.sleep(3)
        except Exception:
            result["error"] = "Could not find WhatsApp search box. Session may have expired."
            return result

        # Find and click the matching group
        try:
            cells = driver.find_elements(By.CSS_SELECTOR, '[data-testid="cell-frame-container"]')
            group_found = False
            for cell in cells:
                cell_text = cell.text.lower()
                if group_name.lower() in cell_text:
                    cell.click()
                    group_found = True
                    break

            if not group_found:
                result["error"] = f"Group '{group_name}' not found in chat list"
                return result
        except Exception as e:
            result["error"] = f"Error searching for group: {e}"
            return result

        time.sleep(delay)

        # Click group header to open member list
        try:
            headers = driver.find_elements(By.CSS_SELECTOR, "header span[title]")
            for header in headers:
                title = header.get_attribute("title") or ""
                if group_name.lower() in title.lower():
                    header.click()
                    break
        except Exception:
            result["error"] = "Could not open group info panel"
            return result

        time.sleep(delay)

        # Extract members
        try:
            member_cells = driver.find_elements(By.CSS_SELECTOR, '[data-testid="cell-frame-container"]')
            members = []
            for cell in member_cells[:max_members]:
                try:
                    title_spans = cell.find_elements(By.CSS_SELECTOR, "span[title]")
                    if not title_spans:
                        continue
                    text = title_spans[0].get_attribute("title") or ""

                    name = ""
                    phone = ""
                    cleaned = text.replace(" ", "").replace("-", "")
                    if text.startswith("+") or cleaned.isdigit():
                        phone = text
                    else:
                        name = text

                    if name or phone:
                        members.append({
                            "name": name,
                            "phone": phone,
                            "platform": "whatsapp",
                            "source": f"WhatsApp Group: {group_name}",
                        })
                except Exception:
                    continue

            result["members"] = members
            result["total_found"] = len(members)
        except Exception as e:
            result["error"] = f"Error extracting members: {e}"

    except Exception as e:
        result["error"] = f"WhatsApp Selenium scrape error: {e}"
        logger.error("WhatsApp Selenium scrape error: %s", e)
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass

    return result


# ─── Method 2: Patchright (OPTIONAL FALLBACK) ───────────────────────────────

async def _scrape_whatsapp_patchright(
    group_name: str,
    max_members: int = 100,
    delay: float = 8.0,
    session_data_dir: str = "/tmp/whatsapp_session",
) -> dict:
    """Scrape WhatsApp group members using Patchright (optional fallback)."""
    result = {
        "group_name": group_name,
        "members": [],
        "total_found": 0,
        "requires_qr": False,
        "error": None,
    }

    try:
        from patchright.async_api import async_playwright
        from app.services.patchright_engine import random_delay
    except ImportError:
        result["error"] = "Patchright not available"
        return result

    pw = None
    browser = None
    page = None

    try:
        pw = await async_playwright().start()
        browser = await pw.chromium.launch_persistent_context(
            user_data_dir=session_data_dir,
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--window-size=1920,1080",
            ],
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1920, "height": 1080},
        )
        page = await browser.new_page()

    except Exception as e:
        result["error"] = f"Patchright browser launch failed: {e}"
        return result

    try:
        await page.goto("https://web.whatsapp.com", timeout=30000, wait_until="domcontentloaded")
        await asyncio.sleep(10)

        # Check for QR code
        has_qr = await page.evaluate("""() => {
            const qr = document.querySelector('canvas[aria-label*="Scan"]') ||
                       document.querySelector('[data-testid="qrcode"]');
            return !!qr;
        }""")

        if has_qr:
            result["requires_qr"] = True
            result["error"] = (
                "WhatsApp requires QR code scan to authenticate. "
                "This CANNOT be done in headless/automated mode. "
                "Options:\n"
                "1. Open WhatsApp Web manually in your browser, scan QR code, "
                "then re-run the scraper (session persists ~30 days)\n"
                "2. Use the desktop app with a visible browser window\n"
                "3. Disable WhatsApp scraper and use other extraction methods"
            )
            return result

        await random_delay(delay, delay + 3)

        # Search for the group
        found = await page.evaluate("""(groupName) => {
            const searchBox = document.querySelector('[data-testid="chat-list-search"]');
            if (!searchBox) return false;
            searchBox.click();
            searchBox.value = '';
            return true;
        }""", group_name)

        if found:
            search_input = page.locator('[data-testid="chat-list-search"]')
            await search_input.fill(group_name)
            await random_delay(2, 4)

            cells = page.locator('[data-testid="cell-frame-container"]')
            cell_count = await cells.count()
            group_found = False
            for ci in range(cell_count):
                cell_text = await cells.nth(ci).inner_text()
                if group_name.lower() in cell_text.lower():
                    await cells.nth(ci).click()
                    group_found = True
                    break

            if not group_found:
                result["error"] = f"Group '{group_name}' not found"
                return result
        else:
            result["error"] = "Could not find WhatsApp search box"
            return result

        await random_delay(delay, delay + 2)

        # Click group header
        try:
            header = page.locator('[data-testid="conversation-info-header"]')
            if await header.count() > 0:
                await header.click()
            else:
                header_spans = page.locator('header span[title]')
                header_count = await header_spans.count()
                for hi in range(header_count):
                    title = await header_spans.nth(hi).get_attribute("title") or ""
                    if group_name.lower() in title.lower():
                        await header_spans.nth(hi).click()
                        break
        except Exception:
            result["error"] = "Could not open group info panel"
            return result

        await random_delay(delay, delay + 2)

        # Extract members
        member_cells = page.locator('[data-testid="cell-frame-container"]')
        member_count = await member_cells.count()
        members = []

        for mi in range(min(member_count, max_members)):
            try:
                cell = member_cells.nth(mi)
                title_span = cell.locator('span[title]').first
                text = await title_span.get_attribute("title") or ""
                name = ""
                phone = ""
                cleaned = text.replace(" ", "").replace("-", "")
                if text.startswith("+") or cleaned.isdigit():
                    phone = text
                else:
                    name = text
                if name or phone:
                    members.append({
                        "name": name,
                        "phone": phone,
                        "platform": "whatsapp",
                        "source": f"WhatsApp Group: {group_name}",
                    })
            except Exception:
                continue

        result["members"] = members
        result["total_found"] = len(members)

    except Exception as e:
        result["error"] = str(e)
        logger.error("WhatsApp Patchright scrape error: %s", e)
    finally:
        try:
            if page:
                await page.close()
            if browser:
                await browser.close()
            if pw:
                await pw.stop()
        except Exception:
            pass

    return result


# ─── Public API ──────────────────────────────────────────────────────────────

async def scrape_whatsapp_group(
    group_name: str,
    max_members: int = 100,
    delay: float = 8.0,
    session_data_dir: str = "/tmp/whatsapp_session",
) -> dict:
    """Scrape WhatsApp group members.

    Automatic fallback chain:
      1. Selenium + ChromeDriver (primary, reliable)
      2. Patchright (optional fallback)

    IMPORTANT: WhatsApp Web requires QR code scanning which CANNOT be done
    in headless mode. The scraper will detect this and return a clear error.

    Returns dict with members list, metadata, and any errors.
    """
    # Method 1: Selenium (PRIMARY)
    logger.info("WhatsApp: Trying Selenium + ChromeDriver...")
    result = await _scrape_whatsapp_selenium(group_name, max_members, delay, session_data_dir)

    # If Selenium itself failed (not QR code issue), try Patchright
    if result.get("error") and not result.get("requires_qr") and result["error"] == "Selenium not installed":
        logger.info("WhatsApp: Selenium not available, trying Patchright fallback...")
        result = await _scrape_whatsapp_patchright(group_name, max_members, delay, session_data_dir)

    if result.get("requires_qr"):
        logger.warning("WhatsApp: QR code scan required — cannot proceed in headless mode")

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
