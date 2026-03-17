"""v3.5.39: WHOIS/RDAP email extraction module.

Free data source for extracting contact emails from domain registration
records via the public RDAP protocol (RFC 7482). No API keys needed.

RDAP is the modern replacement for WHOIS with structured JSON responses.
We query the public RDAP bootstrap servers which redirect to the correct
registrar's RDAP endpoint.

Usage:
    from app.services.whois_rdap import extract_rdap_emails

    emails = await extract_rdap_emails("example.com")
    # Returns: ["admin@example.com", "tech@example.com"]
"""

from __future__ import annotations

import asyncio
import logging
import re
from functools import lru_cache

logger = logging.getLogger(__name__)

# RDAP bootstrap URL (maintained by IANA, always available)
_RDAP_BOOTSTRAP = "https://rdap.org/domain/{domain}"

# Fallback RDAP endpoints for common TLDs
_RDAP_FALLBACKS = {
    "com": "https://rdap.verisign.com/com/v1/domain/{domain}",
    "net": "https://rdap.verisign.com/net/v1/domain/{domain}",
    "org": "https://rdap.org/domain/{domain}",
}

# Email regex for extracting from RDAP responses
_EMAIL_RE = re.compile(
    r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE,
)

# Domains to exclude (privacy/proxy services, not real contacts)
_PRIVACY_DOMAINS = {
    "contactprivacy.com", "whoisguard.com", "privacyguardian.org",
    "domainsbyproxy.com", "withheldforprivacy.com", "redacted.email",
    "privacy.link", "whoisprivacyprotect.com", "identity-protect.org",
    "networksolutionsprivateregistration.com",
}


def _is_privacy_email(email: str) -> bool:
    """Check if an email belongs to a WHOIS privacy/proxy service."""
    domain = email.split("@")[-1].lower()
    return domain in _PRIVACY_DOMAINS


def _extract_emails_from_rdap(data: dict) -> list[str]:
    """Extract email addresses from RDAP JSON response.

    RDAP responses contain vcardArray entities with email addresses.
    Structure: entities[].vcardArray[1][] where type == "email"
    """
    emails: set[str] = set()

    # Method 1: Walk vcardArray in entities
    for entity in data.get("entities", []):
        vcard = entity.get("vcardArray", [])
        if len(vcard) >= 2 and isinstance(vcard[1], list):
            for prop in vcard[1]:
                if isinstance(prop, list) and len(prop) >= 4:
                    if prop[0] == "email":
                        email = str(prop[3]).strip().lower()
                        if "@" in email and not _is_privacy_email(email):
                            emails.add(email)

        # Recurse into nested entities (tech contact, admin contact, etc.)
        for sub_entity in entity.get("entities", []):
            sub_vcard = sub_entity.get("vcardArray", [])
            if len(sub_vcard) >= 2 and isinstance(sub_vcard[1], list):
                for prop in sub_vcard[1]:
                    if isinstance(prop, list) and len(prop) >= 4:
                        if prop[0] == "email":
                            email = str(prop[3]).strip().lower()
                            if "@" in email and not _is_privacy_email(email):
                                emails.add(email)

    # Method 2: Regex fallback on full JSON string
    # Some registrars put emails in remarks or notices
    if not emails:
        raw = str(data)
        for match in _EMAIL_RE.finditer(raw):
            email = match.group(0).lower()
            if not _is_privacy_email(email):
                emails.add(email)

    return sorted(emails)


async def extract_rdap_emails(domain: str, timeout: float = 10.0) -> list[str]:
    """Extract contact emails from a domain's RDAP record.

    Queries the public RDAP bootstrap server (rdap.org) which redirects
    to the correct registrar's RDAP endpoint. Falls back to TLD-specific
    endpoints if the bootstrap fails.

    Returns list of email addresses found (excluding privacy/proxy emails).
    """
    try:
        from app.services.anti_detection import ad_get
    except ImportError:
        logger.warning("anti_detection not available, skipping RDAP lookup")
        return []

    loop = asyncio.get_event_loop()

    # Try bootstrap URL first
    urls_to_try = [_RDAP_BOOTSTRAP.format(domain=domain)]

    # Add TLD-specific fallback
    tld = domain.rsplit(".", 1)[-1].lower() if "." in domain else ""
    if tld in _RDAP_FALLBACKS:
        urls_to_try.append(_RDAP_FALLBACKS[tld].format(domain=domain))

    for url in urls_to_try:
        try:
            resp = await loop.run_in_executor(
                None,
                lambda u=url: ad_get(
                    u,
                    timeout=timeout,
                    headers={"Accept": "application/rdap+json, application/json"},
                ),
            )
            if resp and resp.status_code == 200:
                data = resp.json()
                emails = _extract_emails_from_rdap(data)
                if emails:
                    logger.info(
                        "RDAP extracted %d emails for %s: %s",
                        len(emails), domain, emails,
                    )
                    return emails
        except Exception as e:
            logger.debug("RDAP lookup failed for %s via %s: %s", domain, url, e)
            continue

    return []


async def extract_rdap_emails_batch(
    domains: list[str],
    timeout: float = 10.0,
    max_concurrent: int = 5,
) -> dict[str, list[str]]:
    """Extract RDAP emails for multiple domains with concurrency limit.

    Returns dict mapping domain -> list of emails found.
    """
    semaphore = asyncio.Semaphore(max_concurrent)
    results: dict[str, list[str]] = {}

    async def _lookup(domain: str) -> None:
        async with semaphore:
            results[domain] = await extract_rdap_emails(domain, timeout=timeout)

    tasks = [_lookup(d) for d in domains]
    await asyncio.gather(*tasks, return_exceptions=True)
    return results
