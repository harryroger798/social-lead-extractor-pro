import aiosqlite
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "..", "data", "leads.db"))


async def init_db() -> None:
    """Initialize the SQLite database with all required tables."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
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

            CREATE INDEX IF NOT EXISTS idx_leads_session ON leads(session_id);
            CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
            CREATE INDEX IF NOT EXISTS idx_leads_platform ON leads(platform);
            CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
            CREATE INDEX IF NOT EXISTS idx_blacklist_type ON blacklist(type);
            CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(key);
        """)
        await db.commit()


@asynccontextmanager
async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    """Get a database connection."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db
