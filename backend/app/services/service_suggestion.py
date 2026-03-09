"""AI Service Suggestion Engine — Auto-suggest what services to pitch to each lead.
100% free, rule-based analysis. No external APIs needed.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Service categories with detection rules
SERVICE_CATALOG = [
    {
        "id": "website_redesign",
        "name": "Website Redesign",
        "category": "Web Development",
        "indicators": {
            "no_website": True,
            "platforms": ["google_maps", "facebook", "yellowpages", "yelp"],
        },
        "pitch": "They don't have a website — offer to build one. Easy $2-5K sale.",
        "price_range": "$2,000 - $10,000",
        "difficulty": "medium",
    },
    {
        "id": "seo_optimization",
        "name": "SEO Optimization",
        "category": "Digital Marketing",
        "indicators": {
            "has_website": True,
            "low_score": True,
            "platforms": ["google_maps", "yellowpages", "yelp"],
        },
        "pitch": "Their online visibility is low. Offer SEO to boost rankings.",
        "price_range": "$500 - $3,000/mo",
        "difficulty": "medium",
    },
    {
        "id": "social_media_management",
        "name": "Social Media Management",
        "category": "Social Media",
        "indicators": {
            "platforms": ["facebook", "instagram", "twitter", "linkedin"],
            "low_engagement": True,
        },
        "pitch": "They have social presence but it's underutilized. Offer management.",
        "price_range": "$500 - $2,000/mo",
        "difficulty": "easy",
    },
    {
        "id": "google_business_optimization",
        "name": "Google Business Profile Optimization",
        "category": "Local SEO",
        "indicators": {
            "platforms": ["google_maps"],
            "unclaimed_gbp": True,
        },
        "pitch": "Their GBP is unclaimed/unoptimized. Offer to claim and optimize.",
        "price_range": "$200 - $500",
        "difficulty": "easy",
    },
    {
        "id": "email_marketing",
        "name": "Email Marketing Setup",
        "category": "Email Marketing",
        "indicators": {
            "has_email": True,
            "business_email": True,
        },
        "pitch": "They have a business email. Help them set up email campaigns.",
        "price_range": "$300 - $1,500/mo",
        "difficulty": "easy",
    },
    {
        "id": "review_management",
        "name": "Review Management",
        "category": "Reputation",
        "indicators": {
            "platforms": ["google_maps", "yelp", "facebook"],
            "has_reviews": True,
        },
        "pitch": "Help them get more positive reviews and manage their reputation.",
        "price_range": "$200 - $800/mo",
        "difficulty": "easy",
    },
    {
        "id": "content_creation",
        "name": "Content Creation",
        "category": "Content Marketing",
        "indicators": {
            "has_website": True,
            "platforms": ["youtube", "instagram", "tiktok"],
        },
        "pitch": "They need fresh content. Offer blog posts, videos, or social content.",
        "price_range": "$500 - $3,000/mo",
        "difficulty": "medium",
    },
    {
        "id": "lead_generation",
        "name": "Lead Generation",
        "category": "Sales",
        "indicators": {
            "business_email": True,
            "has_phone": True,
        },
        "pitch": "They're actively looking for customers. Offer lead gen services.",
        "price_range": "$500 - $2,500/mo",
        "difficulty": "medium",
    },
    {
        "id": "ppc_advertising",
        "name": "PPC / Google Ads",
        "category": "Paid Advertising",
        "indicators": {
            "has_website": True,
            "platforms": ["google_maps"],
        },
        "pitch": "Set up Google Ads to drive immediate traffic to their business.",
        "price_range": "$500 - $5,000/mo",
        "difficulty": "hard",
    },
    {
        "id": "brand_identity",
        "name": "Brand Identity / Logo Design",
        "category": "Branding",
        "indicators": {
            "no_website": True,
            "new_business": True,
        },
        "pitch": "They need professional branding. Offer logo, colors, brand guide.",
        "price_range": "$500 - $3,000",
        "difficulty": "medium",
    },
    {
        "id": "video_marketing",
        "name": "Video Marketing",
        "category": "Content Marketing",
        "indicators": {
            "platforms": ["youtube"],
        },
        "pitch": "They're on YouTube. Help them create better videos that convert.",
        "price_range": "$500 - $5,000",
        "difficulty": "hard",
    },
    {
        "id": "chatbot_setup",
        "name": "Chatbot / AI Assistant Setup",
        "category": "Automation",
        "indicators": {
            "has_website": True,
            "business_email": True,
        },
        "pitch": "Add a chatbot to their website to capture leads 24/7.",
        "price_range": "$200 - $1,000",
        "difficulty": "easy",
    },
]


def suggest_services(lead: dict) -> list[dict]:
    """
    Analyze a lead and suggest relevant services to pitch.
    
    lead should contain: email, phone, name, platform, website, company,
                         quality_score, email_type, verified, category
    
    Returns list of suggested services sorted by relevance.
    """
    suggestions: list[dict] = []

    email = lead.get("email", "")
    phone = lead.get("phone", "")
    platform = lead.get("platform", "")
    website = lead.get("website", "")
    email_type = lead.get("email_type", "unknown")
    quality_score = lead.get("quality_score", 0)
    company = lead.get("company", "")
    category = lead.get("category", "")

    has_website = bool(website and website.strip())
    has_email = bool(email and email.strip())
    has_phone = bool(phone and phone.strip())
    is_business_email = email_type == "business"

    for service in SERVICE_CATALOG:
        relevance = 0
        reasons: list[str] = []
        indicators = service["indicators"]

        # Check no_website indicator
        if indicators.get("no_website") and not has_website:
            relevance += 30
            reasons.append("No website detected")

        # Check has_website indicator
        if indicators.get("has_website") and has_website:
            relevance += 15
            reasons.append("Has website")

        # Check platform match
        if platform in indicators.get("platforms", []):
            relevance += 25
            reasons.append(f"Found on {platform}")

        # Check email indicators
        if indicators.get("has_email") and has_email:
            relevance += 10
            reasons.append("Has email")

        if indicators.get("business_email") and is_business_email:
            relevance += 20
            reasons.append("Business email (not personal)")

        # Check phone indicator
        if indicators.get("has_phone") and has_phone:
            relevance += 10
            reasons.append("Has phone number")

        # Check score-based indicators
        if indicators.get("low_score") and quality_score < 50:
            relevance += 15
            reasons.append("Low quality score")

        # Only include if relevance is meaningful
        if relevance >= 20:
            suggestions.append({
                "service_id": service["id"],
                "service_name": service["name"],
                "category": service["category"],
                "relevance_score": min(relevance, 100),
                "reasons": reasons,
                "pitch": service["pitch"],
                "price_range": service["price_range"],
                "difficulty": service["difficulty"],
            })

    # Sort by relevance
    suggestions.sort(key=lambda x: -x["relevance_score"])

    return suggestions[:5]  # Top 5 suggestions


def suggest_services_bulk(leads: list[dict]) -> list[dict]:
    """Generate service suggestions for multiple leads."""
    results = []
    for lead in leads:
        suggestions = suggest_services(lead)
        results.append({
            "lead_id": lead.get("id", ""),
            "lead_email": lead.get("email", ""),
            "lead_name": lead.get("name", ""),
            "suggestions": suggestions,
        })
    return results


def get_service_catalog() -> list[dict]:
    """Return the full service catalog."""
    return SERVICE_CATALOG
