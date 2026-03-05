"""Reddit extraction via RSS feeds and PullPush API."""
import asyncio
import requests
import xml.etree.ElementTree as ET

from app.services.extractor import extract_emails, extract_phones


def _fetch_reddit_rss(subreddit: str, keyword: str) -> list[dict]:
    """Fetch Reddit RSS feed for a subreddit search."""
    url = f"https://www.reddit.com/r/{subreddit}/search.rss?q={keyword}&restrict_sr=1&sort=relevance&limit=25"
    try:
        response = requests.get(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; LeadExtractor/1.0)"},
            timeout=15,
        )
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


def _fetch_pullpush(subreddit: str, keyword: str, limit: int = 100) -> list[dict]:
    """Fetch from PullPush API (Reddit archive)."""
    results = []
    # Search comments
    try:
        url = f"https://api.pullpush.io/reddit/search/comment/?subreddit={subreddit}&q={keyword}&size={limit}"
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            data = response.json()
            for item in data.get("data", []):
                results.append({
                    "title": "",
                    "content": item.get("body", ""),
                    "link": f"https://reddit.com/r/{subreddit}/comments/{item.get('link_id', '')[3:]}/",
                })
    except Exception:
        pass

    # Search submissions
    try:
        url = f"https://api.pullpush.io/reddit/search/submission/?subreddit={subreddit}&q={keyword}&size={limit}"
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            data = response.json()
            for item in data.get("data", []):
                results.append({
                    "title": item.get("title", ""),
                    "content": item.get("selftext", ""),
                    "link": f"https://reddit.com{item.get('permalink', '')}",
                })
    except Exception:
        pass

    return results


RELEVANT_SUBREDDITS = [
    "forhire", "hiring", "freelance", "smallbusiness",
    "Entrepreneur", "startups", "marketing", "SEO",
    "socialmedia", "webdev", "design_critiques",
]


async def reddit_search(
    keyword: str,
    subreddits: list[str] | None = None,
    use_rss: bool = True,
    use_pullpush: bool = True,
) -> dict:
    """
    Search Reddit for emails/phones using RSS and PullPush.
    Returns extracted emails, phones, and source URLs.
    """
    target_subreddits = subreddits or RELEVANT_SUBREDDITS
    all_emails: list[str] = []
    all_phones: list[str] = []
    all_sources: list[str] = []
    loop = asyncio.get_event_loop()

    for subreddit in target_subreddits:
        entries: list[dict] = []

        if use_rss:
            rss_entries = await loop.run_in_executor(
                None, _fetch_reddit_rss, subreddit, keyword
            )
            entries.extend(rss_entries)

        if use_pullpush:
            pp_entries = await loop.run_in_executor(
                None, _fetch_pullpush, subreddit, keyword
            )
            entries.extend(pp_entries)

        for entry in entries:
            text = f"{entry.get('title', '')} {entry.get('content', '')}"
            all_emails.extend(extract_emails(text))
            all_phones.extend(extract_phones(text))
            link = entry.get("link", "")
            if link:
                all_sources.append(link)

        # Small delay between subreddits
        await asyncio.sleep(0.5)

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

    return {
        "emails": unique_emails,
        "phones": unique_phones,
        "sources": list(set(all_sources)),
        "platform": "reddit",
        "keyword": keyword,
        "subreddits_searched": target_subreddits,
    }
