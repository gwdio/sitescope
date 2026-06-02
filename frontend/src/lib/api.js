const BASE_URL = "https://api.subconscious.dev/v1";
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

Produce a JSON object matching the required schema with executive_summary, candidate_markets (3-5), markets_to_avoid, and methodology_note.`;
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
export class ApiKeyError extends Error {
    constructor(message) {
        super(message);
        this.name = "ApiKeyError";
    }
}
export async function validateApiKey(apiKey) {
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
export async function runScreening(requirements, apiKey, signal, onThinking) {
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
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    const contentParts = [];
    let inThink = false;
    let thinkBuf = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
            if (!line.startsWith("data: "))
                continue;
            const data = line.slice(6);
            if (data === "[DONE]")
                continue;
            let chunk;
            try {
                chunk = JSON.parse(data);
            }
            catch {
                continue;
            }
            const piece = chunk.choices?.[0]?.delta?.content;
            if (!piece)
                continue;
            // Route <think>...</think> content to the callback, rest to content buffer
            let remaining = piece;
            while (remaining) {
                if (inThink) {
                    const end = remaining.indexOf("</think>");
                    if (end === -1) {
                        thinkBuf += remaining;
                        onThinking?.(remaining);
                        remaining = "";
                    }
                    else {
                        const part = remaining.slice(0, end);
                        thinkBuf += part;
                        onThinking?.(part);
                        inThink = false;
                        remaining = remaining.slice(end + 8);
                    }
                }
                else {
                    const start = remaining.indexOf("<think>");
                    if (start === -1) {
                        contentParts.push(remaining);
                        remaining = "";
                    }
                    else {
                        if (start > 0)
                            contentParts.push(remaining.slice(0, start));
                        inThink = true;
                        remaining = remaining.slice(start + 7);
                    }
                }
            }
        }
    }
    const raw = contentParts.join("").trim();
    if (!raw)
        throw new Error("Empty response — no dossier returned.");
    try {
        return JSON.parse(raw);
    }
    catch {
        throw new Error("Could not parse dossier response. The run may have been cut off.");
    }
}
