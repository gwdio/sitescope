# SiteScope — Spec 2: Backend & Agent

## API server and Subconscious agent configuration

**Depends on:** Spec 1 (Data Contract) for schema, `answerFormat`, API surface, and environment variables.

---

## 1. Responsibilities

1. Accept a screening request (user requirements string) via `POST /api/screen`.
2. Call the Subconscious SDK with the agent prompt, tool configuration, and structured output schema.
3. Return the validated `SiteScreeningDossier` JSON to the client.
4. Handle errors and timeouts gracefully.
5. Serve hardcoded mock data via `GET /api/screen/mock` for offline development.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js 20+ | Required by Subconscious SDK |
| Framework | Express _or_ Next.js API routes | Next.js simplifies deployment if frontend is also Next |
| SDK | `subconscious` (npm) | `npm install subconscious` |
| Auth | API key in env var | `SUBCONSCIOUS_API_KEY` — never exposed to client |

---

## 3. Agent Configuration

### 3.1 Engine

`tim-gpt` — recommended default. Good balance of reasoning and speed. Multi-hop tool use supports chaining 20–30 searches in one run.

### 3.2 Tools

All platform-hosted. No custom tool endpoints for the hackathon.

```js
const TOOLS = [
  { type: "platform", id: "web_search" },    // deep web research
  { type: "platform", id: "news_search" },    // community opposition, recent developments
  { type: "platform", id: "google_search" },  // government sites, utility filings, incentive programs
  { type: "platform", id: "company_search" }, // developer activity, who's building where
];
```

### 3.3 SDK Call Options

```js
{ awaitCompletion: true }  // block until the agent finishes
```

### 3.4 Timeout

Server-side timeout of 120 seconds. If the SDK call hasn't resolved, abort and return HTTP 504.

### 3.5 Structured Output

Pass the `answerFormat` JSON object from Spec 1 §3 verbatim. The SDK constrains the model's output to this schema.

---

## 4. Agent Prompt

Replace `{{requirements}}` with the user-submitted string at call time.

```text
You are SiteScope, a data center site screening analyst. Your job is to
produce a preliminary market screening dossier for a data center
development team.

The user will provide their requirements. Research and rank 3-5 candidate
US markets that best fit those requirements.

## Research Process

Follow this sequence for thorough, multi-source analysis:

1. POWER & GRID: Search for current power availability, utility capacity,
   interconnection queue status, and grid infrastructure in candidate
   regions. Look for recent utility announcements, substation projects,
   and grid expansion plans. Note any markets where interconnection
   timelines exceed the user's target.

2. COMMUNITY SENTIMENT: Search news for data center opposition,
   moratoriums, zoning battles, canceled projects, and community protests
   in each candidate market. Also search for markets where local officials
   have been publicly supportive.

3. TAX & INCENTIVES: Search for state-level data center tax exemptions
   (especially sales/use tax on equipment), property tax abatements, and
   economic development incentive programs.

4. NATURAL HAZARDS & CLIMATE: Assess flood risk, seismic activity,
   wildfire exposure, tornado/hurricane corridors, and ambient climate
   conditions. Note water availability concerns in arid regions.

5. CONNECTIVITY: Check for proximity to major internet exchange points,
   carrier-neutral facilities, and diverse fiber routes.

6. RECENT DEVELOPMENT ACTIVITY: Search for which operators and developers
   are active in each market, recent project announcements, and any
   large-scale campus developments underway or planned.

7. REGULATORY & POLITICAL LANDSCAPE: Search for pending legislation
   affecting data centers, recent zoning changes, utility rate
   restructuring for large loads, and the general political posture
   toward data center development.

## Important Guidelines

- Focus on CURRENT information (2025-2026). The data center landscape is
  changing rapidly and older information may be outdated.
- Clearly distinguish between established primary markets (NoVA, Phoenix,
  Dallas) and emerging secondary/tertiary markets. Secondary markets may
  offer better power availability but less fiber infrastructure.
- Be honest about limitations. Specific MW availability at a given
  substation requires direct utility engagement. Community sentiment from
  news coverage captures public signals but not private negotiations.
- For each market, identify what the development team should investigate
  NEXT — this dossier is a screening tool, not a final recommendation.
- Rank markets by overall viability considering ALL factors weighted by
  the user's stated priorities.
- Always flag markets where recent events (moratoriums, cancellations,
  political shifts) make them riskier than they might appear on paper.

## User Requirements
{{requirements}}
```

---

## 5. Server Implementation (Reference)

```js
// server.js — Express
import express from "express";
import { Subconscious } from "subconscious";

const app = express();
app.use(express.json());

const client = new Subconscious({
  apiKey: process.env.SUBCONSCIOUS_API_KEY,
});

const AGENT_PROMPT = `...`; // Full text from §4
const ANSWER_FORMAT = { /* ... */ }; // answerFormat from Spec 1 §3

// ── Live endpoint ──────────────────────────────────────
app.post("/api/screen", async (req, res) => {
  const { requirements } = req.body;
  if (!requirements?.trim()) {
    return res.status(400).json({ error: "requirements_missing" });
  }

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), 120_000)
  );

  try {
    const run = await Promise.race([
      client.run({
        engine: "tim-gpt",
        input: {
          instructions: AGENT_PROMPT.replace("{{requirements}}", requirements),
          tools: [
            { type: "platform", id: "web_search" },
            { type: "platform", id: "news_search" },
            { type: "platform", id: "google_search" },
            { type: "platform", id: "company_search" },
          ],
          answerFormat: ANSWER_FORMAT,
        },
        options: { awaitCompletion: true },
      }),
      timeout,
    ]);

    const dossier = run.result?.answer;
    if (!dossier?.candidate_markets) {
      return res.status(502).json({
        error: "agent_failure",
        detail: "Response missing required fields",
      });
    }

    return res.json(dossier);
  } catch (err) {
    if (err.message === "timeout") {
      return res.status(504).json({ error: "agent_timeout" });
    }
    return res.status(502).json({
      error: "agent_failure",
      detail: err.message,
    });
  }
});

// ── Mock endpoint ──────────────────────────────────────
app.get("/api/screen/mock", (_req, res) => {
  res.json(MOCK_DOSSIER); // Hardcoded object conforming to schema
});

app.listen(3001);
```

---

## 6. Mock Data

Provide a hardcoded `MOCK_DOSSIER` object conforming to the `SiteScreeningDossier` schema with 4 candidate markets and 2 markets to avoid. Use realistic but clearly fictional data. This serves two purposes:

1. Frontend development without a live Subconscious connection.
2. Demo fallback if the agent call fails during a live presentation.

The mock is served at `GET /api/screen/mock` and also importable as a JS module for the frontend's `NEXT_PUBLIC_USE_MOCK=true` mode.

---

## 7. Acceptance Criteria

- [ ] `POST /api/screen` accepts a requirements string and returns a valid `SiteScreeningDossier`.
- [ ] Response conforms to Spec 1 §2 schema — all `required` fields present, enums valid.
- [ ] Returns 400 on empty/missing input.
- [ ] Returns 502 on agent failure or malformed response.
- [ ] Returns 504 on timeout (>120s).
- [ ] `GET /api/screen/mock` returns hardcoded test data conforming to the schema.
- [ ] `SUBCONSCIOUS_API_KEY` is read from environment, never hardcoded or exposed to the client.