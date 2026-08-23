from __future__ import annotations

import os
import sys
import time
from dataclasses import dataclass
from typing import Any, Callable

import httpx


DEFAULT_FRONTEND_BASE_URL = "https://temple-ai-os-demo.jasonprtsai.chatgpt.site"
DEFAULT_API_BASE_URL = "https://temple-ai-os-api.onrender.com"
DEFAULT_LIFF_URL = "https://liff.line.me/2010938588-VJXpaoyH"
DEFAULT_ADD_FRIEND_URL = "https://line.me/R/ti/p/%40983zhzni"


@dataclass(frozen=True)
class Check:
    name: str
    url: str
    validate: Callable[[httpx.Response], None]
    method: str = "GET"
    json_body: dict[str, Any] | None = None


def base_url(env_key: str, default: str) -> str:
    return os.getenv(env_key, default).rstrip("/")


def expect_status(*allowed: int) -> Callable[[httpx.Response], None]:
    def validate(response: httpx.Response) -> None:
        if response.status_code not in allowed:
            raise RuntimeError(f"expected {allowed}, got {response.status_code}")

    return validate


def expect_json(predicate: Callable[[Any], bool], description: str) -> Callable[[httpx.Response], None]:
    def validate(response: httpx.Response) -> None:
        if response.status_code != 200:
            raise RuntimeError(f"expected 200, got {response.status_code}")
        data = response.json()
        if not predicate(data):
            raise RuntimeError(f"unexpected JSON payload: {description}")

    return validate


def expect_html_page(response: httpx.Response) -> None:
    if response.status_code != 200:
        raise RuntimeError(f"expected 200, got {response.status_code}")
    content_type = response.headers.get("content-type", "")
    if "text/html" not in content_type:
        raise RuntimeError(f"expected HTML, got {content_type or 'unknown content type'}")
    if "<html" not in response.text.lower():
        raise RuntimeError("response does not look like an HTML page")


def expect_image(response: httpx.Response) -> None:
    if response.status_code != 200:
        raise RuntimeError(f"expected 200, got {response.status_code}")
    content_type = response.headers.get("content-type", "")
    if not content_type.startswith("image/"):
        raise RuntimeError(f"expected image content, got {content_type or 'unknown content type'}")


def run_check(client: httpx.Client, check: Check, attempts: int = 3) -> None:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            response = client.request(check.method, check.url, json=check.json_body)
            check.validate(response)
            print(f"[OK] {check.name}: {check.url}")
            return
        except Exception as exc:
            last_error = exc
            if attempt < attempts:
                time.sleep(5 * attempt)
    raise RuntimeError(f"{check.name} failed after {attempts} attempts: {last_error}") from last_error


def main() -> None:
    frontend = base_url("PUBLIC_FRONTEND_BASE_URL", DEFAULT_FRONTEND_BASE_URL)
    api = base_url("PUBLIC_API_BASE_URL", DEFAULT_API_BASE_URL)
    liff_url = os.getenv("PUBLIC_LIFF_URL", DEFAULT_LIFF_URL)
    add_friend_url = os.getenv("PUBLIC_LINE_ADD_FRIEND_URL", DEFAULT_ADD_FRIEND_URL)

    checks = [
        Check(
            "backend health",
            f"{api}/health",
            expect_json(lambda data: data.get("data", {}).get("status") == "ok", "data.status must be ok"),
        ),
        Check(
            "events API",
            f"{api}/api/events",
            expect_json(lambda data: isinstance(data.get("data"), list) and len(data["data"]) >= 1, "events list"),
        ),
        Check(
            "temple profile API",
            f"{api}/api/temple/profile",
            expect_json(lambda data: bool(data.get("data", {}).get("name")), "temple profile name"),
        ),
        Check(
            "admin dashboard rejects anonymous access",
            f"{api}/api/admin/dashboard/summary",
            expect_status(401, 403),
        ),
        Check(
            "admin login rejects invalid credentials",
            f"{api}/api/admin/auth/login",
            expect_status(401, 403),
            method="POST",
            json_body={"username": "public-smoke-test", "password": "invalid-password"},
        ),
        Check("public site", f"{frontend}/site", expect_html_page),
        Check("community page", f"{frontend}/community", expect_html_page),
        Check("sticker page", f"{frontend}/stickers", expect_html_page),
        Check("privacy page", f"{frontend}/privacy", expect_html_page),
        Check("terms page", f"{frontend}/terms", expect_html_page),
        Check("Flex event hero image", f"{frontend}/assets/flex/event-card.png", expect_image),
        Check("LIFF entry URL", liff_url, expect_status(200, 301, 302, 303, 307, 308)),
        Check("LINE add friend URL", add_friend_url, expect_status(200, 301, 302, 303, 307, 308)),
    ]

    with httpx.Client(timeout=30, follow_redirects=True) as client:
        for check in checks:
            run_check(client, check)

    print("Public demo smoke check OK.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Public demo smoke check failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
