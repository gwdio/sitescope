# SiteScope — Spec 1: Data Contract & Design Tokens

## Shared reference for frontend and backend developers

---

## 1. System Overview

SiteScope is a single-page React application backed by a Node.js API layer. A user submits data center site requirements via a form; the backend dispatches an AI research agent (Subconscious SDK, `tim-gpt` engine) that performs multi-hop web searches and returns a structured JSON dossier. The frontend renders this dossier in an interactive split-panel view and offers an HTML export.

```
┌──────────────┐       ┌──────────────┐       ┌─────────────────┐
│   Browser    │──POST──▶  API Server  │──SDK──▶  Subconscious   │
│  (React SPA) │◀─JSON──│  (Node/Express│◀─────│  (tim-gpt)      │
│              │        │   or Next.js) │       │  + tool suite   │
└──────────────┘       └──────────────┘       └─────────────────┘
```

**Related specs:** Backend & Agent (Spec 2), Frontend UI (Spec 3), Export (Spec 4).

---

## 2. TypeScript Schema

```typescript
interface SiteScreeningDossier {
  executive_summary: string;

  candidate_markets: CandidateMarket[];

  markets_to_avoid: {
    market_name: string;
    reason: string;
  }[];

  methodology_note: string;
}

interface CandidateMarket {
  rank: number;                          // 1 = best
  market_name: string;                   // e.g. "Central Texas (Austin–San Antonio Corridor)"
  overall_viability: "strong" | "moderate" | "cautious";

  power: {
    summary: string;
    signal: "favorable" | "mixed" | "constrained";
  };

  community_sentiment: {
    summary: string;
    signal: "supportive" | "mixed" | "hostile";
  };

  tax_and_incentives: {
    summary: string;
    signal: "strong_incentives" | "moderate_incentives" | "weak_incentives";
  };

  natural_hazards: {
    summary: string;
    signal: "low_risk" | "moderate_risk" | "high_risk";
  };

  connectivity: string;                  // No signal enum — text only
  recent_activity: string;               // No signal enum — text only

  key_risks: string[];                   // 2–3 items
  next_steps: string;
}
```

---

## 3. `answerFormat` (Subconscious SDK)

This JSON object is passed as the `answerFormat` field in the SDK `run()` call. It mirrors §2 exactly. Backend copies this verbatim; frontend uses it as a validation reference.

```json
{
  "type": "object",
  "title": "SiteScreeningDossier",
  "properties": {
    "executive_summary": {
      "type": "string",
      "description": "2-3 sentence overview of screening results and top recommendation"
    },
    "candidate_markets": {
      "type": "array",
      "description": "Ranked list of 3-5 candidate markets, best first",
      "items": {
        "type": "object",
        "properties": {
          "rank": { "type": "integer", "description": "1 = best candidate" },
          "market_name": { "type": "string", "description": "Metro area or region name" },
          "overall_viability": {
            "type": "string",
            "enum": ["strong", "moderate", "cautious"]
          },
          "power": {
            "type": "object",
            "properties": {
              "summary": { "type": "string" },
              "signal": { "type": "string", "enum": ["favorable", "mixed", "constrained"] }
            },
            "required": ["summary", "signal"]
          },
          "community_sentiment": {
            "type": "object",
            "properties": {
              "summary": { "type": "string" },
              "signal": { "type": "string", "enum": ["supportive", "mixed", "hostile"] }
            },
            "required": ["summary", "signal"]
          },
          "tax_and_incentives": {
            "type": "object",
            "properties": {
              "summary": { "type": "string" },
              "signal": { "type": "string", "enum": ["strong_incentives", "moderate_incentives", "weak_incentives"] }
            },
            "required": ["summary", "signal"]
          },
          "natural_hazards": {
            "type": "object",
            "properties": {
              "summary": { "type": "string" },
              "signal": { "type": "string", "enum": ["low_risk", "moderate_risk", "high_risk"] }
            },
            "required": ["summary", "signal"]
          },
          "connectivity": { "type": "string" },
          "recent_activity": { "type": "string" },
          "key_risks": { "type": "array", "items": { "type": "string" } },
          "next_steps": { "type": "string" }
        },
        "required": [
          "rank", "market_name", "overall_viability", "power",
          "community_sentiment", "tax_and_incentives", "natural_hazards",
          "connectivity", "recent_activity", "key_risks", "next_steps"
        ]
      }
    },
    "markets_to_avoid": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "market_name": { "type": "string" },
          "reason": { "type": "string" }
        },
        "required": ["market_name", "reason"]
      }
    },
    "methodology_note": { "type": "string" }
  },
  "required": [
    "executive_summary", "candidate_markets",
    "markets_to_avoid", "methodology_note"
  ]
}
```

---

## 4. Signal Configuration Map

Shared between the frontend UI and the export template. Keyed by the enum values from the API response.

```js
const SIGNALS = {
  // Power
  favorable:          { label: "Favorable",         color: "green" },
  mixed:              { label: "Mixed",             color: "amber" },
  constrained:        { label: "Constrained",       color: "red"   },

  // Community
  supportive:         { label: "Supportive",        color: "green" },
  // "mixed" — already defined above, reuse
  hostile:            { label: "Hostile",            color: "red"   },

  // Incentives
  strong_incentives:  { label: "Strong Incentives", color: "green" },
  moderate_incentives:{ label: "Moderate",          color: "amber" },
  weak_incentives:    { label: "Weak Incentives",   color: "red"   },

  // Hazards
  low_risk:           { label: "Low Risk",          color: "green" },
  moderate_risk:      { label: "Moderate Risk",     color: "amber" },
  high_risk:          { label: "High Risk",         color: "red"   },
};

const SIGNAL_COLORS = {
  green: { text: "var(--signal-green-text)", bg: "var(--signal-green-bg)" },
  amber: { text: "var(--signal-amber-text)", bg: "var(--signal-amber-bg)" },
  red:   { text: "var(--signal-red-text)",   bg: "var(--signal-red-bg)"   },
};
```

### Viability Badge Map

```js
const VIABILITY = {
  strong:   { label: "Strong Candidate",       color: "green" },
  moderate: { label: "Moderate Candidate",     color: "amber" },
  cautious: { label: "Approach with Caution",  color: "red"   },
};
```

---

## 5. Design Tokens (CSS Custom Properties)

Defined on `:root`. Every color, spacing, and font reference in the UI and export template must use these — no hardcoded values in component code.

```css
:root {
  /* Backgrounds */
  --bg-page:      #FAFAF9;
  --bg-surface:   #F3F2EE;
  --bg-white:     #FFFFFF; /* export doc only */

  /* Borders */
  --border:       #E5E4DF;

  /* Text */
  --text-primary:   #1A1A18;
  --text-secondary: #6B6B66;
  --text-tertiary:  #9C9C96;

  /* Signals — green */
  --signal-green-text: #1A7A3A;
  --signal-green-bg:   #E8F5EC;

  /* Signals — amber */
  --signal-amber-text: #92600E;
  --signal-amber-bg:   #FDF6E3;

  /* Signals — red */
  --signal-red-text: #A3261B;
  --signal-red-bg:   #FDEEED;

  /* Accent */
  --accent:       #2A5F2E;
  --accent-light: #F0FAF2;

  /* Typography */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body:    'Instrument Sans', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Courier New', monospace;

  /* Spacing (base 4px) */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-12: 48px;
}
```

### Design Rules

- No pure white (`#FFF`) backgrounds in the app view. Use `--bg-page` (off-white).
- No emoji anywhere in the interface. Signal status uses colored text labels and dots.
- No gradients, no glows, no shadows beyond 1–2px subtle elevation. Borders do structural work.
- Fonts loaded via Google Fonts: `Fraunces` (serif display), `Instrument Sans` (body), `JetBrains Mono` (mono).

---

## 6. Utility: Region Parsing

The API returns `market_name` as a freeform string. The frontend should extract a region subtitle by splitting on the first parenthesis or comma.

```js
function parseMarketName(raw) {
  const parenMatch = raw.match(/^(.+?)\s*\((.+)\)$/);
  if (parenMatch) return { name: parenMatch[1].trim(), region: parenMatch[2].trim() };
  const commaMatch = raw.match(/^(.+?),\s*(.+)$/);
  if (commaMatch) return { name: commaMatch[1].trim(), region: commaMatch[2].trim() };
  return { name: raw, region: null };
}
```

---

## 7. API Surface Summary

| Endpoint | Method | Request | Response |
|---|---|---|---|
| `/api/screen` | POST | `{ "requirements": string }` | `SiteScreeningDossier` (200) or error (400/502/504) |
| `/api/screen/mock` | GET | — | Hardcoded `SiteScreeningDossier` (200) |

Error shapes:

| Code | Body |
|---|---|
| 400 | `{ "error": "requirements_missing" }` |
| 502 | `{ "error": "agent_failure", "detail": "<message>" }` |
| 504 | `{ "error": "agent_timeout" }` |

---

## 8. Demo Pre-fill Text

Default textarea value for the input view:

```text
50MW hyperscale facility. US Sun Belt or Midwest. Grid-ready within 24 months. AI training and inference workload at 40-50kW per rack. Power availability and speed-to-energize are the top priorities, followed by community receptiveness, then tax incentives. Prefer low water dependency. Renewable energy access is a plus but not required.
```

---

## 9. Environment Variables

| Variable | Required | Owner | Description |
|---|---|---|---|
| `SUBCONSCIOUS_API_KEY` | Yes | Backend | Agent SDK authentication |
| `NEXT_PUBLIC_API_URL` | Yes | Frontend | Backend URL, e.g. `http://localhost:3001` |
| `NEXT_PUBLIC_USE_MOCK` | No | Frontend | Set `true` to bypass backend and use mock data |

---

## 10. Out of Scope

Do not build any of the following:

- User authentication or accounts
- Saved dossier history or persistence
- Editable dossier fields
- Map visualization
- Dark mode
- Multi-dossier comparison beyond the signal matrix
- Animations beyond hover states and selection highlight
- Responsive layouts below 1280px (collapse to single-column tabbed layout only if time permits)