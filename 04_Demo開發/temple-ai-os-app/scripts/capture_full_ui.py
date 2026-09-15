import subprocess
from pathlib import Path
import time

ROOT = Path(r"c:\Users\user\Desktop\賞金獵人\line")
UI_DIR = ROOT / "01_企畫書" / "10頁投稿簡報" / "ui_screenshots"
UI_DIR.mkdir(parents=True, exist_ok=True)

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
DEMO_URL = "https://temple-ai-os-demo-20260828.jeremy40713.chatgpt.site"
LOCAL_ADMIN = "http://127.0.0.1:4173"

# List of pages to capture with appropriate dimensions to ensure ZERO cutoff
PAGES = [
    # Mobile pages (iPhone width 412, appropriate height to capture full form/content)
    ("full_ui_register.png", f"{DEMO_URL}/register/evt_demo_worship_intro", 412, 1150, 2),
    ("full_ui_events.png", f"{DEMO_URL}/events", 412, 1100, 2),
    ("full_ui_fortune.png", f"{DEMO_URL}/fortune", 412, 950, 2),
    ("full_ui_home.png", f"{DEMO_URL}/", 412, 1200, 2),
    ("full_ui_jiao.png", f"{DEMO_URL}/jiao", 412, 950, 2),
    
    # Desktop Admin pages (1440 width)
    ("full_admin_settings.png", f"{LOCAL_ADMIN}/admin/settings", 1440, 960, 1.5),
    ("full_admin_events.png", f"{LOCAL_ADMIN}/admin/events", 1440, 960, 1.5),
    ("full_admin_dashboard.png", f"{LOCAL_ADMIN}/admin", 1440, 960, 1.5),
    ("full_admin_knowledge.png", f"{LOCAL_ADMIN}/admin/knowledge", 1440, 960, 1.5),
]

def capture():
    for filename, url, width, height, scale in PAGES:
        out_path = UI_DIR / filename
        cmd = [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            f"--window-size={width},{height}",
            f"--force-device-scale-factor={scale}",
            "--virtual-time-budget=3500",
            f"--screenshot={str(out_path)}",
            url
        ]
        print(f"Capturing: {filename} from {url} ({width}x{height})...")
        res = subprocess.run(cmd, capture_output=True, text=True)
        if out_path.exists() and out_path.stat().st_size > 5000:
            print(f"  [OK] {filename}: {out_path.stat().st_size // 1024} KB")
        else:
            print(f"  [FAIL] {filename}: {res.stderr}")

if __name__ == "__main__":
    capture()
