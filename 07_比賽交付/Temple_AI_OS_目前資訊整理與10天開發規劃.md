# Temple AI OS 目前資訊整理與 10 天開發規劃

整理日期：2026-08-05

## 1. 目前進度總覽

目前專案已完成「題目研究、競賽規則整理、宮廟資料蒐集、功能規格草案、Demo 假資料、RAG 知識庫與企畫書初版」。尚未看到正式 MVP 程式主體，因此接下來的重點應從文件規劃轉入可展示 Demo。

已知成果：

- 已選定主題：Temple AI OS，AI 驅動的宮廟智慧社群營運平台。
- 已完成競賽研究筆記：包含賽程、交件、評分項目、LINE 技術方向。
- 已完成萬春宮資料整理：地址、主祀神祇、電話、座標、公開資料來源與授權判斷。
- 已完成完整企畫書初版與 PDF：可再濃縮成 10 頁投稿簡報。
- 已完成功能規格草案：14 項功能與 LINE / LIFF / RAG / Dashboard 規劃。
- 已完成 Demo sample data：活動、使用者、報名紀錄、Dashboard 指標、LINE 訊息文案。
- 已完成 RAG 知識庫包：基本問答、參拜服務、歷史文化摘要、AI 安全回覆規則。
- 已有素材輸出：企畫書渲染圖、架構圖、Logo、RAG Agent 圖、旅程圖、ERD 圖。

尚未完成或需確認：

- LINE Official Account、Messaging API Channel、LINE Login / LIFF App 是否已實際建立。
- Webhook 後端、LIFF 前端、Dashboard 是否已開始實作。
- 10 頁投稿簡報 PDF 尚待正式壓縮。
- 3 分鐘 Demo 影片尚待腳本收斂、錄製與上傳。
- 技術使用切結書、個資同意書、不侵權保證書、提案切結書尚待填寫與簽署。

## 2. 主題選定

競賽名稱：2026 LINE AI 創新創業競賽

競賽主軸：建構 AI 智慧生活生態系，鼓勵學生運用 AI 技術結合創新與商業應用。

官方主題方向：

- 智慧校園
- 智慧零售
- 智慧照護

加分主題：

- 智慧宮廟特別獎，獎金 2 萬元，可與其他獎項重複獲獎。

目前首選題目：

> Temple AI OS：智慧宮廟 AI 服務入口與數位營運平台

一句話提案：

> Temple AI OS 不是 AI 算命或單純聊天機器人，而是把 LINE 變成宮廟服務入口，讓信眾可問、可報名、可收到通知，讓管理者可更新內容、管理活動並看見營運數據。

選這個主題的理由：

- 直接命中智慧宮廟特別獎。
- 宮廟、信眾、活動、導覽、文化、客服與通知都很適合放在 LINE 場景。
- 可以展示完整 LINE 生態，而不是只有 AI 問答。
- 目前已有萬春宮公開資料、Demo 活動資料與 RAG 知識庫，能快速做出可信 Demo。
- 題目相較校園 FAQ、零售 Bot 較不容易撞題。

需要避免的錯誤定位：

- 不要包裝成 AI 算命。
- 不要讓 AI 扮演神明或宣稱神諭。
- 不要只做聊天機器人，否則無法充分對應 LINE 生態與商業模式評分。
- 不要宣稱 Demo 資料是萬春宮官方營運資料。

## 3. 競賽交件與評分項目

投稿截止：

- 2026-09-24 17:00，Asia/Taipei。

投稿資料：

- 技術使用切結書
- 個人資料使用同意書
- 團隊不侵權保證書
- 參賽團隊提案切結書，全員簽署，可電子簽名
- 簡報 PDF，10 頁內，不含封面與封底
- Demo 影片 YouTube Link，3 分鐘內

初選：

- 2026-09-29 公告 12 組入選團隊。

入選輔導：

- 2026-10-02 至 2026-10-14，企劃輔導一場與 LINE 技術諮詢一場，每場 50 分鐘。

決選：

- 2026-10-16 09:00-15:00。
- 每組簡報 5 分鐘，評審問答 5 分鐘。

五項評分各 20%：

| 評分項目 | Temple AI OS 對應策略 |
|---|---|
| AI 服務互動展示 | AI 文化導覽、RAG 問答、活動查詢、AI 文化抽籤、客服分流、Dashboard 摘要。 |
| 目標族群 / 市場需求 | 新信眾、固定信眾、宮廟管理者、周邊攤商；解決資訊分散、參與門檻高、行政負擔與營運不可見。 |
| LINE App 應用創意性 | LINE OA、Rich Menu、Messaging API、Flex Message、LIFF / MINI App、LINE Login、QR / NFC 導覽。 |
| 營運模式 / 商業模式 | SaaS 月費、導入建置費、祭典短期專案、攤商曝光與資料分析加值模組。 |
| LINE 生態體系結合度 | LINE 作為入口、會員識別、對話、表單、通知、客服與服務閉環，不是外部網站硬塞進 LINE。 |

## 4. 使用者與市場痛點

目標使用者：

| 使用者 | 需求 | Demo 場景 |
|---|---|---|
| 新信眾 / 遊客 | 想快速理解宮廟文化、參拜流程、交通與近期活動。 | 掃 QR 加入 LINE，問「第一次來萬春宮要怎麼拜？」 |
| 固定信眾 | 想接收活動提醒、報名服務、查看紀錄。 | 從 Rich Menu 進入活動中心，完成報名並收到通知。 |
| 宮廟管理者 | 想降低客服、報名、通知與統計負擔。 | 後台看到報名數、熱門問題、知識缺口與推播入口。 |
| 周邊攤商 / 合作單位 | 想在祭典期間曝光、導流與追蹤成效。 | 未來用祭典地圖、優惠券、攤商點擊分析擴充。 |

主要痛點：

- 資訊分散：公告、官網、Facebook、紙本與現場人員說明不一致。
- 參與門檻：第一次到訪者不熟悉參拜流程與祭典文化。
- 行政負擔：活動報名、通知、客服與統計多依賴人工。
- 營運不可見：管理者難掌握熱門問題、活動轉換率與會員活躍度。

## 5. 目前資料來源與素材

萬春宮可用資料：

- 寺廟名稱：萬春宮
- 別稱：台中媽祖、藍興媽祖
- 主祀神祇：天上聖母
- 地址：臺中市中區成功路212號
- 電話：04-22245964
- 宗教：道教
- 登記狀態：正式登記
- 統一編號：02987849
- 座標：24.1420803070068, 120.681602478027

可優先使用的正式素材來源：

- 政府開放資料：全國宗教資訊系統資料、臺中市宗教名冊。
- 觀光多媒體開放資料：萬春宮景點資料與圖片。

需要保守處理的資料：

- 萬春宮官網、CRGIS、TRFC、臺中市政府文化局文章與圖片可以作為研究與人工摘要參考。
- 若要直接使用圖片或大段文字，應取得授權；正式 Demo 優先使用開放資料圖片或自行製作素材。

Demo sample data：

- 活動資料：關聖帝君聖誕佳辰、開基媽祖來台 305 週年宮慶、中元普度法會示範報名、第一次參拜導覽、媽祖文化小講堂、萬春盃書法體驗日。
- Dashboard 指標：LINE 好友數、7 日活躍人數、活動瀏覽、報名數、AI 問題數、知識缺口。
- LINE 文案：Rich Menu、Flex 活動卡、AI 回覆範例、推播範例。

重要聲明：

> 本作品以政府開放資料與觀光開放資料建立萬春宮示範場景，Demo 活動、報名與 Dashboard 統計為示範資料，非萬春宮官方營運資料。

## 6. 功能規劃

### 6.1 MVP 必做功能

| 功能 | 目的 | Demo 驗收 |
|---|---|---|
| LINE OA + Rich Menu | 建立正式服務入口。 | 六格選單可進入 AI 導覽、活動中心、宮廟資訊、報名紀錄、交通位置、客服協助。 |
| AI 文化助手 | 回答宮廟、主神、參拜流程、交通、活動等問題。 | 至少可回答 30 題測試問題；無資料時不硬答。 |
| 活動查詢 + Flex Message | 展示 AI 不只聊天，能讀資料並引導行動。 | 問近期活動後，回傳活動卡片，按鈕可開 LIFF。 |
| LIFF 活動中心 | 在 LINE 內完成活動瀏覽與報名。 | 使用者可看活動、填資料、送出報名、看到成功頁。 |
| LINE 報名通知 | 建立服務閉環。 | 報名成功後收到確認訊息或確認卡。 |
| 管理 Dashboard | 證明廟方可營運與看數據。 | 顯示活動、報名、AI 問題、知識缺口與 Demo 指標。 |

### 6.2 建議加分功能

| 功能 | 定位 |
|---|---|
| AI 文化抽籤 | 文化互動體驗，不做命運斷言。 |
| 擲筊動畫 | LIFF 前端互動效果，說明為數位文化體驗。 |
| QR / NFC 點位導覽 | 掃描或感應後開啟主殿、神明、文物、活動介紹頁。 |
| 會員中心 | 報名紀錄、收藏、提醒偏好。 |
| 客服工單 | AI 無法回答或涉及個資時轉人工。 |
| 宮廟故事 | 沿革、主神、重要事件、時間軸、照片與語音導覽。 |
| 交通停車 | 地址、導航、停車與活動交通提醒。 |
| 節慶專區 | 祭典流程、地圖、直播入口、活動照片。 |
| LINE 社群導流 | 社群公告、活動討論、規範與導回官方帳號。 |

### 6.3 不建議現在做成完整功能

| 功能 | 原因 | 競賽處理方式 |
|---|---|---|
| 完整 LINE Pay | 需要商業申請、金流、退款與法規處理。 | Demo 只做付款流程模擬。 |
| 完整 360 導覽 | 拍攝、圖像處理與前端開發成本高。 | 先做 QR / NFC 圖文點位，360 列未來擴充。 |
| 完整商城 | 商品、付款、庫存、出貨與退換貨規則複雜。 | 先做商品展示或未來商轉規劃。 |
| LINE Touch 正式導入 | 屬企業導入或申請型服務。 | MVP 用一般 QR / NFC 模擬現場入口。 |
| 社群 AI 自動客服 | LINE 社群不適合處理個資與正式客服。 | 社群做公告與討論，正式案件導回官方帳號。 |

### 6.4 14 項功能總整理

| 編號 | 功能 | 內容 | 技術 / 工具 | 競賽優先級 |
|---|---|---|---|---|
| 1 | 宮廟貼圖 / IP 圖 | 吉祥話、神明 Q 版、節慶圖、AI 回覆搭配圖。 | 圖片設計、Image Message、Flex Message、LINE Creators Market。 | P2 |
| 2 | AI 文化抽籤 | 籤詩、白話翻譯、歷史典故、文化解說、正向提醒。 | Database、RAG、Flex Message、LIFF 動畫。 | P1 |
| 3 | AI 聊天 | 宮廟、主神、拜拜流程、活動、交通、停車、歷史、文化、建築。 | OpenAI API、Embedding、RAG、PostgreSQL / SQLite、向量資料庫。 | P0 |
| 4 | NFC + QR Code | 主殿、神明、文物、故事、祭典、活動點位導覽。 | QR Code、NFC Tag、LIFF deep link、scan_records。 | P1 |
| 5 | 360 導覽 | 360 照片、熱點、AI 介紹、語音、字幕。 | Pannellum / Marzipano、360 Camera。 | P3 |
| 6 | 客服 | AI 客服、真人客服、留言、FAQ、工單、紀錄。 | LIFF 表單、support_tickets、後台。 | P1 |
| 7 | 活動推播 | 法會、節慶、生日、提醒、報名截止、雨天通知。 | Messaging API Push / Multicast、notification_jobs。 | P1 |
| 8 | Rich Menu | AI 助手、活動、文化抽籤、會員、商城、導航、客服。 | OA Manager、Messaging API Rich Menu、richmenuswitch。 | P0 |
| 9 | 商城 | 平安符、香、文創、供品、紀念品、付款。 | LIFF shop、products、orders、LINE Pay 未來擴充。 | P3 |
| 10 | 活動報名 | 活動、名額、報名、付款模擬、QR 報到。 | LIFF、LINE Login、Database、Flex Message。 | P0 |
| 11 | 擲筊 | 動畫、聖筊、笑筊、陰筊、文化說明。 | LIFF、CSS / Canvas / Lottie、後端紀錄。 | P1 |
| 12 | 宮廟故事 | 沿革、建廟、神明、重大事件、照片、影片、時間軸。 | LIFF stories、content_items、RAG。 | P1 |
| 13 | 信眾服務中心 | 活動、抽籤、客服、交通、停車、失物、廁所、附近美食、住宿。 | LIFF /home、member、support、traffic。 | P1 |
| 14 | 節慶活動 | 時間、地圖、流程、直播、報名、通知、照片、影片、歷史。 | festival_events、Flex、LIFF、推播。 | P1 |

## 7. 系統設計與製作方式

### 7.1 Demo 主流程

1. 使用者在宮廟入口掃 QR Code 或從簡報掃碼加入 LINE OA。
2. LINE 聊天室顯示 Rich Menu。
3. 使用者點「AI 導覽」，詢問第一次來萬春宮怎麼參拜。
4. 後端收到 Messaging API Webhook。
5. AI 透過 RAG 查詢萬春宮知識庫，回覆參拜流程與資料來源。
6. 使用者詢問近期活動。
7. 系統查詢活動資料庫，回傳 Flex Message 活動輪播卡。
8. 使用者點「示範報名」，開啟 LIFF 活動報名頁。
9. LIFF 透過 LINE Login / LIFF Profile 辨識使用者。
10. 使用者送出報名表。
11. 後端建立報名紀錄，回傳成功頁與 LINE 報名確認訊息。
12. Dashboard 即時顯示活動報名數、熱門問題與知識缺口。

### 7.2 系統架構

```text
使用者
  ↓
LINE Official Account / Rich Menu
  ↓
Messaging API Webhook
  ↓
FastAPI Backend
  ├─ 活動、會員、報名資料庫
  ├─ RAG 知識庫 / 向量資料庫
  ├─ OpenAI API
  ├─ Flex Message / Push Message
  └─ Dashboard API
  ↓
LIFF Frontend / 管理後台
```

### 7.3 AI 設計

AI 不直接自由回答，而是分成兩層：

- RAG 知識問答：回答宮廟基本資料、歷史文化、參拜流程、活動資訊。
- 任務型 Agent：查活動、建立報名、建立客服工單、摘要熱門問題。

AI 回覆規則：

- 只能根據提供的資料回答。
- 不確定時不得自行補充。
- 活動時間、名額、費用必須依資料庫結果。
- 不預測命運、健康、財運、感情或考試結果。
- 不自稱神明，不代表廟方作出指示。
- 真實資料要標示來源類型；Demo 資料要明確說明是示範資料。
- 涉及付款、個資、宗教爭議、失物與廟方決策時轉人工客服。

### 7.4 資料庫設計

MVP 核心資料表：

| 資料表 | 用途 |
|---|---|
| temples | 宮廟基本資料。 |
| users | LINE 使用者與會員資料。 |
| messages | 使用者與 AI 對話紀錄、意圖分析。 |
| events | 祭典、導覽、講座、活動資料。 |
| event_registrations | 活動報名與 QR 報到資料。 |
| notification_jobs | 報名成功與活動提醒推播排程。 |
| knowledge_documents | RAG 知識文件來源與審核狀態。 |
| knowledge_chunks | 向量檢索片段。 |
| support_tickets | 客服工單。 |
| tour_spots | QR / NFC 導覽點位。 |
| fortune_slips | 籤詩與文化解說資料。 |
| dashboard_snapshots | Demo 指標與報表快照。 |

資料一致性原則：

- 管理者新增活動後，AI 活動查詢、LIFF 活動頁、Flex Message、報名頁與 Dashboard 都應讀同一份資料。
- 報名名額不可只由前端判斷，正式版應由資料庫交易或鎖定避免超額報名。
- QR 報到 Token 不應包含姓名、電話或敏感個資。

### 7.5 UI / UX 設計

LINE Rich Menu：

- 主選單建議六格：AI 文化助手、活動中心、文化抽籤、宮廟導覽、會員中心、客服中心。
- 入口不要太多，商城、交通、故事、節慶可放 LIFF 第二層。

Flex Message：

- 用於活動卡、抽籤卡、導覽卡、客服分流卡、商品展示卡。
- 每張卡要有下一步按鈕，例如查看詳情、立即報名、詢問 AI、開啟地圖。

LIFF：

- 手機優先，像 LINE 內服務，不像一般桌面網站。
- 表單要短，報名只收必要欄位。
- 頁面建議包含 /home、/events、/events/:id、/registration/:eventId、/fortune、/tour、/spot/:code、/member、/support、/stories、/traffic。

Dashboard：

- 給管理者快速掃描，不要堆滿圖表。
- 首頁應顯示活動報名、AI 熱門問題、知識缺口、客服待處理、推播入口。

## 8. 會使用到的軟體、平台與程式

LINE 平台：

- LINE Developers Console：建立 Provider、Messaging API、LINE Login、LIFF。
- LINE Official Account Manager：建立官方帳號、Rich Menu、Webhook 設定、回應設定。
- Messaging API：接收 Webhook、回覆訊息、推播、Flex Message。
- LIFF SDK：在 LINE 內開啟活動、會員、報名、客服與導覽頁。
- LINE Login：會員識別與個人化服務。
- Flex Message Simulator：設計活動卡、抽籤卡、導覽卡。
- LINE MINI App：正式商轉或後續擴充可轉入；競賽初期建議先用 LIFF。

AI 與資料：

- OpenAI API：生成繁體中文回答、摘要、意圖判斷、Embedding。
- RAG：讓 AI 根據已審核資料回答，降低幻覺。
- Vector Database：Chroma、pgvector 或 Qdrant。
- PostgreSQL：正式資料庫；MVP 可先用 SQLite。
- JSON seed data：目前已存在 Demo 活動、使用者、報名與 Dashboard 資料。

後端：

- Python FastAPI：Webhook、API、AI 流程、資料庫操作。
- LINE Bot SDK：處理 LINE Webhook、Reply、Push、Flex Message。
- Redis：可選，用於快取、排程或暫存狀態。
- Cloud Storage：可選，用於圖片、語音、360 素材。

前端：

- Next.js 或 Vite + React：LIFF 頁面與 Dashboard。
- LIFF SDK：取得 LINE 環境、登入狀態、Profile。
- 圖表套件：Dashboard 指標可用 Recharts 或 Chart.js。
- QR Code 工具：產生活動報到碼與導覽點位碼。

部署與測試：

- Vercel：前端與 LIFF 頁部署。
- Render / Railway / Cloud Run：FastAPI 後端與 Webhook HTTPS。
- Git / GitHub：版本管理、Issue、交付紀錄。
- Postman / Insomnia：API 測試。
- 手機 LINE App：最終體驗測試必須用實機確認。

設計與簡報：

- Figma 或 Canva：Rich Menu、LIFF 畫面、簡報視覺。
- PowerPoint / Google Slides：10 頁投稿簡報。
- CapCut / DaVinci Resolve / 剪映：3 分鐘 Demo 影片剪輯。
- OBS 或手機錄影：錄製 LINE 操作與 Dashboard Demo。

## 9. 10 天開發項目與過程

### Day 1：範圍定案與 Demo 劇本

目標：

- 把題目、評分對應、MVP 範圍與 Demo 劇本定案。

工作：

- 確認主題名稱：Temple AI OS。
- 確認 3 分鐘影片流程：痛點、LINE 入口、AI 問答、活動報名、Dashboard、商業模式。
- 決定 MVP：Rich Menu、AI 文化助手、活動查詢、LIFF 報名、通知、Dashboard。
- 標示真實資料與 Demo sample data 邊界。
- 整理 10 頁簡報大綱。

產出：

- Demo 使用者旅程。
- MVP 功能清單。
- 3 分鐘影片腳本初版。
- 10 頁簡報架構。

驗收：

- 任何人看完流程都能理解作品不是單純 Bot，而是 LINE + AI + LIFF + Dashboard 的服務閉環。

### Day 2：LINE 入口與 Rich Menu 原型

目標：

- 建立使用者從 LINE 進入服務的第一層體驗。

工作：

- 建立或確認 LINE Official Account。
- 建立 Provider 與 Messaging API Channel。
- 設定 Webhook URL 規格。
- 設計 Rich Menu 六格：AI 文化助手、活動中心、文化抽籤、宮廟導覽、會員中心、客服中心。
- 準備 Flex Message 活動卡 JSON 模板。
- 關閉 OA 原本自動回覆，避免與 Bot 衝突。

產出：

- Rich Menu 圖稿。
- Rich Menu action 對照表。
- Flex 活動卡模板。
- LINE 設定紀錄。

驗收：

- 使用者可從 LINE 選單進入主要服務或送出指定文字。

### Day 3：後端 API 與資料庫雛形

目標：

- 讓 Demo 資料可以被 API 讀取，支撐 AI、LIFF 與 Dashboard。

工作：

- 建立 FastAPI 專案。
- 建立資料模型：temples、users、events、event_registrations、messages、knowledge_documents。
- 匯入現有 JSON Demo 資料。
- 建立 API：
  - POST /webhook
  - POST /chat
  - GET /events
  - GET /events/{id}
  - POST /registrations
  - GET /analytics/summary
- 建立基本錯誤處理與 demo data notice。

產出：

- 可啟動的後端。
- 活動列表 API。
- 報名 API。
- Dashboard summary API。

驗收：

- API 可讀到既有 Demo 活動資料。
- 建立報名後，Dashboard 報名數可更新或至少可顯示示範資料。

### Day 4：RAG 知識庫與 AI 回覆規則

目標：

- 完成 AI 文化助手的可信回答能力。

工作：

- 將萬春宮知識庫切 chunk。
- 建立 Embedding 與向量索引。
- 建立意圖分類：地址交通、參拜流程、活動查詢、歷史文化、報名協助、客服、未知。
- 建立 System Prompt 與安全規則。
- 實作無資料 fallback。
- 準備至少 30 題測試問題。

產出：

- RAG 查詢流程。
- AI 回覆 API。
- 測試題集。
- 安全回覆規則。

驗收：

- AI 可回答萬春宮在哪裡、主神是誰、第一次怎麼拜、近期有什麼活動。
- 問命運、醫療、投資、付款細節時不硬答。
- Demo 活動與真實公開資料能清楚區分。

### Day 5：LIFF 活動中心與會員流程

目標：

- 讓使用者在 LINE 內完成活動瀏覽與報名。

工作：

- 建立 LIFF App 前端。
- 實作 /home 服務首頁。
- 實作 /events 活動列表。
- 實作 /events/:id 活動詳情。
- 實作 /registration/:eventId 報名表。
- 實作 /member 報名紀錄。
- 串接 LIFF Login / Profile。

產出：

- LIFF 活動中心。
- 報名表。
- 報名成功頁。
- 會員報名紀錄頁。

驗收：

- 手機 LINE 內可完成「看活動 -> 報名 -> 成功」。
- 報名欄位只收必要資訊。

### Day 6：LINE Webhook、Flex Message 與通知整合

目標：

- 串起聊天室、AI、活動卡、LIFF 與通知。

工作：

- 實作 LINE Webhook signature 驗證。
- 處理文字訊息事件。
- 使用者問活動時，回覆 Flex Message carousel。
- 使用者問參拜流程時，回覆 AI RAG 結果。
- 報名成功後，回傳確認訊息或 Flex 確認卡。
- 加入 loading 或延遲策略，避免 AI 回覆慢時像當機。

產出：

- 可互動的 LINE Bot Demo。
- 活動卡片。
- 報名成功通知。

驗收：

- 從 LINE 聊天室可以完成「問 AI -> 看活動卡 -> 點入 LIFF -> 報名 -> 收到確認」。

### Day 7：Dashboard 與管理後台

目標：

- 呈現管理者價值，對應營運模式與商業模式評分。

工作：

- 實作 Dashboard 首頁。
- 顯示 headline metrics：好友數、活躍人數、活動瀏覽、報名數、AI 問題數、知識缺口。
- 顯示活動成效：瀏覽、報名、提醒同意、轉換率。
- 顯示 AI 熱門意圖。
- 顯示知識缺口與客服待處理。
- 建立簡易活動管理頁或讀取活動列表。

產出：

- 管理 Dashboard。
- 活動報名列表。
- 熱門問題與知識缺口區塊。

驗收：

- 評審可以在 30 秒內看懂廟方為什麼需要這個系統。

### Day 8：加分互動功能收斂

目標：

- 補足 Demo 質感，但不讓範圍失控。

工作：

- 實作 AI 文化抽籤頁：固定籤詩資料、白話解說、正向提醒。
- 實作簡單擲筊動畫或抽籤動畫。
- 實作 QR / NFC 點位頁 /spot/:code，展示主殿或文物介紹。
- 實作客服分流表單。
- 實作宮廟故事或交通停車頁的展示版。

產出：

- 文化抽籤 Demo。
- QR 點位導覽 Demo。
- 客服中心 Demo。
- 故事 / 交通展示頁。

驗收：

- 加分功能能支援主線 Demo，不會搶走核心流程時間。

### Day 9：整合測試、手機測試與影片錄製

目標：

- 把功能收斂成可穩定展示的競賽作品。

工作：

- 測試完整流程：
  - 加入 LINE OA
  - Rich Menu 點選
  - AI 問答
  - 活動查詢
  - Flex Message
  - LIFF 報名
  - LINE 確認訊息
  - Dashboard 更新
- 跑 30 題 AI 測試集。
- 手機實機測試 LIFF 排版。
- 修正錯字、按鈕失效、資料來源標示、Demo notice。
- 錄製 3 分鐘影片素材。

產出：

- 測試紀錄。
- Demo 影片素材。
- 影片旁白稿。
- 已修正的 Demo 流程。

驗收：

- 3 分鐘內可展示完整流程。
- 沒有把 Demo 資料誤稱為官方資料。
- AI 不出現命運斷言或無來源硬答。

### Day 10：投稿交付與簡報收斂

目標：

- 完成可投稿版本。

工作：

- 完成 10 頁簡報 PDF：
  1. 題目與一句話提案
  2. 痛點與使用者
  3. 解決方案
  4. Demo 使用者旅程
  5. LINE 生態整合
  6. AI 技術與安全邊界
  7. 市場與競品差異
  8. 商業模式
  9. 開發時程與測試
  10. 結語與未來擴充
- 剪輯 3 分鐘 Demo 影片並上傳 YouTube。
- 補資料來源頁與授權聲明。
- 檢查簽署文件。
- 準備 5 分鐘決選口頭稿。

產出：

- 投稿 PDF。
- Demo 影片 YouTube 連結。
- 文件簽署包。
- Demo 操作手冊。
- 決選 5 分鐘簡報稿。

驗收：

- 符合投稿格式。
- 影片 3 分鐘內。
- 作品能清楚對應五項評分。
- Demo 可在現場穩定重跑。

## 10. 最終建議

接下來不要平均開發 14 項功能。競賽勝負關鍵是「3 分鐘內讓評審看到完整且可信的服務閉環」。

推薦開發優先序：

1. LINE OA + Rich Menu
2. AI RAG 文化助手
3. 活動查詢 + Flex Message
4. LIFF 活動報名
5. 報名成功通知
6. Dashboard
7. 文化抽籤、QR 導覽、客服工單作加分

目前最重要的判斷：

- Temple AI OS 應定位為宮廟數位營運平台，不是 AI 算命工具。
- AI 必須有資料來源與安全邊界。
- LIFF 活動報名是最值得完整做的流程，因為它能證明 AI 可以協助完成任務。
- Dashboard 是商業模式說服力的核心，能讓廟方看見導入價值。
- LINE Pay、360 導覽、完整商城、LINE Touch 不應作為 10 天 MVP 主線。
