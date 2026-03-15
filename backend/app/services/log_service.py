"""Comprehensive persistent logging for SnapLeads.

v3.5.22: Captures ALL backend logs (Python, DuckDB, uvicorn) to rotating
files in the userData/logs/ directory. Logs persist until explicitly cleared
via Settings > Clear Logs.

Log format: 2026-03-15 08:30:00.123 | INFO | module_name | message
Rotation: 10MB per file, keep last 20 files (200MB max)
"""
import glob
import io
import logging
import os
import platform
import sys
import zipfile
from logging.handlers import RotatingFileHandler
from typing import Optional

# ── Log directory resolution ─────────────────────────────────────────────────

_LOG_DIR: Optional[str] = None
_INITIALIZED = False

# Constants
_MAX_BYTES = 10 * 1024 * 1024  # 10 MB per file
_BACKUP_COUNT = 20  # Keep 20 rotated files (200 MB max)
_LOG_FORMAT = "%(asctime)s.%(msecs)03d | %(levelname)-7s | %(name)-30s | %(message)s"
_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def _resolve_log_dir() -> str:
    """Determine the logs directory path.

    Priority:
    1. DATABASE_PATH env var parent dir (set by Electron main.js)
    2. APPDATA/snapleads/logs (Windows)
    3. ~/.config/snapleads/logs (Linux/macOS)
    """
    # Check if Electron set DATABASE_PATH
    db_path = os.environ.get("DATABASE_PATH", "")
    if db_path:
        return os.path.join(os.path.dirname(db_path), "logs")

    home = os.path.expanduser("~")
    system = platform.system()
    if system == "Windows":
        app_data = os.environ.get("APPDATA", os.path.join(home, "AppData", "Roaming"))
        return os.path.join(app_data, "snapleads", "logs")
    elif system == "Darwin":
        return os.path.join(home, "Library", "Application Support", "snapleads", "logs")
    else:
        return os.path.join(home, ".config", "snapleads", "logs")


def get_log_dir() -> str:
    """Return the resolved log directory, creating it if needed."""
    global _LOG_DIR
    if _LOG_DIR is None:
        _LOG_DIR = _resolve_log_dir()
    os.makedirs(_LOG_DIR, exist_ok=True)
    return _LOG_DIR


def init_logging() -> str:
    """Initialize the logging system. Call once at app startup.

    Returns the log directory path for reference.
    """
    global _INITIALIZED
    if _INITIALIZED:
        return get_log_dir()

    log_dir = get_log_dir()
    log_file = os.path.join(log_dir, "snapleads.log")

    # Create the rotating file handler
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=_MAX_BYTES,
        backupCount=_BACKUP_COUNT,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter(_LOG_FORMAT, datefmt=_DATE_FORMAT))
    # Flush after every record for real-time writing
    file_handler.flush = file_handler.stream.flush  # type: ignore[assignment]

    # Also keep a console handler for development/debugging
    console_handler = logging.StreamHandler(sys.stderr)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(logging.Formatter(_LOG_FORMAT, datefmt=_DATE_FORMAT))

    # Configure root logger to capture ALL logs
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    # Remove any existing handlers to avoid duplicates
    for h in root_logger.handlers[:]:
        root_logger.removeHandler(h)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    # Also capture uvicorn logs
    for logger_name in ["uvicorn", "uvicorn.error", "uvicorn.access",
                        "fastapi", "aiosqlite", "duckdb"]:
        named_logger = logging.getLogger(logger_name)
        named_logger.setLevel(logging.DEBUG)
        named_logger.propagate = True  # Let root logger handle it

    _INITIALIZED = True

    # Log startup info
    logger = logging.getLogger("log_service")
    logger.info("=" * 80)
    logger.info("SnapLeads logging initialized")
    logger.info("Log directory: %s", log_dir)
    logger.info("Log file: %s", log_file)
    logger.info("Python: %s", sys.version)
    logger.info("Platform: %s", platform.platform())
    logger.info("Frozen: %s", getattr(sys, "frozen", False))
    if hasattr(sys, "_MEIPASS"):
        logger.info("MEIPASS: %s", sys._MEIPASS)
    logger.info("CWD: %s", os.getcwd())
    logger.info("DATABASE_PATH: %s", os.environ.get("DATABASE_PATH", "(not set)"))
    logger.info("=" * 80)

    return log_dir


# ── Log management functions (used by API endpoints) ─────────────────────────

def list_log_files() -> list[dict]:
    """List all log files with their sizes and modification times."""
    log_dir = get_log_dir()
    files = []
    pattern = os.path.join(log_dir, "snapleads.log*")
    for filepath in sorted(glob.glob(pattern)):
        try:
            stat = os.stat(filepath)
            files.append({
                "name": os.path.basename(filepath),
                "path": filepath,
                "size": stat.st_size,
                "modified": stat.st_mtime,
            })
        except OSError:
            continue

    # Also include electron.log if it exists
    electron_log = os.path.join(log_dir, "electron.log")
    if os.path.isfile(electron_log):
        stat = os.stat(electron_log)
        files.append({
            "name": "electron.log",
            "path": electron_log,
            "size": stat.st_size,
            "modified": stat.st_mtime,
        })

    return files


def tail_log(lines: int = 200) -> str:
    """Get the last N lines from the current log file."""
    log_file = os.path.join(get_log_dir(), "snapleads.log")
    if not os.path.isfile(log_file):
        return "(no log file yet)"

    try:
        with open(log_file, "r", encoding="utf-8", errors="replace") as f:
            all_lines = f.readlines()
            return "".join(all_lines[-lines:])
    except OSError as e:
        return f"(error reading log: {e})"


def clear_logs() -> int:
    """Delete all log files. Returns number of files deleted."""
    log_dir = get_log_dir()
    count = 0
    for filepath in glob.glob(os.path.join(log_dir, "*")):
        try:
            os.remove(filepath)
            count += 1
        except OSError:
            continue
    return count


def export_logs_zip() -> bytes:
    """Create a ZIP archive of all log files and return the bytes."""
    log_dir = get_log_dir()
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for filepath in glob.glob(os.path.join(log_dir, "*")):
            try:
                zf.write(filepath, os.path.basename(filepath))
            except OSError:
                continue

        # Also include system info
        info = (
            f"SnapLeads Log Export\n"
            f"Python: {sys.version}\n"
            f"Platform: {platform.platform()}\n"
            f"Frozen: {getattr(sys, 'frozen', False)}\n"
            f"CWD: {os.getcwd()}\n"
            f"DATABASE_PATH: {os.environ.get('DATABASE_PATH', '(not set)')}\n"
        )
        zf.writestr("system_info.txt", info)

    return buffer.getvalue()


def write_frontend_log(level: str, module: str, message: str) -> None:
    """Write a log entry from the frontend/Electron renderer."""
    logger = logging.getLogger(f"frontend.{module}")
    level_map = {
        "debug": logging.DEBUG,
        "info": logging.INFO,
        "warn": logging.WARNING,
        "warning": logging.WARNING,
        "error": logging.ERROR,
    }
    log_level = level_map.get(level.lower(), logging.INFO)
    logger.log(log_level, message)
