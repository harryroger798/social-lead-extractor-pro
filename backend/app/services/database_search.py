"""Seamless hybrid database search — queries 93M+ pre-extracted leads from S3.

Uses DuckDB to query CSV files stored on iDrive E2 (S3-compatible) without
downloading them. Results are merged transparently with live scraping results
so the user never knows the source.

Data sources:
  - LinkedIn: 86.9M records across 187 countries
  - Instagram: 2.45M records (49 datasets)
  - Technology Lookup: 4.3M records across 21 technologies
  - Google Maps: PhantomBuster-extracted business data (v3.5.10)
  - PAN India: 3M+ Indian business records across 30+ categories (v3.5.10)

S3 Location: s3://crop-spray-uploads/leads-cm-database/
  linkedin/{Country}/dataset_N.csv
  instagram/dataset_N.csv
  technology_lookup/{technology}.csv
  googlemaps/dataset_N.csv
  pan_india/dataset_N.csv
"""

import asyncio
import logging
import os
import re
import shutil
import sys
import threading
import time

logger = logging.getLogger(__name__)


def _sanitize_sql_term(term: str) -> str:
    """Sanitize a search term for safe SQL LIKE interpolation.

    Removes all characters except alphanumeric, spaces, hyphens, dots, and
    underscores. V7-fix: allow underscores because CSV industry/category
    fields use them (e.g., "information_technology", "real_estate").
    Also removes SQL LIKE wildcard % to prevent injection.
    """
    # Only allow safe characters in search terms (including underscores)
    cleaned = re.sub(r"[^a-zA-Z0-9\s\-\._]", "", term)
    # Strip SQL LIKE wildcard %
    cleaned = cleaned.replace("%", "")
    return cleaned.strip().lower()


def _escape_like(term: str) -> str:
    """Escape SQL LIKE wildcard characters in a search term.

    V7-fix R3: In SQL LIKE, _ matches any single char and % matches any string.
    Both must be escaped when used as literal characters in search patterns.
    Uses backslash escaping with ESCAPE '\\' clause in the query.
    """
    return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _sanitize_location_term(location: str) -> str:
    """R5-B03/B06 fix: separate sanitizer for location strings.

    Preserves spaces and hyphens needed for city/state matching
    (e.g., "New Delhi", "Andhra Pradesh") but strips injection chars.
    Only allows [a-zA-Z0-9 -] — no dots, no underscores, no SQL wildcards.
    """
    cleaned = re.sub(r"[^a-zA-Z0-9\s\-]", "", location)
    cleaned = cleaned.replace("%", "").replace("_", "")
    return cleaned.strip().lower()

# ─── S3 Configuration ────────────────────────────────────────────────────────
_S3_ENDPOINT = "s3.us-west-1.idrivee2.com"
_S3_BUCKET = "crop-spray-uploads"
_S3_PREFIX = "leads-cm-database"
_S3_REGION = "us-west-1"

# Credentials: environment variable → embedded fallback (base64-obfuscated).
# In PyInstaller desktop builds env vars are not set, so we need defaults.
import base64 as _b64  # noqa: E402

_S3_ACCESS_KEY = os.getenv("IDRIVE_ACCESS_KEY", "") or _b64.b64decode(
    b"RVFRNTNWbTRDcjlSb3YxRnNPUHQ="
).decode()
_S3_SECRET_KEY = os.getenv("IDRIVE_SECRET_KEY", "") or _b64.b64decode(
    b"ZmFyOFhuZUZYM05IOVVUNkhGVWpBQXQ5WVozQ0I4Um1KaUN2S3BlNg=="
).decode()

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
    # R5-B27 fix: add direct country name aliases for O(1) lookup
    "india": "India", "china": "China", "russia": "Russia", "japan": "Japan",
    "germany": "Germany", "france": "France", "brazil": "Brazil", "canada": "Canada",
    "australia": "Australia", "mexico": "Mexico", "italy": "Italy", "spain": "Spain",
    "indonesia": "Indonesia", "turkey": "Turkey", "pakistan": "Pakistan",
    "nigeria": "Nigeria", "bangladesh": "Bangladesh", "philippines": "Philippines",
    "egypt": "Egypt", "vietnam": "Vietnam", "thailand": "Thailand",
    "malaysia": "Malaysia", "singapore": "Singapore", "israel": "Israel",
    "netherlands": "Netherlands", "sweden": "Sweden", "norway": "Norway",
    "denmark": "Denmark", "finland": "Finland", "switzerland": "Switzerland",
    "ireland": "Ireland", "portugal": "Portugal", "poland": "Poland",
    "belgium": "Belgium", "austria": "Austria", "greece": "Greece",
    "argentina": "Argentina", "colombia": "Colombia", "chile": "Chile",
    "peru": "Peru", "kenya": "Kenya", "ghana": "Ghana",
    "nepal": "Nepal", "morocco": "Morocco", "taiwan": "Taiwan",
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

# Google Maps schema columns (PhantomBuster output, standardized)
_GOOGLEMAPS_COLS = [
    "name", "category", "address", "phone", "website",
    "rating", "reviewCount", "sourceUrl", "query", "currentStatus",
]

# PAN India schema columns (standardized from heterogeneous sources)
_PAN_INDIA_COLS = [
    "name", "phone", "email", "company", "city", "state", "category",
]


def _resolve_country(location: str) -> list[str]:
    """Resolve a location string to one or more S3 country folder names.

    Handles aliases, fuzzy matching, and city/state → country mapping.
    Returns list of matching country folder names.
    """
    # R5-B15 fix: don't default to US for empty location
    # — caller should be explicit; otherwise wrong country is queried
    if not location:
        return []

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

    # Indian cities and states (R5-B26 fix: add Indian states)
    in_locations = {
        # Cities
        "mumbai", "delhi", "bangalore", "hyderabad", "ahmedabad",
        "chennai", "kolkata", "pune", "jaipur", "lucknow",
        "new delhi", "bengaluru", "noida", "gurgaon", "gurugram",
        "chandigarh", "indore", "nagpur", "bhopal", "surat",
        "kochi", "coimbatore", "visakhapatnam", "thiruvananthapuram",
        # States
        "rajasthan", "maharashtra", "tamil nadu", "karnataka",
        "uttar pradesh", "andhra pradesh", "telangana", "gujarat",
        "kerala", "west bengal", "madhya pradesh", "bihar",
        "odisha", "punjab", "haryana", "jharkhand", "chhattisgarh",
        "assam", "goa", "himachal pradesh", "uttarakhand",
    }
    if loc_lower in in_locations:
        return ["India"]

    # Try substring match against country names
    matches = []
    for country in _KNOWN_COUNTRIES:
        country_readable = country.replace("_", " ").lower()
        if loc_lower in country_readable or country_readable in loc_lower:
            matches.append(country)

    if matches:
        return matches

    # R5-B15 fix: return empty list instead of defaulting to US
    # Let the caller handle no-country case (global search or skip)
    logger.debug("Could not resolve location %r to a country", location)
    return []


# R5-B08 fix: thread-safe httpfs installation lock
_HTTPFS_INSTALLED = False
_HTTPFS_LOCK = threading.Lock()


def _get_extension_directory() -> str:
    """v3.5.15: Return a writable directory for DuckDB extensions.

    PyInstaller bundles run from a temporary directory that may not be
    writable for extension downloads.  We explicitly set a known-good
    writable path so ``INSTALL httpfs`` always succeeds.

    Priority:
      1. %APPDATA%/duckdb/extensions  (Windows)
      2. ~/Library/Application Support/duckdb/extensions  (macOS)
      3. ~/.duckdb/extensions  (Linux / fallback)
      4. %TEMP%/duckdb_extensions  (last resort)
    """
    import platform as _plat

    home = os.path.expanduser("~")
    system = _plat.system()

    if system == "Windows":
        appdata = os.environ.get("APPDATA", os.path.join(home, "AppData", "Roaming"))
        ext_dir = os.path.join(appdata, "duckdb", "extensions")
    elif system == "Darwin":
        ext_dir = os.path.join(home, "Library", "Application Support", "duckdb", "extensions")
    else:
        ext_dir = os.path.join(home, ".duckdb", "extensions")

    try:
        os.makedirs(ext_dir, exist_ok=True)
        # Verify writable
        test_file = os.path.join(ext_dir, ".write_test")
        with open(test_file, "w") as f:
            f.write("ok")
        os.remove(test_file)
        return ext_dir
    except OSError:
        # Fallback to temp directory
        import tempfile
        fallback = os.path.join(tempfile.gettempdir(), "duckdb_extensions")
        os.makedirs(fallback, exist_ok=True)
        logger.info("Using temp extension dir: %s", fallback)
        return fallback


def _ensure_bundled_httpfs(ext_dir: str) -> bool:
    """v3.5.15: Extract bundled httpfs extension zip to the writable extension dir.

    PyInstaller builds bundle ``httpfs_bundle.zip`` (a zip of the pre-installed
    httpfs extension tree) in the frozen app directory.  This avoids macOS
    codesign failures that occur when PyInstaller processes raw ``.duckdb_extension``
    files.  At runtime we extract the zip into *ext_dir* so ``LOAD httpfs`` works
    without any network download.

    Also supports a fallback ``duckdb_extensions/`` directory for --onedir builds.

    Returns True if bundled extension was found and extracted (or already present).
    """
    import zipfile

    # --- Strategy 1: Look for httpfs_bundle.zip (preferred, avoids codesign) ---
    zip_path = None
    meipass = getattr(sys, "_MEIPASS", None)
    if meipass:
        candidate = os.path.join(meipass, "httpfs_bundle.zip")
        if os.path.isfile(candidate):
            zip_path = candidate
    if not zip_path:
        exe_dir = os.path.dirname(os.path.abspath(sys.executable))
        candidate = os.path.join(exe_dir, "httpfs_bundle.zip")
        if os.path.isfile(candidate):
            zip_path = candidate

    if zip_path:
        try:
            extracted = 0
            with zipfile.ZipFile(zip_path, "r") as zf:
                for info in zf.infolist():
                    if info.is_dir():
                        continue
                    dst = os.path.join(ext_dir, info.filename)
                    # Only extract if missing or smaller (corrupt)
                    if not os.path.exists(dst) or os.path.getsize(dst) < info.file_size:
                        os.makedirs(os.path.dirname(dst), exist_ok=True)
                        zf.extract(info, ext_dir)
                        extracted += 1
                        logger.info("Extracted bundled extension: %s -> %s", info.filename, dst)
            if extracted > 0:
                logger.info("Extracted %d file(s) from %s to %s", extracted, zip_path, ext_dir)
            else:
                logger.debug("Bundled extensions already present in %s", ext_dir)
            return True
        except Exception as exc:
            logger.warning("Failed to extract httpfs_bundle.zip: %s", exc)

    # --- Strategy 2: Fallback — look for raw duckdb_extensions/ directory ---
    bundled_base = None
    if meipass:
        candidate = os.path.join(meipass, "duckdb_extensions")
        if os.path.isdir(candidate):
            bundled_base = candidate
    if not bundled_base:
        exe_dir = os.path.dirname(os.path.abspath(sys.executable))
        candidate = os.path.join(exe_dir, "duckdb_extensions")
        if os.path.isdir(candidate):
            bundled_base = candidate

    if not bundled_base:
        logger.debug("No bundled httpfs_bundle.zip or duckdb_extensions/ found")
        return False

    copied = 0
    for root, _dirs, files in os.walk(bundled_base):
        for fname in files:
            if fname.endswith(".duckdb_extension") or fname.endswith(".duckdb_extension.info"):
                src = os.path.join(root, fname)
                rel_path = os.path.relpath(src, bundled_base)
                dst = os.path.join(ext_dir, rel_path)
                if not os.path.exists(dst) or os.path.getsize(dst) < os.path.getsize(src):
                    os.makedirs(os.path.dirname(dst), exist_ok=True)
                    shutil.copy2(src, dst)
                    copied += 1
                    logger.info("Copied bundled extension: %s -> %s", rel_path, dst)

    if copied > 0:
        logger.info("Copied %d bundled extension file(s) to %s", copied, ext_dir)
    else:
        logger.debug("Bundled extensions already present in %s", ext_dir)
    return True


def _get_duckdb_connection():
    """Create a DuckDB connection configured for S3 access.

    NOTE: S3 credentials are intentionally embedded (base64-obfuscated) for the
    desktop app distribution.  They are **read-only** and scoped exclusively to
    the ``leads-cm-database/`` prefix on iDrive E2.  No write/delete access.

    v3.5.15: Bundle-first extension loading for PyInstaller compatibility.
    The httpfs extension is now pre-installed during the CI build and bundled
    inside the PyInstaller binary.  At runtime we:
      1. Set an explicit writable extension directory
      2. Copy bundled httpfs files into it (no network download needed)
      3. Try LOAD httpfs directly (skip INSTALL entirely)
      4. Only fall back to INSTALL/FORCE INSTALL if bundled copy is missing
    """
    try:
        import duckdb
    except ImportError:
        logger.warning("DuckDB not installed — database search unavailable")
        return None

    con = duckdb.connect()
    try:
        # v3.5.15: Set explicit writable extension directory BEFORE anything
        ext_dir = _get_extension_directory()
        con.execute(f"SET extension_directory='{ext_dir}';")

        # v3.5.15: Copy bundled extension to writable dir (PyInstaller builds)
        _ensure_bundled_httpfs(ext_dir)

        # R5-B08 fix: thread-safe httpfs installation
        global _HTTPFS_INSTALLED  # noqa: PLW0603
        with _HTTPFS_LOCK:
            if not _HTTPFS_INSTALLED:
                # v3.5.15: Try LOAD first — if bundled extension was copied,
                # this succeeds without any network download.
                try:
                    con.execute("LOAD httpfs;")
                    _HTTPFS_INSTALLED = True
                    logger.info(
                        "httpfs loaded directly (bundled/pre-installed, dir=%s)", ext_dir
                    )
                except Exception as load_err:
                    logger.warning(
                        "Direct LOAD httpfs failed: %s — trying INSTALL", load_err
                    )
                    # Fall back to INSTALL (downloads from CDN)
                    try:
                        con.execute("INSTALL httpfs;")
                        con.execute("LOAD httpfs;")
                    except Exception as install_err:
                        logger.warning(
                            "INSTALL httpfs failed (retrying FORCE): %s", install_err
                        )
                        try:
                            con.execute("FORCE INSTALL httpfs;")
                            con.execute("LOAD httpfs;")
                        except Exception as force_err:
                            logger.error(
                                "ALL httpfs install methods failed: %s (ext_dir=%s)",
                                force_err, ext_dir,
                            )
                            raise
                    _HTTPFS_INSTALLED = True
                    logger.info("httpfs installed+loaded via network (dir=%s)", ext_dir)
        # If already installed by another thread, still need to load in THIS connection
        if _HTTPFS_INSTALLED:
            try:
                con.execute("LOAD httpfs;")
            except Exception:
                pass  # Already loaded above in the same connection
        con.execute(f"SET s3_endpoint='{_S3_ENDPOINT}';")
        con.execute(f"SET s3_access_key_id='{_S3_ACCESS_KEY}';")
        con.execute(f"SET s3_secret_access_key='{_S3_SECRET_KEY}';")
        con.execute(f"SET s3_region='{_S3_REGION}';")
        con.execute("SET s3_url_style='path';")
        return con
    except Exception as exc:
        logger.error("DuckDB connection setup failed: %s", exc, exc_info=True)
        con.close()
        raise


def _build_linkedin_query(
    keyword: str,
    countries: list[str],
    location: str,
    max_results: int,
    dataset_limit: int = 3,
    expanded_terms: list[str] | None = None,
) -> tuple[str, list[str]]:
    """Build DuckDB SQL to query LinkedIn CSVs on S3.

    v3.5.1: Uses OR-based semantic expansion for much broader matching.
    Instead of requiring ALL terms to match (AND), we search for ANY
    expanded synonym across ANY field.

    For "bike owners in India":
      Old: WHERE industry LIKE '%bike%' AND industry LIKE '%owners%'  → 0 results
      New: WHERE industry LIKE '%bike%' OR industry LIKE '%motorcycle%'
           OR industry LIKE '%cycling%' OR title LIKE '%bike%' ...  → 200+ results

    Returns (sql, s3_paths).
    """
    s3_paths = []
    for country in countries:
        for i in range(1, dataset_limit + 1):
            s3_paths.append(
                f"s3://{_S3_BUCKET}/{_S3_PREFIX}/linkedin/{country}/dataset_{i}.csv"
            )

    if not s3_paths:
        return "", []

    # Collect all search terms: original keyword + expanded synonyms
    all_terms: list[str] = []
    kw_safe = _sanitize_sql_term(keyword)
    if kw_safe:
        all_terms.append(kw_safe)

    # Add individual words from the keyword (e.g. "bike owners" → "bike", "owners")
    for word in kw_safe.split():
        word = word.strip()
        if len(word) > 2 and word not in all_terms:
            all_terms.append(word)

    # Add expanded synonyms from keyword_parser (e.g. "motorcycle", "cycling")
    if expanded_terms:
        for term in expanded_terms:
            safe_term = _sanitize_sql_term(term)
            if safe_term and safe_term not in all_terms:
                all_terms.append(safe_term)

    # R5-B19 fix: prioritize original keyword and individual words over synonyms
    # slot 0 = original keyword, slots 1-3 = individual words, slots 4-9 = expanded terms
    prioritized: list[str] = []
    if kw_safe:
        prioritized.append(kw_safe)
    for word in kw_safe.split():
        word = word.strip()
        if len(word) > 2 and word not in prioritized:
            prioritized.append(word)
    # Fill remaining slots with expanded synonyms
    for term in all_terms:
        if term not in prioritized:
            prioritized.append(term)
    search_terms = prioritized[:10]  # R5-B04 fix: increase from 8 to 10

    # Build WHERE clause — OR across ALL terms × key fields only
    # Reduced from 5 fields to 3 most selective for performance
    searchable_fields = ['industry', 'title', 'company']
    where_parts: list[str] = []
    for term in search_terms:
        for fld in searchable_fields:
            escaped = _escape_like(term)
            where_parts.append(f"LOWER({fld}) LIKE '%{escaped}%' ESCAPE '\\'")

    # Also filter by city/state if location looks like a city/state
    # R5-B03/B06 fix: use _sanitize_location_term (preserves spaces, no dots)
    loc_lower = _sanitize_location_term(location) if location else ""
    loc_filter = ""
    if loc_lower and loc_lower not in _COUNTRY_ALIASES and loc_lower not in {
        c.lower().replace("_", " ") for c in _KNOWN_COUNTRIES
    }:
        # R5-B06 fix: loc_lower is sanitized via _sanitize_location_term which
        # only allows [a-zA-Z0-9 -]. DuckDB's read_csv_auto doesn't support
        # parameterized queries, so we rely on strict sanitization.
        loc_filter = f" AND (LOWER(city) LIKE '%{loc_lower}%' OR LOWER(state) LIKE '%{loc_lower}%')"

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

    # Clamp max_results to prevent injection via non-int values
    safe_limit = max(1, min(int(max_results), 500))
    sql = " UNION ALL ".join(unions) + f" LIMIT {safe_limit}"
    return sql, s3_paths


def _build_instagram_query(
    keyword: str,
    max_results: int,
    dataset_limit: int = 5,
    expanded_terms: list[str] | None = None,
) -> tuple[str, list[str]]:
    """Build DuckDB SQL to query Instagram CSVs on S3.

    v3.5.1: Uses OR-based semantic expansion (same approach as LinkedIn).
    """
    s3_paths = []
    for i in range(1, dataset_limit + 1):
        s3_paths.append(
            f"s3://{_S3_BUCKET}/{_S3_PREFIX}/instagram/dataset_{i}.csv"
        )

    # Collect all search terms (sanitized to prevent SQL injection)
    all_terms: list[str] = []
    kw_safe = _sanitize_sql_term(keyword)
    if kw_safe:
        all_terms.append(kw_safe)

    for word in kw_safe.split():
        word = word.strip()
        if len(word) > 2 and word not in all_terms:
            all_terms.append(word)

    if expanded_terms:
        for term in expanded_terms:
            safe_term = _sanitize_sql_term(term)
            if safe_term and safe_term not in all_terms:
                all_terms.append(safe_term)

    # Limit to 8 terms × 3 fields = 24 OR conditions (performant)
    search_terms = all_terms[:8]

    # OR across all terms × key fields
    searchable_fields = ['category', 'bio', 'name']
    where_parts: list[str] = []
    for term in search_terms:
        for fld in searchable_fields:
            escaped = _escape_like(term)
            where_parts.append(f"LOWER({fld}) LIKE '%{escaped}%' ESCAPE '\\'")

    where_clause = " OR ".join(where_parts)

    unions = []
    for path in s3_paths:
        unions.append(
            f"SELECT name, username, email, phone, bio, category, website, followerCount "
            f"FROM read_csv_auto('{path}', ignore_errors=true) "
            f"WHERE {where_clause}"
        )

    # Clamp max_results to prevent injection via non-int values
    safe_limit = max(1, min(int(max_results), 500))
    sql = " UNION ALL ".join(unions) + f" LIMIT {safe_limit}"
    return sql, s3_paths


def _build_googlemaps_query(
    keyword: str,
    max_results: int,
    dataset_limit: int = 5,
    expanded_terms: list[str] | None = None,
) -> tuple[str, list[str]]:
    """Build DuckDB SQL to query Google Maps CSVs on S3.

    v3.5.10: Queries PhantomBuster-extracted Google Maps business data.
    v3.5.13: Handle two PhantomBuster CSV schemas:
      Schema A (datasets 1-3): name, category, address, phone, website, ...
      Schema B (datasets 4+):  title, category, address, phoneNumber, website, ...
    We use COALESCE + TRY_CAST to normalize both schemas into one.
    """
    s3_paths = []
    for i in range(1, dataset_limit + 1):
        s3_paths.append(
            f"s3://{_S3_BUCKET}/{_S3_PREFIX}/googlemaps/dataset_{i}.csv"
        )

    all_terms: list[str] = []
    kw_safe = _sanitize_sql_term(keyword)
    if kw_safe:
        all_terms.append(kw_safe)
    for word in kw_safe.split():
        word = word.strip()
        if len(word) > 2 and word not in all_terms:
            all_terms.append(word)
    if expanded_terms:
        for term in expanded_terms:
            safe_term = _sanitize_sql_term(term)
            if safe_term and safe_term not in all_terms:
                all_terms.append(safe_term)
    search_terms = all_terms[:10]

    # v3.5.13: Build two sets of WHERE clauses for the two schemas.
    # Schema A (datasets 1-3): columns = name, category, query
    # Schema B (datasets 4+):  columns = title, category, query
    where_a_parts: list[str] = []
    where_b_parts: list[str] = []
    for term in search_terms:
        escaped = _escape_like(term)
        where_a_parts.append(f"LOWER(name) LIKE '%{escaped}%' ESCAPE '\\'")
        where_a_parts.append(f"LOWER(category) LIKE '%{escaped}%' ESCAPE '\\'")
        where_a_parts.append(f"LOWER(query) LIKE '%{escaped}%' ESCAPE '\\'")
        where_b_parts.append(f"LOWER(title) LIKE '%{escaped}%' ESCAPE '\\'")
        where_b_parts.append(f"LOWER(category) LIKE '%{escaped}%' ESCAPE '\\'")
        where_b_parts.append(f"LOWER(query) LIKE '%{escaped}%' ESCAPE '\\'")

    where_a = " OR ".join(where_a_parts)
    where_b = " OR ".join(where_b_parts)

    # v3.5.13: Schema A SELECT (name, phone, sourceUrl)
    select_a = (
        "name, category, address, phone, website, rating, "
        "CAST(reviewCount AS VARCHAR) AS reviewCount, sourceUrl, query, currentStatus"
    )
    # v3.5.13: Schema B SELECT (title→name, phoneNumber→phone, placeUrl→sourceUrl)
    select_b = (
        "title AS name, category, address, phoneNumber AS phone, website, rating, "
        "CAST(reviewCount AS VARCHAR) AS reviewCount, placeUrl AS sourceUrl, query, currentStatus"
    )

    unions = []
    for path in s3_paths:
        # Detect schema by dataset number — datasets 1-3 use Schema A, 4+ use Schema B
        # Extract dataset number from path
        ds_num = 0
        try:
            ds_num = int(path.split("dataset_")[1].split(".")[0])
        except (IndexError, ValueError):
            pass

        if ds_num <= 3:
            unions.append(
                f"SELECT {select_a} "
                f"FROM read_csv_auto('{path}', ignore_errors=true) "
                f"WHERE {where_a}"
            )
        else:
            unions.append(
                f"SELECT {select_b} "
                f"FROM read_csv_auto('{path}', ignore_errors=true) "
                f"WHERE {where_b}"
            )

    safe_limit = max(1, min(int(max_results), 500))
    sql = " UNION ALL ".join(unions) + f" LIMIT {safe_limit}"
    return sql, s3_paths


def _build_pan_india_query(
    keyword: str,
    max_results: int,
    dataset_limit: int = 10,
    expanded_terms: list[str] | None = None,
) -> tuple[str, list[str]]:
    """Build DuckDB SQL to query PAN India CSVs on S3.

    v3.5.10: Queries standardized Indian business database.
    Schema: name, phone, email, company, city, state, category
    """
    s3_paths = []
    for i in range(1, dataset_limit + 1):
        s3_paths.append(
            f"s3://{_S3_BUCKET}/{_S3_PREFIX}/pan_india/dataset_{i}.csv"
        )

    all_terms: list[str] = []
    kw_safe = _sanitize_sql_term(keyword)
    if kw_safe:
        all_terms.append(kw_safe)
    for word in kw_safe.split():
        word = word.strip()
        if len(word) > 2 and word not in all_terms:
            all_terms.append(word)
    if expanded_terms:
        for term in expanded_terms:
            safe_term = _sanitize_sql_term(term)
            if safe_term and safe_term not in all_terms:
                all_terms.append(safe_term)
    search_terms = all_terms[:10]

    searchable_fields = ['name', 'company', 'category']
    where_parts: list[str] = []
    for term in search_terms:
        for fld in searchable_fields:
            escaped = _escape_like(term)
            where_parts.append(f"LOWER({fld}) LIKE '%{escaped}%' ESCAPE '\\'")

    where_clause = " OR ".join(where_parts)
    unions = []
    for path in s3_paths:
        # v3.5.13: strict_mode=false handles malformed CSV rows in PAN India data
        unions.append(
            f"SELECT name, phone, email, company, city, state, category "
            f"FROM read_csv_auto('{path}', ignore_errors=true, strict_mode=false) "
            f"WHERE {where_clause}"
        )

    safe_limit = max(1, min(int(max_results), 500))
    sql = " UNION ALL ".join(unions) + f" LIMIT {safe_limit}"
    return sql, s3_paths


def _clean_field(val: str) -> str:
    """Clean a database field — return empty string for null-like values."""
    return "" if val.lower() in ("none", "nan", "null", "") else val


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
    _keywords_field = str(row[11] or "").strip()  # noqa: F841 — reserved for future use
    _description = str(row[12] or "").strip()  # noqa: F841
    _employees = str(row[13] or "").strip()  # noqa: F841
    _revenue = str(row[14] or "").strip()  # noqa: F841

    # v3.5.12: Keep leads even without email/phone — name/title/company/URL
    # are still valuable for outreach (LinkedIn profile, company website, etc.)
    # Previously this discarded ~80% of LinkedIn DB results.
    email = _clean_field(email)
    phone = _clean_field(phone)

    # Build source URL from LinkedIn ID
    source_url = ""
    linkedin_id = _clean_field(linkedin_id)
    if linkedin_id:
        source_url = f"https://linkedin.com/in/{linkedin_id}"

    # Skip rows that have NO useful data at all (not even a name or company)
    if not email and not phone and not name and not _clean_field(company) and not source_url:
        return {}

    # Build display name with title
    display_name = name
    title = _clean_field(title)
    if title:
        display_name = f"{name} - {title}" if name else title

    location_parts = [p for p in [_clean_field(city), _clean_field(state), _clean_field(country)] if p]
    location_str = ", ".join(location_parts)

    return {
        "email": email,
        "phone": phone,
        "name": display_name,
        "platform": "linkedin",
        "source_url": source_url,
        "keyword": keyword,
        "company": _clean_field(company),
        "industry": _clean_field(industry),
        "location": location_str,
        "website": _clean_field(website),
    }


def _instagram_row_to_lead(row: tuple, keyword: str) -> dict:
    """Convert an Instagram DuckDB row to a standard lead dict."""
    name = str(row[0] or "").strip()
    username = str(row[1] or "").strip()
    email = str(row[2] or "").strip()
    phone = str(row[3] or "").strip()
    _bio = str(row[4] or "").strip()  # noqa: F841 — reserved for future use
    category = str(row[5] or "").strip()
    website = str(row[6] or "").strip()
    _followers = str(row[7] or "").strip()  # noqa: F841

    # v3.5.12: Keep leads even without email/phone (username/bio still valuable)
    email = _clean_field(email)
    phone = _clean_field(phone)

    username = _clean_field(username)
    source_url = f"https://instagram.com/{username}" if username else ""

    # Skip only if there's truly no useful data
    if not email and not phone and not username and not _clean_field(name):
        return {}

    return {
        "email": email,
        "phone": phone,
        "name": _clean_field(name) or username,
        "platform": "instagram",
        "source_url": source_url,
        "keyword": keyword,
        "company": "",
        "industry": _clean_field(category),
        "location": "",
        "website": _clean_field(website),
    }


def _googlemaps_row_to_lead(row: tuple, keyword: str) -> dict:
    """Convert a Google Maps DuckDB row to a standard lead dict.

    v3.5.10: Row schema = (name, category, address, phone, website, rating,
                           reviewCount, sourceUrl, query, currentStatus)
    """
    name = str(row[0] or "").strip()
    category = str(row[1] or "").strip()
    address = str(row[2] or "").strip()
    phone = str(row[3] or "").strip()
    website = str(row[4] or "").strip()
    _rating = str(row[5] or "").strip()  # noqa: F841
    _review_count = str(row[6] or "").strip()  # noqa: F841
    source_url = str(row[7] or "").strip()
    _query = str(row[8] or "").strip()  # noqa: F841
    _status = str(row[9] or "").strip()  # noqa: F841

    phone = _clean_field(phone)
    website = _clean_field(website)

    if not phone and not website:
        return {}

    return {
        "email": "",
        "phone": phone,
        "name": _clean_field(name),
        "platform": "google_maps",
        "source_url": _clean_field(source_url),
        "keyword": keyword,
        "company": _clean_field(name),
        "industry": _clean_field(category),
        "location": _clean_field(address),
        "website": website,
    }


def _pan_india_row_to_lead(row: tuple, keyword: str) -> dict:
    """Convert a PAN India DuckDB row to a standard lead dict.

    v3.5.10: Row schema = (name, phone, email, company, city, state, category)
    """
    name = str(row[0] or "").strip()
    phone = str(row[1] or "").strip()
    email = str(row[2] or "").strip()
    company = str(row[3] or "").strip()
    city = str(row[4] or "").strip()
    state = str(row[5] or "").strip()
    category = str(row[6] or "").strip()

    phone = _clean_field(phone)
    email = _clean_field(email)

    if not phone and not email:
        return {}

    location_parts = [p for p in [_clean_field(city), _clean_field(state)] if p]
    location_str = ", ".join(location_parts)

    return {
        "email": email,
        "phone": phone,
        "name": _clean_field(name),
        "platform": "pan_india",
        "source_url": "",
        "keyword": keyword,
        "company": _clean_field(company),
        "industry": _clean_field(category),
        "location": location_str,
        "website": "",
    }


# v3.5.8: timeout for S3 queries — prevents UI freezing on slow connections
# v3.5.13: raised from 30→90s; per-country parallel strategy keeps actual
# wall-clock time low while preventing premature timeout on large scans.
_DB_QUERY_TIMEOUT_SECS = 90


async def search_database_linkedin(
    keyword: str,
    location: str = "",
    max_results: int = 50,
    dataset_limit: int = 3,
    expanded_terms: list[str] | None = None,
) -> list[dict]:
    """Search the LinkedIn leads database for matching records.

    v3.5.1: Accepts expanded_terms from KeywordParser for OR-based search.
    v3.5.13: Per-country parallel queries — each country runs its own
    DuckDB query in a separate thread so results stream in fast.
    Previously one giant UNION ALL across 125 files timed out at 30s.

    Args:
        keyword: Industry/job/company keyword to search for
        location: Optional location (country, state, city)
        max_results: Maximum results to return
        dataset_limit: Max datasets per country to scan (controls speed vs coverage)
        expanded_terms: Synonym-expanded terms for broader matching

    Returns:
        List of lead dicts in standard format (same as live scraping results)
    """
    start_time = time.time()
    leads: list[dict] = []

    try:
        countries = _resolve_country(location)
        is_global = not countries
        # R5-B15 fix: if no country resolved, use top 5 countries for global search
        if is_global:
            countries = ["United_States", "United_Kingdom", "India", "Canada", "Australia"]
            logger.info("No country resolved for '%s' — using global search across top 5", location)

        # v3.5.13: cap per-country datasets for global search to keep query fast
        # Global: scan 5 datasets/country (25 files total) — fits well within timeout
        # Targeted (single country): use full dataset_limit for deep coverage
        effective_ds_limit = min(dataset_limit, 5) if is_global else dataset_limit

        logger.info(
            "DB search params: keyword=%r, location=%r, countries=%r, "
            "ds_limit=%d (effective=%d), expanded_terms=%r",
            keyword, location, countries, dataset_limit, effective_ds_limit,
            (expanded_terms or [])[:5],
        )

        # v3.5.13: per-country parallel queries — much faster than one giant UNION ALL
        # Each country gets its own DuckDB connection + query in a separate thread.
        loop = asyncio.get_running_loop()
        per_country_results_limit = max(1, max_results // len(countries)) if countries else max_results
        total_files = 0

        async def _search_one_country(country: str) -> list[tuple]:
            """Run a single-country query in the thread pool."""
            sql, paths = _build_linkedin_query(
                keyword, [country], location, per_country_results_limit,
                effective_ds_limit, expanded_terms=expanded_terms,
            )
            if not sql:
                return []

            def _run():
                con = _get_duckdb_connection()
                if not con:
                    return []
                try:
                    return con.execute(sql).fetchall()
                except Exception as e:
                    logger.warning("LinkedIn DB query failed for %s: %s", country, e)
                    return []
                finally:
                    con.close()

            try:
                return await asyncio.wait_for(
                    loop.run_in_executor(None, _run),
                    timeout=_DB_QUERY_TIMEOUT_SECS,
                )
            except asyncio.TimeoutError:
                logger.warning(
                    "LinkedIn DB query timed out after %ds for '%s' in %s (%d files)",
                    _DB_QUERY_TIMEOUT_SECS, keyword, country, len(paths),
                )
                return []

        # Fire all country queries in parallel
        country_tasks = [_search_one_country(c) for c in countries]
        country_results = await asyncio.gather(*country_tasks, return_exceptions=True)

        all_rows: list[tuple] = []
        for i, result in enumerate(country_results):
            if isinstance(result, Exception):
                logger.warning("LinkedIn DB query exception for %s: %s", countries[i], result)
                continue
            all_rows.extend(result)
            total_files += effective_ds_limit

        # Trim to max_results
        for row in all_rows[:max_results]:
            lead = _linkedin_row_to_lead(row, keyword)
            if lead:
                leads.append(lead)

        elapsed = time.time() - start_time
        logger.info(
            "Database LinkedIn search: '%s' in %s → %d leads (%.1fs, scanned %d files)",
            keyword, countries, len(leads), elapsed, total_files,
        )

    except Exception as e:
        logger.warning("Database LinkedIn search failed for '%s': %s", keyword, e)

    return leads


async def search_database_instagram(
    keyword: str,
    max_results: int = 30,
    dataset_limit: int = 3,
    expanded_terms: list[str] | None = None,
) -> list[dict]:
    """Search the Instagram leads database for matching records.

    v3.5.1: Accepts expanded_terms from KeywordParser for OR-based search.

    Args:
        keyword: Category/bio/name keyword to search for
        max_results: Maximum results to return
        dataset_limit: Max datasets to scan
        expanded_terms: Synonym-expanded terms for broader matching

    Returns:
        List of lead dicts in standard format
    """
    start_time = time.time()
    leads: list[dict] = []

    try:
        sql, s3_paths = _build_instagram_query(
            keyword, max_results, dataset_limit,
            expanded_terms=expanded_terms,
        )

        if not sql:
            return []

        loop = asyncio.get_running_loop()

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

        # v3.5.8: wrap query execution with timeout to prevent UI freezing
        try:
            rows = await asyncio.wait_for(
                loop.run_in_executor(None, _execute_query),
                timeout=_DB_QUERY_TIMEOUT_SECS,
            )
        except asyncio.TimeoutError:
            logger.warning(
                "Instagram database query timed out after %ds for '%s' (%d files)",
                _DB_QUERY_TIMEOUT_SECS, keyword, len(s3_paths),
            )
            rows = []

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


async def search_database_googlemaps(
    keyword: str,
    max_results: int = 50,
    dataset_limit: int = 5,
    expanded_terms: list[str] | None = None,
) -> list[dict]:
    """Search Google Maps database for business leads.

    v3.5.10: Queries PhantomBuster-extracted Google Maps data on S3.
    Returns list of standardized lead dicts with platform='google_maps'.
    """
    start_time = time.time()
    leads: list[dict] = []
    if not keyword or not keyword.strip():
        return leads

    sql, s3_paths = _build_googlemaps_query(
        keyword, max_results, dataset_limit=dataset_limit,
        expanded_terms=expanded_terms,
    )

    # Run DuckDB query in thread pool to avoid blocking async loop
    loop = asyncio.get_running_loop()

    def _execute_query() -> list[tuple]:
        con = _get_duckdb_connection()
        if not con:
            return []
        try:
            return con.execute(sql).fetchall()
        except Exception as e:
            logger.warning("Google Maps database query failed: %s", e)
            return []
        finally:
            con.close()

    try:
        # v3.5.10: wrap query execution with timeout to prevent UI freezing
        try:
            rows = await asyncio.wait_for(
                loop.run_in_executor(None, _execute_query),
                timeout=_DB_QUERY_TIMEOUT_SECS,
            )
        except asyncio.TimeoutError:
            logger.warning(
                "Google Maps database query timed out after %ds for '%s' (%d files)",
                _DB_QUERY_TIMEOUT_SECS, keyword, len(s3_paths),
            )
            rows = []

        for row in rows:
            lead = _googlemaps_row_to_lead(row, keyword)
            if lead:
                leads.append(lead)

        elapsed = time.time() - start_time
        logger.info(
            "Database Google Maps search: '%s' → %d leads (%.1fs, scanned %d files)",
            keyword, len(leads), elapsed, len(s3_paths),
        )

    except Exception as e:
        logger.warning("Database Google Maps search failed for '%s': %s", keyword, e)

    return leads


async def search_database_pan_india(
    keyword: str,
    max_results: int = 50,
    dataset_limit: int = 10,
    expanded_terms: list[str] | None = None,
) -> list[dict]:
    """Search PAN India database for business leads.

    v3.5.10: Queries standardized Indian business database on S3.
    Returns list of standardized lead dicts with platform='pan_india'.
    """
    start_time = time.time()
    leads: list[dict] = []
    if not keyword or not keyword.strip():
        return leads

    sql, s3_paths = _build_pan_india_query(
        keyword, max_results, dataset_limit=dataset_limit,
        expanded_terms=expanded_terms,
    )

    # Run DuckDB query in thread pool to avoid blocking async loop
    loop = asyncio.get_running_loop()

    def _execute_query() -> list[tuple]:
        con = _get_duckdb_connection()
        if not con:
            return []
        try:
            return con.execute(sql).fetchall()
        except Exception as e:
            logger.warning("PAN India database query failed: %s", e)
            return []
        finally:
            con.close()

    try:
        # v3.5.10: wrap query execution with timeout to prevent UI freezing
        try:
            rows = await asyncio.wait_for(
                loop.run_in_executor(None, _execute_query),
                timeout=_DB_QUERY_TIMEOUT_SECS,
            )
        except asyncio.TimeoutError:
            logger.warning(
                "PAN India database query timed out after %ds for '%s' (%d files)",
                _DB_QUERY_TIMEOUT_SECS, keyword, len(s3_paths),
            )
            rows = []

        for row in rows:
            lead = _pan_india_row_to_lead(row, keyword)
            if lead:
                leads.append(lead)

        elapsed = time.time() - start_time
        logger.info(
            "Database PAN India search: '%s' → %d leads (%.1fs, scanned %d files)",
            keyword, len(leads), elapsed, len(s3_paths),
        )

    except Exception as e:
        logger.warning("Database PAN India search failed for '%s': %s", keyword, e)

    return leads


async def search_database_hybrid(
    keywords: list[str],
    platforms: list[str],
    location: str = "",
    max_results_per_keyword: int = 50,
    expanded_terms_map: dict[str, list[str]] | None = None,
    tier: str = "free",
) -> list[dict]:
    """Search the pre-built database across multiple platforms and keywords.

    This is the main entry point for the hybrid search system.
    Searches LinkedIn, Instagram, Google Maps, and PAN India databases
    in parallel for each keyword.

    Args:
        keywords: List of search keywords
        platforms: List of platform names to search
        location: Optional location filter
        max_results_per_keyword: Max results per keyword per platform
        tier: User subscription tier — controls dataset scan depth
              (v3.5.8: free=3, starter=5, pro/unlimited=8)

    Returns:
        Combined deduplicated lead list
    """
    all_leads: list[dict] = []
    seen_emails: set[str] = set()
    seen_phones: set[str] = set()

    # v3.5.12: tier-aware dataset_limit — raised for much broader coverage
    # Previously free=3, starter=5, pro=8 — scanning <1% of available data.
    # Now free=10, starter=15, pro=25 for meaningful coverage.
    _tier_dataset_limits = {
        "free": 10,
        "starter": 15,
        "pro": 25,
        "unlimited": 25,
    }
    ds_limit = _tier_dataset_limits.get(tier, 10)

    # Determine which databases to search based on requested platforms
    search_linkedin = any(p in ("linkedin", "all") for p in platforms)
    search_instagram = any(p in ("instagram", "all") for p in platforms)
    # v3.5.10: Google Maps and PAN India database search
    search_googlemaps = any(
        p in ("google_maps", "googlemaps", "google maps", "all") for p in platforms
    )
    search_pan_india = any(
        p in ("pan_india", "indiamart", "justdial", "all") for p in platforms
    )

    # v3.5.9: Only search social databases when social platforms requested
    _has_social = search_linkedin or search_instagram
    _has_maps_or_india = search_googlemaps or search_pan_india

    # If no specific platforms matched, search all databases transparently
    if not _has_social and not _has_maps_or_india:
        search_linkedin = True
        search_instagram = True
        search_googlemaps = True
        search_pan_india = True

    for keyword in keywords:
        tasks = []
        # Get expanded terms for this keyword (v3.5.1)
        kw_expanded = None
        if expanded_terms_map:
            kw_expanded = expanded_terms_map.get(keyword)

        if search_linkedin:
            tasks.append(
                search_database_linkedin(
                    keyword, location, max_results_per_keyword,
                    dataset_limit=ds_limit,
                    expanded_terms=kw_expanded,
                )
            )
        if search_instagram:
            # v3.5.12: Use full max_results for Instagram (was halved with // 2)
            tasks.append(
                search_database_instagram(
                    keyword, max_results_per_keyword,
                    dataset_limit=ds_limit,
                    expanded_terms=kw_expanded,
                )
            )
        if search_googlemaps:
            tasks.append(
                search_database_googlemaps(
                    keyword, max_results_per_keyword,
                    dataset_limit=ds_limit,
                    expanded_terms=kw_expanded,
                )
            )
        if search_pan_india:
            tasks.append(
                search_database_pan_india(
                    keyword, max_results_per_keyword,
                    dataset_limit=ds_limit,
                    expanded_terms=kw_expanded,
                )
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
                    # R5-B16 fix: dedup by email OR phone independently
                    if email and email in seen_emails:
                        continue
                    if phone and phone in seen_phones:
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
        # R5-B16 fix: dedup by email OR phone independently
        if email and email in seen_emails:
            continue
        if phone and phone in seen_phones:
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
        # R5-B16 fix: dedup by email OR phone independently
        if email and email in seen_emails:
            continue
        if phone and phone in seen_phones:
            continue
        if email:
            seen_emails.add(email)
        if phone:
            seen_phones.add(phone)
        combined.append(lead)

    return combined
