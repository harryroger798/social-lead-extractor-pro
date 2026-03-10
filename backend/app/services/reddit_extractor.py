"""Reddit extraction via RSS feeds, JSON endpoints, and PullPush API.

Enhanced with:
  - Reddit .json endpoints (structured data, no auth required)
  - Expanded subreddit coverage (20+ vs original 11)
  - User profile .json for cross-platform discovery
  - Circuit breaker: auto-skips methods that return 403/timeout
  - Overall function timeout to prevent hanging
"""
import asyncio
import logging
import time
import requests
import xml.etree.ElementTree as ET

from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)


def _fetch_reddit_rss(subreddit: str, keyword: str) -> list[dict] | str:
    """Fetch Reddit RSS feed for a subreddit search.

    Returns list of entries, or _BLOCKED_SENTINEL if Reddit returns 403.
    """
    url = f"https://www.reddit.com/r/{subreddit}/search.rss?q={keyword}&restrict_sr=1&sort=relevance&limit=25"
    try:
        response = requests.get(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; LeadExtractor/1.0)"},
            timeout=8,
        )
        if response.status_code == 403:
            return _BLOCKED_SENTINEL
        if response.status_code != 200:
            return []
        root = ET.fromstring(response.text)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        entries = []
        for entry in root.findall(".//atom:entry", ns):
            title_el = entry.find("atom:title", ns)
            content_el = entry.find("atom:content", ns)
            link_el = entry.find("atom:link", ns)
            title = title_el.text if title_el is not None and title_el.text else ""
            content = content_el.text if content_el is not None and content_el.text else ""
            link = link_el.get("href", "") if link_el is not None else ""
            entries.append({"title": title, "content": content, "link": link})
        return entries
    except Exception:
        return []


# Sentinel value returned when a method is blocked (403) to trigger circuit breaker
_BLOCKED_SENTINEL = "__BLOCKED__"


def _fetch_reddit_json(subreddit: str, keyword: str, limit: int = 25) -> list[dict] | str:
    """Fetch Reddit search results via .json endpoint (structured, free, no auth).

    Appending .json to any Reddit URL returns structured JSON data.
    This provides richer data than RSS including full post text, author info,
    upvotes, and comment counts.

    Returns list of entries, or _BLOCKED_SENTINEL if Reddit returns 403.
    """
    from urllib.parse import quote_plus
    url = f"https://www.reddit.com/r/{subreddit}/search.json?q={quote_plus(keyword)}&restrict_sr=1&sort=relevance&limit={limit}"
    try:
        response = requests.get(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; SnapLeads/3.1; +https://getsnapleads.store)"},
            timeout=10,
        )
        if response.status_code == 403:
            logger.debug("Reddit .json blocked (403) for r/%s", subreddit)
            return _BLOCKED_SENTINEL
        if response.status_code != 200:
            logger.debug("Reddit .json returned %d for r/%s", response.status_code, subreddit)
            return []

        data = response.json()
        entries = []
        for child in data.get("data", {}).get("children", []):
            post = child.get("data", {})
            title = post.get("title", "")
            selftext = post.get("selftext", "")
            permalink = post.get("permalink", "")
            author = post.get("author", "")
            url_field = post.get("url", "")

            entries.append({
                "title": title,
                "content": selftext,
                "link": f"https://reddit.com{permalink}" if permalink else "",
                "author": author,
                "external_url": url_field if url_field and not url_field.startswith("https://www.reddit.com") else "",
            })
        return entries
    except requests.exceptions.Timeout:
        logger.debug("Reddit .json timeout for r/%s", subreddit)
        return _BLOCKED_SENTINEL  # Treat timeout as blocked
    except Exception as e:
        logger.debug("Reddit .json error for r/%s: %s", subreddit, e)
        return []


def _fetch_reddit_user_about(username: str) -> dict:
    """Fetch a Reddit user's public profile via .json endpoint.

    Can reveal cross-platform links in user bio/description.
    """
    if not username or username in ("[deleted]", "AutoModerator"):
        return {}
    url = f"https://www.reddit.com/user/{username}/about.json"
    try:
        response = requests.get(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; SnapLeads/2.2; +https://getsnapleads.store)"},
            timeout=10,
        )
        if response.status_code == 200:
            data = response.json().get("data", {})
            return {
                "name": data.get("name", ""),
                "subreddit_title": data.get("subreddit", {}).get("title", ""),
                "description": data.get("subreddit", {}).get("public_description", ""),
            }
    except Exception:
        pass
    return {}


def _fetch_pullpush(subreddit: str, keyword: str, limit: int = 50) -> list[dict] | str:
    """Fetch from PullPush API (Reddit archive).

    Returns list of entries, or _BLOCKED_SENTINEL if service is down/blocked.
    """
    results = []
    # Search comments
    try:
        url = f"https://api.pullpush.io/reddit/search/comment/?subreddit={subreddit}&q={keyword}&size={limit}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            for item in data.get("data", []):
                results.append({
                    "title": "",
                    "content": item.get("body", ""),
                    "link": f"https://reddit.com/r/{subreddit}/comments/{item.get('link_id', '')[3:]}/",
                })
    except requests.exceptions.Timeout:
        logger.debug("PullPush comment timeout for r/%s", subreddit)
        return _BLOCKED_SENTINEL
    except Exception:
        pass

    # Search submissions
    try:
        url = f"https://api.pullpush.io/reddit/search/submission/?subreddit={subreddit}&q={keyword}&size={limit}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            for item in data.get("data", []):
                results.append({
                    "title": item.get("title", ""),
                    "content": item.get("selftext", ""),
                    "link": f"https://reddit.com{item.get('permalink', '')}",
                })
    except requests.exceptions.Timeout:
        logger.debug("PullPush submission timeout for r/%s", subreddit)
        if not results:
            return _BLOCKED_SENTINEL
    except Exception:
        pass

    return results


RELEVANT_SUBREDDITS = [
    # Hiring & Freelance
    "forhire", "hiring", "freelance", "Jobs4Bitcoins",
    # Business & Entrepreneurship
    "smallbusiness", "Entrepreneur", "startups", "SideProject",
    "ecommerce", "dropship",
    # Marketing & Growth
    "marketing", "SEO", "socialmedia", "PPC", "emailmarketing",
    "digital_marketing", "content_marketing", "copywriting",
    # Tech & Development
    "webdev", "design_critiques", "web_design", "SaaS",
    # Agency & Services
    "agency", "advertising",
]


async def reddit_search(
    keyword: str,
    subreddits: list[str] | None = None,
    use_rss: bool = True,
    use_pullpush: bool = True,
    use_json: bool = True,
    enrich_users: bool = False,
    max_duration_seconds: int = 45,
) -> dict:
    """
    Search Reddit for emails/phones using RSS, JSON endpoints, and PullPush.

    Enhanced with:
      - Reddit .json endpoints for structured data (richer than RSS)
      - Expanded subreddit coverage (20+ business-relevant subreddits)
      - Optional user profile enrichment for cross-platform discovery
      - Circuit breaker: auto-disables methods that return 403 or timeout
      - Overall time limit to prevent indefinite hanging

    Returns extracted emails, phones, source URLs, and method details.
    """
    target_subreddits = subreddits or RELEVANT_SUBREDDITS
    all_emails: list[str] = []
    all_phones: list[str] = []
    all_sources: list[str] = []
    methods_used: list[str] = []
    methods_blocked: list[str] = []
    authors_found: set[str] = set()
    loop = asyncio.get_event_loop()
    start_time = time.monotonic()

    # Circuit breaker flags: once a method gets 403/timeout, skip it for all subreddits
    json_blocked = False
    rss_blocked = False
    pullpush_blocked = False

    for subreddit in target_subreddits:
        # Check overall time limit
        elapsed = time.monotonic() - start_time
        if elapsed >= max_duration_seconds:
            logger.info("Reddit search hit %ds time limit after %d subreddits",
                        max_duration_seconds, target_subreddits.index(subreddit))
            break

        entries: list[dict] = []

        # Method 1: PullPush API (most reliable from server environments)
        if use_pullpush and not pullpush_blocked:
            pp_result = await loop.run_in_executor(
                None, _fetch_pullpush, subreddit, keyword
            )
            if pp_result == _BLOCKED_SENTINEL:
                pullpush_blocked = True
                methods_blocked.append("pullpush")
                logger.info("PullPush blocked/timeout — circuit breaker tripped")
            elif pp_result:
                entries.extend(pp_result)
                if "pullpush" not in methods_used:
                    methods_used.append("pullpush")

        # Method 2: Reddit .json endpoint (richest structured data, may 403)
        if use_json and not json_blocked:
            json_result = await loop.run_in_executor(
                None, _fetch_reddit_json, subreddit, keyword
            )
            if json_result == _BLOCKED_SENTINEL:
                json_blocked = True
                methods_blocked.append("json")
                logger.info("Reddit .json blocked — circuit breaker tripped, skipping for all subreddits")
            elif json_result:
                entries.extend(json_result)
                if "json" not in methods_used:
                    methods_used.append("json")
                for entry in json_result:
                    author = entry.get("author", "")
                    if author and author not in ("[deleted]", "AutoModerator"):
                        authors_found.add(author)

        # Method 3: RSS feed (may 403 on server IPs)
        if use_rss and not rss_blocked:
            rss_entries = await loop.run_in_executor(
                None, _fetch_reddit_rss, subreddit, keyword
            )
            if isinstance(rss_entries, str) and rss_entries == _BLOCKED_SENTINEL:
                rss_blocked = True
                methods_blocked.append("rss")
            elif rss_entries:
                entries.extend(rss_entries)
                if "rss" not in methods_used:
                    methods_used.append("rss")

        for entry in entries:
            text = f"{entry.get('title', '')} {entry.get('content', '')}"
            all_emails.extend(extract_emails(text))
            all_phones.extend(extract_phones(text))
            link = entry.get("link", "")
            if link:
                all_sources.append(link)
            ext_url = entry.get("external_url", "")
            if ext_url:
                all_sources.append(ext_url)

        # Small delay between subreddits
        await asyncio.sleep(0.3)

    # Optional: enrich user profiles for cross-platform links
    if enrich_users and authors_found:
        elapsed = time.monotonic() - start_time
        if elapsed < max_duration_seconds:
            if "user_profiles" not in methods_used:
                methods_used.append("user_profiles")
            for author in list(authors_found)[:20]:
                if time.monotonic() - start_time >= max_duration_seconds:
                    break
                try:
                    profile = await loop.run_in_executor(
                        None, _fetch_reddit_user_about, author
                    )
                    if profile:
                        profile_text = f"{profile.get('subreddit_title', '')} {profile.get('description', '')}"
                        all_emails.extend(extract_emails(profile_text))
                        all_phones.extend(extract_phones(profile_text))
                    await asyncio.sleep(0.3)
                except Exception:
                    pass

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
        if phone not in seen_phones:
            seen_phones.add(phone)
            unique_phones.append(phone)

    total_time = round(time.monotonic() - start_time, 1)

    return {
        "emails": unique_emails,
        "phones": unique_phones,
        "sources": list(set(all_sources)),
        "platform": "reddit",
        "keyword": keyword,
        "subreddits_searched": target_subreddits,
        "methods_used": methods_used,
        "methods_blocked": methods_blocked,
        "authors_discovered": len(authors_found),
        "duration_seconds": total_time,
    }
