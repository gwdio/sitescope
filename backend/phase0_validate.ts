/**
 * Phase 0.2 — Validation Gate: does the research actually happen?
 *
 * Calls POST /v1/chat/completions on the new Subconscious endpoint with
 * stream=true + response_format json_schema + thinking enabled.
 *
 * Run: npx tsx backend/phase0_validate.ts
 */

import { readFileSync } from "fs";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadApiKey(): string {
  const env = process.env.SUBCONSCIOUS_API_KEY;
  if (env) return env;
  const envFile = readFileSync(join(__dirname, "../.env"), "utf-8");
  const match = envFile.match(/SUBCONSCIOUS_API_KEY=(\S+)/);
  if (!match) throw new Error("SUBCONSCIOUS_API_KEY not found in .env");
  return match[1];
}

const BASE_URL = "https://api.subconscious.dev/v1";

const DOSSIER_SCHEMA = {
  type: "object",
  properties: {
    executive_summary: { type: "string" },
    candidate_markets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          rank: { type: "integer" },
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
          connectivity: { type: "string" },
          recent_activity: { type: "string" },
          key_risks: { type: "array", items: { type: "string" } },
          next_steps: { type: "string" },
        },
        required: [
          "rank", "market_name", "overall_viability",
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
  },
  required: ["executive_summary", "candidate_markets", "markets_to_avoid", "methodology_note"],
};

const SYSTEM_PROMPT = `You are SiteScope, a data center site screening analyst.
Task: research and rank 3-5 candidate US markets for the user's requirements.

Research each dimension for every candidate market:
1. POWER & GRID: utility capacity, interconnection queues, speed-to-energize
2. COMMUNITY SENTIMENT: opposition news, moratoriums, zoning battles
3. TAX & INCENTIVES: state exemptions, property tax abatements, incentive programs
4. NATURAL HAZARDS: flood, seismic, wildfire, tornado/hurricane risk
5. CONNECTIVITY: fiber diversity, IXPs, carrier-neutral facilities
6. RECENT ACTIVITY: operator announcements, campus developments
7. REGULATORY: pending legislation, zoning changes, utility rate restructuring

Rules:
- Prioritize 2025-2026 information
- Rank markets by overall viability weighted by the user's stated priorities
- Identify 1-3 markets to AVOID with specific reasons
- Be honest about limitations

Produce a JSON object matching the required schema.`;

const USER_REQUIREMENTS = `50MW hyperscale facility. US Sun Belt or Midwest. Grid-ready within 24 months.
AI training and inference workload at 40-50kW per rack.
Power availability and speed-to-energize are the top priorities,
followed by community receptiveness, then tax incentives.
Prefer low water dependency. Renewable energy access is a plus but not required.`;

interface Chunk {
  choices?: { delta?: { content?: string } }[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

async function streamCompletion(apiKey: string) {
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
        { role: "user", content: USER_REQUIREMENTS },
      ],
      stream: true,
      stream_options: { include_usage: true },
      response_format: {
        type: "json_schema",
        json_schema: { name: "SiteScreeningDossier", schema: DOSSIER_SCHEMA },
      },
      chat_template_kwargs: { enable_thinking: true },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  if (!res.body) throw new Error("No response body");

  console.log(`[HTTP ${res.status}] streaming...\n`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  const contentParts: string[] = [];
  const thinkParts: string[] = [];
  let inThink = false;
  let usage: Chunk["usage"] | null = null;
  let chunkCount = 0;
  const start = Date.now();

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

      let chunk: Chunk;
      try {
        chunk = JSON.parse(data);
      } catch {
        continue;
      }

      chunkCount++;
      if (chunk.usage) usage = chunk.usage;

      const piece = chunk.choices?.[0]?.delta?.content;
      if (!piece) continue;

      // Route <think>...</think> to thinkParts, rest to contentParts
      let remaining = piece;
      while (remaining) {
        if (inThink) {
          const end = remaining.indexOf("</think>");
          if (end === -1) {
            thinkParts.push(remaining);
            remaining = "";
          } else {
            thinkParts.push(remaining.slice(0, end));
            inThink = false;
            remaining = remaining.slice(end + 8);
          }
        } else {
          const s = remaining.indexOf("<think>");
          if (s === -1) {
            contentParts.push(remaining);
            remaining = "";
          } else {
            if (s > 0) contentParts.push(remaining.slice(0, s));
            inThink = true;
            remaining = remaining.slice(s + 7);
          }
        }
      }

      if (chunkCount % 100 === 0) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(0);
        const phase = thinkParts.length > 0 && contentParts.length === 0 ? "thinking" : "answer";
        process.stdout.write(
          `\r  [${phase}... ${elapsed}s, ${(thinkParts.join("") + contentParts.join("")).length} chars]`,
        );
      }
    }
  }

  const elapsed = (Date.now() - start) / 1000;
  console.log(`\n\n=== Stream complete in ${elapsed.toFixed(1)}s, ${chunkCount} chunks ===\n`);

  return {
    content: contentParts.join(""),
    thinking: thinkParts.join(""),
    usage,
  };
}

function assessResearchQuality(dossier: Record<string, unknown>) {
  const text = JSON.stringify(dossier).toLowerCase();
  const passes: string[] = [];
  const warns: string[] = [];

  const knownUtilities = [
    "oncor", "ercot", "duke energy", "aes", "dominion", "nv energy",
    "rocky mountain power", "xcel", "entergy", "southern company",
    "arizona public service", "aps", "srp", "pge", "pg&e",
    "evergy", "westar", "ameren", "consumers energy",
  ];
  const foundUtilities = knownUtilities.filter((u) => text.includes(u));
  if (foundUtilities.length > 0) {
    passes.push(`Named utilities: ${foundUtilities.join(", ")}`);
  } else {
    warns.push("No named utilities — possible hallucination");
  }

  const mwFigures = (JSON.stringify(dossier).match(/\d+\s*(?:MW|GW|kW)/g) ?? []);
  if (mwFigures.length >= 3) {
    passes.push(`Power figures: ${mwFigures.slice(0, 5).join(", ")}`);
  } else {
    warns.push(`Few power figures: ${mwFigures.join(", ")}`);
  }

  const gridTerms = ["interconnection", "queue", "substation", "transmission", "grid"];
  const foundTerms = gridTerms.filter((t) => text.includes(t));
  if (foundTerms.length >= 3) {
    passes.push(`Grid terminology: ${foundTerms.join(", ")}`);
  } else {
    warns.push(`Missing grid terminology (${foundTerms.join(", ")})`);
  }

  const avoid = (dossier.markets_to_avoid as { market_name: string }[] | undefined) ?? [];
  if (avoid.length > 0) {
    passes.push(`markets_to_avoid: ${avoid.map((m) => m.market_name).join(", ")}`);
  } else {
    warns.push("markets_to_avoid is empty");
  }

  const markets = (dossier.candidate_markets as { market_name: string; recent_activity: string }[] | undefined) ?? [];
  const substantive = markets.find((m) => m.recent_activity?.length > 100);
  if (substantive) {
    passes.push(`${substantive.market_name}: substantive recent_activity`);
  } else {
    warns.push("recent_activity sections are thin");
  }

  return { passes, warns };
}

async function main() {
  const apiKey = loadApiKey();

  console.log("=== Phase 0.2 Validation — POST /v1/chat/completions ===");
  console.log("Model: subconscious/tim-qwen3.6-27b");
  console.log("Stream: true | Thinking: true | response_format: json_schema\n");

  const { content, thinking, usage } = await streamCompletion(apiKey);

  if (thinking) {
    console.log(`--- THINKING EXCERPT (first 800 chars) ---\n${thinking.slice(0, 800)}\n...\n`);
  } else {
    console.log("[WARNING] No <think> content detected\n");
  }

  const raw = content.trim().replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  if (!raw) {
    console.error("ERROR: Empty content — no dossier returned");
    process.exit(1);
  }

  let dossier: Record<string, unknown>;
  try {
    dossier = JSON.parse(raw);
  } catch (e) {
    console.error(`ERROR: Could not parse dossier JSON: ${e}`);
    console.error(`Raw content (first 500): ${raw.slice(0, 500)}`);
    process.exit(1);
  }

  console.log("=== DOSSIER PARSED SUCCESSFULLY ===\n");

  const summary = (dossier.executive_summary as string | undefined) ?? "";
  console.log(`Executive summary:\n  ${summary.slice(0, 300)}\n`);

  const markets = (dossier.candidate_markets as { rank: number; market_name: string; overall_viability: string; power: { signal: string }; community_sentiment: { signal: string } }[] | undefined) ?? [];
  console.log(`Candidate markets (${markets.length}):`);
  for (const m of markets) {
    console.log(`  #${m.rank} ${m.market_name} — ${m.overall_viability}`);
    console.log(`      Power: ${m.power.signal} | Community: ${m.community_sentiment.signal}`);
  }

  const avoid = (dossier.markets_to_avoid as { market_name: string }[] | undefined) ?? [];
  console.log(`\nMarkets to avoid: ${avoid.map((m) => m.market_name).join(", ")}\n`);

  const { passes, warns } = assessResearchQuality(dossier);
  console.log("=== RESEARCH QUALITY ASSESSMENT ===");
  for (const p of passes) console.log(`  [PASS] ${p}`);
  for (const w of warns) console.log(`  [WARN] ${w}`);
  console.log();

  if (usage) {
    const cost = (usage.prompt_tokens / 1_000_000) * 0.5 + (usage.completion_tokens / 1_000_000) * 3.5;
    console.log("=== TOKEN USAGE ===");
    console.log(`  Prompt:     ${usage.prompt_tokens.toLocaleString()}`);
    console.log(`  Completion: ${usage.completion_tokens.toLocaleString()}`);
    console.log(`  Total:      ${usage.total_tokens.toLocaleString()}`);
    console.log(`  Est. cost:  $${cost.toFixed(4)} @ $0.50/1M in + $3.50/1M out`);
    console.log();
  } else {
    console.log("[WARNING] No usage data in stream\n");
  }

  const verdict = warns.length === 0 ? "PASS" : `PARTIAL (${passes.length} pass, ${warns.length} warn)`;
  console.log(`=== VERDICT: ${verdict} ===`);

  const outPath = join(__dirname, "phase0_result.json");
  writeFileSync(outPath, JSON.stringify(dossier, null, 2));
  console.log(`\nFull dossier written to: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
