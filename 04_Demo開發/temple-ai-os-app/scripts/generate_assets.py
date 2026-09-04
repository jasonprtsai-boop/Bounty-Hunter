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
JADE = "#365F85"
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
    env_key = "WAN_CHUN_GONG_FONT_BOLD" if bold else "WAN_CHUN_GONG_FONT_REGULAR"
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
        PUBLIC_ASSETS / "rich-menu",
        PUBLIC_ASSETS / "banners",
        PUBLIC_ASSETS / "flex",
    ]:
        path.mkdir(parents=True, exist_ok=True)


def save_png(image: Image.Image, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_name(f".{out.stem}.tmp{out.suffix}")
    image.convert("RGB").save(tmp, optimize=True)
    tmp.replace(out)


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
    image = vertical_gradient((2500, 1686), "#F7FAF6", "#FFEFE6").convert("RGBA")
    draw = ImageDraw.Draw(image)
    draw_soft_pattern(draw, 2500, 1686)
    draw.rounded_rectangle((86, 70, 2414, 252), radius=72, fill=DEEP_RED)
    text_center(
        draw,
        (160, 90, 1240, 160),
        "萬春宮服務選單",
        "#FFFFFF",
        66,
        bold=True,
        spacing=0,
        style="round",
    )
    draw.text((166, 170), "參拜、活動、抽籤、導覽、查詢與客服都從這裡開始", fill="#FFE9B2", font=font(34, bold=True, style="round"))
    draw.rounded_rectangle((1745, 104, 2348, 218), radius=56, fill="#FFF7DF")
    text_center(draw, (1745, 104, 2348, 218), "常用入口  立即點選", DEEP_RED, 42, bold=True, style="round")

    main_cells = [
        ((86, 310, 1216, 870), "詢問參拜方式", "問", "第一次來、交通與流程", "傳送參拜問題", RED),
        ((1284, 310, 2414, 870), "查看活動報名", "曆", "查活動、名額與時間", "開啟活動列表", JADE),
    ]
    for box, title, icon, body, cta, accent in main_cells:
        draw.rounded_rectangle((box[0] + 18, box[1] + 24, box[2] + 18, box[3] + 24), radius=56, fill="#D8C3B4")
        draw.rounded_rectangle(box, radius=56, fill="#FFFFFF", outline=accent, width=6)
        draw.rounded_rectangle((box[0] + 48, box[1] + 48, box[0] + 238, box[1] + 238), radius=50, fill=accent)
        text_center(
            draw,
            (box[0] + 48, box[1] + 48, box[0] + 238, box[1] + 238),
            icon,
            "#FFFFFF",
            82,
            bold=True,
            spacing=0,
            style="round",
        )
        draw.text((box[0] + 292, box[1] + 86), title, fill=INK, font=font(66, bold=True, style="round"))
        draw.text((box[0] + 296, box[1] + 190), body, fill="#5C6E66", font=font(42, bold=True, style="round"))
        draw.rounded_rectangle((box[0] + 292, box[1] + 314, box[0] + 760, box[1] + 412), radius=49, fill=accent)
        text_center(draw, (box[0] + 292, box[1] + 314, box[0] + 760, box[1] + 412), cta, "#FFFFFF", 38, bold=True, style="round")
        draw_sparkle(draw, box[2] - 172, box[1] + 132, 58, accent)
        draw_sparkle(draw, box[2] - 100, box[1] + 236, 36, PALE_GOLD)

    small_cells = [
        ((86, 958, 626, 1518), "抽文化籤", "籤", "抽一支\n平安提醒", "#8A5A12"),
        ((682, 958, 1222, 1518), "看主殿導覽", "廟", "主殿故事\n參拜動線", COCOA),
        ((1278, 958, 1818, 1518), "查報名進度", "查", "手機編號\n查詢進度", "#245B8A"),
        ((1874, 958, 2414, 1518), "聯絡客服", "聊", "留下問題\n人工接續", "#7A1E17"),
    ]
    for box, title, icon, body, accent in small_cells:
        draw.rounded_rectangle((box[0] + 14, box[1] + 18, box[2] + 14, box[3] + 18), radius=44, fill="#D8C3B4")
        draw.rounded_rectangle(box, radius=44, fill="#FFFFFF", outline=accent, width=5)
        draw.rounded_rectangle((box[0] + 42, box[1] + 42, box[0] + 180, box[1] + 180), radius=38, fill=accent)
        text_center(draw, (box[0] + 42, box[1] + 42, box[0] + 180, box[1] + 180), icon, "#FFFFFF", 58, bold=True, style="round")
        draw.text((box[0] + 52, box[1] + 246), title, fill=INK, font=font(48, bold=True, style="round"))
        draw.multiline_text((box[0] + 56, box[1] + 340), body, fill="#5C6E66", font=font(34, bold=True, style="round"), spacing=10)
        draw_sparkle(draw, box[2] - 96, box[1] + 84, 34, accent)

    for out in [
        ASSETS / "rich-menu" / "main-2500x1686.png",
        PUBLIC_ASSETS / "rich-menu" / "main-2500x1686.png",
    ]:
        save_png(image, out)


def banner(name: str, title: str, subtitle: str, accent: str) -> None:
    image = vertical_gradient((1200, 520), "#FFF9E8", "#FFD9E8").convert("RGBA")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((58, 58, 1142, 462), radius=64, fill="#FFFFFF", outline=accent, width=5)
    draw.ellipse((778, -34, 1118, 306), fill="#FFF1F6")
    paste_sticker(image, "main.png", (820, 36, 1090, 314))
    draw.text((112, 122), title, fill=COCOA, font=font(72, bold=True, style="round"))
    draw.text((116, 224), subtitle, fill="#8B5A45", font=font(44, bold=True, style="hand"))
    for out in [ASSETS / "banners" / f"{name}.png", PUBLIC_ASSETS / "banners" / f"{name}.png"]:
        save_png(image, out)


def flex_card(name: str, title: str, subtitle: str, accent: str, *, cta: str = "查看服務說明") -> None:
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
    text_center(draw, (178, 840, 846, 922), cta, "#FFFFFF", 46, bold=True, style="round")
    for out in [ASSETS / "flex" / f"{name}.png", PUBLIC_ASSETS / "flex" / f"{name}.png"]:
        save_png(image, out)


def event_flex_card(
    name: str,
    title: str,
    subtitle: str,
    accent: str,
    accent2: str,
    motif: str,
    *,
    top: str,
    bottom: str,
    style: str = "round",
    layout: str = "festival",
) -> None:
    image = vertical_gradient((1024, 1024), top, bottom).convert("RGBA")
    draw = ImageDraw.Draw(image)
    for offset in range(-900, 1024, 116):
        draw.line((offset, 0, offset + 820, 1024), fill="#FFFFFF", width=5)
    for x, y, size in [(136, 232, 38), (850, 286, 34), (192, 820, 30), (812, 790, 42)]:
        draw_sparkle(draw, x, y, size, accent2)

    draw.rounded_rectangle((62, 62, 962, 962), radius=74, fill="#FFFDF7", outline=accent, width=8)
    draw.rounded_rectangle((62, 62, 962, 226), radius=74, fill=accent)
    draw.rectangle((62, 142, 962, 226), fill=accent)
    draw.text((122, 96), "萬春宮活動", fill="#FFFFFF", font=font(48, bold=True, style="round"))
    draw.rounded_rectangle((682, 92, 900, 166), radius=37, fill="#FFF8DF")
    text_center(draw, (682, 92, 900, 166), motif, accent, 42, bold=True, spacing=0, style=style)

    if layout == "ritual":
        for x in [256, 302, 348]:
            draw.line((x, 580, x, 338), fill=accent2, width=12)
            draw.arc((x - 22, 300, x + 22, 374), 200, 340, fill=accent, width=5)
        draw.rounded_rectangle((362, 288, 662, 642), radius=38, fill="#FFF7DF", outline=accent2, width=6)
        draw.ellipse((406, 340, 618, 552), fill="#FFFFFF", outline=accent, width=7)
        text_center(draw, (406, 340, 618, 552), motif, accent, 112, bold=True, spacing=0, style=style)
        draw.rounded_rectangle((286, 628, 738, 690), radius=18, fill=accent)
        text_center(draw, (286, 626, 738, 688), title, "#FFFFFF", 40, bold=True, spacing=0, style=style)
    elif layout == "guide":
        draw.rounded_rectangle((150, 286, 874, 650), radius=46, fill="#FFFFFF", outline=accent2, width=6)
        draw.polygon([(244, 388), (372, 314), (500, 388), (470, 416), (372, 360), (274, 416)], fill=accent)
        draw.rectangle((306, 418, 438, 470), fill=accent2)
        points = [(276, 560), (414, 432), (582, 532), (746, 374)]
        for start, end in zip(points, points[1:]):
            draw.line((*start, *end), fill=accent2, width=14)
        for index, (x, y) in enumerate(points, 1):
            draw.ellipse((x - 38, y - 38, x + 38, y + 38), fill=accent)
            text_center(draw, (x - 38, y - 38, x + 38, y + 38), str(index), "#FFFFFF", 34, bold=True, style="round")
        text_center(draw, (470, 302, 824, 364), title, accent, 46, bold=True, spacing=0, style=style)
    elif layout == "culture":
        draw.rectangle((166, 334, 858, 606), fill="#FFEEC6")
        draw.ellipse((112, 314, 220, 626), fill=accent2)
        draw.ellipse((804, 314, 912, 626), fill=accent2)
        draw.rounded_rectangle((160, 300, 864, 640), radius=46, fill="#FFF8DF", outline=accent, width=7)
        draw.text((222, 332), motif, fill=(107, 58, 143, 72), font=font(170, bold=True, style=style))
        draw.line((256, 536, 760, 468), fill=accent2, width=14)
        draw.line((314, 574, 698, 556), fill=accent, width=8)
        text_center(draw, (256, 406, 768, 506), title, COCOA, 58, bold=True, spacing=0, style=style)
    else:
        draw.polygon(
            [(210, 384), (512, 248), (814, 384), (760, 430), (512, 322), (264, 430)],
            fill=accent,
        )
        draw.rectangle((286, 424, 738, 492), fill=accent2)
        draw.rectangle((336, 492, 688, 632), fill="#FFF3D8")
        draw.rectangle((302, 632, 722, 674), fill=accent)
        draw.rounded_rectangle((386, 514, 638, 632), radius=30, fill="#FFFFFF", outline="#E5C36C", width=4)
        text_center(draw, (386, 510, 638, 626), title, COCOA, 54, bold=True, spacing=0, style=style)

    draw.rounded_rectangle((116, 718, 908, 826), radius=54, fill="#FFFFFF", outline=accent2, width=4)
    text_center(draw, (146, 718, 878, 826), subtitle, "#6B3F2A", 36, bold=True, spacing=2, style="hand")
    draw.rounded_rectangle((234, 868, 790, 934), radius=33, fill=accent)
    text_center(draw, (234, 868, 790, 934), "查看活動說明", "#FFFFFF", 34, bold=True, style="round")

    for out in [ASSETS / "flex" / f"{name}.png", PUBLIC_ASSETS / "flex" / f"{name}.png"]:
        save_png(image, out)


def main() -> None:
    ensure_dirs()
    rich_menu()
    banner("home", "宮廟線上服務入口", "把參拜、活動、客服收進 LINE", COCOA)
    banner("events", "活動中心", "法會、講座、報名與提醒", RED)
    banner("fortune", "文化抽籤", "以籤詩語感做正向提醒", "#8A5A12")
    banner("support", "客服中心", "複雜問題轉人工確認", "#245B8A")
    banner("tour", "宮廟導覽", "QR/NFC 開啟文化點位", "#6B3A8F")
    flex_card("event-card", "活動卡片", "活動資訊、報名入口、廟方提醒", RED, cta="前往活動報名")
    event_flex_card(
        "event-card-festival",
        "祭典公告",
        "公開參拜、宮慶與節日提醒",
        RED,
        GOLD,
        "祭",
        top="#FFF7E8",
        bottom="#FFD9C8",
        style="serif",
        layout="festival",
    )
    event_flex_card(
        "event-card-ritual",
        "法會服務",
        "名額、時段與報名提醒",
        JADE,
        GOLD,
        "福",
        top="#F4FFF8",
        bottom="#DDF4E8",
        style="round",
        layout="ritual",
    )
    event_flex_card(
        "event-card-guide",
        "導覽互動",
        "第一次參拜與現場動線",
        "#245B8A",
        MINT,
        "導",
        top="#F1FBFF",
        bottom="#D7F0F8",
        style="round",
        layout="guide",
    )
    event_flex_card(
        "event-card-culture",
        "文化講堂",
        "故事、書法與信仰脈絡",
        "#8A5A12",
        LILAC,
        "文",
        top="#FFF9EF",
        bottom="#F4E6FF",
        style="hand",
        layout="culture",
    )
    flex_card("fortune-card", "文化抽籤", "不做命運斷言，只做文化解說", "#8A5A12", cta="再抽一支文化籤")
    flex_card("support-card", "客服工單", "需要人工確認時建立紀錄", "#245B8A", cta="前往客服詢問")
    print(f"Generated assets in {ASSETS} and {PUBLIC_ASSETS}")


if __name__ == "__main__":
    main()
