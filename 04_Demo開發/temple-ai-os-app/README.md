# Temple AI OS 萬春宮示範系統

Temple AI OS 是以萬春宮公開資料為示範場景的 LINE + AI 宮廟服務入口。此版本提供可本機執行的 Demo fallback，也保留 Supabase、LINE Messaging API、LIFF、OpenAI、Vercel、Render 的正式接線位置。

> 本作品使用政府開放資料與觀光開放資料建立示範場景。Demo 活動、報名、Dashboard 指標不是萬春宮官方營運資料。

## 系統組成

- `backend/`：FastAPI API、LINE Webhook、LIFF token verify、RAG、Flex Message、管理後台 API。後端執行所需 demo data、temple profile、knowledge-base 已收在 `backend/app/data/`。
- `frontend/`：React + Vite，包含 LIFF 使用者端與 Admin 管理後台。Admin 頁需要輸入部署環境的管理 Token。
- `database/`：Supabase PostgreSQL / pgvector migration、atomic registration RPC 與 demo seed。
- `assets/`：Rich Menu、LIFF banner、Flex 圖像與可選字型資料夾。
- `frontend/public/assets/`：Flex Message hero image 與前端可公開存取素材。
- `scripts/`：資料匯入、Rich Menu 建立、Flex JSON 驗證、圖片產生。

## 快速啟動

後端：

```powershell
cd 04_Demo開發\temple-ai-os-app\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

前端：

```powershell
cd 04_Demo開發\temple-ai-os-app\frontend
npm install
npm run dev
```

預設 API URL：

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- API docs: `http://localhost:8000/docs`

## 必填環境變數

先複製 `.env.example` 到部署平台或本機 `.env`。沒有 LINE/OpenAI/Supabase key 時，系統會用本機 Demo 資料跑核心流程。正式 Supabase 模式會透過 OpenAI embedding + pgvector RPC 做知識檢索；Demo 模式使用本機詞組檢索 fallback。

```text
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_LOGIN_CHANNEL_ID=
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
ADMIN_DEMO_TOKEN=
ADMIN_TOKENS=temple-staff:<token>,reviewer:<token>
VITE_API_BASE_URL=
VITE_LIFF_ID=
```

正式環境建議使用 `ADMIN_TOKENS` 的 `管理者:token` 格式；成功的後台新增、修改、刪除會寫入 `audit_logs`，並以後端驗證出的管理者名稱作為操作人。

## LINE Console 設定摘要

完整欄位檢查請看 `docs/LINE_SETUP_CHECKLIST.md`。

1. 在 LINE Official Account Manager 啟用 Messaging API。
2. Provider 使用 `Temple AI OS`。
3. Webhook URL 設為 `https://<render-api>.onrender.com/api/line/webhook`。
4. 啟用 `Use webhook` 與 Webhook redelivery。
5. 關閉會干擾 Bot 的自動回覆/關鍵字回覆。
6. 建立 LINE Login Channel，再新增 LIFF App。
7. LIFF Endpoint 設為 `https://<vercel-app>.vercel.app`，Scopes 使用 `openid`、`profile`。
8. 使用 `scripts/create_rich_menu.py` 建立 Rich Menu。

## Supabase 正式模式

切到 `DEMO_MODE=false` 前，先依序套用：

```text
database/migrations/001_init.sql
database/migrations/002_rls_policies.sql
database/migrations/003_line_webhook_events.sql
database/migrations/004_search_and_atomic_registration.sql
```

再執行：

```powershell
python scripts/seed_demo_data.py
python scripts/import_knowledge.py
```

`import_knowledge.py` 需要 `OPENAI_API_KEY` 才會寫入 pgvector embedding。

## 驗收主流程

1. LINE Rich Menu 點「AI 助手」。
2. Webhook 收到文字訊息並通過 signature 驗證。
3. RAG 依萬春宮知識庫回答，不確定時 fallback。
4. 問近期活動時回傳 Flex Message。
5. 點 Flex button 開 LIFF 活動頁。
6. LIFF 報名成功後建立紀錄。
7. Dashboard 顯示活動、報名、AI 問題與知識缺口。
