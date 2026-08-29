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
- Admin login uses the account/email + password credentials stored in Render. For `ADMIN_TOKENS=temple-staff:xxxx`, enter username `temple-staff` and password `xxxx` in `/admin`; for `ADMIN_USERNAME=staff@example.com`, enter the Email and password.
- Messaging API webhook URL is `https://temple-ai-os-api.onrender.com/api/line/webhook`; webhook, redelivery, and verification are enabled.
- Rich Menu has been published through the admin API.
- New Rich Menu source now includes a `貼圖小舖` entry that opens `/stickers`; republish after the frontend deployment.
- New LINE OA profile image is prepared at `assets/brand/line-oa-profile-v2.png`; upload it in LINE Official Account Manager.
- New LINE OA profile background is prepared at `assets/brand/line-oa-profile-background-v1.png`; upload it in LINE Official Account Manager.
- LINE business profile copy, public links, and the release checklist are prepared in `docs/LINE_BUSINESS_PROFILE_SETUP.md` and mirrored on `/admin/release`.
- First sticker pack assets are prepared at `assets/stickers/spring-fortune-messenger/`; submit them through LINE Creators Market before enabling purchase.
- Apply Supabase migrations through `006_operational_hardening.sql`, then run `scripts/seed_demo_data.py` whenever the database needs to be rebuilt or refreshed.
- `scripts/import_knowledge.py` is optional future vector-search work; the current public chat path uses keyword FAQ rules plus fixed safe replies.
- Store secrets only in local `.env` or deployment secret storage, not in repo files.
