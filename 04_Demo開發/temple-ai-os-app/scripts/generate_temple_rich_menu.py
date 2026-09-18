"""Generate dignified, authentic temple-style 6-card LINE Rich Menu (2500x1686 px).

Theme: 臺中萬春宮 藍興媽祖三百年古蹟殿宇美學 (Imperial Temple Aesthetic)
- Colors: 硃砂絳紅 (#751818 -> #480E0E), 廟宇泥金 (#D4AF37, #F2C94C), 沉檀深底 (#181311).
- Layout: 2 x 3 Balanced Matrix (兩排三欄 黃金宮閣排列):
    Row 1: [參拜問答] [活動報名] [抽文化籤]
    Row 2: [主殿導覽] [報名進度] [聯絡客服]
- Dimensions: 2500 x 1686 px (Standard LINE Full Rich Menu).
"""

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
ASSETS_DIR = ROOT / "04_Demo開發" / "temple-ai-os-app" / "assets" / "rich-menu"
FRONTEND_ASSETS = ROOT / "04_Demo開發" / "temple-ai-os-app" / "frontend" / "public" / "assets" / "rich-menu"
OUTPUT_DIR = ROOT / "01_企畫書" / "10頁投稿簡報"

ASSETS_DIR.mkdir(parents=True, exist_ok=True)
FRONTEND_ASSETS.mkdir(parents=True, exist_ok=True)

OUT_FILE_1 = ASSETS_DIR / "main-2500x1686.png"
OUT_FILE_2 = FRONTEND_ASSETS / "main-2500x1686.png"
OUT_PREVIEW = OUTPUT_DIR / "rich_menu_modern_preview.png"

FONT_PATH = "C:/Windows/Fonts/msjhbd.ttc"
FONT_REG_PATH = "C:/Windows/Fonts/msjh.ttc"


def get_font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    try:
        p = FONT_PATH if bold else FONT_REG_PATH
        return ImageFont.truetype(p, size)
    except Exception:
        return ImageFont.load_default()


def draw_vertical_gradient(
    box: tuple[int, int, int, int],
    top_rgb: tuple[int, int, int],
    bot_rgb: tuple[int, int, int],
    radius: int = 40,
) -> tuple[Image.Image, Image.Image]:
    x0, y0, x1, y1 = box
    w = x1 - x0
    h = y1 - y0
    mask = Image.new("L", (w, h), 0)
    draw_m = ImageDraw.Draw(mask)
    draw_m.rounded_rectangle((0, 0, w, h), radius=radius, fill=255)

    grad = Image.new("RGBA", (w, h))
    draw_g = ImageDraw.Draw(grad)
    for y in range(h):
        ratio = y / max(1, h - 1)
        curved_ratio = ratio ** 1.15
        r = int(top_rgb[0] + (bot_rgb[0] - top_rgb[0]) * curved_ratio)
        g = int(top_rgb[1] + (bot_rgb[1] - top_rgb[1]) * curved_ratio)
        b = int(top_rgb[2] + (bot_rgb[2] - top_rgb[2]) * curved_ratio)
        draw_g.line((0, y, w, y), fill=(r, g, b, 255))

    return grad, mask


def draw_corner_fretwork(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], inset: int = 22, size: int = 32, color: str = "#D4AF37", width: int = 3) -> None:
    """Draw classical Chinese fretwork / key pattern corner brackets on temple plaque."""
    x0, y0, x1, y1 = box
    # Top-Left
    draw.line([(x0 + inset, y0 + inset + size), (x0 + inset, y0 + inset), (x0 + inset + size, y0 + inset)], fill=color, width=width)
    draw.line([(x0 + inset + 8, y0 + inset + size - 8), (x0 + inset + 8, y0 + inset + 8), (x0 + inset + size - 8, y0 + inset + 8)], fill=color, width=max(1, width - 1))

    # Top-Right
    draw.line([(x1 - inset - size, y0 + inset), (x1 - inset, y0 + inset), (x1 - inset, y0 + inset + size)], fill=color, width=width)
    draw.line([(x1 - inset - size + 8, y0 + inset + 8), (x1 - inset - 8, y0 + inset + 8), (x1 - inset - 8, y0 + inset + size - 8)], fill=color, width=max(1, width - 1))

    # Bottom-Left
    draw.line([(x0 + inset, y1 - inset - size), (x0 + inset, y1 - inset), (x0 + inset + size, y1 - inset)], fill=color, width=width)
    draw.line([(x0 + inset + 8, y1 - inset - size + 8), (x0 + inset + 8, y1 - inset - 8), (x0 + inset + size - 8, y1 - inset - 8)], fill=color, width=max(1, width - 1))

    # Bottom-Right
    draw.line([(x1 - inset - size, y1 - inset), (x1 - inset, y1 - inset), (x1 - inset, y1 - inset - size)], fill=color, width=width)
    draw.line([(x1 - inset - size + 8, y1 - inset - 8), (x1 - inset - 8, y1 - inset - 8), (x1 - inset - 8, y1 - inset - size + 8)], fill=color, width=max(1, width - 1))


# -----------------------------------------------------------------------------
# DIGNIFIED TEMPLE ICONOGRAPHY (PRECISION VECTOR RENDERERS)
# -----------------------------------------------------------------------------

def draw_incense_burner_icon(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int = 70) -> None:
    """Icon 1: 參拜問答 - 宣德三足香爐與裊裊祥雲香煙 (Dignified Incense Burner)."""
    # 1. Warm golden aura
    for r in range(size + 24, size - 10, -6):
        alpha = int(25 * (1 - (r - size) / 34))
        draw.ellipse((cx - r, cy - r + 15, cx + r, cy + r + 15), outline=(245, 197, 66, alpha), width=3)

    # 2. Rising incense smoke curls
    draw.arc((cx - 28, cy - size * 1.1, cx + 6, cy - size * 0.3), start=180, end=350, fill="#FEF08A", width=4)
    draw.line([(cx, cy - size * 0.15), (cx, cy - size * 0.85)], fill="#FDE047", width=5)
    draw.arc((cx - 8, cy - size * 1.0, cx + 28, cy - size * 0.25), start=190, end=360, fill="#FEF08A", width=4)
    for sx, sy in [(cx - 16, cy - size * 1.05), (cx, cy - size * 0.95), (cx + 16, cy - size * 0.98)]:
        draw.ellipse((sx - 5, sy - 5, sx + 5, sy + 5), fill="#FFFBEB")

    # 3. Burner Rim / Lip
    rim_w, rim_h = size * 0.9, size * 0.18
    draw.ellipse((cx - rim_w, cy - size * 0.15, cx + rim_w, cy + rim_h), fill="#F5C542", outline="#FEF08A", width=3)

    # 4. Burner Main Body (Bowl)
    bowl_w = size * 0.78
    draw.chord((cx - bowl_w, cy - size * 0.05, cx + bowl_w, cy + size * 0.75), start=0, end=180, fill="#D4AF37", outline="#B4831B", width=3)

    # Center auspicious seal emblem on burner
    draw.ellipse((cx - 18, cy + size * 0.18, cx + 18, cy + size * 0.54), fill="#92251B", outline="#FDE047", width=2)
    draw.line([(cx, cy + size * 0.24), (cx, cy + size * 0.48)], fill="#FDE047", width=3)
    draw.line([(cx - 10, cy + size * 0.36), (cx + 10, cy + size * 0.36)], fill="#FDE047", width=3)

    # 5. Burner Feet (Tripod base)
    draw.rounded_rectangle((cx - 10, cy + size * 0.65, cx + 10, cy + size * 0.9), radius=4, fill="#B4831B", outline="#F5C542", width=2)
    draw.polygon([(cx - size * 0.6, cy + size * 0.45), (cx - size * 0.65, cy + size * 0.85), (cx - size * 0.42, cy + size * 0.6)], fill="#B4831B", outline="#F5C542")
    draw.polygon([(cx + size * 0.6, cy + size * 0.45), (cx + size * 0.65, cy + size * 0.85), (cx + size * 0.42, cy + size * 0.6)], fill="#B4831B", outline="#F5C542")

    # 6. Burner Handles (Ear brackets)
    draw.arc((cx - size * 1.05, cy - size * 0.05, cx - size * 0.65, cy + size * 0.35), start=90, end=270, fill="#F5C542", width=6)
    draw.arc((cx + size * 0.65, cy - size * 0.05, cx + size * 1.05, cy + size * 0.35), start=270, end=90, fill="#F5C542", width=6)


def draw_sacred_scroll_icon(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int = 70) -> None:
    """Icon 2: 活動報名 - 吉祥金冊卷軸與朱砂法印 (Imperial Decree Scroll)."""
    for r in range(size + 20, size - 10, -5):
        alpha = int(22 * (1 - (r - size) / 30))
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(245, 197, 66, alpha), width=3)

    sw, sh = size * 0.85, size * 0.85
    draw.rounded_rectangle((cx - sw + 16, cy - sh * 0.75, cx + sw - 16, cy + sh * 0.75), radius=6, fill="#FFFBEB", outline="#F5C542", width=3)
    draw.rectangle((cx - sw + 18, cy - sh * 0.75, cx + sw - 18, cy - sh * 0.48), fill="#8B1E1E")
    draw.rectangle((cx - sw + 18, cy + sh * 0.48, cx + sw - 18, cy + sh * 0.75), fill="#8B1E1E")

    draw.rounded_rectangle((cx - sw - 8, cy - sh * 0.9, cx - sw + 16, cy + sh * 0.9), radius=8, fill="#D4AF37", outline="#FEF08A", width=2)
    draw.ellipse((cx - sw - 12, cy - sh * 0.98, cx - sw + 20, cy - sh * 0.82), fill="#F5C542")
    draw.ellipse((cx - sw - 12, cy + sh * 0.82, cx - sw + 20, cy + sh * 0.98), fill="#F5C542")

    draw.rounded_rectangle((cx + sw - 16, cy - sh * 0.9, cx + sw + 8, cy + sh * 0.9), radius=8, fill="#D4AF37", outline="#FEF08A", width=2)
    draw.ellipse((cx + sw - 20, cy - sh * 0.98, cx + sw + 12, cy - sh * 0.82), fill="#F5C542")
    draw.ellipse((cx + sw - 20, cy + sh * 0.82, cx + sw + 12, cy + sh * 0.98), fill="#F5C542")

    seal_s = 28
    draw.rectangle((cx - seal_s, cy - seal_s + 4, cx + seal_s, cy + seal_s + 4), fill="#B91C1C", outline="#FEF08A", width=2)
    draw.line([(cx - 16, cy - 8), (cx + 16, cy - 8)], fill="#FEF08A", width=3)
    draw.line([(cx, cy - 18), (cx, cy + 22)], fill="#FEF08A", width=3)
    draw.line([(cx - 14, cy + 8), (cx + 14, cy + 8)], fill="#FEF08A", width=3)

    draw.line([(cx - sw, cy + sh * 0.9), (cx - sw - 10, cy + sh * 1.2)], fill="#E11D48", width=4)
    draw.ellipse((cx - sw - 14, cy + sh * 1.15, cx - sw - 6, cy + sh * 1.28), fill="#F59E0B")


def draw_fortune_canister_icon(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int = 70) -> None:
    """Icon 3: 抽文化籤 - 硃漆八角籤筒與顯赫靈籤 (Fortune Bamboo Canister & Sticks)."""
    for r in range(size + 22, size - 10, -5):
        alpha = int(24 * (1 - (r - size) / 32))
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(245, 197, 66, alpha), width=3)

    draw.rounded_rectangle((cx - 8, cy - size * 1.15, cx + 8, cy - size * 0.1), radius=3, fill="#FEF08A", outline="#D4AF37", width=2)
    draw.rounded_rectangle((cx - 8, cy - size * 1.15, cx + 8, cy - size * 0.82), radius=3, fill="#DC2626")
    draw.ellipse((cx - 3, cy - size * 0.65, cx + 3, cy - size * 0.55), fill="#B45309")

    draw.polygon([(cx - 24, cy - size * 0.95), (cx - 12, cy - size * 0.98), (cx - 4, cy - size * 0.1), (cx - 16, cy - size * 0.1)], fill="#FDE68A", outline="#B4831B")
    draw.polygon([(cx - 24, cy - size * 0.95), (cx - 12, cy - size * 0.98), (cx - 10, cy - size * 0.72), (cx - 21, cy - size * 0.7)], fill="#DC2626")

    draw.polygon([(cx + 12, cy - size * 0.98), (cx + 24, cy - size * 0.95), (cx + 16, cy - size * 0.1), (cx + 4, cy - size * 0.1)], fill="#FDE68A", outline="#B4831B")
    draw.polygon([(cx + 12, cy - size * 0.98), (cx + 24, cy - size * 0.95), (cx + 21, cy - size * 0.7), (cx + 10, cy - size * 0.72)], fill="#DC2626")

    cw = size * 0.62
    draw.ellipse((cx - cw, cy - size * 0.2, cx + cw, cy + size * 0.05), fill="#8B1E1E", outline="#F5C542", width=3)
    draw.rectangle((cx - cw, cy - size * 0.08, cx + cw, cy + size * 0.8), fill="#701212", outline="#B4831B", width=2)
    draw.line([(cx - cw, cy - size * 0.08), (cx - cw, cy + size * 0.8)], fill="#F5C542", width=4)
    draw.line([(cx + cw, cy - size * 0.08), (cx + cw, cy + size * 0.8)], fill="#F5C542", width=4)

    draw.ellipse((cx - cw, cy + size * 0.65, cx + cw, cy + size * 0.92), fill="#540B0B", outline="#F5C542", width=3)
    draw.line([(cx - cw + 2, cy + size * 0.18), (cx + cw - 2, cy + size * 0.18)], fill="#F5C542", width=4)
    draw.line([(cx - cw + 2, cy + size * 0.52), (cx + cw - 2, cy + size * 0.52)], fill="#F5C542", width=4)

    draw.ellipse((cx - 20, cy + size * 0.22, cx + 20, cy + size * 0.48), fill="#92251B", outline="#FEF08A", width=2)
    draw.line([(cx - 10, cy + size * 0.35), (cx + 10, cy + size * 0.35)], fill="#FEF08A", width=3)
    draw.line([(cx, cy + size * 0.28), (cx, cy + size * 0.42)], fill="#FEF08A", width=3)


def draw_temple_shrine_icon(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int = 70) -> None:
    """Icon 4: 主殿導覽 - 萬春宮三百年飛簷重簷殿閣 (Majestic Temple Palace Architecture)."""
    for r in range(size + 24, size - 10, -5):
        alpha = int(24 * (1 - (r - size) / 34))
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(245, 197, 66, alpha), width=3)

    roof_w = size * 1.15
    pts_roof = [
        (cx, cy - size * 0.9),
        (cx + roof_w * 0.55, cy - size * 0.55),
        (cx + roof_w, cy - size * 0.2),
        (cx + roof_w * 0.75, cy - size * 0.05),
        (cx, cy - size * 0.3),
        (cx - roof_w * 0.75, cy - size * 0.05),
        (cx - roof_w, cy - size * 0.2),
        (cx - roof_w * 0.55, cy - size * 0.55),
    ]
    draw.polygon(pts_roof, fill="#F5C542", outline="#FEF08A", width=3)
    draw.ellipse((cx - 10, cy - size * 1.05, cx + 10, cy - size * 0.85), fill="#DC2626", outline="#FEF08A", width=2)

    draw.rounded_rectangle((cx - size * 0.42, cy - size * 0.28, cx + size * 0.42, cy - size * 0.02), radius=4, fill="#8B1E1E", outline="#F5C542", width=2)
    draw.rectangle((cx - size * 0.32, cy - size * 0.24, cx + size * 0.32, cy - size * 0.06), fill="#1E1210")
    for offset in [-12, 0, 12]:
        draw.ellipse((cx + offset - 4, cy - size * 0.15 - 4, cx + offset + 4, cy - size * 0.15 + 4), fill="#FDE047")

    pts_lower = [
        (cx - size * 0.85, cy + size * 0.02),
        (cx, cy - size * 0.08),
        (cx + size * 0.85, cy + size * 0.02),
        (cx + size * 0.7, cy + size * 0.16),
        (cx, cy + size * 0.1),
        (cx - size * 0.7, cy + size * 0.16),
    ]
    draw.polygon(pts_lower, fill="#D4AF37", outline="#FEF08A", width=2)

    draw.rounded_rectangle((cx - size * 0.62, cy + size * 0.14, cx - size * 0.44, cy + size * 0.75), radius=3, fill="#991B1B", outline="#D4AF37", width=2)
    draw.rounded_rectangle((cx - size * 0.22, cy + size * 0.14, cx - size * 0.08, cy + size * 0.75), radius=3, fill="#991B1B", outline="#D4AF37", width=2)
    draw.rounded_rectangle((cx + size * 0.08, cy + size * 0.14, cx + size * 0.22, cy + size * 0.75), radius=3, fill="#991B1B", outline="#D4AF37", width=2)
    draw.rounded_rectangle((cx + size * 0.44, cy + size * 0.14, cx + size * 0.62, cy + size * 0.75), radius=3, fill="#991B1B", outline="#D4AF37", width=2)

    draw.rounded_rectangle((cx - size * 0.78, cy + size * 0.72, cx + size * 0.78, cy + size * 0.92), radius=6, fill="#78350F", outline="#F5C542", width=2)
    draw.line([(cx - size * 0.78, cy + size * 0.82), (cx + size * 0.78, cy + size * 0.82)], fill="#B4831B", width=2)


def draw_jade_seal_icon(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int = 70) -> None:
    """Icon 5: 報名進度 - 萬春宮神聖信印與功德卷宗 (Auspicious Seal & Registry Ledger)."""
    for r in range(size + 22, size - 10, -5):
        alpha = int(22 * (1 - (r - size) / 32))
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(245, 197, 66, alpha), width=3)

    bw, bh = size * 0.85, size * 0.6
    draw.rounded_rectangle((cx - bw + 6, cy - bh * 0.4 + 8, cx + bw + 6, cy + bh * 1.1 + 8), radius=8, fill="#3A0B0B")
    draw.rounded_rectangle((cx - bw, cy - bh * 0.4, cx + bw, cy + bh * 1.1), radius=8, fill="#7F1D1D", outline="#D4AF37", width=3)
    draw.line([(cx - bw + 14, cy + bh * 0.95), (cx + bw - 14, cy + bh * 0.95)], fill="#FEF08A", width=4)

    sw, sh = size * 0.46, size * 0.52
    sy = cy - size * 0.25
    draw.rounded_rectangle((cx - sw * 0.5, sy - sh * 0.9, cx + sw * 0.5, sy - sh * 0.2), radius=14, fill="#F5C542", outline="#FEF08A", width=3)
    draw.ellipse((cx - sw * 0.3, sy - sh * 1.1, cx + sw * 0.3, sy - sh * 0.6), fill="#D4AF37", outline="#FEF08A", width=2)

    draw.rounded_rectangle((cx - sw, sy - sh * 0.25, cx + sw, sy + sh * 0.7), radius=8, fill="#B91C1C", outline="#F5C542", width=3)
    draw.rectangle((cx - sw + 10, sy - sh * 0.1, cx + sw - 10, sy + sh * 0.55), outline="#FEF08A", width=2)
    draw.line([(cx, sy - sh * 0.1), (cx, sy + sh * 0.55)], fill="#FEF08A", width=2)
    draw.line([(cx - sw + 10, sy + sh * 0.22), (cx + sw - 10, sy + sh * 0.22)], fill="#FEF08A", width=2)

    draw.ellipse((cx + size * 0.35, cy + size * 0.35, cx + size * 0.85, cy + size * 0.85), fill="#1E3A8A", outline="#FEF08A", width=3)
    draw.line([(cx + size * 0.48, cy + size * 0.6), (cx + size * 0.58, cy + size * 0.72), (cx + size * 0.74, cy + size * 0.48)], fill="#FDE047", width=4)


def draw_palace_lantern_icon(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int = 70) -> None:
    """Icon 6: 聯絡客服 - 宮廟傳統福祿燈籠與執事信印 (Traditional Palace Lantern & Service)."""
    for r in range(size + 26, size - 10, -5):
        alpha = int(30 * (1 - (r - size) / 36))
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(245, 197, 66, alpha), width=3)

    draw.arc((cx - 16, cy - size * 1.15, cx + 16, cy - size * 0.85), start=180, end=360, fill="#F5C542", width=4)
    draw.line([(cx, cy - size * 0.9), (cx, cy - size * 0.7)], fill="#F5C542", width=4)

    draw.rounded_rectangle((cx - size * 0.42, cy - size * 0.72, cx + size * 0.42, cy - size * 0.54), radius=6, fill="#8B1E1E", outline="#F5C542", width=2)

    lw, lh = size * 0.72, size * 0.72
    draw.ellipse((cx - lw, cy - lh * 0.75, cx + lw, cy + lh * 0.75), fill="#DC2626", outline="#F5C542", width=3)
    draw.ellipse((cx - lw * 0.7, cy - lh * 0.55, cx + lw * 0.7, cy + lh * 0.55), fill="#F59E0B")
    draw.ellipse((cx - lw * 0.35, cy - lh * 0.35, cx + lw * 0.35, cy + lh * 0.35), fill="#FFFBEB")

    draw.arc((cx - lw, cy - lh * 0.75, cx + lw, cy + lh * 0.75), start=90, end=270, fill="#B91C1C", width=2)
    draw.line([(cx - lw * 0.45, cy - lh * 0.6), (cx - lw * 0.45, cy + lh * 0.6)], fill="#B45309", width=2)
    draw.line([(cx + lw * 0.45, cy - lh * 0.6), (cx + lw * 0.45, cy + lh * 0.6)], fill="#B45309", width=2)
    draw.line([(cx, cy - lh * 0.75), (cx, cy + lh * 0.75)], fill="#B45309", width=2)

    draw.ellipse((cx - 18, cy - 14, cx + 18, cy + 14), fill="#7F1D1D", outline="#FEF08A", width=2)
    draw.line([(cx, cy - 8), (cx, cy + 8)], fill="#FEF08A", width=3)
    draw.line([(cx - 8, cy), (cx + 8, cy)], fill="#FEF08A", width=3)

    draw.rounded_rectangle((cx - size * 0.35, cy + lh * 0.68, cx + size * 0.35, cy + lh * 0.85), radius=5, fill="#8B1E1E", outline="#F5C542", width=2)
    draw.ellipse((cx - 8, cy + lh * 0.85, cx + 8, cy + lh * 1.0), fill="#F5C542")
    draw.line([(cx - 8, cy + lh * 0.98), (cx - 12, cy + lh * 1.35)], fill="#DC2626", width=4)
    draw.line([(cx, cy + lh * 0.98), (cx, cy + lh * 1.4)], fill="#DC2626", width=5)
    draw.line([(cx + 8, cy + lh * 0.98), (cx + 12, cy + lh * 1.35)], fill="#DC2626", width=4)


# -----------------------------------------------------------------------------
# MASTER RICH MENU GENERATION (2500 x 1686)
# -----------------------------------------------------------------------------

def build_temple_rich_menu() -> Image.Image:
    width, height = 2500, 1686
    image = Image.new("RGBA", (width, height), (22, 17, 16, 255))
    draw = ImageDraw.Draw(image)

    # 1. Background Subtle Sandalwood Gradient
    for y in range(height):
        ratio = y / height
        r = int(22 + 14 * ratio)
        g = int(17 + 10 * ratio)
        b = int(16 + 8 * ratio)
        draw.line((0, y, width, y), fill=(r, g, b, 255))

    # Ambient golden warmth in the center
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((500, 100, 2000, 900), fill=(212, 175, 55, 20))
    glow_draw.ellipse((600, 800, 1900, 1600), fill=(185, 28, 28, 16))
    image = Image.alpha_composite(image, glow)
    draw = ImageDraw.Draw(image)

    # -------------------------------------------------------------
    # HEADER BANNER: 宮殿式山門橫額匾額 (y: 28 ~ 210)
    # -------------------------------------------------------------
    plaque_box = (110, 32, 2390, 205)
    draw.rounded_rectangle(plaque_box, radius=24, fill="#1B1210", outline="#B4831B", width=4)
    draw.rounded_rectangle((plaque_box[0] + 10, plaque_box[1] + 10, plaque_box[2] - 10, plaque_box[3] - 10), radius=18, outline="#F5C542", width=2)
    draw_corner_fretwork(draw, (plaque_box[0] + 12, plaque_box[1] + 12, plaque_box[2] - 12, plaque_box[3] - 12), inset=8, size=24, color="#F5C542", width=2)

    fnt_title = get_font(76, bold=True)

    header_title = "萬春宮服務選單"
    b_ht = fnt_title.getbbox(header_title)
    ht_w = b_ht[2] - b_ht[0]
    draw.text(((width - ht_w) // 2, 68), header_title, font=fnt_title, fill="#FFFDF8")
    draw.line([(1010, 156), (1490, 156)], fill="#D4AF37", width=4)

    # -------------------------------------------------------------
    # 6-CARD 2x3 BALANCED TEMPLE MATRIX
    # -------------------------------------------------------------
    card_r = 38

    cards_data = [
        # ROW 1
        {
            "box": (110, 240, 830, 870),
            "title": "參拜問答",
            "icon_func": draw_incense_burner_icon,
            "top_rgb": (120, 26, 26),
            "bot_rgb": (65, 14, 14),
        },
        {
            "box": (890, 240, 1610, 870),
            "title": "活動報名",
            "icon_func": draw_sacred_scroll_icon,
            "top_rgb": (120, 26, 26),
            "bot_rgb": (65, 14, 14),
        },
        {
            "box": (1670, 240, 2390, 870),
            "title": "抽文化籤",
            "icon_func": draw_fortune_canister_icon,
            "top_rgb": (120, 26, 26),
            "bot_rgb": (65, 14, 14),
        },
        # ROW 2
        {
            "box": (110, 920, 830, 1550),
            "title": "主殿導覽",
            "icon_func": draw_temple_shrine_icon,
            "top_rgb": (112, 24, 24),
            "bot_rgb": (60, 12, 12),
        },
        {
            "box": (890, 920, 1610, 1550),
            "title": "報名進度",
            "icon_func": draw_jade_seal_icon,
            "top_rgb": (112, 24, 24),
            "bot_rgb": (60, 12, 12),
        },
        {
            "box": (1670, 920, 2390, 1550),
            "title": "聯絡客服",
            "icon_func": draw_palace_lantern_icon,
            "top_rgb": (112, 24, 24),
            "bot_rgb": (60, 12, 12),
        },
    ]

    fnt_card_title = get_font(96, bold=True)

    for item in cards_data:
        box = item["box"]
        x0, y0, x1, y1 = box
        cx = (x0 + x1) // 2

        # 1. Base Gradient Plaque
        grad, mask = draw_vertical_gradient(box, item["top_rgb"], item["bot_rgb"], radius=card_r)
        image.paste(grad, (x0, y0), mask)

        # 2. Outer Gilded Border (Heavy Temple Gold)
        draw.rounded_rectangle(box, radius=card_r, outline="#D4AF37", width=4)

        # 3. Inset Fine Hairline Gold Border
        inset = 12
        draw.rounded_rectangle((x0 + inset, y0 + inset, x1 - inset, y1 - inset), radius=card_r - 8, outline="#A67C1E", width=2)

        # 4. Classical Fret Corner Ornaments
        draw_corner_fretwork(draw, box, inset=22, size=32, color="#F5C542", width=3)

        # 5. Icon Rendered in Upper Center
        item["icon_func"](draw, cx, y0 + 190, size=82)

        # 6. Primary Title
        t = item["title"]
        b_t = fnt_card_title.getbbox(t)
        tw = b_t[2] - b_t[0]
        title_y = y0 + 405
        # Text shadow for carved plaque relief feel
        draw.text(((x0 + x1 - tw) // 2 + 3, title_y + 3), t, font=fnt_card_title, fill="#2A0808")
        draw.text(((x0 + x1 - tw) // 2, title_y), t, font=fnt_card_title, fill="#FFFDF8")
        draw.line([(cx - 120, y0 + 535), (cx + 120, y0 + 535)], fill="#F5C542", width=5)

    # -------------------------------------------------------------
    # BOTTOM TOGGLE BAR: "服務選單" (y: 1580 ~ 1686)
    # -------------------------------------------------------------
    fnt_bar = get_font(38, bold=True)
    bar_txt = "▲  開啟 / 關閉服務選單"
    b_bar = fnt_bar.getbbox(bar_txt)
    bar_w = b_bar[2] - b_bar[0]
    bar_x = (width - bar_w) // 2
    draw.text((bar_x, 1600), bar_txt, font=fnt_bar, fill="#C49B55")

    # Discreet left keyboard toggle icon
    draw.rounded_rectangle((110, 1590, 175, 1645), radius=8, fill="#2C1D18", outline="#A67C1E", width=2)
    for row in range(2):
        for col in range(3):
            kx = 120 + col * 16
            ky = 1600 + row * 18
            draw.rectangle((kx, ky, kx + 10, ky + 10), fill="#DFC694")

    return image


def main():
    print("[START] Generating authentic temple-style 6-card LINE Rich Menu (2500x1686)...")
    img = build_temple_rich_menu()

    img.save(OUT_FILE_1, "PNG", optimize=True)
    print(f"  [OK] Saved to: {OUT_FILE_1} ({OUT_FILE_1.stat().st_size // 1024} KB)")

    img.save(OUT_FILE_2, "PNG", optimize=True)
    print(f"  [OK] Saved to: {OUT_FILE_2} ({OUT_FILE_2.stat().st_size // 1024} KB)")

    preview = img.resize((1250, 843), Image.Resampling.LANCZOS)
    preview.save(OUT_PREVIEW, "PNG")
    print(f"  [OK] Preview saved to: {OUT_PREVIEW}")


if __name__ == "__main__":
    main()
