# Deployment next steps

Last updated: 2026-08-06

## Current public URLs

```text
FRONTEND_BASE_URL=https://temple-ai-os-demo.jasonprtsai.chatgpt.site
PRIVACY_URL=https://temple-ai-os-demo.jasonprtsai.chatgpt.site/privacy
TERMS_URL=https://temple-ai-os-demo.jasonprtsai.chatgpt.site/terms
LINE_LIFF_ID=2010938588-VJXpaoyH
LINE_LIFF_URL=https://liff.line.me/2010938588-VJXpaoyH
```

## 1. Completed

- Frontend deployed to public Sites URL.
- LINE Login privacy policy URL configured.
- LINE Login terms URL configured.
- LIFF app created.
- LINE Official Account `Temple AI OS示範` created.
- Messaging API enabled for channel `2010991408`.

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
LINE_LIFF_ID=2010938588-VJXpaoyH
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
FRONTEND_BASE_URL=https://temple-ai-os-demo.jasonprtsai.chatgpt.site
ALLOWED_ORIGINS=https://temple-ai-os-demo.jasonprtsai.chatgpt.site
LINE_SKIP_SIGNATURE_VALIDATION=false
```

Validation before LINE webhook:

```text
GET https://<render-api>.onrender.com/health
POST https://<render-api>.onrender.com/api/line/webhook
```

The webhook POST must reject invalid signatures in production. Do not enable `LINE_SKIP_SIGNATURE_VALIDATION` for a public deployment.

### 2.1 Supabase database setup

Apply migrations in order before setting `DEMO_MODE=false`:

```text
database/migrations/001_init.sql
database/migrations/002_rls_policies.sql
database/migrations/003_line_webhook_events.sql
```

Seed demo content after migrations:

```text
cd 04_Demo開發/temple-ai-os-app
python scripts/seed_demo_data.py
```

The backend now uses `SupabaseRepository` when `DEMO_MODE=false`; if Supabase secrets are missing, startup fails with `supabase_not_configured` instead of silently falling back to demo data.

Current limitation: registration capacity updates are guarded by the API but are not yet an atomic database RPC. For public high-traffic use, replace the REST insert/update pair with a Supabase function that checks capacity and writes the registration in one transaction.

## 3. Redeploy frontend after backend exists

Required frontend environment:

```text
VITE_API_BASE_URL=https://<render-api>.onrender.com
VITE_LIFF_ID=2010938588-VJXpaoyH
VITE_LINE_ADD_FRIEND_URL=https://line.me/R/ti/p/%40983zhzni
VITE_LINE_OPENCHAT_URL=
```

Routes that must work:

```text
https://temple-ai-os-demo.jasonprtsai.chatgpt.site/site
https://temple-ai-os-demo.jasonprtsai.chatgpt.site/community
https://temple-ai-os-demo.jasonprtsai.chatgpt.site/privacy
https://temple-ai-os-demo.jasonprtsai.chatgpt.site/terms
https://liff.line.me/2010938588-VJXpaoyH
```

## 4. Update Messaging API webhook

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

## 5. Publish rich menu

Only after frontend URL, backend URL, and access token are configured:

```text
FRONTEND_BASE_URL=https://temple-ai-os-demo.jasonprtsai.chatgpt.site
LINE_CHANNEL_ACCESS_TOKEN=<secret>
python scripts/create_rich_menu.py
```

Use `assets/rich-menu/main-2500x1686.png`.

## 6. Acceptance checklist

- Add friend URL opens `Temple AI OS示範`.
- Public site opens without login.
- LIFF URL opens in LINE.
- Rich Menu appears after adding the official account.
- Tapping LIFF buttons opens the deployed frontend in LINE.
- LINE webhook Verify succeeds.
- Text message to the official account reaches `/api/line/webhook`.
- AI reply is sent through Messaging API.
- Duplicate webhook event is processed only once.
- Demo pages clearly state this is not Wan Chun Gong official operation.
