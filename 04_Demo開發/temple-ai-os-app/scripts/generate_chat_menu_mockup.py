"""Generate a sleek smartphone mockup showing the LINE chatroom with the new 5-card modern menu, matching user's reference UI.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
UI_DIR = ROOT / "01_企畫書" / "10頁投稿簡報" / "ui_screenshots"
ASSETS_DIR = ROOT / "04_Demo開發" / "temple-ai-os-app" / "assets"

RICH_MENU_PATH = ASSETS_DIR / "rich-menu" / "main-2500x1686.png"
MASCOT_PATH = ASSETS_DIR / "brand" / "line-oa-profile-v2.png"
OUT_MOCKUP = UI_DIR / "mockup_chat_menu.png"

FONT_BOLD = "C:/Windows/Fonts/msjhbd.ttc"
FONT_REG = "C:/Windows/Fonts/msjh.ttc"


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    try:
        p = FONT_BOLD if bold else FONT_REG
        return ImageFont.truetype(p, size)
    except Exception:
        return ImageFont.load_default()


def build_chat_menu_mockup() -> None:
    # Phone screen dimensions: 860 x 1860
    screen_w, screen_h = 860, 1860
    screen = Image.new("RGBA", (screen_w, screen_h), (21, 25, 33, 255))
    draw = ImageDraw.Draw(screen)

    # 1. Status bar
    fnt_status = font(26, bold=True)
    draw.text((60, 24), "9:41", font=fnt_status, fill="#FFFFFF")
    # Dynamic Island pill
    draw.rounded_rectangle((330, 20, 530, 62), radius=21, fill="#000000")
    # Battery & signal
    draw.rounded_rectangle((740, 28, 790, 52), radius=6, outline="#FFFFFF", width=2)
    draw.rounded_rectangle((743, 31, 775, 49), radius=4, fill="#FFFFFF")
    draw.rounded_rectangle((791, 36, 794, 44), radius=2, fill="#FFFFFF")

    # 2. LINE Chat Header
    draw.rectangle((0, 80, screen_w, 170), fill="#1A1F29")
    # Back chevron '<'
    draw.line([(45, 125), (32, 115), (45, 105)], fill="#FFFFFF", width=4)
    # Green verified shield badge
    draw.rounded_rectangle((65, 105, 95, 135), radius=6, fill="#06C755")
    # Title
    fnt_header = font(32, bold=True)
    draw.text((108, 103), "Temple AI OS", font=fnt_header, fill="#FFFFFF")
    # Right icons: Search, Memo, Hamburger
    draw.ellipse((680, 110, 705, 135), outline="#94A3B8", width=3)
    draw.line([(700, 130), (715, 145)], fill="#94A3B8", width=3)
    for i in range(3):
        draw.line([(760, 112 + i * 9), (785, 112 + i * 9)], fill="#94A3B8", width=3)

    # 3. Chat Message Area
    # Avatar
    if MASCOT_PATH.exists():
        av = Image.open(MASCOT_PATH).convert("RGBA").resize((68, 68), Image.Resampling.LANCZOS)
        # Circular mask
        mask = Image.new("L", (68, 68), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, 68, 68), fill=255)
        screen.paste(av, (40, 200), mask)
    else:
        draw.ellipse((40, 200, 108, 268), fill="#B4281E")

    # Message Bubble
    fnt_msg = font(26, bold=False)
    msg_box = (125, 200, 480, 275)
    draw.rounded_rectangle(msg_box, radius=20, fill="#2A313E")
    draw.text((145, 218), "你好！ 智慧宮廟為您服務", font=fnt_msg, fill="#FFFFFF")

    fnt_time = font(18, bold=False)
    draw.text((495, 252), "17:39", font=fnt_time, fill="#64748B")

    # Sticker / Mascot in chat
    if MASCOT_PATH.exists():
        stk = Image.open(MASCOT_PATH).convert("RGBA").resize((280, 280), Image.Resampling.LANCZOS)
        screen.paste(stk, (290, 310), stk)
        draw.text((580, 565), "已讀 18:00", font=fnt_time, fill="#64748B")

    # 4. Rich Menu Area at bottom
    # Load newly generated rich menu and resize to fit phone width 860
    if RICH_MENU_PATH.exists():
        rm = Image.open(RICH_MENU_PATH).convert("RGBA")
        rm_h = int(screen_w * (1686 / 2500))  # ~580 px
        rm_resized = rm.resize((screen_w, rm_h), Image.Resampling.LANCZOS)
        rm_y = screen_h - rm_h - 40
        screen.paste(rm_resized, (0, rm_y), rm_resized)

    # 5. Home bar indicator at very bottom
    draw.rounded_rectangle((310, screen_h - 22, 550, screen_h - 14), radius=4, fill="#FFFFFF")

    # 6. Put into a sleek smartphone frame
    frame_w = screen_w + 36
    frame_h = screen_h + 36
    device = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
    draw_d = ImageDraw.Draw(device)
    # Outer dark titanium bezel
    draw_d.rounded_rectangle((0, 0, frame_w, frame_h), radius=68, fill="#222731", outline="#3E4758", width=4)
    # Inner black screen bezel
    draw_d.rounded_rectangle((10, 10, frame_w - 10, frame_h - 10), radius=60, fill="#0B0E14")

    # Paste screen
    device.paste(screen, (18, 18), screen)

    UI_DIR.mkdir(parents=True, exist_ok=True)
    device.save(OUT_MOCKUP, "PNG")
    print(f"[OK] Phone mockup with 5-card menu generated at:\n{OUT_MOCKUP}")


if __name__ == "__main__":
    build_chat_menu_mockup()
