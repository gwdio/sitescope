"""50% complexity: 3 markets, signal enums, multiple tools, medium prompt."""
import os
import json
from pydantic import BaseModel
from typing import List, Literal
from subconscious import Subconscious

client = Subconscious(api_key=os.environ.get("SUBCONSCIOUS_API_KEY"))


class PowerAssessment(BaseModel):
    summary: str
    signal: Literal["favorable", "mixed", "constrained"]

class CandidateMarket(BaseModel):
    rank: int
    market_name: str
    overall_viability: Literal["strong", "moderate", "cautious"]
    power: PowerAssessment
    connectivity: str
    key_risks: List[str]
    next_steps: str

class MarketToAvoid(BaseModel):
    market_name: str
    reason: str

class Dossier(BaseModel):
    executive_summary: str
    candidate_markets: List[CandidateMarket]
    markets_to_avoid: List[MarketToAvoid]


PROMPT = """\
You are a data center site screening analyst.
Research and rank 3 US markets for a 5MW colocation facility in Texas.
For each market assess power availability and connectivity.
Also identify 1 market to avoid.
Do 2-3 searches, then produce your structured answer.

Requirements: 5MW colocation, Texas, power is top priority, 24-month timeline."""

print("Starting run...")
run = client.run(
    engine="tim-claude",
    input={
        "instructions": PROMPT,
        "tools": [
            {"type": "platform", "id": "web_search"},
            {"type": "platform", "id": "news_search"},
        ],
        "answerFormat": Dossier,
    },
    options={"await_completion": True},
)

print(f"\nanswer type: {type(run.result.answer)}")
answer = run.result.answer

if answer and isinstance(answer, str) and answer.strip():
    try:
        parsed = json.loads(answer)
        print(json.dumps(parsed, indent=2)[:5000])
    except json.JSONDecodeError:
        print(f"Raw string: {answer[:3000]}")
elif answer and isinstance(answer, dict):
    print(json.dumps(answer, indent=2)[:5000])
else:
    print(f"answer: {repr(answer)[:500]}")
