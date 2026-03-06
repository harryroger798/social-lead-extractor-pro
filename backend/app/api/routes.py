"""API routes for SnapLeads."""
import json
import uuid
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
from app.services.extractor import extract_emails, extract_phones, classify_email, score_lead
from app.services.verifier import verify_email
from app.services.google_dorking import dorking_search_multi
from app.services.reddit_extractor import reddit_search
from app.services.proxy_manager import proxy_manager, test_proxy, parse_proxy_line
from app.services.firecrawl_service import enrich_leads_with_firecrawl, check_firecrawl_credits
from app.services.export_service import export_leads_bytes
from app.services.license_service import (
    generate_license_key,
    validate_key_format,
    get_expiry_date,
)

router = APIRouter(prefix="/api")


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


async def _run_extraction(session_id: str, config: ExtractionRequest) -> None:
    """Background task to run extraction."""
    all_leads: list[dict] = []

    try:
        # Load proxy pool if proxies are enabled
        if config.use_proxies:
            await _load_proxy_pool()
            proxy_manager.set_strategy(config.proxy_rotation)

        # Google dorking for non-Reddit platforms
        if config.use_google_dorking:
            non_reddit = [p for p in config.platforms if p != "reddit"]
            if non_reddit:
                results = await dorking_search_multi(
                    config.keywords, non_reddit,
                    pages=config.pages_per_keyword,
                    delay=config.delay_between_requests,
                )
                for result in results:
                    for email in result.get("emails", []):
                        lead = {
                            "email": email,
                            "phone": "",
                            "name": "",
                            "platform": result["platform"],
                            "source_url": result["sources"][0] if result.get("sources") else "",
                            "keyword": result["keyword"],
                        }
                        all_leads.append(lead)
                    for phone in result.get("phones", []):
                        lead = {
                            "email": "",
                            "phone": phone,
                            "name": "",
                            "platform": result["platform"],
                            "source_url": result["sources"][0] if result.get("sources") else "",
                            "keyword": result["keyword"],
                        }
                        all_leads.append(lead)

        # Reddit extraction
        if "reddit" in config.platforms:
            for keyword in config.keywords:
                result = await reddit_search(keyword)
                for email in result.get("emails", []):
                    lead = {
                        "email": email,
                        "phone": "",
                        "name": "",
                        "platform": "reddit",
                        "source_url": result["sources"][0] if result.get("sources") else "",
                        "keyword": keyword,
                    }
                    all_leads.append(lead)
                for phone in result.get("phones", []):
                    lead = {
                        "email": "",
                        "phone": phone,
                        "name": "",
                        "platform": "reddit",
                        "source_url": result["sources"][0] if result.get("sources") else "",
                        "keyword": keyword,
                    }
                    all_leads.append(lead)

        # Firecrawl enrichment — scrape business websites for additional contacts
        if config.use_firecrawl_enrichment:
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

        # Process leads: classify, score, verify, and store
        async with get_db() as db:
            emails_found = 0
            phones_found = 0

            for lead_data in all_leads:
                lead_id = str(uuid.uuid4())
                email = lead_data.get("email", "")
                phone = lead_data.get("phone", "")
                name = lead_data.get("name", "")

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
                if email and config.auto_verify:
                    verified = await verify_email(email)

                quality = score_lead(email, phone, name, verified)

                try:
                    await db.execute(
                        """INSERT OR IGNORE INTO leads
                        (id, email, phone, name, platform, source_url, keyword, country,
                         email_type, verified, quality_score, extracted_at, session_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (lead_id, email, phone, name, lead_data.get("platform", ""),
                         lead_data.get("source_url", ""), lead_data.get("keyword", ""),
                         "", email_type, 1 if verified else 0, quality,
                         datetime.now().isoformat(), session_id),
                    )
                    if email:
                        emails_found += 1
                    if phone:
                        phones_found += 1
                except Exception:
                    pass

            # Update session
            total = emails_found + phones_found
            await db.execute(
                """UPDATE sessions SET
                    status='completed', total_leads=?, emails_found=?, phones_found=?,
                    completed_at=?, duration=?, progress=100
                WHERE id=?""",
                (total, emails_found, phones_found,
                 datetime.now().isoformat(),
                 0, session_id),
            )
            await db.commit()

    except Exception as e:
        async with get_db() as db:
            await db.execute(
                "UPDATE sessions SET status='failed', completed_at=? WHERE id=?",
                (datetime.now().isoformat(), session_id),
            )
            await db.commit()


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
        return {
            "id": row[0], "name": row[1], "status": row[2],
            "total_leads": row[5], "emails_found": row[6],
            "phones_found": row[7], "progress": row[11],
        }


# ─── Results / Leads ─────────────────────────────────────────────────────────

@router.get("/results")
async def get_results(
    session_id: Optional[str] = None,
    platform: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
) -> dict:
    async with get_db() as db:
        conditions = []
        params: list = []

        if session_id:
            conditions.append("session_id = ?")
            params.append(session_id)
        if platform:
            conditions.append("platform = ?")
            params.append(platform)
        if search:
            conditions.append("(email LIKE ? OR name LIKE ? OR phone LIKE ?)")
            params.extend([f"%{search}%"] * 3)

        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        # Count
        cursor = await db.execute(f"SELECT COUNT(*) FROM leads {where}", params)
        row = await cursor.fetchone()
        total = row[0] if row else 0

        # Fetch page
        offset = (page - 1) * page_size
        cursor = await db.execute(
            f"SELECT * FROM leads {where} ORDER BY extracted_at DESC LIMIT ? OFFSET ?",
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

    except Exception:
        async with get_db() as db:
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
