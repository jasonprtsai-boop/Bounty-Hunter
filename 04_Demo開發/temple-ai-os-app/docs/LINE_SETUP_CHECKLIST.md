# LINE setup checklist

This checklist is for Wan Chun Gong LINE service setup. Do not commit LINE secrets, passwords, access tokens, model/API keys, or Supabase service keys.

## 1. Current LINE assets

- Provider: `宮廟服務商`
- Official Account: `萬春宮線上服務`
- Official Account Basic ID: `@983zhzni`
- Add friend URL: `https://line.me/R/ti/p/%40983zhzni`
- Messaging API Channel ID: `2010991408`
- LINE Login Channel: `Temple AI OS LIFF`
- LINE Login Channel ID: `2011626054`
- LIFF ID: `2011626054-2sedCKKE`
- LIFF URL: `https://liff.line.me/2011626054-2sedCKKE`
- Public frontend: `https://temple-ai-os-demo-20260828.jeremy40713.chatgpt.site`
- Legacy alias: `https://wanchun-gong-service.jasonprtsai.chatgpt.site`

## 2. Completed

- Frontend is public.
- LINE Login privacy policy URL is set.
- LINE Login terms URL is set.
- Valid LIFF app is active under LINE Login channel `2011626054`.
- Add friend option is Off for the LIFF app.

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
LINE_LOGIN_CHANNEL_ID=2011626054
LINE_LIFF_ID=2011626054-2sedCKKE
PUBLIC_LIFF_URL=https://liff.line.me/2011626054-2sedCKKE
FRONTEND_BASE_URL=https://temple-ai-os-demo-20260828.jeremy40713.chatgpt.site
ALLOWED_ORIGINS=https://temple-ai-os-demo-20260828.jeremy40713.chatgpt.site,https://wanchun-gong-service.jasonprtsai.chatgpt.site,https://temple-ai-os-admin-20260828.jeremy40713.chatgpt.site
```

Frontend after backend deployment:

```text
VITE_API_BASE_URL=https://<render-api>.onrender.com
VITE_LIFF_ID=2011626054-2sedCKKE
VITE_LINE_ADD_FRIEND_URL=https://line.me/R/ti/p/%40983zhzni
```

## 5. Rich menu

- Use `assets/rich-menu/main-2500x1686.png`.
- Publish with `scripts/create_rich_menu.py`.
- Required environment:

```text
FRONTEND_BASE_URL=https://temple-ai-os-demo-20260828.jeremy40713.chatgpt.site
LINE_CHANNEL_ACCESS_TOKEN=<secret>
```

## 6. Validation

- The add friend URL opens `萬春宮線上服務`.
- LIFF URL opens in LINE if configured; otherwise the public web fallback opens without a LIFF 404.
- Rich Menu appears after adding the official account.
- Tapping LINE menu buttons opens either the valid LIFF app or the deployed public frontend.
- LIFF profile loads after login.
- LINE webhook Verify succeeds.
- Text messages reach the backend webhook.
- Service reply is sent through Messaging API.
- Service pages remind visitors that formal information follows temple announcements.
