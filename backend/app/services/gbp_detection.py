"""Google Business Profile Claimed/Unclaimed Detection.
100% free — analyzes GBP data to determine if a listing is likely claimed or unclaimed.
"""
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# Signals that indicate a GBP listing is CLAIMED
CLAIMED_SIGNALS = {
    "has_website": 15,
    "has_phone": 10,
    "has_hours": 15,
    "has_description": 10,
    "has_photos_5plus": 15,
    "has_photos_1to4": 8,
    "has_reviews_responded": 20,
    "has_recent_posts": 15,
    "has_services_listed": 10,
    "has_menu_or_products": 10,
    "high_rating_4plus": 5,
    "has_email": 10,
}

# Signals that indicate a GBP listing is UNCLAIMED
UNCLAIMED_SIGNALS = {
    "no_website": -15,
    "no_phone": -10,
    "no_hours": -15,
    "no_description": -10,
    "no_photos": -20,
    "no_reviews": -5,
    "generic_description": -10,
    "outdated_info": -10,
}


def detect_claimed_status(business_data: dict) -> dict:
    """
    Analyze a business listing to determine claimed/unclaimed status.
    
    Accepts both formats:
    - Direct values: website, phone, hours, description, photos_count, etc.
    - Boolean flags: has_website, has_phone, has_hours, has_description, etc.
      (sent by the frontend GBP Detector UI)
    
    Returns dict with score, status, confidence, and breakdown.
    """
    score = 50  # Start neutral
    breakdown: list[dict] = []

    # Helper: check both "website" (value) and "has_website" (boolean flag)
    def _has(value_key: str, flag_key: str) -> bool:
        return bool(business_data.get(value_key)) or bool(business_data.get(flag_key))

    # Check claimed signals
    if _has("website", "has_website"):
        score += CLAIMED_SIGNALS["has_website"]
        breakdown.append({"signal": "Has website", "points": CLAIMED_SIGNALS["has_website"], "present": True})
    else:
        score += UNCLAIMED_SIGNALS["no_website"]
        breakdown.append({"signal": "No website", "points": UNCLAIMED_SIGNALS["no_website"], "present": False})

    if _has("phone", "has_phone"):
        score += CLAIMED_SIGNALS["has_phone"]
        breakdown.append({"signal": "Has phone number", "points": CLAIMED_SIGNALS["has_phone"], "present": True})
    else:
        score += UNCLAIMED_SIGNALS["no_phone"]
        breakdown.append({"signal": "No phone number", "points": UNCLAIMED_SIGNALS["no_phone"], "present": False})

    if _has("hours", "has_hours"):
        score += CLAIMED_SIGNALS["has_hours"]
        breakdown.append({"signal": "Has business hours", "points": CLAIMED_SIGNALS["has_hours"], "present": True})
    else:
        score += UNCLAIMED_SIGNALS["no_hours"]
        breakdown.append({"signal": "No business hours", "points": UNCLAIMED_SIGNALS["no_hours"], "present": False})

    if _has("description", "has_description"):
        desc = business_data.get("description", "")
        # If only a boolean flag was sent (no actual text), treat as having description
        if isinstance(desc, str) and len(desc) > 50:
            score += CLAIMED_SIGNALS["has_description"]
            breakdown.append({"signal": "Has detailed description", "points": CLAIMED_SIGNALS["has_description"], "present": True})
        elif business_data.get("has_description"):
            # Boolean flag from frontend — assume description exists
            score += CLAIMED_SIGNALS["has_description"]
            breakdown.append({"signal": "Has description", "points": CLAIMED_SIGNALS["has_description"], "present": True})
        else:
            score += UNCLAIMED_SIGNALS["generic_description"]
            breakdown.append({"signal": "Generic/short description", "points": UNCLAIMED_SIGNALS["generic_description"], "present": False})
    else:
        score += UNCLAIMED_SIGNALS["no_description"]
        breakdown.append({"signal": "No description", "points": UNCLAIMED_SIGNALS["no_description"], "present": False})

    # Photos: accept photos_count (int), photo_count (int), or has_photos (bool)
    photos_count = business_data.get("photos_count", 0) or business_data.get("photo_count", 0)
    if not photos_count and business_data.get("has_photos"):
        photos_count = 5  # Frontend flag means 5+ photos
    if photos_count >= 5:
        score += CLAIMED_SIGNALS["has_photos_5plus"]
        breakdown.append({"signal": f"Has {photos_count}+ photos", "points": CLAIMED_SIGNALS["has_photos_5plus"], "present": True})
    elif photos_count >= 1:
        score += CLAIMED_SIGNALS["has_photos_1to4"]
        breakdown.append({"signal": f"Has {photos_count} photos", "points": CLAIMED_SIGNALS["has_photos_1to4"], "present": True})
    else:
        score += UNCLAIMED_SIGNALS["no_photos"]
        breakdown.append({"signal": "No photos", "points": UNCLAIMED_SIGNALS["no_photos"], "present": False})

    # Reviews: accept has_reviews (bool) or reviews_responded
    if _has("reviews_responded", "has_reviews"):
        score += CLAIMED_SIGNALS["has_reviews_responded"]
        breakdown.append({"signal": "Has reviews", "points": CLAIMED_SIGNALS["has_reviews_responded"], "present": True})

    if business_data.get("recent_posts"):
        score += CLAIMED_SIGNALS["has_recent_posts"]
        breakdown.append({"signal": "Has recent Google posts", "points": CLAIMED_SIGNALS["has_recent_posts"], "present": True})

    if business_data.get("services"):
        score += CLAIMED_SIGNALS["has_services_listed"]
        breakdown.append({"signal": "Has services listed", "points": CLAIMED_SIGNALS["has_services_listed"], "present": True})

    if business_data.get("has_menu"):
        score += CLAIMED_SIGNALS["has_menu_or_products"]
        breakdown.append({"signal": "Has menu/products", "points": CLAIMED_SIGNALS["has_menu_or_products"], "present": True})

    rating = business_data.get("rating", 0)
    if rating and float(rating) >= 4.0:
        score += CLAIMED_SIGNALS["high_rating_4plus"]
        breakdown.append({"signal": f"High rating ({rating})", "points": CLAIMED_SIGNALS["high_rating_4plus"], "present": True})

    if _has("email", "has_email"):
        score += CLAIMED_SIGNALS["has_email"]
        breakdown.append({"signal": "Has email", "points": CLAIMED_SIGNALS["has_email"], "present": True})

    # Clamp score
    score = max(0, min(100, score))

    # Determine status
    if score >= 70:
        status = "claimed"
        confidence = "high" if score >= 85 else "medium"
    elif score >= 40:
        status = "likely_claimed"
        confidence = "low"
    else:
        status = "unclaimed"
        confidence = "high" if score <= 20 else "medium"

    return {
        "score": score,
        "status": status,
        "confidence": confidence,
        "breakdown": breakdown,
        "opportunity": status in ("unclaimed", "likely_claimed"),
        "pitch": _generate_pitch(status, business_data),
    }


def _generate_pitch(status: str, data: dict) -> str:
    """Generate a sales pitch based on claimed status."""
    name = data.get("name", "this business")

    if status == "unclaimed":
        return (
            f"{name} has an unclaimed Google Business Profile. "
            f"This means they're missing out on local customers searching for their services. "
            f"You can offer to claim and optimize their listing — this is an easy sell."
        )
    elif status == "likely_claimed":
        return (
            f"{name}'s Google Business Profile appears partially optimized. "
            f"There are several areas for improvement that could boost their visibility. "
            f"Offer a free GBP audit to demonstrate the gaps."
        )
    else:
        return (
            f"{name} has a well-maintained Google Business Profile. "
            f"Consider offering advanced services like review management, "
            f"Google Posts automation, or local SEO improvements."
        )


def batch_detect(businesses: list[dict]) -> list[dict]:
    """Detect claimed status for multiple businesses."""
    results = []
    for biz in businesses:
        detection = detect_claimed_status(biz)
        detection["business_name"] = biz.get("name", "")
        results.append(detection)
    return results
