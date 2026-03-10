"""Smart Keyword Enhancement — expand user keywords for better lead coverage.

Given a single keyword like "dentist", this module generates related search
variations that maximize lead discovery across all platforms:

  - Synonym expansion: "dentist" → "dental clinic", "orthodontist", "dental office"
  - Industry-aware modifiers: service businesses get "near me" + "phone",
    B2B gets "email" + "contact"
  - Location-aware: detects city names in keywords and optimizes queries
  - Platform-specific templates: LinkedIn gets "hiring", YouTube gets "channel"

Usage:
    from app.services.keyword_enhancer import enhance_keywords
    expanded = enhance_keywords(["dentist"], platforms=["linkedin", "instagram"])
    # Returns: ["dentist", "dental clinic", "dentist near me", ...]
"""

import logging
import re

logger = logging.getLogger(__name__)

# ─── Industry Synonym Map ───────────────────────────────────────────────────
# Maps common keywords to related terms that target the same audience.
# Each entry: keyword_pattern → list of synonyms/related terms
_SYNONYM_MAP: dict[str, list[str]] = {
    # Healthcare
    "dentist": ["dental clinic", "dental office", "orthodontist", "dental practice"],
    "doctor": ["physician", "medical practice", "healthcare clinic", "medical office"],
    "chiropractor": ["chiropractic clinic", "chiropractic office", "spine specialist"],
    "therapist": ["counselor", "therapy practice", "mental health clinic"],
    "veterinarian": ["vet clinic", "animal hospital", "pet clinic"],
    "optometrist": ["eye doctor", "eye clinic", "vision center"],
    "dermatologist": ["skin clinic", "dermatology practice", "skin care clinic"],
    "pediatrician": ["children doctor", "pediatric clinic", "kids doctor"],
    "surgeon": ["surgical center", "surgery clinic", "surgical practice"],
    "pharmacist": ["pharmacy", "drugstore", "compounding pharmacy"],

    # Home Services
    "plumber": ["plumbing company", "plumbing service", "drain specialist"],
    "electrician": ["electrical contractor", "electrical service", "wiring specialist"],
    "roofer": ["roofing company", "roofing contractor", "roof repair"],
    "painter": ["painting contractor", "house painter", "painting service"],
    "landscaper": ["landscaping company", "lawn care service", "garden maintenance"],
    "hvac": ["heating and cooling", "air conditioning service", "hvac contractor"],
    "locksmith": ["lock service", "key specialist", "security locksmith"],
    "pest control": ["exterminator", "pest management", "bug control"],
    "cleaner": ["cleaning service", "maid service", "janitorial service"],
    "handyman": ["home repair service", "maintenance service", "fix-it service"],
    "mover": ["moving company", "relocation service", "moving service"],
    "contractor": ["general contractor", "home builder", "construction company"],

    # Professional Services
    "lawyer": ["attorney", "law firm", "legal services"],
    "accountant": ["cpa", "accounting firm", "bookkeeper", "tax preparer"],
    "realtor": ["real estate agent", "property agent", "real estate broker"],
    "insurance": ["insurance agent", "insurance broker", "insurance company"],
    "financial advisor": ["financial planner", "wealth management", "investment advisor"],
    "consultant": ["consulting firm", "business consultant", "management consultant"],
    "architect": ["architecture firm", "building designer", "architectural services"],

    # Auto Services
    "mechanic": ["auto repair", "car mechanic", "auto service center"],
    "auto body": ["collision repair", "body shop", "paint and body"],
    "car dealer": ["auto dealership", "car sales", "vehicle dealer"],
    "towing": ["tow truck", "roadside assistance", "towing service"],

    # Food & Hospitality
    "restaurant": ["dining", "eatery", "food establishment"],
    "caterer": ["catering service", "catering company", "event catering"],
    "bakery": ["cake shop", "pastry shop", "bread bakery"],
    "bar": ["pub", "tavern", "cocktail lounge"],
    "hotel": ["lodging", "motel", "resort", "inn"],

    # Fitness & Beauty
    "gym": ["fitness center", "workout studio", "health club"],
    "personal trainer": ["fitness coach", "training studio", "fitness instructor"],
    "salon": ["hair salon", "beauty salon", "barber shop"],
    "spa": ["day spa", "massage therapy", "wellness center"],
    "yoga": ["yoga studio", "yoga instructor", "meditation center"],

    # Education
    "tutor": ["tutoring service", "learning center", "academic coach"],
    "driving school": ["driving instructor", "driving lessons", "driver education"],
    "daycare": ["childcare", "preschool", "child care center"],
    "music teacher": ["music lessons", "music school", "music instructor"],

    # Tech & Digital
    "web designer": ["web developer", "website design", "web development agency"],
    "seo": ["seo agency", "digital marketing", "search engine optimization"],
    "marketing agency": ["digital agency", "advertising agency", "marketing firm"],
    "photographer": ["photography studio", "photo service", "event photographer"],
    "videographer": ["video production", "videography service", "film production"],

    # Pet Services
    "dog walker": ["pet sitter", "dog sitting", "pet care"],
    "dog groomer": ["pet grooming", "dog grooming salon", "pet spa"],
    "dog trainer": ["pet training", "obedience training", "puppy training"],
}

# ─── Industry Category Detection ────────────────────────────────────────────
# Maps keywords to industry categories for smart modifier selection
_INDUSTRY_CATEGORIES: dict[str, str] = {
    # Healthcare
    "dentist": "healthcare", "doctor": "healthcare", "chiropractor": "healthcare",
    "therapist": "healthcare", "veterinarian": "healthcare", "optometrist": "healthcare",
    "dermatologist": "healthcare", "pediatrician": "healthcare", "surgeon": "healthcare",
    "pharmacist": "healthcare", "nurse": "healthcare",
    # Home Services
    "plumber": "home_services", "electrician": "home_services", "roofer": "home_services",
    "painter": "home_services", "landscaper": "home_services", "hvac": "home_services",
    "locksmith": "home_services", "pest control": "home_services", "cleaner": "home_services",
    "handyman": "home_services", "mover": "home_services", "contractor": "home_services",
    # Professional
    "lawyer": "professional", "accountant": "professional", "realtor": "professional",
    "insurance": "professional", "financial advisor": "professional",
    "consultant": "professional", "architect": "professional",
    # Auto
    "mechanic": "auto", "auto body": "auto", "car dealer": "auto", "towing": "auto",
    # Food
    "restaurant": "food", "caterer": "food", "bakery": "food", "bar": "food",
    "hotel": "hospitality",
    # Fitness/Beauty
    "gym": "fitness", "personal trainer": "fitness", "salon": "beauty",
    "spa": "beauty", "yoga": "fitness",
    # Education
    "tutor": "education", "driving school": "education", "daycare": "education",
    # Tech
    "web designer": "tech", "seo": "tech", "marketing agency": "tech",
    "photographer": "creative", "videographer": "creative",
}

# ─── Category-specific query modifiers ──────────────────────────────────────
_CATEGORY_MODIFIERS: dict[str, list[str]] = {
    "healthcare": ["office", "clinic", "practice", "appointment"],
    "home_services": ["near me", "licensed", "company", "service"],
    "professional": ["firm", "office", "services", "consulting"],
    "auto": ["shop", "center", "service", "repair"],
    "food": ["near me", "menu", "order", "reservation"],
    "hospitality": ["booking", "reservation", "rates"],
    "fitness": ["studio", "membership", "classes", "training"],
    "beauty": ["salon", "studio", "appointments", "booking"],
    "education": ["lessons", "classes", "academy", "school"],
    "tech": ["agency", "company", "services", "portfolio"],
    "creative": ["studio", "portfolio", "services", "booking"],
}

# ─── Common US cities for location detection ────────────────────────────────
_COMMON_CITIES = {
    "new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia",
    "san antonio", "san diego", "dallas", "san jose", "austin", "jacksonville",
    "fort worth", "columbus", "charlotte", "san francisco", "indianapolis",
    "seattle", "denver", "washington", "nashville", "oklahoma city", "el paso",
    "boston", "portland", "las vegas", "memphis", "louisville", "baltimore",
    "milwaukee", "albuquerque", "tucson", "fresno", "sacramento", "mesa",
    "kansas city", "atlanta", "omaha", "colorado springs", "raleigh", "miami",
    "long beach", "virginia beach", "oakland", "minneapolis", "tulsa", "tampa",
    "arlington", "new orleans", "orlando", "detroit", "pittsburgh", "cleveland",
    "st louis", "st. louis", "cincinnati", "riverside", "stockton",
    # States
    "california", "texas", "florida", "new york", "illinois", "pennsylvania",
    "ohio", "georgia", "north carolina", "michigan", "new jersey", "virginia",
    "washington", "arizona", "massachusetts", "tennessee", "indiana", "missouri",
    "maryland", "wisconsin", "colorado", "minnesota", "south carolina",
    "alabama", "louisiana", "kentucky", "oregon", "oklahoma", "connecticut",
    # UK/Canada/Australia
    "london", "manchester", "birmingham", "toronto", "vancouver", "montreal",
    "sydney", "melbourne", "brisbane", "perth",
}


def _detect_location(keyword: str) -> tuple[str, str | None]:
    """Detect if a keyword contains a location, return (base_keyword, location).

    Examples:
        "dentist in Miami" → ("dentist", "Miami")
        "plumber near Los Angeles" → ("plumber", "Los Angeles")
        "dentist" → ("dentist", None)
    """
    kw_stripped = keyword.strip()

    # Check for "in <city>" or "near <city>" patterns (case-insensitive)
    for pattern in [
        r"^(.+?)\s+in\s+(.+)$",
        r"^(.+?)\s+near\s+(.+)$",
        r"^(.+?)\s+around\s+(.+)$",
    ]:
        match = re.match(pattern, kw_stripped, re.IGNORECASE)
        if match:
            base = match.group(1).strip()
            location = match.group(2).strip()
            return base, location

    # Check if keyword ends with a known city/state
    kw_lower = kw_stripped.lower()
    for city in sorted(_COMMON_CITIES, key=len, reverse=True):
        if kw_lower.endswith(city) and len(kw_lower) > len(city) + 1:
            base = kw_stripped[: -len(city)].rstrip()
            location = kw_stripped[len(kw_stripped) - len(city):]
            return base, location

    return keyword, None


def _find_synonyms(base_keyword: str) -> list[str]:
    """Find synonyms for a base keyword from the synonym map."""
    kw_lower = base_keyword.lower().strip()
    # Exact match
    if kw_lower in _SYNONYM_MAP:
        return _SYNONYM_MAP[kw_lower]
    # Partial match (e.g. "dental" matches "dentist")
    for key, synonyms in _SYNONYM_MAP.items():
        if kw_lower in key or key in kw_lower:
            return synonyms
    return []


def _get_category(base_keyword: str) -> str | None:
    """Get the industry category for a keyword."""
    kw_lower = base_keyword.lower().strip()
    if kw_lower in _INDUSTRY_CATEGORIES:
        return _INDUSTRY_CATEGORIES[kw_lower]
    # Check partial matches
    for key, category in _INDUSTRY_CATEGORIES.items():
        if kw_lower in key or key in kw_lower:
            return category
    return None


def enhance_keywords(
    keywords: list[str],
    platforms: list[str] | None = None,
    max_expanded: int = 8,
    include_modifiers: bool = True,
) -> list[str]:
    """Expand user keywords into optimized search variations.

    Args:
        keywords: Original user keywords (e.g. ["dentist"])
        platforms: Target platforms for platform-specific optimization
        max_expanded: Max total keywords to return (prevents query explosion)
        include_modifiers: Whether to add industry-specific modifiers

    Returns:
        Expanded keyword list, original keywords always first
    """
    if not keywords:
        return []

    expanded: list[str] = []
    seen: set[str] = set()

    def _add(kw: str) -> None:
        kw_clean = kw.strip()
        if kw_clean and kw_clean.lower() not in seen:
            seen.add(kw_clean.lower())
            expanded.append(kw_clean)

    for keyword in keywords:
        # Always include original keyword first
        _add(keyword)

        # Detect location
        base_keyword, location = _detect_location(keyword)

        # Add synonyms
        synonyms = _find_synonyms(base_keyword)
        for syn in synonyms[:3]:  # Limit to top 3 synonyms
            if location:
                _add(f"{syn} in {location}")
            else:
                _add(syn)

        # Add industry-specific modifiers
        if include_modifiers:
            category = _get_category(base_keyword)
            if category and category in _CATEGORY_MODIFIERS:
                modifiers = _CATEGORY_MODIFIERS[category]
                # Pick the best modifier for the category
                best_modifier = modifiers[0]
                if location:
                    _add(f"{base_keyword} {best_modifier} {location}")
                else:
                    _add(f"{base_keyword} {best_modifier}")

        # Cap at max_expanded
        if len(expanded) >= max_expanded:
            break

    result = expanded[:max_expanded]
    logger.info(
        "Enhanced %d keywords → %d expanded: %s",
        len(keywords), len(result), result,
    )
    return result


def get_platform_query_hints(keyword: str, platform: str) -> list[str]:
    """Generate platform-specific query hints for a keyword.

    These are additional search terms optimized for specific platforms.
    Used by direct scrapers to build better DDG queries.

    Args:
        keyword: The search keyword
        platform: Target platform (linkedin, instagram, etc.)

    Returns:
        List of platform-optimized query strings
    """
    base, location = _detect_location(keyword)
    hints: list[str] = []

    if platform == "linkedin":
        hints.append(f"{base} professional")
        if location:
            hints.append(f"{base} {location}")
    elif platform == "instagram":
        hints.append(f"{base} business")
        hints.append(f"{base} contact email")
    elif platform == "facebook":
        hints.append(f"{base} business page")
        if location:
            hints.append(f"{base} {location} reviews")
    elif platform == "tiktok":
        hints.append(f"{base} tips")
        hints.append(f"{base} professional")
    elif platform == "youtube":
        hints.append(f"{base} channel")
        hints.append(f"{base} tips advice")

    return hints
