"""Google Business Profile Claimed/Unclaimed Detection.

Uses Serper.dev API (Knowledge Graph + organic results) to reliably
detect business signals. Falls back to Google Maps scraping if
Serper is not configured.

No manual checkboxes - auto-detects signals from real data.
"""
import logging
import re
import os
from urllib.parse import quote_plus
from typing import Optional

import requests

logger = logging.getLogger(__name__)

# Signals and their point values
CLAIMED_SIGNALS = {
    "has_website": 15,
    "has_phone": 10,
    "has_hours": 15,
    "has_description": 10,
    "has_photos_5plus": 15,
    "has_photos_1to4": 8,
    "has_reviews": 20,
    "high_rating_4plus": 5,
}

UNCLAIMED_SIGNALS = {
    "no_website": -15,
    "no_phone": -10,
    "no_hours": -15,
    "no_description": -10,
    "no_photos": -20,
    "no_reviews": -5,
}

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def _is_valid_phone(candidate: str) -> bool:
    """Validate that a string looks like a real phone number, not a date/ID."""
    if not candidate:
        return False
    digits = re.sub(r'[^\d]', '', candidate)
    if len(digits) < 7 or len(digits) > 15:
        return False
    if re.match(r'^20\d{6}$', digits):
        return False
    if re.match(r'^\d+\.\d+$', candidate.strip()):
        return False
    if not re.search(r'[+\-() ]', candidate) and not candidate.startswith('+'):
        if len(digits) < 10:
            return False
    return True


def _search_via_serper(business_name: str, location: str = "",
                       api_key: str = "") -> dict:
    """Search using Serper.dev API (Knowledge Graph + Places + organic)."""
    data: dict = {
        "name": business_name, "found": False, "website": "", "phone": "",
        "hours": "", "description": "", "photos_count": 0, "review_count": 0,
        "rating": 0.0, "has_reviews": False, "address": "", "category": "",
    }
    if not api_key:
        return data

    query = f"{business_name} {location}".strip() if location else business_name
    try:
        response = requests.post(
            "https://google.serper.dev/search",
            json={"q": query, "num": 10},
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            timeout=15,
        )
        if response.status_code != 200:
            logger.warning("Serper API returned status %d", response.status_code)
            return data
        result = response.json()

        # Extract from Knowledge Graph
        kg = result.get("knowledgeGraph", {})
        if kg:
            data["found"] = True
            data["name"] = kg.get("title", business_name)
            website = kg.get("website", "")
            if website and "google.com" not in website:
                data["website"] = website
            phone = kg.get("phone", "")
            if phone and _is_valid_phone(phone):
                data["phone"] = phone
            desc = kg.get("description", "")
            if desc:
                data["description"] = desc[:200]
            category = kg.get("type", "") or kg.get("category", "")
            if category:
                data["category"] = category
            rating = kg.get("rating")
            if rating:
                try:
                    data["rating"] = float(rating)
                except (ValueError, TypeError):
                    pass
            review_count = kg.get("ratingCount") or kg.get("reviewCount")
            if review_count:
                try:
                    data["review_count"] = int(str(review_count).replace(",", ""))
                    data["has_reviews"] = data["review_count"] > 0
                except (ValueError, TypeError):
                    pass
            hours = kg.get("hours", {})
            if hours:
                data["hours"] = "detected"
            address = kg.get("address", "")
            if address:
                data["address"] = address
            if kg.get("imageUrl") or kg.get("images"):
                images = kg.get("images", [])
                data["photos_count"] = max(len(images), 1)
            attributes = kg.get("attributes", {})
            if attributes and not data["hours"]:
                if any(k.lower() in ("hours", "service options") for k in attributes):
                    data["hours"] = "detected"

        # Check Places results (local pack)
        places = result.get("places", [])
        if places:
            place = places[0]
            if not data["found"]:
                data["found"] = True
                data["name"] = place.get("title", business_name)
            if not data["phone"]:
                phone = place.get("phone", "")
                if phone and _is_valid_phone(phone):
                    data["phone"] = phone
            if not data["address"]:
                data["address"] = place.get("address", "")
            if not data["rating"]:
                try:
                    data["rating"] = float(place.get("rating", 0))
                except (ValueError, TypeError):
                    pass
            if not data["review_count"]:
                try:
                    rc = place.get("ratingCount", 0) or place.get("reviews", 0)
                    data["review_count"] = int(str(rc).replace(",", ""))
                    data["has_reviews"] = data["review_count"] > 0
                except (ValueError, TypeError):
                    pass
            if not data["website"]:
                data["website"] = place.get("website", "")
            if not data["hours"] and place.get("hours"):
                data["hours"] = "detected"
            if not data["category"]:
                data["category"] = place.get("type", "")

        # Fallback: scan organic results
        if not data["found"]:
            for item in result.get("organic", []):
                title = item.get("title", "").lower()
                snippet = item.get("snippet", "").lower()
                link = item.get("link", "")
                if business_name.lower() in title or business_name.lower() in snippet:
                    data["found"] = True
                    if not data["phone"]:
                        pm = re.search(r'(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})', item.get("snippet", ""))
                        if pm and _is_valid_phone(pm.group(1)):
                            data["phone"] = pm.group(1)
                    if not data["website"] and link and "google.com" not in link:
                        data["website"] = link
                    if not data["description"]:
                        data["description"] = item.get("snippet", "")[:200]
                    break
    except Exception as e:
        logger.error("Serper API search for GBP data failed: %s", e)
    return data


def _search_google_for_business(business_name: str, location: str = "",
                                serper_api_key: str = "") -> dict:
    """Search Google for a business and extract real GBP data.

    Strategy:
    1. Serper API (PRIMARY - structured Knowledge Graph data)
    2. Google Maps direct scraping (FALLBACK - if Serper not available)
    """
    api_key = serper_api_key or os.environ.get("SERPER_API_KEY", "")
    if api_key:
        result = _search_via_serper(business_name, location, api_key)
        if result["found"]:
            return result

    # Fallback: Direct Google Maps search
    query = f"{business_name} {location}".strip() if location else business_name
    data: dict = {
        "name": business_name, "found": False, "website": "", "phone": "",
        "hours": "", "description": "", "photos_count": 0, "review_count": 0,
        "rating": 0.0, "has_reviews": False, "address": "", "category": "",
    }
    try:
        maps_url = f"https://www.google.com/maps/search/{quote_plus(query)}"
        resp = requests.get(maps_url, headers=_HEADERS, timeout=15)
        maps_html = resp.text
        if business_name.lower() in maps_html.lower():
            data["found"] = True
        if not data["phone"]:
            m = re.search(r'"(\+?\d[\d\s\-().]{6,18}\d)"', maps_html)
            if m and _is_valid_phone(m.group(1)):
                data["phone"] = m.group(1)
    except Exception as e:
        logger.warning("Google Maps search failed: %s", e)
    return data


def detect_claimed_status(business_data: dict,
                          serper_api_key: str = "") -> dict:
    """Analyze a business to determine claimed/unclaimed status.

    Auto-detect mode: Pass {"name": "Business Name", "location": "City"}
    and we search Google to find real signals automatically.
    No more manual checkboxes -- signals are detected from real data.
    """
    name = business_data.get("name", "").strip()
    if not name:
        return {
            "score": 0,
            "status": "error",
            "confidence": "none",
            "breakdown": [],
            "opportunity": False,
            "pitch": "Please enter a business name to detect.",
            "auto_detected": False,
            "search_data": {},
        }

    location = business_data.get("location", "")
    search_data = _search_google_for_business(name, location, serper_api_key)

    if search_data["found"]:
        return _score_business(search_data)

    # Business not found on Google -- strong unclaimed signal
    return {
        "score": 15,
        "status": "unclaimed",
        "confidence": "medium",
        "breakdown": [
            {"signal": "Business not found on Google", "points": -35, "present": False},
            {"signal": "No website detected", "points": -15, "present": False},
            {"signal": "No phone number detected", "points": -10, "present": False},
            {"signal": "No reviews found", "points": -5, "present": False},
        ],
        "opportunity": True,
        "pitch": _generate_pitch("unclaimed", business_data),
        "auto_detected": True,
        "search_data": {"name": name, "found": False},
    }


def _score_business(data: dict) -> dict:
    """Score a business based on real data found from Google search."""
    score = 50
    breakdown: list[dict] = []

    if data.get("website"):
        score += CLAIMED_SIGNALS["has_website"]
        breakdown.append({"signal": "Has website", "points": CLAIMED_SIGNALS["has_website"], "present": True})
    else:
        score += UNCLAIMED_SIGNALS["no_website"]
        breakdown.append({"signal": "No website detected", "points": UNCLAIMED_SIGNALS["no_website"], "present": False})

    if data.get("phone"):
        score += CLAIMED_SIGNALS["has_phone"]
        breakdown.append({"signal": "Has phone number", "points": CLAIMED_SIGNALS["has_phone"], "present": True})
    else:
        score += UNCLAIMED_SIGNALS["no_phone"]
        breakdown.append({"signal": "No phone number detected", "points": UNCLAIMED_SIGNALS["no_phone"], "present": False})

    if data.get("hours"):
        score += CLAIMED_SIGNALS["has_hours"]
        breakdown.append({"signal": "Has business hours", "points": CLAIMED_SIGNALS["has_hours"], "present": True})
    else:
        score += UNCLAIMED_SIGNALS["no_hours"]
        breakdown.append({"signal": "No business hours detected", "points": UNCLAIMED_SIGNALS["no_hours"], "present": False})

    if data.get("description"):
        score += CLAIMED_SIGNALS["has_description"]
        breakdown.append({"signal": "Has description", "points": CLAIMED_SIGNALS["has_description"], "present": True})
    else:
        score += UNCLAIMED_SIGNALS["no_description"]
        breakdown.append({"signal": "No description detected", "points": UNCLAIMED_SIGNALS["no_description"], "present": False})

    photos_count = data.get("photos_count", 0)
    if photos_count >= 5:
        score += CLAIMED_SIGNALS["has_photos_5plus"]
        breakdown.append({"signal": f"Has {photos_count}+ photos", "points": CLAIMED_SIGNALS["has_photos_5plus"], "present": True})
    elif photos_count >= 1:
        score += CLAIMED_SIGNALS["has_photos_1to4"]
        breakdown.append({"signal": f"Has {photos_count} photos", "points": CLAIMED_SIGNALS["has_photos_1to4"], "present": True})
    else:
        score += UNCLAIMED_SIGNALS["no_photos"]
        breakdown.append({"signal": "No photos detected", "points": UNCLAIMED_SIGNALS["no_photos"], "present": False})

    review_count = data.get("review_count", 0)
    if review_count > 0:
        score += CLAIMED_SIGNALS["has_reviews"]
        breakdown.append({"signal": f"Has {review_count} reviews", "points": CLAIMED_SIGNALS["has_reviews"], "present": True})
    else:
        score += UNCLAIMED_SIGNALS["no_reviews"]
        breakdown.append({"signal": "No reviews found", "points": UNCLAIMED_SIGNALS["no_reviews"], "present": False})

    rating = data.get("rating", 0)
    if rating and float(rating) >= 4.0:
        score += CLAIMED_SIGNALS["high_rating_4plus"]
        breakdown.append({"signal": f"High rating ({rating})", "points": CLAIMED_SIGNALS["high_rating_4plus"], "present": True})

    score = max(0, min(100, score))

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
        "pitch": _generate_pitch(status, data),
        "auto_detected": True,
        "search_data": {
            "name": data.get("name", ""),
            "found": data.get("found", False),
            "website": data.get("website", ""),
            "phone": data.get("phone", ""),
            "rating": data.get("rating", 0),
            "review_count": data.get("review_count", 0),
            "address": data.get("address", ""),
            "category": data.get("category", ""),
        },
    }


def _generate_pitch(status: str, data: dict) -> str:
    """Generate a sales pitch based on claimed status."""
    name = data.get("name", "this business")

    if status == "unclaimed":
        return (
            f"{name} has an unclaimed Google Business Profile. "
            f"This means they are missing out on local customers searching for their services. "
            f"You can offer to claim and optimize their listing -- this is an easy sell."
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


def batch_detect(businesses: list[dict],
                 serper_api_key: str = "") -> list[dict]:
    """Detect claimed status for multiple businesses."""
    results = []
    for biz in businesses:
        detection = detect_claimed_status(biz, serper_api_key=serper_api_key)
        detection["business_name"] = biz.get("name", "")
        results.append(detection)
    return results
