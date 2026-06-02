import type { Dossier } from "./types";

const BASE_URL = "https://api.subconscious.dev/v1";

const SYSTEM_PROMPT = `You are SiteScope, a data center site screening analyst.
Task: assess 3-5 candidate US markets for the user's requirements.

## Step 1 — Extract priority weights

Read the user's requirements and assign an integer weight (1–5) to each dimension reflecting how much the user cares about it. A dimension the user calls their top priority gets 5; one they don't mention or deprioritize gets 1. Output these as dimension_weights: { power, community, tax, hazards }.

## Step 2 — Research and assess each market

For each candidate market, research all dimensions and assign the correct signal. Be accurate — the signals drive the final ranking, so assess them honestly rather than trying to make a market look good.

Dimensions to research per market:
1. POWER & GRID: utility capacity, interconnection queues, speed-to-energize
2. COMMUNITY SENTIMENT: opposition news, moratoriums, zoning battles
3. TAX & INCENTIVES: state exemptions, property tax abatements, incentive programs
4. NATURAL HAZARDS: flood, seismic, wildfire, tornado/hurricane risk
5. CONNECTIVITY: fiber diversity, IXPs, carrier-neutral facilities
6. RECENT ACTIVITY: operator announcements, campus developments
7. REGULATORY: pending legislation, zoning changes, utility rate restructuring

## Step 3 — Set overall_viability honestly

- "strong": performs well on the user's top-weighted dimensions with no major blockers
- "moderate": mixed performance, or a significant weakness on a mid-priority dimension
- "cautious": a clear weakness on a high-priority dimension or a hard blocker

Do NOT try to rank the markets — omit the rank field entirely. The client will sort by weighted score.

## Other rules

- Prioritize 2025-2026 information
- Identify 1-3 markets to AVOID with specific reasons
- Be honest about limitations

Produce a JSON object matching the required schema.`;

const DOSSIER_SCHEMA = {
  type: "object",
  properties: {
    executive_summary: { type: "string" },
    candidate_markets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          market_name: { type: "string" },
          overall_viability: { type: "string", enum: ["strong", "moderate", "cautious"] },
          power: {
            type: "object",
            properties: {
              summary: { type: "string" },
              signal: { type: "string", enum: ["favorable", "mixed", "constrained"] },
            },
            required: ["summary", "signal"],
          },
          community_sentiment: {
            type: "object",
            properties: {
              summary: { type: "string" },
              signal: { type: "string", enum: ["supportive", "mixed", "hostile"] },
            },
            required: ["summary", "signal"],
          },
          tax_and_incentives: {
            type: "object",
            properties: {
              summary: { type: "string" },
              signal: {
                type: "string",
                enum: ["strong_incentives", "moderate_incentives", "weak_incentives"],
              },
            },
            required: ["summary", "signal"],
          },
          natural_hazards: {
            type: "object",
            properties: {
              summary: { type: "string" },
              signal: { type: "string", enum: ["low_risk", "moderate_risk", "high_risk"] },
            },
            required: ["summary", "signal"],
          },
          connectivity: {
            type: "string",
            description: "2-4 sentence prose summary covering fiber diversity, carrier count, IXP presence, cloud on-ramps, and representative latency figures.",
          },
          recent_activity: {
            type: "string",
            description: "2-4 sentence prose summary of operator announcements, major leases signed, campus expansions, or construction activity in the past 12-18 months.",
          },
          key_risks: { type: "array", items: { type: "string" } },
          next_steps: { type: "string" },
        },
        required: [
          "market_name", "overall_viability",
          "power", "community_sentiment", "tax_and_incentives", "natural_hazards",
          "connectivity", "recent_activity", "key_risks", "next_steps",
        ],
      },
    },
    markets_to_avoid: {
      type: "array",
      items: {
        type: "object",
        properties: {
          market_name: { type: "string" },
          reason: { type: "string" },
        },
        required: ["market_name", "reason"],
      },
    },
    methodology_note: { type: "string" },
    dimension_weights: {
      type: "object",
      properties: {
        power: { type: "integer" },
        community: { type: "integer" },
        tax: { type: "integer" },
        hazards: { type: "integer" },
      },
      required: ["power", "community", "tax", "hazards"],
    },
  },
  required: ["executive_summary", "candidate_markets", "markets_to_avoid", "methodology_note", "dimension_weights"],
};

interface SseChunk {
  choices?: Array<{ delta?: { content?: string } }>;
}

export class ApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiKeyError";
  }
}

export async function validateApiKey(apiKey: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "subconscious/tim-qwen3.6-27b",
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 5,
    }),
  });
  if (res.status === 401 || res.status === 403) {
    throw new ApiKeyError("Invalid API key — check your Subconscious key and try again.");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}${text ? `: ${text.slice(0, 100)}` : ""}`);
  }
}

export async function runScreening(
  requirements: string,
  apiKey: string,
  signal: AbortSignal,
  onThinking?: (chunk: string) => void,
): Promise<Dossier> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "subconscious/tim-qwen3.6-27b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: requirements },
      ],
      stream: true,
      stream_options: { include_usage: true },
      response_format: {
        type: "json_schema",
        json_schema: { name: "SiteScreeningDossier", schema: DOSSIER_SCHEMA },
      },
      chat_template_kwargs: { enable_thinking: true },
    }),
    signal,
  });

  if (res.status === 401 || res.status === 403) {
    throw new ApiKeyError("Invalid API key — check your Subconscious key and try again.");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  const contentParts: string[] = [];
  let inThink = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;

      let chunk: SseChunk;
      try {
        chunk = JSON.parse(data) as SseChunk;
      } catch {
        continue;
      }

      const piece = chunk.choices?.[0]?.delta?.content;
      if (!piece) continue;

      // Route <think>...</think> content to the callback, rest to content buffer
      let remaining = piece;
      while (remaining) {
        if (inThink) {
          const end = remaining.indexOf("</think>");
          if (end === -1) {
            onThinking?.(remaining);
            remaining = "";
          } else {
            onThinking?.(remaining.slice(0, end));
            inThink = false;
            remaining = remaining.slice(end + 8);
          }
        } else {
          const start = remaining.indexOf("<think>");
          if (start === -1) {
            contentParts.push(remaining);
            remaining = "";
          } else {
            if (start > 0) contentParts.push(remaining.slice(0, start));
            inThink = true;
            remaining = remaining.slice(start + 7);
          }
        }
      }
    }
  }

  const raw = contentParts.join("").trim();
  if (!raw) throw new Error("Empty response — no dossier returned.");

  let dossier: Dossier;
  try {
    dossier = JSON.parse(raw) as Dossier;
  } catch {
    throw new Error("Could not parse dossier response. The run may have been cut off.");
  }

  return rankMarkets(dossier);
}

const SIGNAL_SCORES: Record<string, number> = {
  favorable: 2, mixed: 1, constrained: 0,
  supportive: 2, hostile: 0,
  strong_incentives: 2, moderate_incentives: 1, weak_incentives: 0,
  low_risk: 2, moderate_risk: 1, high_risk: 0,
};

function rankMarkets(dossier: Dossier): Dossier {
  const w = dossier.dimension_weights;
  const scored = dossier.candidate_markets.map((m) => ({
    market: m,
    score:
      w.power    * (SIGNAL_SCORES[m.power.signal] ?? 1) +
      w.community * (SIGNAL_SCORES[m.community_sentiment.signal] ?? 1) +
      w.tax      * (SIGNAL_SCORES[m.tax_and_incentives.signal] ?? 1) +
      w.hazards  * (SIGNAL_SCORES[m.natural_hazards.signal] ?? 1),
  }));

  scored.sort((a, b) => b.score - a.score);

  return {
    ...dossier,
    candidate_markets: scored.map(({ market }, i) => ({ ...market, rank: i + 1 })),
  };
}
