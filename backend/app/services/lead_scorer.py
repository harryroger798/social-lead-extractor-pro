"""Lead scoring service using rule-based scoring."""
import logging

logger = logging.getLogger(__name__)

# Scoring rules configuration
SCORING_RULES = {
    "has_verified_email": 30,
    "has_unverified_email": 15,
    "has_phone": 25,
    "has_website": 15,
    "has_name": 10,
    "has_company": 5,
    "has_linkedin": 10,
    "business_email": 15,
    "personal_email": 5,
    "multiple_contact_methods": 10,
    "email_bounced": -20,
}

# Score thresholds
SCORE_THRESHOLDS = {
    "hot": 80,    # 80-100: ready for outreach
    "warm": 50,   # 50-79: needs enrichment
    "cold": 0,    # 0-49: low quality
}


def calculate_lead_score(
    email: str = "",
    phone: str = "",
    name: str = "",
    website: str = "",
    company: str = "",
    linkedin_url: str = "",
    verified: bool = False,
    email_type: str = "unknown",
) -> int:
    """
    Calculate a quality score for a lead (0-100).
    Uses rule-based scoring — no ML, no external APIs, 100% free.
    """
    score = 0

    # Email scoring
    if email:
        if verified:
            score += SCORING_RULES["has_verified_email"]
        else:
            score += SCORING_RULES["has_unverified_email"]

        if email_type == "business":
            score += SCORING_RULES["business_email"]
        elif email_type == "personal":
            score += SCORING_RULES["personal_email"]

    # Phone scoring
    if phone and phone.strip():
        score += SCORING_RULES["has_phone"]

    # Name scoring
    if name and name.strip():
        score += SCORING_RULES["has_name"]

    # Website scoring
    if website and website.strip():
        score += SCORING_RULES["has_website"]

    # Company scoring
    if company and company.strip():
        score += SCORING_RULES["has_company"]

    # LinkedIn scoring
    if linkedin_url and linkedin_url.strip():
        score += SCORING_RULES["has_linkedin"]

    # Multiple contact methods bonus
    contact_methods = sum([
        1 if email else 0,
        1 if phone else 0,
        1 if website else 0,
    ])
    if contact_methods >= 2:
        score += SCORING_RULES["multiple_contact_methods"]

    return max(0, min(100, score))


def get_score_label(score: int) -> str:
    """Get a human-readable label for a score."""
    if score >= SCORE_THRESHOLDS["hot"]:
        return "hot"
    elif score >= SCORE_THRESHOLDS["warm"]:
        return "warm"
    else:
        return "cold"


def get_scoring_breakdown(
    email: str = "",
    phone: str = "",
    name: str = "",
    website: str = "",
    company: str = "",
    linkedin_url: str = "",
    verified: bool = False,
    email_type: str = "unknown",
) -> list[dict]:
    """Get a detailed breakdown of the scoring for a lead."""
    breakdown = []

    if email:
        if verified:
            breakdown.append({"rule": "Verified email", "points": SCORING_RULES["has_verified_email"]})
        else:
            breakdown.append({"rule": "Has email (unverified)", "points": SCORING_RULES["has_unverified_email"]})
        if email_type == "business":
            breakdown.append({"rule": "Business email domain", "points": SCORING_RULES["business_email"]})
        elif email_type == "personal":
            breakdown.append({"rule": "Personal email", "points": SCORING_RULES["personal_email"]})

    if phone and phone.strip():
        breakdown.append({"rule": "Has phone number", "points": SCORING_RULES["has_phone"]})

    if name and name.strip():
        breakdown.append({"rule": "Has name", "points": SCORING_RULES["has_name"]})

    if website and website.strip():
        breakdown.append({"rule": "Has website", "points": SCORING_RULES["has_website"]})

    if company and company.strip():
        breakdown.append({"rule": "Has company", "points": SCORING_RULES["has_company"]})

    if linkedin_url and linkedin_url.strip():
        breakdown.append({"rule": "Has LinkedIn profile", "points": SCORING_RULES["has_linkedin"]})

    contact_methods = sum([1 if email else 0, 1 if phone else 0, 1 if website else 0])
    if contact_methods >= 2:
        breakdown.append({"rule": "Multiple contact methods", "points": SCORING_RULES["multiple_contact_methods"]})

    return breakdown
