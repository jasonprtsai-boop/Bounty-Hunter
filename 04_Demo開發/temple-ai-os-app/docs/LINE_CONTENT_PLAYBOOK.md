# LINE content playbook

Last updated: 2026-09-04

## Purpose

This guide prepares the LINE account content needed for the Wan Chun Gong service flow. Keep public-facing messages clear that formal temple details should follow temple announcements unless written authorization exists to operate as Wan Chun Gong's official service.

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
| Account name | 萬春宮線上服務 |
| Status message | LINE 宮廟服務入口｜參拜・活動・客服 |
| Greeting message | 歡迎加入萬春宮線上服務。你可以點選下方選單詢問參拜方式、查看活動報名、抽文化籤、看主殿導覽、查報名進度或聯絡客服。正式活動、開放時間與服務內容請以廟方公告為準。 |
| Chat response mode | Webhook 啟用；自動回應保持關閉或只保留服務提醒，避免和問答 webhook 重複回覆。 |
| LINE VOOM interaction | 可開放按讚；留言建議先關閉或每日人工檢查，避免未授權服務詢問被誤認為正式客服。 |
| Prohibited content | 不要放正式捐款帳號、LINE Pay、官方客服承諾、未授權廟方公告或任何私人憑證。 |

## Business profile copy

Use `docs/LINE_BUSINESS_PROFILE_SETUP.md` or `/admin/release` for copy-ready profile fields, public URLs, avatar, and background image assets.

## LINE VOOM post examples

### Service launch

Suggested asset: `assets/banners/home.png`

```text
萬春宮線上服務入口整理完成。

這是一個以 LINE 為入口的宮廟服務流程，將參拜問答、查看活動報名、查報名進度、文化抽籤與後台管理整合在同一個入口。

本帳號以公開資料整理服務情境；正式活動、開放時間與服務內容請以廟方公告為準。

服務入口：https://wanchun-gong-service.jasonprtsai.chatgpt.site/site

#萬春宮服務 #LINE服務 #宮廟線上服務 #廟埕入口
```

### Event registration service

Suggested asset: `assets/banners/events.png`

```text
活動報名也可以從 LINE 開始。

使用者在 LINE 收到活動卡片後，直接開啟 LIFF 表單完成報名，後台同步看到報名狀態與提醒任務。

提醒：正式名額、時間與參加規則仍以廟方公告為準。

活動入口：https://wanchun-gong-service.jasonprtsai.chatgpt.site/events

#活動報名 #LIFF #LINE服務 #萬春宮服務
```

### Sticker preview

Suggested asset: `assets/flex/fortune-card.png`

```text
春福小使貼圖準備中。

第一套靜態貼圖以「日常祝福、收到、感謝、平安、已報名」為核心語境，讓宮廟服務不只提供資訊，也能保留一點溫度。

貼圖小舖：https://wanchun-gong-service.jasonprtsai.chatgpt.site/stickers

貼圖正式上架需等待 LINE Creators Market 審核。

#LINE貼圖 #春福小使 #萬春宮服務 #文化服務
```

### Cultural tour service

Suggested asset: `assets/banners/tour.png`

```text
從 LINE 開始的文化導覽。

使用者掃描 QR 或點選 Rich Menu 後，可開啟導覽頁，閱讀宮廟歷史、參拜提醒與文化脈絡。未來可延伸到現場 QR/NFC 點位。

導覽入口：https://wanchun-gong-service.jasonprtsai.chatgpt.site/tour/main-hall

正式導覽文字仍需廟方審稿。

#文化導覽 #QR導覽 #宮廟文化 #萬春宮服務
```

## Broadcast examples

Use these only for small tests or explicitly opted-in users. For production, review audience consent, monthly message quota, and content approval before sending.

### Event day-before reminder

```text
【萬春宮活動提醒】
你報名的活動將於明天開始。

地點：萬春宮
請以活動頁與廟方公告為準。

查看報名紀錄：
https://liff.line.me/2010938588-VJXpaoyH/member

正式活動、時間與服務內容請以廟方公告為準。
```

### Support follow-up

```text
【萬春宮客服回覆】
你先前留下的問題已有回覆。

請開啟客服頁查看：
https://liff.line.me/2010938588-VJXpaoyH/support

正式廟務、活動與捐款問題仍請以廟方公告或正式窗口為準。
```

### Service check broadcast

```text
萬春宮線上服務今日檢查重點：
1. LINE Rich Menu 服務入口
2. 參拜問答與活動卡片
3. LIFF 活動報名
4. 後台管理與通知任務

公開服務頁：
https://wanchun-gong-service.jasonprtsai.chatgpt.site/site
```

## Pre-release content checklist

- Business profile, account name, avatar, and background image match the service positioning.
- Greeting message includes the formal-information reminder.
- Webhook is enabled, and duplicate automatic replies are disabled.
- Rich Menu is published and opens the deployed URLs.
- At least one LINE VOOM post is drafted or scheduled.
- No post claims official temple operation, donation handling, payment collection, or guaranteed staff response.
- A real mobile LINE account has checked Add Friend, Rich Menu, LIFF, and service replies.
