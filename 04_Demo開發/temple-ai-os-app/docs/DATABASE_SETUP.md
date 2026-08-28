# Temple AI OS 資料庫完成與驗收

本專案正式資料庫使用 Supabase PostgreSQL。後端正式模式會透過 `SUPABASE_SERVICE_ROLE_KEY` 讀寫資料；前端不直接寫 Supabase。

## 一次安裝

在 Supabase SQL Editor 執行：

```text
database/supabase_full_setup.sql
```

這份檔案由 `database/migrations/*.sql` 與 `database/seeds/demo_seed.sql` 合併產生，內容包含：

- 基本資料表：宮廟、LINE 使用者、會員、活動、報名、客服、通知、Dashboard、稽核紀錄。
- FAQ 固定回覆表：支援目前「知識庫關鍵詞比對 + 固定安全回覆」策略。
- 原子報名 RPC：`register_for_event` 會鎖定活動列，避免容量超賣。
- 報名一致性：同一使用者同一活動只能保留一筆有效報名，並自動同步活動報名人數。
- LINE webhook 去重表：避免同一 webhook event 重複處理。
- 後台帳號表：`admin_accounts` 保存帳號、身分、狀態與雜湊後的密碼，支援後台權限管理頁。
- 營運補強：常用索引、資料狀態限制、後台狀態值對齊、`updated_at` 自動更新。
- Demo seed：萬春宮示範資料、活動、FAQ、Dashboard 樣本資料。

## 後端環境變數

Render 後端正式模式需要：

```text
DEMO_MODE=false
SUPABASE_URL=<你的 Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<你的 service role key>
SUPABASE_ANON_KEY=<你的 anon key>
ADMIN_SESSION_SECRET=<隨機長字串>
ADMIN_TOKENS=<初始 owner 帳號:密碼>
```

`SUPABASE_SERVICE_ROLE_KEY` 只能放在後端或部署平台 Secret，不能放前端，也不能提交到 Git。

第一次登入後，請到 `/admin/accounts` 建立正式後台帳號。正式資料庫只保存密碼雜湊；忘記密碼時需由最高權限帳號重設。

## 驗收

設定本機或部署環境變數後執行：

```text
python scripts/verify_database.py
```

驗收腳本會檢查必要資料表，並做一次可清理的測試寫入：

- 建立測試 LINE 使用者。
- 建立測試活動。
- 呼叫 `register_for_event` 寫入報名。
- 寫入一筆 `messages` 問答紀錄。
- 刪除測試活動與測試使用者。

看到 `Database verification OK.` 才代表資料庫讀寫路徑完成。

## 可選：向量知識庫

目前正式策略是固定 FAQ，不需要 OpenAI embedding。若未來要改回向量檢索，再設定 `OPENAI_API_KEY` 後執行：

```text
python scripts/import_knowledge.py
```

現在比賽展示不需要這一步。
