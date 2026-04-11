# SiteScope

AI datacenter site screener. Input: requirements. Output: ranked market dossier.

## Stack

- Backend: Python / FastAPI (`backend/`)
- Frontend: React + Vite + TypeScript (`frontend/`)
- AI: Subconscious SDK (`subconscious-sdk`) — engine `tim-claude`

## Subconscious SDK (Python)

```python
from subconscious import Subconscious
import os

client = Subconscious(api_key=os.environ.get("SUBCONSCIOUS_API_KEY"))

run = client.run(
    engine="tim-claude",
    input={
        "instructions": "...",
        "tools": [
            {"type": "platform", "id": "web_search"},
            {"type": "platform", "id": "news_search"},
            {"type": "platform", "id": "google_search"},
            {"type": "platform", "id": "company_search"},
        ],
        "answerFormat": { ... }  # SiteScreeningDossier schema
    },
    options={"await_completion": True},
)
dossier = run.result.answer
```

## Data Contract

```typescript
interface Dossier {
  executive_summary: string;
  candidate_markets: Array<{
    rank: number;
    market_name: string;
    overall_viability: "strong" | "moderate" | "cautious";
    power: { summary: string; signal: "favorable" | "mixed" | "constrained" };
    community_sentiment: { summary: string; signal: "supportive" | "mixed" | "hostile" };
    tax_and_incentives: { summary: string; signal: "strong_incentives" | "moderate_incentives" | "weak_incentives" };
    natural_hazards: { summary: string; signal: "low_risk" | "moderate_risk" | "high_risk" };
    connectivity: string;
    recent_activity: string;
    key_risks: string[];
    next_steps: string;
  }>;
  markets_to_avoid: Array<{ market_name: string; reason: string }>;
  methodology_note: string;
}
```

## Frontend

### Design

Enterprise-dense. Paper feel, not SaaS. No gradients, no shadows, borders do structure.

**Palette:**
- `#FAFAF9` bg · `#F3F2EE` surface · `#E5E4DF` border
- `#1A1A18` text · `#6B6B66` secondary · `#9C9C96` tertiary
- `#2A5F2E` accent (green, CTAs)

**Signals:**

| | Text | Bg |
|---|---|---|
| Favorable / Supportive / Strong / Low Risk | `#1A7A3A` | `#E8F5EC` |
| Mixed / Moderate | `#92600E` | `#FDF6E3` |
| Constrained / Hostile / Weak / High Risk | `#A3261B` | `#FDEEED` |

No emoji. Signals = colored label + 8px dot.

**Fonts:** serif display (Fraunces/Newsreader) + sans body (Instrument Sans/Satoshi) + mono (JetBrains Mono) for labels/metadata.

### Layout

Max-width 1120px centered:

```
┌────────────────────────────────────────────────────────┐
│ Header (52px): SiteScope · query params · Export btn   │
├──────────────────┬─────────────────────────────────────┤
│ Left 420px fixed │ Right flex, scrollable              │
│ · Summary        │ · Market detail (all dims)          │
│ · Signal matrix  │ · Key risks (amber)                 │
│ · Avoid list     │ · Next steps (green card #F0FAF2)   │
├──────────────────┴─────────────────────────────────────┤
│ Footer: methodology note                               │
└────────────────────────────────────────────────────────┘
```

Signal matrix: markets = rows, dims (Power/Community/Incentives/Hazards) = cols, dot per cell. Click row → update right panel. Selected: 3px left border accent green.

Right panel dim order: Power → Community → Tax & Incentives → Natural Hazards → Connectivity → Recent Activity → Key Risks → Next Steps.

### States

**Input:** centered card, `<textarea>` pre-filled, "Run Screening" button (accent green).
**Loading:** "Researching markets..." plain text. No animation.
**Dossier:** split-panel view above.

### Export

Header btn → `SiteScope_Dossier_YYYY-MM-DD.html`. Self-contained (inline CSS + Google Fonts). Build from template literal, not DOM clone. `@media print` + `page-break-before: always` per market.

### Files

```
src/
  App.tsx          — view routing (input / loading / dossier)
  DossierView.tsx  — split-panel
  ExportDossier.ts — HTML template + download
  mockData.ts      — fallback dossier
  signals.ts       — signal → color/label map
```

Single file acceptable for hackathon.

### Skip

Auth, history, editable fields, map, dark mode, animations (hover OK).
