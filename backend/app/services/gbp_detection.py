"""Google Business Profile Claimed/Unclaimed Detection.

Multi-source approach that works 100% without API keys:
1. Bing Search (PRIMARY - less aggressive blocking than Google)
2. DuckDuckGo Instant Answer API (SECONDARY - structured data)
3. Google Search + Maps (TERTIARY - may be blocked on server IPs)
4. Serper.dev API (OPTIONAL enhancement if user provides key)

No manual checkboxes - auto-detects signals from real data.
"""
import logging
import os
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


def _is_valid_phone(candidate: str) -> bool:
    """Validate that a string looks like a real phone number, not a date/ID."""
    if not candidate:
        return False
    digits = re.sub(r'[^\d]', '', candidate)
    if len(digits) < 7 or len(digits) > 15:
        return False
    # Reject dates like 20260305
    if re.match(r'^20\d{6}$', digits):
        return False
    # Reject floats like 20260305.0
    if re.match(r'^\d+\.\d+$', candidate.strip()):
        return False
    # Plain digit string needs at least 10 digits
    if not re.search(r'[+\-() ]', candidate) and not candidate.startswith('+'):
        if len(digits) < 10:
            return False
    return True


def _empty_data(business_name: str) -> dict:
    """Return an empty data template."""
    return {
        "name": business_name, "found": False, "website": "", "phone": "",
        "hours": "", "description": "", "photos_count": 0, "review_count": 0,
        "rating": 0.0, "has_reviews": False, "address": "", "category": "",
    }


def _merge_data(target: dict, source: dict) -> None:
    """Merge non-empty source fields into target (only fills gaps)."""
    if source.get("found"):
        target["found"] = True
    for key in ("website", "phone", "hours", "description", "address", "category"):
        if not target.get(key) and source.get(key):
            target[key] = source[key]
    for key in ("rating", "review_count", "photos_count"):
        if not target.get(key) and source.get(key):
            target[key] = source[key]
    if source.get("has_reviews") and not target.get("has_reviews"):
        target["has_reviews"] = True


# ─── Source 1: Bing Search (PRIMARY - no API key, reliable) ──────────────────

def _search_via_bing(business_name: str, location: str = "") -> dict:
    """Search Bing for business data. Bing is much less aggressive about
    blocking automated requests compared to Google."""
    data = _empty_data(business_name)
    query = f"{business_name} {location}".strip() if location else business_name

    try:
        resp = requests.get(
            f"https://www.bing.com/search?q={quote_plus(query)}",
            headers=_HEADERS, timeout=15,
        )
        html = resp.text

        # Phone number from Bing's Knowledge Panel
        phone_pats = [
            re.compile(r'Phone[^<]*<[^>]*>\s*([+\d()\s\-]{7,20})', re.IGNORECASE),
            re.compile(r'"telephone"\s*:\s*"([^"]+)"'),
            re.compile(r'data-phone="([^"]+)"'),
            re.compile(r'tel:\s*([+\d()\s\-]{7,20})'),
            re.compile(r'>\s*(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\s*<'),
        ]
        for pat in phone_pats:
            m = pat.search(html)
            if m and _is_valid_phone(m.group(1).strip()):
                data["phone"] = m.group(1).strip()
                break

        # Website
        website_pats = [
            re.compile(r'"url"\s*:\s*"(https?://(?!www\.bing)[^"]+)"'),
            re.compile(r'<a[^>]*href="(https?://(?!www\.bing|www\.microsoft|bing\.com)[^"]+)"[^>]*>\s*(?:Website|Official|Visit)', re.IGNORECASE),
        ]
        for pat in website_pats:
            m = pat.search(html)
            if m:
                url = m.group(1)
                skip = ("bing.com", "microsoft.com", "wikipedia.org", "yelp.com",
                        "facebook.com", "yellowpages.com")
                if not any(s in url for s in skip):
                    data["website"] = url
                    break

        # Rating
        rating_pats = [
            re.compile(r'"ratingValue"\s*:\s*"?([\d.]+)"?'),
            re.compile(r'(\d\.\d)\s*/\s*5', re.IGNORECASE),
            re.compile(r'(\d\.\d)\s*stars?', re.IGNORECASE),
        ]
        for pat in rating_pats:
            m = pat.search(html)
            if m:
                try:
                    val = float(m.group(1))
                    if 1.0 <= val <= 5.0:
                        data["rating"] = val
                except ValueError:
                    pass
                break

        # Review count
        review_pats = [
            re.compile(r'"reviewCount"\s*:\s*"?(\d+)"?'),
            re.compile(r'(\d[\d,]*)\s*(?:reviews?|ratings?)', re.IGNORECASE),
        ]
        for pat in review_pats:
            m = pat.search(html)
            if m:
                try:
                    data["review_count"] = int(m.group(1).replace(",", ""))
                    data["has_reviews"] = data["review_count"] > 0
                except ValueError:
                    pass
                break

        # Hours
        if re.search(r'(?:Open|Closed|Hours|Monday|Tuesday|Wednesday|Thursday|Friday)\s*[:\s·]', html, re.IGNORECASE):
            data["hours"] = "detected"

        # Description from Bing
        desc_pats = [
            re.compile(r'"description"\s*:\s*"([^"]{20,200})"'),
            re.compile(r'class="b_snippet"[^>]*>([^<]{20,200})<', re.IGNORECASE),
        ]
        for pat in desc_pats:
            m = pat.search(html)
            if m:
                data["description"] = m.group(1)[:200]
                break

        # Address
        addr_pats = [
            re.compile(r'"streetAddress"\s*:\s*"([^"]+)"'),
            re.compile(r'Address[^<]*<[^>]*>\s*([^<]{5,100})', re.IGNORECASE),
        ]
        for pat in addr_pats:
            m = pat.search(html)
            if m:
                data["address"] = m.group(1).strip()
                break

        # Category
        cat_pats = [
            re.compile(r'"@type"\s*:\s*"(\w+Business[^"]*)"'),
            re.compile(r'"category"\s*:\s*"([^"]+)"'),
        ]
        for pat in cat_pats:
            m = pat.search(html)
            if m:
                data["category"] = m.group(1)
                break

        # JSON-LD structured data from Bing
        for block in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL):
            try:
                ld = json.loads(block)
                items = ld if isinstance(ld, list) else [ld]
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    item_type = str(item.get("@type", ""))
                    if "Business" in item_type or item_type in ("Restaurant", "Store", "Organization", "Place"):
                        data["found"] = True
                        if not data["phone"] and item.get("telephone"):
                            ph = str(item["telephone"])
                            if _is_valid_phone(ph):
                                data["phone"] = ph
                        if not data["website"] and item.get("url"):
                            u = str(item["url"])
                            if "bing.com" not in u and "microsoft.com" not in u:
                                data["website"] = u
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
                            parts = [addr.get("streetAddress", ""), addr.get("addressLocality", ""), addr.get("addressRegion", "")]
                            data["address"] = ", ".join(p for p in parts if p)
            except (json.JSONDecodeError, TypeError):
                continue

        if any([data["phone"], data["website"], data["rating"], data["review_count"], data["hours"]]):
            data["found"] = True

    except Exception as e:
        logger.warning("Bing search for GBP data failed: %s", e)

    return data


# ─── Source 2: DuckDuckGo Instant Answer (no API key) ────────────────────────

def _search_via_duckduckgo(business_name: str, location: str = "") -> dict:
    """Use DuckDuckGo's Instant Answer API for business data."""
    data = _empty_data(business_name)
    query = f"{business_name} {location}".strip() if location else business_name

    try:
        resp = requests.get(
            "https://api.duckduckgo.com/",
            params={"q": query, "format": "json", "no_redirect": "1"},
            headers=_HEADERS, timeout=10,
        )
        result = resp.json()

        abstract = result.get("Abstract", "")
        abstract_url = result.get("AbstractURL", "")
        infobox = result.get("Infobox", {})

        if abstract:
            data["found"] = True
            data["description"] = abstract[:200]

        if abstract_url and "wikipedia" not in abstract_url.lower():
            data["website"] = abstract_url

        # Parse Infobox for structured business data
        if isinstance(infobox, dict):
            for item in infobox.get("content", []):
                label = str(item.get("label", "")).lower()
                value = str(item.get("value", ""))
                if "phone" in label and _is_valid_phone(value):
                    data["phone"] = value
                elif "website" in label or "url" in label:
                    if value.startswith("http"):
                        data["website"] = value
                elif "address" in label or "location" in label:
                    data["address"] = value
                elif "type" in label or "category" in label:
                    data["category"] = value

        # Parse related topics for additional signals
        for topic in result.get("RelatedTopics", []):
            text = topic.get("Text", "")
            if not data["phone"]:
                pm = re.search(r'(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})', text)
                if pm and _is_valid_phone(pm.group(1)):
                    data["phone"] = pm.group(1)

        if any([data["phone"], data["website"], data["description"]]):
            data["found"] = True

    except Exception as e:
        logger.warning("DuckDuckGo search failed: %s", e)

    return data


# ─── Source 3: Google Search + Maps (may be blocked on some IPs) ─────────────

def _search_via_google(business_name: str, location: str = "") -> dict:
    """Search Google for Knowledge Panel data. Works well from residential IPs
    (Electron app users) but may be blocked on server/datacenter IPs."""
    data = _empty_data(business_name)
    query = f"{business_name} {location}".strip() if location else business_name

    try:
        search_url = f"https://www.google.com/search?q={quote_plus(query)}"
        resp = requests.get(search_url, headers=_HEADERS, timeout=15)
        html = resp.text

        # Phone number
        phone_pats = [
            re.compile(r'data-phone-number="([^"]+)"'),
            re.compile(r'"telephone"\s*:\s*"([^"]+)"'),
            re.compile(r'aria-label="[Cc]all[^"]*"[^>]*>([+\d\s\-().]{7,20})<'),
        ]
        for pat in phone_pats:
            m = pat.search(html)
            if m and _is_valid_phone(m.group(1).strip()):
                data["phone"] = m.group(1).strip()
                break

        # Website
        website_pats = [
            re.compile(r'"url"\s*:\s*"(https?://(?!www\.google)[^"]+)"'),
            re.compile(r'data-url="(https?://(?!www\.google)[^"]+)"'),
        ]
        for pat in website_pats:
            m = pat.search(html)
            if m:
                url = m.group(1)
                if "google.com" not in url and "gstatic.com" not in url:
                    data["website"] = url
                    break

        # Rating
        for pat in [re.compile(r'"ratingValue"\s*:\s*"?([\d.]+)"?'), re.compile(r'(\d\.\d)\s*stars?', re.IGNORECASE)]:
            m = pat.search(html)
            if m:
                try:
                    val = float(m.group(1))
                    if 1.0 <= val <= 5.0:
                        data["rating"] = val
                except ValueError:
                    pass
                break

        # Review count
        for pat in [re.compile(r'"reviewCount"\s*:\s*"?(\d+)"?'), re.compile(r'(\d[\d,]*)\s*(?:Google\s+)?reviews?', re.IGNORECASE)]:
            m = pat.search(html)
            if m:
                try:
                    data["review_count"] = int(m.group(1).replace(",", ""))
                    data["has_reviews"] = data["review_count"] > 0
                except ValueError:
                    pass
                break

        # Hours
        if re.search(r'(?:Open|Closed|Hours|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*[:\s]', html):
            data["hours"] = "detected"

        # Description
        m = re.search(r'"description"\s*:\s*"([^"]{20,})"', html)
        if m:
            data["description"] = m.group(1)[:200]

        # Category
        for pat in [re.compile(r'"@type"\s*:\s*"(\w+Business[^"]*)"'), re.compile(r'"category"\s*:\s*"([^"]+)"')]:
            m = pat.search(html)
            if m:
                data["category"] = m.group(1)
                break

        if any([data["phone"], data["website"], data["rating"], data["review_count"], data["hours"], data["description"]]):
            data["found"] = True

        # JSON-LD structured data
        for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL):
            try:
                ld = json.loads(block)
                items = ld if isinstance(ld, list) else [ld]
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    item_type = str(item.get("@type", ""))
                    if "Business" in item_type or item_type in ("Restaurant", "Store", "Organization", "Place", "ProfessionalService"):
                        data["found"] = True
                        if not data["phone"] and item.get("telephone"):
                            ph = str(item["telephone"])
                            if _is_valid_phone(ph):
                                data["phone"] = ph
                        if not data["website"] and item.get("url"):
                            u = str(item["url"])
                            if "google.com" not in u:
                                data["website"] = u
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
                            parts = [addr.get("streetAddress", ""), addr.get("addressLocality", ""), addr.get("addressRegion", "")]
                            data["address"] = ", ".join(p for p in parts if p)
            except (json.JSONDecodeError, TypeError):
                continue

    except Exception as e:
        logger.warning("Google search for GBP data failed: %s", e)

    # Google Maps fallback
    if not data["found"]:
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


# ─── Source 4: Serper API (OPTIONAL - requires API key) ──────────────────────

def _search_via_serper(business_name: str, location: str = "",
                       api_key: str = "") -> dict:
    """Search using Serper.dev API (Knowledge Graph + Places). OPTIONAL."""
    data = _empty_data(business_name)
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
            return data
        result = response.json()

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
            cat = kg.get("type", "") or kg.get("category", "")
            if cat:
                data["category"] = cat
            if kg.get("rating"):
                try:
                    data["rating"] = float(kg["rating"])
                except (ValueError, TypeError):
                    pass
            rc = kg.get("ratingCount") or kg.get("reviewCount")
            if rc:
                try:
                    data["review_count"] = int(str(rc).replace(",", ""))
                    data["has_reviews"] = data["review_count"] > 0
                except (ValueError, TypeError):
                    pass
            if kg.get("hours"):
                data["hours"] = "detected"
            if kg.get("address"):
                data["address"] = kg["address"]
            if kg.get("imageUrl") or kg.get("images"):
                data["photos_count"] = max(len(kg.get("images", [])), 1)
            attrs = kg.get("attributes", {})
            if attrs and not data["hours"]:
                if any(k.lower() in ("hours", "service options") for k in attrs):
                    data["hours"] = "detected"

        places = result.get("places", [])
        if places:
            place = places[0]
            if not data["found"]:
                data["found"] = True
                data["name"] = place.get("title", business_name)
            if not data["phone"]:
                ph = place.get("phone", "")
                if ph and _is_valid_phone(ph):
                    data["phone"] = ph
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

    except Exception as e:
        logger.warning("Serper API search failed: %s", e)
    return data


# ─── Main search orchestrator ────────────────────────────────────────────────

def _search_google_for_business(business_name: str, location: str = "",
                                serper_api_key: str = "") -> dict:
    """Search for a business across multiple free sources.

    Priority (all work without API keys):
    1. Bing Search (PRIMARY - most reliable, least blocking)
    2. DuckDuckGo Instant Answer API (SECONDARY - structured data)
    3. Google Search + Maps (TERTIARY - works from residential IPs)
    4. Serper.dev API (OPTIONAL - only if user provides API key)
    """
    combined = _empty_data(business_name)

    # Source 1: Bing (PRIMARY - no API key needed)
    try:
        bing_data = _search_via_bing(business_name, location)
        _merge_data(combined, bing_data)
    except Exception as e:
        logger.warning("Bing source failed: %s", e)

    # Source 2: DuckDuckGo (SECONDARY - no API key needed)
    try:
        ddg_data = _search_via_duckduckgo(business_name, location)
        _merge_data(combined, ddg_data)
    except Exception as e:
        logger.warning("DDG source failed: %s", e)

    # Source 3: Google (TERTIARY - works from residential IPs)
    if not combined["found"] or not combined["phone"]:
        try:
            google_data = _search_via_google(business_name, location)
            _merge_data(combined, google_data)
        except Exception as e:
            logger.warning("Google source failed: %s", e)

    # Source 4: Serper API (OPTIONAL enhancement - only if key provided)
    api_key = serper_api_key or os.environ.get("SERPER_API_KEY", "")
    if api_key:
        try:
            serper_data = _search_via_serper(business_name, location, api_key)
            _merge_data(combined, serper_data)
        except Exception as e:
            logger.warning("Serper source failed: %s", e)

    return combined


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
