"""CAPTCHA detection and handling — graceful skip when CAPTCHA detected.

IMPORTANT: This module does NOT attempt to solve CAPTCHAs automatically.
Whisper-based CAPTCHA solving is unreliable in headless mode and is NOT
a hard dependency. Instead:

  1. detect_captcha() checks if a CAPTCHA is present
  2. If CAPTCHA detected, the caller (e.g. google_dorking) skips to the
     Serper API fallback instead of blocking
  3. solve_recaptcha() is kept for backward compatibility but will gracefully
     return False if Whisper is unavailable (no blocking, no crash)

This approach ensures the .exe works reliably without requiring Whisper
or any CAPTCHA-solving dependency.
"""

import asyncio
import logging
import tempfile
import os
from typing import Optional

logger = logging.getLogger(__name__)

# Lazy-loaded Whisper model
_whisper_model = None
_whisper_load_attempted = False


def _load_whisper_model(model_name: str = "base"):
    """Load Whisper model (lazy, cached after first load).

    Returns None gracefully if Whisper is not installed — this is expected
    behavior, not an error.
    """
    global _whisper_model, _whisper_load_attempted

    if _whisper_model is not None:
        return _whisper_model

    if _whisper_load_attempted:
        return None

    _whisper_load_attempted = True

    try:
        import whisper
        logger.info("Loading Whisper '%s' model (optional)...", model_name)
        _whisper_model = whisper.load_model(model_name)
        logger.info("Whisper model loaded successfully")
        return _whisper_model
    except ImportError:
        logger.info(
            "Whisper not installed — CAPTCHA solving disabled. "
            "This is OK, Serper API is the primary search method."
        )
        return None
    except Exception as e:
        logger.warning("Failed to load Whisper model: %s — CAPTCHA solving disabled", e)
        return None


def _transcribe_audio(audio_path: str) -> str:
    """Transcribe an audio file using Whisper."""
    model = _load_whisper_model()
    if model is None:
        return ""

    try:
        result = model.transcribe(audio_path, language="en", fp16=False)
        text = result.get("text", "").strip()
        # Clean up common Whisper artifacts
        text = text.replace(".", "").replace(",", "").strip().lower()
        logger.info("Whisper transcription: '%s'", text)
        return text
    except Exception as e:
        logger.error("Whisper transcription failed: %s", e)
        return ""


async def solve_recaptcha(page) -> bool:
    """Attempt to solve a reCAPTCHA on the given page.

    IMPORTANT: This function is OPTIONAL and will gracefully return False if:
      - Whisper is not installed
      - Audio download fails
      - Transcription fails
      - Any other error occurs

    The caller should NOT block on this — if it returns False, skip to
    an alternative method (e.g. Serper API).

    Args:
        page: A Patchright/Playwright page instance.

    Returns:
        True if CAPTCHA was solved, False otherwise (never raises).
    """
    try:
        # Quick check: is Whisper even available?
        if not is_whisper_available():
            logger.info(
                "Whisper not available — skipping CAPTCHA solve. "
                "Caller should use Serper API fallback."
            )
            return False

        # Check if reCAPTCHA iframe exists
        recaptcha_frame = None
        for frame in page.frames:
            if "recaptcha" in frame.url or "google.com/recaptcha" in frame.url:
                recaptcha_frame = frame
                break

        if not recaptcha_frame:
            # No CAPTCHA found — page is clean
            return True

        logger.info("reCAPTCHA detected, attempting audio solve (Whisper available)...")

        # Click the checkbox
        try:
            checkbox = recaptcha_frame.locator("#recaptcha-anchor")
            await checkbox.click(timeout=5000)
            await asyncio.sleep(2)
        except Exception:
            logger.debug("No checkbox found or already clicked")

        # Find the challenge frame
        challenge_frame = None
        for frame in page.frames:
            if "recaptcha" in frame.url and "bframe" in frame.url:
                challenge_frame = frame
                break

        if not challenge_frame:
            return True

        # Switch to audio challenge
        try:
            audio_btn = challenge_frame.locator("#recaptcha-audio-button")
            await audio_btn.click(timeout=5000)
            await asyncio.sleep(2)
        except Exception:
            logger.warning("Could not switch to audio challenge — skipping")
            return False

        # Get the audio source URL
        try:
            audio_source = challenge_frame.locator("#audio-source")
            audio_url = await audio_source.get_attribute("src", timeout=5000)
            if not audio_url:
                logger.warning("No audio source URL found — skipping")
                return False
        except Exception:
            logger.warning("Could not find audio source element — skipping")
            return False

        # Download the audio file
        audio_path = None
        try:
            import httpx
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(audio_url)
                if resp.status_code != 200:
                    logger.warning("Failed to download audio: HTTP %d — skipping", resp.status_code)
                    return False

                with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
                    tmp.write(resp.content)
                    audio_path = tmp.name
        except Exception as e:
            logger.warning("Failed to download CAPTCHA audio: %s — skipping", e)
            return False

        # Transcribe with Whisper (with timeout)
        try:
            loop = asyncio.get_event_loop()
            transcription = await asyncio.wait_for(
                loop.run_in_executor(None, _transcribe_audio, audio_path),
                timeout=30.0,  # 30 second timeout for Whisper
            )
        except asyncio.TimeoutError:
            logger.warning("Whisper transcription timed out after 30s — skipping")
            return False
        except Exception as e:
            logger.warning("Whisper transcription error: %s — skipping", e)
            return False
        finally:
            # Clean up temp file
            if audio_path:
                try:
                    os.unlink(audio_path)
                except Exception:
                    pass

        if not transcription:
            logger.warning("Whisper returned empty transcription — skipping")
            return False

        # Type the answer
        try:
            response_input = challenge_frame.locator("#audio-response")
            await response_input.fill(transcription)
            await asyncio.sleep(0.5)

            verify_btn = challenge_frame.locator("#recaptcha-verify-button")
            await verify_btn.click()
            await asyncio.sleep(3)
        except Exception as e:
            logger.warning("Failed to submit CAPTCHA answer: %s", e)
            return False

        # Check if solved
        try:
            for frame in page.frames:
                if "recaptcha" in frame.url and "anchor" in frame.url:
                    checked = await frame.locator(".recaptcha-checkbox-checked").count()
                    if checked > 0:
                        logger.info("reCAPTCHA solved successfully!")
                        return True
        except Exception:
            pass

        logger.warning("CAPTCHA solve attempt completed but verification unclear")
        return False

    except Exception as e:
        logger.warning("CAPTCHA solver error: %s — skipping gracefully", e)
        return False


async def detect_captcha(page) -> bool:
    """Check if the current page has a CAPTCHA challenge.

    This is a lightweight detection function that does NOT attempt to solve
    anything. If CAPTCHA is detected, the caller should skip to an
    alternative method (e.g. Serper API).
    """
    try:
        for frame in page.frames:
            if "recaptcha" in frame.url or "google.com/recaptcha" in frame.url:
                return True

        html = await page.content()
        captcha_indicators = [
            "g-recaptcha",
            "recaptcha",
            "captcha-form",
            "unusual traffic",
            "not a robot",
            "verify you are human",
        ]
        html_lower = html.lower()
        return any(indicator in html_lower for indicator in captcha_indicators)
    except Exception:
        return False


def is_whisper_available() -> bool:
    """Check if Whisper is installed and loadable.

    Returns False gracefully if not installed — this is expected behavior.
    """
    try:
        import whisper  # noqa: F401
        return True
    except ImportError:
        return False
