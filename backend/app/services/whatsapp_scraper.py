"""WhatsApp group member scraper using Patchright anti-detection browser.

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
from typing import Optional

logger = logging.getLogger(__name__)


async def scrape_whatsapp_group(
    group_name: str,
    max_members: int = 100,
    delay: float = 8.0,
    session_data_dir: str = "/tmp/whatsapp_session",
) -> dict:
    """Scrape WhatsApp group members using Patchright.

    User must have already authenticated via QR code.
    Uses Patchright (anti-detection Playwright) instead of Selenium
    for better reliability and anti-detection.

    Returns dict with members list and metadata.
    """
    from app.services.patchright_engine import random_delay

    result = {
        "group_name": group_name,
        "members": [],
        "total_found": 0,
        "requires_qr": False,
        "error": None,
    }

    try:
        from patchright.async_api import async_playwright

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

    except ImportError:
        result["error"] = "Patchright not installed. Run: pip install patchright && python -m patchright install chromium"
        return result
    except Exception as e:
        result["error"] = f"Browser launch failed: {e}"
        return result

    try:
        # Navigate to WhatsApp Web
        await page.goto("https://web.whatsapp.com", timeout=30000, wait_until="domcontentloaded")
        await asyncio.sleep(10)

        # Check if QR code is showing (not authenticated)
        has_qr = await page.evaluate("""() => {
            const qr = document.querySelector('canvas[aria-label*="Scan"]') ||
                       document.querySelector('[data-testid="qrcode"]');
            return !!qr;
        }""")

        if has_qr:
            result["requires_qr"] = True
            result["error"] = "QR code scan required. Please scan the QR code in WhatsApp Web first."
            return result

        # Wait for chats to load
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

            # Click on matching group
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

        # Click on group header to see members
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
        logger.error("WhatsApp scrape error: %s", e)
    finally:
        try:
            await page.close()
            await browser.close()
            await pw.stop()
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
