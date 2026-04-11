"""
Live integration tests that call the Subconscious API.

Requires SUBCONSCIOUS_API_KEY in environment.
Run: pytest test_agent_live.py -v -s --timeout=900
"""

import os
import json
import pytest
from subconscious import Subconscious
from main import AGENT_PROMPT, SiteScreeningDossier, TOOLS

VALID_VIABILITY = {"strong", "moderate", "cautious"}
VALID_POWER_SIGNAL = {"favorable", "mixed", "constrained"}
VALID_COMMUNITY_SIGNAL = {"supportive", "mixed", "hostile"}
VALID_INCENTIVE_SIGNAL = {"strong_incentives", "moderate_incentives", "weak_incentives"}
VALID_HAZARD_SIGNAL = {"low_risk", "moderate_risk", "high_risk"}


@pytest.fixture(scope="module")
def client():
    key = os.environ.get("SUBCONSCIOUS_API_KEY")
    if not key:
        pytest.skip("SUBCONSCIOUS_API_KEY not set")
    return Subconscious(api_key=key)


def run_agent(client, requirements: str) -> dict:
    """Call the agent with given requirements and return parsed dossier."""
    import json as _json
    prompt = AGENT_PROMPT.replace("{{requirements}}", requirements)
    run = client.run(
        engine="tim-claude",
        input={
            "instructions": prompt,
            "tools": TOOLS,
            "answerFormat": SiteScreeningDossier,
        },
        options={"await_completion": True},
    )
    answer = run.result.answer
    assert answer, f"Agent returned empty answer: {repr(answer)}"
    # SDK returns string — parse if needed
    if isinstance(answer, str):
        dossier = _json.loads(answer)
    elif isinstance(answer, dict):
        dossier = answer
    else:
        raise AssertionError(f"Unexpected answer type: {type(answer)}")
    return dossier


def validate_dossier_schema(dossier: dict):
    """Validate dossier conforms to SiteScreeningDossier schema."""
    # Top-level required fields
    assert "executive_summary" in dossier
    assert isinstance(dossier["executive_summary"], str)
    assert len(dossier["executive_summary"]) > 20, "Executive summary too short"

    assert "candidate_markets" in dossier
    assert isinstance(dossier["candidate_markets"], list)
    assert 3 <= len(dossier["candidate_markets"]) <= 5, (
        f"Expected 3-5 markets, got {len(dossier['candidate_markets'])}"
    )

    assert "markets_to_avoid" in dossier
    assert isinstance(dossier["markets_to_avoid"], list)

    assert "methodology_note" in dossier
    assert isinstance(dossier["methodology_note"], str)
    assert len(dossier["methodology_note"]) > 20, "Methodology note too short"

    # Validate each candidate market
    for i, market in enumerate(dossier["candidate_markets"]):
        prefix = f"candidate_markets[{i}]"

        assert isinstance(market["rank"], int), f"{prefix}.rank not int"
        assert isinstance(market["market_name"], str), f"{prefix}.market_name not str"
        assert len(market["market_name"]) > 3, f"{prefix}.market_name too short"

        assert market["overall_viability"] in VALID_VIABILITY, (
            f"{prefix}.overall_viability={market['overall_viability']!r} invalid"
        )

        # Power
        assert isinstance(market["power"], dict), f"{prefix}.power not dict"
        assert isinstance(market["power"]["summary"], str)
        assert market["power"]["signal"] in VALID_POWER_SIGNAL, (
            f"{prefix}.power.signal={market['power']['signal']!r} invalid"
        )

        # Community sentiment
        cs = market["community_sentiment"]
        assert isinstance(cs, dict), f"{prefix}.community_sentiment not dict"
        assert isinstance(cs["summary"], str)
        assert cs["signal"] in VALID_COMMUNITY_SIGNAL, (
            f"{prefix}.community_sentiment.signal={cs['signal']!r} invalid"
        )

        # Tax & incentives
        ti = market["tax_and_incentives"]
        assert isinstance(ti, dict), f"{prefix}.tax_and_incentives not dict"
        assert isinstance(ti["summary"], str)
        assert ti["signal"] in VALID_INCENTIVE_SIGNAL, (
            f"{prefix}.tax_and_incentives.signal={ti['signal']!r} invalid"
        )

        # Natural hazards
        nh = market["natural_hazards"]
        assert isinstance(nh, dict), f"{prefix}.natural_hazards not dict"
        assert isinstance(nh["summary"], str)
        assert nh["signal"] in VALID_HAZARD_SIGNAL, (
            f"{prefix}.natural_hazards.signal={nh['signal']!r} invalid"
        )

        # Text-only fields
        assert isinstance(market["connectivity"], str)
        assert isinstance(market["recent_activity"], str)

        # Key risks
        assert isinstance(market["key_risks"], list)
        assert len(market["key_risks"]) >= 1, f"{prefix}.key_risks empty"
        for risk in market["key_risks"]:
            assert isinstance(risk, str)

        # Next steps
        assert isinstance(market["next_steps"], str)
        assert len(market["next_steps"]) > 10, f"{prefix}.next_steps too short"

    # Validate markets to avoid
    for i, avoid in enumerate(dossier["markets_to_avoid"]):
        prefix = f"markets_to_avoid[{i}]"
        assert isinstance(avoid["market_name"], str), f"{prefix}.market_name not str"
        assert isinstance(avoid["reason"], str), f"{prefix}.reason not str"
        assert len(avoid["reason"]) > 10, f"{prefix}.reason too short"

    # Ranks should be sequential starting from 1
    ranks = [m["rank"] for m in dossier["candidate_markets"]]
    assert ranks == sorted(ranks), f"Ranks not in order: {ranks}"
    assert ranks[0] == 1, f"First rank should be 1, got {ranks[0]}"


def validate_dossier_quality(dossier: dict, requirements: str):
    """Check agent output quality — substance, not just schema."""
    # Executive summary should reference something from the requirements
    summary_lower = dossier["executive_summary"].lower()
    # At least one market name should appear in summary
    market_names = [m["market_name"].lower() for m in dossier["candidate_markets"]]
    mentioned = any(
        name.split("(")[0].strip().split(",")[0].strip() in summary_lower
        for name in market_names
    )
    assert mentioned, "Executive summary doesn't mention any candidate market by name"

    # Each market should have substantive summaries (not just filler)
    for market in dossier["candidate_markets"]:
        assert len(market["power"]["summary"]) > 50, (
            f"{market['market_name']}: power summary too thin"
        )
        assert len(market["community_sentiment"]["summary"]) > 50, (
            f"{market['market_name']}: community summary too thin"
        )
        assert len(market["tax_and_incentives"]["summary"]) > 50, (
            f"{market['market_name']}: tax summary too thin"
        )
        assert len(market["natural_hazards"]["summary"]) > 50, (
            f"{market['market_name']}: hazards summary too thin"
        )
        assert len(market["connectivity"]) > 30, (
            f"{market['market_name']}: connectivity too thin"
        )
        assert len(market["recent_activity"]) > 30, (
            f"{market['market_name']}: recent_activity too thin"
        )


# ── Tests ─────────────────────────────────────────────────


@pytest.mark.timeout(900)
def test_hyperscale_sun_belt(client):
    """Standard hyperscale query — the demo pre-fill from the spec."""
    requirements = (
        "50MW hyperscale facility. US Sun Belt or Midwest. Grid-ready within "
        "24 months. AI training and inference workload at 40-50kW per rack. "
        "Power availability and speed-to-energize are the top priorities, "
        "followed by community receptiveness, then tax incentives. Prefer "
        "low water dependency. Renewable energy access is a plus but not required."
    )

    dossier = run_agent(client, requirements)

    print("\n=== HYPERSCALE SUN BELT DOSSIER ===")
    print(json.dumps(dossier, indent=2))

    validate_dossier_schema(dossier)
    validate_dossier_quality(dossier, requirements)

    # Power should be prioritized — top-ranked market shouldn't have constrained power
    top = dossier["candidate_markets"][0]
    assert top["power"]["signal"] != "constrained", (
        f"Top market {top['market_name']} has constrained power despite it being top priority"
    )


@pytest.mark.timeout(900)
def test_edge_colocation(client):
    """Smaller edge/colo requirement — different profile than hyperscale."""
    requirements = (
        "5MW colocation facility targeting enterprise edge workloads. "
        "East Coast preferred, within 10ms latency to New York City. "
        "Low natural hazard risk is the top priority. Need strong fiber "
        "connectivity with multiple carrier options. Budget-conscious — "
        "tax incentives matter. Timeline is flexible, 36 months acceptable."
    )

    dossier = run_agent(client, requirements)

    print("\n=== EDGE COLOCATION DOSSIER ===")
    print(json.dumps(dossier, indent=2))

    validate_dossier_schema(dossier)
    validate_dossier_quality(dossier, requirements)


@pytest.mark.timeout(900)
def test_renewable_focused(client):
    """Sustainability-first requirement — tests agent's ability to weight differently."""
    requirements = (
        "20MW facility for a carbon-neutral cloud provider. Renewable energy "
        "access is the NUMBER ONE requirement — must have path to 100% "
        "renewable power within 12 months of operation. Pacific Northwest "
        "or upper Midwest preferred. Water-cooled is acceptable if water "
        "is abundant. Community support important — we will NOT build where "
        "we are not wanted. 30-month timeline."
    )

    dossier = run_agent(client, requirements)

    print("\n=== RENEWABLE FOCUSED DOSSIER ===")
    print(json.dumps(dossier, indent=2))

    validate_dossier_schema(dossier)
    validate_dossier_quality(dossier, requirements)
