"""Seamless hybrid database search — queries 89M+ pre-extracted leads from S3.

Uses DuckDB to query CSV files stored on iDrive E2 (S3-compatible) without
downloading them. Results are merged transparently with live scraping results
so the user never knows the source.

Data sources:
  - LinkedIn: 86.9M records across 187 countries
  - Instagram: 2.45M records (49 datasets)
  - Technology Lookup: 4.3M records across 21 technologies

S3 Location: s3://crop-spray-uploads/leads-cm-database/
  linkedin/{Country}/dataset_N.csv
  instagram/dataset_N.csv
  technology_lookup/{technology}.csv
"""

import asyncio
import json
import logging
import os
import re
import time
from functools import lru_cache
from typing import Optional

logger = logging.getLogger(__name__)

# ─── S3 Configuration ────────────────────────────────────────────────────────
_S3_ENDPOINT = "s3.us-west-1.idrivee2.com"
_S3_BUCKET = "crop-spray-uploads"
_S3_PREFIX = "leads-cm-database"
_S3_REGION = "us-west-1"

# Credentials loaded from environment variables (set in .env or system env)
_S3_ACCESS_KEY = os.getenv("IDRIVE_ACCESS_KEY", "")
_S3_SECRET_KEY = os.getenv("IDRIVE_SECRET_KEY", "")

# ─── Country Name Mapping ────────────────────────────────────────────────────
# Maps common location inputs to S3 folder names (underscored)
_COUNTRY_ALIASES: dict[str, str] = {
    "us": "United_States", "usa": "United_States", "united states": "United_States",
    "america": "United_States", "u.s.": "United_States", "u.s.a.": "United_States",
    "uk": "United_Kingdom", "united kingdom": "United_Kingdom", "england": "United_Kingdom",
    "britain": "United_Kingdom", "great britain": "United_Kingdom",
    "uae": "United_Arab_Emirates", "united arab emirates": "United_Arab_Emirates",
    "south korea": "South_Korea", "korea": "South_Korea",
    "new zealand": "New_Zealand", "saudi arabia": "Saudi_Arabia",
    "south africa": "South_Africa", "sri lanka": "Sri_Lanka",
    "czech republic": "Czech_Republic", "north macedonia": "North_Macedonia",
    "costa rica": "Costa_Rica", "el salvador": "El_Salvador",
    "dominican republic": "Dominican_Republic", "trinidad": "Trinidad_and_Tobago",
    "papua new guinea": "Papua_New_Guinea", "sierra leone": "Sierra_Leone",
    "burkina faso": "Burkina_Faso", "central african republic": "Central_African_Republic",
    "equatorial guinea": "Equatorial_Guinea", "guinea-bissau": "Guinea-Bissau",
    "bosnia": "Bosnia_and_Herzegovina", "antigua": "Antigua_and_Barbuda",
    "saint kitts": "Saint_Kitts_and_Nevis", "saint lucia": "Saint_Lucia",
    "saint vincent": "Saint_Vincent_and_the_Grenadines",
    "marshall islands": "Marshall_Islands", "solomon islands": "Solomon_Islands",
    "vatican": "Vatican_City", "south sudan": "South_Sudan",
}

# All known S3 country folder names (populated from manifest or hardcoded)
_KNOWN_COUNTRIES: list[str] = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua_and_Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahrain",
    "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia_and_Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina_Faso", "Burundi", "Cambodia", "Cameroon", "Canada",
    "Central_African_Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
    "Costa_Rica", "Croatia", "Cuba", "Cyprus", "Czech_Republic", "Denmark",
    "Djibouti", "Dominica", "Dominican_Republic", "Ecuador", "Egypt", "El_Salvador",
    "Equatorial_Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
    "Finland", "France", "Gabon", "Georgia", "Germany", "Ghana", "Greece",
    "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
    "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
    "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
    "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
    "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
    "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
    "Marshall_Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
    "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Namibia", "Nauru",
    "Nepal", "Netherlands", "New_Zealand", "Nicaragua", "Niger", "Nigeria",
    "North_Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
    "Papua_New_Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar", "Romania", "Russia", "Rwanda", "Saint_Kitts_and_Nevis", "Saint_Lucia",
    "Saint_Vincent_and_the_Grenadines", "Samoa", "San_Marino", "Saudi_Arabia",
    "Senegal", "Serbia", "Seychelles", "Sierra_Leone", "Singapore", "Slovakia",
    "Slovenia", "Solomon_Islands", "Somalia", "South_Africa", "South_Korea",
    "South_Sudan", "Spain", "Sri_Lanka", "Sudan", "Suriname", "Sweden",
    "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo",
    "Tonga", "Trinidad_and_Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United_Arab_Emirates", "United_Kingdom", "United_States",
    "Uruguay", "Uzbekistan", "Vanuatu", "Vatican_City", "Venezuela", "Vietnam",
    "Yemen", "Zambia", "Zimbabwe",
]

# LinkedIn schema columns
_LINKEDIN_COLS = [
    "name", "title", "department", "managementlevel", "email", "phone",
    "linkedin", "city", "state", "country", "postalcode", "company", "revenue",
    "foundedyear", "employees", "keywords", "industry", "description",
    "languages", "cfacebook", "clinkedin", "cx", "website", "cphone",
    "technologies", "ccity", "cstate", "ccountry", "cpostalcode",
    "totalfunding", "status",
]

# Instagram schema columns
_INSTAGRAM_COLS = [
    "bio", "category", "email", "followerCount", "followingCount",
    "name", "phone", "username", "website", "status",
]


def _resolve_country(location: str) -> list[str]:
    """Resolve a location string to one or more S3 country folder names.

    Handles aliases, fuzzy matching, and city/state → country mapping.
    Returns list of matching country folder names.
    """
    if not location:
        return ["United_States"]  # default to US if no location given

    loc_lower = location.lower().strip()

    # Direct alias match
    if loc_lower in _COUNTRY_ALIASES:
        return [_COUNTRY_ALIASES[loc_lower]]

    # Try matching against known country names (case-insensitive)
    for country in _KNOWN_COUNTRIES:
        if loc_lower == country.lower().replace("_", " "):
            return [country]

    # Try partial match (e.g., "new york" → search in United_States)
    # Common US states/cities
    us_states = {
        "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
        "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
        "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana",
        "maine", "maryland", "massachusetts", "michigan", "minnesota",
        "mississippi", "missouri", "montana", "nebraska", "nevada",
        "new hampshire", "new jersey", "new mexico", "new york",
        "north carolina", "north dakota", "ohio", "oklahoma", "oregon",
        "pennsylvania", "rhode island", "south carolina", "south dakota",
        "tennessee", "texas", "utah", "vermont", "virginia", "washington",
        "west virginia", "wisconsin", "wyoming",
    }
    us_cities = {
        "new york", "los angeles", "chicago", "houston", "phoenix",
        "philadelphia", "san antonio", "san diego", "dallas", "san jose",
        "austin", "jacksonville", "fort worth", "columbus", "charlotte",
        "indianapolis", "san francisco", "seattle", "denver", "nashville",
        "boston", "las vegas", "portland", "memphis", "oklahoma city",
        "louisville", "baltimore", "milwaukee", "albuquerque", "tucson",
        "fresno", "mesa", "sacramento", "atlanta", "omaha", "miami",
        "detroit", "minneapolis", "tampa", "orlando", "st. louis",
        "pittsburgh", "cincinnati", "cleveland", "raleigh",
    }

    if loc_lower in us_states or loc_lower in us_cities:
        return ["United_States"]

    # UK cities
    uk_cities = {
        "london", "manchester", "birmingham", "leeds", "glasgow",
        "liverpool", "bristol", "edinburgh", "cardiff", "belfast",
        "newcastle", "sheffield", "nottingham", "southampton", "oxford",
        "cambridge", "brighton", "leicester", "aberdeen", "dundee",
    }
    if loc_lower in uk_cities:
        return ["United_Kingdom"]

    # Canadian cities
    ca_cities = {
        "toronto", "vancouver", "montreal", "calgary", "ottawa",
        "edmonton", "winnipeg", "quebec city", "hamilton", "halifax",
    }
    if loc_lower in ca_cities:
        return ["Canada"]

    # Australian cities
    au_cities = {
        "sydney", "melbourne", "brisbane", "perth", "adelaide",
        "gold coast", "canberra", "hobart", "darwin",
    }
    if loc_lower in au_cities:
        return ["Australia"]

    # Indian cities
    in_cities = {
        "mumbai", "delhi", "bangalore", "hyderabad", "ahmedabad",
        "chennai", "kolkata", "pune", "jaipur", "lucknow",
        "new delhi", "bengaluru", "noida", "gurgaon", "gurugram",
    }
    if loc_lower in in_cities:
        return ["India"]

    # Try substring match against country names
    matches = []
    for country in _KNOWN_COUNTRIES:
        country_readable = country.replace("_", " ").lower()
        if loc_lower in country_readable or country_readable in loc_lower:
            matches.append(country)

    if matches:
        return matches

    # Fallback: search US (largest dataset)
    return ["United_States"]


def _get_duckdb_connection():
    """Create a DuckDB connection configured for S3 access."""
    try:
        import duckdb
    except ImportError:
        logger.warning("DuckDB not installed — database search unavailable")
        return None

    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute(f"SET s3_endpoint='{_S3_ENDPOINT}';")
    con.execute(f"SET s3_access_key_id='{_S3_ACCESS_KEY}';")
    con.execute(f"SET s3_secret_access_key='{_S3_SECRET_KEY}';")
    con.execute(f"SET s3_region='{_S3_REGION}';")
    con.execute("SET s3_url_style='path';")
    return con


def _build_linkedin_query(keyword: str, countries: list[str], location: str,
                          max_results: int, dataset_limit: int = 3) -> tuple[str, list[str]]:
    """Build DuckDB SQL to query LinkedIn CSVs on S3.

    Searches across multiple fields: industry, title, keywords, company, description.
    Only queries first N datasets per country to limit scan time.
    Returns (sql, s3_paths).
    """
    s3_paths = []
    for country in countries:
        # Query first N datasets for each country (balances speed vs coverage)
        for i in range(1, dataset_limit + 1):
            s3_paths.append(
                f"s3://{_S3_BUCKET}/{_S3_PREFIX}/linkedin/{country}/dataset_{i}.csv"
            )

    if not s3_paths:
        return "", []

    # Escape single quotes in keyword
    kw_safe = keyword.replace("'", "''").lower().strip()

    # Split compound keywords into individual terms for broader matching
    # e.g., "Tech Startups" matches industry LIKE '%tech%' AND LIKE '%startups%'
    # but also try the full phrase for exact matches
    kw_terms = [t.strip() for t in kw_safe.split() if len(t.strip()) > 2]

    # Build WHERE clause — search across multiple fields
    # Strategy: match ANY field that contains ALL keyword terms (for multi-word)
    # OR match ANY field that contains the full phrase
    if len(kw_terms) > 1:
        # Multi-word: each field must contain ALL terms (AND logic per field)
        field_conditions = []
        for field in ['industry', 'title', 'keywords', 'company']:
            term_matches = [f"LOWER({field}) LIKE '%{t}%'" for t in kw_terms]
            field_conditions.append(f"({' AND '.join(term_matches)})")
        # Also try full phrase match on each field
        for field in ['industry', 'title', 'keywords', 'company']:
            field_conditions.append(f"LOWER({field}) LIKE '%{kw_safe}%'")
        where_parts = field_conditions
    else:
        # Single word: simple LIKE match
        where_parts = [
            f"LOWER(industry) LIKE '%{kw_safe}%'",
            f"LOWER(title) LIKE '%{kw_safe}%'",
            f"LOWER(keywords) LIKE '%{kw_safe}%'",
            f"LOWER(company) LIKE '%{kw_safe}%'",
        ]

    # Also filter by city/state if location looks like a city/state
    loc_lower = location.lower().strip() if location else ""
    loc_filter = ""
    if loc_lower and loc_lower not in _COUNTRY_ALIASES and loc_lower not in {
        c.lower().replace("_", " ") for c in _KNOWN_COUNTRIES
    }:
        # Location is likely a city or state — add location filter
        loc_safe = loc_lower.replace("'", "''")
        loc_filter = f" AND (LOWER(city) LIKE '%{loc_safe}%' OR LOWER(state) LIKE '%{loc_safe}%')"

    where_clause = f"({' OR '.join(where_parts)}){loc_filter}"

    # Union across all datasets
    unions = []
    for path in s3_paths:
        unions.append(
            f"SELECT name, title, email, phone, company, city, state, country, "
            f"industry, website, linkedin, keywords, description, employees, revenue "
            f"FROM read_csv_auto('{path}', ignore_errors=true) "
            f"WHERE {where_clause}"
        )

    sql = " UNION ALL ".join(unions) + f" LIMIT {max_results}"
    return sql, s3_paths


def _build_instagram_query(keyword: str, max_results: int,
                           dataset_limit: int = 5) -> tuple[str, list[str]]:
    """Build DuckDB SQL to query Instagram CSVs on S3."""
    s3_paths = []
    for i in range(1, dataset_limit + 1):
        s3_paths.append(
            f"s3://{_S3_BUCKET}/{_S3_PREFIX}/instagram/dataset_{i}.csv"
        )

    kw_safe = keyword.replace("'", "''").lower().strip()

    # Split compound keywords for broader matching (same as LinkedIn)
    kw_terms = [t.strip() for t in kw_safe.split() if len(t.strip()) > 2]

    if len(kw_terms) > 1:
        field_conditions = []
        for field in ['category', 'bio', 'name', 'username']:
            term_matches = [f"LOWER({field}) LIKE '%{t}%'" for t in kw_terms]
            field_conditions.append(f"({' AND '.join(term_matches)})")
        for field in ['category', 'bio', 'name', 'username']:
            field_conditions.append(f"LOWER({field}) LIKE '%{kw_safe}%'")
        where_parts = field_conditions
    else:
        where_parts = [
            f"LOWER(category) LIKE '%{kw_safe}%'",
            f"LOWER(bio) LIKE '%{kw_safe}%'",
            f"LOWER(name) LIKE '%{kw_safe}%'",
            f"LOWER(username) LIKE '%{kw_safe}%'",
        ]

    unions = []
    for path in s3_paths:
        unions.append(
            f"SELECT name, username, email, phone, bio, category, website, followerCount "
            f"FROM read_csv_auto('{path}', ignore_errors=true) "
            f"WHERE {' OR '.join(where_parts)}"
        )

    sql = " UNION ALL ".join(unions) + f" LIMIT {max_results}"
    return sql, s3_paths


def _linkedin_row_to_lead(row: tuple, keyword: str) -> dict:
    """Convert a LinkedIn DuckDB row to a standard lead dict."""
    name = str(row[0] or "").strip()
    title = str(row[1] or "").strip()
    email = str(row[2] or "").strip()
    phone = str(row[3] or "").strip()
    company = str(row[4] or "").strip()
    city = str(row[5] or "").strip()
    state = str(row[6] or "").strip()
    country = str(row[7] or "").strip()
    industry = str(row[8] or "").strip()
    website = str(row[9] or "").strip()
    linkedin_id = str(row[10] or "").strip()
    keywords_field = str(row[11] or "").strip()
    description = str(row[12] or "").strip()
    employees = str(row[13] or "").strip()
    revenue = str(row[14] or "").strip()

    # Skip rows without usable contact info
    if not email and not phone:
        return {}

    # Clean up email (skip "None" or invalid)
    if email.lower() in ("none", "nan", "null", ""):
        email = ""

    # Clean up phone
    if phone.lower() in ("none", "nan", "null", ""):
        phone = ""

    if not email and not phone:
        return {}

    # Build source URL from LinkedIn ID
    source_url = ""
    if linkedin_id and linkedin_id.lower() not in ("none", "nan"):
        source_url = f"https://linkedin.com/in/{linkedin_id}"

    # Build display name with title
    display_name = name
    if title and title.lower() not in ("none", "nan"):
        display_name = f"{name} - {title}" if name else title

    location_parts = [p for p in [city, state, country] if p and p.lower() not in ("none", "nan")]
    location_str = ", ".join(location_parts)

    return {
        "email": email,
        "phone": phone,
        "name": display_name,
        "platform": "linkedin",
        "source_url": source_url,
        "keyword": keyword,
        "company": company if company.lower() not in ("none", "nan") else "",
        "industry": industry if industry.lower() not in ("none", "nan") else "",
        "location": location_str,
        "website": website if website.lower() not in ("none", "nan") else "",
    }


def _instagram_row_to_lead(row: tuple, keyword: str) -> dict:
    """Convert an Instagram DuckDB row to a standard lead dict."""
    name = str(row[0] or "").strip()
    username = str(row[1] or "").strip()
    email = str(row[2] or "").strip()
    phone = str(row[3] or "").strip()
    bio = str(row[4] or "").strip()
    category = str(row[5] or "").strip()
    website = str(row[6] or "").strip()
    followers = str(row[7] or "").strip()

    # Skip rows without usable contact info
    if not email and not phone:
        return {}

    if email.lower() in ("none", "nan", "null", ""):
        email = ""
    if phone.lower() in ("none", "nan", "null", ""):
        phone = ""

    if not email and not phone:
        return {}

    source_url = f"https://instagram.com/{username}" if username else ""

    return {
        "email": email,
        "phone": phone,
        "name": name if name.lower() not in ("none", "nan") else username,
        "platform": "instagram",
        "source_url": source_url,
        "keyword": keyword,
        "company": "",
        "industry": category if category.lower() not in ("none", "nan") else "",
        "location": "",
        "website": website if website.lower() not in ("none", "nan") else "",
    }


async def search_database_linkedin(
    keyword: str,
    location: str = "",
    max_results: int = 50,
    dataset_limit: int = 3,
) -> list[dict]:
    """Search the LinkedIn leads database for matching records.

    Args:
        keyword: Industry/job/company keyword to search for
        location: Optional location (country, state, city)
        max_results: Maximum results to return
        dataset_limit: Max datasets per country to scan (controls speed vs coverage)

    Returns:
        List of lead dicts in standard format (same as live scraping results)
    """
    start_time = time.time()
    leads: list[dict] = []

    try:
        countries = _resolve_country(location)
        sql, s3_paths = _build_linkedin_query(keyword, countries, location, max_results, dataset_limit)

        if not sql:
            return []

        # Run DuckDB query in thread pool to avoid blocking async loop
        loop = asyncio.get_event_loop()

        def _execute_query() -> list[tuple]:
            con = _get_duckdb_connection()
            if not con:
                return []
            try:
                return con.execute(sql).fetchall()
            except Exception as e:
                logger.warning("LinkedIn database query failed: %s", e)
                return []
            finally:
                con.close()

        rows = await loop.run_in_executor(None, _execute_query)

        for row in rows:
            lead = _linkedin_row_to_lead(row, keyword)
            if lead:
                leads.append(lead)

        elapsed = time.time() - start_time
        logger.info(
            "Database LinkedIn search: '%s' in %s → %d leads (%.1fs, scanned %d files)",
            keyword, countries, len(leads), elapsed, len(s3_paths),
        )

    except Exception as e:
        logger.warning("Database LinkedIn search failed for '%s': %s", keyword, e)

    return leads


async def search_database_instagram(
    keyword: str,
    max_results: int = 30,
    dataset_limit: int = 5,
) -> list[dict]:
    """Search the Instagram leads database for matching records.

    Args:
        keyword: Category/bio/name keyword to search for
        max_results: Maximum results to return
        dataset_limit: Max datasets to scan

    Returns:
        List of lead dicts in standard format
    """
    start_time = time.time()
    leads: list[dict] = []

    try:
        sql, s3_paths = _build_instagram_query(keyword, max_results, dataset_limit)

        if not sql:
            return []

        loop = asyncio.get_event_loop()

        def _execute_query() -> list[tuple]:
            con = _get_duckdb_connection()
            if not con:
                return []
            try:
                return con.execute(sql).fetchall()
            except Exception as e:
                logger.warning("Instagram database query failed: %s", e)
                return []
            finally:
                con.close()

        rows = await loop.run_in_executor(None, _execute_query)

        for row in rows:
            lead = _instagram_row_to_lead(row, keyword)
            if lead:
                leads.append(lead)

        elapsed = time.time() - start_time
        logger.info(
            "Database Instagram search: '%s' → %d leads (%.1fs, scanned %d files)",
            keyword, len(leads), elapsed, len(s3_paths),
        )

    except Exception as e:
        logger.warning("Database Instagram search failed for '%s': %s", keyword, e)

    return leads


async def search_database_hybrid(
    keywords: list[str],
    platforms: list[str],
    location: str = "",
    max_results_per_keyword: int = 50,
) -> list[dict]:
    """Search the pre-built database across multiple platforms and keywords.

    This is the main entry point for the hybrid search system.
    Searches LinkedIn and Instagram databases in parallel for each keyword.

    Args:
        keywords: List of search keywords
        platforms: List of platform names to search
        location: Optional location filter
        max_results_per_keyword: Max results per keyword per platform

    Returns:
        Combined deduplicated lead list
    """
    all_leads: list[dict] = []
    seen_emails: set[str] = set()
    seen_phones: set[str] = set()

    # Determine which databases to search based on requested platforms
    search_linkedin = any(p in ("linkedin", "all") for p in platforms)
    search_instagram = any(p in ("instagram", "all") for p in platforms)

    # If no specific social platforms requested but general platforms are,
    # still search the database since results are transparent
    if not search_linkedin and not search_instagram:
        # Search both databases for any platform request — results appear
        # as linkedin/instagram leads transparently mixed with live results
        search_linkedin = True
        search_instagram = True

    for keyword in keywords:
        tasks = []

        if search_linkedin:
            tasks.append(
                search_database_linkedin(keyword, location, max_results_per_keyword)
            )
        if search_instagram:
            tasks.append(
                search_database_instagram(keyword, max_results_per_keyword // 2)
            )

        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for result in results:
                if isinstance(result, Exception):
                    logger.warning("Database search task failed: %s", result)
                    continue
                for lead in result:
                    # Deduplicate by email or phone
                    email = lead.get("email", "")
                    phone = lead.get("phone", "")
                    if email and email in seen_emails:
                        continue
                    if phone and not email and phone in seen_phones:
                        continue
                    if email:
                        seen_emails.add(email)
                    if phone:
                        seen_phones.add(phone)
                    all_leads.append(lead)

    logger.info(
        "Database hybrid search: %d keywords, %d platforms → %d unique leads",
        len(keywords), len(platforms), len(all_leads),
    )

    return all_leads


def deduplicate_leads(db_leads: list[dict], live_leads: list[dict]) -> list[dict]:
    """Merge database leads with live scraping leads, removing duplicates.

    Database leads come first (instant), live leads supplement.
    Deduplication is by email and phone number.

    Returns combined list with duplicates removed.
    """
    combined: list[dict] = []
    seen_emails: set[str] = set()
    seen_phones: set[str] = set()

    # Add database leads first (they're instant and reliable)
    for lead in db_leads:
        email = lead.get("email", "").strip().lower()
        phone = lead.get("phone", "").strip()
        if email and email in seen_emails:
            continue
        if phone and not email and phone in seen_phones:
            continue
        if email:
            seen_emails.add(email)
        if phone:
            seen_phones.add(phone)
        combined.append(lead)

    # Add live leads that aren't duplicates
    for lead in live_leads:
        email = lead.get("email", "").strip().lower()
        phone = lead.get("phone", "").strip()
        if email and email in seen_emails:
            continue
        if phone and not email and phone in seen_phones:
            continue
        if email:
            seen_emails.add(email)
        if phone:
            seen_phones.add(phone)
        combined.append(lead)

    return combined
