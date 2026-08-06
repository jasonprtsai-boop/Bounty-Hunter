# LINE current setup

Last updated: 2026-08-06

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

- Deploy backend to public HTTPS URL before setting and verifying Messaging API webhook URL.
- After backend deployment, set:
  - `API_BASE_URL`
  - `FRONTEND_BASE_URL`
  - `ALLOWED_ORIGINS`
  - `LINE_LIFF_ID`
- Rebuild frontend with production `VITE_API_BASE_URL` and `VITE_LIFF_ID`.
- Store secrets only in local `.env` or deployment secret storage, not in repo files.
