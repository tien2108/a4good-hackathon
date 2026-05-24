# EU AI Act Compliance Assistant — Build Plan

A single-page React + TypeScript + Tailwind app rendered at `/`, using Lucide icons and shadcn/ui primitives already in the template. No backend wiring — all interactions are mocked client-side.

## Design system (src/styles.css)
- Light mode: near-white background, deep slate foreground.
- Dark mode: deep navy/slate background.
- Add semantic tokens: `--accent-emerald` (compliance), `--accent-amber` (risk), `--brand-from` (indigo/violet), `--brand-to` (emerald) for the logo gradient.
- Typography: Inter via Google Fonts link in `__root.tsx` head.
- Add gradient utility token `--gradient-brand` and a subtle `--shadow-elegant`.

## Route
- Replace placeholder in `src/routes/index.tsx` with the full page composition. Update `head()` with SEO title/description/H1-aligned metadata.
- Single route — everything on the home page per spec.

## Component structure (all under `src/components/compliance/`)
1. `BrandLogo.tsx` — gradient wordmark "TBD Product Name" with shield icon.
2. `SiteHeader.tsx` — top bar with logo + minimal nav placeholder.
3. `IntroSection.tsx` — H1 "EU AI Act Compliance Guardrails", subtitle, and 3 feature cards (Smarter Synthesis, Automated Risk Mapping, Auditable Evidence) with Lucide icons (`Layers`, `ShieldCheck`, `FileSearch`).
4. `WorkspaceGrid.tsx` — asymmetric `grid-cols-1 lg:grid-cols-5` (3+2) wrapping the two columns.
5. `IngestionPanel.tsx` (left, span 3):
   - `FileDropzone.tsx` — drag/drop zone, accepts pdf/docx/txt/xlsx, local `useState` list of staged files with mock progress bar (animated to 100% on add), delete button.
   - `ContextTextarea.tsx` — labeled textarea with the long placeholder.
   - `AnalyzeButton.tsx` — prominent gradient CTA "Initialize Regulatory Analysis"; on click, cycles through three status messages with a spinner, then resets (no real call).
6. `ReferenceSidebar.tsx` (right, span 2) — shadcn `Tabs` with two tabs:
   - Risk Classifications: 4 stacked items color-coded (red unacceptable, amber high, yellow limited, emerald minimal) with short examples.
   - Financial Penalties: two highlighted callouts (€35M/7%, €15M/3%).
7. `AnalysisReport.tsx` — section titled "Compliance Assessment & Analysis Report":
   - Empty state with `Info` icon and the specified copy.
   - Hidden/placeholder scaffold containers (rendered but visually muted or behind a `data-state="empty"`) for the 6 outputs: Use-case Summary, Operational Facts, Risk & Rule Assessment, Governance Observations & Checklist, Uncertainties + Follow-up Chat skeleton, Grounded Citations.
8. `DisclaimerFooter.tsx` — sticky-feeling footer box with the exact disclaimer text.

State is purely local to each component; no global store, no backend calls.

## Visual details
- Cards: rounded-2xl, 1px border, soft shadow, hover lift.
- Buttons: gradient brand fill on primary CTA; subtle ring on focus.
- Micro-interactions: dropzone border pulses on dragover; staged-file progress animates from 0→100 via CSS transition; analyze button shows rotating `Loader2` and swaps label text on a `setInterval`.
- Accessibility: semantic `<header>`, `<main>`, `<section>`, `<footer>`; labels tied to inputs; single H1.

## Out of scope
- No real file parsing, no AI calls, no Lovable Cloud, no routing beyond `/`.
- Backend hooks are left as clearly-labeled placeholder containers per spec.

## Files to create/modify
- Modify: `src/routes/index.tsx`, `src/routes/__root.tsx` (head meta + Inter font), `src/styles.css` (tokens + gradient).
- Create: 10 component files listed above under `src/components/compliance/`.
