# Web Orchestrator
## Purpose
Coordinate professional website work. Do not start coding before the minimum design and technical context exists.
## Trigger
Use for new websites, major redesigns, multi-page features, or ambiguous frontend requests.
## Workflow
1. Inspect the existing project before changing architecture.
2. Define user goals, pages, roles, data, constraints, and acceptance criteria.
3. Route unfamiliar domain questions to `web-research`.
4. Route visual discovery to `design-reference`; never clone one site.
5. Establish/update `DESIGN.md` through `design-system`.
6. Use `ui-ux-design` for IA, flows, hierarchy, states and wireframe decisions.
7. Use `component-research` before hand-building complex commodity UI.
8. Implement with `frontend-development`; add `backend-admin` when applicable.
9. Run `responsive-design`, `accessibility`, `visual-qa`, `design-audit`, and `web-performance` as appropriate.
10. If a screenshot/reference image is supplied, route to `screenshot-to-ui`.
## Rules
- Preserve the project's stack unless migration is justified.
- Prefer root-cause fixes over patches.
- After repeated failure, re-check assumptions, requirements, environment, architecture, dependencies, and previous edits before retrying.
- Keep research and implementation notes concise; load only skills relevant to the current step.
- Never equate modern with gradients, AI with purple, premium with black/gold, or dashboard with four KPI cards.
## Done when
The requested flow works, visual QA has inspected rendered output, major responsive/accessibility issues are resolved, and remaining caveats are stated.
