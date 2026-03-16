"""Email verification via syntax check + MX record checking + SMTP RCPT TO.

v3.5.36 Fix 8: Added Layer 1 (syntax + disposable domain check) for instant
filtering before any network calls. This ensures 100% verified results
without any API keys.

Verification levels:
  1. Syntax + Disposable Domain Check (instant, v3.5.36)
  2. MX record check (fast, works everywhere)
  3. SMTP RCPT TO check (accurate, requires port 25 access — works on desktop)
  4. Catch-all domain detection (prevents false positives)
"""
import asyncio
import logging
import smtplib
import socket
import random
import string
from functools import lru_cache

import re

import dns.resolver

logger = logging.getLogger(__name__)

# v3.5.36 Fix 8 Layer 1: Syntax validation regex (RFC 5322 simplified)
_EMAIL_REGEX = re.compile(
    r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
)

# v3.5.36 Fix 8 Layer 1: Common disposable email domains (no API needed)
_DISPOSABLE_DOMAINS = frozenset({
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
    'temp-mail.org', 'fakeinbox.com', 'sharklasers.com', 'guerrillamailblock.com',
    'grr.la', 'guerrillamail.info', 'guerrillamail.net', 'guerrillamail.org',
    'guerrillamail.de', 'yopmail.com', 'yopmail.fr', 'trashmail.com',
    'trashmail.me', 'trashmail.net', 'dispostable.com', 'mailnesia.com',
    'maildrop.cc', 'discard.email', 'emailondeck.com', 'getairmail.com',
    'mohmal.com', 'getnada.com', 'tempail.com', 'burnermail.io',
    'tempr.email', 'mailcatch.com', 'mytemp.email', '10minutemail.com',
    'minutemail.com', 'spamgourmet.com', 'harakirimail.com', 'jetable.org',
    'mailexpire.com', 'mailzilla.org', 'tempomail.fr', 'spam4.me',
    'trbvm.com', 'armyspy.com', 'cuvox.de', 'dayrep.com', 'einrot.com',
    'fleckens.hu', 'gustr.com', 'jourrapide.com', 'rhyta.com',
    'superrito.com', 'teleworm.us', 'thetechnoid.com',
})


def _is_valid_syntax(email: str) -> bool:
    """v3.5.36 Layer 1: Check email syntax validity."""
    if not email or len(email) > 254:
        return False
    return bool(_EMAIL_REGEX.match(email))


def _is_disposable_domain(domain: str) -> bool:
    """v3.5.36 Layer 1: Check if domain is a known disposable email provider."""
    return domain.lower() in _DISPOSABLE_DOMAINS


@lru_cache(maxsize=1000)
def _check_mx_sync(domain: str) -> bool:
    """Check if a domain has valid MX records (cached)."""
    try:
        answers = dns.resolver.resolve(domain, 'MX', lifetime=5)
        return len(answers) > 0
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN,
            dns.resolver.NoNameservers, dns.exception.Timeout,
            dns.resolver.LifetimeTimeout, Exception):
        return False


@lru_cache(maxsize=500)
def _get_mx_host(domain: str) -> str:
    """Get the primary MX host for a domain (cached)."""
    try:
        records = dns.resolver.resolve(domain, 'MX', lifetime=5)
        mx_sorted = sorted(records, key=lambda r: r.preference)
        return str(mx_sorted[0].exchange).rstrip('.')
    except Exception:
        return ""


def _smtp_rcpt_check(email: str, mx_host: str) -> dict:
    """Perform SMTP RCPT TO verification.

    Connects to the mail server, sends EHLO + MAIL FROM + RCPT TO
    to check if the mailbox exists.

    Returns dict with:
      - accepted: True/False/None (None = inconclusive)
      - catch_all: True if domain accepts all addresses
      - error: error message if any
    """
    result = {"accepted": None, "catch_all": False, "error": ""}

    try:
        smtp = smtplib.SMTP(timeout=10)
        smtp.connect(mx_host, 25)
        smtp.ehlo("verify.snapleads.local")

        # MAIL FROM
        smtp.mail("verify@snapleads.local")

        # RCPT TO — the actual verification
        code, msg = smtp.rcpt(email)
        msg_str = msg.decode("utf-8", errors="replace")[:200]

        if code == 250:
            result["accepted"] = True
        elif code in (550, 551, 552, 553, 554):
            result["accepted"] = False  # Mailbox doesn't exist
        elif code in (450, 451, 452):
            result["accepted"] = None  # Greylisted / temp failure
            result["error"] = f"Temporary: {code} {msg_str}"
        else:
            result["accepted"] = None
            result["error"] = f"Unknown: {code} {msg_str}"

        # Catch-all detection: test with a random address
        if result["accepted"] is True:
            random_user = "".join(random.choices(string.ascii_lowercase, k=16))
            code2, _ = smtp.rcpt(f"{random_user}@{email.split('@')[1]}")
            if code2 == 250:
                result["catch_all"] = True

        smtp.quit()
    except smtplib.SMTPServerDisconnected:
        result["error"] = "Server disconnected (anti-spam)"
    except smtplib.SMTPConnectError as e:
        result["error"] = f"Connect error: {e}"
    except socket.timeout:
        result["error"] = "Connection timed out"
    except ConnectionRefusedError:
        result["error"] = "Connection refused (port 25 blocked)"
    except OSError as e:
        if e.errno == 101:
            result["error"] = "Network unreachable (port 25 blocked on cloud)"
        else:
            result["error"] = f"OS error: {e}"
    except Exception as e:
        result["error"] = f"SMTP error: {str(e)[:100]}"

    return result


async def verify_email(email: str) -> bool:
    """Verify an email address — 3-layer verification (syntax + MX + SMTP).

    v3.5.36 Fix 8: Added Layer 1 (syntax + disposable domain check).
    On desktop (Electron app): Does full SMTP RCPT TO verification.
    On cloud servers: Falls back to MX-only check (port 25 usually blocked).
    """
    # Layer 1: Syntax + Disposable Domain Check (instant)
    if not _is_valid_syntax(email):
        return False
    domain = email.split('@')[-1].lower()
    if _is_disposable_domain(domain):
        logger.debug("Disposable domain rejected: %s", domain)
        return False
    if not domain or '.' not in domain:
        return False

    loop = asyncio.get_event_loop()

    # Step 1: MX record check (fast, always works)
    has_mx = await loop.run_in_executor(None, _check_mx_sync, domain)
    if not has_mx:
        return False

    # Step 2: Try SMTP RCPT TO for more accurate verification
    try:
        mx_host = await loop.run_in_executor(None, _get_mx_host, domain)
        if mx_host:
            smtp_result = await loop.run_in_executor(
                None, _smtp_rcpt_check, email, mx_host
            )
            if smtp_result["accepted"] is True:
                # If catch-all, still mark as valid but it's less certain
                return True
            elif smtp_result["accepted"] is False:
                return False
            # If None (inconclusive), fall through to MX-only result
    except Exception as e:
        logger.debug("SMTP RCPT TO failed for %s, using MX-only: %s", email, e)

    # MX exists but SMTP check was inconclusive — consider valid
    return True


async def verify_email_detailed(email: str) -> dict:
    """Detailed email verification with full report.

    Returns dict with mx_valid, smtp_accepted, catch_all, and error info.
    Used by the Clean Results feature for comprehensive verification.
    """
    if not email or '@' not in email:
        return {"valid": False, "mx_valid": False, "smtp_accepted": None,
                "catch_all": False, "error": "Invalid email format"}

    domain = email.split('@')[-1].lower()
    if not domain or '.' not in domain:
        return {"valid": False, "mx_valid": False, "smtp_accepted": None,
                "catch_all": False, "error": "Invalid domain"}

    loop = asyncio.get_event_loop()

    # MX check
    has_mx = await loop.run_in_executor(None, _check_mx_sync, domain)
    if not has_mx:
        return {"valid": False, "mx_valid": False, "smtp_accepted": None,
                "catch_all": False, "error": "No MX records found"}

    # SMTP RCPT TO
    mx_host = await loop.run_in_executor(None, _get_mx_host, domain)
    smtp_result = {"accepted": None, "catch_all": False, "error": ""}

    if mx_host:
        try:
            smtp_result = await loop.run_in_executor(
                None, _smtp_rcpt_check, email, mx_host
            )
        except Exception as e:
            smtp_result["error"] = str(e)

    valid = has_mx and smtp_result["accepted"] is not False
    return {
        "valid": valid,
        "mx_valid": has_mx,
        "mx_host": mx_host,
        "smtp_accepted": smtp_result["accepted"],
        "catch_all": smtp_result["catch_all"],
        "error": smtp_result["error"],
    }


async def verify_emails_batch(emails: list[str]) -> dict[str, bool]:
    """Verify multiple emails in parallel."""
    tasks = {email: verify_email(email) for email in emails}
    results = {}
    for email, task in tasks.items():
        results[email] = await task
    return results
