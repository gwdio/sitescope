# SiteScope

AI-powered data center site screening agent. Takes requirements, returns ranked market dossier.

## Stack

- **Backend**: Python / FastAPI (`backend/`)
- **Frontend**: React + Vite + TypeScript (`frontend/`)
- **AI**: Subconscious SDK (`subconscious-sdk`) — engine `tim-claude`

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

Tone: established enterprise tooling — Bloomberg Terminal meets consulting deliverable. Not SaaS, not startup dashboard.

- **Background**: `#FAFAF9` (warm off-white, like paper)
- **Surface**: `#F3F2EE` (cards, panels)
- **Border**: `#E5E4DF`
- **Text**: `#1A1A18` / `#6B6B66` / `#9C9C96`
- **Accent**: `#2A5F2E` (dark green — branding, CTAs)

No gradients, no glows. Borders do structural work, not shadows.

**Signal colors:**

| Signal | Text | Background |
|--------|------|------------|
| Favorable / Supportive / Strong / Low Risk | `#1A7A3A` | `#E8F5EC` |
| Mixed / Moderate | `#92600E` | `#FDF6E3` |
| Constrained / Hostile / Weak / High Risk | `#A3261B` | `#FDEEED` |

No emoji. Signals communicated via colored text labels + 8px dot indicators.

**Fonts:** serif display (Fraunces/Newsreader) + humanist sans (Instrument Sans/Satoshi) + monospace (JetBrains Mono) for labels/metadata.

### Layout

Split-panel, max-width 1120px centered:

```
┌─────────────────────────────────────────┐
│  Header (52px) — name · query params · Export button  │
├──────────────────┬──────────────────────┤
│  Left (420px)    │  Right (flex, scroll) │
│  fixed           │                       │
│  · Summary       │  · Selected market    │
│  · Signal matrix │    detail (all dims)  │
│  · Avoid list    │  · Risks              │
│                  │  · Next steps         │
├──────────────────┴──────────────────────┤
│  Footer (methodology note)              │
└─────────────────────────────────────────┘
```

Left panel signal matrix: markets as rows, dimensions (Power/Community/Incentives/Hazards) as columns with dot indicators. Row click selects market → updates right panel. Selected row: 3px left border in accent green.

Right panel market detail order: Power & Grid → Community Sentiment → Tax & Incentives → Natural Hazards → Connectivity → Recent Activity → Key Risks (amber) → Next Steps (green card `#F0FAF2`).

### Input State

Before dossier loads: centered card, `<textarea>` pre-filled with demo requirements, "Run Screening" button (accent green). Loading: plain text "Researching markets..." — no animation needed.

### Export

Header button → downloads `SiteScope_Dossier_YYYY-MM-DD.html`. Self-contained HTML (inline CSS + Google Fonts links). Linear scroll layout — build from template literal, not DOM clone. Includes `@media print` with `page-break-before: always` per market section.

### File Structure

```
src/
  App.tsx            — input / loading / dossier view routing
  DossierView.tsx    — split-panel display
  ExportDossier.ts   — HTML template + download trigger
  mockData.ts        — hardcoded fallback dossier
  signals.ts         — signal → color/label map
```


### Do Not Build

- Auth, saved history, editable fields, map visualization, dark mode, animations beyond hover
