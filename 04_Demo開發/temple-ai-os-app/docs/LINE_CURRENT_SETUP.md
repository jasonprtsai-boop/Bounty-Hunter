# LINE current setup

Last updated: 2026-08-14

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

## Current operational notes

- Backend is deployed at `https://temple-ai-os-api.onrender.com`; keep using this URL unless the Render service is replaced.
- Render is configured for `DEMO_MODE=false` with LINE, Supabase, and admin secrets stored in Render.
- Messaging API webhook URL is `https://temple-ai-os-api.onrender.com/api/line/webhook`; webhook, redelivery, and verification are enabled.
- Rich Menu has been published through the admin API.
- Apply Supabase migrations through `005_faq_rules.sql`, then run `scripts/seed_demo_data.py` whenever the database needs to be rebuilt or refreshed.
- `scripts/import_knowledge.py` is optional future vector-search work; the current public chat path uses keyword FAQ rules plus fixed safe replies.
- Store secrets only in local `.env` or deployment secret storage, not in repo files.
