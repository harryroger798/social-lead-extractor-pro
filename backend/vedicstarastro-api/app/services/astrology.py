from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import secrets
import math

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
    swe.set_ephe_path(None)
except ImportError:
    SWISSEPH_AVAILABLE = False

PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
SIGNS_SANSKRIT = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"]

# Vimshottari Dasha periods in years for each planet
VIMSHOTTARI_YEARS = {
    "Ketu": 7,
    "Venus": 20,
    "Sun": 6,
    "Moon": 10,
    "Mars": 7,
    "Rahu": 18,
    "Jupiter": 16,
    "Saturn": 19,
    "Mercury": 17
}

# Vimshottari Dasha sequence (starting from Ketu for Ashwini nakshatra)
VIMSHOTTARI_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

# Nakshatra to starting Dasha lord mapping
NAKSHATRA_DASHA_LORD = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",  # 1-9
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",  # 10-18
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"   # 19-27
]

# Sign lords for various calculations
SIGN_LORDS = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
}

# Exaltation signs for planets
EXALTATION_SIGNS = {
    "Sun": "Aries", "Moon": "Taurus", "Mars": "Capricorn", "Mercury": "Virgo",
    "Jupiter": "Cancer", "Venus": "Pisces", "Saturn": "Libra", "Rahu": "Taurus", "Ketu": "Scorpio"
}

# Debilitation signs for planets
DEBILITATION_SIGNS = {
    "Sun": "Libra", "Moon": "Scorpio", "Mars": "Cancer", "Mercury": "Pisces",
    "Jupiter": "Capricorn", "Venus": "Virgo", "Saturn": "Aries", "Rahu": "Scorpio", "Ketu": "Taurus"
}

# Own signs for planets
OWN_SIGNS = {
    "Sun": ["Leo"], "Moon": ["Cancer"], "Mars": ["Aries", "Scorpio"],
    "Mercury": ["Gemini", "Virgo"], "Jupiter": ["Sagittarius", "Pisces"],
    "Venus": ["Taurus", "Libra"], "Saturn": ["Capricorn", "Aquarius"],
    "Rahu": ["Aquarius"], "Ketu": ["Scorpio"]
}

# Moolatrikona signs and degrees
MOOLATRIKONA = {
    "Sun": {"sign": "Leo", "start": 0, "end": 20},
    "Moon": {"sign": "Taurus", "start": 3, "end": 30},
    "Mars": {"sign": "Aries", "start": 0, "end": 12},
    "Mercury": {"sign": "Virgo", "start": 15, "end": 20},
    "Jupiter": {"sign": "Sagittarius", "start": 0, "end": 10},
    "Venus": {"sign": "Libra", "start": 0, "end": 15},
    "Saturn": {"sign": "Aquarius", "start": 0, "end": 20}
}

# Planetary friendships for Graha Maitri
PLANETARY_FRIENDS = {
    "Sun": {"friends": ["Moon", "Mars", "Jupiter"], "enemies": ["Venus", "Saturn"], "neutral": ["Mercury"]},
    "Moon": {"friends": ["Sun", "Mercury"], "enemies": [], "neutral": ["Mars", "Jupiter", "Venus", "Saturn"]},
    "Mars": {"friends": ["Sun", "Moon", "Jupiter"], "enemies": ["Mercury"], "neutral": ["Venus", "Saturn"]},
    "Mercury": {"friends": ["Sun", "Venus"], "enemies": ["Moon"], "neutral": ["Mars", "Jupiter", "Saturn"]},
    "Jupiter": {"friends": ["Sun", "Moon", "Mars"], "enemies": ["Mercury", "Venus"], "neutral": ["Saturn"]},
    "Venus": {"friends": ["Mercury", "Saturn"], "enemies": ["Sun", "Moon"], "neutral": ["Mars", "Jupiter"]},
    "Saturn": {"friends": ["Mercury", "Venus"], "enemies": ["Sun", "Moon", "Mars"], "neutral": ["Jupiter"]}
}

# Directional strength (Dig Bala) - planets strong in specific houses
DIG_BALA = {
    "Sun": 10, "Mars": 10,  # Strong in 10th house
    "Jupiter": 1, "Mercury": 1,  # Strong in 1st house (Lagna)
    "Moon": 4, "Venus": 4,  # Strong in 4th house
    "Saturn": 7  # Strong in 7th house
}

PLANET_IDS = {}
if SWISSEPH_AVAILABLE:
    PLANET_IDS = {
        "Sun": swe.SUN,
        "Moon": swe.MOON,
        "Mars": swe.MARS,
        "Mercury": swe.MERCURY,
        "Jupiter": swe.JUPITER,
        "Venus": swe.VENUS,
        "Saturn": swe.SATURN,
    }

NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu", "deity": "Ashwini Kumaras", "symbol": "Horse's Head", "gana": "Deva"},
    {"name": "Bharani", "lord": "Venus", "deity": "Yama", "symbol": "Yoni", "gana": "Manushya"},
    {"name": "Krittika", "lord": "Sun", "deity": "Agni", "symbol": "Razor", "gana": "Rakshasa"},
    {"name": "Rohini", "lord": "Moon", "deity": "Brahma", "symbol": "Chariot", "gana": "Manushya"},
    {"name": "Mrigashira", "lord": "Mars", "deity": "Soma", "symbol": "Deer's Head", "gana": "Deva"},
    {"name": "Ardra", "lord": "Rahu", "deity": "Rudra", "symbol": "Teardrop", "gana": "Manushya"},
    {"name": "Punarvasu", "lord": "Jupiter", "deity": "Aditi", "symbol": "Bow", "gana": "Deva"},
    {"name": "Pushya", "lord": "Saturn", "deity": "Brihaspati", "symbol": "Flower", "gana": "Deva"},
    {"name": "Ashlesha", "lord": "Mercury", "deity": "Nagas", "symbol": "Serpent", "gana": "Rakshasa"},
    {"name": "Magha", "lord": "Ketu", "deity": "Pitris", "symbol": "Throne", "gana": "Rakshasa"},
    {"name": "Purva Phalguni", "lord": "Venus", "deity": "Bhaga", "symbol": "Hammock", "gana": "Manushya"},
    {"name": "Uttara Phalguni", "lord": "Sun", "deity": "Aryaman", "symbol": "Bed", "gana": "Manushya"},
    {"name": "Hasta", "lord": "Moon", "deity": "Savitar", "symbol": "Hand", "gana": "Deva"},
    {"name": "Chitra", "lord": "Mars", "deity": "Vishwakarma", "symbol": "Pearl", "gana": "Rakshasa"},
    {"name": "Swati", "lord": "Rahu", "deity": "Vayu", "symbol": "Coral", "gana": "Deva"},
    {"name": "Vishakha", "lord": "Jupiter", "deity": "Indra-Agni", "symbol": "Archway", "gana": "Rakshasa"},
    {"name": "Anuradha", "lord": "Saturn", "deity": "Mitra", "symbol": "Lotus", "gana": "Deva"},
    {"name": "Jyeshtha", "lord": "Mercury", "deity": "Indra", "symbol": "Earring", "gana": "Rakshasa"},
    {"name": "Mula", "lord": "Ketu", "deity": "Nirriti", "symbol": "Roots", "gana": "Rakshasa"},
    {"name": "Purva Ashadha", "lord": "Venus", "deity": "Apas", "symbol": "Fan", "gana": "Manushya"},
    {"name": "Uttara Ashadha", "lord": "Sun", "deity": "Vishvadevas", "symbol": "Tusk", "gana": "Manushya"},
    {"name": "Shravana", "lord": "Moon", "deity": "Vishnu", "symbol": "Ear", "gana": "Deva"},
    {"name": "Dhanishta", "lord": "Mars", "deity": "Vasus", "symbol": "Drum", "gana": "Rakshasa"},
    {"name": "Shatabhisha", "lord": "Rahu", "deity": "Varuna", "symbol": "Circle", "gana": "Rakshasa"},
    {"name": "Purva Bhadrapada", "lord": "Jupiter", "deity": "Aja Ekapada", "symbol": "Sword", "gana": "Manushya"},
    {"name": "Uttara Bhadrapada", "lord": "Saturn", "deity": "Ahir Budhnya", "symbol": "Twins", "gana": "Manushya"},
    {"name": "Revati", "lord": "Mercury", "deity": "Pushan", "symbol": "Fish", "gana": "Deva"},
]

def generate_share_token() -> str:
    return secrets.token_urlsafe(32)

def datetime_to_julian_day(dt: datetime, hour: float) -> float:
    if SWISSEPH_AVAILABLE:
        jd = swe.julday(dt.year, dt.month, dt.day, hour)
        return jd
    else:
        a = (14 - dt.month) // 12
        y = dt.year + 4800 - a
        m = dt.month + 12 * a - 3
        jdn = dt.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045
        return jdn + (hour - 12) / 24.0

def get_ayanamsa(jd: float) -> float:
    if SWISSEPH_AVAILABLE:
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        return swe.get_ayanamsa_ut(jd)
    else:
        year = 2000 + (jd - 2451545.0) / 365.25
        return 23.85 + (year - 2000) * 0.0139

def get_planet_position(jd: float, planet_id: int, ayanamsa: float) -> Dict:
    if SWISSEPH_AVAILABLE:
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        result = swe.calc_ut(jd, planet_id, flags)
        tropical_lon = result[0][0]
        speed = result[0][3]
        sidereal_lon = (tropical_lon - ayanamsa) % 360
        return {
            "longitude": sidereal_lon,
            "latitude": result[0][1],
            "distance": result[0][2],
            "speed": speed,
            "retrograde": speed < 0
        }
    else:
        return {"longitude": 0, "latitude": 0, "distance": 1, "speed": 1, "retrograde": False}

def get_rahu_ketu_positions(jd: float, ayanamsa: float) -> tuple:
    if SWISSEPH_AVAILABLE:
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        result = swe.calc_ut(jd, swe.MEAN_NODE, flags)
        rahu_tropical = result[0][0]
        rahu_sidereal = (rahu_tropical - ayanamsa) % 360
        ketu_sidereal = (rahu_sidereal + 180) % 360
        return (
            {"longitude": rahu_sidereal, "latitude": 0, "distance": 0, "speed": 0, "retrograde": True},
            {"longitude": ketu_sidereal, "latitude": 0, "distance": 0, "speed": 0, "retrograde": True}
        )
    else:
        return (
            {"longitude": 0, "latitude": 0, "distance": 0, "speed": 0, "retrograde": True},
            {"longitude": 180, "latitude": 0, "distance": 0, "speed": 0, "retrograde": True}
        )

def calculate_ascendant(jd: float, latitude: float, longitude: float, ayanamsa: float) -> Dict:
    if SWISSEPH_AVAILABLE:
        cusps, ascmc = swe.houses_ex(jd, latitude, longitude, b'P', swe.FLG_SIDEREAL)
        asc_sidereal = ascmc[0]
        mc_sidereal = ascmc[1]
        return {
            "ascendant": asc_sidereal,
            "mc": mc_sidereal,
            "cusps": list(cusps)
        }
    else:
        lst = (jd - 2451545.0) * 360.98564736629 + 280.46061837 + longitude
        lst = lst % 360
        asc = math.atan2(math.cos(math.radians(lst)), 
                        -math.sin(math.radians(lst)) * math.cos(math.radians(23.44)) - 
                        math.tan(math.radians(latitude)) * math.sin(math.radians(23.44)))
        asc_deg = (math.degrees(asc) - ayanamsa) % 360
        return {
            "ascendant": asc_deg,
            "mc": (asc_deg + 270) % 360,
            "cusps": [(asc_deg + i * 30) % 360 for i in range(12)]
        }

def longitude_to_sign(longitude: float) -> tuple:
    sign_index = int(longitude / 30) % 12
    degree_in_sign = longitude % 30
    return sign_index, degree_in_sign

def longitude_to_nakshatra(longitude: float) -> Dict:
    nakshatra_span = 360 / 27
    nakshatra_index = int(longitude / nakshatra_span) % 27
    pada = int((longitude % nakshatra_span) / (nakshatra_span / 4)) + 1
    nakshatra = NAKSHATRAS[nakshatra_index].copy()
    nakshatra["pada"] = pada
    nakshatra["degree_in_nakshatra"] = round(longitude % nakshatra_span, 2)
    return nakshatra

def get_house_from_ascendant(planet_lon: float, asc_lon: float) -> int:
    diff = (planet_lon - asc_lon) % 360
    house = int(diff / 30) + 1
    return house

def parse_time(time_str: str) -> float:
    parts = time_str.replace(":", " ").replace(".", " ").split()
    hour = int(parts[0]) if len(parts) > 0 else 12
    minute = int(parts[1]) if len(parts) > 1 else 0
    second = int(parts[2]) if len(parts) > 2 else 0
    return hour + minute / 60.0 + second / 3600.0

def get_timezone_offset(longitude: float) -> float:
    """
    Get the standard timezone offset for a given longitude.
    For India (longitude ~68-97°E), this returns IST offset of +5:30 (5.5 hours).
    For other regions, returns the standard timezone offset.
    
    Swiss Ephemeris requires Universal Time (UT), so we need to convert
    local time to UT by subtracting the timezone offset.
    """
    # India Standard Time (IST) covers all of India: UTC+5:30
    # India spans roughly 68°E to 97°E longitude
    if 68 <= longitude <= 97:
        return 5.5  # IST = UTC + 5:30
    
    # Nepal: UTC+5:45
    if 80 <= longitude <= 88 and longitude > 84:
        return 5.75
    
    # For other locations, use standard timezone based on longitude
    # Each 15 degrees of longitude = 1 hour offset from UTC
    # This is an approximation; for precise results, a timezone database would be needed
    
    # Common timezone offsets for major regions:
    # Pakistan (60-77°E): UTC+5
    if 60 <= longitude < 68:
        return 5.0
    
    # Bangladesh (88-92°E): UTC+6
    if 88 <= longitude <= 92:
        return 6.0
    
    # Sri Lanka (79-82°E): UTC+5:30
    if 79 <= longitude <= 82:
        return 5.5
    
    # Myanmar (92-101°E): UTC+6:30
    if 92 < longitude <= 101:
        return 6.5
    
    # Thailand, Vietnam, Indonesia (95-141°E): UTC+7
    if 95 <= longitude <= 110:
        return 7.0
    
    # China, Singapore, Malaysia, Philippines (100-125°E): UTC+8
    if 100 <= longitude <= 125:
        return 8.0
    
    # Japan, Korea (125-145°E): UTC+9
    if 125 < longitude <= 145:
        return 9.0
    
    # Australia East (140-155°E): UTC+10
    if 140 < longitude <= 155:
        return 10.0
    
    # Middle East - UAE, Oman (51-60°E): UTC+4
    if 51 <= longitude < 60:
        return 4.0
    
    # Saudi Arabia, Iraq (36-51°E): UTC+3
    if 36 <= longitude < 51:
        return 3.0
    
    # Europe (0-30°E): UTC+1 to UTC+2
    if 0 <= longitude <= 15:
        return 1.0
    if 15 < longitude <= 30:
        return 2.0
    
    # UK, Portugal, West Africa (-10 to 0°): UTC+0
    if -10 <= longitude < 0:
        return 0.0
    
    # US East Coast (-85 to -65°): UTC-5
    if -85 <= longitude < -65:
        return -5.0
    
    # US Central (-105 to -85°): UTC-6
    if -105 <= longitude < -85:
        return -6.0
    
    # US Mountain (-115 to -105°): UTC-7
    if -115 <= longitude < -105:
        return -7.0
    
    # US Pacific (-125 to -115°): UTC-8
    if -125 <= longitude < -115:
        return -8.0
    
    # Default: calculate based on longitude (15° = 1 hour)
    return round(longitude / 15.0)

def local_time_to_ut(local_hour: float, longitude: float) -> float:
    """
    Convert local time to Universal Time (UT).
    
    Args:
        local_hour: Local time in decimal hours (e.g., 9.25 for 9:15 AM)
        longitude: Geographic longitude in degrees
    
    Returns:
        Universal Time in decimal hours
    """
    timezone_offset = get_timezone_offset(longitude)
    ut_hour = local_hour - timezone_offset
    return ut_hour

def calculate_birth_chart(
    birth_date: datetime,
    birth_time: str,
    birth_place: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
) -> Dict:
    if latitude is None:
        latitude = 12.9716
    if longitude is None:
        longitude = 77.5946
    
    # Parse local time and convert to Universal Time (UT)
    # Swiss Ephemeris requires UT for accurate calculations
    local_hour = parse_time(birth_time)
    ut_hour = local_time_to_ut(local_hour, longitude)
    
    # Handle day rollover when UT goes negative or exceeds 24
    date_offset = 0
    if ut_hour < 0:
        ut_hour += 24
        date_offset = -1
    elif ut_hour >= 24:
        ut_hour -= 24
        date_offset = 1
    
    # Adjust date if needed
    adjusted_date = birth_date
    if date_offset != 0:
        adjusted_date = birth_date + timedelta(days=date_offset)
    
    jd = datetime_to_julian_day(adjusted_date, ut_hour)
    ayanamsa = get_ayanamsa(jd)
    
    house_data = calculate_ascendant(jd, latitude, longitude, ayanamsa)
    asc_longitude = house_data["ascendant"]
    asc_sign_index, asc_degree = longitude_to_sign(asc_longitude)
    
    planets = []
    
    for planet_name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
        planet_id = PLANET_IDS.get(planet_name, 0)
        pos = get_planet_position(jd, planet_id, ayanamsa)
        sign_index, degree_in_sign = longitude_to_sign(pos["longitude"])
        nakshatra = longitude_to_nakshatra(pos["longitude"])
        house = get_house_from_ascendant(pos["longitude"], asc_longitude)
        
        planets.append({
            "name": planet_name,
            "longitude": round(pos["longitude"], 4),
            "sign": SIGNS[sign_index],
            "sign_sanskrit": SIGNS_SANSKRIT[sign_index],
            "degree": round(degree_in_sign, 2),
            "house": house,
            "nakshatra": nakshatra["name"],
            "nakshatra_pada": nakshatra["pada"],
            "nakshatra_lord": nakshatra["lord"],
            "retrograde": pos["retrograde"]
        })
    
    rahu_pos, ketu_pos = get_rahu_ketu_positions(jd, ayanamsa)
    
    for node_name, node_pos in [("Rahu", rahu_pos), ("Ketu", ketu_pos)]:
        sign_index, degree_in_sign = longitude_to_sign(node_pos["longitude"])
        nakshatra = longitude_to_nakshatra(node_pos["longitude"])
        house = get_house_from_ascendant(node_pos["longitude"], asc_longitude)
        
        planets.append({
            "name": node_name,
            "longitude": round(node_pos["longitude"], 4),
            "sign": SIGNS[sign_index],
            "sign_sanskrit": SIGNS_SANSKRIT[sign_index],
            "degree": round(degree_in_sign, 2),
            "house": house,
            "nakshatra": nakshatra["name"],
            "nakshatra_pada": nakshatra["pada"],
            "nakshatra_lord": nakshatra["lord"],
            "retrograde": True
        })
    
    houses = []
    for i in range(12):
        house_sign_index = (asc_sign_index + i) % 12
        house_planets = [p["name"] for p in planets if p["house"] == i + 1]
        house_cusp = house_data["cusps"][i] if i < len(house_data["cusps"]) else (asc_longitude + i * 30) % 360
        houses.append({
            "house": i + 1,
            "sign": SIGNS[house_sign_index],
            "sign_sanskrit": SIGNS_SANSKRIT[house_sign_index],
            "cusp_degree": round(house_cusp, 2),
            "planets": house_planets
        })
    
    moon_planet = next((p for p in planets if p["name"] == "Moon"), None)
    sun_planet = next((p for p in planets if p["name"] == "Sun"), None)
    
    moon_sign_index = SIGNS.index(moon_planet["sign"]) if moon_planet else 0
    sun_sign_index = SIGNS.index(sun_planet["sign"]) if sun_planet else 0
    
    moon_nakshatra = longitude_to_nakshatra(moon_planet["longitude"]) if moon_planet else NAKSHATRAS[0]
    
    mars_planet = next((p for p in planets if p["name"] == "Mars"), None)
    mangal_dosha = mars_planet["house"] in [1, 4, 7, 8, 12] if mars_planet else False
    
    rahu_planet = next((p for p in planets if p["name"] == "Rahu"), None)
    ketu_planet = next((p for p in planets if p["name"] == "Ketu"), None)
    
    kaal_sarp_dosha = False
    if rahu_planet and ketu_planet:
        rahu_lon = rahu_planet["longitude"]
        ketu_lon = ketu_planet["longitude"]
        other_planets = [p for p in planets if p["name"] not in ["Rahu", "Ketu"]]
        
        all_between = True
        for p in other_planets:
            p_lon = p["longitude"]
            if rahu_lon < ketu_lon:
                if not (rahu_lon <= p_lon <= ketu_lon):
                    all_between = False
                    break
            else:
                if not (p_lon >= rahu_lon or p_lon <= ketu_lon):
                    all_between = False
                    break
        kaal_sarp_dosha = all_between
    
    return {
        "ascendant": SIGNS[asc_sign_index],
        "ascendant_sanskrit": SIGNS_SANSKRIT[asc_sign_index],
        "ascendant_degree": round(asc_degree, 2),
        "moon_sign": SIGNS[moon_sign_index],
        "moon_sign_sanskrit": SIGNS_SANSKRIT[moon_sign_index],
        "sun_sign": SIGNS[sun_sign_index],
        "sun_sign_sanskrit": SIGNS_SANSKRIT[sun_sign_index],
        "nakshatra": moon_nakshatra["name"],
        "nakshatra_lord": moon_nakshatra["lord"],
        "nakshatra_deity": moon_nakshatra["deity"],
        "nakshatra_pada": moon_nakshatra.get("pada", 1),
        "ayanamsa": round(ayanamsa, 4),
        "ayanamsa_name": "Lahiri",
        "julian_day": round(jd, 6),
        "planets": planets,
        "houses": houses,
        "doshas": {
            "mangal_dosha": mangal_dosha,
            "kaal_sarp_dosha": kaal_sarp_dosha
        },
        "birth_details": {
            "date": birth_date.isoformat(),
            "time": birth_time,
            "place": birth_place,
            "latitude": latitude,
            "longitude": longitude
        },
        "calculation_method": "Swiss Ephemeris" if SWISSEPH_AVAILABLE else "Fallback Algorithm"
    }

def get_nakshatra_from_moon(moon_degree: float) -> Dict:
    return longitude_to_nakshatra(moon_degree)

# ============================================
# VIMSHOTTARI DASHA CALCULATIONS
# ============================================

def calculate_vimshottari_dasha(
    birth_date: datetime,
    moon_longitude: float,
    years_to_calculate: int = 120
) -> Dict:
    """
    Calculate Vimshottari Dasha periods based on Moon's nakshatra position at birth.
    The Vimshottari Dasha is a 120-year cycle based on the Moon's nakshatra.
    """
    # Get nakshatra details from Moon's longitude
    nakshatra_span = 360 / 27  # 13°20' per nakshatra
    nakshatra_index = int(moon_longitude / nakshatra_span) % 27
    
    # Calculate how much of the nakshatra has been traversed
    degree_in_nakshatra = moon_longitude % nakshatra_span
    nakshatra_progress = degree_in_nakshatra / nakshatra_span  # 0 to 1
    
    # Get the starting Dasha lord for this nakshatra
    starting_lord = NAKSHATRA_DASHA_LORD[nakshatra_index]
    starting_lord_index = VIMSHOTTARI_SEQUENCE.index(starting_lord)
    
    # Calculate remaining period of the first Dasha
    first_dasha_total_years = VIMSHOTTARI_YEARS[starting_lord]
    first_dasha_elapsed = first_dasha_total_years * nakshatra_progress
    first_dasha_remaining = first_dasha_total_years - first_dasha_elapsed
    
    # Build the Dasha periods
    dashas = []
    current_date = birth_date
    
    # First Dasha (partial)
    end_date = current_date + timedelta(days=first_dasha_remaining * 365.25)
    dashas.append({
        "planet": starting_lord,
        "start_date": current_date.isoformat(),
        "end_date": end_date.isoformat(),
        "duration_years": round(first_dasha_remaining, 2),
        "is_current": False,
        "antardashas": calculate_antardashas(starting_lord, current_date, end_date)
    })
    current_date = end_date
    
    # Subsequent full Dashas
    for i in range(1, 10):  # Complete the 120-year cycle
        lord_index = (starting_lord_index + i) % 9
        lord = VIMSHOTTARI_SEQUENCE[lord_index]
        duration_years = VIMSHOTTARI_YEARS[lord]
        end_date = current_date + timedelta(days=duration_years * 365.25)
        
        dashas.append({
            "planet": lord,
            "start_date": current_date.isoformat(),
            "end_date": end_date.isoformat(),
            "duration_years": duration_years,
            "is_current": False,
            "antardashas": calculate_antardashas(lord, current_date, end_date)
        })
        current_date = end_date
    
    # Mark current Dasha
    now = datetime.now()
    for dasha in dashas:
        start = datetime.fromisoformat(dasha["start_date"])
        end = datetime.fromisoformat(dasha["end_date"])
        if start <= now <= end:
            dasha["is_current"] = True
            # Mark current Antardasha
            for antardasha in dasha["antardashas"]:
                ad_start = datetime.fromisoformat(antardasha["start_date"])
                ad_end = datetime.fromisoformat(antardasha["end_date"])
                if ad_start <= now <= ad_end:
                    antardasha["is_current"] = True
                    break
            break
    
    return {
        "mahadashas": dashas,
        "current_mahadasha": next((d for d in dashas if d["is_current"]), None),
        "birth_nakshatra": NAKSHATRAS[nakshatra_index]["name"],
        "birth_nakshatra_lord": starting_lord,
        "total_cycle_years": 120
    }


def calculate_antardashas(mahadasha_lord: str, start_date: datetime, end_date: datetime) -> List[Dict]:
    """
    Calculate Antardasha (sub-periods) within a Mahadasha.
    Each Antardasha's duration is proportional to its planet's Vimshottari years.
    """
    total_days = (end_date - start_date).days
    lord_index = VIMSHOTTARI_SEQUENCE.index(mahadasha_lord)
    
    antardashas = []
    current_date = start_date
    
    for i in range(9):
        antardasha_lord_index = (lord_index + i) % 9
        antardasha_lord = VIMSHOTTARI_SEQUENCE[antardasha_lord_index]
        
        # Antardasha duration = (Mahadasha years * Antardasha years) / 120
        mahadasha_years = VIMSHOTTARI_YEARS[mahadasha_lord]
        antardasha_years = VIMSHOTTARI_YEARS[antardasha_lord]
        duration_years = (mahadasha_years * antardasha_years) / 120
        duration_days = duration_years * 365.25
        
        ad_end_date = current_date + timedelta(days=duration_days)
        
        antardashas.append({
            "planet": antardasha_lord,
            "start_date": current_date.isoformat(),
            "end_date": ad_end_date.isoformat(),
            "duration_years": round(duration_years, 2),
            "duration_months": round(duration_years * 12, 1),
            "is_current": False
        })
        current_date = ad_end_date
    
    return antardashas


# ============================================
# DIVISIONAL CHARTS (VARGAS)
# ============================================

def calculate_navamsa(longitude: float) -> Dict:
    """
    Calculate Navamsa (D-9) position.
    Each sign is divided into 9 parts of 3°20' each.
    Navamsa is crucial for marriage and spiritual analysis.
    """
    # Each navamsa spans 3°20' (3.333... degrees)
    navamsa_span = 30 / 9  # 3.333... degrees
    
    # Get the sign and degree within sign
    sign_index = int(longitude / 30) % 12
    degree_in_sign = longitude % 30
    
    # Calculate navamsa number within the sign (0-8)
    navamsa_num = int(degree_in_sign / navamsa_span)
    
    # Calculate navamsa sign based on element of birth sign
    # Fire signs (Aries, Leo, Sag) start from Aries
    # Earth signs (Taurus, Virgo, Cap) start from Capricorn
    # Air signs (Gemini, Libra, Aqua) start from Libra
    # Water signs (Cancer, Scorpio, Pisces) start from Cancer
    
    element = sign_index % 4
    if element == 0:  # Fire signs (0, 4, 8)
        navamsa_start = 0  # Aries
    elif element == 1:  # Earth signs (1, 5, 9)
        navamsa_start = 9  # Capricorn
    elif element == 2:  # Air signs (2, 6, 10)
        navamsa_start = 6  # Libra
    else:  # Water signs (3, 7, 11)
        navamsa_start = 3  # Cancer
    
    navamsa_sign_index = (navamsa_start + navamsa_num) % 12
    
    return {
        "sign": SIGNS[navamsa_sign_index],
        "sign_sanskrit": SIGNS_SANSKRIT[navamsa_sign_index],
        "sign_index": navamsa_sign_index,
        "navamsa_number": navamsa_num + 1
    }


def calculate_dasamsa(longitude: float) -> Dict:
    """
    Calculate Dasamsa (D-10) position for career analysis.
    Each sign is divided into 10 parts of 3° each.
    """
    sign_index = int(longitude / 30) % 12
    degree_in_sign = longitude % 30
    
    # Each dasamsa spans 3 degrees
    dasamsa_num = int(degree_in_sign / 3)
    
    # For odd signs, count from the sign itself
    # For even signs, count from the 9th sign from it
    if sign_index % 2 == 0:  # Odd signs (0-indexed even)
        dasamsa_start = sign_index
    else:  # Even signs
        dasamsa_start = (sign_index + 8) % 12
    
    dasamsa_sign_index = (dasamsa_start + dasamsa_num) % 12
    
    return {
        "sign": SIGNS[dasamsa_sign_index],
        "sign_sanskrit": SIGNS_SANSKRIT[dasamsa_sign_index],
        "sign_index": dasamsa_sign_index,
        "dasamsa_number": dasamsa_num + 1
    }


def calculate_saptamsa(longitude: float) -> Dict:
    """
    Calculate Saptamsa (D-7) position for children/progeny analysis.
    Each sign is divided into 7 parts of 4°17'8.57" each.
    """
    sign_index = int(longitude / 30) % 12
    degree_in_sign = longitude % 30
    
    # Each saptamsa spans 30/7 = 4.2857... degrees
    saptamsa_span = 30 / 7
    saptamsa_num = int(degree_in_sign / saptamsa_span)
    
    # For odd signs, count from the sign itself
    # For even signs, count from the 7th sign from it
    if sign_index % 2 == 0:  # Odd signs
        saptamsa_start = sign_index
    else:  # Even signs
        saptamsa_start = (sign_index + 6) % 12
    
    saptamsa_sign_index = (saptamsa_start + saptamsa_num) % 12
    
    return {
        "sign": SIGNS[saptamsa_sign_index],
        "sign_sanskrit": SIGNS_SANSKRIT[saptamsa_sign_index],
        "sign_index": saptamsa_sign_index,
        "saptamsa_number": saptamsa_num + 1
    }


def calculate_dwadasamsa(longitude: float) -> Dict:
    """
    Calculate Dwadasamsa (D-12) position for parents analysis.
    Each sign is divided into 12 parts of 2°30' each.
    """
    sign_index = int(longitude / 30) % 12
    degree_in_sign = longitude % 30
    
    # Each dwadasamsa spans 2.5 degrees
    dwadasamsa_num = int(degree_in_sign / 2.5)
    
    # Always count from the sign itself
    dwadasamsa_sign_index = (sign_index + dwadasamsa_num) % 12
    
    return {
        "sign": SIGNS[dwadasamsa_sign_index],
        "sign_sanskrit": SIGNS_SANSKRIT[dwadasamsa_sign_index],
        "sign_index": dwadasamsa_sign_index,
        "dwadasamsa_number": dwadasamsa_num + 1
    }


def calculate_chaturvimsamsa(longitude: float) -> Dict:
    """
    Calculate Chaturvimsamsa (D-24) position for education/learning analysis.
    Each sign is divided into 24 parts of 1°15' each.
    """
    sign_index = int(longitude / 30) % 12
    degree_in_sign = longitude % 30
    
    # Each chaturvimsamsa spans 1.25 degrees
    chaturvimsamsa_num = int(degree_in_sign / 1.25)
    
    # For odd signs, start from Leo (4)
    # For even signs, start from Cancer (3)
    if sign_index % 2 == 0:  # Odd signs
        start = 4  # Leo
    else:  # Even signs
        start = 3  # Cancer
    
    chaturvimsamsa_sign_index = (start + chaturvimsamsa_num) % 12
    
    return {
        "sign": SIGNS[chaturvimsamsa_sign_index],
        "sign_sanskrit": SIGNS_SANSKRIT[chaturvimsamsa_sign_index],
        "sign_index": chaturvimsamsa_sign_index,
        "chaturvimsamsa_number": chaturvimsamsa_num + 1
    }


def calculate_all_divisional_charts(planets: List[Dict], asc_longitude: float) -> Dict:
    """
    Calculate all major divisional charts for all planets.
    """
    divisional_charts = {
        "D1_Rashi": {},  # Birth chart (already calculated)
        "D9_Navamsa": {},  # Marriage, dharma
        "D10_Dasamsa": {},  # Career
        "D7_Saptamsa": {},  # Children
        "D12_Dwadasamsa": {},  # Parents
        "D24_Chaturvimsamsa": {}  # Education
    }
    
    # Calculate for Ascendant
    divisional_charts["D9_Navamsa"]["Ascendant"] = calculate_navamsa(asc_longitude)
    divisional_charts["D10_Dasamsa"]["Ascendant"] = calculate_dasamsa(asc_longitude)
    divisional_charts["D7_Saptamsa"]["Ascendant"] = calculate_saptamsa(asc_longitude)
    divisional_charts["D12_Dwadasamsa"]["Ascendant"] = calculate_dwadasamsa(asc_longitude)
    divisional_charts["D24_Chaturvimsamsa"]["Ascendant"] = calculate_chaturvimsamsa(asc_longitude)
    
    # Calculate for all planets
    for planet in planets:
        lon = planet["longitude"]
        name = planet["name"]
        
        divisional_charts["D1_Rashi"][name] = {
            "sign": planet["sign"],
            "sign_sanskrit": planet["sign_sanskrit"],
            "degree": planet["degree"]
        }
        divisional_charts["D9_Navamsa"][name] = calculate_navamsa(lon)
        divisional_charts["D10_Dasamsa"][name] = calculate_dasamsa(lon)
        divisional_charts["D7_Saptamsa"][name] = calculate_saptamsa(lon)
        divisional_charts["D12_Dwadasamsa"][name] = calculate_dwadasamsa(lon)
        divisional_charts["D24_Chaturvimsamsa"][name] = calculate_chaturvimsamsa(lon)
    
    return divisional_charts


# ============================================
# YOGA DETECTION
# ============================================

def detect_yogas(planets: List[Dict], houses: List[Dict], asc_sign: str) -> List[Dict]:
    """
    Detect major Yogas (planetary combinations) in the birth chart.
    """
    yogas = []
    
    # Create helper dictionaries
    planet_dict = {p["name"]: p for p in planets}
    house_planets = {h["house"]: h["planets"] for h in houses}
    
    # Get house lords
    asc_index = SIGNS.index(asc_sign)
    house_lords = {}
    for i in range(12):
        house_sign = SIGNS[(asc_index + i) % 12]
        house_lords[i + 1] = SIGN_LORDS[house_sign]
    
    # 1. GAJA KESARI YOGA - Jupiter in Kendra from Moon
    moon = planet_dict.get("Moon")
    jupiter = planet_dict.get("Jupiter")
    if moon and jupiter:
        moon_house = moon["house"]
        jupiter_house = jupiter["house"]
        diff = abs(jupiter_house - moon_house)
        if diff in [0, 3, 6, 9] or (12 - diff) in [0, 3, 6, 9]:
            yogas.append({
                "name": "Gaja Kesari Yoga",
                "type": "Wealth & Fame",
                "planets": ["Moon", "Jupiter"],
                "description": "Jupiter in Kendra (1st, 4th, 7th, or 10th) from Moon. Bestows wisdom, fame, and prosperity.",
                "strength": "Strong" if jupiter["sign"] in ["Cancer", "Sagittarius", "Pisces"] else "Moderate"
            })
    
    # 2. BUDHADITYA YOGA - Sun and Mercury conjunction
    sun = planet_dict.get("Sun")
    mercury = planet_dict.get("Mercury")
    if sun and mercury and sun["house"] == mercury["house"]:
        yogas.append({
            "name": "Budhaditya Yoga",
            "type": "Intelligence",
            "planets": ["Sun", "Mercury"],
            "description": "Sun and Mercury in the same house. Bestows intelligence, communication skills, and success in intellectual pursuits.",
            "strength": "Strong" if mercury["sign"] in ["Gemini", "Virgo"] else "Moderate"
        })
    
    # 3. CHANDRA-MANGAL YOGA - Moon and Mars conjunction
    mars = planet_dict.get("Mars")
    if moon and mars and moon["house"] == mars["house"]:
        yogas.append({
            "name": "Chandra-Mangal Yoga",
            "type": "Wealth",
            "planets": ["Moon", "Mars"],
            "description": "Moon and Mars in the same house. Indicates wealth through business, real estate, or inheritance.",
            "strength": "Strong" if moon["sign"] in ["Taurus", "Cancer"] else "Moderate"
        })
    
    # 4. PANCH MAHAPURUSHA YOGAS
    # These occur when Mars, Mercury, Jupiter, Venus, or Saturn are in Kendra in their own/exaltation sign
    
    # Ruchaka Yoga - Mars in Kendra in own/exaltation sign
    if mars and mars["house"] in [1, 4, 7, 10]:
        if mars["sign"] in ["Aries", "Scorpio", "Capricorn"]:
            yogas.append({
                "name": "Ruchaka Yoga",
                "type": "Panch Mahapurusha",
                "planets": ["Mars"],
                "description": "Mars in Kendra in own/exaltation sign. Bestows courage, leadership, and military success.",
                "strength": "Very Strong"
            })
    
    # Bhadra Yoga - Mercury in Kendra in own/exaltation sign
    if mercury and mercury["house"] in [1, 4, 7, 10]:
        if mercury["sign"] in ["Gemini", "Virgo"]:
            yogas.append({
                "name": "Bhadra Yoga",
                "type": "Panch Mahapurusha",
                "planets": ["Mercury"],
                "description": "Mercury in Kendra in own/exaltation sign. Bestows intelligence, eloquence, and business acumen.",
                "strength": "Very Strong"
            })
    
    # Hamsa Yoga - Jupiter in Kendra in own/exaltation sign
    if jupiter and jupiter["house"] in [1, 4, 7, 10]:
        if jupiter["sign"] in ["Sagittarius", "Pisces", "Cancer"]:
            yogas.append({
                "name": "Hamsa Yoga",
                "type": "Panch Mahapurusha",
                "planets": ["Jupiter"],
                "description": "Jupiter in Kendra in own/exaltation sign. Bestows wisdom, spirituality, and good fortune.",
                "strength": "Very Strong"
            })
    
    # Malavya Yoga - Venus in Kendra in own/exaltation sign
    venus = planet_dict.get("Venus")
    if venus and venus["house"] in [1, 4, 7, 10]:
        if venus["sign"] in ["Taurus", "Libra", "Pisces"]:
            yogas.append({
                "name": "Malavya Yoga",
                "type": "Panch Mahapurusha",
                "planets": ["Venus"],
                "description": "Venus in Kendra in own/exaltation sign. Bestows beauty, luxury, artistic talents, and happy marriage.",
                "strength": "Very Strong"
            })
    
    # Shasha Yoga - Saturn in Kendra in own/exaltation sign
    saturn = planet_dict.get("Saturn")
    if saturn and saturn["house"] in [1, 4, 7, 10]:
        if saturn["sign"] in ["Capricorn", "Aquarius", "Libra"]:
            yogas.append({
                "name": "Shasha Yoga",
                "type": "Panch Mahapurusha",
                "planets": ["Saturn"],
                "description": "Saturn in Kendra in own/exaltation sign. Bestows authority, discipline, and success through hard work.",
                "strength": "Very Strong"
            })
    
    # 5. RAJ YOGA - Lords of Kendra and Trikona in conjunction or mutual aspect
    kendra_lords = [house_lords[1], house_lords[4], house_lords[7], house_lords[10]]
    trikona_lords = [house_lords[1], house_lords[5], house_lords[9]]
    
    for kendra_lord in kendra_lords:
        for trikona_lord in trikona_lords:
            if kendra_lord != trikona_lord:
                kl_planet = planet_dict.get(kendra_lord)
                tl_planet = planet_dict.get(trikona_lord)
                if kl_planet and tl_planet and kl_planet["house"] == tl_planet["house"]:
                    yogas.append({
                        "name": "Raj Yoga",
                        "type": "Power & Authority",
                        "planets": [kendra_lord, trikona_lord],
                        "description": f"Conjunction of Kendra lord ({kendra_lord}) and Trikona lord ({trikona_lord}). Indicates rise to power and authority.",
                        "strength": "Strong"
                    })
                    break
        else:
            continue
        break
    
    # 6. DHANA YOGA - Lords of 2nd and 11th in conjunction or exchange
    lord_2 = house_lords[2]
    lord_11 = house_lords[11]
    l2_planet = planet_dict.get(lord_2)
    l11_planet = planet_dict.get(lord_11)
    
    if l2_planet and l11_planet:
        if l2_planet["house"] == l11_planet["house"]:
            yogas.append({
                "name": "Dhana Yoga",
                "type": "Wealth",
                "planets": [lord_2, lord_11],
                "description": f"Lords of 2nd ({lord_2}) and 11th ({lord_11}) houses in conjunction. Indicates accumulation of wealth.",
                "strength": "Strong"
            })
    
    # 7. NEECHA BHANGA RAJ YOGA - Debilitated planet with cancellation
    for planet in planets:
        if planet["sign"] == DEBILITATION_SIGNS.get(planet["name"]):
            # Check for cancellation
            sign_lord = SIGN_LORDS.get(planet["sign"])
            sign_lord_planet = planet_dict.get(sign_lord)
            
            # Cancellation if sign lord is in Kendra from Lagna or Moon
            if sign_lord_planet and sign_lord_planet["house"] in [1, 4, 7, 10]:
                yogas.append({
                    "name": "Neecha Bhanga Raj Yoga",
                    "type": "Rise from Adversity",
                    "planets": [planet["name"], sign_lord],
                    "description": f"Debilitated {planet['name']} has cancellation through {sign_lord} in Kendra. Indicates rise from humble beginnings to great heights.",
                    "strength": "Strong"
                })
    
    # 8. VIPARITA RAJ YOGA - Lords of 6th, 8th, 12th in each other's houses
    lord_6 = house_lords[6]
    lord_8 = house_lords[8]
    lord_12 = house_lords[12]
    
    l6_planet = planet_dict.get(lord_6)
    l8_planet = planet_dict.get(lord_8)
    l12_planet = planet_dict.get(lord_12)
    
    if l6_planet and l8_planet:
        if l6_planet["house"] == 8 or l8_planet["house"] == 6:
            yogas.append({
                "name": "Viparita Raj Yoga",
                "type": "Success through Adversity",
                "planets": [lord_6, lord_8],
                "description": "Lords of 6th and 8th houses in exchange. Success comes through overcoming enemies and obstacles.",
                "strength": "Moderate"
            })
    
    return yogas


# ============================================
# PLANETARY STRENGTH (SHADBALA SIMPLIFIED)
# ============================================

def calculate_planetary_strength(planet: Dict, asc_sign: str) -> Dict:
    """
    Calculate simplified planetary strength based on various factors.
    """
    strength_score = 0
    strength_factors = []
    
    planet_name = planet["name"]
    planet_sign = planet["sign"]
    planet_house = planet["house"]
    planet_degree = planet["degree"]
    
    # 1. Sthana Bala (Positional Strength)
    # Exaltation
    if planet_sign == EXALTATION_SIGNS.get(planet_name):
        strength_score += 60
        strength_factors.append({"factor": "Exalted", "points": 60, "description": f"{planet_name} is exalted in {planet_sign}"})
    # Own Sign
    elif planet_sign in OWN_SIGNS.get(planet_name, []):
        strength_score += 45
        strength_factors.append({"factor": "Own Sign", "points": 45, "description": f"{planet_name} is in its own sign {planet_sign}"})
    # Moolatrikona
    elif planet_name in MOOLATRIKONA:
        mt = MOOLATRIKONA[planet_name]
        if planet_sign == mt["sign"] and mt["start"] <= planet_degree <= mt["end"]:
            strength_score += 50
            strength_factors.append({"factor": "Moolatrikona", "points": 50, "description": f"{planet_name} is in Moolatrikona"})
    # Debilitation
    elif planet_sign == DEBILITATION_SIGNS.get(planet_name):
        strength_score -= 30
        strength_factors.append({"factor": "Debilitated", "points": -30, "description": f"{planet_name} is debilitated in {planet_sign}"})
    # Friendly Sign
    elif planet_name in PLANETARY_FRIENDS:
        sign_lord = SIGN_LORDS.get(planet_sign)
        if sign_lord in PLANETARY_FRIENDS[planet_name]["friends"]:
            strength_score += 30
            strength_factors.append({"factor": "Friendly Sign", "points": 30, "description": f"{planet_name} is in friendly sign ruled by {sign_lord}"})
        elif sign_lord in PLANETARY_FRIENDS[planet_name]["enemies"]:
            strength_score -= 15
            strength_factors.append({"factor": "Enemy Sign", "points": -15, "description": f"{planet_name} is in enemy sign ruled by {sign_lord}"})
    
    # 2. Dig Bala (Directional Strength)
    if planet_name in DIG_BALA:
        if planet_house == DIG_BALA[planet_name]:
            strength_score += 40
            strength_factors.append({"factor": "Dig Bala", "points": 40, "description": f"{planet_name} has directional strength in house {planet_house}"})
    
    # 3. Retrograde (Chesta Bala component)
    if planet.get("retrograde"):
        strength_score += 20
        strength_factors.append({"factor": "Retrograde", "points": 20, "description": f"{planet_name} is retrograde, gaining strength"})
    
    # 4. House Position
    if planet_house in [1, 4, 7, 10]:  # Kendra
        strength_score += 25
        strength_factors.append({"factor": "Kendra Position", "points": 25, "description": f"{planet_name} is in Kendra house {planet_house}"})
    elif planet_house in [5, 9]:  # Trikona
        strength_score += 20
        strength_factors.append({"factor": "Trikona Position", "points": 20, "description": f"{planet_name} is in Trikona house {planet_house}"})
    elif planet_house in [6, 8, 12]:  # Dusthana
        strength_score -= 20
        strength_factors.append({"factor": "Dusthana Position", "points": -20, "description": f"{planet_name} is in Dusthana house {planet_house}"})
    
    # Determine strength level
    if strength_score >= 80:
        strength_level = "Very Strong"
    elif strength_score >= 50:
        strength_level = "Strong"
    elif strength_score >= 20:
        strength_level = "Moderate"
    elif strength_score >= 0:
        strength_level = "Weak"
    else:
        strength_level = "Very Weak"
    
    return {
        "planet": planet_name,
        "total_score": strength_score,
        "strength_level": strength_level,
        "factors": strength_factors
    }


# ============================================
# ASHTAKAVARGA SYSTEM
# ============================================

def calculate_ashtakavarga(planets: List[Dict]) -> Dict:
    """
    Calculate Ashtakavarga points for transit predictions.
    This is a simplified version focusing on key benefic points.
    """
    # Benefic points contributed by each planet to each sign
    # This is a simplified representation of the traditional Ashtakavarga
    
    planet_dict = {p["name"]: p for p in planets}
    
    # Initialize Sarvashtakavarga (combined points for all signs)
    sarvashtakavarga = {sign: 0 for sign in SIGNS}
    
    # Planet-specific Ashtakavarga
    planet_ashtakavarga = {}
    
    for planet_name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
        planet = planet_dict.get(planet_name)
        if not planet:
            continue
        
        planet_sign_index = SIGNS.index(planet["sign"])
        points = {sign: 0 for sign in SIGNS}
        
        # Simplified benefic point calculation based on traditional rules
        # Each planet contributes points to certain houses from its position
        
        # Benefic houses from planet's position (simplified)
        if planet_name == "Sun":
            benefic_houses = [1, 2, 4, 7, 8, 9, 10, 11]
        elif planet_name == "Moon":
            benefic_houses = [1, 3, 6, 7, 10, 11]
        elif planet_name == "Mars":
            benefic_houses = [1, 2, 4, 7, 8, 10, 11]
        elif planet_name == "Mercury":
            benefic_houses = [1, 2, 4, 6, 8, 10, 11]
        elif planet_name == "Jupiter":
            benefic_houses = [1, 2, 3, 4, 7, 8, 10, 11]
        elif planet_name == "Venus":
            benefic_houses = [1, 2, 3, 4, 5, 8, 9, 11]
        elif planet_name == "Saturn":
            benefic_houses = [3, 5, 6, 11]
        else:
            benefic_houses = []
        
        for house_offset in benefic_houses:
            benefic_sign_index = (planet_sign_index + house_offset - 1) % 12
            benefic_sign = SIGNS[benefic_sign_index]
            points[benefic_sign] += 1
            sarvashtakavarga[benefic_sign] += 1
        
        planet_ashtakavarga[planet_name] = {
            "points": points,
            "total": sum(points.values())
        }
    
    # Identify strong and weak signs
    avg_points = sum(sarvashtakavarga.values()) / 12
    strong_signs = [sign for sign, pts in sarvashtakavarga.items() if pts >= avg_points + 5]
    weak_signs = [sign for sign, pts in sarvashtakavarga.items() if pts <= avg_points - 5]
    
    return {
        "sarvashtakavarga": sarvashtakavarga,
        "planet_ashtakavarga": planet_ashtakavarga,
        "average_points": round(avg_points, 1),
        "strong_signs": strong_signs,
        "weak_signs": weak_signs,
        "interpretation": {
            "strong_signs_meaning": "Transits through these signs bring favorable results",
            "weak_signs_meaning": "Transits through these signs may bring challenges"
        }
    }


# ============================================
# MUHURTA (AUSPICIOUS TIMING)
# ============================================

def calculate_muhurta(
    date: datetime,
    latitude: float,
    longitude: float,
    event_type: str = "general"
) -> Dict:
    """
    Calculate auspicious timing (Muhurta) for a given date.
    """
    hour = 12.0  # Noon
    jd = datetime_to_julian_day(date, hour)
    ayanamsa = get_ayanamsa(jd)
    
    # Get Moon position
    if SWISSEPH_AVAILABLE:
        moon_pos = get_planet_position(jd, PLANET_IDS["Moon"], ayanamsa)
        sun_pos = get_planet_position(jd, PLANET_IDS["Sun"], ayanamsa)
    else:
        moon_pos = {"longitude": 0}
        sun_pos = {"longitude": 0}
    
    moon_lon = moon_pos["longitude"]
    sun_lon = sun_pos["longitude"]
    
    # Calculate Tithi
    tithi_angle = (moon_lon - sun_lon) % 360
    tithi_num = int(tithi_angle / 12) + 1
    
    tithis = [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
    ]
    tithi_name = tithis[(tithi_num - 1) % 15]
    
    # Calculate Nakshatra
    nakshatra = longitude_to_nakshatra(moon_lon)
    
    # Calculate Yoga
    yoga_angle = (moon_lon + sun_lon) % 360
    yoga_num = int(yoga_angle / (360/27)) + 1
    
    yogas_list = [
        "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
        "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
        "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
        "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
        "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
        "Indra", "Vaidhriti"
    ]
    yoga_name = yogas_list[(yoga_num - 1) % 27]
    
    # Calculate Karana
    karana_num = int(tithi_angle / 6) % 11
    karanas = [
        "Bava", "Balava", "Kaulava", "Taitila", "Gara",
        "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"
    ]
    karana_name = karanas[karana_num]
    
    # Determine auspiciousness based on event type
    auspicious_tithis = {
        "general": [2, 3, 5, 7, 10, 11, 12, 13],
        "marriage": [2, 3, 5, 7, 10, 11, 12, 13],
        "business": [2, 3, 5, 6, 7, 10, 11, 12, 13],
        "travel": [2, 3, 5, 7, 10, 11],
        "griha_pravesh": [2, 3, 5, 7, 10, 11, 12, 13]
    }
    
    auspicious_nakshatras = {
        "general": ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"],
        "marriage": ["Rohini", "Mrigashira", "Magha", "Uttara Phalguni", "Hasta", "Swati", "Anuradha", "Mula", "Uttara Ashadha", "Shravana", "Uttara Bhadrapada", "Revati"],
        "business": ["Ashwini", "Rohini", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Revati"],
        "travel": ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Anuradha", "Shravana", "Revati"],
        "griha_pravesh": ["Rohini", "Mrigashira", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Uttara Ashadha", "Shravana", "Dhanishta", "Uttara Bhadrapada", "Revati"]
    }
    
    event_tithis = auspicious_tithis.get(event_type, auspicious_tithis["general"])
    event_nakshatras = auspicious_nakshatras.get(event_type, auspicious_nakshatras["general"])
    
    tithi_auspicious = tithi_num in event_tithis
    nakshatra_auspicious = nakshatra["name"] in event_nakshatras
    
    # Avoid Vishti Karana (Bhadra)
    karana_auspicious = karana_name != "Vishti"
    
    # Overall auspiciousness
    auspicious_count = sum([tithi_auspicious, nakshatra_auspicious, karana_auspicious])
    
    if auspicious_count == 3:
        overall = "Highly Auspicious"
    elif auspicious_count == 2:
        overall = "Auspicious"
    elif auspicious_count == 1:
        overall = "Moderately Auspicious"
    else:
        overall = "Not Recommended"
    
    return {
        "date": date.isoformat(),
        "event_type": event_type,
        "panchang": {
            "tithi": {"name": tithi_name, "number": tithi_num, "auspicious": tithi_auspicious},
            "nakshatra": {"name": nakshatra["name"], "pada": nakshatra["pada"], "auspicious": nakshatra_auspicious},
            "yoga": {"name": yoga_name, "number": yoga_num},
            "karana": {"name": karana_name, "auspicious": karana_auspicious}
        },
        "overall_auspiciousness": overall,
        "recommendation": f"This date is {overall.lower()} for {event_type}.",
        "factors": {
            "tithi_favorable": tithi_auspicious,
            "nakshatra_favorable": nakshatra_auspicious,
            "karana_favorable": karana_auspicious
        }
    }


# ============================================
# TRANSIT ANALYSIS (GOCHAR)
# ============================================

def calculate_current_transits(
    birth_chart: Dict,
    transit_date: Optional[datetime] = None
) -> Dict:
    """
    Calculate current planetary transits and their effects on the birth chart.
    """
    if transit_date is None:
        transit_date = datetime.now()
    
    hour = 12.0
    jd = datetime_to_julian_day(transit_date, hour)
    ayanamsa = get_ayanamsa(jd)
    
    # Get current planetary positions
    transit_planets = []
    
    for planet_name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
        if SWISSEPH_AVAILABLE:
            planet_id = PLANET_IDS.get(planet_name, 0)
            pos = get_planet_position(jd, planet_id, ayanamsa)
        else:
            pos = {"longitude": 0, "retrograde": False}
        
        sign_index, degree = longitude_to_sign(pos["longitude"])
        nakshatra = longitude_to_nakshatra(pos["longitude"])
        
        transit_planets.append({
            "name": planet_name,
            "sign": SIGNS[sign_index],
            "degree": round(degree, 2),
            "nakshatra": nakshatra["name"],
            "retrograde": pos.get("retrograde", False)
        })
    
    # Add Rahu/Ketu
    if SWISSEPH_AVAILABLE:
        rahu_pos, ketu_pos = get_rahu_ketu_positions(jd, ayanamsa)
    else:
        rahu_pos = {"longitude": 0}
        ketu_pos = {"longitude": 180}
    
    for node_name, node_pos in [("Rahu", rahu_pos), ("Ketu", ketu_pos)]:
        sign_index, degree = longitude_to_sign(node_pos["longitude"])
        nakshatra = longitude_to_nakshatra(node_pos["longitude"])
        transit_planets.append({
            "name": node_name,
            "sign": SIGNS[sign_index],
            "degree": round(degree, 2),
            "nakshatra": nakshatra["name"],
            "retrograde": True
        })
    
    # Analyze transit effects on birth chart
    birth_moon_sign = birth_chart.get("moon_sign", "Aries")
    birth_moon_index = SIGNS.index(birth_moon_sign)
    
    transit_effects = []
    
    for transit in transit_planets:
        transit_sign_index = SIGNS.index(transit["sign"])
        house_from_moon = ((transit_sign_index - birth_moon_index) % 12) + 1
        
        # Determine effect based on house from Moon
        if transit["name"] in ["Jupiter", "Venus", "Mercury", "Moon"]:
            # Benefic planets
            if house_from_moon in [2, 5, 7, 9, 11]:
                effect = "Favorable"
            elif house_from_moon in [6, 8, 12]:
                effect = "Challenging"
            else:
                effect = "Neutral"
        else:
            # Malefic planets (Sun, Mars, Saturn, Rahu, Ketu)
            if house_from_moon in [3, 6, 11]:
                effect = "Favorable"
            elif house_from_moon in [1, 4, 7, 8, 10, 12]:
                effect = "Challenging"
            else:
                effect = "Neutral"
        
        transit_effects.append({
            "planet": transit["name"],
            "current_sign": transit["sign"],
            "house_from_moon": house_from_moon,
            "effect": effect,
            "retrograde": transit["retrograde"]
        })
    
    # Major transit highlights
    highlights = []
    
    saturn_transit = next((t for t in transit_effects if t["planet"] == "Saturn"), None)
    if saturn_transit:
        if saturn_transit["house_from_moon"] in [12, 1, 2]:
            highlights.append({
                "type": "Sade Sati",
                "description": f"Saturn is transiting {saturn_transit['house_from_moon']}th from Moon. This is the Sade Sati period requiring patience and hard work.",
                "severity": "Major"
            })
    
    jupiter_transit = next((t for t in transit_effects if t["planet"] == "Jupiter"), None)
    if jupiter_transit and jupiter_transit["effect"] == "Favorable":
        highlights.append({
            "type": "Jupiter Blessing",
            "description": f"Jupiter is transiting favorably in {jupiter_transit['house_from_moon']}th from Moon. Good time for growth and opportunities.",
            "severity": "Positive"
        })
    
    return {
        "transit_date": transit_date.isoformat(),
        "birth_moon_sign": birth_moon_sign,
        "current_transits": transit_planets,
        "transit_effects": transit_effects,
        "highlights": highlights,
        "summary": {
            "favorable_transits": len([t for t in transit_effects if t["effect"] == "Favorable"]),
            "challenging_transits": len([t for t in transit_effects if t["effect"] == "Challenging"]),
            "neutral_transits": len([t for t in transit_effects if t["effect"] == "Neutral"])
        }
    }


def calculate_compatibility(chart1: Dict, chart2: Dict) -> Dict:
    moon_sign1 = chart1.get("moon_sign", "Aries")
    moon_sign2 = chart2.get("moon_sign", "Aries")
    
    nakshatra1 = chart1.get("nakshatra", "Ashwini")
    nakshatra2 = chart2.get("nakshatra", "Ashwini")
    
    sign_index1 = SIGNS.index(moon_sign1) if moon_sign1 in SIGNS else 0
    sign_index2 = SIGNS.index(moon_sign2) if moon_sign2 in SIGNS else 0
    
    diff = abs(sign_index1 - sign_index2)
    
    varna_score = 1 if diff in [0, 4, 8] else 0
    vashya_score = 2 if diff in [0, 1, 5, 9] else 1 if diff in [2, 6, 10] else 0
    tara_score = 3 if diff % 3 == 0 else 1.5
    yoni_score = 4 if diff in [0, 4, 8] else 2 if diff in [2, 6, 10] else 1
    graha_maitri_score = 5 if diff in [0, 4, 8] else 3 if diff in [1, 5, 9] else 1
    gana_score = 6 if diff in [0, 4, 8] else 3 if diff in [1, 5, 9] else 0
    bhakoot_score = 7 if diff in [0, 4, 8] else 3.5 if diff in [2, 6, 10] else 0
    nadi_score = 8 if diff not in [0, 4, 8] else 0
    
    total_score = varna_score + vashya_score + tara_score + yoni_score + graha_maitri_score + gana_score + bhakoot_score + nadi_score
    
    if total_score >= 28:
        compatibility_level = "Excellent"
    elif total_score >= 21:
        compatibility_level = "Good"
    elif total_score >= 14:
        compatibility_level = "Average"
    else:
        compatibility_level = "Challenging"
    
    return {
        "overall_score": round(total_score, 1),
        "max_score": 36,
        "percentage": round(total_score / 36 * 100, 1),
        "compatibility_level": compatibility_level,
        "guna_milan": {
            "varna": {"score": varna_score, "max": 1, "description": "Spiritual compatibility"},
            "vashya": {"score": vashya_score, "max": 2, "description": "Dominance/control"},
            "tara": {"score": tara_score, "max": 3, "description": "Birth star compatibility"},
            "yoni": {"score": yoni_score, "max": 4, "description": "Physical compatibility"},
            "graha_maitri": {"score": graha_maitri_score, "max": 5, "description": "Mental compatibility"},
            "gana": {"score": gana_score, "max": 6, "description": "Temperament"},
            "bhakoot": {"score": bhakoot_score, "max": 7, "description": "Relative moon positions"},
            "nadi": {"score": nadi_score, "max": 8, "description": "Health and genes"},
            "total": round(total_score, 1),
            "max": 36,
            "percentage": round(total_score / 36 * 100, 1)
        },
        "analysis": {
            "moon_compatibility": compatibility_level,
            "nakshatra_compatibility": "Good" if diff < 6 else "Average",
            "dosha_compatibility": "Check individual charts for dosha analysis"
        },
        "person1": {
            "moon_sign": moon_sign1,
            "nakshatra": nakshatra1
        },
        "person2": {
            "moon_sign": moon_sign2,
            "nakshatra": nakshatra2
        }
    }
