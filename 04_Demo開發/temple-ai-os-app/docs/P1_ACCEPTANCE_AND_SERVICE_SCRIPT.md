# P1 acceptance and service script

Last updated: 2026-08-15

## P1 scope

P1 means the service flow is safe enough to review:

- Backend, frontend, and production build pass local validation.
- Admin login uses server-verified account or Email + password credentials, not a public bundled token.
- Public service URLs respond before the walkthrough.
- LINE/LIFF/Supabase paths have a clear manual acceptance checklist.
- The 3-minute walkthrough follows a fixed sequence that does not depend on improvising.

## Automated checks

Run these before a service rehearsal:

```powershell
cd <專案資料夾>\temple-ai-os-app\backend
.\.venv\Scripts\python.exe -m pytest
```

Expected result:

```text
Backend tests pass
```

```powershell
cd <專案資料夾>\temple-ai-os-app\frontend
.\node_modules\.bin\tsc.cmd -b
.\node_modules\.bin\vite.cmd build
```

Expected result:

```text
TypeScript passes and Vite produces dist/client
```

For public smoke testing:

```powershell
cd <專案資料夾>\temple-ai-os-app
backend\.venv\Scripts\python.exe scripts\smoke_public_check.py
```

This verifies:

- public backend `/health`
- public `/api/events`
- public `/api/temple/profile`
- admin dashboard rejects anonymous access
- admin login rejects invalid credentials
- public `/site`, `/community`, `/stickers`, `/privacy`, `/terms`
- public Flex hero image
- LIFF URL and LINE add-friend URL respond or redirect

It does not verify private LINE secrets, Supabase service-role writes, or actual Messaging API reply delivery.

## Manual acceptance

Use a real LINE mobile app account for these checks:

1. Add `@983zhzni`.
2. Confirm Rich Menu appears.
3. Tap each Rich Menu entry and confirm it opens the expected LIFF or public page.
4. Send `近期有什麼活動？` to the official account.
5. Confirm the backend replies with an event Flex Message.
6. Open one event and submit a registration.
7. Confirm `/admin` requires account or Email + password login.
8. Log in with the Render-configured admin username and password.
9. Confirm dashboard metrics, registrations, support tickets, knowledge documents, and notification jobs are visible.
10. Open `/admin/release` and confirm account settings, business profile copy, public links, LINE VOOM post examples, and broadcast examples are available.
11. Create a temporary test event, then delete it.
12. Confirm the admin operation is recorded in `audit_logs`.

Use `scripts/verify_database.py` only when Supabase secrets are available locally or in a secure runtime.

For account settings and content examples, use `docs/LINE_CONTENT_PLAYBOOK.md` or `/admin/release`.

## Three-minute service walkthrough

### 0:00-0:25 Problem

Small temples often use LINE as the real service entrance, but activity registration, visitor questions, reminders, and staff follow-up are split across manual messages, posts, and spreadsheets. This walkthrough shows how those flows can become one LINE-first operating system.

### 0:25-0:55 LINE entry

Open the LINE Official Account, show the Rich Menu, and tap the main service entry. Point out that visitors do not need to install a separate app.

### 0:55-1:25 Service question

Ask `近期有什麼活動？`. Show the service reply and event Flex Message. Emphasize that the reply is based on reviewed FAQ rules and temple knowledge, with safety boundaries instead of free-form guessing.

### 1:25-1:55 LIFF registration

Open an event from the Flex Message, submit a registration, and show the confirmation path. Explain that production registration uses the database RPC to prevent over-capacity race conditions.

### 1:55-2:25 Admin operation

Open `/admin`, log in with the server-configured account or Email + password, then show dashboard metrics, registrations, knowledge documents, support tickets, and notification jobs.

### 2:25-2:45 Public and cultural extensions

Show `/site`, `/community`, `/stickers`, or `/tour/main-hall`. Keep this short: the main point is that the same LINE entry can support public information, cultural guidance, and future QR/NFC tours.

### 2:45-3:00 Close

Close with the operating value: one LINE entrance for visitors, one dashboard for staff, safe reviewed answers, structured registration, and measurable follow-up.

## Service safety notes

- Keep the formal-information reminder visible. This is not Wan Chun Gong official operation unless written authorization exists.
- Do not run through donations, LINE Pay, or official temple service claims.
- Warm up Render at least five minutes before presenting.
- Keep a fallback browser tab open to `/site`, `/events`, `/admin`, and `/stickers`.
