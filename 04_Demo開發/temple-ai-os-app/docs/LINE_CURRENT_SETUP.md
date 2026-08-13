# LINE current setup

Last updated: 2026-08-13

## Public frontend

- Sites URL: `https://temple-ai-os-demo.jasonprtsai.chatgpt.site`
- Access mode: public
- Privacy policy URL: `https://temple-ai-os-demo.jasonprtsai.chatgpt.site/privacy`
- Terms URL: `https://temple-ai-os-demo.jasonprtsai.chatgpt.site/terms`

## Provider

- Provider: `宮廟服務商`

## LINE Official Account / Messaging API

- Official Account name: `Temple AI OS示範`
- Basic ID: `@983zhzni`
- Add friend URL: `https://line.me/R/ti/p/%40983zhzni`
- Messaging API Channel ID: `2010991408`
- Status: Messaging API enabled

Sensitive values are intentionally not recorded here:

- Channel secret
- Long-lived channel access token
- LINE account password

## LINE Login

- Channel name: `宮廟官網`
- Channel ID: `2010938588`
- Status: Developing
- Privacy policy URL configured
- Terms URL configured
- Linked official account shown in LINE Developers Console: `@983zhzni / Temple AI OS示範`

## LIFF

- LIFF app name: `Temple AI OS`
- LIFF ID: `2010938588-VJXpaoyH`
- LIFF URL: `https://liff.line.me/2010938588-VJXpaoyH`
- Endpoint URL: `https://temple-ai-os-demo.jasonprtsai.chatgpt.site`
- Size: Full
- Scopes: `openid`, `profile`
- Add friend option: On (normal)

## Pending

- Backend is already deployed at `https://temple-ai-os-api.onrender.com`; keep using this URL unless the Render service is replaced.
- Configure Render secrets before verifying the Messaging API webhook:
  - `LINE_CHANNEL_SECRET`
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `OPENAI_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`
  - `ADMIN_DEMO_TOKEN`
- Apply Supabase migrations through `004_search_and_atomic_registration.sql`, then run `scripts/seed_demo_data.py` and `scripts/import_knowledge.py`.
- Set Messaging API webhook URL to `https://temple-ai-os-api.onrender.com/api/line/webhook`, enable webhook and redelivery, then verify.
- Publish the redesigned Rich Menu with `scripts/create_rich_menu.py`.
- Store secrets only in local `.env` or deployment secret storage, not in repo files.
