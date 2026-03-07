"""Email and phone number extraction from text content."""
import re


EMAIL_PATTERN = re.compile(
    r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b'
)

PHONE_PATTERN = re.compile(
    r'(?:\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}'
)

# Common false-positive email patterns to filter out
EMAIL_BLACKLIST_PATTERNS = [
    r'.*@example\.com$',
    r'.*@test\.com$',
    r'.*@localhost$',
    r'.*\.png$',
    r'.*\.jpg$',
    r'.*\.gif$',
    r'.*\.svg$',
    r'.*\.css$',
    r'.*\.js$',
    r'.*@.*\.wixpress\.com$',
    r'noreply@.*',
    r'no-reply@.*',
    r'mailer-daemon@.*',
]

EMAIL_BLACKLIST_COMPILED = [re.compile(p, re.IGNORECASE) for p in EMAIL_BLACKLIST_PATTERNS]


def extract_emails(text: str) -> list[str]:
    """Extract unique email addresses from text."""
    emails = EMAIL_PATTERN.findall(text)
    # Filter out false positives
    filtered = []
    seen = set()
    for email in emails:
        email_lower = email.lower()
        if email_lower in seen:
            continue
        if any(bp.match(email_lower) for bp in EMAIL_BLACKLIST_COMPILED):
            continue
        seen.add(email_lower)
        filtered.append(email)
    return filtered


def extract_phones(text: str) -> list[str]:
    """Extract unique phone numbers from text."""
    phones = PHONE_PATTERN.findall(text)
    filtered = []
    seen = set()
    for phone in phones:
        # Clean up the phone number
        cleaned = re.sub(r'[^\d+]', '', phone)
        if len(cleaned) < 7 or len(cleaned) > 15:
            continue
        if cleaned in seen:
            continue
        seen.add(cleaned)
        filtered.append(phone.strip())
    return filtered


def classify_email(email: str) -> str:
    """Classify email as personal, business, or unknown."""
    personal_domains = {
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
        'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
        'zoho.com', 'yandex.com', 'gmx.com', 'live.com',
    }
    domain = email.split('@')[-1].lower()
    if domain in personal_domains:
        return 'personal'
    elif '.' in domain:
        return 'business'
    return 'unknown'


def score_lead(email: str, phone: str, name: str, verified: bool) -> int:
    """Calculate quality score for a lead (0-100)."""
    score = 0
    if email:
        score += 30
        if classify_email(email) == 'business':
            score += 15
        elif classify_email(email) == 'personal':
            score += 10
    if phone:
        score += 20
    if name and name.strip():
        score += 15
    if verified:
        score += 20
    return min(score, 100)
