"""Lead Enrichment Service — Auto-fill missing data from existing leads.
100% free, no external APIs. Cross-references existing data to fill gaps.
"""
import asyncio
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)


async def enrich_leads_from_database(db_connection) -> dict:
    """
    Enrich leads by cross-referencing existing data in the database.
    - Fill missing names from other leads with same email/phone
    - Fill missing phones from other leads with same email
    - Fill missing emails from other leads with same phone
    - Detect company from email domain
    - Detect website from email domain
    Returns stats dict.
    """
    stats = {
        "names_filled": 0,
        "phones_filled": 0,
        "emails_filled": 0,
        "companies_detected": 0,
        "websites_detected": 0,
        "total_enriched": 0,
    }

    db = db_connection

    # Step 1: Build lookup maps from existing data
    cursor = await db.execute(
        "SELECT id, email, phone, name, company, website FROM leads"
    )
    all_rows = await cursor.fetchall()

    email_to_data: dict[str, dict] = {}
    phone_to_data: dict[str, dict] = {}

    for r in all_rows:
        lead_id, email, phone, name, company, website = r[0], r[1], r[2], r[3], r[4] or "", r[5] or ""

        if email and email.strip():
            if email not in email_to_data:
                email_to_data[email] = {"name": "", "phone": "", "company": "", "website": ""}
            if name and name.strip():
                email_to_data[email]["name"] = name
            if phone and phone.strip():
                email_to_data[email]["phone"] = phone
            if company and company.strip():
                email_to_data[email]["company"] = company
            if website and website.strip():
                email_to_data[email]["website"] = website

        if phone and phone.strip():
            if phone not in phone_to_data:
                phone_to_data[phone] = {"name": "", "email": "", "company": "", "website": ""}
            if name and name.strip():
                phone_to_data[phone]["name"] = name
            if email and email.strip():
                phone_to_data[phone]["email"] = email
            if company and company.strip():
                phone_to_data[phone]["company"] = company

    # Step 2: Enrich leads with missing data
    for r in all_rows:
        lead_id = r[0]
        email = r[1] or ""
        phone = r[2] or ""
        name = r[3] or ""
        company = r[4] or ""
        website = r[5] or ""
        updates: dict[str, str] = {}

        # Fill missing name
        if not name.strip():
            if email and email in email_to_data and email_to_data[email]["name"]:
                updates["name"] = email_to_data[email]["name"]
                stats["names_filled"] += 1
            elif phone and phone in phone_to_data and phone_to_data[phone]["name"]:
                updates["name"] = phone_to_data[phone]["name"]
                stats["names_filled"] += 1

        # Fill missing phone
        if not phone.strip() and email and email in email_to_data:
            if email_to_data[email]["phone"]:
                updates["phone"] = email_to_data[email]["phone"]
                stats["phones_filled"] += 1

        # Fill missing email
        if not email.strip() and phone and phone in phone_to_data:
            if phone_to_data[phone]["email"]:
                updates["email"] = phone_to_data[phone]["email"]
                stats["emails_filled"] += 1

        # Detect company from email domain
        if not company.strip() and email and "@" in email:
            detected_company = _detect_company_from_email(email)
            if detected_company:
                updates["company"] = detected_company
                stats["companies_detected"] += 1

        # Detect website from email domain
        if not website.strip() and email and "@" in email:
            detected_website = _detect_website_from_email(email)
            if detected_website:
                updates["website"] = detected_website
                stats["websites_detected"] += 1

        # Apply updates
        if updates:
            set_clauses = ", ".join(f"{k} = ?" for k in updates)
            values = list(updates.values()) + [lead_id]
            await db.execute(
                f"UPDATE leads SET {set_clauses} WHERE id = ?",
                values,
            )
            stats["total_enriched"] += 1

    await db.commit()
    return stats


# Common free email providers (not company domains)
FREE_EMAIL_PROVIDERS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
    "icloud.com", "mail.com", "protonmail.com", "zoho.com", "yandex.com",
    "live.com", "msn.com", "comcast.net", "verizon.net", "att.net",
    "gmx.com", "gmx.de", "web.de", "qq.com", "163.com", "126.com",
    "tutanota.com", "fastmail.com", "hushmail.com", "me.com",
    "mac.com", "inbox.com", "rediffmail.com",
}


def _detect_company_from_email(email: str) -> str:
    """Detect company name from email domain."""
    if not email or "@" not in email:
        return ""

    domain = email.split("@")[-1].lower()

    # Skip free email providers
    if domain in FREE_EMAIL_PROVIDERS:
        return ""

    # Extract company name from domain
    parts = domain.split(".")
    if len(parts) >= 2:
        company = parts[0]
        # Clean up common prefixes
        for prefix in ["info", "contact", "admin", "support", "hello", "team", "mail"]:
            if company == prefix and len(parts) > 2:
                company = parts[1]

        # Capitalize properly
        return company.replace("-", " ").replace("_", " ").title()

    return ""


def _detect_website_from_email(email: str) -> str:
    """Detect website URL from email domain."""
    if not email or "@" not in email:
        return ""

    domain = email.split("@")[-1].lower()

    # Skip free email providers
    if domain in FREE_EMAIL_PROVIDERS:
        return ""

    return f"https://{domain}"
