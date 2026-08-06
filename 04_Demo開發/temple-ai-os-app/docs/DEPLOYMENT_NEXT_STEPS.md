# Deployment next steps

Last updated: 2026-08-06

This project has a working local frontend and LINE channel setup. LIFF and webhook setup should not be completed with localhost URLs. Use this order to avoid invalid LINE settings.

## 1. Deploy frontend

Frontend target:

```text
https://<sites-host>
```

Required frontend environment:

```text
VITE_API_BASE_URL=https://<render-api>.onrender.com
VITE_LIFF_ID=<fill after LIFF app is created>
VITE_LINE_ADD_FRIEND_URL=https://line.me/R/ti/p/%40983zhzni
VITE_LINE_OPENCHAT_URL=
```

Routes that must work before LINE setup:

```text
https://<sites-host>/site
https://<sites-host>/community
https://<sites-host>/privacy
https://<sites-host>/terms
```

## 2. Deploy backend

Backend target:

```text
https://<render-api>.onrender.com
```

Required backend secrets:

```text
LINE_CHANNEL_ID=2010991408
LINE_CHANNEL_SECRET=<from LINE Developers Console>
LINE_CHANNEL_ACCESS_TOKEN=<long-lived token from LINE Developers Console>
LINE_LOGIN_CHANNEL_ID=2010938588
LINE_LIFF_ID=<fill after LIFF app is created>
OPENAI_API_KEY=<secret>
SUPABASE_URL=<secret>
SUPABASE_SERVICE_ROLE_KEY=<secret>
SUPABASE_ANON_KEY=<secret>
```

Required backend public environment:

```text
APP_ENV=production
DEMO_MODE=false
API_BASE_URL=https://<render-api>.onrender.com
FRONTEND_BASE_URL=https://<sites-host>
ALLOWED_ORIGINS=https://<sites-host>
LINE_SKIP_SIGNATURE_VALIDATION=false
```

Validation before LINE webhook:

```text
GET https://<render-api>.onrender.com/health
POST https://<render-api>.onrender.com/api/line/webhook
```

The webhook POST must reject invalid signatures in production. Do not enable `LINE_SKIP_SIGNATURE_VALIDATION` for a public deployment.

## 3. Update LINE Developers

Provider:

```text
宮廟服務商
```

Messaging API channel:

```text
Temple AI OS示範 / 2010991408
```

Set webhook:

```text
Webhook URL=https://<render-api>.onrender.com/api/line/webhook
Use webhook=Enabled
Webhook redelivery=Enabled
```

LINE Login channel:

```text
宮廟官網 / 2010938588
```

Set policy URLs:

```text
Privacy policy URL=https://<sites-host>/privacy
Terms of use URL=https://<sites-host>/terms
```

Create LIFF app:

```text
Name=Temple AI OS
Size=Full
Endpoint URL=https://<sites-host>
Scopes=openid, profile
Add friend option=normal
Linked official account=@983zhzni / Temple AI OS示範
```

After creation, copy LIFF ID into:

```text
LINE_LIFF_ID=<liff-id>
VITE_LIFF_ID=<liff-id>
```

Redeploy backend and frontend after setting LIFF ID.

## 4. Publish rich menu

Only after frontend URL and access token are configured:

```text
FRONTEND_BASE_URL=https://<sites-host>
LINE_CHANNEL_ACCESS_TOKEN=<secret>
python scripts/create_rich_menu.py
```

Use `assets/rich-menu/main-2500x1686.png`.

## 5. Acceptance checklist

- Add friend URL opens `Temple AI OS示範`.
- Rich Menu appears after adding the official account.
- Tapping LIFF buttons opens the deployed frontend in LINE.
- LINE webhook Verify succeeds.
- Text message to the official account reaches `/api/line/webhook`.
- AI reply is sent through Messaging API.
- Duplicate webhook event is processed only once.
- Demo pages clearly state this is not Wan Chun Gong official operation.
