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
    
    business_data should contain:
    - name, website, phone, hours, description, photos_count,
      reviews_count, reviews_responded, recent_posts, services,
      rating, email, has_menu
    
    Returns dict with score, status, confidence, and breakdown.
    """
    score = 50  # Start neutral
    breakdown: list[dict] = []

    # Check claimed signals
    if business_data.get("website"):
        score += CLAIMED_SIGNALS["has_website"]
        breakdown.append({"signal": "Has website", "points": CLAIMED_SIGNALS["has_website"], "type": "claimed"})
    else:
        score += UNCLAIMED_SIGNALS["no_website"]
        breakdown.append({"signal": "No website", "points": UNCLAIMED_SIGNALS["no_website"], "type": "unclaimed"})

    if business_data.get("phone"):
        score += CLAIMED_SIGNALS["has_phone"]
        breakdown.append({"signal": "Has phone number", "points": CLAIMED_SIGNALS["has_phone"], "type": "claimed"})
    else:
        score += UNCLAIMED_SIGNALS["no_phone"]
        breakdown.append({"signal": "No phone number", "points": UNCLAIMED_SIGNALS["no_phone"], "type": "unclaimed"})

    if business_data.get("hours"):
        score += CLAIMED_SIGNALS["has_hours"]
        breakdown.append({"signal": "Has business hours", "points": CLAIMED_SIGNALS["has_hours"], "type": "claimed"})
    else:
        score += UNCLAIMED_SIGNALS["no_hours"]
        breakdown.append({"signal": "No business hours", "points": UNCLAIMED_SIGNALS["no_hours"], "type": "unclaimed"})

    if business_data.get("description"):
        desc = business_data["description"]
        if len(desc) > 50:
            score += CLAIMED_SIGNALS["has_description"]
            breakdown.append({"signal": "Has detailed description", "points": CLAIMED_SIGNALS["has_description"], "type": "claimed"})
        else:
            score += UNCLAIMED_SIGNALS["generic_description"]
            breakdown.append({"signal": "Generic/short description", "points": UNCLAIMED_SIGNALS["generic_description"], "type": "unclaimed"})
    else:
        score += UNCLAIMED_SIGNALS["no_description"]
        breakdown.append({"signal": "No description", "points": UNCLAIMED_SIGNALS["no_description"], "type": "unclaimed"})

    photos_count = business_data.get("photos_count", 0)
    if photos_count >= 5:
        score += CLAIMED_SIGNALS["has_photos_5plus"]
        breakdown.append({"signal": f"Has {photos_count} photos", "points": CLAIMED_SIGNALS["has_photos_5plus"], "type": "claimed"})
    elif photos_count >= 1:
        score += CLAIMED_SIGNALS["has_photos_1to4"]
        breakdown.append({"signal": f"Has {photos_count} photos", "points": CLAIMED_SIGNALS["has_photos_1to4"], "type": "claimed"})
    else:
        score += UNCLAIMED_SIGNALS["no_photos"]
        breakdown.append({"signal": "No photos", "points": UNCLAIMED_SIGNALS["no_photos"], "type": "unclaimed"})

    if business_data.get("reviews_responded"):
        score += CLAIMED_SIGNALS["has_reviews_responded"]
        breakdown.append({"signal": "Owner responds to reviews", "points": CLAIMED_SIGNALS["has_reviews_responded"], "type": "claimed"})

    if business_data.get("recent_posts"):
        score += CLAIMED_SIGNALS["has_recent_posts"]
        breakdown.append({"signal": "Has recent Google posts", "points": CLAIMED_SIGNALS["has_recent_posts"], "type": "claimed"})

    if business_data.get("services"):
        score += CLAIMED_SIGNALS["has_services_listed"]
        breakdown.append({"signal": "Has services listed", "points": CLAIMED_SIGNALS["has_services_listed"], "type": "claimed"})

    if business_data.get("has_menu"):
        score += CLAIMED_SIGNALS["has_menu_or_products"]
        breakdown.append({"signal": "Has menu/products", "points": CLAIMED_SIGNALS["has_menu_or_products"], "type": "claimed"})

    rating = business_data.get("rating", 0)
    if rating and float(rating) >= 4.0:
        score += CLAIMED_SIGNALS["high_rating_4plus"]
        breakdown.append({"signal": f"High rating ({rating})", "points": CLAIMED_SIGNALS["high_rating_4plus"], "type": "claimed"})

    if business_data.get("email"):
        score += CLAIMED_SIGNALS["has_email"]
        breakdown.append({"signal": "Has email", "points": CLAIMED_SIGNALS["has_email"], "type": "claimed"})

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
