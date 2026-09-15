import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SCREENSHOT_DIR = ROOT / "01_企畫書" / "10頁投稿簡報" / "ui_screenshots"
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)

CHROME_BIN = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PUBLIC_URL = "https://temple-ai-os-demo-20260828.jeremy40713.chatgpt.site"
ADMIN_URL = "http://127.0.0.1:4173"

MOBILE_PAGES = [
    ("ui_home", f"{PUBLIC_URL}/", 412, 1350),
    ("ui_events", f"{PUBLIC_URL}/events", 412, 1300),
    ("ui_event_detail", f"{PUBLIC_URL}/events/evt_demo_worship_intro", 412, 1200),
    ("ui_register", f"{PUBLIC_URL}/register/evt_demo_worship_intro", 412, 1380),
    ("ui_fortune", f"{PUBLIC_URL}/fortune", 412, 1080),
    ("ui_jiao", f"{PUBLIC_URL}/jiao", 412, 1050),
    ("ui_deities", f"{PUBLIC_URL}/deities", 412, 1200),
]

def capture_all():
    print("[START] Capturing full UI screenshots with custom heights...")
    for name, url, w, h in MOBILE_PAGES:
        out_file = SCREENSHOT_DIR / f"{name}.png"
        cmd = [
            CHROME_BIN,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            f"--window-size={w},{h}",
            "--force-device-scale-factor=2",
            "--virtual-time-budget=4000",
            f"--screenshot={out_file}",
            url
        ]
        print(f"Capturing mobile: {name} ({w}x{h}) -> {url}")
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if out_file.exists():
            print(f"  [OK] {out_file.name} ({out_file.stat().st_size // 1024} KB)")

    print("[DONE] All captures complete.")

if __name__ == "__main__":
    capture_all()
