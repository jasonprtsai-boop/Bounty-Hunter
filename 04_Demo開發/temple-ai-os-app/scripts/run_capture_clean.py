import subprocess
from pathlib import Path

ROOT = Path(r"c:\Users\user\Desktop\賞金獵人\line")
UI_DIR = ROOT / "01_企畫書" / "10頁投稿簡報" / "ui_screenshots"
UI_DIR.mkdir(parents=True, exist_ok=True)

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
LOCAL = "http://127.0.0.1:4173"

PAGES = [
    ("full_ui_register.png", f"{LOCAL}/register/evt_demo_worship_intro", 430, 1380, 2),
    ("full_ui_events.png", f"{LOCAL}/events", 430, 1350, 2),
    ("full_ui_fortune.png", f"{LOCAL}/fortune", 430, 1050, 2),
    ("full_ui_jiao.png", f"{LOCAL}/jiao", 430, 1050, 2),
    ("full_admin_dashboard.png", f"{LOCAL}/admin", 1440, 960, 1.5),
    ("full_admin_events.png", f"{LOCAL}/admin/events", 1440, 960, 1.5),
    ("full_admin_settings.png", f"{LOCAL}/admin/settings", 1440, 960, 1.5),
]

def main():
    for name, url, w, h, scale in PAGES:
        out = UI_DIR / name
        cmd = [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            f"--window-size={w},{h}",
            f"--force-device-scale-factor={scale}",
            f"--screenshot={str(out)}",
            url
        ]
        print(f"Capturing {name} ({w}x{h})...")
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if out.exists():
            print(f"  -> OK: {name} ({out.stat().st_size // 1024} KB)")

if __name__ == "__main__":
    main()
