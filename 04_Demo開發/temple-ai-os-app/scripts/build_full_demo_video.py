"""Complete end-to-end demo video generator for Temple AI OS (2026 LINE AI 競賽).

Produces a 1080p 30fps presentation video with:
1. High-fidelity visual keyframes for each sentence in the narration.
2. Synchronized bottom subtitles.
3. Embedded 3D generated infographics, UI screenshots, and stickers.
4. Timed audio muxing with demo_narration_zh_tw.mp3.
"""

from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
VIDEO_DIR = ROOT / "07_比賽交付" / "Demo影片"
FRAMES_DIR = VIDEO_DIR / "frames"
FRAMES_DIR.mkdir(parents=True, exist_ok=True)

AUDIO_FILE = VIDEO_DIR / "demo_narration_zh_tw.mp3"
OUTPUT_VIDEO = VIDEO_DIR / "Temple_AI_OS_Demo_Final_1080p.mp4"
FFMPEG_BIN = r"C:\ffmpeg\ffmpeg-master-latest-win64-gpl-shared\bin\ffmpeg.exe"

SLIDES_DIR = ROOT / "01_企畫書" / "10頁投稿簡報"
ASSETS_DIR = ROOT / "04_Demo開發" / "temple-ai-os-app" / "assets"
RESEARCH_DIR = ROOT / "03_素材與圖片" / "research-assets" / "temple-ai-os"

FONT_BOLD = "C:/Windows/Fonts/msjhbd.ttc"
FONT_REG = "C:/Windows/Fonts/msjh.ttc"

# Imperial Temple Aesthetic Palette
BG_DARK = (18, 14, 13)
CARD_BG = (28, 22, 20)
CARD_BORDER = (75, 58, 48)
CARD_BORDER_GOLD = (212, 175, 55)
ACCENT_RED = (145, 28, 28)
ACCENT_GOLD = (212, 175, 55)
ACCENT_GOLD_BRIGHT = (245, 197, 66)
ACCENT_GREEN = (6, 199, 85)
TEXT_WHITE = (255, 253, 248)
TEXT_MUTED = (195, 180, 168)
TEXT_GOLD = (252, 230, 160)

SCENE_SPECS = [
    {
        "id": "scene_01",
        "dur": 4.10,
        "cat": "2026 LINE AI 創新創業競賽 參賽作品",
        "title": "Temple AI OS 智慧宮廟平台",
        "headline": "科技賦能信仰・智慧傳承文化",
        "img_path": SLIDES_DIR / "cover_style2_minimalist.jpg",
        "full_cover": False,
        "bullets": [
            "台灣宮廟專屬智慧服務入口與數位營運大腦",
            "深度串聯 LINE OA 2.0、Messaging API 與 LIFF",
            "示範資料場景：台中萬春宮公開資料"
        ],
        "subtitle": "各位評審大家好，我們是 Temple AI OS 團隊。",
        "badge": "團隊願景：把整座宮廟的服務與文化，完整收進 LINE 裡"
    },
    {
        "id": "scene_02",
        "dur": 5.36,
        "cat": "01 / 市場背景與文化需求",
        "title": "三百年香火傳承：台灣宮廟龐大信眾生態",
        "headline": "全台超過 1.2 萬座合法登記寺廟",
        "img_path": SLIDES_DIR / "slide1_painpoints.jpg",
        "full_cover": False,
        "bullets": [
            "全台合法登記寺廟超過 1.2 萬座，年度香客破千萬人次",
            "民俗信仰是台灣在地民眾最重要的心靈依託與生活核心",
            "百億宗教商機與節慶人流，蘊藏巨大的數位升級潛力"
        ],
        "subtitle": "全台灣有一萬兩千多座宮廟，每年承載無數信眾的心靈寄託。",
        "badge": "市場基盤：台灣寺廟密度極高，全民信眾基礎深厚"
    },
    {
        "id": "scene_03",
        "dur": 9.87,
        "cat": "01 / 核心痛點分析",
        "title": "數位時代的斷層：青年信眾退怯 ＆ 廟務繁重負擔",
        "headline": "傳統紙本行政難以為繼，青年缺乏友善參與管道",
        "img_path": SLIDES_DIR / "slide1_painpoints.jpg",
        "full_cover": False,
        "bullets": [
            "信眾端痛點：參拜順序與規矩複雜，現場資訊零散難查",
            "廟方端痛點：法會活動依賴手寫紙本登記，極易出錯遺漏",
            "營運端痛點：志工每日重複回答交通、時間，電話接到手軟"
        ],
        "subtitle": "然而在數位時代，年輕信眾常因不熟悉參拜規矩而退怯；廟方志工更每天陷在繁重的紙本報名、重複客服與電話通知中。",
        "badge": "核心痛點：傳統紙本作業 80% 人力耗損 ｜ 年輕世代文化斷層"
    },
    {
        "id": "scene_04",
        "dur": 5.97,
        "cat": "02 / 產品核心提問與主張",
        "title": "Temple AI OS：把宮廟服務完整收進 LINE 裡",
        "headline": "以全台最高滲透率的通訊軟體，打造智慧宮廟大腦",
        "img_path": SLIDES_DIR / "slide2_solution.jpg",
        "full_cover": False,
        "bullets": [
            "免下載外部 App：全台 LINE 滲透率超過 95%",
            "零安裝與零學習成本：信眾長輩隨點隨用",
            "以現代科技守護文化溫度：不是冰冷工具，而是有溫度的信仰助理"
        ],
        "subtitle": "我們問：能不能把整座宮廟的服務與文化，完整收進大家最熟悉的 LINE 裡？",
        "badge": "核心價值：信眾有感・廟方減負・文化永續"
    },
    {
        "id": "scene_05",
        "dur": 2.38,
        "cat": "02 / 產品定位",
        "title": "Temple AI OS 智慧宮廟平台正式亮相",
        "headline": "專為台灣民俗文化設計的端到端作業系統",
        "img_path": SLIDES_DIR / "slide2_solution.jpg",
        "full_cover": False,
        "bullets": [
            "C 端信眾：LINE 官方帳號 + 6 格圖文選單 + 敏捷 LIFF 表單",
            "B 端廟方：雲端營運儀表板 + 問答知識庫 + 行級併發鎖",
            "深度融合 LINE 生態：原生體驗，非單純外部網頁包裝"
        ],
        "subtitle": "這就是 Temple AI OS。",
        "badge": "產品定位：宮廟專屬智慧服務入口與營運大腦"
    },
    {
        "id": "scene_06",
        "dur": 4.54,
        "cat": "03 / LINE 官方帳號原生入口",
        "title": "免下載 App：掃碼即加入 LINE 官方帳號",
        "headline": "好友即會員，聊天室即是一座數位宮廟",
        "img_path": ASSETS_DIR / "brand" / "line-oa-profile-v2.png",
        "full_cover": False,
        "bullets": [
            "LINE OA 2.0 專屬 Basic ID: @983zhzni",
            "Messaging API 嚴格 HMAC-SHA256 簽章安全驗證",
            "示範資料場景：台中萬春宮公開資料 Demo"
        ],
        "subtitle": "信眾不用下載任何 App，掃碼就能加入 LINE 官方帳號。",
        "badge": "極簡進入門檻：無須登入註冊，掃碼直接開啟智慧服務"
    },
    {
        "id": "scene_07",
        "dur": 6.26,
        "cat": "04 / LINE 原生互動體驗",
        "title": "正統宮廟 2×3 六格圖文選單 (Rich Menu 2500×1686)",
        "headline": "莊嚴殿宇絳紅泥金美學，指尖直達六大核心廟務",
        "img_path": ASSETS_DIR / "rich-menu" / "main-2500x1686.png",
        "full_cover": False,
        "bullets": [
            "【問・行】詢問參拜方式 (AI 智慧導引) ｜ 查看活動報名 (四季法會登記)",
            "【籤・廟】抽文化籤詩 (聖母靈籤解讀) ｜ 看主殿導覽 (三百年古蹟文史)",
            "【查・服】查報名進度 (序號速查核銷) ｜ 聯絡廟務客服 (執事便民專線)"
        ],
        "subtitle": "透過精心規劃的 6 格圖文選單，信眾能隨時問、隨時查、隨時報名。",
        "badge": "正統宮廟美學：硃砂絳紅與泥金迴紋，完美契合三百年大廟文化"
    },
    {
        "id": "scene_08",
        "dur": 8.24,
        "cat": "05 / AI 在地文化知識庫 (RAG)",
        "title": "在地文史 RAG：萬春宮媽祖參拜動線與交通",
        "headline": "精準意圖識別與文史檢索，0.4 秒極速秒回",
        "img_path": SLIDES_DIR / "slide4_ai_safety.jpg",
        "full_cover": False,
        "bullets": [
            "整合全國宗教資訊系統與台中萬春宮權威文史資料",
            "智慧意圖分類：即時識別參拜動線、神祇背景、文物古蹟與交通",
            "熱門問答記憶體快取加速，提供 0.4 秒極致流暢回覆"
        ],
        "subtitle": "當我們點選「詢問參拜方式」——後端以在地知識庫快速分析，精準提供萬春宮媽祖參拜動線與交通資訊。",
        "badge": "在地知識檢索：回答有依據、有考證，絕非通用模型胡言亂語"
    },
    {
        "id": "scene_09",
        "dur": 8.68,
        "cat": "05 / 核心技術亮點：AI 安全與倫理守則",
        "title": "恪守民俗敬意：AI 安全守則與合規免責提醒",
        "headline": "有溫度、講依據、守分寸，杜絕怪力亂神與誤導",
        "img_path": SLIDES_DIR / "slide4_ai_safety.jpg",
        "full_cover": False,
        "bullets": [
            "【嚴禁神諭】AI 絕不扮演神明宣稱神諭、降旨或斷言個人吉凶",
            "【敏感防護】遇到投資、借貸、求財時自動引導正向心理依託",
            "【合規免責】每則回覆均明確標註以廟方現場與正式公告為準"
        ],
        "subtitle": "更重要的是，我們的 AI 嚴格恪守安全防護守則，絕不扮演神明宣稱神諭，每則回覆皆附有正式公告免責提醒。",
        "badge": "負責任 AI：宗教敬意與科技理性的完美結合"
    },
    {
        "id": "scene_10",
        "dur": 6.40,
        "cat": "06 / 靈活活動推薦 (Flex Message)",
        "title": "結構化互動：精美 Flex Message 輪播卡片",
        "headline": "法會活動視覺化推薦，名額狀態一目了然",
        "img_path": SLIDES_DIR / "slide6_registration.jpg",
        "full_cover": False,
        "bullets": [
            "Flex Message 橫向輪播卡片直覺呈現近期法會與青年活動",
            "即時標記名額狀態（開放報名 / 即將額滿 / 已額滿）",
            "一鍵點擊即可直接觸發聊天室內報名程序"
        ],
        "subtitle": "同時，系統會智慧推薦近期活動，以精美的輪播卡片呈現在信眾眼前。",
        "badge": "原生視覺體驗：LINE 內最沉浸的卡片式互動"
    },
    {
        "id": "scene_11",
        "dur": 4.28,
        "cat": "06 / 輕量敏捷報名 (LIFF)",
        "title": "零阻力體驗：LINE 內部滑出 LIFF 敏捷表單",
        "headline": "免跳出、免下載外部 App，老人小孩都能輕鬆填寫",
        "img_path": SLIDES_DIR / "slide6_registration.jpg",
        "full_cover": False,
        "bullets": [
            "LIFF 聊天室底部滑出原生表單，操作極其流暢",
            "無需跳轉外部瀏覽器，完全保留在 LINE 對話情境中",
            "簡化輸入欄位，信眾 30 秒內即可完成報名"
        ],
        "subtitle": "點擊卡片，直接在 LINE 內部滑出輕量報名表單。",
        "badge": "LIFF 整合：告別紙本與傳統外部 Google 表單的割裂感"
    },
    {
        "id": "scene_12",
        "dur": 4.42,
        "cat": "06 / LINE Login 身分整合",
        "title": "安全驗證：LINE Login 身分自動綁定",
        "headline": "零阻力送出報名，杜絕機器人洗單",
        "img_path": SLIDES_DIR / "slide6_registration.jpg",
        "full_cover": False,
        "bullets": [
            "整合 LINE Login 自動校驗信眾真實身分",
            "信眾無須重複註冊新帳號或記憶密碼",
            "自動帶入用戶名稱與基本聯繫資料，送出超省力"
        ],
        "subtitle": "透過 LINE Login 自動驗證身分，零阻力送出報名。",
        "badge": "真實身分綁定：防止幽靈報名，確保廟務名額真實有效"
    },
    {
        "id": "scene_13",
        "dur": 4.78,
        "cat": "06 / 企業級高可用架構",
        "title": "高併發防護：PostgreSQL 資料庫行級排他鎖 (Atomic RPC)",
        "headline": "祭典秒殺不超額，底層架構穩如泰山",
        "img_path": SLIDES_DIR / "slide6_registration.jpg",
        "full_cover": False,
        "bullets": [
            "【原子操作】Supabase PostgreSQL 預存程序 (Atomic RPC)",
            "【行級排他】FOR UPDATE 資料庫鎖機制，毫秒級防護",
            "【零超賣保證】瞬間大量流量湧入，保證剩餘名額精準不超額"
        ],
        "subtitle": "底層採用資料庫行鎖機制，徹底防止活動超額並發。",
        "badge": "技術深度：企業級 ACID 交易防護，高併發考驗安全過關"
    },
    {
        "id": "scene_14",
        "dur": 8.28,
        "cat": "07 / 服務全鏈路閉環",
        "title": "信眾自服務：手機即時查序號 ＆ 自動行前推播",
        "headline": "徹底告別打電話確認，廟方行政減負 80%",
        "img_path": SLIDES_DIR / "slide3_ecosystem.jpg",
        "full_cover": False,
        "bullets": [
            "信眾隨時在圖文選單輸入手機號碼秒查審核狀態與序號",
            "Messaging API 於活動日前夕自動發送行前提醒注意事項",
            "大幅減少廟務志工 80% 的電話諮詢與核對負擔"
        ],
        "subtitle": "報名完成後，信眾隨時能在選單中查詢自己的報名序號與審核狀態，完全告別打電話確認的傳統困擾。",
        "badge": "自服務閉環：查詢自理、推播主動、廟方輕鬆"
    },
    {
        "id": "scene_15",
        "dur": 2.22,
        "cat": "08 / 廟方數位營運中樞",
        "title": "走進廟方管理端：B2B Admin Dashboard",
        "headline": "將傳統宮廟人工作業升級為現代化數據營運",
        "img_path": SLIDES_DIR / "slide7_dashboard.jpg",
        "full_cover": False,
        "bullets": [
            "全方位掌握信眾報名、名額流動與活動熱度",
            "專為宮廟總幹事與管理幹事設計的現代化管理面板"
        ],
        "subtitle": "接著來看廟方端。",
        "badge": "B2B 數位轉型：廟務幹事的高效數位駕駛艙"
    },
    {
        "id": "scene_16",
        "dur": 5.33,
        "cat": "08 / 實時看板與數據同步",
        "title": "秒級同步：前台報名送出，後台看板即刻顯示",
        "headline": "活動人數、名額狀態、核銷進度一目了然",
        "img_path": SLIDES_DIR / "slide7_dashboard.jpg",
        "full_cover": False,
        "bullets": [
            "信眾在 LINE 送出報名，管理後台秒級即時同步更新",
            "活動名額實時儀表統計，一眼看清報到與繳款狀態",
            "活動狀態自由切換：草稿 / 開放報名 / 額滿 / 已結束"
        ],
        "subtitle": "管理者登入後台儀表板，剛才信眾送出的報名即時同步顯示！",
        "badge": "即時連動：前後端無縫數據管道，零延遲掌握信眾動態"
    },
    {
        "id": "scene_17",
        "dur": 6.97,
        "cat": "08 / 審核名冊與 AI 洞察",
        "title": "一鍵審核匯出名單 ＆ 信眾 AI 話題洞察分析",
        "headline": "數據賦能廟務決策，精準捕捉信眾知識缺口",
        "img_path": SLIDES_DIR / "slide7_dashboard.jpg",
        "full_cover": False,
        "bullets": [
            "名冊一鍵匯出 Excel / CSV，方便現場志工快速核銷",
            "AI 熱點話題統計：分析信眾最常詢問的科儀問題與未解疑惑",
            "後台一鍵建立或修改問答規則，即時同步至 LINE 聊天室生效"
        ],
        "subtitle": "管理者可以一鍵審核、匯出名單，並看見信眾最常詢問的 AI 熱門話題與知識缺口。",
        "badge": "數據洞察：讓宮廟管理階層真正看懂信眾關注的話題"
    },
    {
        "id": "scene_18",
        "dur": 7.14,
        "cat": "08 / 資安控管與審計日誌",
        "title": "資安稽核日誌與多管理員分權 (RBAC)",
        "headline": "嚴謹權限控管，宮廟幹事在辦公室輕鬆掌舵",
        "img_path": SLIDES_DIR / "slide7_dashboard.jpg",
        "full_cover": False,
        "bullets": [
            "多角色分權管理 (Owner 主委 / Staff 幹事)，避免操作混亂",
            "密碼安全雜湊，信眾個人隱私資料全面防護不外洩",
            "完整記錄後台異動與審計日誌 (Audit Logs)，責任歸屬清晰"
        ],
        "subtitle": "系統更提供嚴格的權限控管與稽核日誌，讓宮廟幹事在辦公室就能輕鬆掌舵大型活動。",
        "badge": "企業級資安：符合法規與宗教團體隱私安全標準"
    },
    {
        "id": "scene_19",
        "dur": 8.06,
        "cat": "09 / 青年文化加值與貼圖",
        "title": "文化年輕化：抽籤擲筊 ＆ 原創 LINE 文創貼圖",
        "headline": "「春福小使」8 款文創貼圖，融入信眾日常生活",
        "img_path": ASSETS_DIR / "stickers" / "spring-fortune-messenger" / "preview-sheet.png",
        "full_cover": False,
        "bullets": [
            "原創文創角色「春福小使」8 款 LINE 貼圖，深化黏著度",
            "線上文化抽籤與正向籤詩解析，給予信眾日常心靈寄託",
            "數位擲筊互動，讓青年以趣味方式體會民俗信仰之美"
        ],
        "subtitle": "除了實用服務，我們更結合文化抽籤、線上擲筊與 LINE 原生文創貼圖，讓信仰年輕化、生活化。",
        "badge": "文化加值：跳脫傳統嚴肅框架，打造信眾喜愛的日常互動"
    },
    {
        "id": "scene_20",
        "dur": 3.92,
        "cat": "10 / Demo 成果與公開部署",
        "title": "公開 Demo：萬春宮公開資料示範場景",
        "headline": "全端技術驗證完備，具備直接上線服務之成熟度",
        "img_path": RESEARCH_DIR / "architecture.png",
        "full_cover": False,
        "bullets": [
            "示範場景：以台中萬春宮公開資料建立 Demo",
            "Render (FastAPI) + Supabase + LINE OA 全線暢通運作",
            "69 項後端單元測試 100% 通過 ｜ 20 項公開冒煙檢查通過"
        ],
        "subtitle": "Temple AI OS 已完成公開 Demo 部署，並以萬春宮公開資料建立示範場景。",
        "badge": "公開 Demo：具備產品驗證與商用落地雛形"
    },
    {
        "id": "scene_21",
        "dur": 7.91,
        "cat": "10 / 未來藍圖與社會價值",
        "title": "未來願景：從萬春宮走向全台千座宮廟",
        "headline": "科技賦能信仰・智慧傳承文化",
        "img_path": SLIDES_DIR / "slide8_business.jpg",
        "full_cover": False,
        "bullets": [
            "第 1 階段：萬春宮 MVP 上線驗證全鏈路 (已完成)",
            "第 2 階段：現場 LINE Beacon 推播與光明燈線上預約",
            "第 3 階段：串聯全台 50+ 指標宮廟文化巡禮與商圈導流"
        ],
        "subtitle": "我們希望能以此示範點為起點，推廣至全台千座宮廟，用科技賦能信仰，讓百年文化代代相傳。",
        "badge": "長遠使命：讓每座宮廟都擁有屬於自己的智慧服務大腦"
    },
    {
        "id": "scene_22",
        "dur": 2.31,
        "cat": "團隊致謝 ｜ 敬請指導",
        "title": "感謝各位評審聆聽 ｜ 歡迎體驗 LINE 官方帳號",
        "headline": "Temple AI OS 智慧宮廟平台",
        "img_path": SLIDES_DIR / "cover_style3_oriental.jpg",
        "full_cover": False,
        "bullets": [
            "LINE 官方帳號 Basic ID: @983zhzni",
            "公開 Demo 站台已部署，可供評審體驗",
            "期待與您攜手賦能全台千座宮廟文化傳承"
        ],
        "subtitle": "謝謝各位評審！",
        "badge": "官方帳號 Basic ID: @983zhzni ｜ 感謝評審指教"
    }
]


def wrap_text_natural(text: str, font, max_pixels: int) -> list[str]:
    import re
    tokens = re.findall(r'[a-zA-Z0-9_./@#-]+|[\u4e00-\u9fff]|[^\u4e00-\u9fff\s]| ', text)
    lines = []
    cur_line = ""
    for tok in tokens:
        if font.getlength(cur_line + tok) <= max_pixels:
            cur_line += tok
        else:
            if cur_line:
                lines.append(cur_line.strip())
            cur_line = tok.strip()
    if cur_line:
        lines.append(cur_line.strip())
    return lines


def render_scene_frame(spec: dict, out_path: Path) -> None:
    width, height = 1920, 1080

    font_title = ImageFont.truetype(FONT_BOLD, 38)
    font_cat = ImageFont.truetype(FONT_BOLD, 18)
    font_head = ImageFont.truetype(FONT_BOLD, 26)
    font_body = ImageFont.truetype(FONT_REG, 21)
    font_sub = ImageFont.truetype(FONT_BOLD, 28)
    font_badge = ImageFont.truetype(FONT_BOLD, 19)

    if spec.get("full_cover", False) and spec["img_path"].exists():
        # Render background picture
        bg_pic = Image.open(spec["img_path"]).convert("RGBA")
        bg_pic = bg_pic.resize((width, height), Image.Resampling.LANCZOS)
        im = bg_pic.convert("RGB")

        # Dark overlay on top and bottom for readability
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        d_ov = ImageDraw.Draw(overlay)
        d_ov.rectangle([(0, 0), (width, 140)], fill=(16, 12, 11, 220))
        d_ov.rectangle([(60, 925), (width - 60, 1045)], fill=(16, 12, 11, 240))
        im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(im)

        draw.line([(0, 140), (width, 140)], fill="#D4AF37", width=2)
        draw.text((80, 25), spec["cat"].upper(), font=font_cat, fill=ACCENT_GOLD_BRIGHT)
        draw.text((80, 58), spec["title"], font=font_title, fill=TEXT_WHITE)

        if spec["badge"]:
            draw.rounded_rectangle([(80, 845), (1100, 905)], radius=14, fill=ACCENT_RED, outline=ACCENT_GOLD, width=2)
            draw.text((105, 875), spec["badge"], font=font_badge, fill=TEXT_WHITE)

        # Subtitle plaque
        draw.rounded_rectangle([(60, 925), (width - 60, 1045)], radius=18, fill=(18, 12, 11), outline=ACCENT_GOLD, width=3)
        draw.rounded_rectangle([(66, 931), (width - 66, 1039)], radius=14, outline=(138, 100, 26), width=1)
        draw.text((width // 2 + 2, 987), spec["subtitle"], font=font_sub, fill=(24, 6, 6), anchor="mm")
        draw.text((width // 2, 985), spec["subtitle"], font=font_sub, fill=TEXT_WHITE, anchor="mm")

        im.save(out_path, quality=95)
        return

    # -------------------------------------------------------------
    # SPLIT / CARD LAYOUT FOR STANDARD SCENES (TEMPLE AESTHETIC)
    # -------------------------------------------------------------
    im = Image.new("RGBA", (width, height), (18, 14, 13, 255))
    draw = ImageDraw.Draw(im)
    for y in range(height):
        ratio = y / height
        r = int(18 + 10 * ratio)
        g = int(14 + 7 * ratio)
        b = int(13 + 6 * ratio)
        draw.line((0, y, width, y), fill=(r, g, b, 255))

    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((400, 100, 1520, 800), fill=(212, 175, 55, 14))
    im = Image.alpha_composite(im, glow)
    draw = ImageDraw.Draw(im)

    # 1. Top Navigation Bar
    draw.rectangle([(0, 0), (width, 110)], fill=(24, 18, 17))
    draw.line([(0, 108), (width, 108)], fill=ACCENT_GOLD, width=3)
    draw.line([(0, 105), (width, 105)], fill=(120, 86, 27), width=1)

    # Logo & Brand Pill: Imperial Cinnabar Red (#8B1E1E) with Gold Border
    draw.rounded_rectangle([(60, 22), (285, 86)], radius=14, fill=ACCENT_RED, outline=ACCENT_GOLD, width=2)
    draw.text((172, 54), "TEMPLE AI OS", font=ImageFont.truetype(FONT_BOLD, 21), fill=TEXT_WHITE, anchor="mm")

    # Category & Title
    draw.text((310, 25), spec["cat"].upper(), font=font_cat, fill=ACCENT_GOLD_BRIGHT)
    draw.text((310, 53), spec["title"], font=ImageFont.truetype(FONT_BOLD, 32), fill=TEXT_WHITE)

    # Right Contest Tag
    draw.rounded_rectangle([(width - 430, 28), (width - 60, 80)], radius=26, fill=(32, 24, 22), outline=ACCENT_GOLD, width=2)
    draw.ellipse([(width - 405, 45), (width - 387, 63)], fill=ACCENT_GREEN)
    draw.text((width - 240, 54), "2026 LINE AI 競賽作品", font=ImageFont.truetype(FONT_BOLD, 17), fill=TEXT_WHITE, anchor="mm")

    # 2. Main Center Area (y: 130 to 900)
    left_x, left_w = 60, 980
    right_x, right_w = 1070, 790
    stage_top, stage_h = 130, 770

    # Left Frame: Embedded Image / UI Mockup
    draw.rounded_rectangle([(left_x, stage_top), (left_x + left_w, stage_top + stage_h)], radius=20, fill=CARD_BG, outline=CARD_BORDER_GOLD, width=2)
    draw.rounded_rectangle([(left_x + 8, stage_top + 8), (left_x + left_w - 8, stage_top + stage_h - 8)], radius=16, outline=CARD_BORDER, width=1)

    img_path = spec["img_path"]
    if img_path and img_path.exists():
        src_pic = Image.open(img_path).convert("RGBA")
        pad = 24
        max_w = left_w - pad * 2
        max_h = stage_h - pad * 2
        src_ratio = src_pic.width / src_pic.height
        target_ratio = max_w / max_h

        if src_ratio > target_ratio:
            new_w = max_w
            new_h = int(new_w / src_ratio)
        else:
            new_h = max_h
            new_w = int(new_h * src_ratio)

        src_pic = src_pic.resize((new_w, new_h), Image.Resampling.LANCZOS)
        paste_x = left_x + pad + (max_w - new_w) // 2
        paste_y = stage_top + pad + (max_h - new_h) // 2
        im.paste(src_pic.convert("RGB"), (paste_x, paste_y))

    # Right Card: Structured Highlights & Value Proposition
    draw.rounded_rectangle([(right_x, stage_top), (right_x + right_w, stage_top + stage_h)], radius=20, fill=CARD_BG, outline=CARD_BORDER_GOLD, width=2)
    draw.rounded_rectangle([(right_x + 8, stage_top + 8), (right_x + right_w - 8, stage_top + stage_h - 8)], radius=16, outline=CARD_BORDER, width=1)

    # Golden Left Accent Stripe on Right Card
    draw.rounded_rectangle([(right_x + 10, stage_top + 16), (right_x + 18, stage_top + stage_h - 16)], radius=4, fill=ACCENT_GOLD)

    # Headline
    cur_y = stage_top + 38
    draw.text((right_x + 42, cur_y), spec["headline"], font=font_head, fill=TEXT_GOLD)
    cur_y += 56
    draw.line([(right_x + 42, cur_y), (right_x + right_w - 42, cur_y)], fill=(120, 86, 27), width=2)
    cur_y += 34

    # Bullets with Golden Diamond Symbols (◆)
    for b in spec["bullets"]:
        dx, dy = right_x + 48, cur_y + 14
        draw.polygon([(dx, dy - 8), (dx + 8, dy), (dx, dy + 8), (dx - 8, dy)], fill=ACCENT_GOLD_BRIGHT, outline=ACCENT_GOLD)
        lines = wrap_text_natural(b, font_body, right_w - 120)

        for ln in lines:
            draw.text((right_x + 75, cur_y), ln, font=font_body, fill=TEXT_WHITE)
            cur_y += 34
        cur_y += 20

    # Value Pill Badge at Bottom of Right Card
    if spec["badge"]:
        badge_y = stage_top + stage_h - 96
        draw.rounded_rectangle([(right_x + 30, badge_y), (right_x + right_w - 30, badge_y + 68)], radius=14, fill=(50, 16, 16), outline=ACCENT_GOLD, width=2)
        draw.text((right_x + right_w // 2, badge_y + 34), spec["badge"], font=font_badge, fill=TEXT_GOLD, anchor="mm")

    # 3. Bottom Subtitle Bar (Imperial Plaque Layout)
    sub_box = [(60, 925), (width - 60, 1045)]
    draw.rounded_rectangle(sub_box, radius=18, fill=(18, 12, 11), outline=ACCENT_GOLD, width=3)
    draw.rounded_rectangle([(66, 931), (width - 66, 1039)], radius=14, outline=(138, 100, 26), width=1)

    tx, ty = width // 2, 985
    draw.text((tx + 2, ty + 2), spec["subtitle"], font=font_sub, fill=(24, 6, 6), anchor="mm")
    draw.text((tx, ty), spec["subtitle"], font=font_sub, fill=TEXT_WHITE, anchor="mm")

    im.convert("RGB").save(out_path, quality=95)


def build_video():
    print("[1/3] Rendering 22 Full HD Scene Keyframes...")
    concat_lines = []

    for i, spec in enumerate(SCENE_SPECS):
        frame_file = FRAMES_DIR / f"{spec['id']}.jpg"
        render_scene_frame(spec, frame_file)
        print(f"  -> Generated {frame_file.name} (dur: {spec['dur']:.2f}s)")
        concat_lines.append(f"file '{frame_file.resolve().as_posix()}'")
        concat_lines.append(f"duration {spec['dur']:.2f}")

    # Add last file again as required by ffconcat format
    last_file = FRAMES_DIR / f"{SCENE_SPECS[-1]['id']}.jpg"
    concat_lines.append(f"file '{last_file.resolve().as_posix()}'")

    concat_file = VIDEO_DIR / "scenes.txt"
    with open(concat_file, "w", encoding="utf-8") as f:
        f.write("\n".join(concat_lines) + "\n")
    print(f"[2/3] Wrote ffconcat manifest at: {concat_file}")

    print("[3/3] Encoding 1080p 30fps MP4 with ffmpeg...")
    cmd = [
        FFMPEG_BIN,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
        "-i", str(AUDIO_FILE),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-preset", "veryfast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        str(OUTPUT_VIDEO)
    ]

    print("Running command:", " ".join(cmd))
    res = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if res.returncode != 0:
        print("[ERROR] FFmpeg failed:")
        print(res.stderr[-1000:])
        raise RuntimeError("FFmpeg encoding failed.")

    print(f"[SUCCESS] High-resolution Demo Video successfully generated at:\n{OUTPUT_VIDEO}")


if __name__ == "__main__":
    build_video()
