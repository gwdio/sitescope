# SiteScope — Spec 3: Frontend UI

## React application layout, components, and interactions

**Depends on:** Spec 1 (Data Contract) for schema, signal maps, design tokens, and environment variables.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18+ with Vite and TypeScript |
| Styling | CSS Modules or inline styles — no utility framework. All values from Spec 1 design tokens. |
| Fonts | Google Fonts: `Fraunces` (serif display), `Instrument Sans` (body), `JetBrains Mono` (mono) |
| State | `useState` / `useReducer` — no external state library |
| HTTP | `fetch` — no Axios needed for a single endpoint |

---

## 2. Application States

Three mutually exclusive views. State machine: `input → loading → dossier`. Page reload resets to `input`.

| State | Trigger | View |
|---|---|---|
| `input` | Initial load | Centered input card (§4) |
| `loading` | Form submitted | Centered loading indicator (§5) |
| `dossier` | Data received | Split-panel dossier view (§6) |

---

## 3. Outer Container

`max-width: 1120px`, centered, `min-height: 100vh`, `background: var(--bg-page)`.

---

## 4. Input View

Centered card on `var(--bg-page)` background. `max-width: 520px`.

| Element | Spec |
|---|---|
| Title | "SiteScope" — `--font-display`, 28px, weight 700, `var(--text-primary)` |
| Subtitle | "Market Screening" — `--font-body`, 14px, `var(--text-secondary)` |
| Textarea | `background: var(--bg-surface)`, `border: 1px solid var(--border)`, `--font-body` 14px, 6 rows, `border-radius: 4px`, `padding: 12px` |
| Pre-fill | Demo scenario text from Spec 1 §8 |
| Submit button | `background: var(--accent)`, `color: #FFF`, `--font-body` 13px, weight 600, `border-radius: 3px`, `padding: 10px 24px`. Hover: slight darken. Label: "Run Screening" |

On submit: POST to `${import.meta.env.VITE_API_URL}/api/screen` with `{ requirements }`. If `import.meta.env.VITE_USE_MOCK === "true"`, fetch from `/api/screen/mock` or load the local `mockData.ts` object instead. Transition to loading state.

---

## 5. Loading View

Same centered layout as input. Replace card content with:

- "Researching markets..." — `--font-body`, 15px, `var(--text-tertiary)`.
- Optional: single pulsing dot animation (CSS only, `1s ease-in-out infinite`).
- No progress bar, no spinner, no elaborate animation.

---

## 6. Dossier View — Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header Bar (§6.1)                                       │
├──────────────────────┬──────────────────────────────────┤
│  Left Panel (§6.2)   │  Right Panel (§6.3)               │
│  420px, fixed         │  flex: 1, scrollable              │
├──────────────────────┴──────────────────────────────────┤
│  Footer (§6.4)                                           │
└─────────────────────────────────────────────────────────┘
```

### 6.1 Header Bar

Height: 52px. Flex row, `align-items: center`, `justify-content: space-between`. Bottom border: `1px solid var(--border)`.

**Left cluster:**
- "SiteScope" — `--font-mono`, 14px, weight 600, `var(--accent)`.
- Vertical divider: 1px wide, 16px tall, `var(--border)`, 12px horizontal margin.
- "Market Screening Dossier" — `--font-body`, 12px, `var(--text-secondary)`.

**Right cluster:**
- Query params string: `{capacity} · {regions} · {timeline} · {workload}` — `--font-mono`, 11px, `var(--text-tertiary)`.
- Export button (see Spec 4).

### 6.2 Left Panel

Width: 420px, `flex-shrink: 0`, no independent scroll (content fits viewport). Padding: 24px.

#### Executive Summary

- Label: "SUMMARY" — `--font-mono`, 10px, uppercase, `letter-spacing: 0.08em`, `var(--text-tertiary)`.
- Body: `--font-body`, 13px, `var(--text-secondary)`, `line-height: 1.7`.
- Container: `background: var(--bg-surface)`, `padding: 16px`, `border-radius: 4px`.
- Bottom margin: 24px.

#### Signal Matrix

Interactive table. Markets as rows, dimensions as columns.

**Column headers:** `Power`, `Community`, `Incentives`, `Hazards` — `--font-mono`, 10px, uppercase, `var(--text-tertiary)`, centered.

**Row structure:**

| Element | Spec |
|---|---|
| Market name | `--font-body`, 14px, weight 600, `var(--text-primary)` |
| Region subtitle | 11px, `var(--text-tertiary)`, below market name. Use `parseMarketName()` from Spec 1 §6 |
| Signal cells | 8px filled circle, color from `SIGNAL_COLORS` map, centered. `title` attribute shows label on hover |
| Row (unselected) | `padding: 12px`, transparent bg, `border-left: 3px solid transparent`, `border-bottom: 1px solid var(--border)` |
| Row (selected) | `border-left: 3px solid var(--accent)`, `background: var(--bg-surface)` |
| Interaction | `cursor: pointer`. Entire row clickable. On click: update `selectedMarketIndex` state |

Signal columns map to these fields on each `CandidateMarket`:
- Power → `market.power.signal`
- Community → `market.community_sentiment.signal`
- Incentives → `market.tax_and_incentives.signal`
- Hazards → `market.natural_hazards.signal`

#### Deprioritize Section

- Top separator: `border-top: 1px solid var(--border)`, `margin-top: 24px`, `padding-top: 24px`.
- Label: "DEPRIORITIZE" — `--font-mono`, 10px, uppercase, `var(--signal-red-text)`.
- Each entry: market name (`--font-body`, 13px, weight 600, `var(--signal-red-text)`) + ` — ` + reason (12px, `var(--text-secondary)`).

### 6.3 Right Panel

`flex: 1`, `overflow-y: auto`, `padding: 24px`. Content driven by `selectedMarketIndex` (default: `0`).

#### Market Header

- Rank: `--font-mono`, 32px, weight 700, `#C8C8C2`. Display as `#1`.
- Name: `--font-display`, 22px, weight 700, `var(--text-primary)`.
- Region: 13px, `var(--text-tertiary)`, italic. (from `parseMarketName()`)
- Viability badge: inline pill, `border-radius: 3px`, `padding: 2px 8px`, 11px, weight 600, uppercase. Background and text color from `VIABILITY` map → `SIGNAL_COLORS`.

#### Dimension Blocks

Repeat for each dimension in this order:

1. **Power & Grid** — `market.power`
2. **Community Sentiment** — `market.community_sentiment`
3. **Tax & Incentives** — `market.tax_and_incentives`
4. **Natural Hazards** — `market.natural_hazards`
5. **Connectivity** — `market.connectivity` (no signal)
6. **Recent Activity** — `market.recent_activity` (no signal)

Per block:

| Element | Spec |
|---|---|
| Label | `--font-mono`, 11px, uppercase, `var(--text-tertiary)`, `letter-spacing: 0.06em` |
| Signal indicator | 8px dot + label text (`--font-mono`, 11px, signal color), 8px gap. Inline, right of label. **Omit entirely** for Connectivity and Recent Activity |
| Summary text | `--font-body`, 13px, `var(--text-secondary)`, `line-height: 1.7`. Flush left, no indent |
| Block spacing | `margin-bottom: 20px` |

For dimensions 1–4, the signal dot color and label text come from `SIGNALS[market.{dimension}.signal]`.

For dimensions 5–6, render label + summary text only — no dot, no signal label.

#### Key Risks

- Label: "KEY RISKS" — `--font-mono`, 11px, uppercase, `var(--signal-amber-text)`, `letter-spacing: 0.06em`.
- Each risk: prefixed with ` — `, 13px, `var(--signal-amber-text)`, `line-height: 1.6`.
- Left border per risk line: `2px solid #92600E33`, `padding-left: 12px`.

#### Next Steps

- Card: `background: var(--accent-light)`, `border: 1px solid #C6E7CD`, `border-radius: 4px`, `padding: 14px 16px`.
- Label: "RECOMMENDED NEXT STEPS" — `--font-mono`, 11px, `var(--accent)`, uppercase.
- Body: 13px, `#1A6B32`, `line-height: 1.6`.

### 6.4 Footer

- `border-top: 1px solid var(--border)`, `padding: 16px 24px`.
- Label: "METHODOLOGY" — `--font-mono`, 10px, uppercase, `var(--text-tertiary)`.
- Body: `--font-body`, 12px, `var(--text-tertiary)`, `line-height: 1.6`.

---

## 7. Interaction Behavior

- Clicking a signal matrix row updates `selectedMarketIndex`. The right panel re-renders immediately. No transition animation needed, but no layout flash either.
- First market (`index: 0`) is selected by default on dossier load.
- Tooltips on signal dots: plain browser `title` attribute. No custom tooltip component.
- No keyboard navigation required for hackathon scope.

---

## 8. Component Breakdown (Optional)

Single-file implementation is acceptable. If splitting:

```
frontend/src/
  App.tsx              — state machine (input → loading → dossier)
  components/
    InputView.tsx      — textarea + submit
    LoadingView.tsx    — "Researching markets..." indicator
    DossierView.tsx    — split-panel shell
    LeftPanel.tsx      — summary + matrix + deprioritize
    RightPanel.tsx     — market detail, dimension blocks, risks, next steps
    SignalDot.tsx      — 8px colored circle + tooltip
    ViabilityBadge.tsx — colored pill
  lib/
    signals.ts         — SIGNALS, SIGNAL_COLORS, VIABILITY maps (from Spec 1)
    api.ts             — fetch wrapper for POST /api/screen
    parseMarketName.ts — region parsing utility (from Spec 1)
  styles/
    tokens.css         — CSS custom properties (from Spec 1)
  mockData.ts          — fallback dossier (from Spec 2 §7)
  ExportDossier.ts     — HTML template + download (from Spec 4)
```

---

## 9. Acceptance Criteria

### Input View
- [ ] Renders centered card with textarea pre-filled with demo text.
- [ ] Submit calls `POST /api/screen` (or loads mock when `VITE_USE_MOCK=true`).
- [ ] Loading state displays "Researching markets..." text.

### Dossier View
- [ ] Split-panel layout: 420px left panel, flex right panel.
- [ ] Executive summary renders in surface-colored card.
- [ ] Signal matrix displays all candidate markets with colored dots in correct columns.
- [ ] Clicking a matrix row updates the right panel to show that market's details.
- [ ] First market is selected by default.
- [ ] All six dimension blocks render with correct labels, signals (where applicable), and summaries.
- [ ] Connectivity and Recent Activity render without signal dots.
- [ ] Key risks render with amber styling and em-dash prefix.
- [ ] Next steps render in green card.
- [ ] Deprioritize section renders below matrix with red-styled entries.
- [ ] Methodology note renders in footer.

### Design Fidelity
- [ ] No pure white (`#FFF`) backgrounds in app view.
- [ ] All text uses specified font families (Fraunces, Instrument Sans, JetBrains Mono).
- [ ] No emoji anywhere in the interface.
- [ ] No shadows beyond 1–2px subtle elevation. Borders do structural work.
- [ ] Signal colors match the defined palette exactly.
