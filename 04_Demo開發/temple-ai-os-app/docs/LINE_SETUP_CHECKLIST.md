# LINE setup checklist

This checklist is for Temple AI OS demo setup. Do not commit LINE secrets, passwords, access tokens, OpenAI keys, or Supabase service keys.

## 1. Current LINE assets

- Provider: `宮廟服務商`
- Official Account: `Temple AI OS示範`
- Official Account Basic ID: `@983zhzni`
- Add friend URL: `https://line.me/R/ti/p/%40983zhzni`
- Messaging API Channel ID: `2010991408`
- LINE Login Channel: `宮廟官網`
- LINE Login Channel ID: `2010938588`

## 2. Messaging API channel

- Put Channel ID into `LINE_CHANNEL_ID`.
- Put Channel secret into `LINE_CHANNEL_SECRET`.
- Put long-lived channel access token into `LINE_CHANNEL_ACCESS_TOKEN`.
- Set webhook URL to `https://<render-api>.onrender.com/api/line/webhook`.
- Set `Use webhook` to Enabled.
- Set `Webhook redelivery` to Enabled.
- Verify only after the backend is deployed and `/health` returns OK.

## 3. LINE Login and LIFF

- Use the same Provider: `宮廟服務商`.
- Put LINE Login Channel ID into `LINE_LOGIN_CHANNEL_ID`.
- Set policy URLs after frontend deployment:
  - Privacy policy URL: `https://<sites-host>/privacy`
  - Terms URL: `https://<sites-host>/terms`
- Create LIFF app:
  - Name: `Temple AI OS`
  - Size: `Full`
  - Endpoint URL: `https://<sites-host>`
  - Scopes: `openid`, `profile`
  - Add friend option: `normal`
- Put LIFF ID into frontend `VITE_LIFF_ID` and backend `LINE_LIFF_ID`.

## 4. Rich menu

- Use `assets/rich-menu/main-2500x1686.png`.
- Publish with `scripts/create_rich_menu.py`.
- Required environment:

```text
FRONTEND_BASE_URL=https://<sites-host>
LINE_CHANNEL_ACCESS_TOKEN=<secret>
```

## 5. Validation

- The add friend URL opens `Temple AI OS示範`.
- Rich Menu appears after adding the official account.
- Tapping LIFF buttons opens the deployed frontend.
- LIFF profile loads after login.
- LINE webhook Verify succeeds.
- Text messages reach the backend webhook.
- AI reply is sent through Messaging API.
- Demo pages clearly state this is not Wan Chun Gong official operation.
