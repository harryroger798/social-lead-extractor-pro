"""Google Business Profile Claimed/Unclaimed Detection.

Searches Google for a business and analyzes the real listing data
to determine if the profile is claimed or unclaimed.
No manual checkboxes - auto-detects signals from Google search results.
"""
import logging
import re
import json
from urllib.parse import quote_plus

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


def _search_google_for_business(business_name: str, location: str = "") -> dict:
    """Search Google for a business and extract real GBP data.

    Uses Google search to find the Knowledge Panel / business info
    that appears when searching for a specific business name.
    Returns extracted business signals from the search results.
    """
    query = business_name
    if location:
        query = f"{business_name} {location}"

    data: dict = {
        "name": business_name,
        "found": False,
        "website": "",
        "phone": "",
        "hours": "",
        "description": "",
        "photos_count": 0,
        "review_count": 0,
        "rating": 0.0,
        "has_reviews": False,
        "address": "",
        "category": "",
    }

    # Strategy 1: Google search for Knowledge Panel data
    try:
        search_url = f"https://www.google.com/search?q={quote_plus(query)}"
        resp = requests.get(search_url, headers=_HEADERS, timeout=15)
        html = resp.text

        # Phone number
        phone_patterns = [
            re.compile(r'data-phone-number="([^"]+)"'),
            re.compile(r'"telephone"\s*:\s*"([^"]+)"'),
            re.compile(r'aria-label="[Cc]all[^"]*"[^>]*>([+\d\s\-().]{7,20})<'),
        ]
        for pat in phone_patterns:
            m = pat.search(html)
            if m:
                data["phone"] = m.group(1).strip()
                break

        # Website
        website_patterns = [
            re.compile(r'"url"\s*:\s*"(https?://(?!www\.google)[^"]+)"'),
            re.compile(r'data-url="(https?://(?!www\.google)[^"]+)"'),
        ]
        for pat in website_patterns:
            m = pat.search(html)
            if m:
                url_found = m.group(1)
                if "google.com" not in url_found and "gstatic.com" not in url_found:
                    data["website"] = url_found
                    break

        # Rating
        rating_patterns = [
            re.compile(r'"ratingValue"\s*:\s*"?([\d.]+)"?'),
            re.compile(r'(\d\.\d)\s*stars?', re.IGNORECASE),
        ]
        for pat in rating_patterns:
            m = pat.search(html)
            if m:
                try:
                    data["rating"] = float(m.group(1))
                except ValueError:
                    pass
                break

        # Review count
        review_patterns = [
            re.compile(r'"reviewCount"\s*:\s*"?(\d+)"?'),
            re.compile(r'(\d[\d,]*)\s*(?:Google\s+)?reviews?', re.IGNORECASE),
            re.compile(r'(\d[\d,]*)\s*ratings?', re.IGNORECASE),
        ]
        for pat in review_patterns:
            m = pat.search(html)
            if m:
                try:
                    data["review_count"] = int(m.group(1).replace(",", ""))
                    data["has_reviews"] = data["review_count"] > 0
                except ValueError:
                    pass
                break

        # Hours detection
        hours_pat = re.compile(r'(?:Open|Closed|Hours|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*[:\s]')
        if hours_pat.search(html):
            data["hours"] = "detected"

        # Description
        desc_pat = re.compile(r'"description"\s*:\s*"([^"]{20,})"')
        m = desc_pat.search(html)
        if m:
            data["description"] = m.group(1)[:200]

        # Category
        cat_patterns = [
            re.compile(r'"@type"\s*:\s*"(\w+Business[^"]*)"'),
            re.compile(r'"category"\s*:\s*"([^"]+)"'),
        ]
        for pat in cat_patterns:
            m = pat.search(html)
            if m:
                data["category"] = m.group(1)
                break

        if any([data["phone"], data["website"], data["rating"],
                data["review_count"], data["hours"], data["description"]]):
            data["found"] = True

        # JSON-LD structured data
        json_ld_pat = re.compile(
            r'<script type="application/ld\+json">(.*?)</script>', re.DOTALL
        )
        for block in json_ld_pat.findall(html):
            try:
                ld = json.loads(block)
                items = ld if isinstance(ld, list) else [ld]
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    item_type = str(item.get("@type", ""))
                    biz_types = (
                        "LocalBusiness", "Restaurant", "Store",
                        "Organization", "Place", "ProfessionalService",
                        "MedicalBusiness",
                    )
                    if item_type in biz_types or "Business" in item_type:
                        data["found"] = True
                        if not data["phone"] and item.get("telephone"):
                            data["phone"] = str(item["telephone"])
                        if not data["website"] and item.get("url"):
                            item_url = str(item["url"])
                            if "google.com" not in item_url:
                                data["website"] = item_url
                        if not data["description"] and item.get("description"):
                            data["description"] = str(item["description"])[:200]
                        agg = item.get("aggregateRating")
                        if isinstance(agg, dict):
                            if not data["rating"]:
                                try:
                                    data["rating"] = float(agg.get("ratingValue", 0))
                                except (ValueError, TypeError):
                                    pass
                            if not data["review_count"]:
                                try:
                                    data["review_count"] = int(agg.get("reviewCount", 0))
                                    data["has_reviews"] = data["review_count"] > 0
                                except (ValueError, TypeError):
                                    pass
                        addr = item.get("address", {})
                        if isinstance(addr, dict) and not data["address"]:
                            parts = [
                                addr.get("streetAddress", ""),
                                addr.get("addressLocality", ""),
                                addr.get("addressRegion", ""),
                            ]
                            data["address"] = ", ".join(p for p in parts if p)
            except (json.JSONDecodeError, TypeError):
                continue

    except Exception as e:
        logger.error("Google search for GBP data failed: %s", e)

    # Strategy 2: Direct Google Maps search if nothing found
    if not data["found"]:
        try:
            maps_url = f"https://www.google.com/maps/search/{quote_plus(query)}"
            resp = requests.get(maps_url, headers=_HEADERS, timeout=15)
            maps_html = resp.text
            if business_name.lower() in maps_html.lower():
                data["found"] = True
            if not data["phone"]:
                m = re.search(r'"(\+?\d[\d\s\-().]{6,18}\d)"', maps_html)
                if m:
                    candidate = m.group(1)
                    digits = re.sub(r'[^\d]', '', candidate)
                    if 7 <= len(digits) <= 15:
                        data["phone"] = candidate
        except Exception as e:
            logger.warning("Google Maps search failed: %s", e)

    return data


def detect_claimed_status(business_data: dict) -> dict:
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
    search_data = _search_google_for_business(name, location)

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


def batch_detect(businesses: list[dict]) -> list[dict]:
    """Detect claimed status for multiple businesses."""
    results = []
    for biz in businesses:
        detection = detect_claimed_status(biz)
        detection["business_name"] = biz.get("name", "")
        results.append(detection)
    return results
