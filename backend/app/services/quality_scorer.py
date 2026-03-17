"""Lead quality scoring system (0-100).

Scores leads based on data completeness, source reliability,
and contact information quality. Used to rank and prioritize leads.

v3.5.39: Enhanced with DNS confidence signals (SPF/DMARC/BIMI),
catch-all provider trust scoring, SMTP verification boost,
and deduplication-aware batch scoring.

Score breakdown:
  - Email present:           +25 points
  - Business email:          +10 bonus
  - Phone present:           +20 points
  - Name present:            +15 points
  - Profile URL present:     +10 points
  - Location present:        +5 points
  - Platform reliability:    +5-15 points
  - Verified email:          +10 bonus
  - DNS confidence (v3.5.39): +0-15 bonus (SPF/DMARC/BIMI)
  - Catch-all trusted (v3.5.39): +5 bonus
  - SMTP verified (v3.5.39): +5 bonus
  - LinkedIn profile (v3.5.39): +5 bonus
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

# Personal email domains (lower quality than business)
_PERSONAL_DOMAINS = {
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
    "aol.com", "icloud.com", "mail.com", "protonmail.com",
    "zoho.com", "yandex.com", "gmx.com", "live.com",
    "msn.com", "me.com", "inbox.com", "fastmail.com",
    "tutanota.com", "pm.me", "cock.li",
    "yahoo.co.in", "yahoo.co.uk", "outlook.in",
    "rediffmail.com", "sify.com",
}

# Disposable/temp email domains (very low quality)
_DISPOSABLE_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "tempmail.com",
    "throwaway.email", "10minutemail.com", "trashmail.com",
    "yopmail.com", "dispostable.com", "maildrop.cc",
    "sharklasers.com", "guerrillamailblock.com",
}

# Platform reliability tiers
_PLATFORM_SCORES: dict[str, int] = {
    "linkedin": 15,      # Most reliable for B2B
    "google_maps": 12,   # Verified business listings
    "facebook": 10,      # Business pages have good contact info
    "instagram": 8,      # Bio links often useful
    "youtube": 8,        # Channel about pages
    "twitter": 7,        # Bios sometimes have contact
    "pinterest": 5,      # Lower quality contacts
    "reddit": 5,         # Community-sourced
    "tumblr": 4,         # Blog platform
    "tiktok": 4,         # Limited contact info
    "telegram": 6,       # Group/channel links
    "whatsapp": 6,       # Business contacts
    "email": 10,         # Direct email finder
    "directories": 12,   # YellowPages/Yelp structured
    "job_boards": 8,     # Indeed/RemoteOK
}


@dataclass
class ScoreBreakdown:
    """Detailed breakdown of a lead's quality score."""
    total: int
    email_score: int
    phone_score: int
    name_score: int
    url_score: int
    location_score: int
    platform_score: int
    verified_bonus: int
    dns_bonus: int = 0
    smtp_bonus: int = 0
    catch_all_bonus: int = 0
    linkedin_bonus: int = 0
    details: list[str] = field(default_factory=list)


def score_lead_quality(
    email: str = "",
    phone: str = "",
    name: str = "",
    platform: str = "",
    source_url: str = "",
    location: str = "",
    verified: bool = False,
    extra_fields: dict[str, str] | None = None,
    dns_confidence: int = 0,
    smtp_verified: bool = False,
    catch_all_trustworthy: bool = False,
    has_linkedin: bool = False,
) -> ScoreBreakdown:
    """Score a lead from 0-100 based on data quality and completeness.

    v3.5.39: Enhanced with DNS confidence signals, SMTP verification,
    catch-all provider trust, and LinkedIn profile presence.

    Returns a ScoreBreakdown with total score and per-field breakdown.
    """
    details: list[str] = []
    email_score = 0
    phone_score = 0
    name_score = 0
    url_score = 0
    location_score = 0
    platform_score = 0
    verified_bonus = 0

    # --- Email scoring ---
    if email and "@" in email:
        email_score = 25
        details.append("Email: +25")

        domain = email.split("@")[-1].lower()
        if domain in _DISPOSABLE_DOMAINS:
            email_score -= 15
            details.append("Disposable email: -15")
        elif domain not in _PERSONAL_DOMAINS:
            email_score += 10
            details.append("Business email: +10")

    # --- Phone scoring ---
    if phone:
        cleaned = re.sub(r"[^\d+]", "", phone)
        if len(cleaned) >= 7:
            phone_score = 20
            details.append("Phone: +20")

    # --- Name scoring ---
    if name and name.strip() and len(name.strip()) > 1:
        name_score = 15
        details.append("Name: +15")
        # Bonus for full name (first + last)
        if " " in name.strip():
            name_score += 3
            details.append("Full name bonus: +3")

    # --- URL scoring ---
    if source_url and source_url.startswith("http"):
        url_score = 10
        details.append("Profile URL: +10")

    # --- Location scoring ---
    if location and location.strip():
        location_score = 5
        details.append("Location: +5")

    # --- Platform reliability ---
    if platform:
        platform_score = _PLATFORM_SCORES.get(platform.lower(), 3)
        details.append(f"Platform ({platform}): +{platform_score}")

    # --- Verified bonus ---
    if verified:
        verified_bonus = 10
        details.append("Verified: +10")

    # --- Extra fields bonus (company, title, etc.) ---
    if extra_fields:
        if extra_fields.get("company"):
            email_score += 2
            details.append("Company: +2")
        if extra_fields.get("title") or extra_fields.get("job_title"):
            email_score += 2
            details.append("Job title: +2")

    # --- v3.5.39: DNS confidence bonus (SPF/DMARC/BIMI) ---
    dns_bonus = 0
    if dns_confidence > 0 and email:
        dns_bonus = min(dns_confidence, 15)
        details.append(f"DNS confidence: +{dns_bonus}")

    # --- v3.5.39: SMTP verified bonus ---
    smtp_bonus = 0
    if smtp_verified and email:
        smtp_bonus = 5
        details.append("SMTP verified: +5")

    # --- v3.5.39: Catch-all trusted provider bonus ---
    catch_all_bonus = 0
    if catch_all_trustworthy and email:
        catch_all_bonus = 5
        details.append("Catch-all trusted provider: +5")

    # --- v3.5.39: LinkedIn profile bonus ---
    linkedin_bonus = 0
    if has_linkedin:
        linkedin_bonus = 5
        details.append("LinkedIn profile: +5")

    total = min(
        email_score + phone_score + name_score + url_score
        + location_score + platform_score + verified_bonus
        + dns_bonus + smtp_bonus + catch_all_bonus + linkedin_bonus,
        100,
    )

    return ScoreBreakdown(
        total=total,
        email_score=email_score,
        phone_score=phone_score,
        name_score=name_score,
        url_score=url_score,
        location_score=location_score,
        platform_score=platform_score,
        verified_bonus=verified_bonus,
        dns_bonus=dns_bonus,
        smtp_bonus=smtp_bonus,
        catch_all_bonus=catch_all_bonus,
        linkedin_bonus=linkedin_bonus,
        details=details,
    )


def score_lead_simple(
    email: str = "",
    phone: str = "",
    name: str = "",
    verified: bool = False,
) -> int:
    """Quick score for backward compatibility with existing score_lead()."""
    breakdown = score_lead_quality(
        email=email, phone=phone, name=name, verified=verified,
    )
    return breakdown.total


def batch_score_leads(leads: list[dict]) -> list[dict]:
    """Score a batch of leads and add quality_score field.

    v3.5.39: Enhanced to pass DNS confidence and SMTP verification
    data through to the scorer when available.
    """
    for lead in leads:
        dns_conf = lead.get("dns_confidence", {})
        dns_boost = dns_conf.get("confidence_boost", 0) if isinstance(dns_conf, dict) else 0

        breakdown = score_lead_quality(
            email=lead.get("email", ""),
            phone=lead.get("phone", ""),
            name=lead.get("name", ""),
            platform=lead.get("platform", ""),
            source_url=lead.get("source_url", ""),
            location=lead.get("location", ""),
            verified=lead.get("verified", False),
            dns_confidence=dns_boost,
            smtp_verified=lead.get("smtp_verified", False),
            catch_all_trustworthy=lead.get("catch_all_trustworthy", False),
            has_linkedin=bool(lead.get("linkedin_url", "")),
        )
        lead["quality_score"] = breakdown.total
        lead["quality_details"] = breakdown.details
    return leads


def batch_score_and_dedup(leads: list[dict]) -> tuple[list[dict], int]:
    """v3.5.39: Score and deduplicate leads in one pass.

    Combines quality scoring with hash-based deduplication.
    Returns (scored_unique_leads, duplicates_removed_count).
    """
    from app.services.duplicate_detector import compute_lead_hash

    seen_hashes: set[str] = set()
    unique: list[dict] = []
    dupes = 0

    for lead in leads:
        lead_hash = compute_lead_hash(
            lead.get("email", ""),
            lead.get("phone", ""),
            lead.get("name", ""),
        )
        if lead_hash in seen_hashes:
            dupes += 1
            continue
        seen_hashes.add(lead_hash)
        lead["lead_hash"] = lead_hash
        unique.append(lead)

    scored = batch_score_leads(unique)
    scored.sort(key=lambda x: x.get("quality_score", 0), reverse=True)
    return scored, dupes
