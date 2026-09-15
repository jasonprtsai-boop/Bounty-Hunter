#!/usr/bin/env python3
"""Keepalive and warmup script for Render free-tier service.

Render Free web services spin down after 15 minutes of inactivity.
This script provides:
  1. --warm: Immediately wake up the backend with retries and elapsed time reporting.
  2. --daemon: Run continuously and ping every N minutes to keep the instance active.
  3. Default: One-shot check.
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import datetime

import httpx


DEFAULT_URL = os.getenv("API_BASE_URL", "https://temple-ai-os-api.onrender.com").rstrip("/") + "/health"


def ping_once(client: httpx.Client, url: str) -> tuple[bool, int, float, str]:
    start = time.perf_counter()
    try:
        response = client.get(url)
        elapsed = time.perf_counter() - start
        return (response.status_code == 200, response.status_code, elapsed, response.text)
    except Exception as exc:
        elapsed = time.perf_counter() - start
        return (False, 0, elapsed, str(exc))


def warm_up(url: str, max_retries: int = 6, retry_delay: float = 10.0) -> bool:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Warming up backend: {url}")
    print("Render free instance may take 45-60s to boot from sleep. Please wait...")

    with httpx.Client(timeout=35, follow_redirects=True) as client:
        for attempt in range(1, max_retries + 1):
            ok, status, elapsed, text = ping_once(client, url)
            timestamp = datetime.now().strftime("%H:%M:%S")
            if ok:
                print(f"[{timestamp}] [READY] Status {status} in {elapsed:.2f}s! Backend is active.")
                return True
            print(f"[{timestamp}] [ATTEMPT {attempt}/{max_retries}] Status {status or 'Timeout'} after {elapsed:.2f}s. Retrying in {retry_delay}s...")
            if attempt < max_retries:
                time.sleep(retry_delay)

    print(f"[{datetime.now().strftime('%H:%M:%S')}] [FAILED] Backend warmup failed after {max_retries} attempts.")
    return False


def run_daemon(url: str, interval_seconds: int = 600) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting keepalive daemon for: {url}")
    print(f"Ping interval: {interval_seconds} seconds ({interval_seconds / 60:.1f} minutes). Press Ctrl+C to stop.")

    with httpx.Client(timeout=30, follow_redirects=True) as client:
        while True:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            ok, status, elapsed, text = ping_once(client, url)
            if ok:
                print(f"[{timestamp}] [OK] Status {status} in {elapsed:.2f}s")
            else:
                print(f"[{timestamp}] [WARN] Ping failed (status {status}) in {elapsed:.2f}s: {text[:100]}")
            time.sleep(interval_seconds)


def main() -> None:
    parser = argparse.ArgumentParser(description="Render service keepalive and warmup utility.")
    parser.add_argument("--url", default=DEFAULT_URL, help=f"URL to ping (default: {DEFAULT_URL})")
    parser.add_argument("--warm", action="store_true", help="Warm up service until responsive (useful before demos)")
    parser.add_argument("--daemon", action="store_true", help="Run continuously in background to keep service awake")
    parser.add_argument("--interval", type=int, default=600, help="Daemon ping interval in seconds (default: 600)")
    args = parser.parse_args()

    if args.warm:
        success = warm_up(args.url)
        sys.exit(0 if success else 1)
    elif args.daemon:
        try:
            run_daemon(args.url, args.interval)
        except KeyboardInterrupt:
            print("\nKeepalive daemon stopped.")
            sys.exit(0)
    else:
        with httpx.Client(timeout=15, follow_redirects=True) as client:
            ok, status, elapsed, text = ping_once(client, args.url)
            timestamp = datetime.now().strftime("%H:%M:%S")
            if ok:
                print(f"[{timestamp}] [OK] {args.url} returned {status} in {elapsed:.2f}s")
                sys.exit(0)
            else:
                print(f"[{timestamp}] [FAIL] {args.url} returned {status} in {elapsed:.2f}s: {text[:120]}")
                sys.exit(1)


if __name__ == "__main__":
    main()
