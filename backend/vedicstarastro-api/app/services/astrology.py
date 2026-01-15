from datetime import datetime
from typing import Dict, List, Optional
import hashlib
import secrets

PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu", "deity": "Ashwini Kumaras"},
    {"name": "Bharani", "lord": "Venus", "deity": "Yama"},
    {"name": "Krittika", "lord": "Sun", "deity": "Agni"},
    {"name": "Rohini", "lord": "Moon", "deity": "Brahma"},
    {"name": "Mrigashira", "lord": "Mars", "deity": "Soma"},
    {"name": "Ardra", "lord": "Rahu", "deity": "Rudra"},
    {"name": "Punarvasu", "lord": "Jupiter", "deity": "Aditi"},
    {"name": "Pushya", "lord": "Saturn", "deity": "Brihaspati"},
    {"name": "Ashlesha", "lord": "Mercury", "deity": "Nagas"},
    {"name": "Magha", "lord": "Ketu", "deity": "Pitris"},
    {"name": "Purva Phalguni", "lord": "Venus", "deity": "Bhaga"},
    {"name": "Uttara Phalguni", "lord": "Sun", "deity": "Aryaman"},
    {"name": "Hasta", "lord": "Moon", "deity": "Savitar"},
    {"name": "Chitra", "lord": "Mars", "deity": "Vishwakarma"},
    {"name": "Swati", "lord": "Rahu", "deity": "Vayu"},
    {"name": "Vishakha", "lord": "Jupiter", "deity": "Indra-Agni"},
    {"name": "Anuradha", "lord": "Saturn", "deity": "Mitra"},
    {"name": "Jyeshtha", "lord": "Mercury", "deity": "Indra"},
    {"name": "Mula", "lord": "Ketu", "deity": "Nirriti"},
    {"name": "Purva Ashadha", "lord": "Venus", "deity": "Apas"},
    {"name": "Uttara Ashadha", "lord": "Sun", "deity": "Vishvadevas"},
    {"name": "Shravana", "lord": "Moon", "deity": "Vishnu"},
    {"name": "Dhanishta", "lord": "Mars", "deity": "Vasus"},
    {"name": "Shatabhisha", "lord": "Rahu", "deity": "Varuna"},
    {"name": "Purva Bhadrapada", "lord": "Jupiter", "deity": "Aja Ekapada"},
    {"name": "Uttara Bhadrapada", "lord": "Saturn", "deity": "Ahir Budhnya"},
    {"name": "Revati", "lord": "Mercury", "deity": "Pushan"},
]

def generate_share_token() -> str:
    return secrets.token_urlsafe(32)

def calculate_birth_chart(
    birth_date: datetime,
    birth_time: str,
    birth_place: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
) -> Dict:
    seed = int(birth_date.timestamp()) + hash(birth_time) + hash(birth_place)
    
    ascendant_index = seed % 12
    moon_index = (seed + 3) % 12
    sun_index = (birth_date.month - 1) % 12
    
    nakshatra_index = seed % 27
    nakshatra = NAKSHATRAS[nakshatra_index]
    
    planets = []
    for i, planet in enumerate(PLANETS):
        sign_index = (seed + i * 3) % 12
        degree = ((seed + i * 7) % 30) + ((seed + i) % 60) / 60
        house = ((sign_index - ascendant_index) % 12) + 1
        
        planet_nakshatra_index = (seed + i * 5) % 27
        
        planets.append({
            "name": planet,
            "sign": SIGNS[sign_index],
            "degree": round(degree, 2),
            "house": house,
            "nakshatra": NAKSHATRAS[planet_nakshatra_index]["name"],
            "retrograde": planet in ["Saturn", "Jupiter", "Mars"] and (seed + i) % 5 == 0
        })
    
    houses = []
    for i in range(12):
        house_sign_index = (ascendant_index + i) % 12
        house_planets = [p["name"] for p in planets if p["house"] == i + 1]
        houses.append({
            "house": i + 1,
            "sign": SIGNS[house_sign_index],
            "planets": house_planets
        })
    
    mangal_dosha = any(
        p["name"] == "Mars" and p["house"] in [1, 4, 7, 8, 12]
        for p in planets
    )
    
    kaal_sarp_dosha = False
    rahu_house = next((p["house"] for p in planets if p["name"] == "Rahu"), 1)
    ketu_house = next((p["house"] for p in planets if p["name"] == "Ketu"), 7)
    
    return {
        "ascendant": SIGNS[ascendant_index],
        "moon_sign": SIGNS[moon_index],
        "sun_sign": SIGNS[sun_index],
        "nakshatra": nakshatra["name"],
        "nakshatra_lord": nakshatra["lord"],
        "nakshatra_deity": nakshatra["deity"],
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
        }
    }

def get_nakshatra_from_moon(moon_degree: float) -> Dict:
    nakshatra_span = 360 / 27
    nakshatra_index = int(moon_degree / nakshatra_span) % 27
    return NAKSHATRAS[nakshatra_index]

def calculate_compatibility(chart1: Dict, chart2: Dict) -> Dict:
    moon_sign1 = chart1.get("moon_sign", "Aries")
    moon_sign2 = chart2.get("moon_sign", "Aries")
    
    sign_index1 = SIGNS.index(moon_sign1)
    sign_index2 = SIGNS.index(moon_sign2)
    
    diff = abs(sign_index1 - sign_index2)
    
    if diff in [0, 4, 8]:
        compatibility_score = 85
        compatibility_level = "Excellent"
    elif diff in [1, 5, 9]:
        compatibility_score = 70
        compatibility_level = "Good"
    elif diff in [2, 6, 10]:
        compatibility_score = 55
        compatibility_level = "Average"
    else:
        compatibility_score = 40
        compatibility_level = "Challenging"
    
    guna_milan = min(36, int(compatibility_score * 36 / 100))
    
    return {
        "overall_score": compatibility_score,
        "compatibility_level": compatibility_level,
        "guna_milan": {
            "total": guna_milan,
            "max": 36,
            "percentage": round(guna_milan / 36 * 100, 1)
        },
        "analysis": {
            "moon_compatibility": compatibility_level,
            "nakshatra_compatibility": "Good" if diff < 6 else "Average",
            "dosha_compatibility": "Check individual charts for dosha analysis"
        }
    }
