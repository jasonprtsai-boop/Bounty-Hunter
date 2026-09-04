# 萬春宮線上服務前端設計指引

## Visual Thesis

萬春宮線上服務應該讓人覺得可信、在地、容易操作。公開頁要快速幫訪客找到宮廟資訊、活動、導覽、報名查詢與客服；後台頁要清楚、密集、適合廟務人員做決策與追蹤。

## Audience

- Public / LIFF: visitors and believers using a phone, often looking for one next step.
- Admin: temple staff managing activities, support tickets, knowledge content, notifications, and release settings.

## Semantic Colors

- Background: `#f6f8f5`
- Background warm: `#fff8ef`
- Surface: `#ffffff`
- Surface soft: `#f7faf7`
- Text: `#17231f`
- Muted text: `#5e6f68`
- Border: `#d8e2dc`
- Primary: `#b42318`
- Primary dark: `#7a1e17`
- Secondary: `#17352a`
- Secondary soft: `#e7f3ef`
- Accent gold: `#d8a83d`
- Accent blue: `#245b8a`
- Success: `#0f7a43`
- Warning: `#8a6a12`
- Danger: `#b42318`

## Typography

- Font stack: `Inter`, `Noto Sans TC`, `Microsoft JhengHei`, system UI.
- Public hero headings may be large, but compact panels, cards, sidebars, and admin pages should use tighter heading sizes.
- Body text should stay at 16px or above where users read paragraphs.
- Labels default to 14px or above. 12px is reserved for secondary metadata only.
- Letter spacing stays at `0`.

## Layout And Density

- Public site: narrative first viewport with a real temple image, then task-oriented service entry points.
- LIFF: task-first mobile layout. The first screen should expose activity, guide, lookup, and support paths.
- Admin: operational layout. Start with pending work and direct actions, then metrics and detailed tables.
- Cards use `8px` radius. Avoid cards inside cards and avoid making every section look like a card.
- Grids must define stable tracks with `minmax(0, 1fr)` and collapse intentionally on mobile.

## Components

- Buttons: primary for the next most useful action; secondary for alternate paths. Keep touch targets at least 44px.
- Status: use semantic color groups; never rely on color alone.
- Navigation: public mobile uses a fixed bottom menu; admin uses a sidebar on desktop and horizontal nav on tablet/mobile.
- Forms: group related fields, show errors near the relevant action, and keep destructive actions explicit.

## Motion

- Motion should clarify feedback or continuity. Avoid constant decorative motion.
- Default transitions: 150-220ms.
- Respect `prefers-reduced-motion`.

## Responsive Rules

- Check phone, tablet, and desktop layouts.
- On mobile, preserve the primary action and prevent horizontal overflow.
- Tables may scroll horizontally when data density requires it; service grids should stack.
- Long Chinese labels and mixed numeric text must wrap or truncate deliberately.

## Accessibility

- Use semantic HTML and landmarks.
- Keep visible focus states on links, buttons, form fields, and navigation.
- Maintain readable contrast on image overlays and tinted surfaces.
- Use descriptive link text and accessible names for navigation regions.
- Do not depend on hover-only affordances.

## Validation

- Run the public and admin builds after frontend changes.
- For visual work, inspect the rendered route before calling it complete when browser QA is requested.
- Document any remaining caveat as code-verified or browser/hardware-unverified.

## Second-Round Coverage

- Public site: homepage, community, privacy, and terms pages should share the same navigation, focus treatment, section rhythm, and readable legal/community density.
- LIFF pages: home, events, event detail, registration, fortune, tour, support, and stickers should share state panels, form behavior, button sizing, and mobile-safe text wrapping.
- Admin pages: dashboard, events, knowledge, support, notifications, accounts, and release settings should prioritize pending work, searchable lists, export actions, guarded destructive actions, and dense but readable cards.
- Shared states: loading, error, empty, success, read-only, permission-denied, and confirmation dialogs should use one visual language and accessible live-region behavior.
- Responsive acceptance: no horizontal overflow from long Chinese labels, IDs, URLs, phone numbers, copied templates, or multi-button admin actions.

## Third-Round LINE Chatroom Rules

- LINE chat is a service surface, not only a notification channel. Rich Menu, Flex cards, and LIFF destinations must use the same task language: ask worship guidance, view activity registration, draw a culture fortune, open temple tour, check registration progress, and contact support.
- Rich Menu payloads must stay within official Messaging API limits: one 2500x1686 image, at most 20 tappable areas, every area inside the image bounds, and chat bar text no longer than 14 characters.
- Flex `altText` must describe the message result, status, and next action enough for the LINE notification list. Avoid title-only alt text.
- Action labels should describe the outcome of tapping. Avoid generic labels such as "查看資訊", "查看詳情", or "詳情與報名" when a specific label like "前往活動報名" is possible.
- User-facing chat cards must not expose internal LINE user ids, backend ids, or implementation details unless the id is intentionally used as a public lookup code, such as a registration number.
- Registration notices should always carry date, time, location, party size, and the most useful next action. Waitlist and cancellation states must point to support or lookup instead of implying self-service behavior that does not exist.
- Before publishing to a real LINE Official Account, test Rich Menu hit areas and Flex cards on an actual phone in LINE, because desktop previews do not fully represent message wrapping, tap comfort, and notification alt text.
