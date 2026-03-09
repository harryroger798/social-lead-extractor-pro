"""Pinterest RSS feed extraction — 100% free structured data.

Pinterest exposes public RSS feeds for user profiles and boards.
These return structured XML with pin titles, descriptions, and links.

Endpoint: https://www.pinterest.com/{username}/feed.rss
Returns: Up to 25 pins per feed in RSS/XML format.

100% FREE | No auth needed | Structured data.
"""
import asyncio
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


async def extract_pinterest_rss(
    keyword: str,
    max_results: int = 25,
) -> list[dict]:
    """Extract leads from Pinterest RSS feeds for a keyword.

    Strategy: Generate potential Pinterest usernames/boards from keyword,
    fetch their RSS feeds, and extract emails/phones from pin descriptions.

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
            logger.debug("Pinterest RSS extraction error for %s: %s", feed_name, e)

    return leads[:max_results]


async def enrich_pinterest_leads_with_rss(
    pinterest_urls: list[str],
) -> list[dict]:
    """Enrich existing Pinterest leads by fetching RSS feeds for discovered users.

    Takes Pinterest URLs found via dorking, extracts usernames,
    fetches their RSS feeds, and returns enriched lead data.
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
            logger.debug("Pinterest RSS enrich error for %s: %s", username, e)

    return leads
