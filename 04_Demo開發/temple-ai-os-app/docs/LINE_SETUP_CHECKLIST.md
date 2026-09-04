# LINE setup checklist

This checklist is for Wan Chun Gong LINE service setup. Do not commit LINE secrets, passwords, access tokens, model/API keys, or Supabase service keys.

## 1. Current LINE assets

- Provider: `宮廟服務商`
- Official Account: `萬春宮線上服務`
- Official Account Basic ID: `@983zhzni`
- Add friend URL: `https://line.me/R/ti/p/%40983zhzni`
- Messaging API Channel ID: `2010991408`
- LINE Login Channel: `宮廟官網`
- LINE Login Channel ID: `2010938588`
- LIFF ID: `2010938588-VJXpaoyH`
- LIFF URL: `https://liff.line.me/2010938588-VJXpaoyH`
- Public frontend: `https://wanchun-gong-service.jasonprtsai.chatgpt.site`

## 2. Completed

- Frontend is public.
- LINE Login privacy policy URL is set.
- LINE Login terms URL is set.
- LIFF app is created.
- Add friend option is On (normal).

## 3. Messaging API channel

- Put Channel ID into `LINE_CHANNEL_ID`.
- Put Channel secret into `LINE_CHANNEL_SECRET`.
- Put long-lived channel access token into `LINE_CHANNEL_ACCESS_TOKEN`.
- Set webhook URL to `https://<render-api>.onrender.com/api/line/webhook`.
- Set `Use webhook` to Enabled.
- Set `Webhook redelivery` to Enabled.
- Verify only after the backend is deployed and `/health` returns OK.

## 4. Backend and frontend environment

Backend:

```text
LINE_LIFF_ID=2010938588-VJXpaoyH
FRONTEND_BASE_URL=https://wanchun-gong-service.jasonprtsai.chatgpt.site
ALLOWED_ORIGINS=https://wanchun-gong-service.jasonprtsai.chatgpt.site
```

Frontend after backend deployment:

```text
VITE_API_BASE_URL=https://<render-api>.onrender.com
VITE_LIFF_ID=2010938588-VJXpaoyH
VITE_LINE_ADD_FRIEND_URL=https://line.me/R/ti/p/%40983zhzni
```

## 5. Rich menu

- Use `assets/rich-menu/main-2500x1686.png`.
- Publish with `scripts/create_rich_menu.py`.
- Required environment:

```text
FRONTEND_BASE_URL=https://wanchun-gong-service.jasonprtsai.chatgpt.site
LINE_CHANNEL_ACCESS_TOKEN=<secret>
```

## 6. Validation

- The add friend URL opens `萬春宮線上服務`.
- LIFF URL opens in LINE.
- Rich Menu appears after adding the official account.
- Tapping LIFF buttons opens the deployed frontend.
- LIFF profile loads after login.
- LINE webhook Verify succeeds.
- Text messages reach the backend webhook.
- Service reply is sent through Messaging API.
- Service pages remind visitors that formal information follows temple announcements.
