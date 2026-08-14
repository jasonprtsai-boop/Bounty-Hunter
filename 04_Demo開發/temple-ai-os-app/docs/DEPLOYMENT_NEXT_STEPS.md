# Deployment next steps

Last updated: 2026-08-14

## Current public URLs

```text
FRONTEND_BASE_URL=https://temple-ai-os-demo.jasonprtsai.chatgpt.site
API_BASE_URL=https://temple-ai-os-api.onrender.com
PRIVACY_URL=https://temple-ai-os-demo.jasonprtsai.chatgpt.site/privacy
TERMS_URL=https://temple-ai-os-demo.jasonprtsai.chatgpt.site/terms
LINE_LIFF_ID=2010938588-VJXpaoyH
LINE_LIFF_URL=https://liff.line.me/2010938588-VJXpaoyH
LINE_OFFICIAL_ACCOUNT_BASIC_ID=@983zhzni
LINE_ADD_FRIEND_URL=https://line.me/R/ti/p/%40983zhzni
```

## 1. Completed

- Frontend deployed to public Sites URL.
- Backend demo service deployed on Render Free: `https://temple-ai-os-api.onrender.com`.
- Backend `/health`, `/api/events`, and `/api/temple/profile` verified from the public URL.
- LINE Login privacy policy URL configured.
- LINE Login terms URL configured.
- LIFF app created.
- LINE Official Account created: `Temple AI OS Demo`, Basic ID `@983zhzni`.
- Messaging API enabled for channel `2010991408`.
- Admin frontend now requires an entered management token; the demo token is no longer bundled in public frontend code.
- Admin APIs support named `ADMIN_TOKENS` so audit logs can record the server-verified operator.
- `/api/chat` has message length bounds and a simple per-user/IP rate limit.
- `/api/chat` now uses keyword FAQ rules plus fixed safe replies; OpenAI is no longer required for the public demo chat path.
- Flex event and fortune messages now include public hero images.
- Production Supabase path now has pgvector search RPC and atomic event registration RPC in migration `004_search_and_atomic_registration.sql`.
- FAQ fixed replies are stored in `faq_rules` via migration `005_faq_rules.sql`, with local JSON fallback when the table is unavailable or missing required rules.
- Database operational hardening is in migration `006_operational_hardening.sql`, and the generated all-in-one setup file is `database/supabase_full_setup.sql`.
- `/stickers` page and first 8-image sticker pack assets are prepared for LINE Creators Market submission.
- LINE OA profile image asset is prepared at `assets/brand/line-oa-profile-v2.png`.

## 2. Current backend mode

Current Render service:

```text
Service name=temple-ai-os-api
Branch=codex/temple-ai-os-site
Plan=Free
Mode=DEMO_MODE=false
Build=cd "04_Demo開發/temple-ai-os-app/backend" && pip install -e .
Start=cd "04_Demo開發/temple-ai-os-app/backend" && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

`DEMO_MODE=false` uses Supabase, LINE secrets, and the server-side admin tokens stored in Render. Chat replies still have a local FAQ fallback, so missing or incomplete FAQ rows do not take the public chat endpoint down.

Free Render instances spin down after inactivity, so the first request can be delayed by roughly 50 seconds or more.

## 3. Production secrets still required

Set these in Render environment variables, not in repo files:

```text
LINE_CHANNEL_SECRET=<from LINE Developers Console>
LINE_CHANNEL_ACCESS_TOKEN=<long-lived token from LINE Developers Console>
SUPABASE_URL=<secret>
SUPABASE_SERVICE_ROLE_KEY=<secret>
SUPABASE_ANON_KEY=<secret>
ADMIN_DEMO_TOKEN=<new private admin token, or leave unused when ADMIN_TOKENS is set>
ADMIN_TOKENS=temple-staff:<token>,reviewer:<token>
```

Then change:

```text
DEMO_MODE=false
```

Keep:

```text
APP_ENV=production
API_BASE_URL=https://temple-ai-os-api.onrender.com
FRONTEND_BASE_URL=https://temple-ai-os-demo.jasonprtsai.chatgpt.site
ALLOWED_ORIGINS=https://temple-ai-os-demo.jasonprtsai.chatgpt.site
LINE_CHANNEL_ID=2010991408
LINE_LOGIN_CHANNEL_ID=2010938588
LINE_LIFF_ID=2010938588-VJXpaoyH
LINE_SKIP_SIGNATURE_VALIDATION=false
```

## 4. Supabase database setup

Apply migrations in order before changing `DEMO_MODE=false`:

```text
database/migrations/001_init.sql
database/migrations/002_rls_policies.sql
database/migrations/003_line_webhook_events.sql
database/migrations/004_search_and_atomic_registration.sql
database/migrations/005_faq_rules.sql
database/migrations/006_operational_hardening.sql
```

For a fresh Supabase project, you can run the generated bundle instead:

```text
database/supabase_full_setup.sql
```

Seed demo content after migrations:

```text
cd 04_Demo開發/temple-ai-os-app
python scripts/seed_demo_data.py
```

Validate database reads and writes after SQL is applied:

```text
cd 04_Demo開發/temple-ai-os-app
python scripts/verify_database.py
```

Optional future vector-search import after migrations:

```text
cd 04_Demo開發/temple-ai-os-app
python scripts/import_knowledge.py
```

`scripts/import_knowledge.py` does a dry run without secrets. It is not required for the current fixed FAQ reply flow.

Registration capacity is handled by the `register_for_event` database function; do not switch production traffic to `DEMO_MODE=false` until migrations through `006` are applied and `scripts/verify_database.py` passes.

## 5. Frontend API target

The frontend fallback API target is now:

```text
https://temple-ai-os-api.onrender.com
```

Required frontend environment for rebuilds:

```text
VITE_API_BASE_URL=https://temple-ai-os-api.onrender.com
VITE_LIFF_ID=2010938588-VJXpaoyH
VITE_LINE_ADD_FRIEND_URL=https://line.me/R/ti/p/%40983zhzni
VITE_LINE_OPENCHAT_URL=
VITE_LINE_STICKER_STORE_URL=<set after LINE Creators Market approval>
```

Routes that must work:

```text
https://temple-ai-os-demo.jasonprtsai.chatgpt.site/site
https://temple-ai-os-demo.jasonprtsai.chatgpt.site/community
https://temple-ai-os-demo.jasonprtsai.chatgpt.site/stickers
https://temple-ai-os-demo.jasonprtsai.chatgpt.site/privacy
https://temple-ai-os-demo.jasonprtsai.chatgpt.site/terms
https://liff.line.me/2010938588-VJXpaoyH
```

## 6. Sticker release

Submit the files in `assets/stickers/spring-fortune-messenger/` through LINE Creators Market and wait for approval. After approval, set `VITE_LINE_STICKER_STORE_URL` to the sales page URL and redeploy the frontend. The `/stickers` CTA will then open the purchase page.

Change the LINE OA profile image manually in LINE Official Account Manager using:

```text
assets/brand/line-oa-profile-v2.png
```

Do not describe the pack as an official Wan Chun Gong sticker set unless written authorization exists.

## 7. Update Messaging API webhook

Messaging API channel:

```text
Channel ID=2010991408
Official Account Basic ID=@983zhzni
```

Set webhook after `LINE_CHANNEL_SECRET` is configured in Render:

```text
Webhook URL=https://temple-ai-os-api.onrender.com/api/line/webhook
Use webhook=Enabled
Webhook redelivery=Enabled
```

The webhook POST must reject invalid signatures in production. Do not enable `LINE_SKIP_SIGNATURE_VALIDATION` for a public deployment.

## 8. Publish rich menu

Only after frontend URL, backend URL, and access token are configured:

```text
FRONTEND_BASE_URL=https://temple-ai-os-demo.jasonprtsai.chatgpt.site
LINE_CHANNEL_ACCESS_TOKEN=<secret>
python scripts/create_rich_menu.py
```

Use `assets/rich-menu/main-2500x1686.png`.

## 9. Acceptance checklist

- Add friend URL opens `@983zhzni`.
- Public site opens without login.
- Public backend `/health` returns `status=ok`.
- LIFF URL opens in LINE.
- Rich Menu appears after adding the official account.
- Tapping LIFF buttons opens the deployed frontend in LINE.
- LINE webhook Verify succeeds.
- Text message to the official account reaches `/api/line/webhook`.
- AI reply is sent through Messaging API.
- Event Flex Message includes a reachable HTTPS hero image under `/assets/flex/event-card.png`.
- `/stickers` opens and shows the 8-image sticker pack preview.
- Admin login requires a private token. Prefer `ADMIN_TOKENS`; successful admin mutations are recorded in `audit_logs` with the server-verified actor.
- Supabase knowledge search returns results from `match_knowledge_chunks`.
- Event registration uses `register_for_event` and rejects over-capacity concurrent attempts.
- Duplicate webhook event is processed only once.
- Demo pages clearly state this is not Wan Chun Gong official operation.
