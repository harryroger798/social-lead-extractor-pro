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
  - YouTube: 1,085 channels across 53 job categories (v3.5.26)

S3 Location: s3://crop-spray-uploads/leads-cm-database/
  linkedin/{Country}/dataset_N.csv
  instagram/dataset_N.csv
  technology_lookup/{technology}.csv
  googlemaps/dataset_N.csv
  pan_india/dataset_N.csv
  youtube/dataset_N.parquet
"""

import asyncio
import atexit
import json
import logging
import os
import re
import shutil
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.error import URLError

logger = logging.getLogger(__name__)

# v3.5.18: Track whether SSL certificates have been configured
_SSL_CERTS_CONFIGURED = False

# v3.5.25: Render API server URL for fast server-side S3 queries.
# On Render (US region), DuckDB queries to iDrive E2 complete in ~2-9s
# instead of ~100s from residential internet. Desktop app calls this API
# first and falls back to direct S3 queries if the API is unreachable.
_RENDER_API_URL = "https://snapleads-search-api.onrender.com"
_RENDER_API_TIMEOUT_SECS = 30  # Max time to wait for API response

# v3.5.21: Dedicated bounded thread pool for DB queries.
# Prevents saturation of asyncio's default executor when multiple
# extractions run concurrently or many S3 files are queried in parallel.
# 4 workers = max 4 concurrent DuckDB S3 connections at any time.
_DB_THREAD_POOL = ThreadPoolExecutor(max_workers=4, thread_name_prefix="duckdb-s3")
atexit.register(_DB_THREAD_POOL.shutdown, wait=False)


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

# YouTube schema columns (v3.5.26: public YouTube channel data)
_YOUTUBE_COLS = [
    "name", "channel_id", "profile_url", "subscribers", "video_count",
    "description", "thumbnail_url", "platform", "category", "scraped_at",
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

# v3.5.17: Track whether we've added _MEIPASS to DLL search path
_DLL_PATH_FIXED = False


def _configure_ssl_certificates():
    """v3.5.18: Ensure DuckDB's native OpenSSL can find CA certificates.

    ROOT CAUSE of the 0-leads bug that persisted through v3.5.12-v3.5.17:
    DuckDB's httpfs extension uses OpenSSL directly (NOT Python's ssl module)
    to make HTTPS requests to S3. In a PyInstaller --onefile bundle, the
    compiled-in CA certificate path points to the CI build machine's location
    which doesn't exist on the user's machine.

    Result: Every S3 HTTPS request fails with an SSL certificate verification
    error. The exception is caught by _run() and returns [] — giving 0 leads.

    Fix: Set SSL_CERT_FILE environment variable pointing to certifi's CA bundle
    BEFORE any DuckDB connection is created.
    """
    global _SSL_CERTS_CONFIGURED
    if _SSL_CERTS_CONFIGURED:
        return

    # Only needed in frozen (PyInstaller) environment
    is_frozen = getattr(sys, "frozen", False)
    meipass = getattr(sys, "_MEIPASS", None)

    logger.info(
        "SSL cert setup: frozen=%s, _MEIPASS=%s, SSL_CERT_FILE=%s",
        is_frozen, meipass, os.environ.get("SSL_CERT_FILE", "NOT SET"),
    )

    # If SSL_CERT_FILE is already set and points to a real file, trust it
    existing = os.environ.get("SSL_CERT_FILE", "")
    if existing and os.path.isfile(existing) and os.path.getsize(existing) > 1000:
        logger.info("SSL_CERT_FILE already set and valid: %s", existing)
        _SSL_CERTS_CONFIGURED = True
        return

    cert_file = None

    # Strategy 1: Use certifi package (most reliable — bundled by --collect-all certifi)
    try:
        import certifi
        candidate = certifi.where()
        if os.path.isfile(candidate) and os.path.getsize(candidate) > 1000:
            cert_file = candidate
            logger.info("SSL: Using certifi bundle: %s (%d bytes)", candidate, os.path.getsize(candidate))
    except ImportError:
        logger.warning("SSL: certifi package not available")

    # Strategy 2: Look for bundled cacert.pem in _MEIPASS
    if cert_file is None and meipass:
        for name in ("cacert.pem", "cert.pem", "ca-bundle.crt", "certifi/cacert.pem"):
            candidate = os.path.join(meipass, name)
            if os.path.isfile(candidate) and os.path.getsize(candidate) > 1000:
                cert_file = candidate
                logger.info("SSL: Using bundled cert from _MEIPASS: %s", candidate)
                break

    # Strategy 3: Copy certifi's cacert.pem to a stable location outside _MEIPASS
    if cert_file is None:
        try:
            import certifi
            src = os.path.join(os.path.dirname(certifi.__file__), "cacert.pem")
            if os.path.isfile(src):
                home = os.path.expanduser("~")
                import platform as _plat
                if _plat.system() == "Windows":
                    appdata = os.environ.get("APPDATA", os.path.join(home, "AppData", "Roaming"))
                    stable_cert = os.path.join(appdata, "snapleads", "certs", "cacert.pem")
                else:
                    stable_cert = os.path.join(home, ".snapleads", "certs", "cacert.pem")
                os.makedirs(os.path.dirname(stable_cert), exist_ok=True)
                shutil.copy2(src, stable_cert)
                cert_file = stable_cert
                logger.info("SSL: Copied certifi bundle to stable path: %s", stable_cert)
        except Exception as e:
            logger.warning("SSL: Failed to copy certifi bundle: %s", e)

    # Strategy 4: Common system locations (Windows)
    if cert_file is None:
        import platform as _plat
        if _plat.system() == "Windows":
            for candidate in (
                os.path.join(os.environ.get("ProgramFiles", r"C:\Program Files"),
                             "Common Files", "SSL", "cert.pem"),
                r"C:\Windows\System32\curl-ca-bundle.crt",
            ):
                if os.path.isfile(candidate):
                    cert_file = candidate
                    logger.info("SSL: Using system cert: %s", candidate)
                    break

    if cert_file:
        # Set ALL environment variables that OpenSSL / libcurl / httpfs may check
        os.environ["SSL_CERT_FILE"] = cert_file
        os.environ["CURL_CA_BUNDLE"] = cert_file
        os.environ["REQUESTS_CA_BUNDLE"] = cert_file
        os.environ["SSL_CERT_DIR"] = os.path.dirname(cert_file)
        logger.info("SSL: Environment configured — SSL_CERT_FILE=%s", cert_file)
    else:
        logger.error(
            "SSL: CRITICAL — No CA certificate bundle found! "
            "HTTPS requests from DuckDB httpfs WILL FAIL silently. "
            "This is the root cause of the 0-leads bug."
        )

    _SSL_CERTS_CONFIGURED = True


def _fix_dll_search_path():
    """v3.5.17: Ensure PyInstaller's _MEIPASS is on the DLL search path.

    Claude Opus 4.6 identified this as the root cause of the 0-leads bug:
    DuckDB's httpfs extension is a native DLL that depends on OpenSSL
    (libssl, libcrypto). In PyInstaller --onefile bundles, these DLLs are
    extracted to sys._MEIPASS but DuckDB's LoadLibrary call can't find them
    because _MEIPASS isn't in the DLL search path.

    This function fixes the search path BEFORE DuckDB tries to load httpfs.
    """
    global _DLL_PATH_FIXED
    if _DLL_PATH_FIXED:
        return

    meipass = getattr(sys, "_MEIPASS", None)
    if not meipass:
        _DLL_PATH_FIXED = True
        return

    import platform as _plat
    if _plat.system() == "Windows":
        # Method 1: os.add_dll_directory (Python 3.8+, Windows 10+)
        # This is the most reliable way to add DLL search paths
        try:
            os.add_dll_directory(meipass)
            logger.info("Added _MEIPASS to DLL search path via os.add_dll_directory: %s", meipass)
        except (OSError, AttributeError) as e:
            logger.debug("os.add_dll_directory failed: %s", e)

        # Method 2: Prepend to PATH as fallback (older Windows)
        current_path = os.environ.get("PATH", "")
        if meipass not in current_path:
            os.environ["PATH"] = meipass + os.pathsep + current_path
            logger.info("Prepended _MEIPASS to PATH: %s", meipass)

        # Method 3: ctypes SetDllDirectoryW as additional fallback
        try:
            import ctypes
            ctypes.windll.kernel32.SetDllDirectoryW(meipass)
            logger.info("Set DLL directory via SetDllDirectoryW: %s", meipass)
        except Exception as e:
            logger.debug("SetDllDirectoryW failed: %s", e)
    else:
        # On macOS/Linux, ensure _MEIPASS is in LD_LIBRARY_PATH / DYLD_LIBRARY_PATH
        ld_path = os.environ.get("LD_LIBRARY_PATH", "")
        if meipass not in ld_path:
            os.environ["LD_LIBRARY_PATH"] = meipass + os.pathsep + ld_path
        dyld_path = os.environ.get("DYLD_LIBRARY_PATH", "")
        if meipass not in dyld_path:
            os.environ["DYLD_LIBRARY_PATH"] = meipass + os.pathsep + dyld_path

    _DLL_PATH_FIXED = True


def _get_duckdb_platform() -> str:
    """v3.5.16: Determine the platform string DuckDB uses for extension lookup.

    DuckDB organises extensions as ``{ext_dir}/v{version}/{platform}/ext.duckdb_extension``.
    This helper returns the *platform* component so we can place bundled
    extensions exactly where DuckDB expects them.
    """
    import platform as _plat

    system = _plat.system().lower()
    machine = _plat.machine().lower()

    _map = {
        ("windows", "amd64"): "windows_amd64",
        ("windows", "x86_64"): "windows_amd64",
        ("linux", "x86_64"): "linux_amd64_gcc4",
        ("linux", "aarch64"): "linux_arm64",
        ("darwin", "x86_64"): "osx_amd64",
        ("darwin", "arm64"): "osx_arm64",
    }
    result = _map.get((system, machine))
    if not result:
        # Ask DuckDB directly as a fallback
        try:
            import duckdb
            result = duckdb.execute("PRAGMA platform").fetchone()[0]
        except Exception:
            # Last resort: construct from system/machine
            result = f"{system}_{machine}"
    logger.debug("DuckDB platform resolved to: %s", result)
    return result


def _get_extension_directory() -> str:
    """v3.5.16: Return a writable directory for DuckDB extensions.

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


def _python_download_httpfs(ext_dir: str) -> bool:
    """v3.5.20: Download httpfs extension using Python's own HTTP client.

    ROOT CAUSE FIX for the persistent 0-leads bug (v3.5.12-v3.5.19):

    The chicken-and-egg problem:
    1. Bundled httpfs has ABI mismatch → LOAD fails
    2. DuckDB's INSTALL httpfs needs HTTPS to download from extensions.duckdb.org
    3. DuckDB's internal HTTP client (cpp-httplib) may not find CA certificates
       in PyInstaller bundles on Windows — SSL_CERT_FILE env var is not always
       respected by DuckDB's compiled-in OpenSSL
    4. ca_cert_file setting is registered BY httpfs, so can't be set before load
    5. Result: INSTALL fails silently → all strategies fail → 0 leads

    Solution: Use Python's urllib (which correctly uses certifi via ssl module)
    to download the httpfs extension binary, place it at the exact path DuckDB
    expects, then let the caller LOAD it. This completely bypasses DuckDB's
    internal SSL configuration.

    DuckDB extension URL pattern:
      https://extensions.duckdb.org/v{version}/{platform}/httpfs.duckdb_extension.gz

    Returns True if extension was downloaded and placed successfully.
    """
    import gzip
    import urllib.request
    import ssl

    try:
        import duckdb
        runtime_version = duckdb.__version__
    except ImportError:
        return False

    runtime_platform = _get_duckdb_platform()
    target_dir = os.path.join(ext_dir, f"v{runtime_version}", runtime_platform)
    target_path = os.path.join(target_dir, "httpfs.duckdb_extension")

    # If extension already exists and is valid, skip
    if os.path.exists(target_path) and os.path.getsize(target_path) > 100_000:
        logger.info(
            "Python download: httpfs already present at %s (%d bytes)",
            target_path, os.path.getsize(target_path),
        )
        return True

    # Build the download URL
    url = (
        f"https://extensions.duckdb.org/"
        f"v{runtime_version}/{runtime_platform}/httpfs.duckdb_extension.gz"
    )
    logger.info("Python download: fetching httpfs from %s", url)

    # Create SSL context that uses certifi's CA bundle
    ssl_ctx = ssl.create_default_context()
    try:
        import certifi
        ssl_ctx.load_verify_locations(certifi.where())
        logger.info("Python download: using certifi CA bundle: %s", certifi.where())
    except ImportError:
        logger.warning("Python download: certifi not available, using system certs")
    except Exception as cert_err:
        logger.warning("Python download: certifi load failed: %s", cert_err)

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SnapLeads/3.5.20"})
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=60) as resp:
            compressed_data = resp.read()

        logger.info(
            "Python download: received %d bytes (compressed)",
            len(compressed_data),
        )

        # Decompress gzip
        try:
            ext_data = gzip.decompress(compressed_data)
        except gzip.BadGzipFile:
            # Some versions serve uncompressed — try using directly
            ext_data = compressed_data

        if len(ext_data) < 100_000:
            logger.warning(
                "Python download: extension too small (%d bytes), likely invalid",
                len(ext_data),
            )
            return False

        # Write to the exact path DuckDB expects
        os.makedirs(target_dir, exist_ok=True)
        with open(target_path, "wb") as f:
            f.write(ext_data)

        logger.info(
            "Python download: httpfs extension saved to %s (%d bytes)",
            target_path, len(ext_data),
        )
        return True

    except urllib.error.HTTPError as http_err:
        logger.warning(
            "Python download: HTTP %d for %s — %s",
            http_err.code, url, http_err.reason,
        )
    except urllib.error.URLError as url_err:
        logger.warning("Python download: URL error for %s — %s", url, url_err.reason)
    except Exception as dl_err:
        logger.warning("Python download: failed — %s", dl_err, exc_info=True)

    return False


def _ensure_bundled_httpfs(ext_dir: str) -> bool:
    """v3.5.16: Extract bundled httpfs extension to the EXACT path DuckDB expects.

    Root-cause fix for the 0-leads bug that persisted through v3.5.12–v3.5.15.
    Claude Opus 4.6 analysis identified three interacting failures:

    1. **Version mismatch**: The zip contains extensions under the CI build's
       DuckDB version path (e.g. ``v1.1.3/windows_amd64/``) but the runtime
       DuckDB may be a different version and looks under ``v{runtime}/...``.
    2. **Path structure**: DuckDB expects ``{ext_dir}/v{version}/{platform}/httpfs.duckdb_extension``
       and will NOT find it if the subdirectory structure doesn't match exactly.

    This function now:
    - Reads the RUNTIME DuckDB version to determine the correct target path
    - Finds the ``.duckdb_extension`` file in the zip regardless of its stored path
    - Places it at the exact location DuckDB will look for it

    Returns True if bundled extension was found and placed correctly.
    """
    import zipfile

    try:
        import duckdb
        runtime_version = duckdb.__version__
    except ImportError:
        return False

    runtime_platform = _get_duckdb_platform()
    # This is the exact path DuckDB will look for when we do LOAD httpfs
    target_dir = os.path.join(ext_dir, f"v{runtime_version}", runtime_platform)
    target_path = os.path.join(target_dir, "httpfs.duckdb_extension")

    # If extension already exists and is a reasonable size (>100KB), skip
    if os.path.exists(target_path) and os.path.getsize(target_path) > 100_000:
        logger.debug(
            "Bundled httpfs already present: %s (%d bytes)",
            target_path, os.path.getsize(target_path),
        )
        return True

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
            with zipfile.ZipFile(zip_path, "r") as zf:
                all_names = zf.namelist()
                logger.info("httpfs_bundle.zip contents: %s", all_names)

                # Find the httpfs extension file regardless of its stored path
                ext_files = [n for n in all_names if n.endswith("httpfs.duckdb_extension")]
                if not ext_files:
                    logger.warning("No httpfs.duckdb_extension found in zip!")
                    # Fall through to Strategy 2
                else:
                    source_name = ext_files[0]
                    bundled_version_dir = source_name.split("/")[0] if "/" in source_name else ""
                    if bundled_version_dir != f"v{runtime_version}":
                        logger.warning(
                            "VERSION MISMATCH: bundled=%s, runtime=v%s — "
                            "extracting to runtime path anyway",
                            bundled_version_dir, runtime_version,
                        )

                    # Extract to the EXACT path DuckDB expects for THIS runtime version
                    os.makedirs(target_dir, exist_ok=True)
                    with zf.open(source_name) as src:
                        data = src.read()
                    with open(target_path, "wb") as dst:
                        dst.write(data)

                    logger.info(
                        "Extracted httpfs extension: %s -> %s (%d bytes)",
                        source_name, target_path, len(data),
                    )

                    # Also extract .info file if present
                    info_files = [n for n in all_names if n.endswith("httpfs.duckdb_extension.info")]
                    if info_files:
                        info_target = target_path + ".info"
                        with zf.open(info_files[0]) as src:
                            info_data = src.read()
                        with open(info_target, "wb") as dst:
                            dst.write(info_data)

                    return True
        except Exception as exc:
            logger.warning("Failed to extract httpfs_bundle.zip: %s", exc, exc_info=True)

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

    # Find the .duckdb_extension file regardless of directory structure
    for root, _dirs, files in os.walk(bundled_base):
        for fname in files:
            if fname == "httpfs.duckdb_extension":
                src = os.path.join(root, fname)
                os.makedirs(target_dir, exist_ok=True)
                shutil.copy2(src, target_path)
                logger.info("Copied bundled extension: %s -> %s", src, target_path)
                # Also copy .info if present
                info_src = src + ".info"
                if os.path.isfile(info_src):
                    shutil.copy2(info_src, target_path + ".info")
                return True

    logger.debug("No httpfs.duckdb_extension found in bundled directory")
    return False


def _get_duckdb_connection():
    """Create a DuckDB connection configured for S3 access.

    NOTE: S3 credentials are intentionally embedded (base64-obfuscated) for the
    desktop app distribution.  They are **read-only** and scoped exclusively to
    the ``leads-cm-database/`` prefix on iDrive E2.  No write/delete access.

    v3.5.17: Five-point fix for PyInstaller compatibility (Claude Opus 4.6 analysis):
      1. **DLL search path**: _MEIPASS added to Windows DLL search path so
         OpenSSL libs are found when DuckDB loads the httpfs native extension.
      2. **Backslash escaping**: Windows paths normalised to forward slashes.
      3. **Version-aware extraction**: Bundled extension placed at exact runtime path.
      4. **Per-connection LOAD**: httpfs loaded on EVERY connection independently;
         the _HTTPFS_INSTALLED flag only gates INSTALL, not LOAD.
      5. **No silent swallowing**: Removed ``except Exception: pass`` that hid
         LOAD failures on 2nd+ connections.
    """
    try:
        import duckdb
    except ImportError:
        logger.warning("DuckDB not installed — database search unavailable")
        return None

    # v3.5.18 FIX #0: Configure SSL certificates BEFORE anything else.
    # This is the ROOT CAUSE of the 0-leads bug through v3.5.12-v3.5.17.
    # DuckDB's httpfs uses OpenSSL directly for HTTPS. In PyInstaller bundles,
    # OpenSSL can't find CA certificates → S3 requests fail silently → 0 leads.
    _configure_ssl_certificates()

    # v3.5.17 FIX #1: Fix DLL search path BEFORE any extension loading.
    _fix_dll_search_path()

    con = duckdb.connect()
    try:
        # Step 1: Get writable extension directory
        ext_dir = _get_extension_directory()

        # v3.5.16 FIX #2: Normalise Windows backslashes to forward slashes.
        # DuckDB's SQL parser treats \U, \A, etc. as escape sequences,
        # silently corrupting the path. Forward slashes work on all platforms.
        safe_ext_dir = ext_dir.replace("\\", "/")
        con.execute(f"SET extension_directory='{safe_ext_dir}';")
        logger.info("extension_directory set to: %s (raw: %s)", safe_ext_dir, ext_dir)

        # Step 2: Extract bundled extension to version-correct path
        bundled = _ensure_bundled_httpfs(ext_dir)
        logger.info("Bundled httpfs extraction result: %s", bundled)

        # Step 3: Load httpfs with multiple fallback strategies.
        # v3.5.18: Simplified loading — try autoload first (lets DuckDB handle it),
        # then bundled, then runtime install. Each connection needs its own LOAD.
        global _HTTPFS_INSTALLED  # noqa: PLW0603
        httpfs_loaded = False

        # Strategy A: Enable autoload (DuckDB >= 0.9.0 can auto-install + load)
        try:
            con.execute("SET autoinstall_known_extensions = true;")
            con.execute("SET autoload_known_extensions = true;")
            logger.debug("Autoload extensions enabled")
        except Exception as e:
            logger.debug("Autoload setting failed (older DuckDB?): %s", e)

        with _HTTPFS_LOCK:
            if not _HTTPFS_INSTALLED:
                # First connection: try each strategy in order.
                # v3.5.20: Added Strategy 4 — Python-based download.
                # The chicken-and-egg problem:
                #   DuckDB's INSTALL needs HTTPS → but its internal SSL may
                #   not find CA certs in PyInstaller bundles → INSTALL fails.
                #   Python's urllib uses certifi correctly → always works.
                strategies = [
                    ("LOAD (bundled)", ["LOAD httpfs;"]),
                    ("INSTALL+LOAD (network)", ["INSTALL httpfs;", "LOAD httpfs;"]),
                    ("FORCE INSTALL+LOAD", ["FORCE INSTALL httpfs;", "LOAD httpfs;"]),
                ]
                last_err = None
                for name, stmts in strategies:
                    try:
                        for stmt in stmts:
                            con.execute(stmt)
                        _HTTPFS_INSTALLED = True
                        httpfs_loaded = True
                        logger.info("httpfs loaded via '%s' (dir=%s)", name, safe_ext_dir)
                        break
                    except Exception as e:
                        last_err = e
                        logger.warning("httpfs strategy '%s' failed: %s", name, e)

                # v3.5.20 FIX: Strategy 4 — Python-based download fallback
                # If all DuckDB-native strategies failed, download httpfs
                # using Python's urllib (certifi-aware) and then LOAD it.
                if not httpfs_loaded:
                    logger.warning(
                        "All DuckDB-native httpfs strategies failed. "
                        "Trying Python-based download fallback..."
                    )
                    try:
                        # Delete any stale/corrupt cached extension first
                        import duckdb as _ddb
                        _stale_path = os.path.join(
                            ext_dir, f"v{_ddb.__version__}",
                            _get_duckdb_platform(),
                            "httpfs.duckdb_extension",
                        )
                        if os.path.exists(_stale_path):
                            os.remove(_stale_path)
                            logger.info("Removed stale cached extension: %s", _stale_path)
                    except Exception as rm_err:
                        logger.debug("Could not remove stale extension: %s", rm_err)

                    if _python_download_httpfs(ext_dir):
                        try:
                            con.execute("LOAD httpfs;")
                            _HTTPFS_INSTALLED = True
                            httpfs_loaded = True
                            logger.info(
                                "httpfs loaded via 'Python download + LOAD' (dir=%s)",
                                safe_ext_dir,
                            )
                        except Exception as py_load_err:
                            last_err = py_load_err
                            logger.error(
                                "httpfs LOAD after Python download failed: %s",
                                py_load_err,
                            )
                    else:
                        logger.error("Python download of httpfs also failed")

                if not httpfs_loaded:
                    logger.error(
                        "ALL httpfs strategies failed (including Python download) — "
                        "last error: %s | ext_dir=%s | SSL_CERT_FILE=%s",
                        last_err, safe_ext_dir,
                        os.environ.get("SSL_CERT_FILE", "NOT SET"),
                    )
                    # Log ext_dir contents for diagnosis
                    try:
                        for root, _d, files in os.walk(ext_dir):
                            for f in files:
                                fp = os.path.join(root, f)
                                logger.error(
                                    "  ext_dir file: %s (%d bytes)",
                                    os.path.relpath(fp, ext_dir),
                                    os.path.getsize(fp),
                                )
                    except Exception:
                        pass
                    raise last_err  # type: ignore[arg-type]
            else:
                # Subsequent connection: LOAD on THIS connection
                try:
                    con.execute("LOAD httpfs;")
                    httpfs_loaded = True
                    logger.debug("httpfs loaded on existing connection (dir=%s)", safe_ext_dir)
                except Exception as reload_err:
                    logger.error(
                        "httpfs LOAD failed on connection: %s | ext_dir=%s",
                        reload_err, safe_ext_dir,
                    )
                    # Recovery: INSTALL + LOAD
                    try:
                        con.execute("INSTALL httpfs;")
                        con.execute("LOAD httpfs;")
                        httpfs_loaded = True
                        logger.info("httpfs recovery INSTALL+LOAD succeeded")
                    except Exception as recovery_err:
                        logger.error("httpfs recovery also failed: %s", recovery_err)
                        raise reload_err from recovery_err

        # Verify httpfs is truly loaded before proceeding
        try:
            ext_state = con.execute(
                "SELECT extension_name, loaded, installed, install_path "
                "FROM duckdb_extensions() WHERE extension_name = 'httpfs'"
            ).fetchone()
            if ext_state:
                logger.info(
                    "httpfs state: loaded=%s, installed=%s, path=%s",
                    ext_state[1], ext_state[2], ext_state[3],
                )
                if not ext_state[1]:  # loaded == False
                    logger.error("httpfs reports NOT loaded despite LOAD succeeding!")
            else:
                logger.warning("httpfs not found in duckdb_extensions() output")
        except Exception as verify_err:
            logger.debug("Could not verify httpfs state: %s", verify_err)

        # v3.5.19 FIX — THE REAL ROOT CAUSE:
        # DuckDB's httpfs uses cpp-httplib for HTTPS, which reads CA certs from
        # DuckDB's own `ca_cert_file` setting — NOT from the SSL_CERT_FILE env var.
        # All v3.5.12-v3.5.18 set the env var but never told DuckDB directly.
        # In PyInstaller bundles, the compiled-in OpenSSL cert path doesn't exist
        # on the user's machine, so httpfs HTTPS requests fail silently → 0 leads.
        #
        # Fix: SET ca_cert_file = '<certifi_path>' AFTER httpfs is loaded
        # (the setting is registered by the httpfs extension).
        # Ref: https://github.com/duckdb/duckdb/pull/10704
        try:
            cert_path = os.environ.get("SSL_CERT_FILE", "")
            if not cert_path:
                try:
                    import certifi
                    cert_path = certifi.where()
                except ImportError:
                    pass
            if cert_path and os.path.isfile(cert_path):
                safe_cert = cert_path.replace("\\", "/")
                con.execute(f"SET ca_cert_file='{safe_cert}';")
                logger.info("DuckDB ca_cert_file set to: %s", safe_cert)
            else:
                logger.warning(
                    "No CA cert file found for DuckDB ca_cert_file setting. "
                    "cert_path=%s, SSL_CERT_FILE=%s",
                    cert_path, os.environ.get("SSL_CERT_FILE", "NOT SET"),
                )
        except Exception as ca_err:
            # ca_cert_file may not exist in older DuckDB versions — log but continue
            logger.debug("SET ca_cert_file failed (older DuckDB?): %s", ca_err)

        # Log SSL certificate status for diagnosis
        logger.info(
            "SSL env: SSL_CERT_FILE=%s, CURL_CA_BUNDLE=%s, ca_cert_file=SET",
            os.environ.get("SSL_CERT_FILE", "NOT SET"),
            os.environ.get("CURL_CA_BUNDLE", "NOT SET"),
        )

        # v3.5.21 FIX: Set HTTP timeout to prevent S3 requests hanging forever.
        # Without this, a single slow/stuck S3 request blocks its thread pool
        # worker indefinitely, eventually saturating the pool and freezing ALL
        # extractions at "Searching 89M+ leads database...".
        try:
            con.execute("SET http_timeout=90000;")  # 90 seconds in milliseconds — residential/international links need more time
            logger.debug("DuckDB http_timeout set to 90s")
        except Exception as ht_err:
            logger.debug("SET http_timeout failed (older DuckDB?): %s", ht_err)

        # Configure S3 credentials
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


def _build_youtube_query(
    keyword: str,
    max_results: int,
    dataset_limit: int = 1,
    expanded_terms: list[str] | None = None,
) -> tuple[str, list[str]]:
    """Build DuckDB SQL to query YouTube parquet files on S3.

    v3.5.26: Queries YouTube channel database (1,085 channels across 53 categories).
    Schema: name, channel_id, profile_url, subscribers, video_count,
            description, thumbnail_url, platform, category, scraped_at
    Uses parquet format (not CSV) for efficient columnar reads.
    """
    s3_paths = []
    for i in range(1, dataset_limit + 1):
        s3_paths.append(
            f"s3://{_S3_BUCKET}/{_S3_PREFIX}/youtube/dataset_{i}.parquet"
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

    searchable_fields = ['name', 'category', 'description']
    where_parts: list[str] = []
    for term in search_terms:
        for fld in searchable_fields:
            escaped = _escape_like(term)
            where_parts.append(f"LOWER({fld}) LIKE '%{escaped}%' ESCAPE '\\'")

    where_clause = " OR ".join(where_parts)
    unions = []
    for path in s3_paths:
        unions.append(
            f"SELECT name, channel_id, profile_url, subscribers, video_count, "
            f"description, category "
            f"FROM read_parquet('{path}') "
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


def _youtube_row_to_lead(row: tuple, keyword: str) -> dict:
    """Convert a YouTube DuckDB row to a standard lead dict.

    v3.5.26: Row schema = (name, channel_id, profile_url, subscribers,
                           video_count, description, category)
    YouTube leads have profile URLs but no email/phone (public data only).
    """
    name = str(row[0] or "").strip()
    channel_id = str(row[1] or "").strip()
    profile_url = str(row[2] or "").strip()
    subscribers = str(row[3] or "").strip()
    video_count = str(row[4] or "").strip()
    description = str(row[5] or "").strip()
    category = str(row[6] or "").strip()

    if not _clean_field(name) and not _clean_field(channel_id):
        return {}

    source_url = _clean_field(profile_url)
    if not source_url and channel_id:
        source_url = f"https://www.youtube.com/channel/{channel_id}"

    return {
        "email": "",
        "phone": "",
        "name": _clean_field(name),
        "platform": "youtube",
        "source_url": source_url,
        "keyword": keyword,
        "company": _clean_field(subscribers),
        "industry": _clean_field(category),
        "location": "",
        "website": source_url,
    }


# v3.5.8: timeout for S3 queries — prevents UI freezing on slow connections
# v3.5.13: raised from 30→90s; per-country parallel strategy keeps actual
# wall-clock time low while preventing premature timeout on large scans.
# v3.5.21: Reduced from 90s to 45s — prevents UI freeze when S3 is slow.
# v3.5.24: Raised to 120s — 45s was too aggressive for residential internet
# (India → iDrive E2 us-west-1). Must exceed http_timeout (90s) so DuckDB
# can finish naturally instead of leaving orphaned threads blocked on S3 I/O.
_DB_QUERY_TIMEOUT_SECS = 120

# v3.5.21: Master timeout for the entire search_database_hybrid call.
# Even if individual query timeouts fail to fire (thread pool saturation),
# this guarantees the extraction never blocks forever at "Searching 89M+".
# v3.5.24: Raised to 180s to accommodate slower per-query timeouts (120s)
# plus serialization delay from semaphore-limited concurrency.
# v3.5.25: Raised to 600s — on residential internet (India → iDrive E2
# us-west-1), each country query takes ~100s. With semaphore(3) and
# 5 countries, total wall-clock is ~200s. 600s gives 3× safety margin.
_HYBRID_SEARCH_MASTER_TIMEOUT_SECS = 600


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

        # v3.5.24: Limit concurrent country queries to avoid thread pool
        # saturation. With 4 workers, firing 5 queries simultaneously means
        # 1 queues and all workers block on slow S3 I/O.
        # v3.5.25: Raised from 2→3 to reduce total wall-clock time.
        # With 3 concurrent: 5 countries finish in ceil(5/3)=2 rounds ≈ 200s
        # vs semaphore(2) needing ceil(5/2)=3 rounds ≈ 300s.
        _country_semaphore = asyncio.Semaphore(3)

        async def _search_one_country(country: str) -> list[tuple]:
            """Run a single-country query in the thread pool (semaphore-gated)."""
            async with _country_semaphore:
                sql, paths = _build_linkedin_query(
                    keyword, [country], location, per_country_results_limit,
                    effective_ds_limit, expanded_terms=expanded_terms,
                )
                if not sql:
                    return []

                def _run():
                    con = _get_duckdb_connection()
                    if not con:
                        logger.error("LinkedIn DB: _get_duckdb_connection() returned None for %s", country)
                        return []
                    try:
                        rows = con.execute(sql).fetchall()
                        logger.info("LinkedIn DB query for %s returned %d rows", country, len(rows))
                        return rows
                    except Exception as e:
                        # v3.5.16: Log full error with SQL for diagnosis
                        logger.error(
                            "LinkedIn DB query FAILED for %s: %s | SQL prefix: %.200s",
                            country, e, sql,
                        )
                        return []
                    finally:
                        con.close()

                try:
                    return await asyncio.wait_for(
                        loop.run_in_executor(_DB_THREAD_POOL, _run),
                        timeout=_DB_QUERY_TIMEOUT_SECS,
                    )
                except asyncio.TimeoutError:
                    logger.warning(
                        "LinkedIn DB query timed out after %ds for '%s' in %s (%d files)",
                        _DB_QUERY_TIMEOUT_SECS, keyword, country, len(paths),
                    )
                    return []

        # Fire all country queries with semaphore-limited concurrency
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

        # v3.5.21: Use dedicated _DB_THREAD_POOL instead of default executor
        try:
            rows = await asyncio.wait_for(
                loop.run_in_executor(_DB_THREAD_POOL, _execute_query),
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
        # v3.5.21: Use dedicated _DB_THREAD_POOL instead of default executor
        try:
            rows = await asyncio.wait_for(
                loop.run_in_executor(_DB_THREAD_POOL, _execute_query),
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
        # v3.5.21: Use dedicated _DB_THREAD_POOL instead of default executor
        try:
            rows = await asyncio.wait_for(
                loop.run_in_executor(_DB_THREAD_POOL, _execute_query),
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


async def search_database_youtube(
    keyword: str,
    max_results: int = 50,
    dataset_limit: int = 1,
    expanded_terms: list[str] | None = None,
) -> list[dict]:
    """Search YouTube channel database for matching records.

    v3.5.26: Queries 1,085 YouTube channels across 53 job categories.
    Uses parquet format on S3 for efficient reads.
    Returns profile-only leads (name, channel URL, category) — no email/phone.
    """
    start_time = time.time()
    leads: list[dict] = []
    if not keyword or not keyword.strip():
        return leads

    sql, s3_paths = _build_youtube_query(
        keyword, max_results, dataset_limit=dataset_limit,
        expanded_terms=expanded_terms,
    )

    loop = asyncio.get_running_loop()

    def _execute_query() -> list[tuple]:
        con = _get_duckdb_connection()
        if not con:
            return []
        try:
            return con.execute(sql).fetchall()
        except Exception as e:
            logger.warning("YouTube database query failed: %s", e)
            return []
        finally:
            con.close()

    try:
        try:
            rows = await asyncio.wait_for(
                loop.run_in_executor(_DB_THREAD_POOL, _execute_query),
                timeout=_DB_QUERY_TIMEOUT_SECS,
            )
        except asyncio.TimeoutError:
            logger.warning(
                "YouTube database query timed out after %ds for '%s' (%d files)",
                _DB_QUERY_TIMEOUT_SECS, keyword, len(s3_paths),
            )
            rows = []

        for row in rows:
            lead = _youtube_row_to_lead(row, keyword)
            if lead:
                leads.append(lead)

        elapsed = time.time() - start_time
        logger.info(
            "Database YouTube search: '%s' → %d leads (%.1fs, scanned %d files)",
            keyword, len(leads), elapsed, len(s3_paths),
        )

    except Exception as e:
        logger.warning("Database YouTube search failed for '%s': %s", keyword, e)

    return leads


async def _search_database_hybrid_inner(
    keywords: list[str],
    platforms: list[str],
    location: str = "",
    max_results_per_keyword: int = 50,
    expanded_terms_map: dict[str, list[str]] | None = None,
    tier: str = "free",
) -> list[dict]:
    """Inner implementation of hybrid search (wrapped by master timeout).

    v3.5.21 fixes:
      1. Reduced dataset limits to prevent >50 concurrent S3 file reads.
      2. Fixed "fallback to all" logic — only search LinkedIn+Instagram by
         default instead of ALL 4 databases (Google Maps + PAN India are
         supplementary and shouldn't run unless explicitly requested).
      3. Sequential platform searches instead of parallel — prevents thread
         pool saturation when 4 platforms × 5 countries × N datasets all
         fire simultaneously.
    v3.5.26: Added YouTube platform support.
    """
    all_leads: list[dict] = []
    seen_emails: set[str] = set()
    seen_phones: set[str] = set()

    # v3.5.24: Aggressive dataset limits for slow-link resilience.
    # Each file = 1+ S3 range request. LinkedIn fires per-country queries
    # (up to 5 countries × ds_limit files × concurrent threads).
    # On residential internet (India → us-west-1), each S3 round-trip
    # can take 5-15s. Fewer files = dramatically less wall-clock time.
    _tier_dataset_limits = {
        "free": 3,
        "starter": 5,
        "pro": 5,
        "unlimited": 8,
    }
    ds_limit = _tier_dataset_limits.get(tier, 5)

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
    # v3.5.26: YouTube database search
    search_youtube = any(p in ("youtube", "all") for p in platforms)

    # v3.5.9: Only search social databases when social platforms requested
    _has_social = search_linkedin or search_instagram
    _has_maps_or_india = search_googlemaps or search_pan_india

    # v3.5.21 FIX: Only default to LinkedIn + Instagram (the two largest DBs).
    # Previously this enabled ALL 4 databases which fired 80+ concurrent S3
    # queries, saturating the thread pool and causing GDDSBoth to freeze at 5%.
    if not _has_social and not _has_maps_or_india and not search_youtube:
        search_linkedin = True
        search_instagram = True

    logger.info(
        "Hybrid search: linkedin=%s, instagram=%s, googlemaps=%s, pan_india=%s, "
        "youtube=%s, ds_limit=%d, tier=%s, platforms=%s",
        search_linkedin, search_instagram, search_googlemaps, search_pan_india,
        search_youtube, ds_limit, tier, platforms,
    )

    for keyword in keywords:
        # v3.5.21: Run platform searches SEQUENTIALLY (not all at once).
        # This prevents 4 platforms × 5 countries = 20+ concurrent DuckDB
        # connections fighting for 4 thread pool workers.
        # LinkedIn runs first (largest DB, most likely to have results),
        # then others run only if we haven't hit max results yet.
        kw_expanded = None
        if expanded_terms_map:
            kw_expanded = expanded_terms_map.get(keyword)

        # Phase 1: LinkedIn (primary — 86.9M records)
        if search_linkedin:
            try:
                linkedin_leads = await search_database_linkedin(
                    keyword, location, max_results_per_keyword,
                    dataset_limit=ds_limit,
                    expanded_terms=kw_expanded,
                )
                for lead in linkedin_leads:
                    email = lead.get("email", "")
                    phone = lead.get("phone", "")
                    if email and email in seen_emails:
                        continue
                    if phone and phone in seen_phones:
                        continue
                    if email:
                        seen_emails.add(email)
                    if phone:
                        seen_phones.add(phone)
                    all_leads.append(lead)
            except Exception as e:
                logger.warning("LinkedIn DB search failed for '%s': %s", keyword, e)

        # Phase 2: Instagram (secondary — 2.45M records)
        if search_instagram:
            try:
                instagram_leads = await search_database_instagram(
                    keyword, max_results_per_keyword,
                    dataset_limit=ds_limit,
                    expanded_terms=kw_expanded,
                )
                for lead in instagram_leads:
                    email = lead.get("email", "")
                    phone = lead.get("phone", "")
                    if email and email in seen_emails:
                        continue
                    if phone and phone in seen_phones:
                        continue
                    if email:
                        seen_emails.add(email)
                    if phone:
                        seen_phones.add(phone)
                    all_leads.append(lead)
            except Exception as e:
                logger.warning("Instagram DB search failed for '%s': %s", keyword, e)

        # Phase 3: Google Maps + PAN India + YouTube (supplementary — only if requested)
        supplementary_tasks = []
        if search_googlemaps:
            supplementary_tasks.append(
                search_database_googlemaps(
                    keyword, max_results_per_keyword,
                    dataset_limit=ds_limit,
                    expanded_terms=kw_expanded,
                )
            )
        if search_pan_india:
            supplementary_tasks.append(
                search_database_pan_india(
                    keyword, max_results_per_keyword,
                    dataset_limit=ds_limit,
                    expanded_terms=kw_expanded,
                )
            )
        if search_youtube:
            supplementary_tasks.append(
                search_database_youtube(
                    keyword, max_results_per_keyword,
                    dataset_limit=1,
                    expanded_terms=kw_expanded,
                )
            )

        if supplementary_tasks:
            results = await asyncio.gather(*supplementary_tasks, return_exceptions=True)
            for result in results:
                if isinstance(result, Exception):
                    logger.warning("Supplementary DB search failed: %s", result)
                    continue
                for lead in result:
                    email = lead.get("email", "")
                    phone = lead.get("phone", "")
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


async def _search_via_render_api(
    keyword: str,
    platforms: list[str],
    location: str = "",
    max_results: int = 500,
    tier: str = "pro",
    expanded_terms: list[str] | None = None,
) -> list[dict]:
    """v3.5.25: Call the Render-hosted search API for fast server-side queries.

    The API server runs on Render (US region) and queries iDrive E2 S3
    directly with ~2-9s latency instead of ~100s from residential internet.

    Returns list of lead dicts on success, raises on any failure.
    """
    payload = {
        "keyword": keyword,
        "platforms": platforms,
        "location": location,
        "max_results": max_results,
        "tier": tier,
    }
    if expanded_terms:
        payload["expanded_terms"] = expanded_terms

    body = json.dumps(payload).encode("utf-8")
    req = Request(
        f"{_RENDER_API_URL}/api/search",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    loop = asyncio.get_event_loop()
    # Run blocking HTTP call in thread pool to avoid blocking the event loop
    response = await loop.run_in_executor(
        _DB_THREAD_POOL,
        lambda: urlopen(req, timeout=_RENDER_API_TIMEOUT_SECS),
    )

    resp_data = json.loads(response.read().decode("utf-8"))
    leads = resp_data.get("leads", [])
    query_time = resp_data.get("query_time_ms", 0)
    logger.info(
        "Render API returned %d leads in %dms for keyword=%r",
        len(leads), query_time, keyword,
    )
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

    v3.5.25: NEW — tries Render API first (fast ~2-9s server-side queries),
    falls back to direct S3 DuckDB queries if the API is unreachable.

    v3.5.21: Wrapped with a master timeout to guarantee this function NEVER
    blocks forever. Even if individual query timeouts fail (thread pool
    saturation, DuckDB S3 request hanging), this master timeout ensures
    the extraction progresses past the "Searching 89M+" phase.

    Returns whatever leads were collected before the timeout fired.
    """
    # v3.5.25: Try Render API first — much faster than direct S3 from
    # residential internet. Falls back to direct S3 on any failure.
    try:
        api_leads: list[dict] = []
        for keyword in keywords:
            kw_expanded = None
            if expanded_terms_map:
                kw_expanded = expanded_terms_map.get(keyword)
            leads = await _search_via_render_api(
                keyword=keyword,
                platforms=platforms,
                location=location,
                max_results=max_results_per_keyword,
                tier=tier,
                expanded_terms=kw_expanded,
            )
            api_leads.extend(leads)

        if api_leads:
            logger.info(
                "Render API success: %d total leads for %d keywords",
                len(api_leads), len(keywords),
            )
            return api_leads
        # API returned 0 leads — fall through to direct S3 as backup
        logger.warning("Render API returned 0 leads — falling back to direct S3")
    except Exception as e:
        logger.warning(
            "Render API unavailable (%s) — falling back to direct S3 queries",
            e,
        )

    # Fallback: direct S3 queries (original approach)
    _partial_results: list[dict] = []

    async def _inner_with_partial():
        results = await _search_database_hybrid_inner(
            keywords=keywords,
            platforms=platforms,
            location=location,
            max_results_per_keyword=max_results_per_keyword,
            expanded_terms_map=expanded_terms_map,
            tier=tier,
        )
        _partial_results.extend(results)
        return results

    try:
        return await asyncio.wait_for(
            _inner_with_partial(),
            timeout=_HYBRID_SEARCH_MASTER_TIMEOUT_SECS,
        )
    except asyncio.TimeoutError:
        logger.error(
            "search_database_hybrid MASTER TIMEOUT after %ds — "
            "returning %d partial results collected before timeout. "
            "keywords=%s, platforms=%s, tier=%s",
            _HYBRID_SEARCH_MASTER_TIMEOUT_SECS,
            len(_partial_results), keywords, platforms, tier,
        )
        return _partial_results
    except Exception as e:
        logger.error(
            "search_database_hybrid unexpected error: %s — keywords=%s",
            e, keywords, exc_info=True,
        )
        return _partial_results if _partial_results else []


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
