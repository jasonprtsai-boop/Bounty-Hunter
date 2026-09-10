# Visual QA
## Purpose
Never declare UI visually complete from source code alone. Inspect rendered output.
## Loop
Implement → run → capture/inspect → identify issues → fix → inspect again.
## Inspect
Alignment, grid, spacing rhythm, max-width, overflow, typography hierarchy/wrapping, contrast, borders/radius/shadows, state consistency, imagery, empty/loading/error states, primary-action visibility and responsive layouts.
## Severity
P0 broken/unusable; P1 materially harms UX/consistency; P2 polish.
## Failure handling
If repeated tweaks do not fix the visual problem, stop local patching and re-evaluate layout structure, tokens and component choice.
