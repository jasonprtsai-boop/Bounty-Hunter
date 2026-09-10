# Frontend Development
## Purpose
Implement production-quality frontend code while preserving the existing architecture.
## Default only when unconstrained
React/Next.js + TypeScript + Tailwind + shadcn/ui. Never migrate an existing stack merely to match this default.
## Engineering rules
- Separate UI, domain logic, API access, validation and state.
- Prefer small composable typed components; avoid giant page components.
- Prefer local state; introduce global state only for genuinely shared state.
- Centralize API contracts and handle loading, empty, success, error, retry and timeout states.
- Avoid unnecessary `any`, duplicated logic and magic values.
- Reuse design tokens and components.
- Preserve security boundaries; client-side checks are not authorization.
## Verification
Run available lint/typecheck/tests/build. Fix root causes, not only symptoms.
