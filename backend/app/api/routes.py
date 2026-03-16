"""API routes for SnapLeads."""
import asyncio
import json
import logging
import os
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Response, BackgroundTasks

from app.database import get_db
from app.models.schemas import (
    ExtractionRequest,
    BlacklistEntryRequest,
    BlacklistEntryResponse,
    ProxyRequest,
    ProxyResponse,
    ProxyBulkImport,
    SettingUpdate,
    LicenseGenerateRequest,
    LicenseResponse,
    LicenseValidateRequest,
    ExportRequest,
    DashboardStats,
    SessionResponse,
    LeadResponse,
    GoogleMapsSearchRequest,
    ScheduleCreateRequest,
    EmailFinderRequest,
    CRMExportRequest,
    OutreachSendRequest,
    TelegramScrapeRequest,
    WhatsAppScrapeRequest,
)
from app.services.log_service import (
    init_logging, list_log_files, tail_log, clear_logs,
    export_logs_zip, write_frontend_log,
)
from app.services.extractor import extract_emails, extract_phones, classify_email, score_lead
from app.services.verifier import verify_email
from app.services.google_dorking import dorking_search_multi
from app.services.reddit_extractor import reddit_search
from app.services.proxy_manager import proxy_manager, test_proxy, parse_proxy_line
from app.services.firecrawl_service import enrich_leads_with_firecrawl, check_firecrawl_credits
from app.services.export_service import export_leads_bytes
from app.services.database_search import search_database_hybrid, deduplicate_leads
# v3.1.0 Enhancement imports
from app.services.yellowpages_scraper import scrape_yellowpages, scrape_yelp, scrape_directories
from app.services.fxtwitter_api import extract_twitter_profiles, enrich_twitter_leads_with_fxtwitter
from app.services.pinterest_rss import extract_pinterest_rss, enrich_pinterest_leads_with_rss
from app.services.bio_link_follower import follow_bio_links
from app.services.license_service import (
    generate_license_key,
    validate_key_format,
    get_expiry_date,
)
# v3.5.0 LIVE scraping imports
from app.services.keyword_parser import parse_keyword
from app.services.live_scrapers import live_scrape_platform
from app.services.quality_scorer import score_lead_quality, batch_score_leads
# v3.5.4 B2B platform scrapers + Waterfall Enrichment
from app.services.b2b_scrapers import (
    b2b_scrape_platform,
    get_available_b2b_platforms,
)
from app.services.waterfall_enrichment import (
    enrich_leads_batch_waterfall,
    merge_and_deduplicate_leads,
)
from app.services.features import (
    find_emails_by_domain,
    scrape_directories as scrape_directories_v2,
    scrape_job_boards,
    enrich_lead,
    check_citations,
    detect_gbp,
    check_smtp,
    check_smtp_batch,
    clean_lead,
    clean_leads_batch,
    export_leads_csv,
    export_leads_vcard,
    export_leads_pdf,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

# ── v3.5.33: Country inference for location-aware filtering ───────────────
# Cascading signal approach: phone prefix (90%) → email TLD (85%) →
# city name (75%) → location hint from keyword (70%) → country name (60%)

_PHONE_PREFIX_TO_COUNTRY: dict[str, str] = {
    "+91": "India", "91-": "India",
    "+1": "United States", "+44": "United Kingdom",
    "+61": "Australia", "+81": "Japan", "+49": "Germany",
    "+33": "France", "+86": "China", "+55": "Brazil",
    "+7": "Russia", "+82": "South Korea", "+39": "Italy",
    "+34": "Spain", "+52": "Mexico", "+62": "Indonesia",
    "+90": "Turkey", "+966": "Saudi Arabia", "+971": "UAE",
    "+92": "Pakistan", "+880": "Bangladesh", "+63": "Philippines",
    "+20": "Egypt", "+84": "Vietnam", "+66": "Thailand",
    "+60": "Malaysia", "+65": "Singapore", "+972": "Israel",
    "+31": "Netherlands", "+46": "Sweden", "+47": "Norway",
    "+45": "Denmark", "+358": "Finland", "+41": "Switzerland",
    "+353": "Ireland", "+351": "Portugal", "+48": "Poland",
    "+32": "Belgium", "+43": "Austria", "+30": "Greece",
    "+54": "Argentina", "+57": "Colombia", "+56": "Chile",
    "+51": "Peru", "+254": "Kenya", "+233": "Ghana",
    "+977": "Nepal", "+212": "Morocco", "+886": "Taiwan",
    "+64": "New Zealand", "+27": "South Africa",
    "+234": "Nigeria", "+94": "Sri Lanka",
}

_EMAIL_TLD_TO_COUNTRY: dict[str, str] = {
    ".in": "India", ".co.in": "India",
    ".uk": "United Kingdom", ".co.uk": "United Kingdom",
    ".au": "Australia", ".com.au": "Australia",
    ".ca": "Canada", ".de": "Germany", ".fr": "France",
    ".jp": "Japan", ".br": "Brazil", ".it": "Italy",
    ".es": "Spain", ".mx": "Mexico", ".ru": "Russia",
    ".cn": "China", ".kr": "South Korea",
    ".nl": "Netherlands", ".se": "Sweden", ".no": "Norway",
    ".dk": "Denmark", ".fi": "Finland", ".ch": "Switzerland",
    ".ie": "Ireland", ".pt": "Portugal", ".pl": "Poland",
    ".be": "Belgium", ".at": "Austria", ".gr": "Greece",
    ".nz": "New Zealand", ".za": "South Africa",
    ".sg": "Singapore", ".my": "Malaysia", ".th": "Thailand",
    ".ph": "Philippines", ".id": "Indonesia", ".vn": "Vietnam",
    ".pk": "Pakistan", ".bd": "Bangladesh", ".lk": "Sri Lanka",
    ".ng": "Nigeria", ".ke": "Kenya", ".gh": "Ghana",
    ".ae": "UAE", ".sa": "Saudi Arabia", ".il": "Israel",
    ".tw": "Taiwan", ".tr": "Turkey", ".eg": "Egypt",
    ".ar": "Argentina", ".co": "Colombia", ".cl": "Chile",
    ".pe": "Peru", ".np": "Nepal", ".ma": "Morocco",
}

_CITY_TO_COUNTRY: dict[str, str] = {
    # India
    "mumbai": "India", "delhi": "India", "bangalore": "India",
    "bengaluru": "India", "hyderabad": "India", "chennai": "India",
    "kolkata": "India", "pune": "India", "ahmedabad": "India",
    "jaipur": "India", "lucknow": "India", "new delhi": "India",
    "noida": "India", "gurgaon": "India", "gurugram": "India",
    "chandigarh": "India", "indore": "India", "nagpur": "India",
    "bhopal": "India", "surat": "India", "kochi": "India",
    "coimbatore": "India", "thiruvananthapuram": "India",
    # US
    "new york": "United States", "los angeles": "United States",
    "chicago": "United States", "houston": "United States",
    "phoenix": "United States", "san francisco": "United States",
    "seattle": "United States", "boston": "United States",
    "miami": "United States", "dallas": "United States",
    "atlanta": "United States", "denver": "United States",
    "san diego": "United States", "austin": "United States",
    # UK
    "london": "United Kingdom", "manchester": "United Kingdom",
    "birmingham": "United Kingdom", "leeds": "United Kingdom",
    "glasgow": "United Kingdom", "edinburgh": "United Kingdom",
    "liverpool": "United Kingdom", "bristol": "United Kingdom",
    # Canada
    "toronto": "Canada", "vancouver": "Canada", "montreal": "Canada",
    "calgary": "Canada", "ottawa": "Canada", "edmonton": "Canada",
    # Australia
    "sydney": "Australia", "melbourne": "Australia",
    "brisbane": "Australia", "perth": "Australia",
    "adelaide": "Australia", "canberra": "Australia",
    # Others
    "dubai": "UAE", "abu dhabi": "UAE", "singapore": "Singapore",
    "tokyo": "Japan", "berlin": "Germany", "paris": "France",
    "rome": "Italy", "madrid": "Spain", "amsterdam": "Netherlands",
    "zurich": "Switzerland", "dublin": "Ireland",
}


def _infer_country_from_lead(
    lead_data: dict,
    location_hint: str = "",
) -> str:
    """v3.5.33: Infer country from lead data using cascading signals.

    Priority order (highest confidence first):
      1. Phone prefix (90% confidence) — e.g. +91 → India
      2. Email TLD (85% confidence) — e.g. .co.in → India
      3. Lead's location/address field (75%) — city/state name match
      4. Location hint from keyword parsing (70%) — e.g. "in Kolkata" → India
      5. Lead's existing country field (60%) — if already set by source

    Returns country string, never empty — defaults to location_hint or 'Unknown'.
    """
    # Signal 1: Phone prefix
    phone = lead_data.get("phone", "").strip()
    if phone:
        for prefix, country in _PHONE_PREFIX_TO_COUNTRY.items():
            if phone.startswith(prefix) or phone.startswith(prefix.lstrip("+")):
                return country

    # Signal 2: Email TLD
    email = lead_data.get("email", "").strip().lower()
    if email and "@" in email:
        domain = email.split("@")[-1]
        # Check longest TLDs first (e.g. .co.in before .in)
        for tld, country in sorted(
            _EMAIL_TLD_TO_COUNTRY.items(), key=lambda x: -len(x[0])
        ):
            if domain.endswith(tld):
                return country

    # Signal 3: Lead's own location/address field
    lead_location = lead_data.get("location", "").strip().lower()
    lead_address = lead_data.get("address", "").strip().lower()
    for loc_str in (lead_location, lead_address):
        if loc_str:
            for city, country in _CITY_TO_COUNTRY.items():
                if city in loc_str:
                    return country

    # Signal 4: Location hint from keyword parsing (e.g. "Kolkata")
    if location_hint:
        hint_lower = location_hint.lower().strip()
        # Check city map first
        for city, country in _CITY_TO_COUNTRY.items():
            if city in hint_lower or hint_lower in city:
                return country
        # Return the hint itself as country name (could be a country name)
        return location_hint.title()

    # Signal 5: Lead's existing country field
    existing = lead_data.get("country", "").strip()
    if existing:
        return existing

    return "Unknown"


# ─── Dashboard ────────────────────────────────────────────────────────────────

@router.get("/dashboard/stats")
async def get_dashboard_stats() -> DashboardStats:
    async with get_db() as db:
        # Total leads
        cursor = await db.execute("SELECT COUNT(*) FROM leads")
        row = await cursor.fetchone()
        total_leads = row[0] if row else 0

        # Leads today
        today = datetime.now().strftime("%Y-%m-%d")
        cursor = await db.execute(
            "SELECT COUNT(*) FROM leads WHERE extracted_at LIKE ?", (f"{today}%",)
        )
        row = await cursor.fetchone()
        leads_today = row[0] if row else 0

        # Emails & phones
        cursor = await db.execute("SELECT COUNT(*) FROM leads WHERE email != ''")
        row = await cursor.fetchone()
        total_emails = row[0] if row else 0

        cursor = await db.execute("SELECT COUNT(*) FROM leads WHERE phone != ''")
        row = await cursor.fetchone()
        total_phones = row[0] if row else 0

        # Verified emails
        cursor = await db.execute("SELECT COUNT(*) FROM leads WHERE verified = 1")
        row = await cursor.fetchone()
        verified_emails = row[0] if row else 0

        # Sessions completed
        cursor = await db.execute("SELECT COUNT(*) FROM sessions WHERE status = 'completed'")
        row = await cursor.fetchone()
        sessions_completed = row[0] if row else 0

        # Platform breakdown
        cursor = await db.execute(
            "SELECT platform, COUNT(*) as cnt FROM leads GROUP BY platform ORDER BY cnt DESC"
        )
        platform_breakdown = [
            {"platform": r[0], "count": r[1]} for r in await cursor.fetchall()
        ]

        # Daily trend (last 7 days)
        daily_trend = []
        for i in range(6, -1, -1):
            day = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            cursor = await db.execute(
                "SELECT COUNT(*) FROM leads WHERE email != '' AND extracted_at LIKE ?",
                (f"{day}%",),
            )
            row = await cursor.fetchone()
            emails_count = row[0] if row else 0

            cursor = await db.execute(
                "SELECT COUNT(*) FROM leads WHERE phone != '' AND extracted_at LIKE ?",
                (f"{day}%",),
            )
            row = await cursor.fetchone()
            phones_count = row[0] if row else 0

            daily_trend.append({"date": day, "emails": emails_count, "phones": phones_count})

        # Recent sessions
        cursor = await db.execute(
            "SELECT * FROM sessions ORDER BY started_at DESC LIMIT 10"
        )
        rows = await cursor.fetchall()
        recent_sessions = []
        for r in rows:
            recent_sessions.append(SessionResponse(
                id=r[0], name=r[1], status=r[2],
                platforms=json.loads(r[3]), keywords=json.loads(r[4]),
                total_leads=r[5], emails_found=r[6], phones_found=r[7],
                started_at=r[8], completed_at=r[9],
                duration=r[10], progress=r[11],
            ))

        return DashboardStats(
            total_leads=total_leads,
            leads_today=leads_today,
            total_emails=total_emails,
            total_phones=total_phones,
            verified_emails=verified_emails,
            sessions_completed=sessions_completed,
            platform_breakdown=platform_breakdown,
            daily_trend=daily_trend,
            recent_sessions=recent_sessions,
        )


# ─── v3.5.15: Diagnostic endpoint ─────────────────────────────────────────────

@router.get("/diagnostic/duckdb")
async def diagnostic_duckdb() -> dict:
    """Test each step of DuckDB + httpfs + S3 setup and report results.

    Helps diagnose why database search returns 0 leads in packaged builds.
    Each step reports pass/fail with detailed error info.
    """
    import sys as _sys

    results: dict[str, dict] = {}

    # Step 1: DuckDB import
    try:
        import duckdb
        results["1_duckdb_import"] = {
            "status": "pass",
            "version": duckdb.__version__,
        }
    except ImportError as e:
        results["1_duckdb_import"] = {"status": "fail", "error": str(e)}
        return results

    # Step 2: Check PyInstaller environment
    meipass = getattr(_sys, "_MEIPASS", None)
    results["2_environment"] = {
        "frozen": getattr(_sys, "frozen", False),
        "meipass": meipass,
        "executable": _sys.executable,
    }

    # Step 3: Extension directory
    try:
        from app.services.database_search import _get_extension_directory
        ext_dir = _get_extension_directory()
        results["3_extension_dir"] = {
            "status": "pass",
            "path": ext_dir,
            "exists": os.path.isdir(ext_dir),
        }
    except Exception as e:
        results["3_extension_dir"] = {"status": "fail", "error": str(e)}

    # Step 4: Bundled extension check
    try:
        from app.services.database_search import _ensure_bundled_httpfs
        bundled_ok = _ensure_bundled_httpfs(ext_dir)
        # List extension files in ext_dir
        ext_files = []
        for root, _dirs, files in os.walk(ext_dir):
            for f in files:
                fp = os.path.join(root, f)
                ext_files.append({
                    "path": os.path.relpath(fp, ext_dir),
                    "size": os.path.getsize(fp),
                })
        results["4_bundled_httpfs"] = {
            "status": "pass" if bundled_ok else "no_bundle",
            "files_in_ext_dir": ext_files,
        }
    except Exception as e:
        results["4_bundled_httpfs"] = {"status": "fail", "error": str(e)}

    # Step 5: DuckDB connection + httpfs load
    try:
        con = duckdb.connect()
        con.execute(f"SET extension_directory='{ext_dir}';")
        # Try LOAD directly (should work if bundled extension is present)
        try:
            con.execute("LOAD httpfs;")
            results["5_httpfs_load"] = {"status": "pass", "method": "direct_load"}
        except Exception as load_err:
            # Try INSTALL + LOAD
            try:
                con.execute("INSTALL httpfs;")
                con.execute("LOAD httpfs;")
                results["5_httpfs_load"] = {"status": "pass", "method": "install_then_load"}
            except Exception as install_err:
                results["5_httpfs_load"] = {
                    "status": "fail",
                    "load_error": str(load_err),
                    "install_error": str(install_err),
                }
                con.close()
                return results
    except Exception as e:
        results["5_httpfs_load"] = {"status": "fail", "error": str(e)}
        return results

    # Step 6: S3 configuration
    try:
        from app.services.database_search import (
            _S3_ACCESS_KEY, _S3_ENDPOINT, _S3_REGION, _S3_SECRET_KEY,
        )
        con.execute(f"SET s3_endpoint='{_S3_ENDPOINT}';")
        con.execute(f"SET s3_access_key_id='{_S3_ACCESS_KEY}';")
        con.execute(f"SET s3_secret_access_key='{_S3_SECRET_KEY}';")
        con.execute(f"SET s3_region='{_S3_REGION}';")
        con.execute("SET s3_url_style='path';")
        results["6_s3_config"] = {"status": "pass", "endpoint": _S3_ENDPOINT}
    except Exception as e:
        results["6_s3_config"] = {"status": "fail", "error": str(e)}
        con.close()
        return results

    # Step 7: Test query (single small file)
    try:
        test_sql = (
            "SELECT COUNT(*) FROM read_csv_auto("
            "'s3://crop-spray-uploads/leads-cm-database/linkedin/United_States/dataset_1.csv',"
            " ignore_errors=true) LIMIT 1"
        )
        row = con.execute(test_sql).fetchone()
        results["7_test_query"] = {
            "status": "pass",
            "row_count": row[0] if row else 0,
        }
    except Exception as e:
        results["7_test_query"] = {"status": "fail", "error": str(e)}
    finally:
        con.close()

    # Step 8: License tier
    tier = _read_electron_license_tier()
    results["8_license_tier"] = {"tier": tier or "free (no electron license found)"}

    return results


# ─── Extraction ───────────────────────────────────────────────────────────────

async def _load_proxy_pool() -> None:
    """Load proxies from DB into the proxy manager pool."""
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT * FROM proxies WHERE status = 'active'"
        )
        rows = await cursor.fetchall()
        proxy_manager.proxies = []
        for r in rows:
            proxy_manager.proxies.append({
                "id": r[0], "host": r[1], "port": r[2],
                "username": r[3], "password": r[4],
                "protocol": r[5], "country": r[6],
                "speed": r[7], "status": r[8],
            })


async def _update_progress(
    session_id: str, progress: int, status_message: str,
    current_platform: str = "", leads_so_far: int = 0,
    emails_so_far: int = 0, phones_so_far: int = 0,
) -> None:
    """Update extraction progress in real-time."""
    async with get_db() as db:
        await db.execute(
            """UPDATE sessions SET progress=?, status_message=?, current_platform=?,
               total_leads=?, emails_found=?, phones_found=?
            WHERE id=?""",
            (progress, status_message, current_platform,
             leads_so_far, emails_so_far, phones_so_far, session_id),
        )
        await db.commit()


# R5-B18 fix: dedicated thread pool for live scraping (bounded workers)
_LIVE_SCRAPE_POOL = ThreadPoolExecutor(max_workers=4, thread_name_prefix="live-scrape-route")

import atexit as _atexit_routes  # noqa: E402
_atexit_routes.register(_LIVE_SCRAPE_POOL.shutdown, wait=False)


def _read_electron_license_tier() -> Optional[str]:
    """v3.5.12: Read the user's license tier from Electron's license.json.

    The Electron app saves ``{userData}/license.json`` after online activation.
    This file contains ``{"tier": "pro"|"starter", "expires_at": ..., ...}``.
    The backend needs to read this to apply the correct DB-search limits.

    Returns ``"pro"``, ``"starter"``, or ``None`` (file missing / expired).
    """
    import platform as _platform

    # Determine Electron userData path per OS
    _home = os.path.expanduser("~")
    _sys = _platform.system()
    if _sys == "Windows":
        _app_data = os.environ.get("APPDATA", os.path.join(_home, "AppData", "Roaming"))
        _user_data = os.path.join(_app_data, "snapleads")
    elif _sys == "Darwin":
        _user_data = os.path.join(_home, "Library", "Application Support", "snapleads")
    else:
        _user_data = os.path.join(_home, ".config", "snapleads")

    # Also check DATABASE_PATH parent (PyInstaller sets this)
    _db_path = os.environ.get("DATABASE_PATH", "")
    _candidates = [_user_data]
    if _db_path:
        _candidates.insert(0, os.path.dirname(_db_path))

    for _dir in _candidates:
        _lic_path = os.path.join(_dir, "license.json")
        if not os.path.isfile(_lic_path):
            continue
        try:
            with open(_lic_path, "r", encoding="utf-8") as f:
                data = json.loads(f.read())
            tier = data.get("tier", "").lower()
            if tier not in ("pro", "starter"):
                continue
            # Check expiry
            expires_at = data.get("expires_at")
            if expires_at:
                try:
                    exp = datetime.fromisoformat(str(expires_at).replace("Z", "+00:00"))
                    if exp.replace(tzinfo=None) < datetime.now():
                        logger.info("Electron license expired: %s", expires_at)
                        continue
                except (ValueError, TypeError):
                    pass  # Can't parse expiry — treat as valid (lifetime)
            logger.info("Electron license detected: tier=%s, expires=%s", tier, expires_at)
            return tier
        except (OSError, json.JSONDecodeError, KeyError) as exc:
            logger.debug("Could not read %s: %s", _lic_path, exc)
            continue

    return None


async def _run_extraction(session_id: str, config: ExtractionRequest) -> None:
    """Background task to run extraction.

    R5-B24 fix: wrapped in try/finally to always update session status.
    R5-B14 fix: parsed_keywords and cleaned_keywords initialized before try.
    """
    all_leads: list[dict] = []
    # R5-B14 fix: initialize before try block to prevent NameError
    parsed_keywords: list = []
    cleaned_keywords: list[str] = []
    location_hint = ""

    try:
        # Calculate total steps for progress tracking
        non_reddit_platforms = [p for p in config.platforms if p != "reddit"]
        has_reddit = "reddit" in config.platforms
        enabled_methods = sum([
            config.use_google_dorking and len(non_reddit_platforms) > 0,
            config.use_direct_scraping and len(non_reddit_platforms) > 0,
            has_reddit,
            config.use_firecrawl_enrichment,
        ])
        total_steps = max(enabled_methods, 1)
        current_step = 0

        def _calc_progress() -> int:
            return min(int((current_step / total_steps) * 95), 95)  # Reserve 5% for DB save

        def _count_leads() -> tuple[int, int, int]:
            emails = sum(1 for ld in all_leads if ld.get("email"))
            phones = sum(1 for ld in all_leads if ld.get("phone"))
            return len(all_leads), emails, phones

        await _update_progress(session_id, 2, "Initializing extraction...", "", 0, 0, 0)

        # ── v3.5.8: Detect B2B-only extractions to skip slow DB search ──
        # The S3 database only contains LinkedIn (86.9M) and Instagram (2.45M)
        # data.  When user selects ONLY B2B platforms (IndiaMART, Apollo, etc.)
        # there is zero relevant data in the DB — scanning 50 S3 CSV files
        # (~3.5 GB) wastes 60-120+ seconds and makes the UI appear frozen at 5%.
        _B2B_ONLY_PLATFORMS = {
            "indiamart", "apollo", "tradeindia", "exportersindia",
            "justdial", "google_maps_b2b", "rocketreach", "crunchbase",
        }
        _has_social_platforms = any(
            p not in _B2B_ONLY_PLATFORMS for p in config.platforms
        )

        # ── v3.4.0: Database Hybrid Search (tier-gated limits) ──────────
        # Query 89M+ pre-extracted leads from S3 database FIRST for instant results.
        # All tiers get access; limits differ:
        #   Free    → 10 leads max per search
        #   Starter → 25 leads max per search
        #   Pro/Unlimited → 50+ leads (unlimited)
        # v3.5.8: SKIP entirely when only B2B platforms selected (no relevant data)
        db_leads: list[dict] = []

        # v3.5.0: Parse keywords FIRST (needed by both DB search and later stages)
        for kw in config.keywords:
            parsed = parse_keyword(kw)
            parsed_keywords.append(parsed)
            cleaned_keywords.append(parsed.keyword)
            if parsed.location and not location_hint:
                location_hint = parsed.location.lower()
            if parsed.is_hinglish:
                logger.info(
                    "Hinglish detected: '%s' -> keyword='%s', location='%s'",
                    kw, parsed.keyword, parsed.location,
                )

        if not _has_social_platforms:
            # v3.5.8: Skip database search for B2B-only platform selections.
            # S3 database only has LinkedIn/Instagram — no B2B platform data.
            logger.info(
                "Skipping database search — B2B-only platforms selected: %s",
                config.platforms,
            )
            await _update_progress(
                session_id, 10,
                "Skipped DB search (B2B-only) — proceeding to scrapers...",
                "database", *_count_leads(),
            )
        else:
            try:
                # ── v3.5.12: Unified license detection ──────────────────────
                # The Electron app saves the license to {userData}/license.json
                # via IPC after online activation.  The backend must read this
                # file to know the user's actual tier.  Previously only the
                # local SQLite `licenses` table was checked — which was NEVER
                # populated during the normal Electron activation flow,
                # causing Pro users to always fall back to free tier (10 leads).
                #
                # Priority: Electron license.json → SQLite licenses table → free
                # Limits raised: Pro = 500, Starter = 200, Free = 100
                db_max_results = 100  # Free tier default (raised from 10)
                tier_label = "free"

                # Step 1: Try reading Electron's license.json
                _electron_tier = _read_electron_license_tier()
                if _electron_tier:
                    tier_label = _electron_tier
                    if tier_label == "pro":
                        db_max_results = 500
                    elif tier_label == "starter":
                        db_max_results = 200
                    else:
                        db_max_results = 100
                else:
                    # Step 2: Fallback to local SQLite licenses table
                    async with get_db() as db:
                        cursor = await db.execute(
                            "SELECT key, status FROM licenses WHERE status = 'active' "
                            "AND current_activations > 0 ORDER BY activated_at DESC LIMIT 1"
                        )
                        active_license = await cursor.fetchone()
                        if active_license:
                            cursor2 = await db.execute(
                                "SELECT expires_at FROM licenses WHERE key = ?",
                                (active_license[0],),
                            )
                            lic_row = await cursor2.fetchone()
                            if lic_row and lic_row[0]:
                                try:
                                    exp = datetime.fromisoformat(str(lic_row[0]))
                                    remaining_days = (exp - datetime.now()).days
                                    if remaining_days > 365:
                                        db_max_results = 500
                                        tier_label = "pro"
                                    else:
                                        db_max_results = 200
                                        tier_label = "starter"
                                except (ValueError, TypeError):
                                    db_max_results = 200
                                    tier_label = "starter"
                            else:
                                db_max_results = 200
                                tier_label = "starter"

                logger.info("Database search tier: %s (max %d results/keyword)", tier_label, db_max_results)

                await _update_progress(
                    session_id, 5,
                    "Searching 89M+ leads database...", "database", *_count_leads(),
                )

                # v3.5.1: Build expanded_terms_map for OR-based DB queries
                expanded_terms_map: dict[str, list[str]] = {}
                for pk in parsed_keywords:
                    if pk.expanded_terms:
                        expanded_terms_map[pk.keyword] = pk.expanded_terms

                db_leads = await search_database_hybrid(
                    keywords=cleaned_keywords,
                    platforms=config.platforms,
                    location=location_hint,
                    max_results_per_keyword=db_max_results,
                    expanded_terms_map=expanded_terms_map if expanded_terms_map else None,
                    tier=tier_label,
                )
                all_leads.extend(db_leads)
                await _update_progress(
                    session_id, 10,
                    f"Database: {len(db_leads)} instant leads ({tier_label})",
                    "database", *_count_leads(),
                )
                logger.info("Database hybrid search returned %d leads (tier=%s)", len(db_leads), tier_label)
            except Exception as e:
                # v3.5.14: Log full exception chain for diagnosis — this was
                # silently swallowing DuckDB/httpfs failures in packaged builds
                logger.error(
                    "Database search FAILED: %s — keywords=%s, platforms=%s, tier=%s",
                    e, cleaned_keywords, config.platforms, tier_label,
                    exc_info=True,
                )
                await _update_progress(
                    session_id, 10,
                    f"Database search failed: {type(e).__name__} — trying other methods...",
                    "database", *_count_leads(),
                )

        # Load proxy pool if proxies are enabled
        if config.use_proxies:
            await _load_proxy_pool()
            proxy_manager.set_strategy(config.proxy_rotation)

        # Load Serper API key from DB settings (PRIMARY search method)
        serper_api_key = ""
        async with get_db() as db:
            cursor = await db.execute(
                "SELECT value FROM settings WHERE key = 'serper_api_key'"
            )
            row = await cursor.fetchone()
            serper_api_key = row[0] if row else ""

        # ── Reddit extraction (fast, runs first) ─────────────────────────
        if has_reddit:
            await _update_progress(session_id, _calc_progress(),
                "Searching Reddit via RSS...", "reddit", *_count_leads())
            for keyword in config.keywords:
                result = await reddit_search(keyword)
                for email in result.get("emails", []):
                    all_leads.append({
                        "email": email, "phone": "", "name": "",
                        "platform": "reddit",
                        "source_url": result["sources"][0] if result.get("sources") else "",
                        "keyword": keyword,
                    })
                for phone in result.get("phones", []):
                    all_leads.append({
                        "email": "", "phone": phone, "name": "",
                        "platform": "reddit",
                        "source_url": result["sources"][0] if result.get("sources") else "",
                        "keyword": keyword,
                    })
            current_step += 1
            await _update_progress(session_id, _calc_progress(),
                f"Reddit done — {_count_leads()[0]} leads so far", "reddit", *_count_leads())

        # ── v3.5.0: LIVE scraping for all platforms ──────────────────────
        # Uses curl_cffi anti-detection + search engine dorking + page visiting
        # Replaces Selenium/Patchright — 100% ban-free, no browser automation
        # v3.5.14: Only run when use_direct_scraping is ON — previously ran
        # unconditionally even when both toggles were off, wasting time.
        live_platforms = [p for p in non_reddit_platforms if p not in ("yellowpages", "yelp")]
        if live_platforms and config.use_direct_scraping:
            # V-R1 fix: import asyncio at block top, not inside loop
            import asyncio as _aio_live  # noqa: E402
            loop = _aio_live.get_running_loop()
            for idx, platform in enumerate(live_platforms):
                await _update_progress(session_id, _calc_progress(),
                    f"Live scraping: {platform} ({idx+1}/{len(live_platforms)})...",
                    platform, *_count_leads())
                try:
                    for kw_parsed in parsed_keywords:
                        search_query = kw_parsed.keyword
                        loc = kw_parsed.location or location_hint
                        if loc:
                            search_query = f"{kw_parsed.keyword} {loc}"
                        # R5-B18 fix: use dedicated bounded thread pool
                        live_leads = await loop.run_in_executor(
                            _LIVE_SCRAPE_POOL, live_scrape_platform, platform,
                            search_query, loc, 20,
                        )
                        all_leads.extend(live_leads)
                except Exception as e:
                    logger.warning("Live scraping %s failed: %s", platform, e)
                await _update_progress(session_id, _calc_progress(),
                    f"Live scraping: {platform} done — {_count_leads()[0]} leads",
                    platform, *_count_leads())
            current_step += 1

        # ── Google Dorking for non-Reddit platforms ───────────────────────
        if config.use_google_dorking and non_reddit_platforms:
            for idx, platform in enumerate(non_reddit_platforms):
                await _update_progress(session_id, _calc_progress(),
                    f"Google Dorking: {platform} ({idx+1}/{len(non_reddit_platforms)})...",
                    platform, *_count_leads())
                # v3.5.32: Pass location to enable location-aware dork queries
                results = await dorking_search_multi(
                    config.keywords, [platform],
                    pages=config.pages_per_keyword,
                    delay=config.delay_between_requests,
                    serper_api_key=serper_api_key,
                    use_patchright=True,
                    headless=True,
                    location=location_hint,
                )
                for result in results:
                    for email in result.get("emails", []):
                        all_leads.append({
                            "email": email, "phone": "", "name": "",
                            "platform": result["platform"],
                            "source_url": result["sources"][0] if result.get("sources") else "",
                            "keyword": result["keyword"],
                        })
                    for phone in result.get("phones", []):
                        all_leads.append({
                            "email": "", "phone": phone, "name": "",
                            "platform": result["platform"],
                            "source_url": result["sources"][0] if result.get("sources") else "",
                            "keyword": result["keyword"],
                        })
                # Update after each platform
                await _update_progress(session_id, _calc_progress(),
                    f"Google Dorking: {platform} done — {_count_leads()[0]} leads",
                    platform, *_count_leads())
            current_step += 1

        # ── Direct platform scraping (Patchright) ────────────────────────
        if config.use_direct_scraping and non_reddit_platforms:
            try:
                from app.services.platform_scrapers import scrape_all_platforms_direct
                for idx, platform in enumerate(non_reddit_platforms):
                    await _update_progress(session_id, _calc_progress(),
                        f"Direct Scraping: {platform} ({idx+1}/{len(non_reddit_platforms)})...",
                        platform, *_count_leads())
                    direct_leads = await scrape_all_platforms_direct(
                        config.keywords, [platform],
                        max_results_per=config.pages_per_keyword * 5,
                        delay=config.delay_between_requests,
                        headless=True,
                    )
                    all_leads.extend(direct_leads)
                    await _update_progress(session_id, _calc_progress(),
                        f"Direct Scraping: {platform} done — {_count_leads()[0]} leads",
                        platform, *_count_leads())
            except Exception as e:
                logger.warning("Direct scraping failed: %s", e)
                await _update_progress(session_id, _calc_progress(),
                    f"Direct Scraping failed: {e}", "", *_count_leads())
            current_step += 1

        # ── v3.1.0: YellowPages Direct + Yelp Fusion ──────────────────────
        has_yellowpages = "yellowpages" in config.platforms
        has_yelp = "yelp" in config.platforms
        if has_yellowpages or has_yelp:
            try:
                # Load yelp API key from settings (optional)
                yelp_api_key = ""
                async with get_db() as db:
                    cursor = await db.execute(
                        "SELECT value FROM settings WHERE key = 'yelp_api_key'"
                    )
                    row = await cursor.fetchone()
                    yelp_api_key = row[0] if row else ""

                for keyword in config.keywords:
                    if has_yellowpages:
                        await _update_progress(session_id, _calc_progress(),
                            f"YellowPages Direct: {keyword}...", "yellowpages", *_count_leads())
                        yp_leads = await scrape_yellowpages(keyword, max_results=30)
                        all_leads.extend(yp_leads)

                    if has_yelp:
                        await _update_progress(session_id, _calc_progress(),
                            f"Yelp {'Fusion API' if yelp_api_key else 'Dorking'}: {keyword}...",
                            "yelp", *_count_leads())
                        yelp_leads = await scrape_yelp(
                            keyword, max_results=30, api_key=yelp_api_key
                        )
                        all_leads.extend(yelp_leads)

                await _update_progress(session_id, _calc_progress(),
                    f"Directories done — {_count_leads()[0]} leads", "", *_count_leads())
            except Exception as e:
                logger.warning("Directory scraping failed: %s", e)

        # ── v3.1.0: fxtwitter API for Twitter/X bios ──────────────────────
        has_twitter = "twitter" in config.platforms
        if has_twitter:
            try:
                await _update_progress(session_id, _calc_progress(),
                    "fxtwitter: extracting Twitter bios...", "twitter", *_count_leads())
                for keyword in config.keywords:
                    fx_leads = await extract_twitter_profiles(keyword, max_profiles=15)
                    all_leads.extend(fx_leads)

                # Also enrich any Twitter URLs found via dorking
                twitter_urls = [
                    ld.get("source_url", "") for ld in all_leads
                    if ld.get("platform") == "twitter" and ld.get("source_url", "").startswith("http")
                ]
                if twitter_urls:
                    enriched = await enrich_twitter_leads_with_fxtwitter(twitter_urls)
                    all_leads.extend(enriched)

                await _update_progress(session_id, _calc_progress(),
                    f"fxtwitter done — {_count_leads()[0]} leads", "twitter", *_count_leads())
            except Exception as e:
                logger.warning("fxtwitter extraction failed: %s", e)

        # ── v3.1.0: Pinterest RSS feed extraction ─────────────────────────
        has_pinterest = "pinterest" in config.platforms
        if has_pinterest:
            try:
                await _update_progress(session_id, _calc_progress(),
                    "Pinterest RSS: extracting feeds...", "pinterest", *_count_leads())
                for keyword in config.keywords:
                    pin_leads = await extract_pinterest_rss(keyword, max_results=25)
                    all_leads.extend(pin_leads)

                # Enrich Pinterest URLs found via dorking
                pinterest_urls = [
                    ld.get("source_url", "") for ld in all_leads
                    if ld.get("platform") == "pinterest" and ld.get("source_url", "").startswith("http")
                ]
                if pinterest_urls:
                    enriched = await enrich_pinterest_leads_with_rss(pinterest_urls)
                    all_leads.extend(enriched)

                await _update_progress(session_id, _calc_progress(),
                    f"Pinterest RSS done — {_count_leads()[0]} leads", "pinterest", *_count_leads())
            except Exception as e:
                logger.warning("Pinterest RSS extraction failed: %s", e)

        # ── v3.1.0: Bio Link Follower for all leads with bio_link field ──
        bio_link_urls = [
            ld.get("bio_link", "") for ld in all_leads
            if ld.get("bio_link", "").startswith("http")
        ]
        if bio_link_urls:
            try:
                await _update_progress(session_id, _calc_progress(),
                    f"Following {len(bio_link_urls)} bio links...", "bio_links", *_count_leads())
                import asyncio as _asyncio
                loop = _asyncio.get_running_loop()
                bio_results = await loop.run_in_executor(
                    None, follow_bio_links, bio_link_urls, 20, True
                )
                for email in bio_results.get("emails", []):
                    all_leads.append({
                        "email": email, "phone": "", "name": "",
                        "platform": "bio_link",
                        "source_url": "bio_link",
                        "keyword": "",
                    })
                for phone in bio_results.get("phones", []):
                    all_leads.append({
                        "email": "", "phone": phone, "name": "",
                        "platform": "bio_link",
                        "source_url": "bio_link",
                        "keyword": "",
                    })
                await _update_progress(session_id, _calc_progress(),
                    f"Bio links done — {_count_leads()[0]} leads", "", *_count_leads())
            except Exception as e:
                logger.warning("Bio link following failed: %s", e)

        # ── v3.5.4: B2B Platform Scraping ─────────────────────────────────
        # Dedicated scrapers for IndiaMART, Apollo, TradeIndia, ExportersIndia,
        # JustDial, Google Maps B2B, RocketReach, Crunchbase
        b2b_platforms = [
            p for p in config.platforms
            if p in (
                "indiamart", "apollo", "tradeindia", "exportersindia",
                "justdial", "google_maps_b2b", "rocketreach", "crunchbase",
            )
        ]
        if b2b_platforms:
            import asyncio as _aio_b2b
            loop_b2b = _aio_b2b.get_running_loop()
            for idx, platform in enumerate(b2b_platforms):
                await _update_progress(session_id, _calc_progress(),
                    f"B2B scraping: {platform} ({idx+1}/{len(b2b_platforms)})...",
                    platform, *_count_leads())
                try:
                    for kw_parsed in parsed_keywords:
                        search_query = kw_parsed.keyword
                        loc = kw_parsed.location or location_hint
                        if loc:
                            search_query = f"{kw_parsed.keyword} {loc}"
                        b2b_leads = await loop_b2b.run_in_executor(
                            None, b2b_scrape_platform, platform,
                            search_query, loc, 50,
                        )
                        all_leads.extend(b2b_leads)
                except Exception as e:
                    logger.warning("B2B scraping %s failed: %s", platform, e)
                await _update_progress(session_id, _calc_progress(),
                    f"B2B scraping: {platform} done — {_count_leads()[0]} leads",
                    platform, *_count_leads())
            current_step += 1

        # ── v3.5.4: Waterfall Enrichment ────────────────────────────────────
        # Auto-fill missing email/phone/LinkedIn via Hunter, GitHub, website crawl
        if all_leads:
            await _update_progress(session_id, _calc_progress(),
                "Waterfall enrichment: filling missing fields...", "enrichment", *_count_leads())
            try:
                import asyncio as _aio_enrich
                loop_enrich = _aio_enrich.get_running_loop()
                enriched_leads = await loop_enrich.run_in_executor(
                    None, enrich_leads_batch_waterfall,
                    all_leads, 30, False, False, False,
                )
                # Merge and deduplicate across all sources
                all_leads = await loop_enrich.run_in_executor(
                    None, merge_and_deduplicate_leads, enriched_leads,
                )
                await _update_progress(session_id, _calc_progress(),
                    f"Enrichment done — {_count_leads()[0]} leads (deduped)",
                    "enrichment", *_count_leads())
            except Exception as e:
                logger.warning("Waterfall enrichment failed: %s", e)
            current_step += 1

        # ── Firecrawl enrichment ──────────────────────────────────────────
        if config.use_firecrawl_enrichment:
            await _update_progress(session_id, _calc_progress(),
                "Running Firecrawl enrichment...", "firecrawl", *_count_leads())
            async with get_db() as db:
                cursor = await db.execute(
                    "SELECT value FROM settings WHERE key = 'firecrawl_api_key'"
                )
                row = await cursor.fetchone()
                firecrawl_key = row[0] if row else ""

            if firecrawl_key:
                enriched = await enrich_leads_with_firecrawl(
                    all_leads, firecrawl_key, max_urls=50
                )
                all_leads.extend(enriched)
            current_step += 1
            await _update_progress(session_id, _calc_progress(),
                f"Firecrawl done — {_count_leads()[0]} leads total", "", *_count_leads())

        # Log platform-level summary so 0-result failures are visible
        if not all_leads:
            logger.warning(
                "Session %s: 0 leads found across all stages (DB search, live scraping, "
                "dorking, B2B, enrichment). Keywords=%s, Platforms=%s",
                session_id, config.keywords, config.platforms,
            )
        await _update_progress(session_id, 96, "Saving leads to database...", "", *_count_leads())

        # Process leads: classify, score, verify, and store
        # v3.5.22: Skip per-lead email verification for large batches (>50)
        # to prevent stuck-at-96%. With 498 leads × 3s timeout = 25 min hang.
        # Verification can be triggered later via the "Verify" button in Results.
        async with get_db() as db:
            emails_found = 0
            phones_found = 0
            total_to_save = len(all_leads)
            # v3.5.22: Only verify emails during save for small batches
            should_verify = config.auto_verify and total_to_save <= 50
            if not should_verify and config.auto_verify and total_to_save > 50:
                logger.info(
                    "Session %s: Skipping per-lead email verification for %d leads "
                    "(too many — would block save phase). Use Results > Verify later.",
                    session_id, total_to_save,
                )
            save_start = time.monotonic()
            _SAVE_PHASE_TIMEOUT = 120  # seconds — hard cap on entire save loop

            for save_idx, lead_data in enumerate(all_leads):
                # v3.5.22: hard timeout for entire save phase
                if time.monotonic() - save_start > _SAVE_PHASE_TIMEOUT:
                    logger.warning(
                        "Session %s: Save phase timeout after %ds, saved %d/%d leads",
                        session_id, _SAVE_PHASE_TIMEOUT, save_idx, total_to_save,
                    )
                    break

                lead_id = str(uuid.uuid4())
                email = lead_data.get("email", "")
                phone = lead_data.get("phone", "")
                name = lead_data.get("name", "")

                # v3.5.10: use existing db connection for progress updates
                if total_to_save > 0 and save_idx % max(1, total_to_save // 10) == 0:
                    save_pct = 96 + int((save_idx / total_to_save) * 3)  # 96-99%
                    _lc = _count_leads()
                    await db.execute(
                        """UPDATE sessions SET progress=?, status_message=?,
                           current_platform=?, total_leads=?, emails_found=?,
                           phones_found=? WHERE id=?""",
                        (save_pct,
                         f"Saving lead {save_idx + 1}/{total_to_save}...",
                         "", _lc[0], _lc[1], _lc[2], session_id),
                    )

                # Check blacklist
                if email:
                    cursor = await db.execute(
                        "SELECT 1 FROM blacklist WHERE (type='email' AND value=?) OR (type='domain' AND value=?)",
                        (email, email.split("@")[-1] if "@" in email else ""),
                    )
                    if await cursor.fetchone():
                        continue

                email_type = classify_email(email) if email else "unknown"
                verified = False
                if email and should_verify:
                    try:
                        verified = await asyncio.wait_for(
                            verify_email(email), timeout=3.0,
                        )
                    except asyncio.TimeoutError:
                        logger.debug("Email verification timed out for %s", email)
                        verified = False

                quality = score_lead(email, phone, name, verified)

                # v3.5.33 Fix #3: Infer country from lead data using cascading
                # signals BEFORE insert. This ensures the country field is never
                # empty, which is the root cause of location filtering failures.
                inferred_country = _infer_country_from_lead(lead_data, location_hint)

                # v3.5.28 Bug 1 fix: Re-tag leads with user's requested platform.
                # DB search returns leads tagged with their SOURCE platform
                # (linkedin/instagram) but user selected e.g. "facebook".
                # Store original as source_platform, set platform to what user requested.
                original_platform = lead_data.get("platform", "")
                # Determine the user-facing platform tag:
                # If the lead's source platform doesn't match ANY of the user's
                # selected platforms, re-tag it with the first user-selected platform.
                _user_platforms = config.platforms if config.platforms else []
                if original_platform and original_platform in _user_platforms:
                    display_platform = original_platform  # already matches
                elif _user_platforms:
                    display_platform = _user_platforms[0]  # re-tag to user's selection
                else:
                    display_platform = original_platform  # fallback

                try:
                    await db.execute(
                        """INSERT OR IGNORE INTO leads
                        (id, email, phone, name, platform, source_url, keyword, country,
                         email_type, verified, quality_score, extracted_at, session_id,
                         source_platform)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (lead_id, email, phone, name, display_platform,
                         lead_data.get("source_url", ""), lead_data.get("keyword", ""),
                         inferred_country, email_type, 1 if verified else 0, quality,
                         datetime.now().isoformat(), session_id, original_platform),
                    )
                    if email:
                        emails_found += 1
                    if phone:
                        phones_found += 1
                except Exception as exc:
                    logger.debug("Lead insert failed: %s", exc)

            # Update session
            # v3.5.14: total_leads = actual leads saved (not emails+phones count)
            # Previously: total = emails_found + phones_found (double-counted leads
            # with both email AND phone, showed 0 for leads with only name/URL)
            total_saved = emails_found + phones_found  # leads with contact info
            # Count actual rows inserted for this session
            count_cursor = await db.execute(
                "SELECT COUNT(*) FROM leads WHERE session_id=?", (session_id,)
            )
            count_row = await count_cursor.fetchone()
            actual_total = count_row[0] if count_row else total_saved
            await db.execute(
                """UPDATE sessions SET
                    status='completed', total_leads=?, emails_found=?, phones_found=?,
                    completed_at=?, duration=?, progress=100,
                    status_message=?, current_platform=''
                WHERE id=?""",
                (actual_total, emails_found, phones_found,
                 datetime.now().isoformat(),
                 0, f"Extraction complete — {actual_total} leads found", session_id),
            )
            await db.commit()

    except Exception as e:
        # R5-B24 fix: log full traceback for debugging
        logger.exception("Extraction failed for session %s", session_id)
        async with get_db() as db:
            await db.execute(
                """UPDATE sessions SET status='failed', completed_at=?,
                   status_message=?, current_platform=''
                WHERE id=?""",
                (datetime.now().isoformat(), f"Extraction failed: {e}", session_id),
            )
            await db.commit()
    finally:
        # R5-B24 fix: always ensure session is not stuck in 'running'
        try:
            async with get_db() as db:
                cursor = await db.execute(
                    "SELECT status FROM sessions WHERE id=?", (session_id,)
                )
                row = await cursor.fetchone()
                if row and row[0] == "running":
                    await db.execute(
                        """UPDATE sessions SET status='completed', completed_at=?,
                           progress=100, status_message='Completed'
                        WHERE id=? AND status='running'""",
                        (datetime.now().isoformat(), session_id),
                    )
                    await db.commit()
        except Exception:
            logger.debug("Failed to finalize session %s status", session_id)


@router.post("/extract")
async def start_extraction(
    config: ExtractionRequest,
    background_tasks: BackgroundTasks,
) -> dict:
    session_id = str(uuid.uuid4())

    async with get_db() as db:
        await db.execute(
            """INSERT INTO sessions
            (id, name, status, platforms, keywords, started_at, config)
            VALUES (?, ?, 'running', ?, ?, ?, ?)""",
            (session_id, config.name, json.dumps(config.platforms),
             json.dumps(config.keywords), datetime.now().isoformat(),
             json.dumps(config.model_dump())),
        )
        await db.commit()

    background_tasks.add_task(_run_extraction, session_id, config)

    return {"session_id": session_id, "status": "running"}


@router.get("/extract/{session_id}/status")
async def get_extraction_status(session_id: str) -> dict:
    async with get_db() as db:
        cursor = await db.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Session not found")
        result = {
            "id": row[0], "name": row[1], "status": row[2],
            "total_leads": row[5], "emails_found": row[6],
            "phones_found": row[7], "progress": row[11],
        }
        # Include extra columns if they exist
        try:
            keys = row.keys()
            if "error_message" in keys:
                result["error_message"] = row["error_message"] or ""
            if "current_platform" in keys:
                result["current_platform"] = row["current_platform"] or ""
            if "status_message" in keys:
                result["status_message"] = row["status_message"] or ""
        except Exception:
            pass
        return result


# ─── Results / Leads ─────────────────────────────────────────────────────────

@router.get("/results")
async def get_results(
    session_id: Optional[str] = None,
    platform: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    sort_by: Optional[str] = None,
    sort_dir: Optional[str] = None,
) -> dict:
    async with get_db() as db:
        conditions = []
        params: list = []

        if session_id:
            conditions.append("session_id = ?")
            params.append(session_id)
        # v3.5.28 Bug 1 fix: When viewing results for a specific session,
        # do NOT filter by platform. The session_id alone correctly scopes
        # results. Previously, selecting "facebook" would filter by
        # platform='facebook' but DB leads were tagged 'linkedin'/'instagram'
        # (their source), causing 0 results despite 515 leads existing.
        # Platform filter is only applied when browsing ALL leads (no session_id).
        if platform and not session_id:
            conditions.append("platform = ?")
            params.append(platform)
        if search:
            # Escape LIKE wildcards to prevent pattern injection
            safe_search = search.replace("%", "\\%").replace("_", "\\_")
            conditions.append("(email LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\')")
            params.extend([f"%{safe_search}%"] * 3)

        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        # Count
        cursor = await db.execute(f"SELECT COUNT(*) FROM leads {where}", params)
        row = await cursor.fetchone()
        total = row[0] if row else 0

        # Sorting — whitelist allowed columns to prevent SQL injection
        allowed_sort_columns = {'email', 'phone', 'platform', 'quality_score', 'extracted_at', 'name', 'keyword', 'verified'}
        order_col = sort_by if sort_by in allowed_sort_columns else 'extracted_at'
        order_dir = 'ASC' if sort_dir == 'asc' else 'DESC'

        # Clamp page_size to prevent memory exhaustion
        page_size = max(1, min(page_size, 500))
        # Fetch page
        offset = (page - 1) * page_size
        cursor = await db.execute(
            f"SELECT * FROM leads {where} ORDER BY {order_col} {order_dir} LIMIT ? OFFSET ?",
            [*params, page_size, offset],
        )
        rows = await cursor.fetchall()
        leads = []
        for r in rows:
            leads.append({
                "id": r[0], "email": r[1], "phone": r[2], "name": r[3],
                "platform": r[4], "source_url": r[5], "keyword": r[6],
                "country": r[7], "email_type": r[8], "verified": bool(r[9]),
                "quality_score": r[10], "extracted_at": r[11], "session_id": r[12],
            })

        return {
            "leads": leads,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }


@router.delete("/results/{lead_id}")
async def delete_lead(lead_id: str) -> dict:
    async with get_db() as db:
        await db.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
        await db.commit()
    return {"status": "deleted"}


@router.delete("/results")
async def delete_leads(lead_ids: list[str]) -> dict:
    async with get_db() as db:
        placeholders = ",".join("?" for _ in lead_ids)
        await db.execute(f"DELETE FROM leads WHERE id IN ({placeholders})", lead_ids)
        await db.commit()
    return {"status": "deleted", "count": len(lead_ids)}


@router.post("/results/clean")
async def clean_all_results() -> dict:
    """Clean and verify all leads: validate emails/phones, remove duplicates and invalid entries, rescore. Pro-only feature."""
    import re
    import logging
    from app.services.duplicate_detector import compute_lead_hash
    from app.services.extractor import classify_email, EMAIL_PATTERN, EMAIL_BLACKLIST_COMPILED
    from app.services.lead_scorer import calculate_lead_score, get_score_label

    log = logging.getLogger("clean_results")

    stats = {
        "status": "cleaned",
        "total_before": 0,
        "total_after": 0,
        "emails_verified": 0,
        "emails_failed_verification": 0,
        "phones_validated": 0,
        "phones_invalid": 0,
        "duplicates_removed": 0,
        "invalid_removed": 0,
        "leads_rescored": 0,
    }

    async with get_db() as db:
        # Count total leads before cleaning
        cursor = await db.execute("SELECT COUNT(*) FROM leads")
        row = await cursor.fetchone()
        stats["total_before"] = row[0] if row else 0
        log.info("Clean started: %d leads total", stats["total_before"])

        if stats["total_before"] == 0:
            return stats

        # ── Step 1: Verify all unverified emails via MX records ──
        cursor = await db.execute(
            "SELECT id, email FROM leads WHERE email != '' AND verified = 0"
        )
        unverified_rows = await cursor.fetchall()
        log.info("Step 1: %d unverified emails to check", len(unverified_rows))

        for r in unverified_rows:
            lead_id, email = r[0], r[1]
            try:
                is_valid = await verify_email(email)
                if is_valid:
                    await db.execute(
                        "UPDATE leads SET verified = 1 WHERE id = ?", (lead_id,)
                    )
                    stats["emails_verified"] += 1
                else:
                    stats["emails_failed_verification"] += 1
            except Exception as e:
                log.warning("MX check failed for %s: %s", email, e)
                stats["emails_failed_verification"] += 1

        log.info("Step 1 done: %d verified, %d failed", stats["emails_verified"], stats["emails_failed_verification"])

        # ── Step 2: Validate email formats ──
        cursor = await db.execute("SELECT id, email FROM leads WHERE email != ''")
        email_rows = await cursor.fetchall()
        invalid_email_ids: list[str] = []

        for r in email_rows:
            lead_id, email = r[0], r[1]
            # Check basic format
            if not EMAIL_PATTERN.fullmatch(email):
                invalid_email_ids.append(lead_id)
                continue
            # Check against blacklist patterns (noreply, file extensions, etc.)
            if any(bp.match(email.lower()) for bp in EMAIL_BLACKLIST_COMPILED):
                invalid_email_ids.append(lead_id)

        # Clear invalid emails (set to empty, don't delete lead yet — phone may be valid)
        if invalid_email_ids:
            placeholders = ",".join("?" for _ in invalid_email_ids)
            await db.execute(
                f"UPDATE leads SET email = '', email_type = 'unknown', verified = 0 WHERE id IN ({placeholders})",
                invalid_email_ids,
            )
        log.info("Step 2: %d invalid emails cleared (of %d checked)", len(invalid_email_ids), len(email_rows))

        # ── Step 3: Validate phone numbers ──
        cursor = await db.execute("SELECT id, phone FROM leads WHERE phone != ''")
        phone_rows = await cursor.fetchall()

        for r in phone_rows:
            lead_id, phone = r[0], r[1]
            digits = re.sub(r'[^\d]', '', phone)
            if 7 <= len(digits) <= 15:
                stats["phones_validated"] += 1
            else:
                # Invalid phone — clear it
                await db.execute(
                    "UPDATE leads SET phone = '' WHERE id = ?", (lead_id,)
                )
                stats["phones_invalid"] += 1

        log.info("Step 3: %d phones valid, %d invalid (of %d checked)", stats["phones_validated"], stats["phones_invalid"], len(phone_rows))

        # ── Step 4: Remove leads with NO useful info at all ──
        # Only remove leads that have ALL fields empty: no email, no phone, AND no name
        # Also check source_url and keyword as fallback identifiers
        cursor = await db.execute(
            "SELECT id, email, phone, name, source_url, keyword, platform FROM leads WHERE "
            "(email = '' OR email IS NULL) AND "
            "(phone = '' OR phone IS NULL) AND "
            "(name = '' OR name IS NULL)"
        )
        no_contact_rows = await cursor.fetchall()
        no_contact_ids = [r[0] for r in no_contact_rows]
        log.info("Step 4: %d leads have no email/phone/name", len(no_contact_ids))

        # SAFETY: Do NOT delete more than 80% of leads — something is wrong if so
        max_safe_delete = int(stats["total_before"] * 0.8)
        if len(no_contact_ids) > max_safe_delete:
            log.warning("Step 4 ABORTED: would delete %d/%d leads (>80%%) — skipping deletion",
                        len(no_contact_ids), stats["total_before"])
            stats["invalid_removed"] = 0
        elif no_contact_ids:
            placeholders = ",".join("?" for _ in no_contact_ids)
            await db.execute(
                f"DELETE FROM leads WHERE id IN ({placeholders})", no_contact_ids
            )
            stats["invalid_removed"] = len(no_contact_ids)
            log.info("Step 4: deleted %d leads with no contact info", len(no_contact_ids))

        # ── Step 5: Remove duplicates (keep first occurrence) ──
        cursor = await db.execute(
            "SELECT id, email, phone, name FROM leads ORDER BY extracted_at ASC"
        )
        all_rows = await cursor.fetchall()
        seen_hashes: set[str] = set()
        dup_ids: list[str] = []

        for r in all_rows:
            h = compute_lead_hash(r[1], r[2], r[3])
            if h in seen_hashes:
                dup_ids.append(r[0])
            else:
                seen_hashes.add(h)

        log.info("Step 5: %d duplicates found (of %d remaining)", len(dup_ids), len(all_rows))

        # SAFETY: Do NOT remove more than 80% as duplicates
        remaining_count = len(all_rows)
        max_safe_dedup = int(remaining_count * 0.8)
        if len(dup_ids) > max_safe_dedup and remaining_count > 10:
            log.warning("Step 5 ABORTED: would remove %d/%d as duplicates (>80%%) — skipping",
                        len(dup_ids), remaining_count)
        elif dup_ids:
            placeholders = ",".join("?" for _ in dup_ids)
            await db.execute(
                f"DELETE FROM leads WHERE id IN ({placeholders})", dup_ids
            )
            stats["duplicates_removed"] = len(dup_ids)
            log.info("Step 5: removed %d duplicates", len(dup_ids))

        # ── Step 6: Re-score all remaining leads ──
        cursor = await db.execute(
            "SELECT id, email, phone, name, verified, email_type FROM leads"
        )
        remaining_rows = await cursor.fetchall()

        for r in remaining_rows:
            email_val = r[1] if r[1] else ""
            phone_val = r[2] if r[2] else ""
            name_val = r[3] if r[3] else ""
            verified_val = bool(r[4]) if r[4] else False
            email_type_val = r[5] if r[5] else "unknown"

            email_type = classify_email(email_val) if email_val else email_type_val
            new_score = calculate_lead_score(
                email=email_val, phone=phone_val, name=name_val,
                verified=verified_val, email_type=email_type,
            )
            category = get_score_label(new_score)
            await db.execute(
                "UPDATE leads SET quality_score=?, email_type=?, lead_score=?, score_category=? WHERE id=?",
                (new_score, email_type, new_score, category, r[0]),
            )
            stats["leads_rescored"] += 1

        log.info("Step 6: rescored %d leads", stats["leads_rescored"])

        await db.commit()

        # Count total leads after cleaning
        cursor = await db.execute("SELECT COUNT(*) FROM leads")
        row = await cursor.fetchone()
        stats["total_after"] = row[0] if row else 0

        log.info("Clean complete: %d → %d leads", stats["total_before"], stats["total_after"])

    return stats


# ─── History / Sessions ───────────────────────────────────────────────────────

@router.get("/history")
async def get_history(status: Optional[str] = None) -> list[dict]:
    async with get_db() as db:
        if status and status != "all":
            cursor = await db.execute(
                "SELECT * FROM sessions WHERE status = ? ORDER BY started_at DESC",
                (status,),
            )
        else:
            cursor = await db.execute("SELECT * FROM sessions ORDER BY started_at DESC")

        rows = await cursor.fetchall()
        sessions = []
        for r in rows:
            sessions.append({
                "id": r[0], "name": r[1], "status": r[2],
                "platforms": json.loads(r[3]), "keywords": json.loads(r[4]),
                "total_leads": r[5], "emails_found": r[6], "phones_found": r[7],
                "started_at": r[8], "completed_at": r[9],
                "duration": r[10], "progress": r[11],
            })
        return sessions


@router.delete("/history/{session_id}")
async def delete_session(session_id: str) -> dict:
    async with get_db() as db:
        await db.execute("DELETE FROM leads WHERE session_id = ?", (session_id,))
        await db.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        await db.commit()
    return {"status": "deleted"}


# ─── Blacklist ────────────────────────────────────────────────────────────────

@router.get("/blacklist")
async def get_blacklist(type_filter: Optional[str] = None) -> list[dict]:
    async with get_db() as db:
        if type_filter and type_filter != "all":
            cursor = await db.execute(
                "SELECT * FROM blacklist WHERE type = ? ORDER BY added_at DESC",
                (type_filter,),
            )
        else:
            cursor = await db.execute("SELECT * FROM blacklist ORDER BY added_at DESC")

        rows = await cursor.fetchall()
        return [
            {"id": r[0], "type": r[1], "value": r[2], "reason": r[3], "added_at": r[4]}
            for r in rows
        ]


@router.post("/blacklist")
async def add_blacklist_entry(entry: BlacklistEntryRequest) -> dict:
    entry_id = str(uuid.uuid4())
    async with get_db() as db:
        try:
            await db.execute(
                "INSERT INTO blacklist (id, type, value, reason, added_at) VALUES (?, ?, ?, ?, ?)",
                (entry_id, entry.type, entry.value, entry.reason, datetime.now().isoformat()),
            )
            await db.commit()
        except Exception:
            raise HTTPException(status_code=409, detail="Entry already exists")
    return {"id": entry_id, "status": "added"}


@router.delete("/blacklist/{entry_id}")
async def delete_blacklist_entry(entry_id: str) -> dict:
    async with get_db() as db:
        await db.execute("DELETE FROM blacklist WHERE id = ?", (entry_id,))
        await db.commit()
    return {"status": "deleted"}


# ─── Proxies ──────────────────────────────────────────────────────────────────

@router.post("/proxies/test-all")
async def test_all_proxies() -> dict:
    """Test all proxies and update their status."""
    async with get_db() as db:
        cursor = await db.execute("SELECT * FROM proxies")
        rows = await cursor.fetchall()
        results = {"tested": 0, "active": 0, "failed": 0}
        for r in rows:
            proxy_config = {
                "host": r[1], "port": r[2], "username": r[3],
                "password": r[4], "protocol": r[5],
            }
            result = await test_proxy(proxy_config)
            await db.execute(
                "UPDATE proxies SET status=?, speed=?, last_tested=? WHERE id=?",
                (result["status"], result["speed"],
                 datetime.now().isoformat(), r[0]),
            )
            results["tested"] += 1
            if result["status"] == "active":
                results["active"] += 1
            else:
                results["failed"] += 1
        await db.commit()
    return results


@router.get("/proxies")
async def get_proxies() -> list[dict]:
    async with get_db() as db:
        cursor = await db.execute("SELECT * FROM proxies ORDER BY status, speed")
        rows = await cursor.fetchall()
        return [
            {
                "id": r[0], "host": r[1], "port": r[2], "username": r[3],
                "password": r[4], "protocol": r[5], "country": r[6],
                "speed": r[7], "status": r[8], "last_tested": r[9],
            }
            for r in rows
        ]


@router.post("/proxies")
async def add_proxy(proxy: ProxyRequest) -> dict:
    proxy_id = str(uuid.uuid4())
    async with get_db() as db:
        await db.execute(
            """INSERT INTO proxies (id, host, port, username, password, protocol, country)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (proxy_id, proxy.host, proxy.port, proxy.username,
             proxy.password, proxy.protocol, proxy.country),
        )
        await db.commit()
    return {"id": proxy_id, "status": "added"}


@router.post("/proxies/bulk")
async def bulk_import_proxies(data: ProxyBulkImport) -> dict:
    lines = data.proxies_text.strip().split("\n")
    added = 0
    async with get_db() as db:
        for line in lines:
            parsed = parse_proxy_line(line)
            if parsed:
                proxy_id = str(uuid.uuid4())
                await db.execute(
                    """INSERT INTO proxies (id, host, port, username, password, protocol, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'inactive')""",
                    (proxy_id, parsed["host"], parsed["port"],
                     parsed["username"], parsed["password"], parsed["protocol"]),
                )
                added += 1
        await db.commit()
    return {"added": added, "total_lines": len(lines)}


@router.post("/proxies/{proxy_id}/test")
async def test_proxy_endpoint(proxy_id: str) -> dict:
    async with get_db() as db:
        cursor = await db.execute("SELECT * FROM proxies WHERE id = ?", (proxy_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Proxy not found")

        proxy_config = {
            "host": row[1], "port": row[2], "username": row[3],
            "password": row[4], "protocol": row[5],
        }
        result = await test_proxy(proxy_config)

        await db.execute(
            "UPDATE proxies SET status=?, speed=?, last_tested=? WHERE id=?",
            (result["status"], result["speed"],
             datetime.now().isoformat(), proxy_id),
        )
        await db.commit()
        return result


@router.delete("/proxies/{proxy_id}")
async def delete_proxy(proxy_id: str) -> dict:
    async with get_db() as db:
        await db.execute("DELETE FROM proxies WHERE id = ?", (proxy_id,))
        await db.commit()
    return {"status": "deleted"}


@router.delete("/proxies")
async def delete_all_proxies() -> dict:
    """Delete all proxies."""
    async with get_db() as db:
        cursor = await db.execute("SELECT COUNT(*) FROM proxies")
        row = await cursor.fetchone()
        count = row[0] if row else 0
        await db.execute("DELETE FROM proxies")
        await db.commit()
    return {"status": "deleted", "count": count}


@router.post("/firecrawl/check-credits")
async def check_firecrawl_credits_endpoint() -> dict:
    """Check Firecrawl API credit balance."""
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT value FROM settings WHERE key = 'firecrawl_api_key'"
        )
        row = await cursor.fetchone()
        api_key = row[0] if row else ""
    if not api_key:
        return {"success": False, "error": "No Firecrawl API key configured"}
    return await check_firecrawl_credits(api_key)


# ─── Export ───────────────────────────────────────────────────────────────────

@router.post("/export")
async def export_results(req: ExportRequest) -> Response:
    async with get_db() as db:
        if req.leads_ids:
            placeholders = ",".join("?" for _ in req.leads_ids)
            cursor = await db.execute(
                f"SELECT * FROM leads WHERE id IN ({placeholders})", req.leads_ids
            )
        elif req.session_id:
            cursor = await db.execute(
                "SELECT * FROM leads WHERE session_id = ?", (req.session_id,)
            )
        else:
            cursor = await db.execute("SELECT * FROM leads ORDER BY extracted_at DESC")

        rows = await cursor.fetchall()
        leads = []
        for r in rows:
            leads.append({
                "email": r[1], "phone": r[2], "name": r[3],
                "platform": r[4], "source_url": r[5], "keyword": r[6],
                "country": r[7], "email_type": r[8], "verified": bool(r[9]),
                "quality_score": r[10], "extracted_at": r[11],
            })

    data, content_type, filename = export_leads_bytes(leads, req.format)
    return Response(
        content=data,
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ─── Settings ─────────────────────────────────────────────────────────────────

@router.get("/settings")
async def get_settings() -> dict:
    async with get_db() as db:
        cursor = await db.execute("SELECT key, value FROM settings")
        rows = await cursor.fetchall()
        return {r[0]: r[1] for r in rows}


@router.put("/settings")
async def update_setting(setting: SettingUpdate) -> dict:
    async with get_db() as db:
        await db.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            (setting.key, setting.value),
        )
        await db.commit()
    return {"status": "updated"}


# ─── Licenses ─────────────────────────────────────────────────────────────────

@router.get("/licenses")
async def get_licenses(status: Optional[str] = None) -> list[dict]:
    async with get_db() as db:
        if status and status != "all":
            cursor = await db.execute(
                "SELECT * FROM licenses WHERE status = ? ORDER BY created_at DESC",
                (status,),
            )
        else:
            cursor = await db.execute("SELECT * FROM licenses ORDER BY created_at DESC")

        rows = await cursor.fetchall()
        return [
            {
                "id": r[0], "key": r[1], "status": r[2],
                "buyer_name": r[3], "buyer_email": r[4],
                "activated_at": r[5], "expires_at": r[6],
                "max_activations": r[7], "current_activations": r[8],
                "created_at": r[9],
            }
            for r in rows
        ]


@router.post("/licenses/generate")
async def generate_licenses(req: LicenseGenerateRequest) -> dict:
    generated = []
    async with get_db() as db:
        for _ in range(req.quantity):
            key = generate_license_key()
            license_id = str(uuid.uuid4())
            expires_at = get_expiry_date(req.duration_months)

            await db.execute(
                """INSERT INTO licenses
                (id, key, status, buyer_name, buyer_email, expires_at,
                 max_activations, created_at)
                VALUES (?, ?, 'active', ?, ?, ?, ?, ?)""",
                (license_id, key, req.buyer_name, req.buyer_email,
                 expires_at, req.max_activations, datetime.now().isoformat()),
            )
            generated.append({"id": license_id, "key": key, "expires_at": expires_at})
        await db.commit()

    return {"generated": generated, "count": len(generated)}


@router.post("/licenses/validate")
async def validate_license(req: LicenseValidateRequest) -> dict:
    if not validate_key_format(req.key):
        return {"valid": False, "error": "Invalid key format"}

    async with get_db() as db:
        cursor = await db.execute(
            "SELECT * FROM licenses WHERE key = ?", (req.key,)
        )
        row = await cursor.fetchone()
        if not row:
            return {"valid": False, "error": "Key not found"}

        status = row[2]
        if status == "revoked":
            return {"valid": False, "error": "Key has been revoked"}
        if status == "expired":
            return {"valid": False, "error": "Key has expired"}

        # Check expiry
        expires_at = row[6]
        if expires_at and datetime.fromisoformat(expires_at) < datetime.now():
            await db.execute(
                "UPDATE licenses SET status='expired' WHERE key=?", (req.key,)
            )
            await db.commit()
            return {"valid": False, "error": "Key has expired"}

        # Check activations
        max_act = row[7]
        current_act = row[8]
        if current_act >= max_act:
            return {"valid": False, "error": "Maximum activations reached"}

        # Activate
        await db.execute(
            """UPDATE licenses SET
                current_activations = current_activations + 1,
                activated_at = COALESCE(activated_at, ?)
            WHERE key = ?""",
            (datetime.now().isoformat(), req.key),
        )
        await db.commit()

        return {"valid": True, "status": "active", "expires_at": expires_at}


@router.put("/licenses/{license_id}/revoke")
async def revoke_license(license_id: str) -> dict:
    async with get_db() as db:
        await db.execute(
            "UPDATE licenses SET status='revoked', current_activations=0 WHERE id=?",
            (license_id,),
        )
        await db.commit()
    return {"status": "revoked"}


@router.delete("/licenses/{license_id}")
async def delete_license(license_id: str) -> dict:
    async with get_db() as db:
        await db.execute("DELETE FROM licenses WHERE id = ?", (license_id,))
        await db.commit()
    return {"status": "deleted"}


# ─── Enhancement #1: Google Maps Extractor ───────────────────────────────────

@router.post("/maps/search")
async def search_google_maps(
    req: GoogleMapsSearchRequest,
    background_tasks: BackgroundTasks,
) -> dict:
    """Search Google Maps for business listings."""
    session_id = str(uuid.uuid4())

    async with get_db() as db:
        await db.execute(
            """INSERT INTO sessions
            (id, name, status, platforms, keywords, started_at, config)
            VALUES (?, ?, 'running', ?, ?, ?, ?)""",
            (session_id, f"Google Maps: {req.query}",
             json.dumps(["google_maps"]),
             json.dumps([req.query]),
             datetime.now().isoformat(),
             json.dumps(req.model_dump())),
        )
        await db.commit()

    background_tasks.add_task(_run_gmaps_extraction, session_id, req)
    return {"session_id": session_id, "status": "running"}


async def _run_gmaps_extraction(session_id: str, req: GoogleMapsSearchRequest) -> None:
    """Background task to run Google Maps extraction."""
    from app.services.gmaps_scraper import scrape_google_maps, enrich_gmaps_with_emails
    from app.services.duplicate_detector import compute_lead_hash
    from app.services.lead_scorer import calculate_lead_score, get_score_label

    try:
        businesses = await scrape_google_maps(
            query=req.query,
            max_results=req.max_results,
            delay=req.delay,
        )

        async with get_db() as db:
            emails_found = 0
            phones_found = 0
            total = 0

            for biz in businesses:
                lead_id = str(uuid.uuid4())
                email = biz.get("email", "")
                phone = biz.get("phone", "")
                name = biz.get("name", "")
                website = biz.get("website", "")

                lead_hash = compute_lead_hash(email, phone, name)
                quality = calculate_lead_score(
                    email=email, phone=phone, name=name,
                    website=website, verified=False,
                )
                category = get_score_label(quality)

                try:
                    await db.execute(
                        """INSERT OR IGNORE INTO leads
                        (id, email, phone, name, platform, source_url, keyword, country,
                         email_type, verified, quality_score, extracted_at, session_id,
                         lead_hash, lead_score, score_category, website, address, rating, category)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (lead_id, email, phone, name, "google_maps",
                         website, req.query, "",
                         "unknown", 0, quality,
                         datetime.now().isoformat(), session_id,
                         lead_hash, quality, category, website,
                         biz.get("address", ""), biz.get("rating", ""),
                         biz.get("category", "")),
                    )
                    total += 1
                    if email:
                        emails_found += 1
                    if phone:
                        phones_found += 1
                except Exception:
                    pass

            await db.execute(
                """UPDATE sessions SET
                    status='completed', total_leads=?, emails_found=?, phones_found=?,
                    completed_at=?, progress=100
                WHERE id=?""",
                (total, emails_found, phones_found,
                 datetime.now().isoformat(), session_id),
            )
            await db.commit()

    except Exception as exc:
        error_msg = str(exc)[:500] if str(exc) else "Unknown extraction error"
        logger.error("Google Maps extraction failed for session %s: %s", session_id, error_msg)
        async with get_db() as db:
            try:
                await db.execute(
                    "UPDATE sessions SET status='failed', completed_at=?, error_message=? WHERE id=?",
                    (datetime.now().isoformat(), error_msg, session_id),
                )
            except Exception:
                await db.execute(
                    "UPDATE sessions SET status='failed', completed_at=? WHERE id=?",
                    (datetime.now().isoformat(), session_id),
                )
            await db.commit()


# ─── Enhancement #2: Duplicate Detection ─────────────────────────────────────

@router.post("/duplicates/check")
async def check_duplicates() -> dict:
    """Scan all leads and identify duplicates across sessions."""
    from app.services.duplicate_detector import compute_lead_hash

    async with get_db() as db:
        cursor = await db.execute("SELECT id, email, phone, name FROM leads")
        rows = await cursor.fetchall()

        hash_map: dict[str, list[str]] = {}
        for r in rows:
            h = compute_lead_hash(r[1], r[2], r[3])
            if h not in hash_map:
                hash_map[h] = []
            hash_map[h].append(r[0])

        # Find duplicates (hashes with more than one lead)
        duplicates = {h: ids for h, ids in hash_map.items() if len(ids) > 1}
        total_duplicates = sum(len(ids) - 1 for ids in duplicates.values())

        return {
            "total_leads": len(rows),
            "unique_leads": len(hash_map),
            "duplicate_groups": len(duplicates),
            "total_duplicates": total_duplicates,
        }


@router.post("/duplicates/remove")
async def remove_duplicates() -> dict:
    """Remove duplicate leads, keeping the first occurrence."""
    from app.services.duplicate_detector import compute_lead_hash

    async with get_db() as db:
        cursor = await db.execute(
            "SELECT id, email, phone, name, extracted_at FROM leads ORDER BY extracted_at ASC"
        )
        rows = await cursor.fetchall()

        seen_hashes: set[str] = set()
        to_delete: list[str] = []

        for r in rows:
            h = compute_lead_hash(r[1], r[2], r[3])
            if h in seen_hashes:
                to_delete.append(r[0])
            else:
                seen_hashes.add(h)

        if to_delete:
            placeholders = ",".join("?" for _ in to_delete)
            await db.execute(f"DELETE FROM leads WHERE id IN ({placeholders})", to_delete)
            await db.commit()

        return {"removed": len(to_delete), "remaining": len(rows) - len(to_delete)}


# ─── Enhancement #3: Lead Scoring ────────────────────────────────────────────

@router.post("/leads/rescore")
async def rescore_all_leads() -> dict:
    """Recalculate quality scores for all leads using enhanced scoring."""
    from app.services.lead_scorer import calculate_lead_score, get_score_label

    async with get_db() as db:
        cursor = await db.execute(
            "SELECT id, email, phone, name, verified, email_type, website, source_url FROM leads"
        )
        rows = await cursor.fetchall()

        updated = 0
        score_dist = {"hot": 0, "warm": 0, "cold": 0}

        for r in rows:
            new_score = calculate_lead_score(
                email=r[1], phone=r[2], name=r[3],
                website=r[6] or "", verified=bool(r[4]),
                email_type=r[5] or "unknown",
            )
            category = get_score_label(new_score)
            score_dist[category] += 1

            await db.execute(
                "UPDATE leads SET quality_score=?, lead_score=?, score_category=? WHERE id=?",
                (new_score, new_score, category, r[0]),
            )
            updated += 1

        await db.commit()
        return {"updated": updated, "distribution": score_dist}


@router.get("/leads/{lead_id}/score-breakdown")
async def get_lead_score_breakdown(lead_id: str) -> dict:
    """Get detailed scoring breakdown for a lead."""
    from app.services.lead_scorer import get_scoring_breakdown, calculate_lead_score, get_score_label

    async with get_db() as db:
        cursor = await db.execute(
            "SELECT email, phone, name, verified, email_type, website FROM leads WHERE id = ?",
            (lead_id,),
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Lead not found")

        breakdown = get_scoring_breakdown(
            email=row[0], phone=row[1], name=row[2],
            verified=bool(row[3]), email_type=row[4] or "unknown",
            website=row[5] or "",
        )
        total = calculate_lead_score(
            email=row[0], phone=row[1], name=row[2],
            verified=bool(row[3]), email_type=row[4] or "unknown",
            website=row[5] or "",
        )
        return {
            "lead_id": lead_id,
            "score": total,
            "category": get_score_label(total),
            "breakdown": breakdown,
        }


# ─── Enhancement #4: Scheduled Extractions ───────────────────────────────────

@router.get("/schedules")
async def get_schedules() -> list[dict]:
    """Get all scheduled extraction jobs."""
    async with get_db() as db:
        cursor = await db.execute("SELECT * FROM schedules ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        return [
            {
                "id": r[0], "name": r[1],
                "keywords": json.loads(r[2]), "platforms": json.loads(r[3]),
                "frequency": r[4], "cron_expression": r[5],
                "pages_per_keyword": r[6], "delay_between_requests": r[7],
                "use_proxies": bool(r[8]), "use_google_dorking": bool(r[9]),
                "use_firecrawl_enrichment": bool(r[10]), "auto_verify": bool(r[11]),
                "status": r[12], "created_at": r[13],
                "last_run": r[14], "next_run": r[15],
                "total_runs": r[16],
            }
            for r in rows
        ]


@router.post("/schedules")
async def create_schedule(req: ScheduleCreateRequest) -> dict:
    """Create a new scheduled extraction."""
    from app.services.scheduler_service import create_schedule as svc_create

    schedule = await svc_create(
        name=req.name,
        keywords=req.keywords,
        platforms=req.platforms,
        frequency=req.frequency,
        cron_expression=req.cron_expression,
        pages_per_keyword=req.pages_per_keyword,
        delay_between_requests=req.delay_between_requests,
        use_proxies=req.use_proxies,
        use_google_dorking=req.use_google_dorking,
        use_firecrawl_enrichment=req.use_firecrawl_enrichment,
        auto_verify=req.auto_verify,
    )

    # Persist to DB
    async with get_db() as db:
        await db.execute(
            """INSERT INTO schedules
            (id, name, keywords, platforms, frequency, cron_expression,
             pages_per_keyword, delay_between_requests, use_proxies,
             use_google_dorking, use_firecrawl_enrichment, auto_verify,
             status, created_at, last_run, next_run, total_runs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (schedule["id"], schedule["name"],
             json.dumps(schedule["keywords"]), json.dumps(schedule["platforms"]),
             schedule["frequency"], schedule["cron_expression"],
             schedule.get("pages_per_keyword", 3),
             schedule.get("delay_between_requests", 3.0),
             1 if schedule.get("use_proxies") else 0,
             1 if schedule.get("use_google_dorking", True) else 0,
             1 if schedule.get("use_firecrawl_enrichment") else 0,
             1 if schedule.get("auto_verify", True) else 0,
             schedule["status"], schedule["created_at"],
             schedule.get("last_run"), schedule.get("next_run"),
             schedule.get("total_runs", 0)),
        )
        await db.commit()

    return schedule


@router.put("/schedules/{schedule_id}/pause")
async def pause_schedule_endpoint(schedule_id: str) -> dict:
    """Pause a scheduled extraction."""
    from app.services.scheduler_service import pause_schedule

    success = await pause_schedule(schedule_id)
    if success:
        async with get_db() as db:
            await db.execute(
                "UPDATE schedules SET status='paused' WHERE id=?", (schedule_id,)
            )
            await db.commit()
    return {"status": "paused" if success else "error"}


@router.put("/schedules/{schedule_id}/resume")
async def resume_schedule_endpoint(schedule_id: str) -> dict:
    """Resume a paused scheduled extraction."""
    from app.services.scheduler_service import resume_schedule

    success = await resume_schedule(schedule_id)
    if success:
        async with get_db() as db:
            await db.execute(
                "UPDATE schedules SET status='active' WHERE id=?", (schedule_id,)
            )
            await db.commit()
    return {"status": "active" if success else "error"}


@router.delete("/schedules/{schedule_id}")
async def delete_schedule_endpoint(schedule_id: str) -> dict:
    """Delete a scheduled extraction."""
    from app.services.scheduler_service import delete_schedule

    await delete_schedule(schedule_id)
    async with get_db() as db:
        await db.execute("DELETE FROM schedules WHERE id=?", (schedule_id,))
        await db.commit()
    return {"status": "deleted"}


# ─── Enhancement #5: Website Email Finder ─────────────────────────────────────

@router.post("/email-finder/crawl")
async def crawl_website_emails(req: EmailFinderRequest) -> dict:
    """Crawl a website and extract email addresses."""
    from app.services.website_email_finder import scrape_website_for_contacts

    result = await scrape_website_for_contacts(
        url=req.url,
        max_pages=req.max_pages,
    )
    return {
        "url": req.url,
        "emails": result.get("emails", []),
        "phones": result.get("phones", []),
        "total_emails": len(result.get("emails", [])),
        "total_phones": len(result.get("phones", [])),
    }


# ─── Enhancement #6: CRM Export ──────────────────────────────────────────────

@router.post("/crm/export")
async def export_to_crm(req: CRMExportRequest) -> dict:
    """Export leads to HubSpot or Salesforce CRM."""
    from app.services.crm_export import export_to_hubspot, export_to_salesforce

    # Fetch leads
    async with get_db() as db:
        placeholders = ",".join("?" for _ in req.lead_ids)
        cursor = await db.execute(
            f"SELECT * FROM leads WHERE id IN ({placeholders})", req.lead_ids
        )
        rows = await cursor.fetchall()
        leads = []
        for r in rows:
            leads.append({
                "email": r[1], "phone": r[2], "name": r[3],
                "platform": r[4], "source_url": r[5],
                "keyword": r[6], "country": r[7],
            })

    if req.crm_type == "hubspot":
        return await export_to_hubspot(req.api_key, leads)
    elif req.crm_type == "salesforce":
        return await export_to_salesforce(
            req.username, req.password, req.security_token, leads
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid CRM type. Use 'hubspot' or 'salesforce'.")


@router.post("/crm/test-connection")
async def test_crm_connection(crm_type: str = "hubspot", api_key: str = "") -> dict:
    """Test CRM API connection."""
    from app.services.crm_export import test_hubspot_connection

    if crm_type == "hubspot":
        return await test_hubspot_connection(api_key)
    return {"success": False, "message": "Only HubSpot connection test is supported"}


# ─── Enhancement #7: Auto Email Outreach ──────────────────────────────────────

@router.post("/outreach/send")
async def send_outreach(
    req: OutreachSendRequest,
    background_tasks: BackgroundTasks,
) -> dict:
    """Send email outreach to selected leads."""
    from app.services.email_outreach import send_bulk_emails

    # Fetch leads
    async with get_db() as db:
        placeholders = ",".join("?" for _ in req.lead_ids)
        cursor = await db.execute(
            f"SELECT * FROM leads WHERE id IN ({placeholders})", req.lead_ids
        )
        rows = await cursor.fetchall()
        recipients = []
        for r in rows:
            if r[1]:  # has email
                recipients.append({
                    "email": r[1], "name": r[3],
                    "phone": r[2], "platform": r[4],
                    "company": "", "website": r[5],
                })

    if not recipients:
        raise HTTPException(status_code=400, detail="No leads with email addresses found")

    # Run in background
    async def _send_task():
        result = await send_bulk_emails(
            smtp_host=req.smtp_host,
            smtp_port=req.smtp_port,
            smtp_username=req.smtp_username,
            smtp_password=req.smtp_password,
            from_name=req.from_name or req.smtp_username,
            recipients=recipients,
            subject_template=req.subject_template,
            body_template=req.body_template,
            delay_seconds=req.delay_seconds,
            use_tls=req.use_tls,
        )

        # Log results
        async with get_db() as db:
            for r in result.get("results", []):
                log_id = str(uuid.uuid4())
                await db.execute(
                    """INSERT INTO outreach_logs
                    (id, campaign_id, to_email, subject, status, error, sent_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (log_id, result["campaign_id"], r["to"],
                     req.subject_template[:200], r["status"],
                     r.get("error", ""), datetime.now().isoformat()),
                )
            await db.commit()

    background_tasks.add_task(_send_task)

    return {
        "status": "sending",
        "total_recipients": len(recipients),
        "message": f"Sending to {len(recipients)} leads in background",
    }


@router.get("/outreach/templates")
async def get_outreach_templates() -> list[dict]:
    """Get built-in email templates."""
    from app.services.email_outreach import get_default_templates
    return get_default_templates()


@router.get("/outreach/logs")
async def get_outreach_logs(campaign_id: Optional[str] = None) -> list[dict]:
    """Get outreach log history."""
    async with get_db() as db:
        if campaign_id:
            cursor = await db.execute(
                "SELECT * FROM outreach_logs WHERE campaign_id=? ORDER BY sent_at DESC",
                (campaign_id,),
            )
        else:
            cursor = await db.execute(
                "SELECT * FROM outreach_logs ORDER BY sent_at DESC LIMIT 100"
            )
        rows = await cursor.fetchall()
        return [
            {
                "id": r[0], "campaign_id": r[1], "to_email": r[2],
                "subject": r[3], "status": r[4], "error": r[5],
                "sent_at": r[6],
            }
            for r in rows
        ]


# ─── Enhancement #8: Telegram Scraper ────────────────────────────────────────

@router.post("/telegram/extract")
async def extract_telegram(
    req: TelegramScrapeRequest,
    background_tasks: BackgroundTasks,
) -> dict:
    """Extract members from a Telegram group."""
    session_id = str(uuid.uuid4())

    async with get_db() as db:
        await db.execute(
            """INSERT INTO sessions
            (id, name, status, platforms, keywords, started_at, config)
            VALUES (?, ?, 'running', ?, ?, ?, ?)""",
            (session_id, f"Telegram: @{req.group_username}",
             json.dumps(["telegram"]),
             json.dumps([req.group_username]),
             datetime.now().isoformat(),
             json.dumps(req.model_dump())),
        )
        await db.commit()

    background_tasks.add_task(_run_telegram_extraction, session_id, req)
    return {"session_id": session_id, "status": "running"}


async def _run_telegram_extraction(session_id: str, req: TelegramScrapeRequest) -> None:
    """Background task for Telegram extraction."""
    from app.services.telegram_scraper import scrape_telegram_group
    from app.services.duplicate_detector import compute_lead_hash
    from app.services.lead_scorer import calculate_lead_score, get_score_label

    try:
        members = await scrape_telegram_group(
            api_id=req.api_id,
            api_hash=req.api_hash,
            phone_number=req.phone_number,
            group_username=req.group_username,
            max_members=req.max_members,
            delay=req.delay,
        )

        async with get_db() as db:
            total = 0
            phones_found = 0

            for member in members:
                if "error" in member:
                    continue
                lead_id = str(uuid.uuid4())
                name = f"{member.get('first_name', '')} {member.get('last_name', '')}".strip()
                phone = member.get("phone", "")
                username = member.get("username", "")

                lead_hash = compute_lead_hash("", phone, name)
                quality = calculate_lead_score(phone=phone, name=name)
                category = get_score_label(quality)

                try:
                    await db.execute(
                        """INSERT OR IGNORE INTO leads
                        (id, email, phone, name, platform, source_url, keyword, country,
                         email_type, verified, quality_score, extracted_at, session_id,
                         lead_hash, lead_score, score_category)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (lead_id, "", phone, name, "telegram",
                         f"https://t.me/{username}" if username else "",
                         req.group_username, "",
                         "unknown", 0, quality,
                         datetime.now().isoformat(), session_id,
                         lead_hash, quality, category),
                    )
                    total += 1
                    if phone:
                        phones_found += 1
                except Exception:
                    pass

            await db.execute(
                """UPDATE sessions SET
                    status='completed', total_leads=?, phones_found=?,
                    completed_at=?, progress=100
                WHERE id=?""",
                (total, phones_found, datetime.now().isoformat(), session_id),
            )
            await db.commit()

    except Exception:
        async with get_db() as db:
            await db.execute(
                "UPDATE sessions SET status='failed', completed_at=? WHERE id=?",
                (datetime.now().isoformat(), session_id),
            )
            await db.commit()


@router.get("/telegram/setup")
async def telegram_setup_guide() -> dict:
    """Get Telegram scraper setup instructions and safety guide."""
    from app.services.telegram_scraper import get_telegram_setup_instructions
    return get_telegram_setup_instructions()


# ─── Enhancement #9: WhatsApp Group Scraper ───────────────────────────────────

@router.post("/whatsapp/extract")
async def extract_whatsapp(
    req: WhatsAppScrapeRequest,
    background_tasks: BackgroundTasks,
) -> dict:
    """Extract members from a WhatsApp group."""
    session_id = str(uuid.uuid4())

    async with get_db() as db:
        await db.execute(
            """INSERT INTO sessions
            (id, name, status, platforms, keywords, started_at, config)
            VALUES (?, ?, 'running', ?, ?, ?, ?)""",
            (session_id, f"WhatsApp: {req.group_name}",
             json.dumps(["whatsapp"]),
             json.dumps([req.group_name]),
             datetime.now().isoformat(),
             json.dumps(req.model_dump())),
        )
        await db.commit()

    background_tasks.add_task(_run_whatsapp_extraction, session_id, req)
    return {"session_id": session_id, "status": "running"}


async def _run_whatsapp_extraction(session_id: str, req: WhatsAppScrapeRequest) -> None:
    """Background task for WhatsApp extraction."""
    from app.services.whatsapp_scraper import scrape_whatsapp_group
    from app.services.duplicate_detector import compute_lead_hash
    from app.services.lead_scorer import calculate_lead_score, get_score_label

    try:
        result = await scrape_whatsapp_group(
            group_name=req.group_name,
            max_members=req.max_members,
            delay=req.delay,
        )

        if result.get("requires_qr"):
            async with get_db() as db:
                await db.execute(
                    "UPDATE sessions SET status='failed', completed_at=? WHERE id=?",
                    (datetime.now().isoformat(), session_id),
                )
                await db.commit()
            return

        async with get_db() as db:
            total = 0
            phones_found = 0

            for member in result.get("members", []):
                lead_id = str(uuid.uuid4())
                name = member.get("name", "")
                phone = member.get("phone", "")

                lead_hash = compute_lead_hash("", phone, name)
                quality = calculate_lead_score(phone=phone, name=name)
                category = get_score_label(quality)

                try:
                    await db.execute(
                        """INSERT OR IGNORE INTO leads
                        (id, email, phone, name, platform, source_url, keyword, country,
                         email_type, verified, quality_score, extracted_at, session_id,
                         lead_hash, lead_score, score_category)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (lead_id, "", phone, name, "whatsapp",
                         f"WhatsApp Group: {req.group_name}", req.group_name, "",
                         "unknown", 0, quality,
                         datetime.now().isoformat(), session_id,
                         lead_hash, quality, category),
                    )
                    total += 1
                    if phone:
                        phones_found += 1
                except Exception:
                    pass

            await db.execute(
                """UPDATE sessions SET
                    status='completed', total_leads=?, phones_found=?,
                    completed_at=?, progress=100
                WHERE id=?""",
                (total, phones_found, datetime.now().isoformat(), session_id),
            )
            await db.commit()

    except Exception:
        async with get_db() as db:
            await db.execute(
                "UPDATE sessions SET status='failed', completed_at=? WHERE id=?",
                (datetime.now().isoformat(), session_id),
            )
            await db.commit()


@router.get("/whatsapp/safety-guide")
async def whatsapp_safety_guide() -> dict:
    """Get WhatsApp scraping safety guide and ban prevention tips."""
    from app.services.whatsapp_scraper import get_whatsapp_safety_guide
    return get_whatsapp_safety_guide()


# ─── Enhancement #10: LinkedIn Improvements ──────────────────────────────────

@router.get("/linkedin/ban-bypass-guide")
async def linkedin_ban_bypass_guide() -> dict:
    """Get LinkedIn scraping safety guide and techniques."""
    return {
        "title": "LinkedIn Lead Extraction Guide",
        "primary_method": {
            "name": "Google Dorking (RECOMMENDED - Zero ban risk)",
            "description": "Searches Google for indexed LinkedIn profiles with email/phone data",
            "ban_risk": "ZERO",
            "how_it_works": [
                "Uses Google search operators like site:linkedin.com",
                "Extracts emails/phones from Google search snippets",
                "No direct LinkedIn access = no ban risk",
                "Already integrated as primary extraction method",
            ],
        },
        "secondary_method": {
            "name": "Direct Patchright Scraping (HIGH risk)",
            "description": "Uses Patchright (undetected Playwright) to scrape LinkedIn directly",
            "ban_risk": "HIGH",
            "prevention": [
                "Use 30-60 second delays between page visits",
                "Rotate residential proxies aggressively",
                "Don't view more than 100 profiles per day per account",
                "Use Patchright's stealth mode (already in stack)",
                "Randomize user-agent strings",
                "Avoid scraping during off-hours (looks suspicious)",
            ],
            "what_triggers_bans": [
                "Rapid page views (more than 100/hour)",
                "Accessing profiles without being logged in",
                "Using datacenter IPs",
                "Consistent access patterns (no randomization)",
                "Sales Navigator scraping without subscription",
            ],
            "recovery": [
                "Temporary ban: wait 24-48 hours",
                "Account restriction: verify phone number",
                "Permanent ban: need a new account",
            ],
        },
        "recommendation": "Stick with Google dorking. It's free, has zero ban risk, "
                         "and extracts the same contact data. Direct scraping is only "
                         "worth the risk if you need profile-specific data like job titles.",
    }


# ─── Platform Safety Guide (All Platforms) ───────────────────────────────────

@router.get("/safety-guide")
async def get_platform_safety_guide() -> dict:
    """Comprehensive safety guide for all platforms."""
    return {
        "platforms": {
            "reddit": {
                "ban_risk": "LOW",
                "method": "RSS feeds + PullPush API",
                "notes": "Uses public APIs only. No authentication needed. Very safe.",
            },
            "google_maps": {
                "ban_risk": "LOW-MEDIUM",
                "method": "Selenium headless",
                "prevention": ["Random 3-8 sec delays", "User-Agent rotation", "Proxy rotation"],
            },
            "linkedin": {
                "ban_risk": "ZERO (dorking) / HIGH (direct)",
                "method": "Google dorking (primary)",
                "prevention": ["Don't use direct scraping unless necessary"],
            },
            "telegram": {
                "ban_risk": "LOW",
                "method": "Telethon (official MTProto API)",
                "prevention": ["3-10 sec delays", "Max 5 groups/day", "Handle FloodWait"],
            },
            "whatsapp": {
                "ban_risk": "MEDIUM-HIGH",
                "method": "Selenium on WhatsApp Web",
                "prevention": [
                    "Use secondary/burner number",
                    "5-15 sec delays between actions",
                    "Max 3 groups per session",
                    "2+ hours between sessions",
                    "Use WhatsApp Business account",
                    "Use residential/mobile proxy",
                ],
                "what_triggers_bans": [
                    "Rapid automation detected",
                    "Too many group member list views",
                    "Datacenter IP addresses",
                    "Scraping groups you're not a member of",
                ],
                "how_to_get_more_numbers": [
                    "Join niche-relevant groups (WhatsApp allows 512 members each)",
                    "Export contacts, use Website Email Finder for business emails",
                    "Cross-reference with LinkedIn via Google dorking",
                    "Use Telegram as safer alternative for similar leads",
                ],
            },
            "facebook": {
                "ban_risk": "ZERO (dorking only)",
                "method": "Google dorking",
                "notes": "Direct Facebook scraping is extremely risky. Stick to dorking.",
            },
            "twitter": {
                "ban_risk": "ZERO (dorking only)",
                "method": "Google dorking",
                "notes": "Twitter API requires paid access. Dorking works fine.",
            },
        },
        "general_tips": [
            "Always use random delays between requests",
            "Rotate User-Agent strings regularly",
            "Use residential/mobile proxies over datacenter",
            "Don't run extractions 24/7 — take breaks",
            "Start with small batches and increase gradually",
            "Monitor for rate limit errors and back off",
            "Keep extraction sessions under 30 minutes",
        ],
    }


# ─── Extraction Engine Status ────────────────────────────────────────────────

@router.get("/extraction-engine/status")
async def extraction_engine_status() -> dict:
    """Return status of extraction engines (Patchright, Whisper, Serper)."""
    status = {
        "patchright": {"installed": False, "browser_available": False},
        "whisper": {"installed": False, "model_loaded": False},
        "serper": {"configured": False},
    }

    # Check Patchright
    try:
        from app.services.patchright_engine import check_patchright_available
        available = await check_patchright_available()
        status["patchright"]["installed"] = True
        status["patchright"]["browser_available"] = available
    except ImportError:
        pass

    # Check Whisper
    try:
        from app.services.captcha_solver import is_whisper_available
        status["whisper"]["installed"] = is_whisper_available()
        status["whisper"]["model_loaded"] = status["whisper"]["installed"]
    except ImportError:
        pass

    # Check Serper API key
    async with get_db() as db:
        cursor = await db.execute(
            "SELECT value FROM settings WHERE key = 'serper_api_key'"
        )
        row = await cursor.fetchone()
        status["serper"]["configured"] = bool(row and row[0])

    return status


# ─── Enhancement: PDF Report Generation ─────────────────────────────────────

@router.post("/reports/pdf")
async def generate_pdf_report(
    session_id: Optional[str] = None,
    title: str = "SnapLeads Report",
    company_name: str = "SnapLeads",
    primary_color: str = "#6366f1",
    secondary_color: str = "#a855f7",
) -> Response:
    """Generate a branded PDF report of leads."""
    from app.services.pdf_report import generate_lead_report

    async with get_db() as db:
        if session_id:
            cursor = await db.execute(
                "SELECT id, email, phone, name, platform, source_url, keyword, "
                "email_type, verified, quality_score, extracted_at, session_id "
                "FROM leads WHERE session_id = ? ORDER BY quality_score DESC",
                (session_id,),
            )
        else:
            cursor = await db.execute(
                "SELECT id, email, phone, name, platform, source_url, keyword, "
                "email_type, verified, quality_score, extracted_at, session_id "
                "FROM leads ORDER BY quality_score DESC LIMIT 1000"
            )
        rows = await cursor.fetchall()

    leads = [
        {
            "id": r[0], "email": r[1], "phone": r[2], "name": r[3],
            "platform": r[4], "source_url": r[5], "keyword": r[6],
            "email_type": r[7], "verified": bool(r[8]),
            "quality_score": r[9], "extracted_at": r[10],
        }
        for r in rows
    ]

    branding = {
        "company_name": company_name,
        "primary_color": primary_color,
        "secondary_color": secondary_color,
    }

    pdf_bytes = generate_lead_report(leads, title=title, branding=branding)
    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="PDF generation failed — fpdf2 may not be installed")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="snapleads-report.pdf"'},
    )


# ─── Enhancement: YellowPages + Yelp Directory Scraper ──────────────────────

@router.post("/directories/search")
async def search_directories(
    background_tasks: BackgroundTasks,
    query: str,
    location: str = "",
    sources: str = "yellowpages,yelp",
    max_results: int = 50,
) -> dict:
    """Search YellowPages, Yelp, and other business directories."""
    session_id = str(uuid.uuid4())
    source_list = [s.strip() for s in sources.split(",")]

    async with get_db() as db:
        await db.execute(
            """INSERT INTO sessions
            (id, name, status, platforms, keywords, started_at, config)
            VALUES (?, ?, 'running', ?, ?, ?, ?)""",
            (session_id, f"Directory: {query}",
             json.dumps(source_list), json.dumps([query]),
             datetime.now().isoformat(), json.dumps({"query": query, "location": location})),
        )
        await db.commit()

    background_tasks.add_task(
        _run_directory_extraction, session_id, query, location, source_list, max_results
    )
    return {"session_id": session_id, "status": "running"}


async def _run_directory_extraction(
    session_id: str, query: str, location: str, sources: list[str], max_results: int
) -> None:
    """Background task for directory extraction."""
    from app.services.yellowpages_scraper import scrape_directories
    from app.services.lead_scorer import calculate_lead_score, get_score_label

    try:
        leads = await scrape_directories(query, location, sources, max_results)

        async with get_db() as db:
            total = 0
            emails_found = 0
            phones_found = 0

            for lead_data in leads:
                lead_id = str(uuid.uuid4())
                email = lead_data.get("email", "")
                phone = lead_data.get("phone", "")
                quality = calculate_lead_score(email=email, phone=phone)
                category = get_score_label(quality)

                try:
                    await db.execute(
                        """INSERT OR IGNORE INTO leads
                        (id, email, phone, name, platform, source_url, keyword, country,
                         email_type, verified, quality_score, extracted_at, session_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (lead_id, email, phone, lead_data.get("name", ""),
                         lead_data.get("platform", "yellowpages"),
                         lead_data.get("source_url", ""), query, "",
                         "unknown", 0, quality,
                         datetime.now().isoformat(), session_id),
                    )
                    total += 1
                    if email:
                        emails_found += 1
                    if phone:
                        phones_found += 1
                except Exception:
                    pass

            await db.execute(
                """UPDATE sessions SET
                    status='completed', total_leads=?, emails_found=?, phones_found=?,
                    completed_at=?, progress=100
                WHERE id=?""",
                (total, emails_found, phones_found,
                 datetime.now().isoformat(), session_id),
            )
            await db.commit()

    except Exception as e:
        async with get_db() as db:
            await db.execute(
                "UPDATE sessions SET status='failed', completed_at=? WHERE id=?",
                (datetime.now().isoformat(), session_id),
            )
            await db.commit()


# ─── Enhancement: AI Cold Email Writer ───────────────────────────────────────

@router.post("/ai-email/generate")
async def generate_ai_email(
    lead_id: Optional[str] = None,
    tone: str = "professional",
    service: str = "",
    industry: str = "default",
    from_name: str = "",
) -> dict:
    """Generate a personalized cold email for a lead."""
    from app.services.ai_email_writer import generate_cold_email

    lead = {}
    if lead_id:
        async with get_db() as db:
            cursor = await db.execute(
                "SELECT id, email, phone, name, platform, company, website FROM leads WHERE id = ?",
                (lead_id,),
            )
            row = await cursor.fetchone()
            if row:
                lead = {
                    "id": row[0], "email": row[1], "phone": row[2],
                    "name": row[3], "platform": row[4],
                    "company": row[5] or "", "website": row[6] or "",
                }

    result = generate_cold_email(
        lead=lead, tone=tone, service=service,
        industry=industry, from_name=from_name,
    )
    return result


@router.get("/ai-email/tones")
async def get_email_tones() -> list[dict]:
    """Get available email tones."""
    from app.services.ai_email_writer import get_available_tones
    return get_available_tones()


@router.get("/ai-email/industries")
async def get_email_industries() -> list[str]:
    """Get available industries for email personalization."""
    from app.services.ai_email_writer import get_available_industries
    return get_available_industries()


# ─── Enhancement: Lead Enrichment ────────────────────────────────────────────

@router.post("/leads/enrich")
async def enrich_leads() -> dict:
    """Auto-enrich leads by cross-referencing existing data."""
    from app.services.lead_enrichment import enrich_leads_from_database

    async with get_db() as db:
        stats = await enrich_leads_from_database(db)

    return {"status": "completed", **stats}


# ─── Enhancement: GBP Claimed/Unclaimed Detection ───────────────────────────

@router.post("/gbp/detect")
async def detect_gbp_status(business_data: dict) -> dict:
    """Detect if a Google Business Profile is claimed or unclaimed."""
    from app.services.gbp_detection import detect_claimed_status
    # Load Serper API key from settings DB (optional enhancement)
    serper_api_key = ""
    try:
        async with get_db() as db:
            cursor = await db.execute(
                "SELECT value FROM settings WHERE key = 'serper_api_key'"
            )
            row = await cursor.fetchone()
            serper_api_key = row[0] if row else ""
    except Exception:
        pass
    return detect_claimed_status(business_data, serper_api_key=serper_api_key)


@router.post("/gbp/batch-detect")
async def batch_detect_gbp(businesses: list[dict]) -> list[dict]:
    """Batch detect claimed/unclaimed status for multiple businesses."""
    from app.services.gbp_detection import batch_detect
    serper_api_key = ""
    try:
        async with get_db() as db:
            cursor = await db.execute(
                "SELECT value FROM settings WHERE key = 'serper_api_key'"
            )
            row = await cursor.fetchone()
            serper_api_key = row[0] if row else ""
    except Exception:
        pass
    return batch_detect(businesses, serper_api_key=serper_api_key)


# ─── Enhancement: Multi-Language UI ──────────────────────────────────────────

@router.get("/i18n/translations")
async def get_translations(lang: str = "en") -> dict:
    """Get UI translations for a language."""
    from app.services.i18n import get_translations
    return get_translations(lang)


@router.get("/i18n/languages")
async def get_supported_languages() -> list[dict]:
    """Get list of supported languages."""
    from app.services.i18n import get_supported_languages
    return get_supported_languages()


# ─── Enhancement: Craigslist + OLX + Indeed + Glassdoor Scraping ─────────────

@router.post("/jobs/search")
async def search_job_boards(
    background_tasks: BackgroundTasks,
    query: str,
    location: str = "",
    sources: str = "indeed,glassdoor",
    max_results: int = 50,
) -> dict:
    """Search Indeed, Glassdoor, Craigslist, OLX for leads."""
    session_id = str(uuid.uuid4())
    source_list = [s.strip() for s in sources.split(",")]

    async with get_db() as db:
        await db.execute(
            """INSERT INTO sessions
            (id, name, status, platforms, keywords, started_at, config)
            VALUES (?, ?, 'running', ?, ?, ?, ?)""",
            (session_id, f"Jobs: {query}",
             json.dumps(source_list), json.dumps([query]),
             datetime.now().isoformat(), json.dumps({"query": query, "location": location})),
        )
        await db.commit()

    background_tasks.add_task(
        _run_job_extraction, session_id, query, location, source_list, max_results
    )
    return {"session_id": session_id, "status": "running"}


async def _run_job_extraction(
    session_id: str, query: str, location: str, sources: list[str], max_results: int
) -> None:
    """Background task for job board extraction."""
    from app.services.indeed_scraper import scrape_job_boards
    from app.services.lead_scorer import calculate_lead_score, get_score_label

    try:
        leads = await scrape_job_boards(query, location, sources, max_results)

        async with get_db() as db:
            total = 0
            emails_found = 0
            phones_found = 0

            for lead_data in leads:
                lead_id = str(uuid.uuid4())
                email = lead_data.get("email", "")
                phone = lead_data.get("phone", "")
                quality = calculate_lead_score(email=email, phone=phone)

                try:
                    await db.execute(
                        """INSERT OR IGNORE INTO leads
                        (id, email, phone, name, platform, source_url, keyword, country,
                         email_type, verified, quality_score, extracted_at, session_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (lead_id, email, phone, lead_data.get("name", ""),
                         lead_data.get("platform", "indeed"),
                         lead_data.get("source_url", ""), query, "",
                         "unknown", 0, quality,
                         datetime.now().isoformat(), session_id),
                    )
                    total += 1
                    if email:
                        emails_found += 1
                    if phone:
                        phones_found += 1
                except Exception:
                    pass

            await db.execute(
                """UPDATE sessions SET
                    status='completed', total_leads=?, emails_found=?, phones_found=?,
                    completed_at=?, progress=100
                WHERE id=?""",
                (total, emails_found, phones_found,
                 datetime.now().isoformat(), session_id),
            )
            await db.commit()

    except Exception as e:
        async with get_db() as db:
            await db.execute(
                "UPDATE sessions SET status='failed', completed_at=? WHERE id=?",
                (datetime.now().isoformat(), session_id),
            )
            await db.commit()


# ─── Enhancement: Citation Checker ───────────────────────────────────────────

@router.post("/citations/check")
async def check_business_citations(
    business_name: str,
    location: str = "",
    phone: str = "",
    max_sources: int = 30,
) -> dict:
    """Check business citations across 30 directories."""
    from app.services.citation_checker import check_citations
    return await check_citations(business_name, location, phone, max_sources)


@router.get("/citations/sources")
async def get_citation_sources() -> list[dict]:
    """Get list of citation sources we check."""
    from app.services.citation_checker import get_citation_sources
    return get_citation_sources()


# ─── Enhancement: AI Service Suggestion ──────────────────────────────────────

@router.post("/services/suggest")
async def suggest_services_for_lead(lead_id: str) -> dict:
    """Suggest services to pitch to a specific lead."""
    from app.services.service_suggestion import suggest_services

    async with get_db() as db:
        cursor = await db.execute(
            "SELECT id, email, phone, name, platform, email_type, verified, "
            "quality_score, company, website, category FROM leads WHERE id = ?",
            (lead_id,),
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Lead not found")

        lead = {
            "id": row[0], "email": row[1], "phone": row[2], "name": row[3],
            "platform": row[4], "email_type": row[5], "verified": bool(row[6]),
            "quality_score": row[7], "company": row[8] or "",
            "website": row[9] or "", "category": row[10] or "",
        }

    suggestions = suggest_services(lead)
    return {"lead_id": lead_id, "suggestions": suggestions}


@router.get("/services/catalog")
async def get_service_catalog_endpoint() -> list[dict]:
    """Get the full service catalog."""
    from app.services.service_suggestion import get_service_catalog
    return get_service_catalog()


# ─── Enhancement: SMTP Deliverability Checker ────────────────────────────────

@router.post("/smtp/check-deliverability")
async def check_smtp_deliverability(domain: str = "", email: str = "") -> dict:
    """Check email deliverability (SPF/DKIM/DMARC) for a domain or email."""
    from app.services.smtp_checker import check_email_deliverability, check_sender_domain

    if email:
        return await check_sender_domain(email)
    elif domain:
        return await check_email_deliverability(domain)
    else:
        raise HTTPException(status_code=400, detail="Provide either 'domain' or 'email' parameter")


# ─── Enhancement: Extended Email Templates ───────────────────────────────────

@router.get("/outreach/templates-extended")
async def get_extended_templates() -> list[dict]:
    """Get extended library of 20 email templates."""
    return [
        {"id": "introduction", "name": "Introduction", "category": "First Contact",
         "subject": "Quick intro — {{from_name}} from {{company}}",
         "body": "Hi {{name}},\n\nI came across {{company}} and was impressed by your work.\n\nI help businesses like yours grow their online presence and generate more leads. Would you be open to a quick chat?\n\nBest,\n{{from_name}}"},
        {"id": "follow_up", "name": "Follow Up", "category": "Follow Up",
         "subject": "Following up — {{from_name}}",
         "body": "Hi {{name}},\n\nI wanted to follow up on my previous message. I understand you're busy — just wanted to make sure my email didn't get lost.\n\nI'd love to discuss how I can help {{company}} achieve its goals.\n\nBest,\n{{from_name}}"},
        {"id": "partnership", "name": "Partnership Proposal", "category": "Partnership",
         "subject": "Partnership opportunity with {{company}}",
         "body": "Hi {{name}},\n\nI've been researching companies in your space and {{company}} stands out. I believe there's a strong opportunity for us to collaborate.\n\nWould you be interested in exploring a partnership?\n\nRegards,\n{{from_name}}"},
        {"id": "value_offer", "name": "Free Value Offer", "category": "First Contact",
         "subject": "Free growth audit for {{company}}",
         "body": "Hi {{name}},\n\nI took a quick look at {{company}}'s online presence and found a few areas with quick-win potential.\n\nI'd be happy to share my findings for free — no strings attached. Just reply to this email and I'll send them over.\n\nBest,\n{{from_name}}"},
        {"id": "referral", "name": "Referral Approach", "category": "First Contact",
         "subject": "Referred to {{company}}",
         "body": "Hi {{name}},\n\nI was researching top companies in your industry and {{company}} was recommended. I can see why — impressive work!\n\nI specialize in helping businesses like yours scale. Would you be open to a brief conversation?\n\nCheers,\n{{from_name}}"},
        {"id": "case_study", "name": "Case Study Share", "category": "Nurture",
         "subject": "How we helped a company like {{company}}",
         "body": "Hi {{name}},\n\nI recently helped a business similar to {{company}} increase their leads by 47% in just 3 months.\n\nI thought you might find the case study interesting. Would you like me to send it over?\n\nBest,\n{{from_name}}"},
        {"id": "question", "name": "Question-Based", "category": "First Contact",
         "subject": "Quick question about {{company}}",
         "body": "Hi {{name}},\n\nI have a quick question about {{company}}'s current marketing strategy. Are you the right person to discuss this with?\n\nI have some ideas that could significantly boost your results.\n\nThanks,\n{{from_name}}"},
        {"id": "congratulations", "name": "Congratulations", "category": "First Contact",
         "subject": "Congrats on {{company}}'s growth!",
         "body": "Hi {{name}},\n\nCongratulations on the recent growth at {{company}}! It's clear you're doing something right.\n\nI help growing businesses optimize their lead generation to sustain that momentum. Would you like to chat?\n\nBest,\n{{from_name}}"},
        {"id": "pain_point", "name": "Pain Point", "category": "First Contact",
         "subject": "Struggling with lead generation? You're not alone",
         "body": "Hi {{name}},\n\nMany businesses like {{company}} tell me their biggest challenge is generating consistent, quality leads.\n\nI've developed a system that solves this. Would you be interested in learning more?\n\nBest,\n{{from_name}}"},
        {"id": "social_proof", "name": "Social Proof", "category": "Nurture",
         "subject": "500+ businesses trust this approach",
         "body": "Hi {{name}},\n\nOver 500 businesses have used our approach to grow their customer base. The average ROI is 3-5x within the first 6 months.\n\nI think {{company}} could see similar results. Can I show you how?\n\nBest,\n{{from_name}}"},
        {"id": "breakup", "name": "Breakup Email", "category": "Follow Up",
         "subject": "Should I close your file?",
         "body": "Hi {{name}},\n\nI've reached out a few times but haven't heard back. No worries — I understand you're busy.\n\nI'll assume the timing isn't right and close your file for now. If things change, I'm just an email away.\n\nAll the best,\n{{from_name}}"},
        {"id": "seasonal", "name": "Seasonal Offer", "category": "Promotion",
         "subject": "Special offer for {{company}} this season",
         "body": "Hi {{name}},\n\nAs the new season approaches, many businesses are planning their growth strategy. We're offering a special package to help {{company}} get ahead.\n\nWould you like to hear the details?\n\nBest,\n{{from_name}}"},
        {"id": "local_seo", "name": "Local SEO Pitch", "category": "Service Pitch",
         "subject": "Is {{company}} showing up in local searches?",
         "body": "Hi {{name}},\n\nI searched for businesses like {{company}} in your area and noticed some optimization opportunities.\n\nA few simple changes could help you rank higher in Google Maps and local search results. Would you like a free audit?\n\nBest,\n{{from_name}}"},
        {"id": "website_review", "name": "Website Review", "category": "Service Pitch",
         "subject": "3 quick improvements for {{company}}'s website",
         "body": "Hi {{name}},\n\nI took a quick look at your website and spotted 3 areas that could significantly improve your conversion rate:\n\n1. Mobile responsiveness\n2. Page load speed\n3. Call-to-action placement\n\nWould you like a detailed breakdown? It's on the house.\n\nBest,\n{{from_name}}"},
        {"id": "social_media", "name": "Social Media Growth", "category": "Service Pitch",
         "subject": "Grow {{company}}'s social media presence",
         "body": "Hi {{name}},\n\nI noticed {{company}} has a social media presence but it could be doing so much more for your business.\n\nI help companies turn their social followers into paying customers. Want to see how?\n\nBest,\n{{from_name}}"},
        {"id": "review_management", "name": "Review Management", "category": "Service Pitch",
         "subject": "Boost {{company}}'s online reviews",
         "body": "Hi {{name}},\n\n93% of consumers say online reviews impact their buying decisions. I noticed {{company}} could benefit from a review management strategy.\n\nWould you like to learn how to get more 5-star reviews consistently?\n\nBest,\n{{from_name}}"},
        {"id": "competitor_analysis", "name": "Competitor Analysis", "category": "Nurture",
         "subject": "Your competitors are doing this — are you?",
         "body": "Hi {{name}},\n\nI've been researching {{company}}'s market and noticed your competitors are investing in strategies you might be missing.\n\nI'd love to share my findings. Can we schedule a quick call?\n\nBest,\n{{from_name}}"},
        {"id": "retargeting", "name": "Re-engagement", "category": "Follow Up",
         "subject": "It's been a while — update from {{from_name}}",
         "body": "Hi {{name}},\n\nIt's been a while since we last connected. A lot has changed in the industry since then.\n\nI have some new insights that could benefit {{company}}. Would you like to reconnect?\n\nBest,\n{{from_name}}"},
        {"id": "event_invite", "name": "Event Invitation", "category": "Nurture",
         "subject": "You're invited — exclusive webinar for businesses like {{company}}",
         "body": "Hi {{name}},\n\nWe're hosting a free webinar on strategies to grow your business in the current market.\n\nI think {{company}} would find it valuable. Would you like me to save you a spot?\n\nBest,\n{{from_name}}"},
        {"id": "quick_win", "name": "Quick Win", "category": "First Contact",
         "subject": "One thing that could double {{company}}'s leads",
         "body": "Hi {{name}},\n\nThere's one simple change that could potentially double the leads {{company}} generates from its website.\n\nI've seen it work for dozens of businesses in your industry. Want me to share the strategy?\n\nBest,\n{{from_name}}"},
    ]


# ─── v3.5.22: Log Management Endpoints ──────────────────────────────────────

@router.post("/logs/write")
async def log_write(body: dict) -> dict:
    """Receive a log entry from the frontend / Electron renderer."""
    level = body.get("level", "info")
    module = body.get("module", "frontend")
    message = body.get("message", "")
    write_frontend_log(level, module, message)
    return {"status": "ok"}


@router.post("/logs/write-batch")
async def log_write_batch(entries: list[dict]) -> dict:
    """Receive a batch of log entries from the frontend."""
    for entry in entries:
        write_frontend_log(
            entry.get("level", "info"),
            entry.get("module", "frontend"),
            entry.get("message", ""),
        )
    return {"status": "ok", "count": len(entries)}


@router.get("/logs/list")
async def log_list() -> list[dict]:
    """List all log files with their sizes."""
    return list_log_files()


@router.get("/logs/tail")
async def log_tail(lines: int = 200) -> dict:
    """Get the last N lines from the current log file."""
    return {"content": tail_log(lines)}


@router.delete("/logs/clear")
async def log_clear() -> dict:
    """Delete all log files. Only triggered from Settings page."""
    count = clear_logs()
    logger.info("Logs cleared by user (%d files deleted)", count)
    return {"status": "ok", "files_deleted": count}


@router.get("/logs/export")
async def log_export() -> Response:
    """Download all log files as a .zip archive."""
    zip_bytes = export_logs_zip()
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=snapleads-logs.zip"},
    )


# ─── v3.5.31: Auto-Discovery Pipeline ────────────────────────────────────────

@router.post("/auto-discovery")
async def auto_discovery_search(body: dict) -> dict:
    """Run the auto-discovery pipeline for any keyword + location.

    v3.5.31: 5-stage pipeline — Source Discovery, Directory Fingerprinting,
    Adaptive Extraction (JSON-LD > Microdata > Heuristic DOM > Regex),
    Anti-Bot Handling, and Deduplication.

    Body:
        keyword: str — search term (e.g. "wedding photographers")
        location: str — optional location (e.g. "Mumbai")
        max_leads: int — max leads to return (default 200)
    """
    keyword = body.get("keyword", "").strip()
    location = body.get("location", "").strip()
    max_leads = min(int(body.get("max_leads", 200)), 500)

    if not keyword:
        raise HTTPException(status_code=400, detail="keyword is required")

    from app.services.auto_discovery import run_auto_discovery

    loop = asyncio.get_event_loop()
    leads = await loop.run_in_executor(
        _LIVE_SCRAPE_POOL,
        lambda: run_auto_discovery(
            keyword=keyword,
            location=location,
            max_leads=max_leads,
        ),
    )

    return {
        "keyword": keyword,
        "location": location,
        "total_leads": len(leads),
        "leads": leads,
    }


# ─── v3.5.32: Enhanced Direct Scraper ─────────────────────────────────────────

@router.post("/enhanced-direct-scrape")
async def enhanced_direct_scrape(body: dict) -> dict:
    """Run the enhanced direct scraper with smart curl/Patchright routing.

    v3.5.32: Two-tier approach — curl_cffi for static sites (parallel),
    Patchright for JS-heavy sites (sequential).

    Body:
        urls: list[str] — URLs to scrape
        keyword: str — search keyword for tagging
        location: str — optional location
        max_leads: int — max leads to return (default 200)
    """
    urls = body.get("urls", [])
    keyword = body.get("keyword", "").strip()
    location = body.get("location", "").strip()
    max_leads = min(int(body.get("max_leads", 200)), 500)

    if not urls:
        raise HTTPException(status_code=400, detail="urls list is required")
    if not keyword:
        raise HTTPException(status_code=400, detail="keyword is required")

    from app.services.enhanced_direct_scraper import run_enhanced_direct_scraping

    leads = await run_enhanced_direct_scraping(
        urls=urls,
        keyword=keyword,
        location=location,
        headless=True,
        max_leads=max_leads,
    )

    return {
        "keyword": keyword,
        "location": location,
        "total_leads": len(leads),
        "leads": leads,
    }
