"""fxtwitter API — free Twitter/X profile data extraction.

Uses the fxtwitter.com public API to extract profile data from Twitter/X
accounts without authentication. Returns bio, website URL, location,
and follower count.

100% FREE | No auth needed | No rate limit issues.
"""
import asyncio
import logging
import re
import requests
from typing import Optional

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
}


def _fetch_fxtwitter_profile(username: str) -> dict:
    """Fetch a Twitter profile via fxtwitter API.

    Returns dict with: name, bio, website, location, followers, emails, phones.
    """
    clean_user = username.lstrip("@").strip()
    if not clean_user:
        return {}

    url = f"https://api.fxtwitter.com/{clean_user}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code != 200:
            logger.debug("fxtwitter returned %d for @%s", resp.status_code, clean_user)
            return {}

        data = resp.json()
        user = data.get("user", {})
        if not user:
            return {}

        name = user.get("name", "")
        bio = user.get("description", "")
        website = user.get("url", "") or user.get("website", "")
        location = user.get("location", "")
        followers = user.get("followers", user.get("followers_count", 0))

        # Extract emails and phones from bio text
        bio_emails = extract_emails(bio) if bio else []
        bio_phones = extract_phones(bio) if bio else []

        # Filter out x.com/twitter.com links from website
        if website and ("x.com" in website or "twitter.com" in website):
            website = ""

        return {
            "username": clean_user,
            "name": name,
            "bio": bio,
            "website": website,
            "location": location,
            "followers": followers,
            "emails": bio_emails,
            "phones": bio_phones,
        }
    except Exception as e:
        logger.debug("fxtwitter error for @%s: %s", clean_user, e)
        return {}


def _extract_twitter_usernames_from_urls(urls: list[str]) -> list[str]:
    """Extract Twitter usernames from a list of URLs."""
    usernames = []
    for url in urls:
        match = re.search(r"(?:twitter\.com|x\.com)/([A-Za-z0-9_]+)", url)
        if match:
            username = match.group(1)
            if username.lower() not in ("search", "home", "explore", "settings",
                                        "i", "intent", "hashtag", "share"):
                usernames.append(username)
    return list(dict.fromkeys(usernames))  # deduplicate preserving order


async def extract_twitter_profiles(
    keyword: str,
    max_profiles: int = 20,
) -> list[dict]:
    """Extract Twitter profile data for a keyword using fxtwitter API.

    Strategy: Use Google dorking results to find Twitter usernames,
    then fetch their full profiles via fxtwitter API for bio/website/email data.
    Also checks common business usernames derived from the keyword.

    Returns list of lead dicts.
    """
    leads: list[dict] = []
    loop = asyncio.get_event_loop()

    try:
        # Generate potential usernames from keyword
        keyword_clean = re.sub(r"[^a-zA-Z0-9 ]", "", keyword).strip()
        potential_users = [
            keyword_clean.replace(" ", ""),
            keyword_clean.replace(" ", "_"),
        ]

        profiles_checked = 0
        for username in potential_users[:max_profiles]:
            if profiles_checked >= max_profiles:
                break

            profile = await loop.run_in_executor(None, _fetch_fxtwitter_profile, username)
            if not profile:
                continue

            profiles_checked += 1

            # Add leads from bio emails
            for email in profile.get("emails", []):
                leads.append({
                    "email": email, "phone": "",
                    "name": profile.get("name", ""),
                    "platform": "twitter",
                    "source_url": f"https://x.com/{username}",
                    "keyword": keyword,
                })

            # Add leads from bio phones
            for phone in profile.get("phones", []):
                leads.append({
                    "email": "", "phone": phone,
                    "name": profile.get("name", ""),
                    "platform": "twitter",
                    "source_url": f"https://x.com/{username}",
                    "keyword": keyword,
                })

            # If profile has a website, add it for bio link following
            website = profile.get("website", "")
            if website and not leads:
                # No direct contact found, but we have a website to follow
                leads.append({
                    "email": "", "phone": "",
                    "name": profile.get("name", ""),
                    "platform": "twitter",
                    "source_url": f"https://x.com/{username}",
                    "keyword": keyword,
                    "bio_link": website,
                })

    except Exception as e:
        logger.warning("fxtwitter extraction failed: %s", e)

    return leads


async def enrich_twitter_leads_with_fxtwitter(
    twitter_urls: list[str],
) -> list[dict]:
    """Enrich existing Twitter leads by fetching full profile data via fxtwitter.

    Takes a list of Twitter URLs found via dorking, extracts usernames,
    fetches their profiles, and returns enriched lead data.
    """
    leads: list[dict] = []
    loop = asyncio.get_event_loop()

    usernames = _extract_twitter_usernames_from_urls(twitter_urls)

    for username in usernames[:30]:  # Limit to 30 profiles
        try:
            profile = await loop.run_in_executor(None, _fetch_fxtwitter_profile, username)
            if not profile:
                continue

            for email in profile.get("emails", []):
                leads.append({
                    "email": email, "phone": "",
                    "name": profile.get("name", ""),
                    "platform": "twitter",
                    "source_url": f"https://x.com/{username}",
                    "keyword": "",
                })

            for phone in profile.get("phones", []):
                leads.append({
                    "email": "", "phone": phone,
                    "name": profile.get("name", ""),
                    "platform": "twitter",
                    "source_url": f"https://x.com/{username}",
                    "keyword": "",
                })

            # Website for bio link following
            website = profile.get("website", "")
            if website:
                leads.append({
                    "email": "", "phone": "",
                    "name": profile.get("name", ""),
                    "platform": "twitter",
                    "source_url": f"https://x.com/{username}",
                    "keyword": "",
                    "bio_link": website,
                })

            await asyncio.sleep(0.3)  # Be respectful
        except Exception as e:
            logger.debug("fxtwitter enrich error for @%s: %s", username, e)

    return leads
