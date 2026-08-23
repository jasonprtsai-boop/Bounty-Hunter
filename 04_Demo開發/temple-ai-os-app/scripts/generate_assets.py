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
COCOA = "#6B3F2A"
MILK = "#FFF7E8"
BLUSH = "#FFE8F0"
PEACH = "#FF9D7A"
PINK = "#FF6FA4"
LILAC = "#B985FF"
MINT = "#7EDCC2"
CREAM = "#FFE7A8"
SKY = "#9CDCF5"


def font(
    size: int,
    bold: bool = False,
    *,
    style: str = "sans",
) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    env_key = "TEMPLE_AI_OS_FONT_BOLD" if bold else "TEMPLE_AI_OS_FONT_REGULAR"
    if style == "serif":
        styled_candidates = [
            "C:/Windows/Fonts/NotoSerifTC-VF.ttf",
            "C:/Windows/Fonts/mingliub.ttc" if bold else "C:/Windows/Fonts/mingliu.ttc",
        ]
    elif style == "hand":
        styled_candidates = [
            "C:/Windows/Fonts/kaiu.ttf",
            "C:/Windows/Fonts/NotoSerifTC-VF.ttf",
        ]
    elif style == "round":
        styled_candidates = [
            "C:/Windows/Fonts/msjhbd.ttc" if bold else "C:/Windows/Fonts/msjh.ttc",
            "C:/Windows/Fonts/NotoSansTC-VF.ttf",
        ]
    else:
        styled_candidates = []
    candidates = [
        os.getenv(env_key),
        *styled_candidates,
        FONT_DIR / ("NotoSansTC-Bold.otf" if bold else "NotoSansTC-Regular.otf"),
        FONT_DIR / ("NotoSansCJKtc-Bold.otf" if bold else "NotoSansCJKtc-Regular.otf"),
        "C:/Windows/Fonts/NotoSansTC-VF.ttf",
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
    style: str = "sans",
) -> None:
    fnt = font(size, bold=bold, style=style)
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


def vertical_gradient(size: tuple[int, int], top: str, bottom: str) -> Image.Image:
    width, height = size
    image = Image.new("RGB", size, top)
    draw = ImageDraw.Draw(image)
    top_rgb = tuple(int(top[index : index + 2], 16) for index in (1, 3, 5))
    bottom_rgb = tuple(int(bottom[index : index + 2], 16) for index in (1, 3, 5))
    for y in range(height):
        ratio = y / max(1, height - 1)
        color = tuple(
            int(top_rgb[channel] + (bottom_rgb[channel] - top_rgb[channel]) * ratio)
            for channel in range(3)
        )
        draw.line((0, y, width, y), fill=color)
    return image


def paste_sticker(
    image: Image.Image,
    filename: str,
    box: tuple[int, int, int, int],
    *,
    opacity: float = 1,
) -> None:
    path = ASSETS / "stickers" / "spring-fortune-messenger" / filename
    if not path.exists():
        return
    sticker = Image.open(path).convert("RGBA")
    sticker.thumbnail((box[2] - box[0], box[3] - box[1]), Image.Resampling.LANCZOS)
    if opacity < 1:
        alpha = sticker.getchannel("A").point(lambda value: int(value * opacity))
        sticker.putalpha(alpha)
    x = box[0] + (box[2] - box[0] - sticker.width) // 2
    y = box[1] + (box[3] - box[1] - sticker.height) // 2
    image.paste(sticker, (x, y), sticker)


def draw_sparkle(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, color: str) -> None:
    inner = max(8, size // 3)
    draw.polygon(
        [
            (cx, cy - size),
            (cx + inner, cy - inner),
            (cx + size, cy),
            (cx + inner, cy + inner),
            (cx, cy + size),
            (cx - inner, cy + inner),
            (cx - size, cy),
            (cx - inner, cy - inner),
        ],
        fill=color,
    )


def draw_soft_pattern(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    dots = [
        (120, 250, 34, "#FFD1DD"),
        (420, 1450, 44, "#FFFFFF"),
        (2120, 260, 58, "#FFD1DD"),
        (2280, 1220, 46, "#FFFFFF"),
        (1680, 1440, 38, "#FFD1DD"),
        (720, 230, 28, "#FFFFFF"),
    ]
    for x, y, radius, color in dots:
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
    for x, y, color in [
        (210, 1160, PINK),
        (2020, 920, LILAC),
        (1060, 1540, PEACH),
        (1510, 360, MINT),
    ]:
        draw_sparkle(draw, x, y, 42, color)


def cute_panel(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    *,
    fill: str,
    outline: str,
    shadow: str = "#E5AFC0",
) -> None:
    x0, y0, x1, y1 = box
    draw.rounded_rectangle((x0 + 18, y0 + 22, x1 + 18, y1 + 22), radius=72, fill=shadow)
    draw.rounded_rectangle(box, radius=72, fill=fill, outline=outline, width=5)


def rich_menu() -> None:
    image = vertical_gradient((2500, 1686), "#FFF5DF", "#FFD7E6").convert("RGBA")
    draw = ImageDraw.Draw(image)
    draw_soft_pattern(draw, 2500, 1686)
    draw.rounded_rectangle((84, 70, 2416, 278), radius=96, fill=COCOA)
    text_center(
        draw,
        (130, 88, 1940, 258),
        "萬春宮服務選單",
        "#FFFFFF",
        88,
        bold=True,
        spacing=0,
        style="round",
    )
    draw_sparkle(draw, 2110, 170, 54, CREAM)
    draw_sparkle(draw, 2262, 170, 54, CREAM)

    labels = [
        ("AI 小幫手", "問", PINK),
        ("活動報名", "曆", PEACH),
        ("文化抽籤", "籤", LILAC),
        ("宮廟導覽", "廟", MINT),
        ("貼圖小舖", "貼", SKY),
        ("客服中心", "聊", CREAM),
    ]
    cells = [
        (86, 340, 785, 930),
        (900, 340, 1600, 930),
        (1715, 340, 2414, 930),
        (86, 1020, 785, 1610),
        (900, 1020, 1600, 1610),
        (1715, 1020, 2414, 1610),
    ]
    for box, (title, icon, accent) in zip(cells, labels):
        panel_fill = "#FFFFFF" if accent != CREAM else "#FFF4CC"
        cute_panel(draw, box, fill=panel_fill, outline=accent)
        draw.rounded_rectangle((box[0] + 42, box[1] + 42, box[0] + 218, box[1] + 218), radius=88, fill=accent)
        text_center(
            draw,
            (box[0] + 42, box[1] + 42, box[0] + 218, box[1] + 218),
            icon,
            "#FFFFFF",
            86,
            bold=True,
            spacing=0,
            style="round",
        )
        draw_sparkle(draw, box[2] - 170, box[1] + 126, 58, accent)
        draw_sparkle(draw, box[2] - 86, box[1] + 210, 34, BLUSH)
        text_center(
            draw,
            (box[0] + 48, box[1] + 292, box[2] - 48, box[1] + 548),
            title,
            COCOA,
            96,
            bold=True,
            spacing=0,
            style="round",
        )

    out = ASSETS / "rich-menu" / "main-2500x1686.png"
    image.convert("RGB").save(out, optimize=True)


def banner(name: str, title: str, subtitle: str, accent: str) -> None:
    image = vertical_gradient((1200, 520), "#FFF9E8", "#FFD9E8").convert("RGBA")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((58, 58, 1142, 462), radius=64, fill="#FFFFFF", outline=accent, width=5)
    draw.ellipse((778, -34, 1118, 306), fill="#FFF1F6")
    paste_sticker(image, "main.png", (820, 36, 1090, 314))
    draw.text((112, 122), title, fill=COCOA, font=font(72, bold=True, style="round"))
    draw.text((116, 224), subtitle, fill="#8B5A45", font=font(44, bold=True, style="hand"))
    for out in [ASSETS / "banners" / f"{name}.png", PUBLIC_ASSETS / "banners" / f"{name}.png"]:
        image.convert("RGB").save(out, optimize=True)


def flex_card(name: str, title: str, subtitle: str, accent: str) -> None:
    image = vertical_gradient((1024, 1024), "#FFF9E8", "#FFD4E4").convert("RGBA")
    draw = ImageDraw.Draw(image)
    draw_soft_pattern(draw, 1024, 1024)
    draw.rounded_rectangle((76, 78, 948, 946), radius=78, fill="#FFFFFF", outline=accent, width=7)
    draw.rounded_rectangle((76, 78, 948, 198), radius=78, fill=accent)
    draw.rectangle((76, 136, 948, 204), fill=accent)
    draw.text((136, 106), "萬春宮服務", fill="#FFFFFF", font=font(52, bold=True, style="round"))
    paste_sticker(image, "main.png", (300, 230, 724, 548))
    text_center(draw, (104, 574, 920, 694), title, COCOA, 84, bold=True, spacing=0, style="round")
    text_center(draw, (142, 708, 882, 802), subtitle, "#8B5A45", 42, bold=True, spacing=4, style="hand")
    draw.rounded_rectangle((178, 840, 846, 922), radius=41, fill=accent)
    text_center(draw, (178, 840, 846, 922), "查看詳情", "#FFFFFF", 46, bold=True, style="round")
    for out in [ASSETS / "flex" / f"{name}.png", PUBLIC_ASSETS / "flex" / f"{name}.png"]:
        image.convert("RGB").save(out, optimize=True)


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
