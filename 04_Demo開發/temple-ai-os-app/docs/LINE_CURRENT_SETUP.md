# LINE current setup

Last updated: 2026-08-14

## Public frontend

- Sites URL: `https://wanchun-gong-service.jasonprtsai.chatgpt.site`
- Access mode: public
- Privacy policy URL: `https://wanchun-gong-service.jasonprtsai.chatgpt.site/privacy`
- Terms URL: `https://wanchun-gong-service.jasonprtsai.chatgpt.site/terms`

## Provider

- Provider: `宮廟服務商`

## LINE Official Account / Messaging API

- Official Account name: `萬春宮線上服務`
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
- Linked official account shown in LINE Developers Console: `@983zhzni / 萬春宮線上服務`

## LIFF

- LIFF app name: `萬春宮線上服務`
- LIFF ID: `2010938588-VJXpaoyH`
- LIFF URL: `https://liff.line.me/2010938588-VJXpaoyH`
- Endpoint URL: `https://wanchun-gong-service.jasonprtsai.chatgpt.site`
- Size: Full
- Scopes: `openid`, `profile`
- Add friend option: On (normal)

## Current operational notes

- Backend is deployed at `https://temple-ai-os-api.onrender.com`; keep using this URL unless the Render service is replaced.
- Render is configured for database service mode with LINE, Supabase, and admin secrets stored in Render.
- Admin login uses the account/email + password credentials stored in Render. For `ADMIN_TOKENS=temple-staff:xxxx`, enter username `temple-staff` and password `xxxx` in `/admin`; for `ADMIN_USERNAME=staff@example.com`, enter the Email and password.
- Messaging API webhook URL is `https://temple-ai-os-api.onrender.com/api/line/webhook`; webhook, redelivery, and verification are enabled.
- Rich Menu has been published through the admin API.
- New Rich Menu source now prioritizes 詢問參拜方式, 查看活動報名, 抽文化籤, 看主殿導覽, 查報名進度, and 聯絡客服; republish after the frontend deployment.
- New LINE OA profile image is prepared at `assets/brand/line-oa-profile-v2.png`; upload it in LINE Official Account Manager.
- New LINE OA profile background is prepared at `assets/brand/line-oa-profile-background-v1.png`; upload it in LINE Official Account Manager.
- LINE business profile copy, public links, and the release checklist are prepared in `docs/LINE_BUSINESS_PROFILE_SETUP.md` and mirrored on `/admin/release`.
- First sticker pack assets are prepared at `assets/stickers/spring-fortune-messenger/`; submit them through LINE Creators Market before enabling purchase.
- Apply Supabase migrations through `006_operational_hardening.sql`, then run `scripts/seed_service_data.py` whenever the database needs to be rebuilt or refreshed.
- `scripts/import_knowledge.py` is optional future vector-search work; the current public chat path uses keyword FAQ rules plus fixed safe replies.
- Store secrets only in local `.env` or deployment secret storage, not in repo files.
