"""Basic Citation Checker — Check business listings across directories.
100% free, uses Google Dorking to check presence on major directories.

v3.5.70 fixes:
- Engine health pre-check: returns early if all search engines exhausted
- Dedicated engine reset: clears stale engine cooldowns before checking
- Per-source 15s timeout: prevents 28-minute total runtime
- Consecutive failure bail-out: stops after 5 straight zero-result checks
- Total 5-minute timeout: hard cap on entire citation check
"""
import asyncio
import logging
import re
import time
from typing import Optional

logger = logging.getLogger(__name__)

# Max consecutive zero-result sources before bailing out
_MAX_CONSECUTIVE_EMPTY = 5

# Per-source timeout (seconds) — prevents long waits on exhausted engines
_PER_SOURCE_TIMEOUT_SECS = 15

# Total citation check timeout (seconds) — hard cap
_TOTAL_TIMEOUT_SECS = 300  # 5 minutes

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


def _reset_engines_for_citation_check() -> None:
    """v3.5.70: Reset search engine cooldowns before citation checking.

    Citation checks run independently from the extraction pipeline.
    If prior extractions exhausted the engines, the citation checker
    would spend 28+ minutes on guaranteed-zero results. This resets
    the soft state (cooldowns, empty streaks) so citation checks get
    fresh engine access, without clearing hard failure history.
    """
    try:
        from app.services.multi_engine_search import reset_engine_soft_state
        reset_engine_soft_state()
        logger.info("v3.5.70: Reset engine soft state for citation check")
    except ImportError:
        logger.debug("multi_engine_search not available for engine reset")
    except Exception as exc:
        logger.debug("Engine reset for citation check failed: %s", exc)


def _check_engine_availability() -> bool:
    """v3.5.70: Quick check if at least 1 search engine is available.

    Returns True if at least one engine can accept requests right now.
    Returns False if ALL engines are in hard cooldown (consecutive_failures >= 2).
    """
    try:
        from app.services.multi_engine_search import _engine_health
        if not _engine_health:
            return True  # No health data = assume engines are fresh
        available_count = sum(
            1 for h in _engine_health.values() if h.is_available
        )
        return available_count > 0
    except ImportError:
        return True  # Module not available, assume engines work
    except Exception:
        return True  # On any error, proceed optimistically


async def check_citations(
    business_name: str,
    location: str = "",
    phone: str = "",
    max_sources: int = 30,
) -> dict:
    """Check if a business is listed across major citation sources.

    v3.5.70 improvements:
    - Resets engine cooldowns before starting (dedicated budget)
    - Pre-checks engine availability — returns early if all exhausted
    - 15s per-source timeout prevents long individual waits
    - Bails out after 5 consecutive zero-result sources
    - 5-minute total hard timeout
    """
    results: dict = {
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

    # v3.5.70: Reset engine state so prior extractions don't starve us
    _reset_engines_for_citation_check()

    # v3.5.70: Quick engine availability check after reset
    if not _check_engine_availability():
        logger.warning(
            "v3.5.70: All search engines in hard cooldown — "
            "citation check cannot proceed. Try again in a few minutes."
        )
        results["recommendations"].append(
            "Search engines are temporarily rate-limited. "
            "Please wait a few minutes and try again for accurate results."
        )
        results["grade"] = "N/A"
        return results

    # v3.5.70: Track total time + consecutive empty results
    start_time = time.monotonic()
    consecutive_empty = 0

    try:
        from app.services.google_dorking import dorking_search_multi

        for idx, source in enumerate(sources_to_check):
            # v3.5.70: Total timeout check
            elapsed = time.monotonic() - start_time
            if elapsed > _TOTAL_TIMEOUT_SECS:
                logger.info(
                    "v3.5.70: Citation check total timeout after %.0fs "
                    "(%d/%d sources checked)",
                    elapsed, idx, len(sources_to_check),
                )
                # Mark remaining sources as not_found (timed out)
                for remaining in sources_to_check[idx:]:
                    results["not_found"].append({
                        "name": remaining["name"],
                        "domain": remaining["domain"],
                        "importance": remaining["importance"],
                        "url": "",
                        "error": "timeout",
                    })
                break

            # v3.5.70: Consecutive empty bail-out
            if consecutive_empty >= _MAX_CONSECUTIVE_EMPTY:
                logger.info(
                    "v3.5.70: %d consecutive empty results — "
                    "engines likely exhausted, bailing out early "
                    "(%d/%d sources checked)",
                    consecutive_empty, idx, len(sources_to_check),
                )
                for remaining in sources_to_check[idx:]:
                    results["not_found"].append({
                        "name": remaining["name"],
                        "domain": remaining["domain"],
                        "importance": remaining["importance"],
                        "url": "",
                        "error": "engines_exhausted",
                    })
                results["recommendations"].append(
                    "Some directories could not be checked because search "
                    "engines were temporarily unavailable. Run again later "
                    "for a complete scan."
                )
                break

            try:
                dork_keyword = f'site:{source["domain"]} {search_term}'

                # v3.5.70: Per-source timeout wrapper
                search_results = await asyncio.wait_for(
                    dorking_search_multi(
                        keywords=[dork_keyword],
                        platforms=["citation_check"],
                        pages=1,
                        delay=1.0,
                        use_patchright=False,
                        headless=True,
                    ),
                    timeout=_PER_SOURCE_TIMEOUT_SECS,
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
                    consecutive_empty = 0  # Reset on success
                else:
                    results["not_found"].append(entry)
                    consecutive_empty += 1

            except asyncio.TimeoutError:
                logger.debug(
                    "v3.5.70: Citation check timed out for %s (>%ds)",
                    source["name"], _PER_SOURCE_TIMEOUT_SECS,
                )
                results["not_found"].append({
                    "name": source["name"],
                    "domain": source["domain"],
                    "importance": source["importance"],
                    "url": "",
                    "error": "timeout",
                })
                consecutive_empty += 1

            except Exception as e:
                logger.debug("Citation check failed for %s: %s", source["name"], e)
                results["not_found"].append({
                    "name": source["name"],
                    "domain": source["domain"],
                    "importance": source["importance"],
                    "url": "",
                    "error": str(e),
                })
                consecutive_empty += 1

            await asyncio.sleep(0.5)  # Rate limit between sources

    except ImportError:
        logger.warning("Google dorking module not available for citation checking")

    elapsed_total = time.monotonic() - start_time
    logger.info(
        "v3.5.70: Citation check completed in %.1fs — "
        "%d found, %d not found out of %d sources",
        elapsed_total,
        len(results["found"]),
        len(results["not_found"]),
        len(sources_to_check),
    )

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
