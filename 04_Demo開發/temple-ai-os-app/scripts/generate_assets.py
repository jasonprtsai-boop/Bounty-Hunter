from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/msjhbd.ttc" if bold else "C:/Windows/Fonts/msjh.ttc",
        "C:/Windows/Fonts/NotoSansCJK-Regular.ttc",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def draw_centered(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], text: str, fill: str, size: int) -> None:
    fnt = font(size, bold=True)
    bbox = draw.multiline_textbbox((0, 0), text, font=fnt, spacing=12, align="center")
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = box[0] + (box[2] - box[0] - text_w) / 2
    y = box[1] + (box[3] - box[1] - text_h) / 2
    draw.multiline_text((x, y), text, fill=fill, font=fnt, spacing=12, align="center")


def rich_menu() -> None:
    out = ASSETS / "rich-menu" / "main-2500x1686.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGB", (2500, 1686), "#F6FBF8")
    draw = ImageDraw.Draw(image)
    title_font = font(64, bold=True)
    subtitle_font = font(32)
    draw.rectangle((0, 0, 2500, 170), fill="#102536")
    draw.text((80, 45), "Temple AI OS", fill="#FFFFFF", font=title_font)
    draw.text((540, 68), "萬春宮示範服務入口", fill="#BDEFD1", font=subtitle_font)

    labels = [
        ("AI\n助手", "AI", "#06C755"),
        ("活動\n中心", "曆", "#B42318"),
        ("文化\n抽籤", "籤", "#8A6A12"),
        ("宮廟\n導覽", "廟", "#0F6B8A"),
        ("會員\n中心", "人", "#334155"),
        ("客服\n中心", "話", "#7A3E9D"),
    ]
    cells = [
        (0, 170, 833, 928),
        (833, 170, 1667, 928),
        (1667, 170, 2500, 928),
        (0, 928, 833, 1686),
        (833, 928, 1667, 1686),
        (1667, 928, 2500, 1686),
    ]
    icon_font = font(74, bold=True)
    for box, (label, icon, color) in zip(cells, labels):
        draw.rectangle(box, fill="#FFFFFF", outline="#DCE4E0", width=4)
        icon_box = (box[0] + 310, box[1] + 120, box[0] + 523, box[1] + 333)
        draw.rounded_rectangle(icon_box, radius=34, outline=color, width=12, fill="#F6FBF8")
        icon_bbox = draw.textbbox((0, 0), icon, font=icon_font)
        draw.text(
            (
                icon_box[0] + (icon_box[2] - icon_box[0] - (icon_bbox[2] - icon_bbox[0])) / 2,
                icon_box[1] + (icon_box[3] - icon_box[1] - (icon_bbox[3] - icon_bbox[1])) / 2 - 4,
            ),
            icon,
            fill=color,
            font=icon_font,
        )
        draw_centered(draw, (box[0] + 60, box[1] + 360, box[2] - 60, box[3] - 80), label, "#102536", 88)
    image.save(out, optimize=True)


def banner(name: str, title: str, accent: str) -> None:
    out = ASSETS / "banners" / f"{name}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGB", (1200, 520), "#FFFFFF")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1200, 520), fill="#F6FBF8")
    draw.rectangle((0, 0, 90, 520), fill=accent)
    draw.rounded_rectangle((780, 70, 1110, 400), radius=36, outline="#102536", width=8, fill="#FFFFFF")
    draw.line((860, 245, 1030, 245), fill=accent, width=16)
    draw.line((945, 160, 945, 330), fill=accent, width=16)
    draw.text((150, 130), title, fill="#102536", font=font(62, bold=True))
    draw.text((154, 225), "Temple AI OS｜萬春宮示範", fill="#536471", font=font(34))
    draw.text((154, 300), "政府開放資料 + 自製 Demo 素材", fill="#8A6A12", font=font(28))
    image.save(out, optimize=True)


def flex_placeholder(name: str, title: str, accent: str) -> None:
    out = ASSETS / "flex" / f"{name}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGB", (1040, 1040), "#FFFFFF")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1040, 1040), fill="#F6FBF8")
    draw.rounded_rectangle((110, 120, 930, 790), radius=42, outline=accent, width=14, fill="#FFFFFF")
    draw.text((160, 220), title, fill="#102536", font=font(72, bold=True))
    draw.text((160, 340), "Temple AI OS", fill=accent, font=font(54, bold=True))
    draw.text((160, 450), "合法素材：自製圖像 / 開放資料來源", fill="#536471", font=font(34))
    draw.rectangle((160, 640, 880, 660), fill=accent)
    image.save(out, optimize=True)


def main() -> None:
    rich_menu()
    banner("home", "智慧宮廟服務入口", "#06C755")
    banner("events", "活動中心", "#B42318")
    banner("fortune", "文化抽籤", "#8A6A12")
    banner("support", "客服中心", "#0F6B8A")
    banner("tour", "宮廟導覽", "#7A3E9D")
    flex_placeholder("event-card", "活動卡片", "#B42318")
    flex_placeholder("fortune-card", "文化抽籤", "#8A6A12")
    flex_placeholder("support-card", "客服工單", "#0F6B8A")
    print(f"Generated assets in {ASSETS}")


if __name__ == "__main__":
    main()
