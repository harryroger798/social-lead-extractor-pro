"""Google dorking engine for extracting emails/phones from search results."""
import os
import re
import asyncio
import requests
from typing import Optional

from app.services.extractor import extract_emails, extract_phones


SERPER_API_KEY = os.environ.get("SERPER_API_KEY", "")

PLATFORM_DORK_TEMPLATES: dict[str, str] = {
    "linkedin": 'site:linkedin.com "{keyword}" "@gmail.com" OR "@yahoo.com" OR "@outlook.com"',
    "facebook": 'site:facebook.com "{keyword}" email OR contact OR "@"',
    "instagram": 'site:instagram.com "{keyword}" email OR "@gmail.com"',
    "twitter": 'site:twitter.com OR site:x.com "{keyword}" email OR contact',
    "youtube": 'site:youtube.com "{keyword}" email OR business OR contact',
    "pinterest": 'site:pinterest.com "{keyword}" email OR contact',
    "tumblr": 'site:tumblr.com "{keyword}" email OR "@gmail.com"',
    "tiktok": 'site:tiktok.com "{keyword}" email OR contact',
}


def _build_dork_query(keyword: str, platform: str) -> str:
    """Build a Google dork query for a given keyword and platform."""
    template = PLATFORM_DORK_TEMPLATES.get(platform, '"{keyword}" email OR contact')
    return template.replace("{keyword}", keyword)


def _search_serper(query: str, num_results: int = 10) -> list[dict]:
    """Search using Serper.dev API."""
    if not SERPER_API_KEY:
        return []
    try:
        response = requests.post(
            "https://google.serper.dev/search",
            json={"q": query, "num": num_results},
            headers={
                "X-API-KEY": SERPER_API_KEY,
                "Content-Type": "application/json",
            },
            timeout=15,
        )
        if response.status_code == 200:
            data = response.json()
            results = []
            for item in data.get("organic", []):
                results.append({
                    "title": item.get("title", ""),
                    "snippet": item.get("snippet", ""),
                    "link": item.get("link", ""),
                })
            return results
    except Exception:
        pass
    return []


async def dorking_search(
    keyword: str,
    platform: str,
    pages: int = 3,
    serper_api_key: Optional[str] = None,
) -> dict:
    """
    Perform Google dorking search for a keyword on a platform.
    Returns extracted emails, phones, and source URLs.
    """
    query = _build_dork_query(keyword, platform)
    all_emails: list[str] = []
    all_phones: list[str] = []
    all_sources: list[str] = []

    api_key = serper_api_key or SERPER_API_KEY

    if api_key:
        # Use Serper.dev API
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None, _search_serper_with_key, query, pages * 10, api_key
        )
        for result in results:
            text = f"{result.get('title', '')} {result.get('snippet', '')}"
            all_emails.extend(extract_emails(text))
            all_phones.extend(extract_phones(text))
            link = result.get("link", "")
            if link:
                all_sources.append(link)

    # Deduplicate
    seen_emails: set[str] = set()
    unique_emails = []
    for email in all_emails:
        lower = email.lower()
        if lower not in seen_emails:
            seen_emails.add(lower)
            unique_emails.append(email)

    seen_phones: set[str] = set()
    unique_phones = []
    for phone in all_phones:
        cleaned = re.sub(r'[^\d+]', '', phone)
        if cleaned not in seen_phones:
            seen_phones.add(cleaned)
            unique_phones.append(phone)

    return {
        "emails": unique_emails,
        "phones": unique_phones,
        "sources": list(set(all_sources)),
        "query": query,
        "platform": platform,
        "keyword": keyword,
    }


def _search_serper_with_key(query: str, num_results: int, api_key: str) -> list[dict]:
    """Search using Serper.dev API with explicit key."""
    try:
        response = requests.post(
            "https://google.serper.dev/search",
            json={"q": query, "num": num_results},
            headers={
                "X-API-KEY": api_key,
                "Content-Type": "application/json",
            },
            timeout=15,
        )
        if response.status_code == 200:
            data = response.json()
            results = []
            for item in data.get("organic", []):
                results.append({
                    "title": item.get("title", ""),
                    "snippet": item.get("snippet", ""),
                    "link": item.get("link", ""),
                })
            return results
    except Exception:
        pass
    return []


async def dorking_search_multi(
    keywords: list[str],
    platforms: list[str],
    pages: int = 3,
    delay: float = 2.0,
) -> list[dict]:
    """Search multiple keywords across multiple platforms."""
    all_results = []
    for keyword in keywords:
        for platform in platforms:
            if platform == "reddit":
                continue  # Reddit uses RSS/PullPush instead
            result = await dorking_search(keyword, platform, pages)
            all_results.append(result)
            if delay > 0:
                await asyncio.sleep(delay)
    return all_results
