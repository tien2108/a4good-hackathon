## Compliance Report Dashboard

A single-page, legal-tech styled dashboard at `/` that renders the humanized output of a multi-agent EU AI Act review pipeline. Static mock data — no backend wiring (email send is simulated with a toast).

### Files

- `src/routes/index.tsx` — replaces placeholder; renders the dashboard with proper SEO `head()` (title, description, og tags).
- `src/components/compliance/DashboardHeader.tsx` — product name, "Analysis Phase: Complete" badge, generation date.
- `src/components/compliance/UseCaseSummary.tsx` — Section 1 card.
- `src/components/compliance/GovernanceObservations.tsx` — Section 2 checklist with 3 sub-sections divided by hairlines.
- `src/components/compliance/RiskCaveats.tsx` — Section 3 alert-styled side panel (uncertainty flags + open action items).
- `src/components/compliance/ExportDock.tsx` — sticky bottom bar with PDF/PPT buttons, email input + send button (loading + success states via `sonner`).
- `src/components/compliance/AdvisoryFootnote.tsx` — fixed legal disclaimer strip.
- `src/components/compliance/Tag.tsx` — small pill component with `fact` (emerald), `interpretation` (indigo), `gap` (amber) variants.
- `src/styles.css` — extend tokens with deep-slate surfaces and the three accent hues (oklch).

Sonner `<Toaster />` will be mounted in `src/routes/__root.tsx` (currently absent) so toast notifications work.

### Layout

```text
┌────────────────────────────────────────────────────────────┐
│ Header: [Product Name TBD]  • Analysis Phase: Complete • Date │
├────────────────────────────────────────────────────────────┤
│ Section 1 — Humanized Use-Case Summary (full width card)    │
├──────────────────────────────────┬─────────────────────────┤
│ Section 2 — Governance (65%)     │ Section 3 — Risks (35%) │
│  • Human Oversight Frameworks    │  Uncertainty Flags      │
│  • Lifecycle Logging & Docs      │  ──────                 │
│  • Accountability & Role Clarity │  Open Action Items      │
├──────────────────────────────────┴─────────────────────────┤
│ Sticky Export Dock: [PDF] [PPT] | email input [Send Report] │
├────────────────────────────────────────────────────────────┤
│ Advisory Note footnote (fixed bottom)                       │
└────────────────────────────────────────────────────────────┘
```

### Visual System

- Background: deep slate (`oklch(0.18 0.02 250)`), card surface slightly lighter, hairline borders.
- Typography: serif display (e.g. `Instrument Serif` via Google Fonts link in `__root.tsx` head) for headings, system sans for body; tight tracking on section labels (uppercase, letter-spaced).
- Accent pills:
  - Fact → emerald
  - Interpretation → indigo
  - Gap/Assumption → amber
- Risk panel uses amber-tinted border + subtle warning glow to read as "alert."
- Icons via `lucide-react`: `ShieldCheck`, `FileText`, `Presentation`, `Send`, `AlertTriangle`, `CircleHelp`, `Eye`, `ScrollText`, `UserCog`.

### Behavior

- Email dispatcher: clicking "Send Report Package" sets local `isSending` → button label becomes "Dispatching reports via backend pipelines…" with spinner; after ~1.5s, `toast.success("Compliance artifacts successfully emailed to recipient.")` and input clears. Basic email regex validation; invalid → `toast.error`.
- PDF / PPT buttons: stub handlers that toast "Preparing export…" (no actual file generation — not requested).
- Sticky dock: `sticky bottom-0` with backdrop blur; advisory footnote sits below as a thin fixed strip.

### Mock Content

Realistic placeholder copy for an unspecified AI product (use `[Product Name TBD]`), populated for all three governance sub-sections, several uncertainty flags, and 4–6 open action items so the page feels substantive.

### Out of Scope

- No real backend, no PDF/PPT generation, no actual email send.
- No routing to other pages.
- No auth.