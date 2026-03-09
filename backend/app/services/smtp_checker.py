"""SMTP Deliverability Checker — Check SPF, DKIM, DMARC records.
100% free, uses dnspython for DNS lookups.
"""
import asyncio
import logging
from functools import lru_cache
from typing import Optional

logger = logging.getLogger(__name__)


@lru_cache(maxsize=500)
def _check_spf_sync(domain: str) -> dict:
    """Check SPF record for a domain."""
    try:
        import dns.resolver
        answers = dns.resolver.resolve(domain, 'TXT', lifetime=5)
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if txt.startswith('v=spf1'):
                return {
                    "exists": True,
                    "record": txt,
                    "valid": True,
                }
        return {"exists": False, "record": "", "valid": False}
    except Exception:
        return {"exists": False, "record": "", "valid": False}


@lru_cache(maxsize=500)
def _check_dkim_sync(domain: str, selector: str = "default") -> dict:
    """Check DKIM record for a domain."""
    try:
        import dns.resolver
        dkim_domain = f"{selector}._domainkey.{domain}"
        answers = dns.resolver.resolve(dkim_domain, 'TXT', lifetime=5)
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if 'v=DKIM1' in txt or 'p=' in txt:
                return {
                    "exists": True,
                    "record": txt[:100],
                    "selector": selector,
                    "valid": True,
                }
        return {"exists": False, "record": "", "selector": selector, "valid": False}
    except Exception:
        return {"exists": False, "record": "", "selector": selector, "valid": False}


@lru_cache(maxsize=500)
def _check_dmarc_sync(domain: str) -> dict:
    """Check DMARC record for a domain."""
    try:
        import dns.resolver
        dmarc_domain = f"_dmarc.{domain}"
        answers = dns.resolver.resolve(dmarc_domain, 'TXT', lifetime=5)
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if txt.startswith('v=DMARC1'):
                # Parse policy
                policy = "none"
                if "p=reject" in txt:
                    policy = "reject"
                elif "p=quarantine" in txt:
                    policy = "quarantine"
                elif "p=none" in txt:
                    policy = "none"

                return {
                    "exists": True,
                    "record": txt,
                    "policy": policy,
                    "valid": True,
                }
        return {"exists": False, "record": "", "policy": "none", "valid": False}
    except Exception:
        return {"exists": False, "record": "", "policy": "none", "valid": False}


async def check_email_deliverability(domain: str) -> dict:
    """
    Check email deliverability for a domain by verifying SPF, DKIM, and DMARC.
    Returns comprehensive deliverability report.
    """
    loop = asyncio.get_event_loop()

    spf = await loop.run_in_executor(None, _check_spf_sync, domain)
    dkim_default = await loop.run_in_executor(None, _check_dkim_sync, domain, "default")
    dkim_google = await loop.run_in_executor(None, _check_dkim_sync, domain, "google")
    dmarc = await loop.run_in_executor(None, _check_dmarc_sync, domain)

    # Use whichever DKIM selector was found
    dkim = dkim_google if dkim_google["exists"] else dkim_default

    # Calculate deliverability score
    score = 0
    issues: list[str] = []
    recommendations: list[str] = []

    if spf["exists"]:
        score += 35
    else:
        issues.append("No SPF record found")
        recommendations.append("Add an SPF record to your DNS to authenticate email senders")

    if dkim["exists"]:
        score += 35
    else:
        issues.append("No DKIM record found")
        recommendations.append("Set up DKIM signing for your domain to prove email authenticity")

    if dmarc["exists"]:
        score += 30
        if dmarc["policy"] == "none":
            score -= 10
            recommendations.append("Upgrade DMARC policy from 'none' to 'quarantine' or 'reject' for better protection")
    else:
        issues.append("No DMARC record found")
        recommendations.append("Add a DMARC record to instruct receivers how to handle unauthenticated email")

    # Determine rating
    if score >= 80:
        rating = "excellent"
        summary = "Your email authentication is well-configured. Emails should reach inboxes."
    elif score >= 60:
        rating = "good"
        summary = "Email authentication is partially set up. Some emails may go to spam."
    elif score >= 30:
        rating = "fair"
        summary = "Email authentication needs improvement. Many emails may go to spam."
    else:
        rating = "poor"
        summary = "Email authentication is missing. Emails will likely go to spam."

    return {
        "domain": domain,
        "score": score,
        "rating": rating,
        "summary": summary,
        "spf": spf,
        "dkim": dkim,
        "dmarc": dmarc,
        "issues": issues,
        "recommendations": recommendations,
    }


async def check_sender_domain(email: str) -> dict:
    """Check deliverability for the sender's email domain."""
    if not email or "@" not in email:
        return {"error": "Invalid email address"}

    domain = email.split("@")[-1].lower()
    return await check_email_deliverability(domain)
