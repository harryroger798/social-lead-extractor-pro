import aiosqlite
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "..", "data", "leads.db"))


async def init_db() -> None:
    """Initialize the SQLite database with all required tables."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH, timeout=30) as db:
        await db.execute("PRAGMA journal_mode=WAL")
        await db.execute("PRAGMA busy_timeout=10000")
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS leads (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL DEFAULT '',
                phone TEXT NOT NULL DEFAULT '',
                name TEXT NOT NULL DEFAULT '',
                platform TEXT NOT NULL,
                source_url TEXT NOT NULL DEFAULT '',
                keyword TEXT NOT NULL DEFAULT '',
                country TEXT NOT NULL DEFAULT '',
                email_type TEXT NOT NULL DEFAULT 'unknown',
                verified INTEGER NOT NULL DEFAULT 0,
                quality_score INTEGER NOT NULL DEFAULT 0,
                extracted_at TEXT NOT NULL,
                session_id TEXT NOT NULL,
                UNIQUE(email, phone, session_id)
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'running',
                platforms TEXT NOT NULL DEFAULT '[]',
                keywords TEXT NOT NULL DEFAULT '[]',
                total_leads INTEGER NOT NULL DEFAULT 0,
                emails_found INTEGER NOT NULL DEFAULT 0,
                phones_found INTEGER NOT NULL DEFAULT 0,
                started_at TEXT NOT NULL,
                completed_at TEXT,
                duration INTEGER NOT NULL DEFAULT 0,
                progress INTEGER NOT NULL DEFAULT 0,
                config TEXT NOT NULL DEFAULT '{}'
            );

            CREATE TABLE IF NOT EXISTS blacklist (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                value TEXT NOT NULL,
                reason TEXT NOT NULL DEFAULT '',
                added_at TEXT NOT NULL,
                UNIQUE(type, value)
            );

            CREATE TABLE IF NOT EXISTS proxies (
                id TEXT PRIMARY KEY,
                host TEXT NOT NULL,
                port INTEGER NOT NULL,
                username TEXT NOT NULL DEFAULT '',
                password TEXT NOT NULL DEFAULT '',
                protocol TEXT NOT NULL DEFAULT 'http',
                country TEXT NOT NULL DEFAULT '',
                speed REAL NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'inactive',
                last_tested TEXT
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS licenses (
                id TEXT PRIMARY KEY,
                key TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL DEFAULT 'active',
                buyer_name TEXT NOT NULL DEFAULT '',
                buyer_email TEXT NOT NULL DEFAULT '',
                activated_at TEXT,
                expires_at TEXT NOT NULL,
                max_activations INTEGER NOT NULL DEFAULT 1,
                current_activations INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS schedules (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                keywords TEXT NOT NULL DEFAULT '[]',
                platforms TEXT NOT NULL DEFAULT '[]',
                frequency TEXT NOT NULL DEFAULT 'daily',
                cron_expression TEXT NOT NULL DEFAULT '',
                pages_per_keyword INTEGER NOT NULL DEFAULT 3,
                delay_between_requests REAL NOT NULL DEFAULT 3.0,
                use_proxies INTEGER NOT NULL DEFAULT 0,
                use_google_dorking INTEGER NOT NULL DEFAULT 1,
                use_firecrawl_enrichment INTEGER NOT NULL DEFAULT 0,
                auto_verify INTEGER NOT NULL DEFAULT 1,
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL,
                last_run TEXT,
                next_run TEXT,
                total_runs INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS outreach_logs (
                id TEXT PRIMARY KEY,
                campaign_id TEXT NOT NULL DEFAULT '',
                to_email TEXT NOT NULL,
                subject TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'pending',
                error TEXT NOT NULL DEFAULT '',
                sent_at TEXT NOT NULL,
                lead_id TEXT NOT NULL DEFAULT ''
            );

            CREATE INDEX IF NOT EXISTS idx_leads_session ON leads(session_id);
            CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
            CREATE INDEX IF NOT EXISTS idx_leads_platform ON leads(platform);
            CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
            CREATE INDEX IF NOT EXISTS idx_blacklist_type ON blacklist(type);
            CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(key);
            CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
            CREATE INDEX IF NOT EXISTS idx_outreach_campaign ON outreach_logs(campaign_id);
        """)

        # Add new columns (safe migration - ignore if already exists)
        for col_sql in [
            "ALTER TABLE leads ADD COLUMN lead_hash TEXT DEFAULT ''",
            "ALTER TABLE leads ADD COLUMN lead_score INTEGER DEFAULT 0",
            "ALTER TABLE leads ADD COLUMN score_category TEXT DEFAULT 'cold'",
            "ALTER TABLE leads ADD COLUMN website TEXT DEFAULT ''",
            "ALTER TABLE leads ADD COLUMN company TEXT DEFAULT ''",
            "ALTER TABLE leads ADD COLUMN address TEXT DEFAULT ''",
            "ALTER TABLE leads ADD COLUMN rating TEXT DEFAULT ''",
            "ALTER TABLE leads ADD COLUMN category TEXT DEFAULT ''",
            "ALTER TABLE sessions ADD COLUMN error_message TEXT DEFAULT ''",
            "ALTER TABLE sessions ADD COLUMN current_platform TEXT DEFAULT ''",
            "ALTER TABLE sessions ADD COLUMN status_message TEXT DEFAULT ''",
            "ALTER TABLE leads ADD COLUMN source_platform TEXT DEFAULT ''",
        ]:
            try:
                await db.execute(col_sql)
            except Exception:
                pass  # Column already exists

        # Migrate app_name from old branding to SnapLeads
        await db.execute(
            "UPDATE settings SET value = 'SnapLeads' WHERE key = 'app_name' AND value = 'Social Lead Extractor Pro'"
        )

        # v3.5.63 Fix 5: Recover orphaned sessions on startup.
        # When the app is killed mid-extraction (crash, shutdown, force close),
        # sessions stay in status='running' forever. Mark them as 'completed'
        # and preserve all leads that were already batch-saved (Fix 3).
        import logging
        _db_logger = logging.getLogger("snapleads.database")

        # First, count leads already saved for each orphaned session
        orphan_cursor = await db.execute(
            "SELECT id, name FROM sessions WHERE status='running'"
        )
        orphan_rows = await orphan_cursor.fetchall()

        for orphan in orphan_rows:
            oid = orphan[0]
            oname = orphan[1] if len(orphan) > 1 else "unknown"
            lead_cursor = await db.execute(
                "SELECT COUNT(*) FROM leads WHERE session_id=?", (oid,)
            )
            lead_row = await lead_cursor.fetchone()
            preserved = lead_row[0] if lead_row else 0
            _db_logger.info(
                "v3.5.63: Recovering orphaned session '%s' (%s) — %d leads preserved",
                oname, oid, preserved,
            )
            # Update the session's total_leads to reflect actually saved leads
            if preserved > 0:
                await db.execute(
                    "UPDATE sessions SET total_leads=? WHERE id=? AND total_leads=0",
                    (preserved, oid),
                )

        cursor = await db.execute(
            "UPDATE sessions SET status='completed', progress=100, "
            "completed_at=COALESCE(completed_at, datetime('now')), "
            "status_message='Recovered after restart — leads preserved' "
            "WHERE status='running'"
        )
        recovered = cursor.rowcount
        if recovered > 0:
            _db_logger.info(
                "v3.5.63: Recovered %d orphaned running session(s) on startup", recovered
            )

        await db.commit()


@asynccontextmanager
async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    """Get a database connection with WAL mode and busy timeout.

    WAL mode allows concurrent readers + one writer without 'database is locked'.
    Busy timeout tells SQLite to wait up to 10s for locks instead of failing.
    """
    async with aiosqlite.connect(DB_PATH, timeout=30) as db:
        await db.execute("PRAGMA journal_mode=WAL")
        await db.execute("PRAGMA busy_timeout=10000")
        db.row_factory = aiosqlite.Row
        yield db
