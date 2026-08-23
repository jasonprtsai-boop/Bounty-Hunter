# LINE content playbook

Last updated: 2026-08-23

## Purpose

This guide prepares the LINE Official Account content needed for the Temple AI OS demo. Keep every public-facing message clearly marked as a competition demo unless written authorization exists to operate as Wan Chun Gong's official service.

## Official constraints checked

- LINE Official Account profiles can be edited from the account settings page in LINE Official Account Manager or LINE VOOM Studio.
- LINE VOOM posts can include text, photos/videos, stickers, coupons, URLs, surveys, location information, and text cards.
- LINE VOOM post text supports up to 10,000 characters, up to 20 combined images/videos, and up to 20 hashtags.
- Deleted LINE VOOM posts cannot be restored.
- Rich menus require an image, tappable areas, and publishing as the default rich menu before users see them.
- Do not use LIFF URLs or LINE Platform APIs for load testing.

Sources:

- LINE Official Account Help Center: `https://help.line.me/official_account/web/pc`
- LINE VOOM Create posts Help Center: `https://help.line.me/official_account/web/categoryId/20009231/3/pc?lang=en`
- LINE Developers Rich Menu docs: `https://developers.line.biz/en/docs/messaging-api/using-rich-menus/`
- LINE LIFF development guidelines: `https://developers.line.biz/en/docs/liff/development-guidelines/`

## Account settings

| Field | Value |
| --- | --- |
| Account name | Temple AI OS示範 |
| Status message | 競賽 Demo｜LINE × AI 智慧宮廟服務入口 |
| Greeting message | 歡迎加入 Temple AI OS 示範帳號。本帳號用於競賽 Demo 與系統測試，不代表萬春宮官方正式營運。你可以點選下方選單體驗 AI 問答、活動報名、文化抽籤、導覽與客服流程。 |
| Chat response mode | Webhook 啟用；自動回應保持關閉或只保留 Demo 聲明，避免和 AI webhook 重複回覆。 |
| LINE VOOM interaction | Demo 期間可開放按讚；留言建議先關閉或每日人工檢查，避免未授權服務詢問被誤認為正式客服。 |
| Prohibited content | 不要放正式捐款帳號、LINE Pay、官方客服承諾、未授權廟方公告或任何私人憑證。 |

## Business profile copy

Use `docs/LINE_BUSINESS_PROFILE_SETUP.md` or `/admin/release` for copy-ready profile fields, public URLs, avatar, and background image assets.

## LINE VOOM post examples

### Demo launch

Suggested asset: `assets/banners/home.png`

```text
Temple AI OS 示範帳號上線。

這是一個以 LINE 為入口的智慧宮廟服務 Demo，示範 AI 問答、活動報名、會員紀錄、文化抽籤與後台管理如何整合在同一個流程。

本帳號以公開資料建立展示場景，用於競賽與系統測試，不代表萬春宮官方正式營運。正式活動、開放時間與服務內容請以廟方公告為準。

體驗入口：https://temple-ai-os-demo.jasonprtsai.chatgpt.site/site

#TempleAIOS #LINE智慧服務 #宮廟數位轉型 #競賽Demo
```

### Event registration demo

Suggested asset: `assets/banners/events.png`

```text
活動報名也可以從 LINE 開始。

Temple AI OS Demo 示範使用者在 LINE 收到活動卡片後，直接開啟 LIFF 表單完成報名，後台同步看到報名狀態與提醒任務。

提醒：這是示範流程，不代表萬春宮正式活動報名。正式名額、時間與參加規則仍以廟方公告為準。

活動入口：https://temple-ai-os-demo.jasonprtsai.chatgpt.site/events

#活動報名 #LIFF #LINE官方帳號 #TempleAIOS
```

### Sticker preview

Suggested asset: `assets/flex/fortune-card.png`

```text
春福小使貼圖準備中。

Temple AI OS Demo 的第一套靜態貼圖以「日常祝福、收到、感謝、平安、已報名」為核心語境，讓宮廟服務不只提供資訊，也能保留一點溫度。

貼圖展示：https://temple-ai-os-demo.jasonprtsai.chatgpt.site/stickers

貼圖正式上架需等待 LINE Creators Market 審核，頁面目前為展示用途。

#LINE貼圖 #春福小使 #TempleAIOS #文化服務
```

### Cultural tour demo

Suggested asset: `assets/banners/tour.png`

```text
從 LINE 開始的文化導覽。

Temple AI OS Demo 示範使用者掃描 QR 或點選 Rich Menu 後，可開啟導覽頁，閱讀宮廟歷史、參拜提醒與文化脈絡。未來可延伸到現場 QR/NFC 點位。

導覽入口：https://temple-ai-os-demo.jasonprtsai.chatgpt.site/tour/main-hall

本內容為 Demo 展示，正式導覽文字仍需廟方審稿。

#文化導覽 #QR導覽 #宮廟文化 #TempleAIOS
```

## Broadcast examples

Use these only for small demo tests or explicitly opted-in users. For production, review audience consent, monthly message quota, and content approval before sending.

### Event day-before reminder

```text
【Temple AI OS Demo 活動提醒】
你報名的示範活動將於明天開始。

地點：萬春宮示範場景
請以活動頁與廟方公告為準。

查看報名紀錄：
https://liff.line.me/2010938588-VJXpaoyH/member

此訊息為競賽 Demo 測試，不代表萬春宮官方正式通知。
```

### Support follow-up

```text
【Temple AI OS Demo 客服回覆】
你先前留下的問題已有示範回覆。

請開啟客服頁查看：
https://liff.line.me/2010938588-VJXpaoyH/support

正式廟務、活動與捐款問題仍請以廟方公告或正式窗口為準。
```

### Demo rehearsal broadcast

```text
Temple AI OS Demo 今日展示重點：
1. LINE Rich Menu 服務入口
2. AI 安全問答與活動卡片
3. LIFF 活動報名
4. 後台管理與通知任務

公開展示頁：
https://temple-ai-os-demo.jasonprtsai.chatgpt.site/site
```

## Pre-demo content checklist

- Business profile, account name, avatar, and background image match the demo positioning.
- Greeting message includes the demo disclaimer.
- Webhook is enabled, and duplicate automatic replies are disabled.
- Rich Menu is published and opens the deployed URLs.
- At least one LINE VOOM post is drafted or scheduled.
- No post claims official temple operation, donation handling, payment collection, or guaranteed staff response.
- A real mobile LINE account has checked Add Friend, Rich Menu, LIFF, and chatbot replies.
