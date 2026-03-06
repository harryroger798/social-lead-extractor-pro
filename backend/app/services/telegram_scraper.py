"""Telegram group member scraper using Telethon (MIT license, 100% free).

IMPORTANT BAN BYPASS NOTES:
- Telethon uses the official Telegram MTProto API (not scraping)
- You need api_id and api_hash from https://my.telegram.org (free)
- Rate limits: ~200 members per getParticipants call, FloodWait after rapid calls
- Ban prevention:
  1. Use random delays between API calls (3-10 seconds)
  2. Don't scrape more than 5 groups per session
  3. Don't run more than once every few hours
  4. Use an established account (not a freshly created one)
  5. Never scrape private groups you're not a member of
- Phone numbers: Most users set privacy to "Nobody", so you'll get username/name but not phone
- Account safety: LOW risk if using delays. Telegram rarely bans for API usage.
"""
import asyncio
import logging
import csv
import io
from typing import Optional

logger = logging.getLogger(__name__)


async def scrape_telegram_group(
    api_id: int,
    api_hash: str,
    phone_number: str,
    group_username: str,
    max_members: int = 500,
    delay: float = 5.0,
) -> list[dict]:
    """
    Scrape members from a Telegram group using Telethon.
    Requires: pip install telethon (MIT license, free)

    Returns list of dicts with: user_id, username, first_name, last_name, phone, bio, status.
    """
    members = []

    try:
        from telethon import TelegramClient
        from telethon.tl.functions.channels import GetParticipantsRequest
        from telethon.tl.types import ChannelParticipantsSearch
        from telethon.errors import FloodWaitError

        # Create client
        client = TelegramClient('session_lead_extractor', api_id, api_hash)
        await client.start(phone=phone_number)

        try:
            # Get the group entity
            group = await client.get_entity(group_username)

            offset = 0
            limit = 100  # Max per request

            while len(members) < max_members:
                try:
                    participants = await client(GetParticipantsRequest(
                        channel=group,
                        filter=ChannelParticipantsSearch(''),
                        offset=offset,
                        limit=limit,
                        hash=0,
                    ))

                    if not participants.users:
                        break

                    for user in participants.users:
                        member = {
                            "user_id": str(user.id),
                            "username": user.username or "",
                            "first_name": user.first_name or "",
                            "last_name": user.last_name or "",
                            "phone": user.phone or "",
                            "bio": "",
                            "status": "online" if hasattr(user.status, 'was_online') else "unknown",
                            "platform": "telegram",
                            "source": f"@{group_username}",
                        }
                        members.append(member)

                    offset += len(participants.users)

                    if len(participants.users) < limit:
                        break

                    # Delay to avoid rate limits
                    await asyncio.sleep(delay)

                except FloodWaitError as e:
                    logger.warning(f"FloodWait: sleeping {e.seconds} seconds")
                    await asyncio.sleep(e.seconds + 1)
                except Exception as e:
                    logger.error(f"Error fetching participants: {e}")
                    break

        finally:
            await client.disconnect()

    except ImportError:
        logger.error("Telethon not installed. Run: pip install telethon")
        return [{"error": "Telethon not installed. Run: pip install telethon"}]
    except Exception as e:
        logger.error(f"Telegram scrape error: {e}")
        return [{"error": str(e)}]

    return members[:max_members]


async def export_telegram_members_csv(members: list[dict]) -> str:
    """Export telegram members to CSV string."""
    output = io.StringIO()
    if not members:
        return ""

    fieldnames = ["user_id", "username", "first_name", "last_name", "phone", "bio", "status"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for member in members:
        writer.writerow(member)

    return output.getvalue()


def get_telegram_setup_instructions() -> dict:
    """Return setup instructions for Telegram scraping."""
    return {
        "title": "Telegram Scraper Setup",
        "steps": [
            "1. Go to https://my.telegram.org and log in with your phone number",
            "2. Click 'API development tools'",
            "3. Create a new application (any name/description)",
            "4. Copy your api_id (number) and api_hash (string)",
            "5. Enter them in Settings > Telegram tab",
            "6. First time: you'll receive a verification code on Telegram",
        ],
        "ban_prevention": [
            "Use delays of 3-10 seconds between requests",
            "Don't scrape more than 5 groups per day",
            "Use an established Telegram account (not new)",
            "Never scrape private groups you're not a member of",
            "Telethon handles FloodWait errors automatically",
        ],
        "limitations": [
            "Phone numbers: Most users set privacy to 'Nobody'",
            "Large groups (50K+) may take 10-30 minutes",
            "Some groups restrict member list visibility",
        ],
        "cost": "100% FREE — Telethon is MIT licensed, Telegram API is free",
    }
