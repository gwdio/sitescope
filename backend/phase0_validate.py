"""
Phase 0.2 — Validation Gate: does the research actually happen?

Calls POST /v1/chat/completions on the new Subconscious endpoint with
stream=true + response_format json_schema + thinking enabled.

Checks:
  - Does the model perform real research (specific, verifiable facts)?
  - Does structured output (dossier schema) round-trip correctly?
  - Token usage captured for cost model.
  - Streaming works via plain requests + SSE parsing.

Run: python3 phase0_validate.py
"""

import json
import os
import sys
import time

import requests

API_KEY = os.environ.get("SUBCONSCIOUS_API_KEY") or open(
    os.path.join(os.path.dirname(__file__), "../.env")
).read().split("SUBCONSCIOUS_API_KEY=")[1].split()[0]

BASE_URL = "https://api.subconscious.dev/v1"

DOSSIER_SCHEMA = {
    "type": "object",
    "properties": {
        "executive_summary": {"type": "string"},
        "candidate_markets": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "rank": {"type": "integer"},
                    "market_name": {"type": "string"},
                    "overall_viability": {
                        "type": "string",
                        "enum": ["strong", "moderate", "cautious"],
                    },
                    "power": {
                        "type": "object",
                        "properties": {
                            "summary": {"type": "string"},
                            "signal": {
                                "type": "string",
                                "enum": ["favorable", "mixed", "constrained"],
                            },
                        },
                        "required": ["summary", "signal"],
                    },
                    "community_sentiment": {
                        "type": "object",
                        "properties": {
                            "summary": {"type": "string"},
                            "signal": {
                                "type": "string",
                                "enum": ["supportive", "mixed", "hostile"],
                            },
                        },
                        "required": ["summary", "signal"],
                    },
                    "tax_and_incentives": {
                        "type": "object",
                        "properties": {
                            "summary": {"type": "string"},
                            "signal": {
                                "type": "string",
                                "enum": [
                                    "strong_incentives",
                                    "moderate_incentives",
                                    "weak_incentives",
                                ],
                            },
                        },
                        "required": ["summary", "signal"],
                    },
                    "natural_hazards": {
                        "type": "object",
                        "properties": {
                            "summary": {"type": "string"},
                            "signal": {
                                "type": "string",
                                "enum": ["low_risk", "moderate_risk", "high_risk"],
                            },
                        },
                        "required": ["summary", "signal"],
                    },
                    "connectivity": {"type": "string"},
                    "recent_activity": {"type": "string"},
                    "key_risks": {"type": "array", "items": {"type": "string"}},
                    "next_steps": {"type": "string"},
                },
                "required": [
                    "rank",
                    "market_name",
                    "overall_viability",
                    "power",
                    "community_sentiment",
                    "tax_and_incentives",
                    "natural_hazards",
                    "connectivity",
                    "recent_activity",
                    "key_risks",
                    "next_steps",
                ],
            },
        },
        "markets_to_avoid": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "market_name": {"type": "string"},
                    "reason": {"type": "string"},
                },
                "required": ["market_name", "reason"],
            },
        },
        "methodology_note": {"type": "string"},
    },
    "required": [
        "executive_summary",
        "candidate_markets",
        "markets_to_avoid",
        "methodology_note",
    ],
}

SYSTEM_PROMPT = """\
You are SiteScope, a data center site screening analyst.
Task: research and rank 3-5 candidate US markets for user's requirements.

## Research Steps (do ALL, 1-2 searches each)

1. POWER & GRID: power availability, utility capacity, interconnection queues, grid expansion plans.
2. COMMUNITY SENTIMENT: news on opposition, moratoriums, zoning battles, protests.
3. TAX & INCENTIVES: state data center tax exemptions, property tax abatements.
4. NATURAL HAZARDS: flood, seismic, wildfire, tornado/hurricane risk.
5. CONNECTIVITY: internet exchange points, carrier-neutral facilities, fiber route diversity.
6. RECENT ACTIVITY: active operators/developers, project announcements.
7. REGULATORY: pending legislation, zoning changes, utility rate restructuring.

## Rules
- 2025-2026 info only. Older data is unreliable.
- Distinguish primary markets (NoVA, Phoenix, Dallas) from emerging ones.
- Be honest about limitations.
- Rank by overall viability, weighted by user priorities.
- Flag markets where recent events make them riskier than they appear.
- Also identify 1-3 markets to AVOID with specific reasons.

After research, produce a valid JSON object matching the required schema."""

USER_REQUIREMENTS = """\
50MW hyperscale facility. US Sun Belt or Midwest. Grid-ready within 24 months.
AI training and inference workload at 40-50kW per rack.
Power availability and speed-to-energize are the top priorities,
followed by community receptiveness, then tax incentives.
Prefer low water dependency. Renewable energy access is a plus but not required."""


def stream_completion():
    payload = {
        "model": "subconscious/tim-qwen3.6-27b",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": USER_REQUIREMENTS},
        ],
        "stream": True,
        "stream_options": {"include_usage": True},
        "response_format": {
            "type": "json_schema",
            "json_schema": {"name": "SiteScreeningDossier", "schema": DOSSIER_SCHEMA},
        },
        "chat_template_kwargs": {"enable_thinking": True},
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    print("=== Phase 0.2 Validation — POST /v1/chat/completions ===")
    print(f"Model: {payload['model']}")
    print(f"Stream: True | Thinking: True | response_format: json_schema")
    print()

    start = time.time()
    think_buf = []
    content_buf = []
    usage = None
    chunk_count = 0

    with requests.post(
        f"{BASE_URL}/chat/completions",
        headers=headers,
        json=payload,
        stream=True,
        timeout=900,
    ) as resp:
        if resp.status_code != 200:
            print(f"ERROR {resp.status_code}: {resp.text}")
            sys.exit(1)

        print(f"[HTTP {resp.status_code}] streaming...")
        print()

        for raw_line in resp.iter_lines():
            if not raw_line:
                continue
            line = raw_line.decode("utf-8") if isinstance(raw_line, bytes) else raw_line
            if not line.startswith("data: "):
                continue
            data_str = line[6:]
            if data_str == "[DONE]":
                break

            try:
                chunk = json.loads(data_str)
            except json.JSONDecodeError:
                continue

            chunk_count += 1

            # Capture usage from final chunk
            if "usage" in chunk and chunk["usage"]:
                usage = chunk["usage"]

            choices = chunk.get("choices", [])
            if not choices:
                continue

            delta = choices[0].get("delta", {})
            content_piece = delta.get("content", "")
            if not content_piece:
                continue

            # Split <think>...</think> from the JSON answer
            if "<think>" in content_piece or think_buf:
                think_buf.append(content_piece)
                combined = "".join(think_buf)
                if "</think>" in combined:
                    # Thinking complete; extract post-think content
                    after = combined.split("</think>", 1)[1]
                    if after:
                        content_buf.append(after)
                        think_buf.clear()
                        print("\r[thinking complete]", flush=True)
                else:
                    # Still in thinking — show a heartbeat
                    if chunk_count % 50 == 0:
                        elapsed = time.time() - start
                        chars = len(combined)
                        print(
                            f"\r  [thinking... {elapsed:.0f}s, {chars} chars]",
                            end="",
                            flush=True,
                        )
            else:
                content_buf.append(content_piece)
                if chunk_count % 100 == 0:
                    elapsed = time.time() - start
                    print(
                        f"\r  [answer streaming... {elapsed:.0f}s, {len(''.join(content_buf))} chars]",
                        end="",
                        flush=True,
                    )

    elapsed = time.time() - start
    print(f"\n\n=== Stream complete in {elapsed:.1f}s, {chunk_count} chunks ===\n")

    return "".join(content_buf), "".join(think_buf), usage


def assess_research_quality(dossier: dict) -> list[str]:
    """Check for signals that real research happened vs. hallucination."""
    issues = []
    passes = []

    # Specific utility names = real research signal
    all_text = json.dumps(dossier).lower()
    known_utilities = [
        "oncor", "ercot", "duke energy", "aes", "dominion", "nv energy",
        "rocky mountain power", "xcel", "entergy", "southern company",
        "arizona public service", "aps", "srp", "pge", "pg&e",
        "evergy", "westar", "ameren", "consumers energy",
    ]
    found_utilities = [u for u in known_utilities if u in all_text]
    if found_utilities:
        passes.append(f"Named utilities present: {', '.join(found_utilities)}")
    else:
        issues.append("No named utilities found — possible hallucination")

    # Specific MW figures
    import re
    mw_figures = re.findall(r"\d+\s*(?:MW|GW|kW)", json.dumps(dossier))
    if len(mw_figures) >= 3:
        passes.append(f"Specific power figures: {mw_figures[:5]}")
    else:
        issues.append(f"Few/no power figures: {mw_figures}")

    # Interconnection queue mentions
    queue_terms = ["interconnection", "queue", "substation", "transmission", "grid"]
    found_queue = [t for t in queue_terms if t in all_text]
    if len(found_queue) >= 3:
        passes.append(f"Grid/interconnection terminology: {found_queue}")
    else:
        issues.append(f"Missing grid terminology ({found_queue}) — may be shallow")

    # Markets to avoid populated
    avoid = dossier.get("markets_to_avoid", [])
    if avoid:
        passes.append(f"markets_to_avoid: {[m['market_name'] for m in avoid]}")
    else:
        issues.append("markets_to_avoid is empty")

    # Recent activity section has specifics
    for market in dossier.get("candidate_markets", []):
        ra = market.get("recent_activity", "")
        if len(ra) > 100:
            passes.append(f"{market['market_name']}: substantive recent_activity")
            break
    else:
        issues.append("recent_activity sections are thin")

    return passes, issues


def main():
    raw_content, thinking, usage = stream_completion()

    # Show brief thinking excerpt
    if thinking:
        think_preview = "".join(thinking)[:800]
        print(f"--- THINKING EXCERPT (first 800 chars) ---\n{think_preview}\n...\n")
    else:
        print("[WARNING] No <think> content detected — thinking may not be enabled\n")

    # Parse dossier
    raw_content = raw_content.strip()
    if not raw_content:
        print("ERROR: Empty content — no dossier returned")
        sys.exit(1)

    # Strip markdown code fences if present
    if raw_content.startswith("```"):
        raw_content = raw_content.split("```")[1]
        if raw_content.startswith("json"):
            raw_content = raw_content[4:]

    try:
        dossier = json.loads(raw_content)
    except json.JSONDecodeError as e:
        print(f"ERROR: Could not parse dossier JSON: {e}")
        print(f"Raw content (first 500): {raw_content[:500]}")
        sys.exit(1)

    print("=== DOSSIER PARSED SUCCESSFULLY ===\n")

    # Print summary
    print(f"Executive summary:\n  {dossier.get('executive_summary', '')[:300]}\n")
    print(f"Candidate markets ({len(dossier.get('candidate_markets', []))}):")
    for m in dossier.get("candidate_markets", []):
        print(f"  #{m['rank']} {m['market_name']} — {m['overall_viability']}")
        print(f"      Power: {m['power']['signal']} | Community: {m['community_sentiment']['signal']}")
    print()
    print(f"Markets to avoid: {[m['market_name'] for m in dossier.get('markets_to_avoid', [])]}")
    print()

    # Research quality check
    passes, issues = assess_research_quality(dossier)
    print("=== RESEARCH QUALITY ASSESSMENT ===")
    for p in passes:
        print(f"  [PASS] {p}")
    for i in issues:
        print(f"  [WARN] {i}")
    print()

    # Usage / cost
    if usage:
        prompt_tok = usage.get("prompt_tokens", 0)
        completion_tok = usage.get("completion_tokens", 0)
        total_tok = usage.get("total_tokens", 0)
        # tim-qwen3.6-27b: $0.50/1M in, $3.50/1M out
        cost = (prompt_tok / 1_000_000 * 0.50) + (completion_tok / 1_000_000 * 3.50)
        print(f"=== TOKEN USAGE ===")
        print(f"  Prompt:     {prompt_tok:,}")
        print(f"  Completion: {completion_tok:,}")
        print(f"  Total:      {total_tok:,}")
        print(f"  Est. cost:  ${cost:.4f} @ $0.50/1M in + $3.50/1M out")
    else:
        print("[WARNING] No usage data in stream — stream_options.include_usage may not be supported")

    print()
    verdict = "PASS" if not issues else f"PARTIAL ({len(passes)} pass, {len(issues)} warn)"
    print(f"=== VERDICT: {verdict} ===")
    if issues:
        print("Review warnings above — check if output contains real 2025-2026 facts.")

    # Write full dossier to file for inspection
    out_path = os.path.join(os.path.dirname(__file__), "phase0_result.json")
    with open(out_path, "w") as f:
        json.dump(dossier, f, indent=2)
    print(f"\nFull dossier written to: {out_path}")


if __name__ == "__main__":
    main()
