"""Email verification via syntax check + MX record checking + SMTP RCPT TO.

v3.5.36 Fix 8: Added Layer 1 (syntax + disposable domain check) for instant
filtering before any network calls. This ensures 100% verified results
without any API keys.

v3.5.39: Added DNS-based confidence signals (SPF/DMARC/BIMI) and catch-all
false positive reduction by MX provider. Google Workspace / Microsoft 365
MX = rarely catch-all = upgrade confidence.

Verification levels:
  1. Syntax + Disposable Domain Check (instant, v3.5.36)
  2. MX record check (fast, works everywhere)
  3. SMTP RCPT TO check (accurate, requires port 25 access — works on desktop)
  4. Catch-all domain detection (prevents false positives)
  5. DNS confidence signals: SPF/DMARC/BIMI (v3.5.39)
  6. Catch-all MX provider scoring (v3.5.39)
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


# ---------------------------------------------------------------------------
# v3.5.39: DNS-based confidence signals (SPF/DMARC/BIMI)
# ---------------------------------------------------------------------------

# Known MX providers that rarely have catch-all enabled.
# When SMTP accepts all addresses (catch-all), score by MX provider
# to reduce false positives.
_TRUSTED_MX_PROVIDERS = {
    "google": {"aspmx.l.google.com", "alt1.aspmx.l.google.com",
               "alt2.aspmx.l.google.com", "gmail-smtp-in.l.google.com",
               "googlemail.com"},
    "microsoft": {"outlook-com.olc.protection.outlook.com",
                  "mail.protection.outlook.com"},
    "zoho": {"mx.zoho.com", "mx2.zoho.com", "mx3.zoho.com"},
}


def _identify_mx_provider(mx_host: str) -> str:
    """v3.5.39: Identify the email provider from MX hostname."""
    mx_lower = mx_host.lower()
    for provider, patterns in _TRUSTED_MX_PROVIDERS.items():
        for pattern in patterns:
            if mx_lower == pattern or mx_lower.endswith('.' + pattern):
                return provider
    if mx_lower.endswith('.google.com') or mx_lower.endswith('.gmail.com'):
        return "google"
    if mx_lower.endswith('.outlook.com') or mx_lower.endswith('.microsoft.com'):
        return "microsoft"
    return "unknown"


def _is_catch_all_trustworthy(mx_host: str) -> bool:
    """v3.5.39: Determine if catch-all on this MX provider is trustworthy.

    Google Workspace and Microsoft 365 rarely have catch-all enabled.
    If they accept all addresses, it's more likely a real mailbox.
    """
    provider = _identify_mx_provider(mx_host)
    return provider in ("google", "microsoft", "zoho")


@lru_cache(maxsize=500)
def _check_spf(domain: str) -> bool:
    """v3.5.39: Check if domain has SPF record (confirms email system exists)."""
    try:
        answers = dns.resolver.resolve(domain, 'TXT', lifetime=5)
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if txt.startswith('v=spf1'):
                return True
    except Exception:
        pass
    return False


@lru_cache(maxsize=500)
def _check_dmarc(domain: str) -> str:
    """v3.5.39: Check DMARC policy for domain.

    Returns: 'reject', 'quarantine', 'none', or '' (no DMARC).
    p=reject means company is serious about email = high confidence.
    """
    try:
        answers = dns.resolver.resolve(f'_dmarc.{domain}', 'TXT', lifetime=5)
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if 'v=DMARC1' in txt:
                if 'p=reject' in txt:
                    return 'reject'
                elif 'p=quarantine' in txt:
                    return 'quarantine'
                return 'none'
    except Exception:
        pass
    return ''


@lru_cache(maxsize=500)
def _check_bimi(domain: str) -> bool:
    """v3.5.39: Check if domain has BIMI record (strong email practices)."""
    try:
        answers = dns.resolver.resolve(f'default._bimi.{domain}', 'TXT', lifetime=5)
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if 'v=BIMI1' in txt:
                return True
    except Exception:
        pass
    return False


def dns_confidence_score(domain: str) -> dict:
    """v3.5.39: Calculate DNS-based confidence signals for a domain.

    Returns dict with individual signals and total confidence boost (0-25).
    All free DNS lookups, no API keys needed.
    """
    has_spf = _check_spf(domain)
    dmarc_policy = _check_dmarc(domain)
    has_bimi = _check_bimi(domain)

    confidence = 0
    signals: list[str] = []

    if has_spf:
        confidence += 5
        signals.append("SPF: +5")
    if dmarc_policy == 'reject':
        confidence += 10
        signals.append("DMARC reject: +10")
    elif dmarc_policy == 'quarantine':
        confidence += 5
        signals.append("DMARC quarantine: +5")
    elif dmarc_policy == 'none':
        confidence += 2
        signals.append("DMARC none: +2")
    if has_bimi:
        confidence += 10
        signals.append("BIMI: +10")

    return {
        "has_spf": has_spf,
        "dmarc_policy": dmarc_policy,
        "has_bimi": has_bimi,
        "confidence_boost": confidence,
        "signals": signals,
    }


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
                # v3.5.39: Catch-all false positive reduction by MX provider
                if smtp_result["catch_all"]:
                    if _is_catch_all_trustworthy(mx_host):
                        logger.debug(
                            "Catch-all on trusted provider %s — keeping %s",
                            _identify_mx_provider(mx_host), email,
                        )
                    else:
                        logger.debug(
                            "Catch-all on unknown provider for %s — treating as unverifiable",
                            email,
                        )
                        return False
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
    v3.5.36: Added Layer 1 checks to match verify_email() behavior.
    """
    # v3.5.36 Layer 1: Syntax + Disposable Domain Check (same as verify_email)
    _default_new_keys = {
        "mx_provider": None,
        "catch_all_trustworthy": False,
        "dns_confidence": {"has_spf": False, "dmarc_policy": "", "has_bimi": False, "confidence_boost": 0, "signals": []},
    }
    if not _is_valid_syntax(email):
        return {"valid": False, "mx_valid": False, "smtp_accepted": None,
                "catch_all": False, "error": "Invalid email syntax",
                **_default_new_keys}

    domain = email.split('@')[-1].lower()
    if not domain or '.' not in domain:
        return {"valid": False, "mx_valid": False, "smtp_accepted": None,
                "catch_all": False, "error": "Invalid domain",
                **_default_new_keys}
    if _is_disposable_domain(domain):
        return {"valid": False, "mx_valid": False, "smtp_accepted": None,
                "catch_all": False, "error": f"Disposable domain: {domain}",
                **_default_new_keys}

    loop = asyncio.get_event_loop()

    # MX check
    has_mx = await loop.run_in_executor(None, _check_mx_sync, domain)
    if not has_mx:
        return {"valid": False, "mx_valid": False, "smtp_accepted": None,
                "catch_all": False, "error": "No MX records found",
                **_default_new_keys}

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

    # v3.5.39: Catch-all on untrusted MX -> not valid
    if smtp_result["catch_all"] and mx_host and not _is_catch_all_trustworthy(mx_host):
        valid = False

    # v3.5.39: Add DNS confidence signals and catch-all provider info
    dns_conf = await loop.run_in_executor(None, dns_confidence_score, domain)
    mx_provider = _identify_mx_provider(mx_host) if mx_host else "unknown"
    catch_all_trusted = bool(
        smtp_result["catch_all"] and mx_host and _is_catch_all_trustworthy(mx_host)
    )

    return {
        "valid": valid,
        "mx_valid": has_mx,
        "mx_host": mx_host,
        "mx_provider": mx_provider,
        "smtp_accepted": smtp_result["accepted"],
        "catch_all": smtp_result["catch_all"],
        "catch_all_trustworthy": catch_all_trusted,
        "error": smtp_result["error"],
        "dns_confidence": dns_conf,
    }


async def verify_emails_batch(emails: list[str]) -> dict[str, bool]:
    """Verify multiple emails in parallel."""
    tasks = {email: verify_email(email) for email in emails}
    results = {}
    for email, task in tasks.items():
        results[email] = await task
    return results
