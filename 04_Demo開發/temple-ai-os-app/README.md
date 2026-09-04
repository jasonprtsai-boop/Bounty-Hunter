# 萬春宮線上服務系統

萬春宮線上服務是以萬春宮公開資料整理的 LINE 宮廟服務入口。此版本提供可本機執行的 fallback，也保留 Supabase、LINE Messaging API、LIFF、問答模型、Sites、Render 的正式接線位置。

> 本作品使用政府開放資料與觀光開放資料整理服務資訊。正式活動、報名、Dashboard 指標與營運資料仍以廟方公告與正式窗口為準。

## 系統組成

- `backend/`：FastAPI API、LINE Webhook、LIFF token verify、關鍵詞 FAQ 固定回覆、Flex Message、管理後台 API。後端執行所需測試資料、temple profile、knowledge-base 已收在 `backend/app/data/`。
- `frontend/`：React + Vite，包含 LIFF 使用者端與 Admin 管理後台。Admin 頁使用後端驗證的帳號或 Email + 密碼登入，最高權限者可在後台建立、停用與重設管理員帳號。
- `database/`：Supabase PostgreSQL migration、FAQ 規則表、atomic registration RPC、可選 pgvector 知識匯入與 seed。
- `assets/`：Rich Menu、LIFF banner、Flex 圖像與可選字型資料夾。
- `assets/stickers/`：可送 LINE Creators Market 的貼圖素材與送審 metadata。
- `frontend/public/assets/`：Flex Message hero image、貼圖預覽與前端可公開存取素材。
- `scripts/`：資料匯入、Rich Menu 建立、Flex JSON 驗證、圖片產生。

## 快速啟動

後端：

```powershell
cd <專案資料夾>\temple-ai-os-app\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

前端：

```powershell
cd <專案資料夾>\temple-ai-os-app\frontend
npm install
npm run dev:public
```

後台前端請使用獨立模式：

```powershell
npm run dev:admin
```

預設 API URL：

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- API docs: `http://localhost:8000/docs`

## 必填環境變數

先複製 `.env.example` 到部署平台或本機 `.env`。沒有 LINE/Supabase key 時，系統會用本機資料跑核心流程。正式主聊天路徑採用「知識庫關鍵詞比對 + 固定安全回覆」；問答模型與 pgvector 只保留作未來擴充或離線知識匯入，不是目前上線必填。

```text
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_LOGIN_CHANNEL_ID=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
ADMIN_BOOTSTRAP_TOKEN=
ADMIN_TOKENS=temple-staff:<password>,staff@example.com:<password>
ADMIN_ACCOUNTS=
ADMIN_SESSION_SECRET=
VITE_API_BASE_URL=
VITE_LIFF_ID=
VITE_PUBLIC_SITE_BASE_URL=
VITE_ADMIN_SITE_BASE_URL=
```

正式環境第一次登入可使用 `ADMIN_TOKENS` 的 `帳號或 Email:密碼` 格式，或改用 `ADMIN_ACCOUNTS` / `ADMIN_USERNAME` / `ADMIN_PASSWORD`。例如 Render 設為 `ADMIN_TOKENS=temple-staff:xxxx` 時，後台帳號填 `temple-staff`，密碼填 `xxxx`；若設為 `ADMIN_USERNAME=staff@example.com`，登入欄位可直接填 Email。登入後可到 `/admin/accounts` 建立正式管理員帳號；資料庫模式會將密碼雜湊後存入 `admin_accounts`，不保存明文密碼。成功的後台新增、修改、刪除會寫入 `audit_logs`，並以後端驗證出的管理者名稱作為操作人。

## LINE Console 設定摘要

完整欄位檢查請看 `docs/LINE_SETUP_CHECKLIST.md`。

1. 在 LINE Official Account Manager 啟用 Messaging API。
2. Provider 使用 `萬春宮線上服務`。
3. Webhook URL 設為 `https://<render-api>.onrender.com/api/line/webhook`。
4. 啟用 `Use webhook` 與 Webhook redelivery。
5. 關閉會干擾服務回覆的自動回覆/關鍵字回覆。
6. 建立 LINE Login Channel，再新增 LIFF App。
7. LIFF Endpoint 設為 `https://<vercel-app>.vercel.app`，Scopes 使用 `openid`、`profile`。
8. 使用 `scripts/create_rich_menu.py` 建立 Rich Menu。

## Supabase 正式模式

切到正式資料庫模式前，先依序套用：

```text
database/migrations/001_init.sql
database/migrations/002_rls_policies.sql
database/migrations/003_line_webhook_events.sql
database/migrations/004_search_and_atomic_registration.sql
database/migrations/005_faq_rules.sql
database/migrations/006_operational_hardening.sql
database/migrations/007_data_integrity_and_service_ops.sql
database/migrations/008_admin_accounts.sql
database/migrations/009_admin_account_email_login.sql
database/migrations/010_event_controls_and_deities.sql
```

Fresh Supabase project can run this generated bundle instead:

```text
database/supabase_full_setup.sql
```

Validate database reads and writes after applying SQL:

```powershell
python scripts/verify_database.py
```

再執行：

```powershell
python scripts/seed_service_data.py
```

`scripts/import_knowledge.py` 是未來向量檢索擴充工具；目前固定回覆流程不需要執行它。

前台與後台分開建置時，請設定 `VITE_PUBLIC_SITE_BASE_URL` 與 `VITE_ADMIN_SITE_BASE_URL`，讓兩側入口互相連結。

## 功能入口與管理範圍

公開服務頁面：

- `/`：萬春宮線上服務入口、參拜問答與常用服務。
- `/site`：萬春宮公開資訊首頁。
- `/events`：活動中心、報名名額、開放／截止狀態與報名進度查詢。
- `/deities`：主配祀神、副配祀神、客座神明與護法神明資料。
- `/tour/main-hall`：主殿與參拜動線導覽。
- `/fortune`：文化籤詩與平安提醒。
- `/support`：客服問題登記。
- `/privacy`、`/terms`：隱私權政策與服務條款。

管理後台頁面：

- `/admin`：營運總覽與快速入口。
- `/admin/events`：活動新增、編輯、發布狀態、報名開放／截止時間、活動倒數、名額、每筆最多參加人數、額滿候補、報名者資料、狀態管理、日期篩選與 Excel 名冊匯出。
- `/admin/deities`：神佛資料分類、供奉位置、介紹、聖誕資訊、服務說明、來源與發布狀態管理。
- `/admin/knowledge`：參拜與服務知識內容維護。
- `/admin/support`：客服案件狀態與處理。
- `/admin/notifications`：提醒任務與發送狀態。
- `/admin/accounts`：管理員帳號、角色與停用管理。
- `/admin/release`：LINE 帳號、公開頁面與發布檢查清單。

活動報名資料由後端統一檢查活動狀態、開放／截止時間、名額、重複報名與候補規則；正式活動時間、名額與參拜安排仍以廟方公告為準。

## 驗收主流程

1. LINE Rich Menu 點「參拜問答」。
2. Webhook 收到文字訊息並通過 signature 驗證。
3. 關鍵詞 FAQ 規則依萬春宮知識庫與安全規則回覆，不確定時使用固定安全 fallback。
4. 問近期活動時回傳 Flex Message。
5. 點 Flex button 開 LIFF 活動頁。
6. LIFF 報名成功後建立紀錄。
7. `/stickers` 顯示春福小使貼圖包；LINE 審核通過後以 `VITE_LINE_STICKER_STORE_URL` 開啟購買。
8. Dashboard 顯示活動、報名、問答次數與知識缺口。

## 貼圖與大頭貼發布

第一套貼圖素材在 `assets/stickers/spring-fortune-messenger/`，LINE OA 大頭貼在 `assets/brand/line-oa-profile-v2.png`，背景圖在 `assets/brand/line-oa-profile-background-v1.png`。正式送審與上架步驟請看 `docs/STICKER_RELEASE_CHECKLIST.md`。
