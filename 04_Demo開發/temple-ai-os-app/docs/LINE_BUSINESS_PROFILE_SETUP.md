# LINE 商業簡介設定稿

Last updated: 2026-08-23

## 定位

此 LINE 官方帳號名稱為 `Temple AI OS示範`，目前用途是競賽 Demo 與系統測試。商業簡介文字必須清楚標示「不代表萬春宮官方正式營運」，避免使用者誤以為可透過此帳號辦理正式廟務、活動、捐款或客服。

## 建議填寫內容

| 欄位 | 建議內容 |
| --- | --- |
| 商業簡介短標 | Temple AI OS示範｜LINE × AI 智慧宮廟服務入口 |
| 商業簡介 | Temple AI OS 是智慧宮廟服務 Demo，示範如何把 LINE 官方帳號、AI 問答、活動報名、會員服務與管理後台整合為一個入口。本帳號以萬春宮公開資料建立展示場景，用於競賽與系統測試，不代表萬春宮官方正式營運。正式活動、開放時間與服務內容請以廟方公告為準。 |
| 網站 | https://temple-ai-os-demo.jasonprtsai.chatgpt.site |
| 隱私權政策 | https://temple-ai-os-demo.jasonprtsai.chatgpt.site/privacy |
| 服務條款 | https://temple-ai-os-demo.jasonprtsai.chatgpt.site/terms |
| 示範場景地址 | 臺中市中區成功路212號 |
| 公開資料電話 | 04-22245964 |
| 營業時間說明 | 此帳號為競賽 Demo，不提供正式營業時間；參拜與活動資訊請以廟方公告為準。 |

## 後台操作順序

1. 進入 LINE Official Account Manager。
2. 選擇 `Temple AI OS示範`。
3. 進入 `Profile / 商業簡介`。
4. 上傳大頭貼 `assets/brand/line-oa-profile-v2.png`。
5. 上傳背景圖 `assets/brand/line-oa-profile-background-v1.png`。
6. 編輯商業簡介與網站連結。
7. 檢查預覽畫面沒有把帳號呈現為「萬春宮官方」。
8. 按下 `Publish changes / 發布變更`。

## 發布清單

這些項目也已放在 `/admin/release`，可直接在後台頁面勾選追蹤。

- LINE 商業簡介已貼上 Demo 聲明與公開網址。
- 帳號名稱、狀態訊息、歡迎訊息與 LINE VOOM 互動設定已確認。
- LINE 大頭貼已換成 `line-oa-profile-v2.png`。
- LINE 背景圖已換成 `line-oa-profile-background-v1.png`。
- Messaging API Webhook 驗證成功。
- Rich Menu 已發布且貼圖小舖入口可開啟。
- 至少一篇 LINE VOOM Demo 貼文已建立草稿或排程。
- 手機 LINE 實測可開 LIFF 與活動頁。
- 貼圖素材已確認，等待 LINE Creators Market 送審或審核。
- Demo 現場前已暖機 Render 後端。

## 帳號設定與貼文範例

完整帳號設定稿、LINE VOOM 貼文範例、廣播訊息範例與官方限制紀錄已整理在：

```text
docs/LINE_CONTENT_PLAYBOOK.md
```

同一份內容也已放在 `/admin/release`，可從後台直接複製。

## 風險提醒

- 若未取得廟方正式授權，不要把帳號名稱改成「萬春宮官方」。
- 真實電話與地址屬於公開資料，但放在 LINE 商業簡介上容易被理解成正式客服入口；若要降低誤會，可只保留網站與 Demo 說明，不顯示電話。
- 正式上架貼圖後，才把 LINE STORE 貼圖購買網址加進 `/stickers` 的環境變數。
- LINE VOOM 貼文與廣播訊息都不能暗示這是廟方正式公告；Demo 聲明要保留在貼文本文或圖片說明中。
