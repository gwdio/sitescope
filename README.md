# SiteScope

**AI-Powered Data Center Site Screening**

SiteScope compresses data center site selection screening from weeks of manual consultant work into a single API call. Given a set of requirements, it researches candidate markets across seven dimensions — power availability, community sentiment, tax incentives, natural hazards, connectivity, recent development activity, and regulatory landscape — and produces a structured, ranked market dossier with actionable signal ratings.

Built on the [Subconscious](https://subconscious.ai) platform using the TIM-CLAUDE engine. Subconscious Hackathon 2026.

---

## Why This Exists

The data center sector is mid-supercycle. Roughly 100 GW of new capacity is expected online by 2030, with over $500B spent on data centers in 2025 alone. The bottleneck is not capital — it's the ability to evaluate sites fast enough.

Site selection now requires screening 30+ candidate markets simultaneously across power, permitting, community sentiment, incentives, and hazard exposure. That process typically takes 2–4 weeks for preliminary screening, relying on multiple consulting firms before any on-the-ground engagement begins.

Community opposition has become the single largest project risk: $98B in planned data center investment was blocked or delayed in Q2 2025 alone, with 25 projects canceled due to local opposition — quadrupling from the prior year. Anti-data-center groups are active in at least 24 US states.

SiteScope replaces the first two weeks of that process. It doesn't replace the consultant — it replaces the manual research phase that precedes on-the-ground engagement.

---

## How It Works

**Input:** Natural language requirements — capacity (MW), timeline, geography, workload type, cooling preferences, priority weighting.

**Research:** The agent chains 20–30 searches across fragmented sources (web, news, Google, company filings) to research each candidate market across seven dimensions:

- **Power & Grid** — utility capacity, interconnection queue status, grid expansion plans, time-to-energize
- **Community Sentiment** — opposition groups, moratoriums, zoning battles, canceled projects
- **Tax & Incentives** — equipment tax exemptions, property abatements, state economic development programs
- **Natural Hazards** — flood zones, seismic risk, wildfire exposure, water availability, cooling advantage
- **Connectivity** — internet exchange proximity, carrier-neutral facilities, fiber route diversity
- **Recent Development Activity** — active operators, project announcements, campus builds underway
- **Regulatory & Political Landscape** — pending legislation, zoning changes, utility rate restructuring

**Output:** A structured JSON dossier with:
- Executive summary and top recommendation
- 3–5 ranked candidate markets with signal ratings (favorable / mixed / constrained, etc.) across all dimensions
- Per-market narrative, key risks, and recommended next steps
- Markets to avoid with specific reasons
- Methodology note disclosing sources and limitations

---

## Quick Start

**Prerequisites:** Python 3.11+, Node 18+, `SUBCONSCIOUS_API_KEY`

```bash
cp .env.example .env       # add your SUBCONSCIOUS_API_KEY
make install               # install backend and frontend dependencies
make dev                   # start both servers
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:8000      |
| API docs | http://localhost:8000/docs |

### Mock mode

To develop without an API key, set `VITE_USE_MOCK=true` in `frontend/.env.local`. During a loading state, press `=` or `-` to load one of two hardcoded demo dossiers.

---

## Architecture

**Backend:** FastAPI + uvicorn. Three endpoints: `POST /api/screen` (trigger run, returns `run_id`), `GET /api/screen/{run_id}` (poll status), `GET /api/screen/mock` (hardcoded demo dossier). Agent output is validated server-side against a Pydantic `SiteScreeningDossier` model before returning to the client.

**AI:** Subconscious SDK — one `client.run()` call with `engine="tim-claude"`, four platform tools, and a typed `answerFormat` schema. Subconscious handles orchestration, tool execution, and context management. 900s timeout.

**Frontend:** React 18 + TypeScript + Vite. Three-state view machine (`input → loading → dossier`) with 2-second polling. Split-panel dossier view: left panel shows a signal matrix (markets × dimensions, color-coded dots) for quick comparison; right panel shows full market detail. No external component library.

```
src/
  App.tsx           — view state machine
  components/
    InputView       — requirements form
    LoadingView     — polling status
    DossierView     — split-panel layout
    LeftPanel       — executive summary + signal matrix
    RightPanel      — market detail, risks, next steps
  lib/
    api.ts          — startScreening / pollScreening
    types.ts        — Dossier / CandidateMarket interfaces
    signals.ts      — signal enum → label / color
    mockData.ts     — demo dossier #1
    mockData2.ts    — demo dossier #2
```

---

## Limitations

SiteScope is a screening tool, not a final recommendation engine. It explicitly discloses:

- **Parcel-level availability** requires broker engagement — the agent cannot access title, easements, or Phase I environmental data.
- **Specific substation capacity** requires direct utility engagement — general grid signals are researchable; exact MW available at a given point of interconnection is not.
- **Gated data sources** — ISO interconnection queue databases behind paywalls, proprietary utility GIS layers, and detailed FEMA mapping tools are not accessible via web search.
- **Private negotiations** — community sentiment from news coverage captures public signals, not backroom relationships or back-channel opposition.

The agent frames its output as a screening layer that identifies where to focus human engagement — not a replacement for it.
