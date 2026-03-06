"""API routes for Social Lead Extractor Pro."""
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
        if config.use_firecrawl:
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
