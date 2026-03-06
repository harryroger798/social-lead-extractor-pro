"""Firecrawl API service for website enrichment."""
import asyncio
import requests
from typing import Optional

from app.services.extractor import extract_emails, extract_phones


FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v1"


def _scrape_url_sync(url: str, api_key: str) -> dict:
    """Scrape a single URL using Firecrawl API (synchronous)."""
    try:
        response = requests.post(
            f"{FIRECRAWL_BASE_URL}/scrape",
            json={"url": url, "formats": ["markdown"]},
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            timeout=30,
        )
        if response.status_code == 200:
            data = response.json()
            markdown = data.get("data", {}).get("markdown", "")
            return {"success": True, "markdown": markdown, "error": None}
        return {
            "success": False,
            "markdown": "",
            "error": f"HTTP {response.status_code}: {response.text[:200]}",
        }
    except requests.exceptions.Timeout:
        return {"success": False, "markdown": "", "error": "Timeout"}
    except Exception as e:
        return {"success": False, "markdown": "", "error": str(e)}


async def scrape_url(url: str, api_key: str) -> dict:
    """Scrape a single URL using Firecrawl API (async wrapper)."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _scrape_url_sync, url, api_key)


async def enrich_leads_with_firecrawl(
    leads: list[dict],
    api_key: str,
    max_urls: int = 50,
) -> list[dict]:
    """
    Enrich leads by scraping their source URLs with Firecrawl.
    Extracts additional emails and phones from business websites.
    Returns list of newly discovered leads.
    """
    if not api_key:
        return []

    # Collect unique source URLs (skip social media URLs)
    social_domains = {
        "reddit.com", "linkedin.com", "facebook.com", "instagram.com",
        "twitter.com", "x.com", "youtube.com", "tiktok.com",
        "pinterest.com", "tumblr.com",
    }

    urls_to_scrape: list[dict] = []
    seen_urls: set[str] = set()

    for lead in leads:
        source_url = lead.get("source_url", "")
        if not source_url or source_url in seen_urls:
            continue
        # Skip social media URLs — Firecrawl is for business websites
        domain = source_url.split("//")[-1].split("/")[0].replace("www.", "")
        if any(sd in domain for sd in social_domains):
            continue
        seen_urls.add(source_url)
        urls_to_scrape.append({
            "url": source_url,
            "keyword": lead.get("keyword", ""),
            "platform": lead.get("platform", ""),
        })
        if len(urls_to_scrape) >= max_urls:
            break

    new_leads: list[dict] = []
    existing_emails: set[str] = {
        lead.get("email", "").lower() for lead in leads if lead.get("email")
    }
    existing_phones: set[str] = {
        lead.get("phone", "") for lead in leads if lead.get("phone")
    }

    for url_info in urls_to_scrape:
        result = await scrape_url(url_info["url"], api_key)
        if not result["success"] or not result["markdown"]:
            continue

        # Extract emails and phones from scraped content
        emails = extract_emails(result["markdown"])
        phones = extract_phones(result["markdown"])

        for email in emails:
            if email.lower() not in existing_emails:
                existing_emails.add(email.lower())
                new_leads.append({
                    "email": email,
                    "phone": "",
                    "name": "",
                    "platform": url_info["platform"],
                    "source_url": url_info["url"],
                    "keyword": url_info["keyword"],
                    "enriched": True,
                })

        for phone in phones:
            if phone not in existing_phones:
                existing_phones.add(phone)
                new_leads.append({
                    "email": "",
                    "phone": phone,
                    "name": "",
                    "platform": url_info["platform"],
                    "source_url": url_info["url"],
                    "keyword": url_info["keyword"],
                    "enriched": True,
                })

        # Small delay between requests to be respectful
        await asyncio.sleep(0.5)

    return new_leads


def _check_credits_sync(api_key: str) -> dict:
    """Check Firecrawl API credit balance."""
    try:
        response = requests.get(
            f"{FIRECRAWL_BASE_URL}/team/credit-usage",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=10,
        )
        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "remaining_credits": data.get("remaining_credits", 0),
                "total_credits": data.get("total_credits_used", 0),
            }
        return {"success": False, "error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def check_firecrawl_credits(api_key: str) -> dict:
    """Check Firecrawl credits asynchronously."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _check_credits_sync, api_key)
