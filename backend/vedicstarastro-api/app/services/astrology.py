from datetime import datetime
from typing import Dict, List, Optional
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
    
    hour = parse_time(birth_time)
    jd = datetime_to_julian_day(birth_date, hour)
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
