# Feature Engines Documentation

This document lists the backend engine/library powering each extraction and automation feature in SnapLeads.

## Extraction Engines

| Feature | Engine / Library | Description |
|---------|-----------------|-------------|
| **Google Dorking** | `Serper API` (with CAPTCHA bypass fallback via `capsolver`) | Primary extraction method. Queries Google via Serper API for indexed emails/phones. Falls back to headless CAPTCHA solving if rate-limited. |
| **Direct Scraping** | `Patchright` (headless Chromium) | Secondary method. Launches headless browser to scrape platform pages directly. Uses stealth patches to avoid detection. |
| **Google Maps** | `Selenium` + `Patchright` fallback | Searches Google Maps for businesses by query/location. Selenium handles initial search; Patchright used as fallback engine. |
| **Email Finder** | `httpx` + `BeautifulSoup` | Crawls websites to find email addresses. Uses httpx for async HTTP requests and BeautifulSoup for HTML parsing. |
| **Telegram** | `Telethon` (async MTProto) | Connects to Telegram API via MTProto protocol to extract members/messages from groups and channels. |
| **WhatsApp** | `Patchright` (headless Chromium) | Automates WhatsApp Web via headless browser to extract group member info and messages. |
| **Reddit** | `Reddit API` + RSS/PullPush fallback | Uses official Reddit API for subreddit/post data. Falls back to RSS feeds or PullPush archive if API is unavailable. |

## Automation Engines

| Feature | Engine / Library | Description |
|---------|-----------------|-------------|
| **Scheduled Extractions** | `APScheduler` | Runs extraction jobs on user-defined schedules (cron or interval). Persists schedules in SQLite. |
| **Email Outreach** | `SMTP` (smtplib) | Sends personalized email campaigns via user-configured SMTP server. Supports templates with variable substitution. |
| **CRM Export** | `HubSpot SDK` / `Salesforce SDK` | Exports leads to CRM platforms. Uses official Python SDKs for HubSpot and Salesforce integration. |

## Enhancement Engines

| Feature | Engine / Library | Description |
|---------|-----------------|-------------|
| **Lead Scoring** | Local algorithm (Python) | Scores leads 0-100 based on data completeness, email validity, phone format, platform reliability, and keyword relevance. |
| **Duplicate Detection** | Hash-based comparison (Python) | Uses MD5 hashing of normalized email+phone+name to identify and remove duplicate leads across sessions. |
| **Email Verification** | MX record check (`dnspython`) | Validates email deliverability by checking MX records of the email domain. |
| **Firecrawl Enrichment** | `Firecrawl API` | Optional enrichment that scrapes business websites found in results for additional contact information. |

## Anti-Detection

| Feature | Engine / Library | Description |
|---------|-----------------|-------------|
| **Proxy Rotation** | Built-in proxy pool | Supports HTTP/HTTPS/SOCKS5 proxies with round-robin or random rotation. |
| **CAPTCHA Solving** | `capsolver` API | Automated CAPTCHA bypass for Google and other platforms when rate-limited. |
| **Browser Stealth** | `Patchright` stealth patches | Chromium browser with anti-fingerprinting patches to avoid bot detection. |
