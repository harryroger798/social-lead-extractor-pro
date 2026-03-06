"""Scheduled extraction service using APScheduler."""
import json
import logging
import uuid
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# In-memory store for scheduler state (persisted to DB)
_scheduler_instance = None
_scheduled_jobs: dict[str, dict] = {}


def get_scheduler():
    """Get or create the APScheduler instance."""
    global _scheduler_instance
    if _scheduler_instance is None:
        try:
            from apscheduler.schedulers.asyncio import AsyncIOScheduler
            _scheduler_instance = AsyncIOScheduler()
            _scheduler_instance.start()
            logger.info("APScheduler started successfully")
        except ImportError:
            logger.warning("APScheduler not installed. Scheduled extractions disabled.")
            return None
    return _scheduler_instance


async def create_schedule(
    name: str,
    keywords: list[str],
    platforms: list[str],
    frequency: str = "daily",
    cron_expression: str = "",
    pages_per_keyword: int = 3,
    delay_between_requests: float = 3.0,
    use_proxies: bool = False,
    use_google_dorking: bool = True,
    use_firecrawl_enrichment: bool = False,
    auto_verify: bool = True,
) -> dict:
    """
    Create a new scheduled extraction job.
    frequency: 'hourly', 'daily', 'weekly', 'custom'
    cron_expression: used when frequency='custom' (e.g., '0 9 * * MON')
    """
    schedule_id = str(uuid.uuid4())

    job_config = {
        "id": schedule_id,
        "name": name,
        "keywords": keywords,
        "platforms": platforms,
        "frequency": frequency,
        "cron_expression": cron_expression,
        "pages_per_keyword": pages_per_keyword,
        "delay_between_requests": delay_between_requests,
        "use_proxies": use_proxies,
        "use_google_dorking": use_google_dorking,
        "use_firecrawl_enrichment": use_firecrawl_enrichment,
        "auto_verify": auto_verify,
        "status": "active",
        "created_at": datetime.now().isoformat(),
        "last_run": None,
        "next_run": None,
        "total_runs": 0,
    }

    scheduler = get_scheduler()
    if scheduler:
        try:
            trigger_kwargs = _get_trigger_kwargs(frequency, cron_expression)
            scheduler.add_job(
                _run_scheduled_extraction,
                trigger=trigger_kwargs["trigger"],
                id=schedule_id,
                name=name,
                kwargs={"schedule_id": schedule_id, "config": job_config},
                **trigger_kwargs.get("args", {}),
            )
            job = scheduler.get_job(schedule_id)
            if job and job.next_run_time:
                job_config["next_run"] = job.next_run_time.isoformat()
        except Exception as e:
            logger.error(f"Failed to add scheduler job: {e}")
            job_config["status"] = "error"

    _scheduled_jobs[schedule_id] = job_config
    return job_config


def _get_trigger_kwargs(frequency: str, cron_expression: str = "") -> dict:
    """Convert frequency to APScheduler trigger kwargs."""
    if frequency == "hourly":
        return {"trigger": "interval", "args": {"hours": 1}}
    elif frequency == "daily":
        return {"trigger": "interval", "args": {"hours": 24}}
    elif frequency == "weekly":
        return {"trigger": "interval", "args": {"weeks": 1}}
    elif frequency == "custom" and cron_expression:
        # Parse simple cron: minute hour day_of_month month day_of_week
        parts = cron_expression.strip().split()
        if len(parts) >= 5:
            return {
                "trigger": "cron",
                "args": {
                    "minute": parts[0],
                    "hour": parts[1],
                    "day": parts[2],
                    "month": parts[3],
                    "day_of_week": parts[4],
                },
            }
    # Default to daily
    return {"trigger": "interval", "args": {"hours": 24}}


async def _run_scheduled_extraction(schedule_id: str, config: dict) -> None:
    """Execute a scheduled extraction job."""
    from app.database import get_db
    from app.api.routes import _run_extraction
    from app.models.schemas import ExtractionRequest

    logger.info(f"Running scheduled extraction: {config['name']}")

    try:
        extraction_config = ExtractionRequest(
            name=f"[Scheduled] {config['name']}",
            keywords=config["keywords"],
            platforms=config["platforms"],
            pages_per_keyword=config.get("pages_per_keyword", 3),
            delay_between_requests=config.get("delay_between_requests", 3.0),
            use_proxies=config.get("use_proxies", False),
            use_google_dorking=config.get("use_google_dorking", True),
            use_firecrawl_enrichment=config.get("use_firecrawl_enrichment", False),
            auto_verify=config.get("auto_verify", True),
        )

        session_id = str(uuid.uuid4())
        async with get_db() as db:
            await db.execute(
                """INSERT INTO sessions
                (id, name, status, platforms, keywords, started_at, config)
                VALUES (?, ?, 'running', ?, ?, ?, ?)""",
                (session_id, extraction_config.name,
                 json.dumps(extraction_config.platforms),
                 json.dumps(extraction_config.keywords),
                 datetime.now().isoformat(),
                 json.dumps(extraction_config.model_dump())),
            )
            await db.commit()

        await _run_extraction(session_id, extraction_config)

        # Update schedule stats
        if schedule_id in _scheduled_jobs:
            _scheduled_jobs[schedule_id]["last_run"] = datetime.now().isoformat()
            _scheduled_jobs[schedule_id]["total_runs"] = (
                _scheduled_jobs[schedule_id].get("total_runs", 0) + 1
            )

        # Update in DB
        async with get_db() as db:
            await db.execute(
                "UPDATE schedules SET last_run=?, total_runs=total_runs+1 WHERE id=?",
                (datetime.now().isoformat(), schedule_id),
            )
            await db.commit()

    except Exception as e:
        logger.error(f"Scheduled extraction failed: {e}")


async def pause_schedule(schedule_id: str) -> bool:
    """Pause a scheduled job."""
    scheduler = get_scheduler()
    if scheduler:
        try:
            scheduler.pause_job(schedule_id)
            if schedule_id in _scheduled_jobs:
                _scheduled_jobs[schedule_id]["status"] = "paused"
            return True
        except Exception as e:
            logger.error(f"Failed to pause schedule: {e}")
    return False


async def resume_schedule(schedule_id: str) -> bool:
    """Resume a paused scheduled job."""
    scheduler = get_scheduler()
    if scheduler:
        try:
            scheduler.resume_job(schedule_id)
            if schedule_id in _scheduled_jobs:
                _scheduled_jobs[schedule_id]["status"] = "active"
            return True
        except Exception as e:
            logger.error(f"Failed to resume schedule: {e}")
    return False


async def delete_schedule(schedule_id: str) -> bool:
    """Delete a scheduled job."""
    scheduler = get_scheduler()
    if scheduler:
        try:
            scheduler.remove_job(schedule_id)
        except Exception:
            pass
    _scheduled_jobs.pop(schedule_id, None)
    return True


def get_all_schedules() -> list[dict]:
    """Get all scheduled jobs."""
    return list(_scheduled_jobs.values())
