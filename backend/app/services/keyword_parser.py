"""Smart keyword parser with Hinglish support and location extraction.

Handles natural language queries like:
  - "Startups in India"           -> keyword="Startups", location="India"
  - "restaurants mere samne"      -> keyword="restaurants", location="near me"
  - "daktar dilli mein"           -> keyword="doctor", location="Delhi"
  - "cafes near Bangalore"        -> keyword="cafes", location="Bangalore"
  - "AI companies around Mumbai"  -> keyword="AI companies", location="Mumbai"
  - "best plumber in my area"     -> keyword="plumber", location=""

Also normalizes keywords for better database/search matching.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Hinglish -> English mappings (80+ entries)
# ---------------------------------------------------------------------------

HINGLISH_MAP: dict[str, str] = {
    # --- Professions / occupations ---
    "daktar": "doctor",
    "doctor": "doctor",
    "doktar": "doctor",
    "vaid": "doctor",
    "hakim": "doctor",
    "vakeel": "lawyer",
    "vakil": "lawyer",
    "waqeel": "lawyer",
    "adhivakta": "lawyer",
    "teacher": "teacher",
    "adhyapak": "teacher",
    "shikshak": "teacher",
    "mastar": "teacher",
    "masterji": "teacher",
    "injiniyar": "engineer",
    "engineer": "engineer",
    "karigar": "mechanic",
    "mistri": "mechanic",
    "plumber": "plumber",
    "nalbandh": "plumber",
    "bijli wala": "electrician",
    "electrician": "electrician",
    "darzi": "tailor",
    "tailor": "tailor",
    "halwai": "confectioner",
    "baniya": "shopkeeper",
    "dukandar": "shopkeeper",
    "kisan": "farmer",
    "kisaan": "farmer",
    "driver": "driver",
    "chauffeur": "driver",
    "architect": "architect",
    "vaastukar": "architect",
    "chartered accountant": "chartered accountant",
    "ca": "chartered accountant",
    "dentist": "dentist",
    "dant ka doctor": "dentist",
    # --- Business types ---
    "dukaan": "shop",
    "shop": "shop",
    "restaurant": "restaurant",
    "restro": "restaurant",
    "dhaba": "restaurant",
    "hotel": "hotel",
    "otel": "hotel",
    "guest house": "guest house",
    "guesthouse": "guest house",
    "salon": "salon",
    "parlour": "salon",
    "parlor": "salon",
    "gym": "gym",
    "akhada": "gym",
    "hospital": "hospital",
    "aspatal": "hospital",
    "dawakhana": "clinic",
    "clinic": "clinic",
    "school": "school",
    "vidyalaya": "school",
    "pathshala": "school",
    "college": "college",
    "mahavidyalaya": "college",
    "university": "university",
    "vishwavidyalaya": "university",
    "bank": "bank",
    "pharmacy": "pharmacy",
    "chemist": "pharmacy",
    "dawai ki dukaan": "pharmacy",
    "medical store": "pharmacy",
    "kirana": "grocery store",
    "kirana store": "grocery store",
    "grocery": "grocery store",
    "sabzi mandi": "vegetable market",
    "mandi": "market",
    "bazaar": "market",
    "bazar": "market",
    "market": "market",
    "showroom": "showroom",
    "agency": "agency",
    "company": "company",
    "startup": "startup",
    "factory": "factory",
    "karkhana": "factory",
    "godown": "warehouse",
    "warehouse": "warehouse",
    "office": "office",
    "daftar": "office",
    # --- Services ---
    "pest control": "pest control",
    "cleaning service": "cleaning service",
    "safai": "cleaning service",
    "packers movers": "packers and movers",
    "packers and movers": "packers and movers",
    "courier": "courier service",
    "delivery": "delivery service",
    "catering": "catering",
    "tent house": "event management",
    "wedding planner": "wedding planner",
    "photographer": "photographer",
    "photo studio": "photo studio",
    "printing press": "printing",
    "cyber cafe": "internet cafe",
    "travel agent": "travel agent",
    "tour operator": "tour operator",
    # --- Real estate ---
    "flat": "apartment",
    "apartment": "apartment",
    "makan": "house",
    "ghar": "house",
    "house": "house",
    "plot": "land",
    "zameen": "land",
    "property dealer": "real estate agent",
    "broker": "real estate agent",
    "builder": "construction company",
    "thekedar": "contractor",
    "contractor": "contractor",
}

# ---------------------------------------------------------------------------
# Hinglish location words and prepositions
# ---------------------------------------------------------------------------

HINGLISH_LOCATION_PREPS: dict[str, str] = {
    "mein": "in",
    # R2-16/R2-20 fix: removed "me": "in" — too ambiguous with English pronoun
    # ("hire me", "contact me", "near me" etc.). Keep "mein" and "mai" only.
    "mai": "in",
    "main": "in",
    "ke paas": "near",
    "ke pass": "near",
    "k paas": "near",
    "ke nazdeek": "near",
    "ke nazdik": "near",
    "ke aas paas": "around",
    "ke aaspaas": "around",
    "ke samne": "in front of",
    "mere samne": "near me",
    "mere paas": "near me",
    "mere pass": "near me",
    "mere nazdik": "near me",
    "yahan": "here",
    "yahaan": "here",
    "wahan": "there",
    "wahaan": "there",
    "ke andar": "in",
}

# Location prepositions in English
_ENGLISH_PREPS = re.compile(
    r'\b(?:in|near|around|from|by|at|close\s+to|next\s+to|within)\b',
    re.IGNORECASE,
)

# City/region aliases for India (most common)
CITY_ALIASES: dict[str, str] = {
    "dilli": "Delhi",
    "delhi": "Delhi",
    "new delhi": "Delhi",
    "mumbai": "Mumbai",
    "bombay": "Mumbai",
    "kolkata": "Kolkata",
    "calcutta": "Kolkata",
    "chennai": "Chennai",
    "madras": "Chennai",
    "bengaluru": "Bangalore",
    "bangalore": "Bangalore",
    "bangaluru": "Bangalore",
    "hyderabad": "Hyderabad",
    "hyd": "Hyderabad",
    "pune": "Pune",
    "poona": "Pune",
    "ahmedabad": "Ahmedabad",
    "amdavad": "Ahmedabad",
    "jaipur": "Jaipur",
    "lucknow": "Lucknow",
    "lakhnau": "Lucknow",
    "kanpur": "Kanpur",
    "nagpur": "Nagpur",
    "indore": "Indore",
    "bhopal": "Bhopal",
    "patna": "Patna",
    "vadodara": "Vadodara",
    "baroda": "Vadodara",
    "goa": "Goa",
    "surat": "Surat",
    "kochi": "Kochi",
    "cochin": "Kochi",
    "chandigarh": "Chandigarh",
    "gurgaon": "Gurugram",
    "gurugram": "Gurugram",
    "noida": "Noida",
    "ghaziabad": "Ghaziabad",
    "faridabad": "Faridabad",
    "thiruvananthapuram": "Thiruvananthapuram",
    "trivandrum": "Thiruvananthapuram",
    "visakhapatnam": "Visakhapatnam",
    "vizag": "Visakhapatnam",
    "coimbatore": "Coimbatore",
    "ludhiana": "Ludhiana",
    "agra": "Agra",
    "varanasi": "Varanasi",
    "banaras": "Varanasi",
    "kashi": "Varanasi",
    "meerut": "Meerut",
    "rajkot": "Rajkot",
    "amritsar": "Amritsar",
    "ranchi": "Ranchi",
    "allahabad": "Prayagraj",
    "prayagraj": "Prayagraj",
    # Countries
    "india": "India",
    "bharat": "India",
    "hindustan": "India",
    "usa": "United States",
    "us": "United States",
    "america": "United States",
    "uk": "United Kingdom",
    "england": "United Kingdom",
    "canada": "Canada",
    "australia": "Australia",
    "germany": "Germany",
    "france": "France",
    "japan": "Japan",
    "china": "China",
    "brazil": "Brazil",
    "singapore": "Singapore",
    "dubai": "Dubai",
    "uae": "United Arab Emirates",
    "saudi": "Saudi Arabia",
    "pakistan": "Pakistan",
    "bangladesh": "Bangladesh",
    "nepal": "Nepal",
    "sri lanka": "Sri Lanka",
}


# ---------------------------------------------------------------------------
# Parsed result
# ---------------------------------------------------------------------------

@dataclass
class ParsedKeyword:
    """Result of parsing a user query."""
    original: str
    keyword: str           # Cleaned/translated keyword for search
    location: str          # Extracted location (empty if none)
    country: str           # Resolved country (empty if none)
    is_hinglish: bool      # Whether Hinglish was detected
    search_queries: list[str]  # Generated search query variations


# ---------------------------------------------------------------------------
# Main parser
# ---------------------------------------------------------------------------

def parse_keyword(raw_input: str) -> ParsedKeyword:
    """Parse a user's search input into structured keyword + location.

    Handles:
    - English: "Startups in India", "cafes near Delhi"
    - Hinglish: "daktar dilli mein", "restaurants mere samne"
    - Mixed: "best plumber mere paas"
    """
    original = raw_input.strip()
    text = original.lower().strip()
    is_hinglish = False
    keyword = ""
    location = ""

    # --- Step 1: Try Hinglish location prepositions ---
    # Sort longest-first so "ke aas paas" matches before "ke" alone
    for hindi_prep, eng_prep in sorted(
        HINGLISH_LOCATION_PREPS.items(), key=lambda x: -len(x[0])
    ):
        # Use word-boundary matching to avoid false positives
        # e.g. "me" inside "mechanic" should NOT match
        pattern = r'(?:^|\s)' + re.escape(hindi_prep) + r'(?:\s|$)'
        match = re.search(pattern, text)
        if match:
            is_hinglish = True
            # Split at the match position
            start = match.start()
            end = match.end()
            left = text[:start].strip()
            right = text[end:].strip()

            if eng_prep in ("near me", "here"):
                keyword = left
                location = ""  # "near me" means local, no specific location
            else:
                keyword = left
                location = right
            break

    # --- Step 2: If no Hinglish detected, try English patterns ---
    if not is_hinglish:
        # "X in Y", "X near Y", "X around Y", "X from Y", "X by Y", "X at Y"
        # Use word-boundary to avoid matching "in" inside words like "inn", "interior"
        eng_match = re.match(
            r'^(.+?)\s+\b(in|near|around|from|by|at|close\s+to|next\s+to|within)\b\s+(.+)$',
            text, re.IGNORECASE,
        )
        if eng_match:
            candidate_kw = eng_match.group(1).strip()
            prep = eng_match.group(2).strip().lower()
            candidate_loc = eng_match.group(3).strip()

            # Disambiguate "in": only treat as preposition if followed by
            # a known location OR capitalized word (likely a place name)
            if prep == "in":
                loc_lower = candidate_loc.lower().split()[0] if candidate_loc else ""
                is_known_location = loc_lower in CITY_ALIASES
                # Check if original text had a capitalized word after "in"
                orig_after = original[eng_match.start(3):eng_match.end(3)].strip()
                starts_with_capital = bool(orig_after) and orig_after[0].isupper()
                if is_known_location or starts_with_capital:
                    keyword = candidate_kw
                    location = candidate_loc
                else:
                    # "in" is probably part of the keyword (e.g. "inn", "interior")
                    keyword = text
                    location = ""
            else:
                keyword = candidate_kw
                location = candidate_loc
        else:
            keyword = text
            location = ""

    # --- Step 3: Translate Hinglish words in keyword ---
    # Longest-match-first: try multi-word phrases before single words
    # to avoid "dawai ki dukaan" -> ["dawai", "ki", "pharmacy"] instead of ["pharmacy"]
    keyword_words = keyword.split()
    translated_words: list[str] = []
    i = 0
    while i < len(keyword_words):
        matched = False
        # Try 3-word, then 2-word, then 1-word matches (longest first)
        for span in (3, 2):
            if i + span <= len(keyword_words):
                phrase = " ".join(keyword_words[i:i + span]).lower()
                if phrase in HINGLISH_MAP:
                    is_hinglish = True
                    translated_words.append(HINGLISH_MAP[phrase])
                    i += span
                    matched = True
                    break
        if not matched:
            word = keyword_words[i]
            if word.lower() in HINGLISH_MAP:
                is_hinglish = True
                translated_words.append(HINGLISH_MAP[word.lower()])
            else:
                translated_words.append(word)
            i += 1
    keyword = " ".join(translated_words).strip()

    # --- Step 4: Translate Hinglish location words ---
    if location:
        loc_words = location.split()
        translated_loc: list[str] = []
        for word in loc_words:
            if word.lower() in HINGLISH_MAP:
                translated_loc.append(HINGLISH_MAP[word.lower()])
            else:
                translated_loc.append(word)
        location = " ".join(translated_loc).strip()

    # --- Step 5: Resolve city/country aliases ---
    country = ""
    if location:
        loc_lower = location.lower().strip()
        if loc_lower in CITY_ALIASES:
            resolved = CITY_ALIASES[loc_lower]
            location = resolved
            # Determine country from city
            country = _resolve_country(resolved)
        else:
            # R3-10 fix: Use word-boundary matching instead of substring `in`
            # to avoid false positives like "goa" matching inside "goalpara"
            # or "us" matching inside "business"
            for alias, canonical in sorted(
                CITY_ALIASES.items(), key=lambda x: -len(x[0])
            ):
                # Build a word-boundary regex for the alias
                pattern = r'(?:^|\b)' + re.escape(alias) + r'(?:\b|$)'
                if re.search(pattern, loc_lower):
                    location = canonical
                    country = _resolve_country(canonical)
                    break

    # --- Step 6: Clean up keyword ---
    # Only remove noise words if there are other substantive words remaining
    noise_words = {"best", "top", "good", "famous", "popular", "cheap", "nearby"}
    kw_words = keyword.split()
    cleaned_kw = [w for w in kw_words if w.lower() not in noise_words]
    if cleaned_kw:  # Only strip noise if we still have content words
        keyword = " ".join(cleaned_kw)
    # else: keep all words (the entire keyword is noise words — unlikely but safe)
    # Capitalize properly
    keyword = keyword.strip().title() if keyword else original.title()

    # --- Step 7: Generate search query variations ---
    search_queries = _build_search_variations(keyword, location, country)

    return ParsedKeyword(
        original=original,
        keyword=keyword,
        location=location,
        country=country,
        is_hinglish=is_hinglish,
        search_queries=search_queries,
    )


def _resolve_country(location: str) -> str:
    """Resolve a location to its country."""
    # Indian cities
    indian_cities = {
        "Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore", "Hyderabad",
        "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
        "Indore", "Bhopal", "Patna", "Vadodara", "Goa", "Surat", "Kochi",
        "Chandigarh", "Gurugram", "Noida", "Ghaziabad", "Faridabad",
        "Thiruvananthapuram", "Visakhapatnam", "Coimbatore", "Ludhiana",
        "Agra", "Varanasi", "Meerut", "Rajkot", "Amritsar", "Ranchi",
        "Prayagraj",
    }
    if location in indian_cities or location == "India":
        return "india"

    # Country names
    country_map = {
        "United States": "united states",
        "United Kingdom": "united kingdom",
        "Canada": "canada",
        "Australia": "australia",
        "Germany": "germany",
        "France": "france",
        "Japan": "japan",
        "China": "china",
        "Brazil": "brazil",
        "Singapore": "singapore",
        "Dubai": "uae",
        "United Arab Emirates": "uae",
        "Saudi Arabia": "saudi arabia",
        "Pakistan": "pakistan",
        "Bangladesh": "bangladesh",
        "Nepal": "nepal",
        "Sri Lanka": "sri lanka",
    }
    return country_map.get(location, "")


def _build_search_variations(
    keyword: str, location: str, country: str,
) -> list[str]:
    """Generate multiple search query variations for higher coverage."""
    variations: list[str] = []

    if location:
        variations.append(f"{keyword} {location}")
        variations.append(f"{keyword} in {location}")
        if country and country.lower() != location.lower():
            variations.append(f"{keyword} {location} {country}")
    else:
        variations.append(keyword)

    # Add contact-focused variation
    if location:
        variations.append(f"{keyword} {location} contact email")
    else:
        variations.append(f"{keyword} contact email")

    return variations


# ---------------------------------------------------------------------------
# Batch parsing
# ---------------------------------------------------------------------------

def parse_keywords(raw_inputs: list[str]) -> list[ParsedKeyword]:
    """Parse multiple keywords."""
    return [parse_keyword(kw) for kw in raw_inputs]
