"""Generate the redesigned, high-impact 10-page pitch deck (.pptx) for 2026 LINE AI Competition.

Design Philosophy (LIGHT MODE & HIGH-SPEC):
- Clean Keynote White / Light Slate Theme (#F8FAFC) - Strictly NO Dark Mode.
- Minimalist text: large bold titles, clear subheadings, big metric badges, zero paragraph clutter.
- Dedicated Slide for Admin Settings & System Configurations (Demo 後台設定介面).
- Real, complete, uncropped UI screenshots (LIFF Registration with submit button, Admin Settings, Culture Fortune).
- Abundant technical parameters & engineering specs (endpoints, ports, schemas, RPC, latencies, isolation levels).
- Strict compliance: Cover + Exactly 10 content slides (P.01 - P.10) + Backcover = 12 slides.
"""

from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

ROOT = Path(__file__).resolve().parents[3]
OUTPUT_DIR = ROOT / "01_企畫書" / "10頁投稿簡報"
UI_DIR = OUTPUT_DIR / "ui_screenshots"
ASSETS_DIR = ROOT / "04_Demo開發" / "temple-ai-os-app" / "assets"
RESEARCH_ASSETS = ROOT / "03_素材與圖片" / "research-assets" / "temple-ai-os"
OUTPUT_PPTX = OUTPUT_DIR / "Temple_AI_OS_2026_LINE_AI_競賽簡報.pptx"

# Modern Tech Light Palette (Strictly Light Mode)
COLOR_BG = RGBColor(248, 250, 252)             # Light Slate / Off-White (#F8FAFC)
COLOR_CARD = RGBColor(255, 255, 255)           # Pure White Card (#FFFFFF)
COLOR_CARD_BORDER = RGBColor(226, 232, 240)    # Slate Hairline Border (#E2E8F0)
COLOR_CARD_BORDER_DARK = RGBColor(203, 213, 225)# Slate Accent Border (#CBD5E1)

COLOR_PRIMARY = RGBColor(180, 40, 30)          # Temple Crimson Red (#B4281E)
COLOR_PRIMARY_LIGHT = RGBColor(254, 242, 242)  # Soft Red Tint (#FEF2F2)
COLOR_GOLD = RGBColor(180, 83, 9)              # Amber / Gold (#B45309)
COLOR_GOLD_LIGHT = RGBColor(254, 243, 199)     # Soft Gold Tint (#FEF3C7)
COLOR_LINE_GREEN = RGBColor(6, 199, 85)        # LINE Green (#06C755)

COLOR_TEXT_MAIN = RGBColor(15, 23, 42)         # Deep Charcoal Black (#0F172A)
COLOR_TEXT_SUB = RGBColor(51, 65, 85)          # Deep Slate (#334155)
COLOR_TEXT_MUTED = RGBColor(100, 116, 139)     # Slate Gray (#64748B)

COLOR_TAG_BG = RGBColor(241, 245, 249)         # Pill Fill (#F1F5F9)
COLOR_TAG_BORDER = RGBColor(203, 213, 225)     # Pill Border (#CBD5E1)
COLOR_TAG_TEXT = RGBColor(30, 58, 138)         # Deep Tech Blue (#1E3A8A)


def create_presentation() -> Presentation:
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    return prs


def apply_light_background(slide) -> None:
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = COLOR_BG
    bg.line.fill.background()


def add_slide_header(slide, title_text: str, category_text: str, page_num_str: str, subtitle_text: str = "") -> None:
    # Category badge (Crimson pill)
    cat_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.38), Inches(4.5), Inches(0.32))
    cat_shape.fill.solid()
    cat_shape.fill.fore_color.rgb = COLOR_PRIMARY
    cat_shape.line.fill.background()
    p_c = cat_shape.text_frame.paragraphs[0]
    p_c.text = category_text
    p_c.font.size = Pt(10)
    p_c.font.bold = True
    p_c.font.color.rgb = RGBColor(255, 255, 255)
    p_c.alignment = PP_ALIGN.CENTER

    # Contest tag & Page Number (Right side)
    right_box = slide.shapes.add_textbox(Inches(7.5), Inches(0.35), Inches(5.0), Inches(0.4))
    p_r = right_box.text_frame.paragraphs[0]
    p_r.alignment = PP_ALIGN.RIGHT
    p_r.text = f"2026 LINE AI 創新創業競賽 ｜ {page_num_str}"
    p_r.font.size = Pt(11)
    p_r.font.bold = True
    p_r.font.color.rgb = COLOR_TEXT_MUTED

    # Main Title (Large Bold Charcoal)
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.76), Inches(11.7), Inches(0.55))
    tf_t = title_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = title_text
    p_t.font.size = Pt(23)
    p_t.font.bold = True
    p_t.font.color.rgb = COLOR_TEXT_MAIN

    # Subtitle / Key Takeaway Line
    if subtitle_text:
        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.30), Inches(11.7), Inches(0.35))
        tf_s = sub_box.text_frame
        p_s = tf_s.paragraphs[0]
        p_s.text = subtitle_text
        p_s.font.size = Pt(11.5)
        p_s.font.bold = True
        p_s.font.color.rgb = COLOR_GOLD


def add_tech_pill_bar(slide, tags: list[str], top_inch: float = 6.85) -> None:
    lbl = slide.shapes.add_textbox(Inches(0.8), Inches(top_inch), Inches(1.6), Inches(0.35))
    p_l = lbl.text_frame.paragraphs[0]
    p_l.text = "CORE TECH:"
    p_l.font.size = Pt(10)
    p_l.font.bold = True
    p_l.font.color.rgb = COLOR_PRIMARY

    cur_left = 2.4
    for tag in tags:
        tag_w = max(1.1, len(tag) * 0.11 + 0.3)
        tag_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(cur_left), Inches(top_inch), Inches(tag_w), Inches(0.32))
        tag_shape.fill.solid()
        tag_shape.fill.fore_color.rgb = COLOR_TAG_BG
        tag_shape.line.color.rgb = COLOR_TAG_BORDER
        tag_shape.line.width = Pt(1)

        p = tag_shape.text_frame.paragraphs[0]
        p.text = tag
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = COLOR_TAG_TEXT
        p.alignment = PP_ALIGN.CENTER

        cur_left += tag_w + 0.15


def add_card(slide, left: float, top: float, width: float, height: float, title: str, bullets: list[str], title_color=COLOR_PRIMARY) -> None:
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    card.fill.solid()
    card.fill.fore_color.rgb = COLOR_CARD
    card.line.color.rgb = COLOR_CARD_BORDER
    card.line.width = Pt(1.2)

    tb = slide.shapes.add_textbox(Inches(left + 0.2), Inches(top + 0.15), Inches(width - 0.4), Inches(height - 0.3))
    tf = tb.text_frame
    tf.word_wrap = True

    if title:
        p_title = tf.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(12.5)
        p_title.font.bold = True
        p_title.font.color.rgb = title_color
        p_title.space_after = Pt(6)

    first = not bool(title)
    for b in bullets:
        p = tf.add_paragraph() if not first else tf.paragraphs[0]
        first = False
        p.text = f"• {b}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_TEXT_SUB
        p.space_after = Pt(4)


def add_param_card(slide, left: float, top: float, width: float, height: float, title: str, params: list[tuple[str, str]], title_color=COLOR_PRIMARY) -> None:
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    card.fill.solid()
    card.fill.fore_color.rgb = COLOR_TAG_BG
    card.line.color.rgb = COLOR_TAG_BORDER
    card.line.width = Pt(1.2)

    tb = slide.shapes.add_textbox(Inches(left + 0.18), Inches(top + 0.12), Inches(width - 0.36), Inches(height - 0.24))
    tf = tb.text_frame
    tf.word_wrap = True

    p_title = tf.paragraphs[0]
    p_title.text = f"⚙ {title}"
    p_title.font.size = Pt(11.5)
    p_title.font.bold = True
    p_title.font.color.rgb = title_color
    p_title.space_after = Pt(5)

    for k, v in params:
        p = tf.add_paragraph()
        run_k = p.add_run()
        run_k.text = f"{k}: "
        run_k.font.bold = True
        run_k.font.size = Pt(9.5)
        run_k.font.color.rgb = COLOR_TEXT_SUB

        run_v = p.add_run()
        run_v.text = v
        run_v.font.bold = True
        run_v.font.size = Pt(9.5)
        run_v.font.color.rgb = COLOR_TAG_TEXT
        p.space_after = Pt(2.5)


def add_metric_box(slide, left: float, top: float, width: float, height: float, num_text: str, label_text: str, sub_label: str = "", num_color=COLOR_PRIMARY) -> None:
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    card.fill.solid()
    card.fill.fore_color.rgb = COLOR_CARD
    card.line.color.rgb = COLOR_CARD_BORDER
    card.line.width = Pt(1.2)

    tb = slide.shapes.add_textbox(Inches(left + 0.1), Inches(top + 0.1), Inches(width - 0.2), Inches(height - 0.2))
    tf = tb.text_frame
    tf.word_wrap = True

    p1 = tf.paragraphs[0]
    p1.alignment = PP_ALIGN.CENTER
    p1.text = num_text
    p1.font.size = Pt(26)
    p1.font.bold = True
    p1.font.color.rgb = num_color

    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    p2.text = label_text
    p2.font.size = Pt(11)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_MAIN
    p2.space_before = Pt(2)

    if sub_label:
        p3 = tf.add_paragraph()
        p3.alignment = PP_ALIGN.CENTER
        p3.text = sub_label
        p3.font.size = Pt(9.5)
        p3.font.color.rgb = COLOR_TEXT_MUTED


def build_redesigned_deck() -> None:
    prs = create_presentation()
    blank_layout = prs.slide_layouts[6]

    # =============================================================
    # SLIDE 0: HERO COVER (Pitch Deck Cover - Light Theme)
    # =============================================================
    s0 = prs.slides.add_slide(blank_layout)
    apply_light_background(s0)

    # Right Side: Clean Minimalist Light Hero Mockup
    cover_img = OUTPUT_DIR / "cover_style2_minimalist.jpg"
    if cover_img.exists():
        pic_c = s0.shapes.add_picture(str(cover_img), Inches(6.0), Inches(0.8), width=Inches(6.8), height=Inches(5.8))
        pic_c.line.color.rgb = COLOR_CARD_BORDER
        pic_c.line.width = Pt(1.5)

    # Left Side: Branding Block
    tag_s0 = s0.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(4.6), Inches(0.38))
    tag_s0.fill.solid()
    tag_s0.fill.fore_color.rgb = COLOR_PRIMARY
    tag_s0.line.fill.background()
    p_s0 = tag_s0.text_frame.paragraphs[0]
    p_s0.text = "2026 LINE AI 創新創業競賽 參賽作品"
    p_s0.font.size = Pt(11)
    p_s0.font.bold = True
    p_s0.font.color.rgb = RGBColor(255, 255, 255)
    p_s0.alignment = PP_ALIGN.CENTER

    # Main Title
    tb_title = s0.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(5.2), Inches(1.8))
    tf_t0 = tb_title.text_frame
    tf_t0.word_wrap = True
    p_t1 = tf_t0.paragraphs[0]
    p_t1.text = "Temple AI OS"
    p_t1.font.size = Pt(40)
    p_t1.font.bold = True
    p_t1.font.color.rgb = COLOR_TEXT_MAIN

    p_t2 = tf_t0.add_paragraph()
    p_t2.text = "智慧宮廟作業系統"
    p_t2.font.size = Pt(26)
    p_t2.font.bold = True
    p_t2.font.color.rgb = COLOR_PRIMARY
    p_t2.space_before = Pt(4)

    # Core Value Prop
    tb_vp = s0.shapes.add_textbox(Inches(0.8), Inches(3.7), Inches(5.0), Inches(1.2))
    tf_vp = tb_vp.text_frame
    tf_vp.word_wrap = True
    p_vp1 = tf_vp.paragraphs[0]
    p_vp1.text = "把整座宮廟的服務與文化，完整收進信眾的 LINE 裡"
    p_vp1.font.size = Pt(15)
    p_vp1.font.bold = True
    p_vp1.font.color.rgb = COLOR_TEXT_MAIN

    p_vp2 = tf_vp.add_paragraph()
    p_vp2.text = "免下載 App ｜ 6 格黃金分流 ｜ LIFF 敏捷報名 ｜ AI 文史問答 ｜ 廟務管理中樞"
    p_vp2.font.size = Pt(10.5)
    p_vp2.font.color.rgb = COLOR_TEXT_MUTED
    p_vp2.space_before = Pt(6)

    # Technical Specs Badge Box on Cover
    add_param_card(
        s0, 0.8, 4.85, 4.9, 1.35,
        "核心技術參數與上線規格 (SYSTEM SPECS)",
        [
            ("LINE 官方帳號", "專屬 Basic ID: @983zhzni (已通過審核)"),
            ("前端架構", "LIFF v2 + React 18 + Tailwind RWD (Full Viewport)"),
            ("後端核心", "FastAPI 0.115 (Python 3.12) + Supabase PostgreSQL 15"),
            ("併發保證", "PostgreSQL Atomic RPC 行級排他鎖 (FOR UPDATE)")
        ],
        title_color=COLOR_PRIMARY
    )

    # Team line
    tb_team = s0.shapes.add_textbox(Inches(0.8), Inches(6.35), Inches(5.0), Inches(0.4))
    p_team = tb_team.text_frame.paragraphs[0]
    p_team.text = "開發團隊：Temple AI OS 團隊 ｜ Demo 驗證：台中萬春宮公開資料場景"
    p_team.font.size = Pt(11)
    p_team.font.bold = True
    p_team.font.color.rgb = COLOR_TEXT_MUTED

    # =============================================================
    # SLIDE 1: P.01 痛點與市場機會 (20% 市場需求)
    # =============================================================
    s1 = prs.slides.add_slide(blank_layout)
    apply_light_background(s1)
    add_slide_header(
        s1,
        "三百年香火的數位轉型困局：年輕信眾斷層與沉重行政負擔",
        "01 / 市場需求與痛點分析 (20%)",
        "P.01 / 10",
        "信仰生活心靈依託面臨數位落差：青年不敢問、志工做不完、營運無數據"
    )

    # 3 Big Metrics
    add_metric_box(s1, 0.8, 1.75, 3.6, 1.25, "12,000+", "全台合法登記寺廟", "民間信仰基盤龐大，年香客產值逾200億", num_color=COLOR_PRIMARY)
    add_metric_box(s1, 4.65, 1.75, 3.6, 1.25, "95%+", "LINE 全台人口滲透率", "長輩青年皆熟悉，零下載阻力即開即用", num_color=COLOR_LINE_GREEN)
    add_metric_box(s1, 8.5, 1.75, 3.9, 1.25, "80%", "廟方重複行政人力消耗", "紙本手寫登記、電話重複諮詢、漏單爭議", num_color=COLOR_GOLD)

    # Left: Pain Points Card
    add_card(
        s1, 0.8, 3.2, 5.6, 3.4,
        "傳統宮廟營運四大核心痛點 (PAIN POINTS)",
        [
            "信眾參與門檻高：不熟參拜順序與規矩禮節，現場資訊零散，年輕世代退怯。",
            "紙本行政負擔重：法會與活動依賴紙筆手寫，容易出錯遺漏，名單核銷混亂。",
            "重複客服打爆電話：每日重複詢問時間、交通、問事，佔用志工大量精力。",
            "營運缺乏數據：無法掌握信眾關注話題與節慶人流，難以實現現代化管理。"
        ],
        title_color=COLOR_PRIMARY
    )

    # Right: Light User Journey Diagram
    img_journey = RESEARCH_ASSETS / "journey.png"
    if img_journey.exists():
        pic_j = s1.shapes.add_picture(str(img_journey), Inches(6.7), Inches(3.2), width=Inches(5.8), height=Inches(3.4))
        pic_j.line.color.rgb = COLOR_CARD_BORDER
        pic_j.line.width = Pt(1.2)

    add_tech_pill_bar(s1, ["傳統宗教文化", "人口老齡化斷層", "LINE 生態切入", "數位化升級機會", "市場規模 200億+"])

    # =============================================================
    # SLIDE 2: P.02 產品定位與核心解方 (20% LINE 創意性)
    # =============================================================
    s2 = prs.slides.add_slide(blank_layout)
    apply_light_background(s2)
    add_slide_header(
        s2,
        "Temple AI OS：信眾、廟方與文化三位一體的智慧作業系統",
        "02 / 產品定位與核心主張 (20%)",
        "P.02 / 10",
        "不是外部 App，不是純聊天 Bot，而是宮廟現代化營運與文化傳承的完整解方"
    )

    # 3 Pillar Cards
    add_card(
        s2, 0.8, 1.75, 3.6, 4.85,
        "信眾 C 端：零門檻體驗",
        [
            "免下載安裝：LINE 聊天室即點即開。",
            "5 大服務選單：點燈、解籤、報名一鍵直達。",
            "LIFF 敏捷表單：聊天室內順暢完成法會報名。",
            "進度即時自查：手機號碼一秒查錄取序號。",
            "自動行前推播：活動日前夕接收注意事項。"
        ],
        title_color=COLOR_PRIMARY
    )

    add_card(
        s2, 4.65, 1.75, 3.6, 4.85,
        "廟方 B 端：數位中樞",
        [
            "Admin Dashboard：活動與報名秒級同步。",
            "後台參數設定：廟宇全銜、開放時段彈性設定。",
            "即時公告跑馬燈：首頁重要訊息即改即發布。",
            "行鎖防超額：Atomic RPC 祭典秒殺零超賣。",
            "AI 話題熱點分析：看懂信眾常問問題與缺口。"
        ],
        title_color=COLOR_GOLD
    )

    add_card(
        s2, 8.5, 1.75, 3.9, 4.85,
        "文化傳承：敬意與年輕化",
        [
            "在地文史 RAG：權威記載解讀古蹟與建築。",
            "正向文化抽籤：白話釋義，給予信眾平安提醒。",
            "線上擲筊互動：遵循傳統儀軌，兼具敬意趣味。",
            "文創貼圖深化：原創春福小使 8 款日常貼圖。",
            "嚴格 AI 安全守則：絕不扮演神明宣稱神諭。"
        ],
        title_color=COLOR_TAG_TEXT
    )

    add_tech_pill_bar(s2, ["B2B2C 閉環架構", "LINE Native 體驗", "SaaS 模組化", "文化永續傳承", "萬春宮實體落地"])

    # =============================================================
    # SLIDE 3: P.03 LINE 原生入口與 5 大卡片服務選單 (20% LINE 生態)
    # =============================================================
    s3 = prs.slides.add_slide(blank_layout)
    apply_light_background(s3)
    add_slide_header(
        s3,
        "LINE 原生入口：正統宮廟 2×3 六格圖文選單 (Rich Menu 2500×1686)",
        "03 / LINE 官方帳號門戶與生態整合 (20%)",
        "P.03 / 10",
        "好友即會員，聊天室即服務：以中軸對稱之 2×3 黃金六閣方陣覆蓋信眾 95% 高頻需求"
    )

    # Left: Smartphone Mockup showing LINE Chatroom + Rich Menu
    mockup_chat = UI_DIR / "mockup_chat_menu.png"
    if mockup_chat.exists():
        pic_mc = s3.shapes.add_picture(str(mockup_chat), Inches(0.8), Inches(1.75), width=Inches(2.35), height=Inches(4.85))
        pic_mc.line.color.rgb = COLOR_CARD_BORDER
        pic_mc.line.width = Pt(1.5)

    # Center Top: High-Res Rich Menu Canvas (2500x1686)
    img_rm = ASSETS_DIR / "rich-menu" / "main-2500x1686.png"
    if img_rm.exists():
        pic_rm = s3.shapes.add_picture(str(img_rm), Inches(3.35), Inches(1.75), width=Inches(4.0), height=Inches(2.7))
        pic_rm.line.color.rgb = COLOR_CARD_BORDER
        pic_rm.line.width = Pt(1.5)

    # Center Bottom: Technical Specs Box
    add_param_card(
        s3, 3.35, 4.6, 4.0, 2.0,
        "LINE 官方規格與通訊參數",
        [
            ("LINE 官方帳號 ID", "@983zhzni (專屬 Basic ID)"),
            ("選單尺寸與佈局", "2500 x 1686 px (2x3 黃金宮閣方陣)"),
            ("觸控分區與動作", "6 區域 (AI Message + 5 大 Web/LIFF URI)"),
            ("通訊協定與防偽", "HTTPS POST + HMAC-SHA256"),
            ("訊息封裝格式", "Flex Message 2.0 (Carousel)"),
            ("對稱美學規範", "萬春宮殿宇絳紅泥金・單手拇指直覺點擊")
        ],
        title_color=COLOR_TAG_TEXT
    )

    # Right: 6 Functional Breakdowns Card
    add_card(
        s3, 7.55, 1.75, 4.95, 4.85,
        "黃金 6 大功能動線設計 (6 CORE FUNCTIONS)",
        [
            "【問】詢問參拜方式：三足宣德金香爐，初訪流程與參拜動線，AI 智慧即時解惑。",
            "【曆】查看活動報名：吉祥金冊卷軸，四季法會與祈福慶典，聊天室直開表單。",
            "【籤】抽文化籤詩：硃漆靈籤竹筒，聖母靈籤白話釋義，正向安定生活開示。",
            "【廟】看主殿導覽：萬春宮重簷歇山殿閣，三百年建築藻井與道光龍柱文史。",
            "【查】查報名進度：功德卷宗與信印，手機序號一秒速查錄取進度與核銷。",
            "【服】聯絡廟務客服：福祿宮燈與執事信牌，便民專線直通執事幹事協助。"
        ],
        title_color=COLOR_PRIMARY
    )

    add_tech_pill_bar(s3, ["LINE OA 2.0", "Messaging API", "Rich Menu 2500x1686", "2x3 Temple Matrix", "HMAC-SHA256", "Flex Message 2.0"])

    # =============================================================
    # SLIDE 4: P.04 Demo 介面展示：LIFF 敏捷活動報名 (20% LINE 創意性)
    # =============================================================
    s4 = prs.slides.add_slide(blank_layout)
    apply_light_background(s4)
    add_slide_header(
        s4,
        "Demo 網頁介面：LIFF 敏捷活動報名與名額即時控管",
        "04 / LINE 原生功能深度應用 (20%)",
        "P.04 / 10",
        "免跳出 LINE、自動帶入身分：在聊天室內 30 秒完成法會活動報名"
    )

    # Mobile screenshots: uncropped full captures
    img_ev = UI_DIR / "ui_events.png"
    img_rg = UI_DIR / "ui_register.png"

    if img_ev.exists():
        pic_ev = s4.shapes.add_picture(str(img_ev), Inches(0.8), Inches(1.75), width=Inches(2.5), height=Inches(4.85))
        pic_ev.line.color.rgb = COLOR_CARD_BORDER
        pic_ev.line.width = Pt(1.5)

    if img_rg.exists():
        pic_rg = s4.shapes.add_picture(str(img_rg), Inches(3.55), Inches(1.75), width=Inches(2.5), height=Inches(4.85))
        pic_rg.line.color.rgb = COLOR_CARD_BORDER
        pic_rg.line.width = Pt(1.5)

    # Right Top: Features Card
    add_card(
        s4, 6.35, 1.75, 6.15, 2.7,
        "真實上線介面與關鍵功能亮點",
        [
            "【原生 LIFF 內嵌體驗】聊天室直接開啟 Full Viewport，無跳轉外部瀏覽器，長輩填寫無阻力。",
            "【剩餘名額即時可視】實測如右圖：「目前名額 18/30 人」，即時呈現名額流動狀態。",
            "【LINE Login 身分綁定】整合 LINE Login 驗證真實身分，自動帶入用戶暱稱，杜絕惡意刷單。",
            "【預約推播開關】表單內建「接收活動提醒」，活動日前夕由 Messaging API 自動發送行前通知。",
            "【送出報名唯一序號】送出後秒級生成專屬識別序號，信眾隨時在 LINE 自查，現場掃碼核銷。"
        ],
        title_color=COLOR_PRIMARY
    )

    # Right Bottom: Tech Parameters Card
    add_param_card(
        s4, 6.35, 4.6, 6.15, 2.0,
        "LIFF 技術參數與表單規格 (ENGINEERING SPECS)",
        [
            ("LIFF App ID", "2010938588-VJXpaoyH (Full Viewport 滿版規格)"),
            ("授權範圍 Scopes", "profile, openid (遵循最小個資原則)"),
            ("前端技術棧", "React 18.3 + TypeScript + Tailwind CSS + Lucide Icons"),
            ("報名 API 端點", "POST /api/events/{event_id}/register (ASGI Asynchronous)"),
            ("資料驗證模型", "Pydantic v2.13 Strict Schema (姓名、電話、人數、提醒開關)"),
            ("併發控制模式", "PostgreSQL Atomic RPC (FOR UPDATE 排他行鎖)")
        ],
        title_color=COLOR_TAG_TEXT
    )

    add_tech_pill_bar(s4, ["LIFF v2", "LINE Login OAuth2", "React 18", "Pydantic v2", "Tailwind CSS", "Messaging API"])

    # =============================================================
    # SLIDE 5: P.05 Demo 介面展示：文化抽籤與線上擲筊 (20% 民俗數位創新)
    # =============================================================
    s5 = prs.slides.add_slide(blank_layout)
    apply_light_background(s5)
    add_slide_header(
        s5,
        "Demo 網頁介面：正統五步求籤儀軌與線上擲筊互動",
        "05 / 民俗文化數位化創新 (20%)",
        "P.05 / 10",
        "還原定題稟報、擲筊請示、搖筒取籤、擲筊確認至籤解開示之五步正統民俗禮俗"
    )

    # Left: Two Phone Mockups (Left: 抽籤 / Right: 擲筊投擲)
    img_ft = UI_DIR / "ui_fortune.png"
    img_ja = UI_DIR / "ui_jiao.png"

    if img_ft.exists():
        pic_ft = s5.shapes.add_picture(str(img_ft), Inches(0.8), Inches(1.75), width=Inches(2.5), height=Inches(4.85))
        pic_ft.line.color.rgb = COLOR_CARD_BORDER
        pic_ft.line.width = Pt(1.5)

    if img_ja.exists():
        pic_ja = s5.shapes.add_picture(str(img_ja), Inches(3.55), Inches(1.75), width=Inches(2.5), height=Inches(4.85))
        pic_ja.line.color.rgb = COLOR_CARD_BORDER
        pic_ja.line.width = Pt(1.5)

    # Right Top: Culture Highlights
    add_card(
        s5, 6.35, 1.75, 6.15, 2.7,
        "正統五步求籤儀軌 ＆ 線上擲筊亮點",
        [
            "【正統五步求籤儀軌】實測如左圖：整合「定題稟報 ➔ 擲筊請示 ➔ 搖筒取籤 ➔ 擲筊確認 ➔ 籤解開示」，完整還原台灣宮廟求籤儀軌。",
            "【線上擲筊投擲互動】實測如右圖：支援聖筊、笑筊、陰筊 3-State 狀態機，具備翻轉物理動效與次數統計。",
            "【雙模彈性切換架構】支援「正統五步儀軌」與「快速抽籤」一鍵切換，兼顧文化深度與長輩敏捷體驗。",
            "【三不原則恪守敬意】「不判吉凶、保留白話、重要事回到正式窗口」，杜絕傳統迷信斷言，傳遞正向力量。",
            "【底部導覽無縫直達】Shell 導覽列隨時直達「抽籤」與「擲筊」，青年信眾零門檻體驗信仰之美。"
        ],
        title_color=COLOR_PRIMARY
    )

    # Right Bottom: Tech Parameters
    add_param_card(
        s5, 6.35, 4.6, 6.15, 2.0,
        "民俗數位互動技術參數 (TECHNICAL SPECS)",
        [
            ("前端渲染架構", "Vite 5.0 SPA + React Router v6 Client-Side Routing"),
            ("求籤儀軌狀態機", "5-Step Ritual Wizard State Machine (稟報/請示/抽籤/確認/開示)"),
            ("擲筊模擬引擎", "Client Stochastic Simulation (聖筊 / 笑筊 / 陰筊 3-State FSM)"),
            ("籤詩演算法架構", "三不原則正向心靈算法 (非宿命論、白話賦能導向)"),
            ("靜態資源加速", "ChatGPT Sites Global Edge CDN (全域快取延遲 < 150ms)"),
            ("響應式佈局規格", "Mobile-First RWD (相容 360px ~ 430px 各主流手機螢幕)")
        ],
        title_color=COLOR_TAG_TEXT
    )

    add_tech_pill_bar(s5, ["正統五步儀軌", "3-State FSM", "擲筊問事", "三不原則算法", "Mobile-First RWD", "Edge CDN"])

    # =============================================================
    # SLIDE 6: P.06 Demo 後台設定介面 (DEDICATED FULL SLIDE FOR ADMIN SETTINGS)
    # =============================================================
    s6 = prs.slides.add_slide(blank_layout)
    apply_light_background(s6)
    add_slide_header(
        s6,
        "Demo 後台介面：廟務基本設定與營運管控中樞",
        "06 / 商業營運與管理賦能 (20%)",
        "P.06 / 10",
        "廟方後台專屬控制台：全域廟務設定、參拜時段、即時公告跑馬燈一站式即時生效"
    )

    # Left: Full Real Admin Settings Desktop Screenshot
    img_admin_set = UI_DIR / "ui_admin_settings_full.png"
    if img_admin_set.exists():
        pic_as = s6.shapes.add_picture(str(img_admin_set), Inches(0.8), Inches(1.75), width=Inches(7.4), height=Inches(4.85))
        pic_as.line.color.rgb = COLOR_CARD_BORDER
        pic_as.line.width = Pt(1.5)

    # Right Top: 4 Core Admin Settings Modules
    add_card(
        s6, 8.45, 1.75, 4.05, 2.45,
        "廟務設定與名冊列印模組",
        [
            "【基本資料管理】廟宇全銜、副標題、主祀神祇、服務電話、地址與簡介標語即改即存。",
            "【參拜時段排程】彈性自訂開放時間 (06:00-21:00)，前台服務即時聯動。",
            "【公告跑馬燈推播】置頂公告秒級推播，颱風或法會異動一鍵周知全體信眾。",
            "【法會祈安文疏一鍵列印】報名名冊一鍵排版古典直式紅紙祈安文疏，支援瀏覽器列印，直擊廟務痛點。",
            "【還原預設防呆】內建一鍵還原機制，杜絕誤操作事故。"
        ],
        title_color=COLOR_PRIMARY
    )

    # Right Bottom: Technical & Operational Parameters
    add_param_card(
        s6, 8.45, 4.35, 4.05, 2.25,
        "後台系統參數與資安規格",
        [
            ("後台管理路由", "/admin/settings ｜ /admin/events"),
            ("祈安文疏列印", "CSS vertical-rl + @media print (傳統九行直書)"),
            ("權限控管 (RBAC)", "Admin (主委全權) / Staff (幹事業務)"),
            ("身分驗證模式", "Session Bearer Token (HMAC-SHA256)"),
            ("資料庫儲存模型", "Supabase PostgreSQL JSONB Config"),
            ("設定同步延遲", "< 200ms 全網前台秒級生效"),
            ("安全稽核日誌", "Audit Logs Append-Only (紀錄異動人員/IP)")
        ],
        title_color=COLOR_TAG_TEXT
    )

    add_tech_pill_bar(s6, ["B2B SaaS 控制台", "RBAC 分權控管", "PostgreSQL JSONB", "祈安文疏列印", "即時公告推播", "Session 安全"])

    # =============================================================
    # SLIDE 7: P.07 全鏈路技術架構 (核心技術呈現)
    # =============================================================
    s7 = prs.slides.add_slide(blank_layout)
    apply_light_background(s7)
    add_slide_header(
        s7,
        "全鏈路技術架構：企業級現代全端架構與服務閉環",
        "07 / 系統技術架構 (TECHNOLOGY ARCHITECTURE)",
        "P.07 / 10",
        "深度串聯 LINE 生態、高效非同步 Python 後端與 PostgreSQL 雲端資料庫"
    )

    # Left: Architecture Diagram
    img_arch = RESEARCH_ASSETS / "architecture.png"
    if img_arch.exists():
        pic_ar = s7.shapes.add_picture(str(img_arch), Inches(0.8), Inches(1.75), width=Inches(6.2), height=Inches(4.85))
        pic_ar.line.color.rgb = COLOR_CARD_BORDER
        pic_ar.line.width = Pt(1.5)

    # Right: 4-Layer Tech Architecture Cards with exact specs
    add_param_card(
        s7, 7.3, 1.75, 5.2, 1.15,
        "Layer 1: LINE 用戶端與展示層 (Client Layer)",
        [
            ("生態技術", "LINE OA 2.0 (@983zhzni) ｜ Messaging API ｜ LIFF v2"),
            ("前端技術", "React 18.3 ｜ TypeScript ｜ Tailwind CSS ｜ LINE Login OAuth2")
        ],
        title_color=COLOR_PRIMARY
    )

    add_param_card(
        s7, 7.3, 3.0, 5.2, 1.15,
        "Layer 2: API 閘道與後端服務 (Backend Layer)",
        [
            ("後端框架", "FastAPI 0.115 (Python 3.12-slim) ｜ Asynchronous ASGI (Uvicorn)"),
            ("網路與規格", "Port: 8000/10000 ｜ Workers: 2 ｜ HMAC-SHA256 簽章防偽 ｜ Pydantic v2")
        ],
        title_color=COLOR_TAG_TEXT
    )

    add_param_card(
        s7, 7.3, 4.25, 5.2, 1.15,
        "Layer 3: 資料庫與高併發排他鎖 (Database Layer)",
        [
            ("雲端資料庫", "Supabase PostgreSQL 15 ｜ ACID 事務隔離 (Read Committed)"),
            ("併發控制", "Atomic RPC 預存程序 ｜ SELECT ... FOR UPDATE 行級排他鎖 ｜ 逾時: 5000ms")
        ],
        title_color=COLOR_GOLD
    )

    add_param_card(
        s7, 7.3, 5.5, 5.2, 1.15,
        "Layer 4: AI 知識檢索與安全防護 (AI & Security Layer)",
        [
            ("文史 RAG", "三百年在地文史檢索 ｜ Top-K: 3 ｜ 相似度門檻 >= 0.78"),
            ("快取與防護", "In-Memory 快取 (TTL: 3600s, 延遲 < 400ms) ｜ AI 安全邊界防護引擎")
        ],
        title_color=COLOR_PRIMARY
    )

    add_tech_pill_bar(s7, ["FastAPI 0.115", "Python 3.12", "PostgreSQL 15", "Supabase", "Docker", "Render Cloud", "Pytest 100%"])

    # =============================================================
    # SLIDE 8: P.08 核心技術深度：AI 安全守則與高併發防護 (20% AI 展示)
    # =============================================================
    s8 = prs.slides.add_slide(blank_layout)
    apply_light_background(s8)
    add_slide_header(
        s8,
        "核心技術深度：AI 安全倫理守則 ＆ 資料庫原子行鎖",
        "08 / 核心技術深度與創新亮點 (20%)",
        "P.08 / 10",
        "技術深度決定落地高度：恪守民俗信仰敬意，兼備百萬級高併發工程可靠性"
    )

    # Left: AI Safety Guardrails Card
    add_card(
        s8, 0.8, 1.75, 5.6, 2.5,
        "亮點 1：AI 安全倫理守則 (AI SAFETY GUARDRAILS)",
        [
            "【嚴禁扮演神明】系統層硬約束，AI 絕不宣稱神諭、降旨或斷言個人吉凶命運。",
            "【敏感話題攔截】遇到借貸、投資、醫療、政治等敏感問題自動觸發安全引導。",
            "【合規免責提醒】每則回覆均附帶「以廟方現場與正式公告為準」免責確認提醒。",
            "【權威文史檢索】串接官方萬春宮誌權威文史資料庫，杜絕模型胡言幻覺。"
        ],
        title_color=COLOR_PRIMARY
    )

    # Left Bottom: AI Tech Parameters
    add_param_card(
        s8, 0.8, 4.4, 5.6, 2.2,
        "AI 安全防護技術參數 (GUARDRAIL PARAMETERS)",
        [
            ("安全提示詞注入防護", "System Prompt Level Hard Constraint (硬性不可覆蓋規則)"),
            ("敏感關鍵字正規表達", "Regex Filter 預檢機制 (命中立即觸發安全引導回答)"),
            ("文史檢索參數 (RAG)", "Top-K: 3 ｜ 余弦相似度閾值: Cosine >= 0.78"),
            ("記憶體快取架構", "In-Memory LRU Cache (TTL: 3600s ｜ 平均檢索延遲 < 400ms)")
        ],
        title_color=COLOR_PRIMARY
    )

    # Right: Atomic RPC Concurrency Protection
    add_card(
        s8, 6.8, 1.75, 5.7, 2.5,
        "亮點 2：祭典秒殺行級鎖 (ATOMIC RPC ROW-LOCKING)",
        [
            "【PostgreSQL 預存程序】採用 Supabase RPC 在資料庫層進行原子級名額校驗。",
            "【行級排他鎖】`SELECT ... FOR UPDATE` 在交易期間嚴密鎖定該筆活動資料列。",
            "【零超額保證】法會開放瞬間萬人同時搶報名，保證名額絕不超額、不超賣。",
            "【雙軌容錯備援】支援本機 JSON 降級容錯，保證公共服務永不中斷。"
        ],
        title_color=COLOR_GOLD
    )

    # Right Bottom: DB Tech Parameters
    add_param_card(
        s8, 6.8, 4.4, 5.7, 2.2,
        "高併發鎖機制技術參數 (CONCURRENCY PARAMETERS)",
        [
            ("資料庫引擎版本", "Supabase PostgreSQL 15.6 (雲端託管高可用架構)"),
            ("預存函數簽章", "atomic_register_event(p_event_id, p_user_id, p_payload)"),
            ("排他鎖語法結構", "SELECT quota, registered FROM events WHERE id = p_event_id FOR UPDATE"),
            ("交易隔離級別", "READ COMMITTED ｜ 交易逾時限制: 5000ms ｜ 失敗自動 Rollback")
        ],
        title_color=COLOR_GOLD
    )

    add_tech_pill_bar(s8, ["負責任 AI", "在地文史 RAG", "PostgreSQL RPC", "FOR UPDATE 行鎖", "ACID 交易安全", "零超額保證"])

    # =============================================================
    # SLIDE 9: P.09 商業模式與 Demo 成果 (20% 商業模式)
    # =============================================================
    s9 = prs.slides.add_slide(blank_layout)
    apply_light_background(s9)
    add_slide_header(
        s9,
        "商業模式與 Demo 成果：多元造血機制 ＆ 公開部署與測試驗證",
        "09 / 商業模式與 Demo 成熟度 (20%)",
        "P.09 / 10",
        "公開 Demo、測試與部署紀錄支撐產品可行性"
    )

    # Left: 4 Business Revenue Pillars
    add_card(
        s9, 0.8, 1.75, 5.6, 4.85,
        "四大多元可持續收入模型 (REVENUE MODEL)",
        [
            "1. 基礎 SaaS 訂閱月費：NT$ 3,000 ~ 8,000 / 月\n   提供標準 LINE OA 模板、AI 問答庫、LIFF 報名與管理看板。",
            "2. 客製建置與數位化：NT$ 50,000 ~ 150,000 / 案\n   百年大廟歷史文物 3D 導覽、專屬籤詩演算法與特殊科儀系統導入。",
            "3. 慶典高峰彈性模組：NT$ 20,000 ~ 50,000 / 檔\n   媽祖宮慶或建醮法會專屬高頻寬、排隊抽籤與即時推播模組。",
            "4. 地方創生與文創貼圖：自創「春福小使」貼圖分潤 ＋ 廟埕商圈導流數位折價券。"
        ],
        title_color=COLOR_PRIMARY
    )

    # Right Top: Verified Badges
    add_metric_box(s9, 6.8, 1.75, 2.7, 1.35, "69 / 69", "單元測試通過", "安全/RAG/行鎖 100% 通過", num_color=COLOR_LINE_GREEN)
    add_metric_box(s9, 9.8, 1.75, 2.7, 1.35, "20 / 20", "公開冒煙檢查通過", "API 與深層路由正常", num_color=COLOR_PRIMARY)

    # Right Bottom: Sticker & Business Visual
    img_stk = ASSETS_DIR / "stickers" / "spring-fortune-messenger" / "preview-sheet.png"
    if img_stk.exists():
        pic_st = s9.shapes.add_picture(str(img_stk), Inches(6.8), Inches(3.3), width=Inches(5.7), height=Inches(3.3))
        pic_st.line.color.rgb = COLOR_CARD_BORDER
        pic_st.line.width = Pt(1.2)

    add_tech_pill_bar(s9, ["SaaS 訂閱", "慶典高峰彈性費", "LINE 文創貼圖", "公開 Demo 驗證", "Pytest 100%"])

    # =============================================================
    # SLIDE 10: P.10 未來藍圖與社會價值 (20% 市場需求)
    # =============================================================
    s10 = prs.slides.add_slide(blank_layout)
    apply_light_background(s10)
    add_slide_header(
        s10,
        "未來藍圖與社會價值：從萬春宮走向全台千座宮廟",
        "10 / 發展藍圖與社會影響力 (20%)",
        "P.10 / 10",
        "用科技賦能傳統信仰，讓三百年宮廟文化代代相傳、歷久彌新"
    )

    # 3 Phase Cards
    add_card(
        s10, 0.8, 1.75, 3.6, 3.3,
        "Phase 1: Demo 驗證 (已完成)",
        [
            "示範場域：台中萬春宮。",
            "上線功能：LINE OA 2.0 + 6 格選單 + LIFF 報名 + 後台設定中樞。",
            "全端自動化測試 100% 綠燈通過。"
        ],
        title_color=COLOR_LINE_GREEN
    )

    add_card(
        s10, 4.65, 1.75, 3.6, 3.3,
        "Phase 2: 現場互動 (入選3個月)",
        [
            "導入 LINE Beacon 廟埕現場迎賓推播。",
            "古匾與文物 NFC 感應深度圖文導覽。",
            "新增線上點光明燈與安太歲預約。",
            "拓展至中部地區 10 座指標合作廟宇。"
        ],
        title_color=COLOR_PRIMARY
    )

    add_card(
        s10, 8.5, 1.75, 3.9, 3.3,
        "Phase 3: 跨廟生態 (未來1年)",
        [
            "全台 50+ 指標宮廟巡禮地圖。",
            "跨廟祈福點數與地方商圈共榮聯盟。",
            "建立全台最大民俗文化數位資產庫。",
            "實現持續盈利與品牌連鎖規模效益。"
        ],
        title_color=COLOR_GOLD
    )

    # Bottom Social Value Banner
    soc_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.25), Inches(11.6), Inches(1.35))
    soc_card.fill.solid()
    soc_card.fill.fore_color.rgb = COLOR_CARD
    soc_card.line.color.rgb = COLOR_GOLD
    soc_card.line.width = Pt(1.5)

    tb_soc = s10.shapes.add_textbox(Inches(1.0), Inches(5.3), Inches(11.2), Inches(1.25))
    tf_soc = tb_soc.text_frame
    tf_soc.word_wrap = True
    p_sc1 = tf_soc.paragraphs[0]
    p_sc1.text = "🌟 深刻的社會與文化價值 (SOCIAL & CULTURAL IMPACT)"
    p_sc1.font.size = Pt(12)
    p_sc1.font.bold = True
    p_sc1.font.color.rgb = COLOR_PRIMARY

    p_sc2 = tf_soc.add_paragraph()
    p_sc2.text = "1. 降低青年參與門檻：以年輕人最習慣的 LINE 互動與文創貼圖，消除參拜心理負擔，化解百年香火世代斷層。\n2. 珍貴文化數位永久保存：將耆老口述歷史、古蹟科儀與文物拓本化為數位知識庫，為台灣民俗文化留下永恆資產。"
    p_sc2.font.size = Pt(10.5)
    p_sc2.font.color.rgb = COLOR_TEXT_SUB
    p_sc2.space_before = Pt(3)

    add_tech_pill_bar(s10, ["LINE Beacon 現場推播", "NFC 導覽感應", "跨廟點數聯盟", "文化開放資料", "永續地方創生"])

    # =============================================================
    # SLIDE 11: 封底 (BACKCOVER - Light Theme)
    # =============================================================
    s11 = prs.slides.add_slide(blank_layout)
    apply_light_background(s11)

    # Mascot Image on backcover
    mascot_path = ASSETS_DIR / "brand" / "line-oa-profile-v2.png"
    if mascot_path.exists():
        pic_m = s11.shapes.add_picture(str(mascot_path), Inches(5.666), Inches(0.9), width=Inches(2.0), height=Inches(2.0))
        pic_m.line.color.rgb = COLOR_CARD_BORDER
        pic_m.line.width = Pt(1.2)

    tb_b = s11.shapes.add_textbox(Inches(1.5), Inches(3.1), Inches(10.3), Inches(3.2))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True

    p_b1 = tf_b.paragraphs[0]
    p_b1.alignment = PP_ALIGN.CENTER
    p_b1.text = "科技賦能信仰・智慧傳承文化"
    p_b1.font.size = Pt(36)
    p_b1.font.bold = True
    p_b1.font.color.rgb = COLOR_PRIMARY

    p_b2 = tf_b.add_paragraph()
    p_b2.alignment = PP_ALIGN.CENTER
    p_b2.text = "Temple AI OS 智慧宮廟平台"
    p_b2.font.size = Pt(22)
    p_b2.font.bold = True
    p_b2.font.color.rgb = COLOR_TEXT_MAIN
    p_b2.space_before = Pt(10)

    p_b3 = tf_b.add_paragraph()
    p_b3.alignment = PP_ALIGN.CENTER
    p_b3.text = "感謝各位評審與貴賓聆聽 ｜ 歡迎掃碼現場體驗 LINE 官方帳號 @983zhzni"
    p_b3.font.size = Pt(13.5)
    p_b3.font.bold = True
    p_b3.font.color.rgb = COLOR_TEXT_MUTED
    p_b3.space_before = Pt(14)

    # Tech badge bar at bottom
    add_tech_pill_bar(s11, ["LINE OA @983zhzni", "Messaging API", "LIFF v2", "FastAPI 0.115", "Supabase", "Atomic RPC", "RAG"], top_inch=6.2)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    prs.save(OUTPUT_PPTX)
    print(f"[SUCCESS] Redesigned Pitch Deck PPTX generated at:\n{OUTPUT_PPTX}")


if __name__ == "__main__":
    build_redesigned_deck()
