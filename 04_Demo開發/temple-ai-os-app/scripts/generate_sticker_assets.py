from __future__ import annotations

import json
import math
import shutil
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "brand" / "spring-fortune-messenger-source.png"
BRAND_DIR = ROOT / "assets" / "brand"
STICKER_DIR = ROOT / "assets" / "stickers" / "spring-fortune-messenger"
PUBLIC_BRAND_DIR = ROOT / "frontend" / "public" / "assets" / "brand"
PUBLIC_STICKER_DIR = ROOT / "frontend" / "public" / "assets" / "stickers" / "spring-fortune-messenger"


@dataclass(frozen=True)
class StickerSpec:
    filename: str
    label: str
    variant: str
    scale: float
    x: int
    y: int
    text_y: int
    mascot_y: int
    mirror: bool = False
    rotation: float = 0


STICKERS = [
    StickerSpec("sticker_01_good_morning.png", "早安\n平安", "sunrise", 0.74, 82, 104, 18, 102),
    StickerSpec("sticker_02_received.png", "收到！", "seal", 0.76, 88, 96, 26, 96, mirror=True),
    StickerSpec("sticker_03_thanks.png", "謝謝你", "sparkle", 0.76, 74, 98, 26, 100),
    StickerSpec("sticker_04_hard_work.png", "辛苦了", "ribbon", 0.74, 88, 101, 24, 100, mirror=True),
    StickerSpec("sticker_05_blessings.png", "祝福\n滿滿", "cloud", 0.72, 92, 108, 16, 108),
    StickerSpec("sticker_06_wait.png", "等我\n一下", "clock", 0.74, 78, 104, 18, 104, rotation=-5),
    StickerSpec("sticker_07_registered.png", "已報名", "ticket", 0.73, 88, 102, 25, 102, mirror=True),
    StickerSpec("sticker_08_safe.png", "保持\n平安", "shield", 0.75, 82, 104, 16, 104),
]


def ensure_dirs() -> None:
    for directory in [BRAND_DIR, STICKER_DIR, PUBLIC_BRAND_DIR, PUBLIC_STICKER_DIR]:
        directory.mkdir(parents=True, exist_ok=True)


def font_candidates(bold: bool) -> list[Path]:
    local = ROOT / "assets" / "fonts"
    return [
        local / ("NotoSansTC-Bold.otf" if bold else "NotoSansTC-Regular.otf"),
        Path("C:/Windows/Fonts/msjhbd.ttc" if bold else "C:/Windows/Fonts/msjh.ttc"),
        Path("C:/Windows/Fonts/NotoSansCJK-Bold.ttc" if bold else "C:/Windows/Fonts/NotoSansCJK-Regular.ttc"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]


def load_font(size: int, *, bold: bool = True) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in font_candidates(bold):
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def trim_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    bbox = rgba.getbbox()
    if not bbox:
        return rgba
    return rgba.crop(bbox)


def fit_image(image: Image.Image, max_size: tuple[int, int]) -> Image.Image:
    width, height = image.size
    scale = min(max_size[0] / width, max_size[1] / height)
    next_size = (max(2, int(width * scale)), max(2, int(height * scale)))
    return image.resize(next_size, Image.Resampling.LANCZOS)


def paste_center(canvas: Image.Image, image: Image.Image, center: tuple[int, int]) -> None:
    x = int(center[0] - image.width / 2)
    y = int(center[1] - image.height / 2)
    canvas.alpha_composite(image, (x, y))


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> tuple[int, int]:
    bbox = draw.multiline_textbbox((0, 0), text, font=font, spacing=2, align="center", stroke_width=4)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_label(draw: ImageDraw.ImageDraw, text: str, y: int, palette: dict[str, str]) -> None:
    font_size = 44 if "\n" not in text else 39
    font = load_font(font_size, bold=True)
    while font_size > 26 and text_size(draw, text, font)[0] > 286:
        font_size -= 2
        font = load_font(font_size, bold=True)
    width, height = text_size(draw, text, font)
    x = 185 - width // 2
    draw.rounded_rectangle(
        (x - 20, y - 10, x + width + 20, y + height + 14),
        radius=18,
        fill=palette["label_bg"],
        outline=palette["label_border"],
        width=3,
    )
    draw.multiline_text(
        (185, y),
        text,
        font=font,
        fill=palette["label_text"],
        anchor="ma",
        spacing=2,
        align="center",
        stroke_width=3,
        stroke_fill="#fff8df",
    )


def draw_sparkle(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, fill: str) -> None:
    points = []
    for index in range(8):
        radius = size if index % 2 == 0 else size * 0.34
        angle = math.pi / 4 * index - math.pi / 2
        points.append((cx + math.cos(angle) * radius, cy + math.sin(angle) * radius))
    draw.polygon(points, fill=fill)


def draw_decor(draw: ImageDraw.ImageDraw, variant: str) -> None:
    if variant == "sunrise":
        draw.arc((22, 206, 128, 312), 205, 330, fill="#d6a33a", width=8)
        draw_sparkle(draw, 312, 60, 16, "#d6a33a")
    elif variant == "seal":
        draw.ellipse((252, 210, 334, 292), fill="#b42318", outline="#7a1e17", width=4)
        draw.text((293, 249), "OK", font=load_font(24, bold=True), fill="#fff4d6", anchor="mm")
    elif variant == "sparkle":
        for cx, cy, size in [(48, 80, 14), (316, 82, 18), (292, 242, 12)]:
            draw_sparkle(draw, cx, cy, size, "#d6a33a")
    elif variant == "ribbon":
        draw.rounded_rectangle((42, 246, 330, 292), radius=20, fill="#0f766e", outline="#064e45", width=4)
    elif variant == "cloud":
        for cx, cy in [(56, 254), (88, 238), (120, 254), (296, 244), (324, 260)]:
            draw.ellipse((cx - 30, cy - 22, cx + 30, cy + 22), fill="#fff4d6", outline="#e9c46a", width=3)
    elif variant == "clock":
        draw.ellipse((264, 216, 336, 288), fill="#fffaf0", outline="#7a1e17", width=5)
        draw.line((300, 252, 300, 230), fill="#7a1e17", width=5)
        draw.line((300, 252, 318, 252), fill="#7a1e17", width=5)
    elif variant == "ticket":
        draw.rounded_rectangle((42, 238, 158, 294), radius=12, fill="#fff4d6", outline="#b42318", width=4)
        draw.line((66, 238, 66, 294), fill="#b42318", width=3)
    elif variant == "shield":
        draw.polygon([(310, 214), (344, 228), (340, 270), (310, 296), (280, 270), (276, 228)], fill="#0f766e", outline="#064e45")


def mascot_for_sticker(source: Image.Image, spec: StickerSpec) -> Image.Image:
    mascot = fit_image(source, (220, 210))
    mascot = mascot.resize((int(mascot.width * spec.scale), int(mascot.height * spec.scale)), Image.Resampling.LANCZOS)
    if spec.mirror:
        mascot = mascot.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if spec.rotation:
        mascot = mascot.rotate(spec.rotation, expand=True, resample=Image.Resampling.BICUBIC)
    return mascot


def make_sticker(source: Image.Image, spec: StickerSpec) -> Image.Image:
    canvas = Image.new("RGBA", (370, 320), (0, 0, 0, 0))
    decor = ImageDraw.Draw(canvas)
    draw_decor(decor, spec.variant)
    mascot = mascot_for_sticker(source, spec)
    paste_center(canvas, mascot, (spec.x + mascot.width // 2, spec.mascot_y + mascot.height // 2))
    palette = {
        "label_bg": "#fff4d6",
        "label_border": "#d6a33a",
        "label_text": "#7a1e17",
    }
    draw_label(decor, spec.label, spec.text_y, palette)
    return canvas


def make_main_image(source: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.ellipse((8, 8, 232, 232), fill="#fff4d6", outline="#b42318", width=7)
    draw_sparkle(draw, 198, 46, 13, "#d6a33a")
    mascot = fit_image(source, (202, 202))
    paste_center(canvas, mascot, (120, 128))
    return canvas


def make_tab_image(source: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", (96, 74), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((2, 5, 94, 70), radius=18, fill="#fff4d6", outline="#b42318", width=3)
    mascot = fit_image(source, (74, 68))
    paste_center(canvas, mascot, (49, 45))
    return canvas


def make_profile_image(source: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", (640, 640), "#fff4d6")
    draw = ImageDraw.Draw(canvas)
    draw.ellipse((-48, -38, 688, 700), fill="#b42318")
    draw.ellipse((34, 34, 606, 606), fill="#fff4d6", outline="#d6a33a", width=18)
    for cx, cy, size in [(108, 118, 20), (522, 116, 24), (500, 500, 18)]:
        draw_sparkle(draw, cx, cy, size, "#d6a33a")
    mascot = fit_image(source, (492, 492))
    paste_center(canvas, mascot, (320, 350))
    return canvas.convert("RGB")


def write_metadata() -> None:
    metadata = {
        "pack_id": "spring-fortune-messenger-01",
        "title_zh_tw": "春福小使日常貼圖",
        "creator": "萬春宮線上服務",
        "copyright": "WanChunGongService",
        "sticker_count": len(STICKERS),
        "store_url_env": "VITE_LINE_STICKER_STORE_URL",
        "review_note": "Original mascot artwork for a temple-culture service. Not an official Wan Chun Gong logo, not a deity likeness, and not a direct advertisement.",
        "source": "Generated with built-in image generation, then composed with deterministic text overlays.",
        "line_requirements": {
            "main_image": "240x240 PNG",
            "sticker_images": "8 PNG files, each 370x320 or smaller, transparent background",
            "chat_thumbnail_icon": "96x74 PNG",
            "profile_image": "640x640 PNG for LINE Official Account",
        },
        "stickers": [{"file": item.filename, "text": item.label.replace("\n", " ")} for item in STICKERS],
    }
    (STICKER_DIR / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def copy_public_assets() -> None:
    for path in STICKER_DIR.glob("*.png"):
        shutil.copy2(path, PUBLIC_STICKER_DIR / path.name)
    for path in BRAND_DIR.glob("line-oa-profile-*.png"):
        shutil.copy2(path, PUBLIC_BRAND_DIR / path.name)


def main() -> None:
    ensure_dirs()
    source = trim_alpha(Image.open(SOURCE))
    profile = make_profile_image(source)
    profile.save(BRAND_DIR / "line-oa-profile-v1.png", optimize=True)
    main_image = make_main_image(source)
    main_image.save(STICKER_DIR / "main.png", optimize=True)
    tab = make_tab_image(source)
    tab.save(STICKER_DIR / "tab.png", optimize=True)
    for spec in STICKERS:
        sticker = make_sticker(source, spec)
        sticker.save(STICKER_DIR / spec.filename, optimize=True)
    write_metadata()
    copy_public_assets()
    print(f"Generated {len(STICKERS)} stickers in {STICKER_DIR}")
    print(f"Generated profile image at {BRAND_DIR / 'line-oa-profile-v1.png'}")


if __name__ == "__main__":
    main()
