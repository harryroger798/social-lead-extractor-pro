"""Pinterest extraction — RSS feeds + profile page bio scraping.

Pinterest exposes public RSS feeds for user profiles and boards.
These return structured XML with pin titles, descriptions, and links.

Additionally, profile pages contain bio/about text that often includes
email addresses, phone numbers, and website links for businesses.

Endpoint: https://www.pinterest.com/{username}/feed.rss
Profile: https://www.pinterest.com/{username}/
Returns: Up to 25 pins per feed + profile bio contact data.

100% FREE | No auth needed | Structured data.
"""
import asyncio
import json
import logging
import re
import requests
import xml.etree.ElementTree as ET
from typing import Optional

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
}


def _fetch_pinterest_rss(username: str) -> list[dict]:
    """Fetch RSS feed for a Pinterest user/board.

    Returns list of dicts with title, description, link for each pin.
    """
    url = f"https://www.pinterest.com/{username}/feed.rss"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            logger.debug("Pinterest RSS returned %d for %s", resp.status_code, username)
            return []

        if "<?xml" not in resp.text[:200] and "<rss" not in resp.text[:200]:
            logger.debug("Pinterest RSS for %s is not XML", username)
            return []

        root = ET.fromstring(resp.text)
        items = []
        for item in root.findall(".//item"):
            title = item.findtext("title", "")
            description = item.findtext("description", "")
            link = item.findtext("link", "")
            # Strip HTML from description
            clean_desc = re.sub(r"<[^>]+>", " ", description)
            clean_desc = re.sub(r"\s+", " ", clean_desc).strip()
            items.append({
                "title": title,
                "description": clean_desc,
                "link": link,
            })
        return items

    except ET.ParseError:
        logger.debug("Pinterest RSS XML parse error for %s", username)
        return []
    except Exception as e:
        logger.debug("Pinterest RSS error for %s: %s", username, e)
        return []


def _fetch_pinterest_profile_bio(username: str) -> dict:
    """Scrape a Pinterest profile page for bio/about contact info.

    Pinterest embeds user profile data as serialized JSON inside <script> tags.
    We extract key fields (full_name, about, website_url) via regex patterns
    that match the JSON structure in the embedded scripts.

    Returns dict with: name, bio, website, emails, phones.
    """
    url = f"https://www.pinterest.com/{username}/"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            logger.debug("Pinterest profile returned %d for %s", resp.status_code, username)
            return {}

        html = resp.text
        name = ""
        bio = ""
        website = ""
        all_text_parts: list[str] = []

        # Extract fields from embedded JSON in script tags via regex
        # These patterns match Pinterest's serialized user data
        name_match = re.search(r'"full_name":"((?:[^"\\]|\\.)*)"', html)
        if name_match:
            name = name_match.group(1)

        about_match = re.search(r'"about":"((?:[^"\\]|\\.)*)"', html)
        if about_match:
            bio = about_match.group(1)
            all_text_parts.append(bio)

        website_match = re.search(r'"website_url":"((?:[^"\\]|\\.)*)"', html)
        if website_match:
            raw_url = website_match.group(1)
            if "pinterest.com" not in raw_url:
                website = raw_url

        domain_match = re.search(r'"domain_url":"((?:[^"\\]|\\.)*)"', html)
        if domain_match and not website:
            domain = domain_match.group(1)
            if "pinterest.com" not in domain:
                website = f"https://{domain}" if not domain.startswith("http") else domain

        # Also check meta description as fallback
        desc_match = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', html)
        if desc_match:
            all_text_parts.append(desc_match.group(1))

        og_desc = re.search(r'<meta\s+property="og:description"\s+content="([^"]+)"', html)
        if og_desc:
            all_text_parts.append(og_desc.group(1))

        # Combine all text and extract emails/phones
        combined_text = " ".join(all_text_parts)
        emails = extract_emails(combined_text) if combined_text else []
        phones = extract_phones(combined_text) if combined_text else []

        if not name and not bio and not emails and not phones and not website:
            return {}

        return {
            "username": username,
            "name": name,
            "bio": bio,
            "website": website,
            "emails": emails,
            "phones": phones,
        }

    except Exception as e:
        logger.debug("Pinterest profile scrape error for %s: %s", username, e)
        return {}


async def extract_pinterest_rss(
    keyword: str,
    max_results: int = 25,
) -> list[dict]:
    """Extract leads from Pinterest RSS feeds + profile bio for a keyword.

    Strategy:
    1. Generate potential Pinterest usernames/boards from keyword
    2. Scrape profile pages for bio/about contact info (emails, phones, websites)
    3. Fetch RSS feeds and extract emails/phones from pin descriptions

    Returns list of lead dicts.
    """
    leads: list[dict] = []
    loop = asyncio.get_event_loop()

    # Generate potential usernames from keyword
    keyword_clean = re.sub(r"[^a-zA-Z0-9 ]", "", keyword).strip()
    potential_feeds = [
        keyword_clean.replace(" ", ""),
        keyword_clean.replace(" ", "-"),
        keyword_clean.replace(" ", "_"),
    ]

    for feed_name in potential_feeds:
        if len(leads) >= max_results:
            break

        try:
            # First: scrape profile page for bio contact info
            profile = await loop.run_in_executor(None, _fetch_pinterest_profile_bio, feed_name)
            if profile:
                profile_url = f"https://www.pinterest.com/{feed_name}/"
                profile_name = profile.get("name", "")

                for email in profile.get("emails", []):
                    leads.append({
                        "email": email, "phone": "",
                        "name": profile_name, "platform": "pinterest",
                        "source_url": profile_url,
                        "keyword": keyword,
                    })
                for phone in profile.get("phones", []):
                    leads.append({
                        "email": "", "phone": phone,
                        "name": profile_name, "platform": "pinterest",
                        "source_url": profile_url,
                        "keyword": keyword,
                    })
                # If profile has a website, add for bio link following
                website = profile.get("website", "")
                if website:
                    leads.append({
                        "email": "", "phone": "",
                        "name": profile_name, "platform": "pinterest",
                        "source_url": profile_url,
                        "keyword": keyword,
                        "bio_link": website,
                    })

            # Second: fetch RSS feed for pin content
            items = await loop.run_in_executor(None, _fetch_pinterest_rss, feed_name)

            for item in items:
                text = f"{item.get('title', '')} {item.get('description', '')}"
                emails = extract_emails(text)
                phones = extract_phones(text)

                for email in emails:
                    leads.append({
                        "email": email, "phone": "",
                        "name": "", "platform": "pinterest",
                        "source_url": item.get("link", ""),
                        "keyword": keyword,
                    })
                for phone in phones:
                    leads.append({
                        "email": "", "phone": phone,
                        "name": "", "platform": "pinterest",
                        "source_url": item.get("link", ""),
                        "keyword": keyword,
                    })

            await asyncio.sleep(0.5)
        except Exception as e:
            logger.debug("Pinterest extraction error for %s: %s", feed_name, e)

    return leads[:max_results]


async def enrich_pinterest_leads_with_rss(
    pinterest_urls: list[str],
) -> list[dict]:
    """Enrich existing Pinterest leads by fetching profile bio + RSS feeds.

    Takes Pinterest URLs found via dorking, extracts usernames,
    scrapes their profile pages for contact info and fetches RSS feeds.
    """
    leads: list[dict] = []
    loop = asyncio.get_event_loop()

    # Extract usernames from URLs
    usernames: list[str] = []
    for url in pinterest_urls:
        match = re.search(r"pinterest\.com/([A-Za-z0-9_-]+)", url)
        if match:
            username = match.group(1)
            if username.lower() not in ("pin", "search", "ideas", "today", "settings"):
                usernames.append(username)

    # Deduplicate
    usernames = list(dict.fromkeys(usernames))

    for username in usernames[:20]:
        try:
            # First: scrape profile page for bio contact info
            profile = await loop.run_in_executor(None, _fetch_pinterest_profile_bio, username)
            if profile:
                profile_url = f"https://www.pinterest.com/{username}/"
                profile_name = profile.get("name", "")

                for email in profile.get("emails", []):
                    leads.append({
                        "email": email, "phone": "",
                        "name": profile_name, "platform": "pinterest",
                        "source_url": profile_url,
                        "keyword": "",
                    })
                for phone in profile.get("phones", []):
                    leads.append({
                        "email": "", "phone": phone,
                        "name": profile_name, "platform": "pinterest",
                        "source_url": profile_url,
                        "keyword": "",
                    })
                website = profile.get("website", "")
                if website:
                    leads.append({
                        "email": "", "phone": "",
                        "name": profile_name, "platform": "pinterest",
                        "source_url": profile_url,
                        "keyword": "",
                        "bio_link": website,
                    })

            # Second: fetch RSS feed for pin content
            items = await loop.run_in_executor(None, _fetch_pinterest_rss, username)

            for item in items:
                text = f"{item.get('title', '')} {item.get('description', '')}"
                emails = extract_emails(text)
                phones = extract_phones(text)

                for email in emails:
                    leads.append({
                        "email": email, "phone": "",
                        "name": "", "platform": "pinterest",
                        "source_url": item.get("link", ""),
                        "keyword": "",
                    })
                for phone in phones:
                    leads.append({
                        "email": "", "phone": phone,
                        "name": "", "platform": "pinterest",
                        "source_url": item.get("link", ""),
                        "keyword": "",
                    })

            await asyncio.sleep(0.3)
        except Exception as e:
            logger.debug("Pinterest enrich error for %s: %s", username, e)

    return leads
