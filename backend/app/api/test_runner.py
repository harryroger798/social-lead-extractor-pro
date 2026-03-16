"""v3.5.35: One-click automated test runner with log collection and bundle packaging.

Endpoints:
  POST /api/test/start           — Start a test run with a matrix of test cases
  GET  /api/test/{id}/status     — Poll progress
  POST /api/test/{id}/frontend-log — Receive frontend console logs
  GET  /api/test/{id}/download-bundle — Download ZIP bundle of all logs/results
"""

import asyncio
import json
import logging
import time
import traceback
import uuid
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.api.routes import _run_extraction
from app.models.schemas import ExtractionRequest
from app.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/test", tags=["test_runner"])

# ── In-memory session store ──────────────────────────────────────────────────
_test_sessions: Dict[str, dict] = {}


# ── Pydantic models ─────────────────────────────────────────────────────────

class TestCase(BaseModel):
    id: str
    keyword: str
    hasLocation: bool
    platforms: list[str]
    platformGroup: str
    use_google_dorking: bool
    use_direct_scraping: bool
    toggleLabel: str


class StartTestRequest(BaseModel):
    test_cases: list[TestCase]
    concurrency: int = 2
    timeout_per_case: int = 90


class FrontendLogEntry(BaseModel):
    ts: str = ""
    level: str = "log"
    session_id: str = ""
    msg: str = ""


# ── Per-session log handler ──────────────────────────────────────────────────

class SessionLogHandler(logging.Handler):
    """Captures log records into an in-memory list for a test session."""

    def __init__(self, session_id: str):
        super().__init__()
        self.session_id = session_id
        self.records: list[dict] = []

    def emit(self, record: logging.LogRecord):
        self.records.append({
            "ts": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": self.format(record),
        })


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/start")
async def start_test_run(req: StartTestRequest, bg: BackgroundTasks):
    session_id = str(uuid.uuid4())
    _test_sessions[session_id] = {
        "status": "running",
        "started_at": datetime.utcnow().isoformat(),
        "total": len(req.test_cases),
        "completed": 0,
        "failed": 0,
        "current_case": None,
        "results": [],
        "frontend_logs": [],
        "bundle_path": None,
    }
    bg.add_task(_run_test_suite, session_id, req)
    return {"session_id": session_id}


@router.get("/{session_id}/status")
async def get_test_status(session_id: str):
    s = _test_sessions.get(session_id)
    if not s:
        return {"error": "Session not found"}
    return {
        "status": s["status"],
        "total": s["total"],
        "completed": s["completed"],
        "failed": s["failed"],
        "current_case": s["current_case"],
        "progress_pct": round(s["completed"] / max(s["total"], 1) * 100, 1),
    }


@router.post("/{session_id}/frontend-log")
async def append_frontend_log(session_id: str, payload: FrontendLogEntry):
    s = _test_sessions.get(session_id)
    if s:
        s["frontend_logs"].append(payload.model_dump())
    return {"ok": True}


@router.get("/{session_id}/download-bundle")
async def download_bundle(session_id: str):
    s = _test_sessions.get(session_id)
    if not s or s["status"] not in ("done", "aborted"):
        return {"error": "Test not finished"}
    bundle_path = s.get("bundle_path")
    if bundle_path and Path(bundle_path).exists():
        return FileResponse(
            bundle_path,
            filename=f"snapleads_test_{session_id[:8]}.zip",
            media_type="application/zip",
        )
    bundle_path = _build_bundle(session_id)
    s["bundle_path"] = bundle_path
    return FileResponse(
        bundle_path,
        filename=f"snapleads_test_{session_id[:8]}.zip",
        media_type="application/zip",
    )


# ── Test suite runner ────────────────────────────────────────────────────────

async def _run_test_suite(session_id: str, req: StartTestRequest):
    session = _test_sessions[session_id]
    sem = asyncio.Semaphore(req.concurrency)

    tasks = [
        _run_single_case(session_id, tc, sem, req.timeout_per_case)
        for tc in req.test_cases
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for r in results:
        if isinstance(r, dict):
            session["results"].append(r)
            if r.get("status") in ("failed", "timeout"):
                session["failed"] += 1
        elif isinstance(r, Exception):
            session["failed"] += 1
            session["results"].append({
                "case_id": "unknown",
                "keyword": "unknown",
                "platform_group": "unknown",
                "toggle_label": "unknown",
                "status": "failed",
                "leads_found": 0,
                "duration_seconds": 0,
                "per_platform": {},
                "errors": [str(r)],
                "backend_logs": [],
                "location_filter_log": [],
            })

    session["status"] = "done"
    session["finished_at"] = datetime.utcnow().isoformat()
    session["bundle_path"] = _build_bundle(session_id)


async def _run_single_case(
    session_id: str,
    tc: TestCase,
    sem: asyncio.Semaphore,
    timeout: int,
) -> dict:
    session = _test_sessions[session_id]

    # Attach per-case log handler
    handler = SessionLogHandler(session_id)
    case_logger = logging.getLogger(f"snapleads.test.{tc.id}")
    case_logger.addHandler(handler)
    case_logger.setLevel(logging.DEBUG)

    per_platform: Dict[str, Any] = {}
    location_filter_log: list[dict] = []
    errors: list[str] = []
    leads_found = 0
    start = time.perf_counter()

    async with sem:
        session["current_case"] = {
            "id": tc.id,
            "keyword": tc.keyword,
            "group": tc.platformGroup,
            "toggle": tc.toggleLabel,
        }

        try:
            result = await asyncio.wait_for(
                _execute_extraction_case(
                    tc, case_logger, per_platform, location_filter_log, errors
                ),
                timeout=timeout,
            )
            leads_found = result
            status = "success"
        except asyncio.TimeoutError:
            status = "timeout"
            errors.append(f"Case timed out after {timeout}s")
            case_logger.error("TIMEOUT reached after %ds", timeout)
        except Exception as e:
            status = "failed"
            errors.append(str(e))
            case_logger.error("EXCEPTION: %s", traceback.format_exc())

        duration = round(time.perf_counter() - start, 3)
        case_logger.removeHandler(handler)
        session["completed"] += 1

        return {
            "case_id": tc.id,
            "keyword": tc.keyword,
            "platform_group": tc.platformGroup,
            "toggle_label": tc.toggleLabel,
            "status": status,
            "leads_found": leads_found,
            "duration_seconds": duration,
            "per_platform": per_platform,
            "errors": errors,
            "backend_logs": handler.records,
            "location_filter_log": location_filter_log,
        }


async def _execute_extraction_case(
    tc: TestCase,
    case_logger: logging.Logger,
    per_platform: dict,
    location_filter_log: list,
    errors: list,
) -> int:
    """Run extraction for a single test case by calling the real extraction pipeline.

    Creates a real extraction session via _run_extraction, waits for it to
    complete, then reads back leads from the DB.
    """
    total_leads = 0
    extraction_session_id = str(uuid.uuid4())

    # Build ExtractionRequest matching the test case
    config = ExtractionRequest(
        name=f"[TEST] {tc.keyword} | {tc.platformGroup} | {tc.toggleLabel}",
        keywords=[tc.keyword],
        platforms=tc.platforms,
        pages_per_keyword=2,  # Reduced for testing speed
        delay_between_requests=1.0,
        use_google_dorking=tc.use_google_dorking,
        use_direct_scraping=tc.use_direct_scraping,
        use_firecrawl_enrichment=False,
        auto_verify=False,
    )

    case_logger.info(
        "Starting extraction: keyword=%r platforms=%s dorking=%s direct=%s",
        tc.keyword, tc.platforms, tc.use_google_dorking, tc.use_direct_scraping,
    )

    # Create session in DB
    try:
        async with get_db() as db:
            await db.execute(
                """INSERT INTO sessions
                (id, name, status, platforms, keywords, started_at, config)
                VALUES (?, ?, 'running', ?, ?, ?, ?)""",
                (
                    extraction_session_id,
                    config.name,
                    json.dumps(config.platforms),
                    json.dumps(config.keywords),
                    datetime.now().isoformat(),
                    json.dumps(config.model_dump()),
                ),
            )
            await db.commit()
    except Exception as e:
        case_logger.error("Failed to create session: %s", e)
        errors.append(f"DB session create error: {e}")

    # Run the real extraction
    try:
        await _run_extraction(extraction_session_id, config)
    except Exception as e:
        case_logger.error("Extraction failed: %s", e)
        errors.append(f"Extraction error: {e}")

    # Read back results from DB
    try:
        async with get_db() as db:
            # Get session status
            cursor = await db.execute(
                "SELECT status, total_leads, emails_found, phones_found FROM sessions WHERE id = ?",
                (extraction_session_id,),
            )
            row = await cursor.fetchone()
            if row:
                session_status = row[0]
                session_total = row[1] or 0
                session_emails = row[2] or 0
                session_phones = row[3] or 0
                case_logger.info(
                    "Session %s finished: status=%s total=%d emails=%d phones=%d",
                    extraction_session_id[:8], session_status,
                    session_total, session_emails, session_phones,
                )

            # Get leads per platform
            cursor = await db.execute(
                "SELECT platform, COUNT(*) as cnt FROM leads WHERE session_id = ? GROUP BY platform",
                (extraction_session_id,),
            )
            platform_rows = await cursor.fetchall()
            for pr in platform_rows:
                plat_name = pr[0]
                plat_count = pr[1]
                per_platform[plat_name] = {
                    "status": "ok",
                    "leads_found": plat_count,
                    "duration_s": 0,  # Not tracked per-platform in extraction
                }
                total_leads += plat_count
                case_logger.info("[%s] %d leads", plat_name, plat_count)

            # Location filter analysis for location-targeted keywords
            if tc.hasLocation and " in " in tc.keyword.lower():
                location_hint = tc.keyword.lower().split(" in ", 1)[1].strip()
                cursor = await db.execute(
                    "SELECT id, email, name, country, platform FROM leads WHERE session_id = ?",
                    (extraction_session_id,),
                )
                all_leads = await cursor.fetchall()
                kept = 0
                dropped_detail: list[dict] = []
                for lead_row in all_leads:
                    lead_country = (lead_row[3] or "").lower()
                    if location_hint in lead_country or not lead_country or lead_country == "unknown":
                        kept += 1
                    else:
                        dropped_detail.append({
                            "id": lead_row[0][:8],
                            "country": lead_row[3],
                            "reason": f"country '{lead_row[3]}' != '{location_hint}'",
                        })

                location_filter_log.append({
                    "keyword": tc.keyword,
                    "location_hint": location_hint,
                    "total_leads": len(all_leads),
                    "kept": kept,
                    "dropped": len(dropped_detail),
                    "dropped_detail": dropped_detail[:10],
                })
                case_logger.info(
                    "Location filter: %d kept, %d dropped (hint=%s)",
                    kept, len(dropped_detail), location_hint,
                )
    except Exception as e:
        case_logger.error("Failed to read results: %s", e)
        errors.append(f"DB read error: {e}")

    return total_leads


# ── Bundle builder ───────────────────────────────────────────────────────────

def _build_bundle(session_id: str) -> str:
    session = _test_sessions[session_id]
    out_dir = Path("test_bundles")
    out_dir.mkdir(exist_ok=True)
    zip_path = str(out_dir / f"snapleads_test_{session_id[:8]}.zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. Summary JSON
        total = session["total"]
        completed = session["completed"]
        failed = session["failed"]
        passed = completed - failed
        summary = {
            "session_id": session_id,
            "started_at": session.get("started_at"),
            "finished_at": session.get("finished_at"),
            "total_cases": total,
            "completed": completed,
            "failed": failed,
            "passed": passed,
            "pass_rate": f"{passed / max(total, 1) * 100:.1f}%",
        }
        zf.writestr("summary.json", json.dumps(summary, indent=2))

        # 2. Per-case results
        for res in session["results"]:
            case_id = res.get("case_id", "unknown")[:8]
            kw = res.get("keyword", "unknown")[:30]
            group = res.get("platform_group", "unknown")
            toggle = res.get("toggle_label", "unknown")
            name = f"{kw}_{group}_{toggle}".replace(" ", "_").replace("/", "-")
            zf.writestr(
                f"cases/{case_id}_{name}.json",
                json.dumps(res, indent=2, default=str),
            )

        # 3. All backend logs merged (JSONL)
        all_logs = []
        for res in session["results"]:
            all_logs.extend(res.get("backend_logs", []))
        all_logs.sort(key=lambda x: x.get("ts", ""))
        zf.writestr(
            "logs/backend_all.jsonl",
            "\n".join(json.dumps(l) for l in all_logs),
        )

        # 4. Frontend console logs (JSONL)
        zf.writestr(
            "logs/frontend_console.jsonl",
            "\n".join(json.dumps(l) for l in session.get("frontend_logs", [])),
        )

        # 5. Location filter report
        filter_rows = []
        for res in session["results"]:
            for row in res.get("location_filter_log", []):
                filter_rows.append({**row, "case_id": res.get("case_id", "")})
        zf.writestr(
            "logs/location_filter.json",
            json.dumps(filter_rows, indent=2, default=str),
        )

        # 6. Timing CSV
        timing_lines = [
            "case_id,keyword,group,toggle,status,duration_s,leads_found"
        ]
        for res in session["results"]:
            timing_lines.append(
                f"{res.get('case_id', '')[:8]},"
                f"\"{res.get('keyword', '')}\"," 
                f"{res.get('platform_group', '')},"
                f"{res.get('toggle_label', '')},"
                f"{res.get('status', '')},"
                f"{res.get('duration_seconds', 0)},"
                f"{res.get('leads_found', 0)}"
            )
        zf.writestr("reports/timing.csv", "\n".join(timing_lines))

        # 7. Per-platform CSV
        pp_lines = [
            "case_id,platform,status,leads_found,duration_s,error"
        ]
        for res in session["results"]:
            for plat, data in res.get("per_platform", {}).items():
                pp_lines.append(
                    f"{res.get('case_id', '')[:8]},"
                    f"{plat},"
                    f"{data.get('status', '')},"
                    f"{data.get('leads_found', 0)},"
                    f"{data.get('duration_s', 0)},"
                    f"\"{data.get('error', '')}\""
                )
        zf.writestr("reports/per_platform.csv", "\n".join(pp_lines))

        # 8. README
        readme = f"""# SnapLeads Test Bundle
Generated: {datetime.utcnow().isoformat()}Z
Session:   {session_id}

## Contents
- summary.json              — Overall pass/fail stats
- cases/                    — Individual test case results (JSON per case)
- logs/backend_all.jsonl    — All Python log lines (JSONL, sorted by time)
- logs/frontend_console.jsonl — Browser console logs from React frontend
- logs/location_filter.json — Which leads were kept/dropped and why
- reports/timing.csv        — Duration and lead count per test case
- reports/per_platform.csv  — Per-platform breakdown

## How to read JSONL
Each line in *.jsonl is a standalone JSON object. Open in VS Code or run:
  python -c "import json,sys; [print(json.dumps(json.loads(l), indent=2)) for l in open(sys.argv[1])]" backend_all.jsonl
"""
        zf.writestr("README.md", readme)

    logger.info("Test bundle created: %s", zip_path)
    return zip_path
