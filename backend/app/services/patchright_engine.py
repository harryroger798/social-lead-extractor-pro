"""Patchright browser engine — OPTIONAL anti-detection browser for web scraping.

Patchright is an MIT-licensed fork of Playwright that patches Chromium to pass
all major bot-detection frameworks (Cloudflare, DataDome, PerimeterX, etc.)
while running in headless mode.

IMPORTANT: Patchright is OPTIONAL. All scrapers have Selenium+ChromeDriver as
their primary engine and only fall back to Patchright if Selenium is unavailable.
If Patchright is not installed, the app works fine with Selenium alone.

Usage on user's machine (Electron desktop app):
  - First launch: ``python -m patchright install chromium``
  - Or use system Chrome: ``channel="chrome"``
  - If neither works, the app falls back to Selenium automatically
"""

import asyncio
import logging
import os
import sys
from typing import Optional

logger = logging.getLogger(__name__)

# ── Set PLAYWRIGHT_BROWSERS_PATH for PyInstaller bundles ─────────────────────
# When the app runs from a PyInstaller --onefile bundle, Chromium lives under
# ``sys._MEIPASS/patchright_browsers``.  We must tell Patchright where to find
# it *before* the first launch.
_MEIPASS = getattr(sys, "_MEIPASS", None)
if _MEIPASS:
    _bundled_browsers = os.path.join(_MEIPASS, "patchright_browsers")
    if os.path.isdir(_bundled_browsers):
        os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", _bundled_browsers)
        logger.info("Patchright: using bundled browsers at %s", _bundled_browsers)
        # Log directory contents for debugging
        try:
            for entry in os.listdir(_bundled_browsers):
                entry_path = os.path.join(_bundled_browsers, entry)
                if os.path.isdir(entry_path):
                    sub_entries = os.listdir(entry_path)
                    logger.info("  %s/ -> %s", entry, sub_entries[:5])
        except Exception as exc:
            logger.warning("Could not list bundled browsers: %s", exc)

# Singleton browser context
_browser = None
_playwright = None
_install_attempted = False


async def _try_auto_install() -> bool:
    """Try to auto-install Patchright Chromium (max 2 attempts).

    Skipped when running inside a PyInstaller bundle because
    ``sys.executable`` points to the frozen exe, not Python.
    """
    global _install_attempted
    if _install_attempted:
        return False

    _install_attempted = True

    # Skip auto-install in frozen PyInstaller builds — it would fail
    if getattr(sys, "frozen", False):
        logger.info("Skipping Patchright auto-install inside PyInstaller bundle")
        return False

    try:
        import subprocess

        logger.info("Attempting to auto-install Patchright Chromium...")
        proc = subprocess.run(
            [sys.executable, "-m", "patchright", "install", "chromium"],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if proc.returncode == 0:
            logger.info("Patchright Chromium auto-installed successfully")
            return True
        else:
            logger.warning("Patchright Chromium auto-install failed: %s", proc.stderr[:200])
            return False
    except Exception as e:
        logger.warning("Patchright Chromium auto-install error: %s", e)
        return False


async def get_browser(
    headless: bool = True,
    proxy: Optional[dict] = None,
    slow_mo: int = 0,
):
    """Get or create a Patchright browser instance.

    Fallback chain:
      1. Bundled Patchright Chromium
      2. System Chrome (channel="chrome")
      3. System Chromium (channel="chromium")
      4. Auto-install Patchright Chromium + retry
      5. Return None (caller should handle gracefully)

    Args:
        headless: Run in headless mode (True for server, False for desktop).
        proxy: Optional proxy config.
        slow_mo: Milliseconds to slow down each operation.

    Returns:
        A Patchright Browser instance, or None if Patchright is not available.
    """
    global _browser, _playwright

    if _browser and _browser.is_connected():
        return _browser

    try:
        from patchright.async_api import async_playwright
    except ImportError:
        logger.info(
            "Patchright not installed — this is OK, Selenium is the primary engine. "
            "To enable Patchright: pip install patchright && python -m patchright install chromium"
        )
        return None

    try:
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

        # Step 1: Try bundled Patchright Chromium
        try:
            _browser = await _playwright.chromium.launch(**launch_kwargs)
            logger.info("Patchright browser launched with bundled Chromium (headless=%s)", headless)
            return _browser
        except Exception as e:
            logger.info("Patchright bundled Chromium not found: %s", str(e)[:100])

        # Step 2: Try system Chrome
        try:
            _browser = await _playwright.chromium.launch(channel="chrome", **launch_kwargs)
            logger.info("Patchright browser launched with system Chrome (headless=%s)", headless)
            return _browser
        except Exception as e:
            logger.info("System Chrome not available for Patchright: %s", str(e)[:100])

        # Step 3: Try system Chromium
        try:
            _browser = await _playwright.chromium.launch(channel="chromium", **launch_kwargs)
            logger.info("Patchright browser launched with system Chromium (headless=%s)", headless)
            return _browser
        except Exception as e:
            logger.info("System Chromium not available for Patchright: %s", str(e)[:100])

        # Step 4: Try auto-install + retry
        installed = await _try_auto_install()
        if installed:
            try:
                _browser = await _playwright.chromium.launch(**launch_kwargs)
                logger.info("Patchright browser launched after auto-install (headless=%s)", headless)
                return _browser
            except Exception as e:
                logger.warning("Patchright still failed after auto-install: %s", str(e)[:100])

        # Step 5: All attempts failed — return None gracefully
        logger.warning(
            "Patchright: No browser available. This is OK — Selenium is the primary engine. "
            "To enable Patchright: python -m patchright install chromium"
        )
        if _playwright:
            try:
                await _playwright.stop()
            except Exception:
                pass
            _playwright = None
        return None

    except Exception as e:
        logger.warning("Patchright engine error: %s — falling back to Selenium", e)
        if _playwright:
            try:
                await _playwright.stop()
            except Exception:
                pass
            _playwright = None
        return None


async def new_page(
    headless: bool = True,
    proxy: Optional[dict] = None,
    user_agent: Optional[str] = None,
):
    """Create a new page with anti-detection settings.

    Returns:
        A Patchright Page instance, or None if no browser available.
    """
    browser = await get_browser(headless=headless, proxy=proxy)
    if browser is None:
        logger.info("Patchright browser not available — cannot create new page")
        return None

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
