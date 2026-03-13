"""Website email finder - crawls websites for contact information."""
import asyncio
import re
import logging
from typing import Optional
from urllib.parse import urljoin, urlparse

logger = logging.getLogger(__name__)

EMAIL_PATTERN = re.compile(
    r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b'
)

# v3.5.9: Tightened phone regex — requires separators or tel:/+ prefix to avoid
# matching tracking IDs, timestamps, CSS values, and other garbage digit strings.
# Real phones have digit groups separated by spaces, dashes, dots, or parens.
PHONE_PATTERN = re.compile(
    r'(?:\+\d{1,3}[\s\-.]?)?'
    r'\(?\d{2,4}\)?'
    r'[\s\-.]+'
    r'\d{3,4}'
    r'[\s\-.]+'
    r'\d{3,4}'
)

# Pages most likely to contain contact info
CONTACT_PATHS = [
    '/contact', '/contact-us', '/about', '/about-us',
    '/team', '/our-team', '/people', '/staff',
    '/support', '/help', '/reach-us', '/get-in-touch',
    '/impressum', '/legal',
]

# Patterns to filter out false positive emails
FALSE_POSITIVE_PATTERNS = [
    r'.*@example\.com$',
    r'.*@test\.com$',
    r'.*@localhost$',
    r'.*\.(png|jpg|gif|svg|css|js|woff|ttf|ico)$',
    r'.*@.*\.wixpress\.com$',
    r'noreply@.*',
    r'no-reply@.*',
    r'mailer-daemon@.*',
    r'.*@sentry\.io$',
    r'.*@webpack\.js\.org$',
]

FALSE_POSITIVE_COMPILED = [re.compile(p, re.IGNORECASE) for p in FALSE_POSITIVE_PATTERNS]


def _is_valid_email(email: str) -> bool:
    """Check if email is valid and not a false positive."""
    email_lower = email.lower()
    for pattern in FALSE_POSITIVE_COMPILED:
        if pattern.match(email_lower):
            return False
    # Must have a valid TLD
    parts = email_lower.split('@')
    if len(parts) != 2:
        return False
    domain = parts[1]
    if '.' not in domain:
        return False
    tld = domain.split('.')[-1]
    if len(tld) < 2 or len(tld) > 10:
        return False
    return True


def _extract_emails_from_html(html: str) -> list[str]:
    """Extract emails from HTML content."""
    # Check mailto links first
    mailto_pattern = re.compile(r'mailto:([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})')
    emails = set(mailto_pattern.findall(html))

    # Then check plain text
    emails.update(EMAIL_PATTERN.findall(html))

    # Filter
    valid = [e for e in emails if _is_valid_email(e)]
    return list(set(valid))


# v3.5.9: patterns that look like phones but aren't (tracking IDs, hex, timestamps)
# v3.5.9-R2: single-line alternation to avoid implicit concatenation issues
# Only reject 13+ unbroken digits (10-12 can be valid phones like US 1234567890)
_PHONE_FALSE_POSITIVE = re.compile(
    r'^\d{13,}$|^0x[0-9a-fA-F]+|^\d{4}[01]\d[0-3]\d'
)

# v3.5.9-R2: pre-compiled regex for phone extraction (moved from inside function)
_RE_TEL_LINK = re.compile(r'tel:([+\d\-\(\)\s]+)')
_RE_SCHEMA_PHONE = re.compile(r'"telephone"\s*:\s*"([^"]+)"')
_RE_ITEMPROP_PHONE = re.compile(r'itemprop="telephone"[^>]*>([^<]+)<')


def _is_valid_phone(raw: str) -> bool:
    """v3.5.9: Validate a phone candidate is a real phone number."""
    cleaned = re.sub(r'[^\d+]', '', raw)
    if len(cleaned) < 7 or len(cleaned) > 15:
        return False
    # Reject if it matches known false-positive patterns (13+ digits, hex, dates)
    if _PHONE_FALSE_POSITIVE.match(cleaned.lstrip('+')):
        return False
    return True


def _extract_phones_from_html(html: str) -> list[str]:
    """Extract phone numbers from HTML content.

    v3.5.9: Prioritizes tel: links (most reliable), then structured data,
    then regex with strict validation to reject garbage digit strings.
    """
    phones: set[str] = set()
    seen_cleaned: set[str] = set()

    def _add_phone(raw: str) -> None:
        cleaned = re.sub(r'[^\d+]', '', raw)
        if cleaned not in seen_cleaned and _is_valid_phone(raw):
            seen_cleaned.add(cleaned)
            phones.add(raw.strip())

    # Priority 1: tel: links (most reliable — website explicitly marks as phone)
    for match in _RE_TEL_LINK.findall(html):
        _add_phone(match)

    # Priority 2: Schema.org / JSON-LD telephone fields
    for match in _RE_SCHEMA_PHONE.findall(html):
        _add_phone(match)

    # Priority 3: itemprop="telephone" in HTML
    for match in _RE_ITEMPROP_PHONE.findall(html):
        _add_phone(match)

    # Priority 4: Regex fallback (with strict validation)
    for phone in PHONE_PATTERN.findall(html):
        _add_phone(phone)

    return list(phones)


async def scrape_website_for_emails(
    url: str,
    max_pages: int = 5,
    timeout: int = 10,
) -> list[str]:
    """
    Crawl a website and extract email addresses.
    Checks the main page + common contact pages.
    100% free - uses httpx (no API needed).
    """
    import httpx

    all_emails: set[str] = set()
    visited: set[str] = set()

    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=timeout,
        headers=headers,
        verify=False,
    ) as client:
        # Build list of URLs to check
        urls_to_check = [url]
        for path in CONTACT_PATHS:
            full_url = urljoin(base_url, path)
            if full_url not in urls_to_check:
                urls_to_check.append(full_url)

        pages_checked = 0
        for check_url in urls_to_check:
            if pages_checked >= max_pages:
                break
            if check_url in visited:
                continue
            visited.add(check_url)

            try:
                response = await client.get(check_url)
                if response.status_code == 200:
                    html = response.text
                    emails = _extract_emails_from_html(html)
                    all_emails.update(emails)
                    pages_checked += 1
            except Exception as e:
                logger.debug(f"Failed to fetch {check_url}: {e}")
                continue

            # Small delay between requests
            await asyncio.sleep(0.5)

    return list(all_emails)


async def scrape_website_for_contacts(
    url: str,
    max_pages: int = 5,
    timeout: int = 10,
) -> dict:
    """
    Crawl a website and extract all contact information.
    Returns dict with emails, phones, and social links.
    """
    import httpx

    all_emails: set[str] = set()
    all_phones: set[str] = set()
    visited: set[str] = set()

    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
    }

    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=timeout,
        headers=headers,
        verify=False,
    ) as client:
        urls_to_check = [url]
        for path in CONTACT_PATHS:
            full_url = urljoin(base_url, path)
            if full_url not in urls_to_check:
                urls_to_check.append(full_url)

        pages_checked = 0
        for check_url in urls_to_check:
            if pages_checked >= max_pages:
                break
            if check_url in visited:
                continue
            visited.add(check_url)

            try:
                response = await client.get(check_url)
                if response.status_code == 200:
                    html = response.text
                    all_emails.update(_extract_emails_from_html(html))
                    all_phones.update(_extract_phones_from_html(html))
                    pages_checked += 1
            except Exception:
                continue

            await asyncio.sleep(0.5)

    return {
        "emails": list(all_emails),
        "phones": list(all_phones),
        "url": url,
    }
