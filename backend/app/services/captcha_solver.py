"""Whisper-based CAPTCHA solver — solves reCAPTCHA audio challenges locally.

Uses OpenAI's Whisper model (MIT license, runs 100% offline) to transcribe
reCAPTCHA audio challenges. Zero API cost, ~95% accuracy.

Flow:
  1. Detect reCAPTCHA iframe on page
  2. Click checkbox → if challenge appears, switch to audio
  3. Download MP3 audio challenge
  4. Transcribe with Whisper (local model)
  5. Submit transcription text
  6. Verify success

Requirements:
  - pip install openai-whisper
  - First run downloads ~140MB model (cached after that)
"""

import asyncio
import logging
import tempfile
import os
from typing import Optional

logger = logging.getLogger(__name__)

# Lazy-loaded Whisper model
_whisper_model = None


def _load_whisper_model(model_name: str = "base"):
    """Load Whisper model (lazy, cached after first load)."""
    global _whisper_model
    if _whisper_model is not None:
        return _whisper_model

    try:
        import whisper
        logger.info("Loading Whisper '%s' model...", model_name)
        _whisper_model = whisper.load_model(model_name)
        logger.info("Whisper model loaded successfully")
        return _whisper_model
    except ImportError:
        logger.error("openai-whisper not installed. Run: pip install openai-whisper")
        return None
    except Exception as e:
        logger.error("Failed to load Whisper model: %s", e)
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
    """Attempt to solve a reCAPTCHA on the given Patchright page.

    Args:
        page: A Patchright page instance.

    Returns:
        True if CAPTCHA was solved, False otherwise.
    """
    try:
        # Check if reCAPTCHA iframe exists
        recaptcha_frame = None
        for frame in page.frames:
            if "recaptcha" in frame.url or "google.com/recaptcha" in frame.url:
                recaptcha_frame = frame
                break

        if not recaptcha_frame:
            # No CAPTCHA found — page is clean
            return True

        logger.info("reCAPTCHA detected, attempting audio solve...")

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
            # Checkbox click might have solved it (no challenge)
            return True

        # Switch to audio challenge
        try:
            audio_btn = challenge_frame.locator("#recaptcha-audio-button")
            await audio_btn.click(timeout=5000)
            await asyncio.sleep(2)
        except Exception:
            logger.warning("Could not switch to audio challenge")
            return False

        # Get the audio source URL
        try:
            audio_source = challenge_frame.locator("#audio-source")
            audio_url = await audio_source.get_attribute("src", timeout=5000)
            if not audio_url:
                logger.warning("No audio source URL found")
                return False
        except Exception:
            logger.warning("Could not find audio source element")
            return False

        # Download the audio file
        try:
            import httpx
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(audio_url)
                if resp.status_code != 200:
                    logger.warning("Failed to download audio: HTTP %d", resp.status_code)
                    return False

                with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
                    tmp.write(resp.content)
                    audio_path = tmp.name
        except Exception as e:
            logger.warning("Failed to download CAPTCHA audio: %s", e)
            return False

        # Transcribe with Whisper
        try:
            loop = asyncio.get_event_loop()
            transcription = await loop.run_in_executor(None, _transcribe_audio, audio_path)
        finally:
            # Clean up temp file
            try:
                os.unlink(audio_path)
            except Exception:
                pass

        if not transcription:
            logger.warning("Whisper returned empty transcription")
            return False

        # Type the answer
        try:
            response_input = challenge_frame.locator("#audio-response")
            await response_input.fill(transcription)
            await asyncio.sleep(0.5)

            # Click verify
            verify_btn = challenge_frame.locator("#recaptcha-verify-button")
            await verify_btn.click()
            await asyncio.sleep(3)
        except Exception as e:
            logger.warning("Failed to submit CAPTCHA answer: %s", e)
            return False

        # Check if solved
        try:
            # Check if the challenge frame is gone or has success state
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
        logger.error("CAPTCHA solver error: %s", e)
        return False


async def detect_captcha(page) -> bool:
    """Check if the current page has a CAPTCHA challenge."""
    try:
        for frame in page.frames:
            if "recaptcha" in frame.url or "google.com/recaptcha" in frame.url:
                return True

        # Also check for common CAPTCHA indicators in page content
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
    """Check if Whisper is installed and loadable."""
    try:
        import whisper  # noqa: F401
        return True
    except ImportError:
        return False
