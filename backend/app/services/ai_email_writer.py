"""AI Cold Email Writer — Template-based intelligent email generation.
100% free, no external APIs. Uses rule-based templates with smart variable substitution.
"""
import logging
import random
from typing import Optional

logger = logging.getLogger(__name__)

# Industry-specific opening lines
OPENERS = {
    "default": [
        "I came across your profile and was impressed by your work.",
        "I noticed your business has been growing and wanted to connect.",
        "Your expertise in this area caught my attention.",
        "I've been following your work and see a great opportunity to collaborate.",
    ],
    "restaurant": [
        "I noticed your restaurant has great reviews and wanted to reach out.",
        "Your establishment caught my eye — I think I can help you grow further.",
        "As a fellow food industry professional, I wanted to connect.",
    ],
    "tech": [
        "I came across your tech company and was intrigued by your product.",
        "Your innovative approach to technology caught my attention.",
        "I see you're building something exciting in the tech space.",
    ],
    "real_estate": [
        "I noticed your impressive property listings and wanted to connect.",
        "Your real estate portfolio is impressive — let's discuss opportunities.",
        "I work with real estate professionals and think we could partner.",
    ],
    "marketing": [
        "Your marketing work has been impressive — I'd love to discuss synergies.",
        "I noticed your agency's portfolio and was impressed.",
        "Your creative campaigns caught my eye.",
    ],
    "healthcare": [
        "I noticed your practice and wanted to discuss how I can help grow your patient base.",
        "Your healthcare practice seems to be thriving — I'd love to explore collaboration.",
    ],
    "ecommerce": [
        "Your online store caught my attention — great product lineup!",
        "I noticed your e-commerce business and see growth opportunities.",
    ],
    "finance": [
        "Your financial services caught my attention — I'd like to discuss partnership.",
        "I noticed your firm's excellent reputation and wanted to connect.",
    ],
}

# Value propositions
VALUE_PROPS = {
    "default": [
        "I help businesses like yours increase their online presence and generate more leads.",
        "I specialize in helping businesses grow their customer base through targeted strategies.",
        "My team has helped similar businesses increase their revenue by 30-50%.",
    ],
    "seo": [
        "I can help improve your Google rankings and drive more organic traffic.",
        "My SEO strategies have helped businesses rank #1 for their target keywords.",
    ],
    "social_media": [
        "I can help you build a stronger social media presence that converts followers into customers.",
        "My social media strategies have helped businesses 3x their engagement.",
    ],
    "web_design": [
        "I can help redesign your website to increase conversions and user engagement.",
        "A modern website redesign could significantly boost your online presence.",
    ],
    "lead_gen": [
        "I help businesses generate qualified leads that convert into paying customers.",
        "My lead generation strategies have helped businesses fill their pipeline consistently.",
    ],
}

# Call-to-action templates
CTAS = [
    "Would you be open to a quick 15-minute call this week?",
    "Would you like to schedule a brief call to discuss this further?",
    "Are you available for a quick chat sometime this week?",
    "Can I send you a brief proposal outlining how I can help?",
    "Would you be interested in a free consultation to explore this?",
    "Let me know if you'd like to see some case studies of similar work.",
]

# Full email templates with different tones
TEMPLATES = {
    "professional": {
        "subject": "{{service}} opportunity for {{company}}",
        "body": """Hi {{name}},

{{opener}}

{{value_prop}}

{{cta}}

Best regards,
{{from_name}}""",
    },
    "casual": {
        "subject": "Quick question about {{company}}",
        "body": """Hey {{name}},

{{opener}}

{{value_prop}}

{{cta}}

Cheers,
{{from_name}}""",
    },
    "direct": {
        "subject": "{{service}} for {{company}} — quick question",
        "body": """{{name}},

I'll keep this brief.

{{value_prop}}

{{cta}}

{{from_name}}""",
    },
    "value_first": {
        "subject": "Free {{service}} audit for {{company}}",
        "body": """Hi {{name}},

I took a quick look at {{company}}'s online presence and noticed a few areas where you could improve:

1. {{suggestion_1}}
2. {{suggestion_2}}
3. {{suggestion_3}}

I put together these insights for free — no strings attached.

{{cta}}

Best,
{{from_name}}""",
    },
    "referral": {
        "subject": "Referred to you — {{service}} opportunity",
        "body": """Hi {{name}},

I was researching companies in your industry and {{company}} stood out for all the right reasons.

{{value_prop}}

{{cta}}

Looking forward to connecting,
{{from_name}}""",
    },
    "follow_up": {
        "subject": "Following up — {{service}} for {{company}}",
        "body": """Hi {{name}},

I wanted to follow up on my previous email. I know you're busy, so I'll keep this short.

{{value_prop}}

If now isn't the right time, no worries — just let me know and I'll circle back later.

Best,
{{from_name}}""",
    },
}

# Suggestions for value_first template
SUGGESTIONS = {
    "seo": [
        "Your website could rank higher for key industry terms with some on-page optimization",
        "Your Google Business Profile has room for improvement with more photos and regular posts",
        "Building quality backlinks from industry directories could boost your domain authority",
    ],
    "social_media": [
        "Your social media posting frequency could be optimized for better engagement",
        "Video content could significantly increase your reach and follower count",
        "Engaging with industry hashtags could expose you to a wider audience",
    ],
    "web_design": [
        "Your website's mobile experience could be improved for better user retention",
        "Page load speed optimization could reduce your bounce rate significantly",
        "A clearer call-to-action on your homepage could increase conversions",
    ],
    "default": [
        "Your online presence has untapped potential that could drive more customers",
        "Competitor analysis shows opportunities in areas they aren't covering",
        "A few strategic improvements could significantly increase your inbound leads",
    ],
}


def generate_cold_email(
    lead: dict,
    tone: str = "professional",
    service: str = "",
    industry: str = "default",
    from_name: str = "",
    custom_opener: str = "",
    custom_value_prop: str = "",
    custom_cta: str = "",
) -> dict:
    """
    Generate a personalized cold email for a lead.
    Returns dict with 'subject' and 'body' keys.
    """
    name = lead.get("name", "there") or "there"
    company = lead.get("company", "your company") or "your company"
    email = lead.get("email", "")
    platform = lead.get("platform", "")

    # Select template
    template = TEMPLATES.get(tone, TEMPLATES["professional"])

    # Select opener
    opener = custom_opener or random.choice(
        OPENERS.get(industry, OPENERS["default"])
    )

    # Select value prop
    service_key = _detect_service_category(service)
    value_prop = custom_value_prop or random.choice(
        VALUE_PROPS.get(service_key, VALUE_PROPS["default"])
    )

    # Select CTA
    cta = custom_cta or random.choice(CTAS)

    # Get suggestions for value_first template
    suggestions = SUGGESTIONS.get(service_key, SUGGESTIONS["default"])

    # Build variables
    variables = {
        "{{name}}": _capitalize_name(name),
        "{{company}}": company,
        "{{email}}": email,
        "{{platform}}": platform.replace("_", " ").title(),
        "{{service}}": service or "Growth Strategy",
        "{{from_name}}": from_name or "Your Name",
        "{{opener}}": opener,
        "{{value_prop}}": value_prop,
        "{{cta}}": cta,
        "{{suggestion_1}}": suggestions[0] if len(suggestions) > 0 else "",
        "{{suggestion_2}}": suggestions[1] if len(suggestions) > 1 else "",
        "{{suggestion_3}}": suggestions[2] if len(suggestions) > 2 else "",
    }

    subject = template["subject"]
    body = template["body"]

    for key, value in variables.items():
        subject = subject.replace(key, value)
        body = body.replace(key, value)

    return {
        "subject": subject,
        "body": body,
        "tone": tone,
        "industry": industry,
    }


def generate_bulk_emails(
    leads: list[dict],
    tone: str = "professional",
    service: str = "",
    industry: str = "default",
    from_name: str = "",
) -> list[dict]:
    """Generate personalized emails for multiple leads."""
    results = []
    for lead in leads:
        email_data = generate_cold_email(
            lead=lead,
            tone=tone,
            service=service,
            industry=industry,
            from_name=from_name,
        )
        email_data["to_email"] = lead.get("email", "")
        email_data["lead_id"] = lead.get("id", "")
        results.append(email_data)
    return results


def get_available_tones() -> list[dict]:
    """Return available email tones with descriptions."""
    return [
        {"id": "professional", "name": "Professional", "description": "Formal business tone with structured approach"},
        {"id": "casual", "name": "Casual", "description": "Friendly and approachable, less formal"},
        {"id": "direct", "name": "Direct", "description": "Short and to-the-point, no fluff"},
        {"id": "value_first", "name": "Value First", "description": "Lead with free insights and suggestions"},
        {"id": "referral", "name": "Referral Style", "description": "Position as if referred or discovered naturally"},
        {"id": "follow_up", "name": "Follow Up", "description": "For second/third touch with existing leads"},
    ]


def get_available_industries() -> list[str]:
    """Return available industry categories."""
    return list(OPENERS.keys())


def _capitalize_name(name: str) -> str:
    """Properly capitalize a name."""
    if not name or name == "there":
        return name
    return " ".join(word.capitalize() for word in name.split())


def _detect_service_category(service: str) -> str:
    """Detect service category from service description."""
    service_lower = service.lower()
    if any(w in service_lower for w in ["seo", "search", "ranking", "google"]):
        return "seo"
    if any(w in service_lower for w in ["social", "instagram", "facebook", "tiktok"]):
        return "social_media"
    if any(w in service_lower for w in ["web", "website", "design", "ui", "ux"]):
        return "web_design"
    if any(w in service_lower for w in ["lead", "sales", "prospect"]):
        return "lead_gen"
    return "default"
