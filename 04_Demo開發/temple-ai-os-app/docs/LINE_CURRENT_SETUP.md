# LINE current setup

Last updated: 2026-08-06

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
- Linked official account shown in LINE Developers Console: `@983zhzni / Temple AI OS示範`

## Pending

- Deploy frontend to public HTTPS URL before creating LIFF app.
- After frontend deployment, set LINE Login channel policy URLs:
  - Privacy policy URL: `https://<frontend-host>/privacy`
  - Terms URL: `https://<frontend-host>/terms`
- Deploy backend to public HTTPS URL before setting and verifying webhook URL.
- Store secrets only in local `.env` or deployment secret storage, not in repo files.
