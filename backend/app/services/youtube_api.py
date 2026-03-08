"""YouTube Data API v3 integration for lead discovery.

YouTube channels publicly display business emails in their "About" section.
The YouTube Data API v3 provides free access (10,000 units/day) to:
  - Channel search by keyword
  - Channel details (description, links, email)
  - Video details (description with contact info)

All methods: 100% FREE tier | 100% NON-BAN | Official API.
"""

import logging
import requests
from typing import Optional

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

# YouTube Data API v3 base URL
YT_API_BASE = "https://www.googleapis.com/youtube/v3"


def search_youtube_channels(
    keyword: str,
    api_key: str,
    max_results: int = 25,
) -> list[dict]:
    """Search YouTube for channels matching a keyword.

    API cost: 100 units per search (10K free/day = 100 searches/day).

    Returns list of channel IDs and titles.
    """
    if not api_key:
        return []

    try:
        response = requests.get(
            f"{YT_API_BASE}/search",
            params={
                "part": "snippet",
                "q": keyword,
                "type": "channel",
                "maxResults": min(max_results, 50),
                "key": api_key,
            },
            timeout=15,
        )
        if response.status_code != 200:
            logger.warning("YouTube search API returned %d: %s", response.status_code, response.text[:200])
            return []

        data = response.json()
        channels = []
        for item in data.get("items", []):
            channel_id = item.get("snippet", {}).get("channelId", "") or item.get("id", {}).get("channelId", "")
            channels.append({
                "channel_id": channel_id,
                "title": item.get("snippet", {}).get("title", ""),
                "description": item.get("snippet", {}).get("description", ""),
            })
        return channels

    except Exception as e:
        logger.error("YouTube search error: %s", e)
        return []


def get_channel_details(
    channel_ids: list[str],
    api_key: str,
) -> list[dict]:
    """Get detailed info for YouTube channels including email in description.

    API cost: 1 unit per channel (very cheap).
    Channels often include business email in their description/about section.

    Returns channel details with extracted emails/phones.
    """
    if not api_key or not channel_ids:
        return []

    results = []

    # API accepts up to 50 IDs at once
    for i in range(0, len(channel_ids), 50):
        batch = channel_ids[i:i + 50]
        try:
            response = requests.get(
                f"{YT_API_BASE}/channels",
                params={
                    "part": "snippet,brandingSettings",
                    "id": ",".join(batch),
                    "key": api_key,
                },
                timeout=15,
            )
            if response.status_code != 200:
                logger.warning("YouTube channels API returned %d", response.status_code)
                continue

            data = response.json()
            for item in data.get("items", []):
                snippet = item.get("snippet", {})
                branding = item.get("brandingSettings", {}).get("channel", {})

                description = snippet.get("description", "")
                title = snippet.get("title", "")
                custom_url = snippet.get("customUrl", "")

                # Extract emails and phones from description
                emails = extract_emails(description)
                phones = extract_phones(description)

                # Also check branding keywords/description
                branding_desc = branding.get("description", "")
                if branding_desc and branding_desc != description:
                    emails.extend(extract_emails(branding_desc))
                    phones.extend(extract_phones(branding_desc))

                results.append({
                    "channel_id": item.get("id", ""),
                    "title": title,
                    "custom_url": custom_url,
                    "description": description[:500],
                    "emails": list(set(emails)),
                    "phones": list(set(phones)),
                    "source_url": f"https://youtube.com/channel/{item.get('id', '')}",
                })

        except Exception as e:
            logger.error("YouTube channel details error: %s", e)

    return results


def search_youtube_videos(
    keyword: str,
    api_key: str,
    max_results: int = 25,
) -> list[dict]:
    """Search YouTube videos for contact info in descriptions.

    Video descriptions often contain business emails, especially in
    tutorial, course, and service-related videos.

    API cost: 100 units per search.
    """
    if not api_key:
        return []

    try:
        response = requests.get(
            f"{YT_API_BASE}/search",
            params={
                "part": "snippet",
                "q": f"{keyword} email OR contact OR business",
                "type": "video",
                "maxResults": min(max_results, 50),
                "key": api_key,
            },
            timeout=15,
        )
        if response.status_code != 200:
            return []

        data = response.json()
        video_ids = []
        for item in data.get("items", []):
            vid_id = item.get("id", {}).get("videoId", "")
            if vid_id:
                video_ids.append(vid_id)

        if not video_ids:
            return []

        # Get full video details (descriptions are truncated in search results)
        detail_response = requests.get(
            f"{YT_API_BASE}/videos",
            params={
                "part": "snippet",
                "id": ",".join(video_ids[:50]),
                "key": api_key,
            },
            timeout=15,
        )
        if detail_response.status_code != 200:
            return []

        results = []
        detail_data = detail_response.json()
        for item in detail_data.get("items", []):
            snippet = item.get("snippet", {})
            description = snippet.get("description", "")
            title = snippet.get("title", "")
            channel_title = snippet.get("channelTitle", "")

            emails = extract_emails(description)
            phones = extract_phones(description)

            if emails or phones:
                results.append({
                    "video_id": item.get("id", ""),
                    "title": title,
                    "channel_title": channel_title,
                    "emails": list(set(emails)),
                    "phones": list(set(phones)),
                    "source_url": f"https://youtube.com/watch?v={item.get('id', '')}",
                })

        return results

    except Exception as e:
        logger.error("YouTube video search error: %s", e)
        return []


async def youtube_lead_search(
    keyword: str,
    api_key: Optional[str] = None,
    max_channels: int = 25,
    max_videos: int = 25,
) -> dict:
    """Full YouTube lead discovery pipeline.

    1. Search for channels matching keyword → extract emails from descriptions
    2. Search for videos matching keyword → extract emails from descriptions

    Returns combined leads with source attribution.
    """
    import asyncio

    if not api_key:
        return {
            "emails": [],
            "phones": [],
            "sources": [],
            "platform": "youtube",
            "keyword": keyword,
            "method": "none",
            "channels_searched": 0,
            "videos_searched": 0,
        }

    loop = asyncio.get_event_loop()
    all_emails: list[str] = []
    all_phones: list[str] = []
    all_sources: list[str] = []

    # Step 1: Search channels
    channels = await loop.run_in_executor(
        None, search_youtube_channels, keyword, api_key, max_channels
    )
    if channels:
        channel_ids = [c["channel_id"] for c in channels if c.get("channel_id")]
        if channel_ids:
            details = await loop.run_in_executor(
                None, get_channel_details, channel_ids, api_key
            )
            for detail in details:
                all_emails.extend(detail.get("emails", []))
                all_phones.extend(detail.get("phones", []))
                source = detail.get("source_url", "")
                if source:
                    all_sources.append(source)

    # Step 2: Search videos
    videos = await loop.run_in_executor(
        None, search_youtube_videos, keyword, api_key, max_videos
    )
    for video in videos:
        all_emails.extend(video.get("emails", []))
        all_phones.extend(video.get("phones", []))
        source = video.get("source_url", "")
        if source:
            all_sources.append(source)

    # Deduplicate
    unique_emails = list(dict.fromkeys(e.lower() for e in all_emails))
    unique_phones = list(dict.fromkeys(all_phones))

    return {
        "emails": unique_emails,
        "phones": unique_phones,
        "sources": list(set(all_sources)),
        "platform": "youtube",
        "keyword": keyword,
        "method": "youtube_api_v3",
        "channels_searched": len(channels),
        "videos_searched": len(videos),
    }
