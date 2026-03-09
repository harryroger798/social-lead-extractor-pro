"""Basic Citation Checker — Check business listings across directories.
100% free, uses Google Dorking to check presence on major directories.
"""
import asyncio
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# Major business directories to check (30 sources)
CITATION_SOURCES = [
    {"name": "Google Business Profile", "domain": "google.com/maps", "importance": "critical"},
    {"name": "Yelp", "domain": "yelp.com", "importance": "critical"},
    {"name": "Facebook", "domain": "facebook.com", "importance": "critical"},
    {"name": "YellowPages", "domain": "yellowpages.com", "importance": "high"},
    {"name": "BBB", "domain": "bbb.org", "importance": "high"},
    {"name": "Bing Places", "domain": "bing.com/maps", "importance": "high"},
    {"name": "Apple Maps", "domain": "maps.apple.com", "importance": "high"},
    {"name": "LinkedIn", "domain": "linkedin.com", "importance": "high"},
    {"name": "Foursquare", "domain": "foursquare.com", "importance": "medium"},
    {"name": "TripAdvisor", "domain": "tripadvisor.com", "importance": "medium"},
    {"name": "Angi", "domain": "angi.com", "importance": "medium"},
    {"name": "Thumbtack", "domain": "thumbtack.com", "importance": "medium"},
    {"name": "MapQuest", "domain": "mapquest.com", "importance": "medium"},
    {"name": "Superpages", "domain": "superpages.com", "importance": "medium"},
    {"name": "Manta", "domain": "manta.com", "importance": "medium"},
    {"name": "CitySearch", "domain": "citysearch.com", "importance": "low"},
    {"name": "Merchant Circle", "domain": "merchantcircle.com", "importance": "low"},
    {"name": "Hotfrog", "domain": "hotfrog.com", "importance": "low"},
    {"name": "Chamber of Commerce", "domain": "chamberofcommerce.com", "importance": "low"},
    {"name": "DexKnows", "domain": "dexknows.com", "importance": "low"},
    {"name": "Brownbook", "domain": "brownbook.net", "importance": "low"},
    {"name": "eLocal", "domain": "elocal.com", "importance": "low"},
    {"name": "Cylex", "domain": "cylex.us.com", "importance": "low"},
    {"name": "Spoke", "domain": "spoke.com", "importance": "low"},
    {"name": "Bizvotes", "domain": "bizvotes.com", "importance": "low"},
    {"name": "ShowMeLocal", "domain": "showmelocal.com", "importance": "low"},
    {"name": "Local.com", "domain": "local.com", "importance": "low"},
    {"name": "EZLocal", "domain": "ezlocal.com", "importance": "low"},
    {"name": "Alignable", "domain": "alignable.com", "importance": "low"},
    {"name": "Nextdoor", "domain": "nextdoor.com", "importance": "medium"},
]


async def check_citations(
    business_name: str,
    location: str = "",
    phone: str = "",
    max_sources: int = 30,
) -> dict:
    """
    Check if a business is listed across major citation sources.
    Uses Google search to verify presence on each directory.
    
    Returns dict with found/not_found listings, score, and recommendations.
    """
    results = {
        "business_name": business_name,
        "location": location,
        "total_sources": min(max_sources, len(CITATION_SOURCES)),
        "found": [],
        "not_found": [],
        "score": 0,
        "grade": "",
        "recommendations": [],
    }

    sources_to_check = CITATION_SOURCES[:max_sources]
    search_term = f'"{business_name}"'
    if location:
        search_term += f" {location}"
    if phone:
        search_term += f" {phone}"

    # For each source, do a quick Google search to check presence
    try:
        from app.services.google_dorking import dorking_search_multi

        for source in sources_to_check:
            try:
                dork_keyword = f'site:{source["domain"]} {search_term}'
                search_results = await dorking_search_multi(
                    keywords=[dork_keyword],
                    platforms=["citation_check"],
                    pages=1,
                    delay=1.0,
                    use_patchright=False,
                    headless=True,
                )

                # Check if any results were found
                found = False
                source_url = ""
                for sr in search_results:
                    if sr.get("sources"):
                        found = True
                        source_url = sr["sources"][0]
                        break

                entry = {
                    "name": source["name"],
                    "domain": source["domain"],
                    "importance": source["importance"],
                    "url": source_url,
                }

                if found:
                    results["found"].append(entry)
                else:
                    results["not_found"].append(entry)

            except Exception as e:
                logger.debug("Citation check failed for %s: %s", source["name"], e)
                results["not_found"].append({
                    "name": source["name"],
                    "domain": source["domain"],
                    "importance": source["importance"],
                    "url": "",
                    "error": str(e),
                })

            await asyncio.sleep(0.5)  # Rate limit

    except ImportError:
        logger.warning("Google dorking module not available for citation checking")

    # Calculate score
    total = len(sources_to_check)
    found_count = len(results["found"])
    results["score"] = round((found_count / total) * 100) if total > 0 else 0

    # Grade
    score = results["score"]
    if score >= 80:
        results["grade"] = "A"
    elif score >= 60:
        results["grade"] = "B"
    elif score >= 40:
        results["grade"] = "C"
    elif score >= 20:
        results["grade"] = "D"
    else:
        results["grade"] = "F"

    # Recommendations
    critical_missing = [s for s in results["not_found"] if s.get("importance") == "critical"]
    high_missing = [s for s in results["not_found"] if s.get("importance") == "high"]

    if critical_missing:
        names = ", ".join(s["name"] for s in critical_missing)
        results["recommendations"].append(
            f"CRITICAL: Missing from {names}. These are the most important directories for local SEO."
        )

    if high_missing:
        names = ", ".join(s["name"] for s in high_missing)
        results["recommendations"].append(
            f"HIGH PRIORITY: Not listed on {names}. Adding these could significantly boost local visibility."
        )

    if results["score"] < 50:
        results["recommendations"].append(
            "Your citation score is below average. Consider a citation building campaign to improve local search rankings."
        )

    if found_count > 0 and not any(s.get("importance") == "critical" for s in results["not_found"]):
        results["recommendations"].append(
            "Good foundation! Focus on ensuring NAP (Name, Address, Phone) consistency across all listings."
        )

    return results


def get_citation_sources() -> list[dict]:
    """Return list of all citation sources we check."""
    return CITATION_SOURCES
