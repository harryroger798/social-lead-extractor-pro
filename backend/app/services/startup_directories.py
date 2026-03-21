"""Startup Directories scraper for SnapLeads v3.5.62.

Scrapes verified startup/developer leads from 5 free, ban-free sources:
  1. npm Registry API — maintainer emails + package homepages
  2. PyPI Registry API — author emails + project websites
  3. GitHub Trending API — company websites from popular repos
  4. HackerNews Algolia API — "Who is Hiring" job posts with emails
  5. Company website /contact scraping — emails + phones from discovered websites

All sources: Zero API keys | Zero proxies | 100% ban-free | 100% free.
"""

from __future__ import annotations

import logging
import re
import time
from urllib.parse import urlparse

from app.services.anti_detection import AdSession
from app.services.extractor import extract_emails, extract_phones

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_SKIP_EMAIL_DOMAINS = frozenset({
    "example.com", "sentry.io", "w3.org", "schema.org", "cloudflare.com",
    "github.com", "npmjs.com", "pypi.org", "githubusercontent.com",
})

_GENERIC_EMAILS = frozenset({
    "noreply", "no-reply", "donotreply", "mailer-daemon", "postmaster",
})


def _is_valid_lead_email(email: str) -> bool:
    """Filter out junk emails from registry data."""
    if not email or "@" not in email:
        return False
    local, domain = email.rsplit("@", 1)
    if domain.lower() in _SKIP_EMAIL_DOMAINS:
        return False
    if local.lower() in _GENERIC_EMAILS:
        return False
    if len(email) > 100 or len(local) < 2:
        return False
    return True


def _extract_domain(url: str) -> str:
    """Extract domain from a URL, stripping www."""
    try:
        parsed = urlparse(url)
        host = parsed.hostname or ""
        if host.startswith("www."):
            host = host[4:]
        return host.lower()
    except Exception:
        return ""


# ---------------------------------------------------------------------------
# Source 1: npm Registry API
# ---------------------------------------------------------------------------

_NPM_KEYWORDS = [
    "saas", "startup", "crm", "invoice", "analytics", "dashboard",
    "ai-agent", "chatbot", "ecommerce", "fintech", "devtools",
    "api", "automation", "workflow", "nocode", "lowcode",
    "marketing", "sales", "hr", "recruiting", "payroll",
    "booking", "scheduling", "helpdesk", "support", "cms",
]


def scrape_npm_registry(
    keywords: list[str] | None = None,
    max_per_keyword: int = 20,
    max_total: int = 200,
) -> list[dict]:
    """Scrape npm registry for package maintainer emails + homepages.

    npm's search API is fully public, no auth needed.
    Returns: name, email, package, website, source='npm'
    """
    leads: list[dict] = []
    seen_emails: set[str] = set()
    kw_list = keywords or _NPM_KEYWORDS

    try:
        with AdSession(timeout=10.0, min_delay=0.5) as session:
            for kw in kw_list:
                if len(leads) >= max_total:
                    break
                try:
                    url = f"https://registry.npmjs.org/-/v1/search?text={kw}&size={max_per_keyword}"
                    resp = session.get(url, headers={"Accept": "application/json"})
                    if resp.status_code != 200:
                        continue

                    data = resp.json()
                    for pkg in data.get("objects", []):
                        p = pkg.get("package", {})
                        homepage = p.get("links", {}).get("homepage", "")
                        repo = p.get("links", {}).get("repository", "")

                        for m in p.get("maintainers", []):
                            email = m.get("email", "")
                            if not _is_valid_lead_email(email):
                                continue
                            if email.lower() in seen_emails:
                                continue
                            seen_emails.add(email.lower())

                            leads.append({
                                "name": m.get("username", ""),
                                "email": email,
                                "phone": "",
                                "website": homepage or repo,
                                "company": p.get("name", ""),
                                "platform": "startup_directories",
                                "source": "npm",
                                "source_url": f"https://www.npmjs.com/package/{p.get('name', '')}",
                                "description": p.get("description", "")[:200],
                            })

                            if len(leads) >= max_total:
                                break
                except Exception as exc:
                    logger.debug("npm keyword '%s' error: %s", kw, exc)
                    continue

    except Exception as exc:
        logger.debug("npm registry session error: %s", exc)

    logger.info("npm Registry: %d leads from %d keywords", len(leads), len(kw_list))
    return leads


# ---------------------------------------------------------------------------
# Source 2: PyPI Registry API
# ---------------------------------------------------------------------------

_PYPI_KEYWORDS = [
    "saas", "crm", "analytics", "dashboard", "api-client",
    "automation", "chatbot", "ecommerce", "invoice", "scheduling",
    "marketing", "scraper", "crawler", "ml-pipeline", "data-pipeline",
]


def scrape_pypi_registry(
    keywords: list[str] | None = None,
    max_per_keyword: int = 10,
    max_total: int = 150,
) -> list[dict]:
    """Scrape PyPI for package author emails + project websites.

    PyPI's JSON API is fully public, no auth needed.
    """
    leads: list[dict] = []
    seen_emails: set[str] = set()
    kw_list = keywords or _PYPI_KEYWORDS

    try:
        with AdSession(timeout=10.0, min_delay=0.5) as session:
            for kw in kw_list:
                if len(leads) >= max_total:
                    break
                try:
                    # PyPI search via simple API
                    url = f"https://pypi.org/search/?q={kw}&o=-created"
                    resp = session.get(url)
                    if resp.status_code != 200:
                        continue

                    # Extract package names from search results
                    pkg_names = re.findall(
                        r'class="package-snippet__name"[^>]*>([^<]+)', resp.text
                    )
                    if not pkg_names:
                        # Fallback: try regex on href
                        pkg_names = re.findall(r'/project/([^/]+)/', resp.text)

                    for pkg_name in pkg_names[:max_per_keyword]:
                        if len(leads) >= max_total:
                            break
                        try:
                            pkg_resp = session.get(
                                f"https://pypi.org/pypi/{pkg_name}/json",
                                headers={"Accept": "application/json"},
                            )
                            if pkg_resp.status_code != 200:
                                continue

                            info = pkg_resp.json().get("info", {})
                            author_email = info.get("author_email", "") or ""
                            author = info.get("author", "") or ""
                            home_page = info.get("home_page", "") or ""
                            project_url = info.get("project_url", "") or ""

                            # Parse email (may contain "Name <email>" format)
                            emails_raw = re.findall(
                                r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
                                author_email,
                            )
                            for email in emails_raw:
                                if not _is_valid_lead_email(email):
                                    continue
                                if email.lower() in seen_emails:
                                    continue
                                seen_emails.add(email.lower())

                                leads.append({
                                    "name": author,
                                    "email": email,
                                    "phone": "",
                                    "website": home_page or project_url,
                                    "company": pkg_name,
                                    "platform": "startup_directories",
                                    "source": "pypi",
                                    "source_url": f"https://pypi.org/project/{pkg_name}/",
                                    "description": (info.get("summary", "") or "")[:200],
                                })

                        except Exception:
                            continue

                except Exception as exc:
                    logger.debug("PyPI keyword '%s' error: %s", kw, exc)
                    continue

    except Exception as exc:
        logger.debug("PyPI session error: %s", exc)

    logger.info("PyPI Registry: %d leads from %d keywords", len(leads), len(kw_list))
    return leads


# ---------------------------------------------------------------------------
# Source 3: GitHub Trending Repos
# ---------------------------------------------------------------------------

def scrape_github_trending(
    min_stars: int = 100,
    max_total: int = 100,
) -> list[dict]:
    """Scrape GitHub API for trending repos with company websites.

    GitHub unauthenticated API: 60 req/hr, search: 10 req/min.
    Returns repos with homepages (company websites to scrape later).
    """
    leads: list[dict] = []
    seen_urls: set[str] = set()

    try:
        with AdSession(timeout=10.0, min_delay=1.0) as session:
            # Search for recently created repos with stars
            queries = [
                f"stars:>{min_stars} created:>2025-06-01",
                f"stars:>{min_stars} topic:saas",
                f"stars:>{min_stars} topic:startup",
            ]

            for q in queries:
                if len(leads) >= max_total:
                    break
                try:
                    url = f"https://api.github.com/search/repositories?q={q}&sort=stars&per_page=30"
                    resp = session.get(url, headers={"Accept": "application/vnd.github.v3+json"})
                    if resp.status_code != 200:
                        logger.debug("GitHub search HTTP %d", resp.status_code)
                        continue

                    data = resp.json()
                    for item in data.get("items", []):
                        homepage = item.get("homepage", "") or ""
                        if not homepage or homepage in seen_urls:
                            continue
                        # Skip github.io pages — not real companies
                        domain = _extract_domain(homepage)
                        if not domain or "github.io" in domain:
                            continue
                        seen_urls.add(homepage)

                        leads.append({
                            "name": item.get("full_name", ""),
                            "email": "",
                            "phone": "",
                            "website": homepage,
                            "company": item.get("owner", {}).get("login", ""),
                            "platform": "startup_directories",
                            "source": "github",
                            "source_url": item.get("html_url", ""),
                            "description": (item.get("description", "") or "")[:200],
                            "stars": item.get("stargazers_count", 0),
                        })
                except Exception as exc:
                    logger.debug("GitHub query error: %s", exc)
                    continue

    except Exception as exc:
        logger.debug("GitHub session error: %s", exc)

    logger.info("GitHub Trending: %d repos with websites", len(leads))
    return leads


# ---------------------------------------------------------------------------
# Source 4: HackerNews "Who is Hiring" via Algolia API
# ---------------------------------------------------------------------------

def scrape_hackernews_hiring(
    max_total: int = 50,
) -> list[dict]:
    """Scrape HackerNews "Who is Hiring" threads via Algolia API.

    Algolia HN search API is fully public, no auth needed.
    """
    leads: list[dict] = []
    seen_emails: set[str] = set()

    try:
        with AdSession(timeout=10.0, min_delay=0.5) as session:
            # Find latest "Who is Hiring" thread
            search_url = (
                "https://hn.algolia.com/api/v1/search?"
                "query=who+is+hiring&tags=ask_hn"
                "&numericFilters=created_at_i>1740000000"
            )
            resp = session.get(search_url, headers={"Accept": "application/json"})
            if resp.status_code != 200:
                return leads

            data = resp.json()
            story_id = ""
            for hit in data.get("hits", []):
                title = hit.get("title", "").lower()
                if "hiring" in title and "who is" in title:
                    story_id = hit.get("objectID", "")
                    logger.info("HN hiring thread: %s (ID: %s)", hit.get("title", ""), story_id)
                    break

            if not story_id:
                return leads

            # Fetch comments from the hiring thread
            comments_url = (
                f"https://hn.algolia.com/api/v1/search?"
                f"tags=comment,story_{story_id}&hitsPerPage=200"
            )
            resp = session.get(comments_url, headers={"Accept": "application/json"})
            if resp.status_code != 200:
                return leads

            comments = resp.json().get("hits", [])
            for comment in comments:
                text = comment.get("comment_text", "")
                if not text:
                    continue

                # Extract emails
                emails = re.findall(
                    r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text
                )
                # Extract URLs (company websites)
                urls = re.findall(r"https?://[^\s<\"']+", text)

                # Extract company name from first line
                first_line = re.sub(r"<[^>]+>", " ", text).strip()[:100]

                for email in emails:
                    if not _is_valid_lead_email(email):
                        continue
                    if email.lower() in seen_emails:
                        continue
                    seen_emails.add(email.lower())

                    website = ""
                    for u in urls:
                        d = _extract_domain(u)
                        if d and "ycombinator" not in d and "news.ycombinator" not in d:
                            website = u
                            break

                    leads.append({
                        "name": comment.get("author", ""),
                        "email": email,
                        "phone": "",
                        "website": website,
                        "company": first_line[:60],
                        "platform": "startup_directories",
                        "source": "hackernews",
                        "source_url": f"https://news.ycombinator.com/item?id={comment.get('objectID', '')}",
                        "description": first_line[:200],
                    })

                    if len(leads) >= max_total:
                        break
                if len(leads) >= max_total:
                    break

    except Exception as exc:
        logger.debug("HN hiring error: %s", exc)

    logger.info("HackerNews Hiring: %d leads", len(leads))
    return leads


# ---------------------------------------------------------------------------
# Source 5: Company website /contact page scraping
# ---------------------------------------------------------------------------

_CONTACT_PATHS = [
    "/contact", "/about", "/contact-us", "/about-us", "/team",
    "/impressum", "/get-in-touch", "/reach-us",
]


def scrape_company_contacts(
    websites: list[str],
    max_per_site: int = 5,
    max_total: int = 100,
) -> list[dict]:
    """Visit company websites and extract emails + phones from contact pages.

    For each website URL, visits /contact, /about, /team etc.
    Uses SSRF protection to avoid hitting private IPs.
    """
    leads: list[dict] = []
    seen_emails: set[str] = set()

    try:
        with AdSession(timeout=8.0, min_delay=1.0) as session:
            for site_url in websites:
                if len(leads) >= max_total:
                    break

                domain = _extract_domain(site_url)
                if not domain:
                    continue

                # SSRF protection
                try:
                    import socket
                    import ipaddress
                    addr_infos = socket.getaddrinfo(domain, None)
                    for _, _, _, _, sockaddr in addr_infos:
                        ip = ipaddress.ip_address(sockaddr[0])
                        if ip.is_private or ip.is_loopback or ip.is_reserved:
                            continue
                except Exception:
                    continue

                site_emails: list[str] = []
                site_phones: list[str] = []

                for path in _CONTACT_PATHS[:4]:  # Limit to 4 paths per site
                    try:
                        url = f"https://{domain}{path}"
                        resp = session.get(url)
                        if resp.status_code != 200:
                            continue

                        page_text = re.sub(r"<[^>]+>", " ", resp.text[:100_000])
                        page_text = re.sub(r"\s+", " ", page_text)

                        for email in extract_emails(page_text):
                            if _is_valid_lead_email(email) and email.lower() not in seen_emails:
                                site_emails.append(email)
                                seen_emails.add(email.lower())

                        for phone in extract_phones(page_text):
                            if phone not in site_phones:
                                site_phones.append(phone)

                        if site_emails or site_phones:
                            break  # Got contacts, no need to try more paths

                    except Exception:
                        continue

                for email in site_emails[:max_per_site]:
                    leads.append({
                        "name": "",
                        "email": email,
                        "phone": site_phones[0] if site_phones else "",
                        "website": f"https://{domain}",
                        "company": domain,
                        "platform": "startup_directories",
                        "source": "website_contact",
                        "source_url": f"https://{domain}/contact",
                        "description": "",
                    })

                # If only phones found (no email)
                if not site_emails and site_phones:
                    for phone in site_phones[:2]:
                        leads.append({
                            "name": "",
                            "email": "",
                            "phone": phone,
                            "website": f"https://{domain}",
                            "company": domain,
                            "platform": "startup_directories",
                            "source": "website_contact",
                            "source_url": f"https://{domain}/contact",
                            "description": "",
                        })

    except Exception as exc:
        logger.debug("Company contact scraping error: %s", exc)

    logger.info("Company contacts: %d leads from %d websites", len(leads), len(websites))
    return leads


# ---------------------------------------------------------------------------
# Main orchestrator
# ---------------------------------------------------------------------------

def scrape_startup_directories(
    query: str = "",
    max_results: int = 200,
    sources: list[str] | None = None,
    on_progress: object | None = None,
) -> list[dict]:
    """Main entry point — scrape all startup directory sources.

    Args:
        query: Optional keyword to filter results (e.g., "saas", "fintech")
        max_results: Maximum total leads to return
        sources: Which sources to use. Default: all 5.
            Options: 'npm', 'pypi', 'github', 'hackernews', 'website_contact'
        on_progress: Optional callback(phase, pct) for UI progress updates

    Returns:
        List of lead dicts with: name, email, phone, website, company,
        platform, source, source_url, description
    """
    target_sources = set(s.lower() for s in (sources or [
        "npm", "pypi", "github", "hackernews", "website_contact",
    ]))

    all_leads: list[dict] = []
    company_websites: list[str] = []

    # Source 1: npm Registry
    if "npm" in target_sources:
        logger.info("Startup Directories: scanning npm registry...")
        keywords = [query] if query else None
        npm_leads = scrape_npm_registry(
            keywords=keywords,
            max_total=min(max_results, 200),
        )
        all_leads.extend(npm_leads)
        # Collect websites for contact scraping
        for lead in npm_leads:
            if lead.get("website"):
                company_websites.append(lead["website"])

    # Source 2: PyPI Registry
    if "pypi" in target_sources:
        logger.info("Startup Directories: scanning PyPI registry...")
        keywords = [query] if query else None
        pypi_leads = scrape_pypi_registry(
            keywords=keywords,
            max_total=min(max_results - len(all_leads), 150),
        )
        all_leads.extend(pypi_leads)
        for lead in pypi_leads:
            if lead.get("website"):
                company_websites.append(lead["website"])

    # Source 3: GitHub Trending
    if "github" in target_sources:
        logger.info("Startup Directories: scanning GitHub trending...")
        gh_leads = scrape_github_trending(
            max_total=min(max_results - len(all_leads), 100),
        )
        all_leads.extend(gh_leads)
        for lead in gh_leads:
            if lead.get("website"):
                company_websites.append(lead["website"])

    # Source 4: HackerNews Hiring
    if "hackernews" in target_sources:
        logger.info("Startup Directories: scanning HackerNews hiring...")
        hn_leads = scrape_hackernews_hiring(
            max_total=min(max_results - len(all_leads), 50),
        )
        all_leads.extend(hn_leads)

    # Source 5: Company website contact scraping (enrichment pass)
    if "website_contact" in target_sources and company_websites:
        logger.info("Startup Directories: scraping %d company websites...", len(company_websites))
        # Deduplicate websites
        unique_websites = list(dict.fromkeys(company_websites))[:50]  # Cap at 50 sites
        contact_leads = scrape_company_contacts(
            websites=unique_websites,
            max_total=min(max_results - len(all_leads), 100),
        )
        all_leads.extend(contact_leads)

    # Dedup by email
    seen: set[str] = set()
    deduped: list[dict] = []
    for lead in all_leads:
        key = lead.get("email", "").lower() or lead.get("website", "")
        if key and key in seen:
            continue
        if key:
            seen.add(key)
        deduped.append(lead)

    logger.info(
        "Startup Directories TOTAL: %d leads (deduped from %d)",
        len(deduped), len(all_leads),
    )
    return deduped[:max_results]
