# P1 acceptance and demo script

Last updated: 2026-08-15

## P1 scope

P1 means the demo is safe enough to show to reviewers:

- Backend, frontend, and production build pass local validation.
- Admin login uses server-verified username/password credentials, not a public bundled token.
- Public demo URLs respond before the presentation.
- LINE/LIFF/Supabase paths have a clear manual acceptance checklist.
- The 3-minute presentation follows a fixed sequence that does not depend on improvising.

## Automated checks

Run these before a demo rehearsal:

```powershell
cd 04_Demo開發\temple-ai-os-app\backend
.\.venv\Scripts\python.exe -m pytest
```

Expected result:

```text
47 passed
```

```powershell
cd 04_Demo開發\temple-ai-os-app\frontend
.\node_modules\.bin\tsc.cmd -b
.\node_modules\.bin\vite.cmd build
```

Expected result:

```text
TypeScript passes and Vite produces dist/client
```

For public smoke testing:

```powershell
cd 04_Demo開發\temple-ai-os-app
backend\.venv\Scripts\python.exe scripts\smoke_public_demo.py
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
7. Confirm `/admin` requires username/password login.
8. Log in with the Render-configured admin username and password.
9. Confirm dashboard metrics, registrations, support tickets, knowledge documents, and notification jobs are visible.
10. Open `/admin/release` and confirm account settings, business profile copy, public links, LINE VOOM post examples, and broadcast examples are available.
11. Create a temporary test event, then delete it.
12. Confirm the admin operation is recorded in `audit_logs`.

Use `scripts/verify_database.py` only when Supabase secrets are available locally or in a secure runtime.

For account settings and content examples, use `docs/LINE_CONTENT_PLAYBOOK.md` or `/admin/release`.

## Three-minute demo script

### 0:00-0:25 Problem

Small temples often use LINE as the real service entrance, but activity registration, visitor questions, reminders, and staff follow-up are split across manual messages, posts, and spreadsheets. The demo shows how those flows can become one LINE-first operating system.

### 0:25-0:55 LINE entry

Open the LINE Official Account, show the Rich Menu, and tap the main service entry. Point out that visitors do not need to install a separate app.

### 0:55-1:25 AI question

Ask `近期有什麼活動？`. Show the AI answer and event Flex Message. Emphasize that the reply is based on reviewed FAQ rules and temple knowledge, with safety boundaries instead of free-form guessing.

### 1:25-1:55 LIFF registration

Open an event from the Flex Message, submit a demo registration, and show the confirmation path. Explain that production registration uses the database RPC to prevent over-capacity race conditions.

### 1:55-2:25 Admin operation

Open `/admin`, log in with the server-configured username/password, then show dashboard metrics, registrations, knowledge documents, support tickets, and notification jobs.

### 2:25-2:45 Public and cultural extensions

Show `/site`, `/community`, `/stickers`, or `/tour/main-hall`. Keep this short: the main point is that the same LINE entry can support public information, cultural guidance, and future QR/NFC tours.

### 2:45-3:00 Close

Close with the operating value: one LINE entrance for visitors, one dashboard for staff, safe AI answers, structured registration, and measurable follow-up.

## Demo safety notes

- Keep the demo disclaimer visible. This is not Wan Chun Gong official operation unless written authorization exists.
- Do not demonstrate donations, LINE Pay, or official temple service claims.
- Warm up Render at least five minutes before presenting.
- Keep a fallback browser tab open to `/site`, `/events`, `/admin`, and `/stickers`.
