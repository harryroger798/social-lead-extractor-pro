"""Bio link follower: extract emails/phones from profile link pages.

When a social media profile has a bio link (Linktree, Beacons, Carrd,
personal website, etc.), this module follows the link and extracts
contact information from the destination page.

This is one of the highest-yield lead discovery methods because:
  - Instagram/TikTok bios often link to Linktree pages with email
  - Twitter bios link to personal websites with /contact pages
  - YouTube descriptions link to business websites

All methods: 100% FREE | 100% NON-BAN | Public data only.
Uses simple HTTP requests (no browser needed).
"""

import logging
import re
import requests
from typing import Optional
from urllib.parse import urlparse

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

# Known bio link services that aggregate contact info
BIO_LINK_DOMAINS = {
    "linktr.ee",
    "linktree.com",
    "beacons.ai",
    "carrd.co",
    "bio.link",
    "lnk.bio",
    "tap.bio",
    "campsite.bio",
    "link.bio",
    "solo.to",
    "about.me",
    "bio.site",
    "heylink.me",
    "contactinbio.com",
    "milkshake.app",
    "withkoji.com",
    "stan.store",
}

# Contact page paths to check on websites
CONTACT_PATHS = [
    "/contact",
    "/contact-us",
    "/about",
    "/about-us",
    "/team",
    "/get-in-touch",
]

# Common request headers
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}


def _is_bio_link_service(url: str) -> bool:
    """Check if a URL is a known bio link aggregation service."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower().replace("www.", "")
        return domain in BIO_LINK_DOMAINS
    except Exception:
        return False


def _is_social_platform(url: str) -> bool:
    """Check if URL is a social media platform (skip these, we already scrape them)."""
    social_domains = {
        "linkedin.com", "facebook.com", "instagram.com", "twitter.com",
        "x.com", "youtube.com", "tiktok.com", "pinterest.com", "tumblr.com",
        "reddit.com", "t.me", "telegram.org", "wa.me", "whatsapp.com",
        "github.com", "medium.com",
    }
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower().replace("www.", "")
        return any(sd in domain for sd in social_domains)
    except Exception:
        return False


def _strip_html_tags(html: str) -> str:
    """Strip HTML/CSS/JS tags, keeping only visible text content.

    This prevents false positive phone/email extraction from CSS values,
    JavaScript code, and HTML attributes.
    """
    # Remove script and style blocks entirely
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', ' ', text, flags=re.DOTALL | re.IGNORECASE)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def fetch_page_text(url: str, timeout: int = 10) -> str:
    """Fetch a web page and return its visible text content (HTML stripped).

    Returns empty string on failure (graceful degradation).
    Strips HTML/CSS/JS to prevent false positive extraction from code.
    """
    try:
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=timeout,
            allow_redirects=True,
        )
        if response.status_code == 200:
            return _strip_html_tags(response.text)
    except Exception as e:
        logger.debug("Failed to fetch %s: %s", url, e)
    return ""


def _fetch_raw_html(url: str, timeout: int = 10) -> str:
    """Fetch raw HTML from a URL (not stripped). Used for link extraction."""
    try:
        response = requests.get(
            url, headers=HEADERS, timeout=timeout, allow_redirects=True,
        )
        if response.status_code == 200:
            return response.text
    except Exception as e:
        logger.debug("Failed to fetch raw %s: %s", url, e)
    return ""


def extract_from_bio_link(url: str) -> dict:
    """Extract emails and phones from a bio link page (Linktree, Beacons, etc.).

    Bio link pages are simple HTML pages that often contain:
      - Email addresses directly
      - Links to websites that have contact info
      - Phone numbers
    """
    raw_html = _fetch_raw_html(url)
    if not raw_html:
        return {"emails": [], "phones": [], "links": []}

    # Strip HTML for email/phone extraction (avoids false positives from CSS/JS)
    text = _strip_html_tags(raw_html)
    emails = extract_emails(text)
    phones = extract_phones(text)

    # Use raw HTML for link extraction (need href attributes)
    link_pattern = re.compile(r'href=["\']?(https?://[^"\'>\s]+)', re.IGNORECASE)
    outbound_links = []
    for match in link_pattern.finditer(raw_html):
        link = match.group(1)
        if not _is_social_platform(link) and not _is_bio_link_service(link):
            outbound_links.append(link)

    return {
        "emails": emails,
        "phones": phones,
        "links": outbound_links[:10],  # Limit to prevent excessive crawling
    }


def _extract_from_html(raw_html: str) -> tuple[list[str], list[str]]:
    """Extract emails and phones from HTML using both raw and stripped text.

    Searches raw HTML for mailto: links and structured data,
    then searches stripped text for visible emails/phones.
    This catches emails embedded in HTML attributes AND visible text.
    """
    emails: list[str] = []
    phones: list[str] = []

    # Extract from stripped visible text (avoids CSS/JS false positives for phones)
    stripped = _strip_html_tags(raw_html)
    emails.extend(extract_emails(stripped))
    phones.extend(extract_phones(stripped))

    # Also extract mailto: links from raw HTML (these are reliable)
    mailto_pattern = re.compile(
        r'mailto:([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})',
        re.IGNORECASE,
    )
    for match in mailto_pattern.finditer(raw_html):
        emails.append(match.group(1))

    # Also extract emails from raw HTML (catches emails in data attributes, etc.)
    raw_emails = extract_emails(raw_html)
    emails.extend(raw_emails)

    # Extract from structured data (JSON-LD / schema.org)
    jsonld_emails, jsonld_phones = _extract_structured_data(raw_html)
    emails.extend(jsonld_emails)
    phones.extend(jsonld_phones)

    # Deduplicate
    unique_emails = list(dict.fromkeys(e.lower() for e in emails))
    unique_phones = list(dict.fromkeys(phones))

    return unique_emails, unique_phones


def extract_from_website(url: str, check_contact_pages: bool = True) -> dict:
    """Extract emails and phones from a website, including its contact page.

    Steps:
      1. Fetch the main page → extract emails/phones from HTML + structured data
      2. Try /contact, /about pages → extract more emails/phones
    """
    all_emails: list[str] = []
    all_phones: list[str] = []

    # Step 1: Main page
    raw_html = _fetch_raw_html(url)
    if raw_html:
        page_emails, page_phones = _extract_from_html(raw_html)
        all_emails.extend(page_emails)
        all_phones.extend(page_phones)

    # Step 2: Contact/About pages
    if check_contact_pages:
        try:
            parsed = urlparse(url)
            base_url = f"{parsed.scheme}://{parsed.netloc}"
        except Exception:
            base_url = url.rstrip("/")

        for path in CONTACT_PATHS:
            contact_url = f"{base_url}{path}"
            contact_html = _fetch_raw_html(contact_url, timeout=5)
            if contact_html:
                page_emails, page_phones = _extract_from_html(contact_html)
                all_emails.extend(page_emails)
                all_phones.extend(page_phones)

    # Deduplicate
    unique_emails = list(dict.fromkeys(e.lower() for e in all_emails))
    unique_phones = list(dict.fromkeys(all_phones))

    return {
        "emails": unique_emails,
        "phones": unique_phones,
    }


def _extract_structured_data(html: str) -> tuple[list[str], list[str]]:
    """Extract emails and phones from JSON-LD / schema.org structured data.

    Many business websites embed structured data with contact info like:
      {"@type": "Organization", "email": "info@company.com", "telephone": "+1-555-0100"}
    """
    import json

    emails: list[str] = []
    phones: list[str] = []

    # Find all JSON-LD blocks
    jsonld_pattern = re.compile(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        re.DOTALL | re.IGNORECASE,
    )

    for match in jsonld_pattern.finditer(html):
        try:
            data = json.loads(match.group(1))
            _extract_from_jsonld(data, emails, phones)
        except (json.JSONDecodeError, Exception):
            continue

    return emails, phones


def _extract_from_jsonld(data: object, emails: list[str], phones: list[str]) -> None:
    """Recursively extract email/telephone from JSON-LD data."""
    if isinstance(data, dict):
        # Check for email fields
        for key in ("email", "Email", "contactEmail", "sameAs"):
            val = data.get(key)
            if isinstance(val, str) and "@" in val:
                extracted = extract_emails(val)
                emails.extend(extracted)

        # Check for phone fields
        for key in ("telephone", "phone", "Phone", "contactPoint"):
            val = data.get(key)
            if isinstance(val, str):
                extracted = extract_phones(val)
                phones.extend(extracted)
            elif isinstance(val, dict):
                _extract_from_jsonld(val, emails, phones)

        # Recurse into all values
        for val in data.values():
            if isinstance(val, (dict, list)):
                _extract_from_jsonld(val, emails, phones)

    elif isinstance(data, list):
        for item in data:
            _extract_from_jsonld(item, emails, phones)


def follow_bio_links(
    urls: list[str],
    max_links: int = 20,
    check_contact_pages: bool = True,
) -> dict:
    """Follow a batch of bio/website links and extract contact info.

    For each URL:
      - If it's a bio link service (Linktree, etc.) → extract emails + follow outbound links
      - If it's a website → extract from main page + /contact + /about pages
      - If it's a social platform → skip (we already scrape these)

    Args:
        urls: List of URLs to follow.
        max_links: Maximum number of links to process.
        check_contact_pages: Whether to also check /contact, /about pages.

    Returns:
        Dict with all extracted emails, phones, and processed URLs.
    """
    all_emails: list[str] = []
    all_phones: list[str] = []
    processed_urls: list[str] = []
    skipped_social: int = 0

    for url in urls[:max_links]:
        if not url or not url.startswith("http"):
            continue

        if _is_social_platform(url):
            skipped_social += 1
            continue

        processed_urls.append(url)

        if _is_bio_link_service(url):
            # Bio link page: extract directly and follow outbound links
            bio_result = extract_from_bio_link(url)
            all_emails.extend(bio_result.get("emails", []))
            all_phones.extend(bio_result.get("phones", []))

            # Follow outbound links from bio page (max 3 per bio)
            for outbound in bio_result.get("links", [])[:3]:
                if not _is_social_platform(outbound):
                    site_result = extract_from_website(outbound, check_contact_pages=False)
                    all_emails.extend(site_result.get("emails", []))
                    all_phones.extend(site_result.get("phones", []))
                    processed_urls.append(outbound)
        else:
            # Regular website: extract from page + contact pages
            site_result = extract_from_website(url, check_contact_pages=check_contact_pages)
            all_emails.extend(site_result.get("emails", []))
            all_phones.extend(site_result.get("phones", []))

    # Deduplicate
    unique_emails = list(dict.fromkeys(e.lower() for e in all_emails))
    unique_phones = list(dict.fromkeys(all_phones))

    return {
        "emails": unique_emails,
        "phones": unique_phones,
        "urls_processed": len(processed_urls),
        "urls_skipped_social": skipped_social,
        "processed_urls": processed_urls,
    }
