import base64
import binascii
import hashlib
import hmac
import secrets


PASSWORD_HASH_ALGORITHM = "pbkdf2_sha256"
PBKDF2_ITERATIONS = 260_000


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}".encode("ascii"))


def hash_admin_password(password: str) -> str:
    normalized = password.strip()
    if len(normalized) < 8:
        raise ValueError("admin_password_too_short")
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        normalized.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return f"{PASSWORD_HASH_ALGORITHM}${PBKDF2_ITERATIONS}${_b64encode(salt)}${_b64encode(digest)}"


def verify_admin_password(password: str, stored_password: str) -> bool:
    normalized = password.strip()
    stored = stored_password.strip()
    if not stored:
        return False
    if not stored.startswith(f"{PASSWORD_HASH_ALGORITHM}$"):
        return hmac.compare_digest(normalized, stored)

    try:
        algorithm, iterations, salt_b64, digest_b64 = stored.split("$", 3)
        if algorithm != PASSWORD_HASH_ALGORITHM:
            return False
        salt = _b64decode(salt_b64)
        expected_digest = _b64decode(digest_b64)
        supplied_digest = hashlib.pbkdf2_hmac(
            "sha256",
            normalized.encode("utf-8"),
            salt,
            int(iterations),
        )
    except (ValueError, binascii.Error):
        return False
    return hmac.compare_digest(supplied_digest, expected_digest)
