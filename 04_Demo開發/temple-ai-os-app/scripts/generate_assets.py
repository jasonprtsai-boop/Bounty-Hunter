from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
PUBLIC_ASSETS = ROOT / "frontend" / "public" / "assets"
FONT_DIR = ASSETS / "fonts"

INK = "#2B1B12"
RED = "#B42318"
DEEP_RED = "#7A1E17"
GOLD = "#D6A33A"
PALE_GOLD = "#FFF4D6"
JADE = "#1F7A5B"
PAPER = "#FFFCF4"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    env_key = "TEMPLE_AI_OS_FONT_BOLD" if bold else "TEMPLE_AI_OS_FONT_REGULAR"
    candidates = [
        os.getenv(env_key),
        FONT_DIR / ("NotoSansTC-Bold.otf" if bold else "NotoSansTC-Regular.otf"),
        FONT_DIR / ("NotoSansCJKtc-Bold.otf" if bold else "NotoSansCJKtc-Regular.otf"),
        "C:/Windows/Fonts/msjhbd.ttc" if bold else "C:/Windows/Fonts/msjh.ttc",
        "C:/Windows/Fonts/mingliub.ttc" if bold else "C:/Windows/Fonts/mingliu.ttc",
        "/System/Library/Fonts/PingFang.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
        if bold
        else "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc"
        if bold
        else "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        if not candidate:
            continue
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def ensure_dirs() -> None:
    for path in [
        ASSETS / "rich-menu",
        ASSETS / "banners",
        ASSETS / "flex",
        PUBLIC_ASSETS / "banners",
        PUBLIC_ASSETS / "flex",
    ]:
        path.mkdir(parents=True, exist_ok=True)


def text_center(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    text: str,
    fill: str,
    size: int,
    *,
    bold: bool = False,
    spacing: int = 8,
) -> None:
    fnt = font(size, bold=bold)
    bbox = draw.multiline_textbbox((0, 0), text, font=fnt, spacing=spacing, align="center")
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    x = box[0] + (box[2] - box[0] - width) / 2
    y = box[1] + (box[3] - box[1] - height) / 2
    draw.multiline_text((x, y), text, fill=fill, font=fnt, spacing=spacing, align="center")


def draw_roof(draw: ImageDraw.ImageDraw, cx: int, y: int, scale: int, color: str = RED) -> None:
    draw.polygon(
        [
            (cx - 160 * scale, y + 78 * scale),
            (cx, y),
            (cx + 160 * scale, y + 78 * scale),
            (cx + 125 * scale, y + 100 * scale),
            (cx, y + 42 * scale),
            (cx - 125 * scale, y + 100 * scale),
        ],
        fill=color,
    )
    draw.rectangle((cx - 118 * scale, y + 98 * scale, cx + 118 * scale, y + 138 * scale), fill=GOLD)
    draw.rectangle((cx - 86 * scale, y + 138 * scale, cx + 86 * scale, y + 216 * scale), fill=PALE_GOLD)
    draw.rectangle((cx - 96 * scale, y + 216 * scale, cx + 96 * scale, y + 236 * scale), fill=color)


def rich_menu() -> None:
    image = Image.new("RGB", (2500, 1686), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 2500, 260), fill=DEEP_RED)
    draw.rectangle((0, 236, 2500, 260), fill=GOLD)
    draw_roof(draw, 2140, 36, 1, RED)
    draw.text((90, 54), "Temple AI OS", fill="#FFFFFF", font=font(78, bold=True))
    draw.text((94, 148), "萬春宮示範服務入口", fill=PALE_GOLD, font=font(42, bold=True))

    labels = [
        ("AI 助手", "問", "參拜與文化問答", JADE),
        ("活動中心", "曆", "法會與講座 Demo", RED),
        ("文化抽籤", "籤", "正向提醒", "#8A5A12"),
        ("宮廟導覽", "廟", "QR/NFC 動線", "#245B8A"),
        ("貼圖小舖", "貼", "春福小使", "#334155"),
        ("客服中心", "話", "人工確認入口", "#6B3A8F"),
    ]
    cells = [
        (0, 260, 833, 973),
        (833, 260, 1667, 973),
        (1667, 260, 2500, 973),
        (0, 973, 833, 1686),
        (833, 973, 1667, 1686),
        (1667, 973, 2500, 1686),
    ]
    for box, (title, icon, subtitle, accent) in zip(cells, labels):
        draw.rectangle(box, fill="#FFFFFF", outline="#E4D5B0", width=4)
        draw.rectangle((box[0], box[1], box[2], box[1] + 16), fill=accent)
        icon_box = (box[0] + 322, box[1] + 92, box[0] + 511, box[1] + 281)
        draw.ellipse(icon_box, fill=PALE_GOLD, outline=accent, width=10)
        text_center(draw, icon_box, icon, accent, 82, bold=True)
        text_center(draw, (box[0] + 80, box[1] + 326, box[2] - 80, box[1] + 458), title, INK, 82, bold=True)
        text_center(draw, (box[0] + 80, box[1] + 486, box[2] - 80, box[1] + 582), subtitle, "#5C4635", 36)

    out = ASSETS / "rich-menu" / "main-2500x1686.png"
    image.save(out, optimize=True)


def banner(name: str, title: str, subtitle: str, accent: str) -> None:
    image = Image.new("RGB", (1200, 520), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1200, 520), fill=PAPER)
    draw.rectangle((0, 0, 1200, 82), fill=DEEP_RED)
    draw.rectangle((0, 82, 1200, 96), fill=GOLD)
    draw_roof(draw, 916, 150, 1, RED)
    draw.text((86, 148), title, fill=INK, font=font(66, bold=True))
    draw.text((90, 238), subtitle, fill="#5C4635", font=font(36))
    draw.rounded_rectangle((88, 320, 576, 388), radius=8, fill=accent)
    draw.text((120, 337), "LINE + AI + LIFF", fill="#FFFFFF", font=font(32, bold=True))
    draw.text((92, 430), "Demo 資料不代表萬春宮官方營運", fill="#8A6A12", font=font(27))
    for out in [ASSETS / "banners" / f"{name}.png", PUBLIC_ASSETS / "banners" / f"{name}.png"]:
        image.save(out, optimize=True)


def flex_card(name: str, title: str, subtitle: str, accent: str) -> None:
    image = Image.new("RGB", (1024, 1024), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1024, 1024), fill=PAPER)
    draw.rectangle((0, 0, 1024, 140), fill=DEEP_RED)
    draw.rectangle((0, 140, 1024, 162), fill=GOLD)
    draw_roof(draw, 512, 252, 1, accent)
    text_center(draw, (80, 532, 944, 646), title, INK, 74, bold=True)
    text_center(draw, (120, 660, 904, 742), subtitle, "#5C4635", 34)
    draw.rounded_rectangle((210, 804, 814, 872), radius=8, fill=accent)
    text_center(draw, (210, 804, 814, 872), "Temple AI OS 示範卡片", "#FFFFFF", 32, bold=True)
    draw.text((80, 938), "自製示意圖｜開放資料示範情境", fill="#8A6A12", font=font(26))
    for out in [ASSETS / "flex" / f"{name}.png", PUBLIC_ASSETS / "flex" / f"{name}.png"]:
        image.save(out, optimize=True)


def main() -> None:
    ensure_dirs()
    rich_menu()
    banner("home", "智慧宮廟服務入口", "把參拜、活動、客服收進 LINE", JADE)
    banner("events", "活動中心", "法會、講座、報名與提醒", RED)
    banner("fortune", "文化抽籤", "以籤詩語感做正向提醒", "#8A5A12")
    banner("support", "客服中心", "複雜問題轉人工確認", "#245B8A")
    banner("tour", "宮廟導覽", "QR/NFC 開啟文化點位", "#6B3A8F")
    flex_card("event-card", "活動卡片", "活動資訊、報名入口、Demo 註記", RED)
    flex_card("fortune-card", "文化抽籤", "不做命運斷言，只做文化解說", "#8A5A12")
    flex_card("support-card", "客服工單", "需要人工確認時建立紀錄", "#245B8A")
    print(f"Generated assets in {ASSETS} and {PUBLIC_ASSETS}")


if __name__ == "__main__":
    main()
