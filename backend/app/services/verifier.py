"""Email verification via MX record checking using dnspython."""
import dns.resolver
import asyncio
from functools import lru_cache


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


async def verify_email(email: str) -> bool:
    """Verify an email address by checking MX records for its domain."""
    if not email or '@' not in email:
        return False
    domain = email.split('@')[-1].lower()
    if not domain or '.' not in domain:
        return False
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _check_mx_sync, domain)


async def verify_emails_batch(emails: list[str]) -> dict[str, bool]:
    """Verify multiple emails in parallel."""
    tasks = {email: verify_email(email) for email in emails}
    results = {}
    for email, task in tasks.items():
        results[email] = await task
    return results
