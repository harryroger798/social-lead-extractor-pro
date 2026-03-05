"""License key generation and validation service."""
import hashlib
import hmac
import random
import string
from datetime import datetime, timedelta


SECRET_KEY = "social-lead-extractor-pro-2026"


def generate_license_key() -> str:
    """Generate a unique license key in format SLEP-XXXX-XXXX-XXXX."""
    chars = string.ascii_uppercase + string.digits
    segments = []
    for _ in range(3):
        segment = "".join(random.choices(chars, k=4))
        segments.append(segment)
    return f"SLEP-{'-'.join(segments)}"


def generate_license_keys(quantity: int = 1) -> list[str]:
    """Generate multiple unique license keys."""
    keys: set[str] = set()
    while len(keys) < quantity:
        keys.add(generate_license_key())
    return list(keys)


def _compute_signature(key: str) -> str:
    """Compute HMAC signature for a license key."""
    return hmac.new(
        SECRET_KEY.encode(),
        key.encode(),
        hashlib.sha256,
    ).hexdigest()[:16]


def validate_key_format(key: str) -> bool:
    """Validate that a key matches the expected format."""
    if not key:
        return False
    parts = key.split("-")
    if len(parts) != 4:
        return False
    if parts[0] != "SLEP":
        return False
    for part in parts[1:]:
        if len(part) != 4:
            return False
        if not all(c in string.ascii_uppercase + string.digits for c in part):
            return False
    return True


def get_expiry_date(duration_months: int) -> str:
    """Calculate expiry date from now."""
    if duration_months >= 999:
        # Lifetime license - set far future date
        return (datetime.now() + timedelta(days=36500)).isoformat()
    expiry = datetime.now() + timedelta(days=duration_months * 30)
    return expiry.isoformat()
