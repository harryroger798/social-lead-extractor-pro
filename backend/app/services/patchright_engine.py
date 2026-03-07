"""Patchright browser engine — anti-detection Playwright fork for web scraping.

Patchright is an MIT-licensed fork of Playwright that patches Chromium to pass
all major bot-detection frameworks (Cloudflare, DataDome, PerimeterX, etc.)
while running in headless mode.

Usage on user's machine (Electron desktop app):
  - First launch: ``python -m patchright install chromium``
  - Or use system Chrome: ``channel="chrome"``
"""

import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Singleton browser context
_browser = None
_playwright = None


async def get_browser(
    headless: bool = True,
    proxy: Optional[dict] = None,
    slow_mo: int = 0,
):
    """Get or create a Patchright browser instance.

    Args:
        headless: Run in headless mode (True for server, False for desktop).
        proxy: Optional proxy config ``{"server": "http://host:port", "username": ..., "password": ...}``.
        slow_mo: Milliseconds to slow down each operation (human-like).

    Returns:
        A Patchright Browser instance.
    """
    global _browser, _playwright

    if _browser and _browser.is_connected():
        return _browser

    try:
        from patchright.async_api import async_playwright

        _playwright = await async_playwright().start()

        launch_kwargs: dict = {
            "headless": headless,
            "slow_mo": slow_mo,
            "args": [
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--window-size=1920,1080",
            ],
        }

        if proxy:
            launch_kwargs["proxy"] = proxy

        # Try bundled Patchright Chromium first, then system Chrome
        try:
            _browser = await _playwright.chromium.launch(**launch_kwargs)
        except Exception:
            logger.info("Patchright Chromium not found, trying system Chrome...")
            try:
                _browser = await _playwright.chromium.launch(
                    channel="chrome", **launch_kwargs
                )
            except Exception:
                logger.info("System Chrome not found, trying Chromium channel...")
                _browser = await _playwright.chromium.launch(
                    channel="chromium", **launch_kwargs
                )

        logger.info("Patchright browser launched (headless=%s)", headless)
        return _browser

    except ImportError:
        logger.error(
            "Patchright not installed. Install with: pip install patchright && python -m patchright install chromium"
        )
        raise RuntimeError(
            "Patchright not installed. Run: pip install patchright && python -m patchright install chromium"
        )


async def new_page(
    headless: bool = True,
    proxy: Optional[dict] = None,
    user_agent: Optional[str] = None,
):
    """Create a new page with anti-detection settings.

    Returns:
        A Patchright Page instance.
    """
    browser = await get_browser(headless=headless, proxy=proxy)

    context_kwargs: dict = {
        "viewport": {"width": 1920, "height": 1080},
        "locale": "en-US",
        "timezone_id": "America/New_York",
        "color_scheme": "light",
        "java_script_enabled": True,
    }

    if user_agent:
        context_kwargs["user_agent"] = user_agent
    else:
        context_kwargs["user_agent"] = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/131.0.0.0 Safari/537.36"
        )

    context = await browser.new_context(**context_kwargs)
    page = await context.new_page()
    return page


async def close_browser():
    """Close the browser and clean up."""
    global _browser, _playwright

    if _browser:
        try:
            await _browser.close()
        except Exception:
            pass
        _browser = None

    if _playwright:
        try:
            await _playwright.stop()
        except Exception:
            pass
        _playwright = None


async def safe_goto(page, url: str, timeout: int = 30000, wait_until: str = "domcontentloaded"):
    """Navigate to a URL with error handling."""
    try:
        await page.goto(url, timeout=timeout, wait_until=wait_until)
        return True
    except Exception as e:
        logger.warning("Failed to navigate to %s: %s", url, e)
        return False


async def extract_page_text(page) -> str:
    """Extract all visible text from a page."""
    try:
        return await page.evaluate("() => document.body.innerText || ''")
    except Exception:
        return ""


async def extract_page_html(page) -> str:
    """Extract full HTML from a page."""
    try:
        return await page.content()
    except Exception:
        return ""


async def random_delay(min_s: float = 1.0, max_s: float = 3.0):
    """Human-like random delay."""
    import random
    delay = random.uniform(min_s, max_s)
    await asyncio.sleep(delay)


async def check_patchright_available() -> dict:
    """Check if Patchright is installed and browser is available."""
    result = {"installed": False, "browser_available": False, "error": ""}

    try:
        import patchright  # noqa: F401
        result["installed"] = True
    except ImportError:
        result["error"] = "Patchright not installed. Run: pip install patchright"
        return result

    try:
        browser = await get_browser(headless=True)
        page = await browser.new_context().then(lambda ctx: ctx.new_page())
        await page.goto("about:blank")
        await page.close()
        result["browser_available"] = True
    except Exception as e:
        result["error"] = f"Browser not available: {e}. Run: python -m patchright install chromium"

    return result
