import re


ADMIN_LOGIN_ID_MAX_LENGTH = 120
ADMIN_USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_.-]{1,80}$")
ADMIN_EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}$")


def normalize_admin_login_id(value: str) -> str:
    normalized = value.strip()[:ADMIN_LOGIN_ID_MAX_LENGTH]
    return normalized.lower() if "@" in normalized else normalized


def is_valid_admin_login_id(value: str) -> bool:
    normalized = normalize_admin_login_id(value)
    if not normalized:
        return False
    return bool(ADMIN_USERNAME_PATTERN.fullmatch(normalized) or ADMIN_EMAIL_PATTERN.fullmatch(normalized))
