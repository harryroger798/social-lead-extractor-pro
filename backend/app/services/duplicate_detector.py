"""Duplicate detection service using hash-based deduplication."""
import hashlib
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def compute_lead_hash(
    email: str = "",
    phone: str = "",
    name: str = "",
) -> str:
    """
    Compute a SHA-256 hash for a lead based on email + phone + name.
    Used for cross-session duplicate detection.
    """
    key = f"{email.lower().strip()}|{phone.strip()}|{name.lower().strip()}"
    return hashlib.sha256(key.encode()).hexdigest()


def is_fuzzy_duplicate(
    new_email: str,
    new_phone: str,
    new_name: str,
    existing_email: str,
    existing_phone: str,
    existing_name: str,
    threshold: float = 0.85,
) -> bool:
    """
    Check if two leads are fuzzy duplicates using simple similarity.
    Returns True if the leads are likely duplicates.
    """
    # Exact match on email or phone is always a duplicate
    if new_email and existing_email and new_email.lower().strip() == existing_email.lower().strip():
        return True
    if new_phone and existing_phone:
        # Normalize phones by removing non-digits
        import re
        new_digits = re.sub(r'[^\d]', '', new_phone)
        exist_digits = re.sub(r'[^\d]', '', existing_phone)
        if new_digits and exist_digits and new_digits == exist_digits:
            return True
        # Check suffix match (last 10 digits)
        if len(new_digits) >= 10 and len(exist_digits) >= 10:
            if new_digits[-10:] == exist_digits[-10:]:
                return True

    # Name similarity (simple ratio)
    if new_name and existing_name:
        sim = _name_similarity(new_name.lower().strip(), existing_name.lower().strip())
        if sim >= threshold:
            # Also need at least one matching contact method
            if (new_email and existing_email) or (new_phone and existing_phone):
                return True

    return False


def _name_similarity(a: str, b: str) -> float:
    """Simple Jaccard similarity for names."""
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    set_a = set(a.split())
    set_b = set(b.split())
    if not set_a or not set_b:
        return 0.0
    intersection = set_a & set_b
    union = set_a | set_b
    return len(intersection) / len(union)


async def deduplicate_leads(
    new_leads: list[dict],
    db_connection,
) -> tuple[list[dict], int]:
    """
    Deduplicate a list of new leads against the database.
    Returns (unique_leads, duplicates_skipped_count).
    """
    unique = []
    skipped = 0

    # Get existing lead hashes from DB
    cursor = await db_connection.execute(
        "SELECT lead_hash FROM leads WHERE lead_hash IS NOT NULL AND lead_hash != ''"
    )
    rows = await cursor.fetchall()
    existing_hashes = {r[0] for r in rows}

    # Also track hashes within this batch
    batch_hashes: set[str] = set()

    for lead in new_leads:
        lead_hash = compute_lead_hash(
            lead.get("email", ""),
            lead.get("phone", ""),
            lead.get("name", ""),
        )

        if lead_hash in existing_hashes or lead_hash in batch_hashes:
            skipped += 1
            continue

        batch_hashes.add(lead_hash)
        lead["lead_hash"] = lead_hash
        unique.append(lead)

    return unique, skipped
