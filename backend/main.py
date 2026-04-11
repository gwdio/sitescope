import os
import json
import asyncio
from typing import List, Literal

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from subconscious import Subconscious

app = FastAPI()

_client = None


def get_client():
    global _client
    if _client is None:
        _client = Subconscious(api_key=os.environ.get("SUBCONSCIOUS_API_KEY"))
    return _client

# ── Request model ─────────────────────────────────────────


class ScreenRequest(BaseModel):
    requirements: str


# ── Dossier schema (Pydantic) ─────────────────────────────


class PowerAssessment(BaseModel):
    summary: str
    signal: Literal["favorable", "mixed", "constrained"]


class CommunityAssessment(BaseModel):
    summary: str
    signal: Literal["supportive", "mixed", "hostile"]


class TaxAssessment(BaseModel):
    summary: str
    signal: Literal["strong_incentives", "moderate_incentives", "weak_incentives"]


class HazardAssessment(BaseModel):
    summary: str
    signal: Literal["low_risk", "moderate_risk", "high_risk"]


class CandidateMarket(BaseModel):
    rank: int
    market_name: str
    overall_viability: Literal["strong", "moderate", "cautious"]
    power: PowerAssessment
    community_sentiment: CommunityAssessment
    tax_and_incentives: TaxAssessment
    natural_hazards: HazardAssessment
    connectivity: str
    recent_activity: str
    key_risks: List[str]
    next_steps: str


class MarketToAvoid(BaseModel):
    market_name: str
    reason: str


class SiteScreeningDossier(BaseModel):
    executive_summary: str
    candidate_markets: List[CandidateMarket]
    markets_to_avoid: List[MarketToAvoid]
    methodology_note: str


# ── Agent configuration ───────────────────────────────────

TOOLS = [
    {"type": "platform", "id": "web_search"},
    {"type": "platform", "id": "news_search"},
    {"type": "platform", "id": "google_search"},
    {"type": "platform", "id": "company_search"},
]

AGENT_PROMPT = """\
You are SiteScope, a data center site screening analyst.
Task: research and rank 3-5 candidate US markets for user's requirements.

## Research Steps (do ALL, 1-2 searches each)

1. POWER & GRID: power availability, utility capacity, interconnection queues, grid expansion plans. Flag markets where timelines exceed user target.
2. COMMUNITY SENTIMENT: news on opposition, moratoriums, zoning battles, protests. Also find supportive markets.
3. TAX & INCENTIVES: state data center tax exemptions (sales/use tax on equipment), property tax abatements, incentive programs.
4. NATURAL HAZARDS: flood, seismic, wildfire, tornado/hurricane risk. Water availability in arid regions. Climate for cooling.
5. CONNECTIVITY: internet exchange points, carrier-neutral facilities, fiber route diversity.
6. RECENT ACTIVITY: active operators/developers, project announcements, campus developments underway.
7. REGULATORY: pending legislation, zoning changes, utility rate restructuring, political posture toward data centers.

## Rules

- 2025-2026 info only. Older data is unreliable.
- Distinguish primary markets (NoVA, Phoenix, Dallas) from emerging ones.
- Be honest about limitations (MW at specific substations needs utility engagement).
- For each market: what should team investigate NEXT.
- Rank by overall viability, weighted by user priorities.
- Flag markets where recent events make them riskier than they appear.
- Also identify 1-3 markets to AVOID with reasons.

## CRITICAL: Output Instructions

After completing research, you MUST produce your final structured answer.
Your answer MUST be a valid JSON object matching the answerFormat schema with:
- "executive_summary": 2-3 sentence overview with top recommendation
- "candidate_markets": array of 3-5 ranked markets, each with power, community_sentiment, tax_and_incentives, natural_hazards (all with summary + signal), plus connectivity, recent_activity, key_risks, next_steps
- "markets_to_avoid": array of markets to skip with reasons
- "methodology_note": brief note on research methods and limitations

Do NOT end without producing the structured answer. The answer is the entire point.

## User Requirements
{{requirements}}"""

# ── Mock data ─────────────────────────────────────────────

MOCK_DOSSIER = {
    "executive_summary": (
        "Based on the stated requirements for a 50MW hyperscale facility with "
        "24-month energization, Central Texas and Salt Lake City emerge as the "
        "strongest candidates due to favorable power availability, supportive "
        "regulatory environments, and competitive incentive packages. Central "
        "Indiana offers a compelling cost profile but with moderate grid "
        "constraints that may extend timelines."
    ),
    "candidate_markets": [
        {
            "rank": 1,
            "market_name": "Central Texas (Austin–San Antonio Corridor)",
            "overall_viability": "strong",
            "power": {
                "summary": (
                    "ERCOT market with 2.1GW of new generation capacity coming "
                    "online by 2026. Multiple 138kV substations in the corridor "
                    "with 50-80MW available capacity. Oncor reporting 18-month "
                    "interconnection timelines for large loads, which fits the "
                    "24-month target. New natural gas peakers and utility-scale "
                    "solar improving grid reliability."
                ),
                "signal": "favorable",
            },
            "community_sentiment": {
                "summary": (
                    "Generally supportive local government posture. Hays and "
                    "Caldwell counties actively courting data center investment. "
                    "Some residential opposition in suburban areas near existing "
                    "Meta and Google campuses, but no moratoriums or significant "
                    "legislative pushback. County commissioners publicly "
                    "supportive of economic development."
                ),
                "signal": "supportive",
            },
            "tax_and_incentives": {
                "summary": (
                    "Texas Chapter 313 successor program (Chapter 403) offers "
                    "property tax abatements for qualifying data centers. No "
                    "state income tax. Sales tax exemptions available for "
                    "equipment purchases through the Texas Enterprise Zone "
                    "program. Local jurisdictions offering additional 10-year "
                    "property tax phase-ins."
                ),
                "signal": "strong_incentives",
            },
            "natural_hazards": {
                "summary": (
                    "Moderate tornado risk in spring months. Low seismic "
                    "activity. Minimal flood risk at elevation. No wildfire "
                    "exposure. Hot summers increase cooling costs but low "
                    "humidity enables economizer hours. Water availability "
                    "adequate from Edwards Aquifer and surface sources, though "
                    "long-term drought trends warrant monitoring."
                ),
                "signal": "moderate_risk",
            },
            "connectivity": (
                "Strong fiber connectivity along I-35 corridor. Multiple "
                "carrier-neutral facilities in Austin and San Antonio. Direct "
                "routes to Dallas IX. Latency to major US metros competitive "
                "with Tier 1 markets."
            ),
            "recent_activity": (
                "Meta expanding 900MW campus in Temple. Google developing new "
                "facility in Williamson County. Several smaller operators "
                "acquiring land in Caldwell and Hays counties. Total pipeline "
                "estimated at 1.5GW+ across the corridor."
            ),
            "key_risks": [
                "ERCOT grid reliability during extreme weather events remains a concern after Winter Storm Uri",
                "Water availability could tighten if drought conditions persist",
                "Rapid development may strain local utility infrastructure ahead of capacity additions",
            ],
            "next_steps": (
                "Engage Oncor for specific substation capacity and "
                "interconnection timeline at target parcels. Request Chapter "
                "403 pre-qualification from the Comptroller's office. Meet "
                "with Hays and Caldwell county economic development offices "
                "to discuss site-specific incentive packages."
            ),
        },
        {
            "rank": 2,
            "market_name": "Salt Lake City Metro (West Jordan–Tooele Corridor)",
            "overall_viability": "strong",
            "power": {
                "summary": (
                    "Rocky Mountain Power expanding grid capacity with new "
                    "345kV transmission line completion expected Q3 2026. "
                    "Multiple substations in the West Jordan industrial zone "
                    "with 30-60MW available. Utility actively soliciting large "
                    "load customers. Interconnection timelines averaging 20 "
                    "months for straightforward projects."
                ),
                "signal": "favorable",
            },
            "community_sentiment": {
                "summary": (
                    "Mixed sentiment. West Jordan city council broadly "
                    "supportive but Tooele County residents have raised "
                    "concerns about water usage. No formal opposition or "
                    "moratoriums. State government actively promoting data "
                    "center investment as part of tech diversification strategy."
                ),
                "signal": "mixed",
            },
            "tax_and_incentives": {
                "summary": (
                    "Utah offers a post-performance Economic Development Tax "
                    "Increment Financing (EDTIF) credit worth up to 30% of "
                    "new state tax revenue generated. Sales tax exemption on "
                    "data center equipment for facilities over $750M "
                    "investment. Property tax assessed at 100% of fair market "
                    "value but local enterprise zones offer abatements."
                ),
                "signal": "moderate_incentives",
            },
            "natural_hazards": {
                "summary": (
                    "Moderate seismic risk along the Wasatch Fault — design "
                    "for Seismic Zone 3. Low flood and wildfire risk in target "
                    "corridor. Excellent ambient climate for free cooling 8+ "
                    "months per year. Low humidity. Water sourced from "
                    "snowpack-fed reservoirs; long-term drought trends warrant "
                    "water-efficient design."
                ),
                "signal": "moderate_risk",
            },
            "connectivity": (
                "Growing fiber hub with connections to Boise, Denver, and Las "
                "Vegas. Carrier-neutral meet-me room at 572 Delong Street. "
                "Latency to Bay Area under 20ms. Limited compared to primary "
                "markets but improving rapidly with new builds."
            ),
            "recent_activity": (
                "Meta operating 500MW campus in Eagle Mountain. Facebook and "
                "Aligned Data Centers expanding. Multiple new entrants "
                "acquiring land in Tooele County. State reporting $2B+ in "
                "data center investment pipeline for 2025-2027."
            ),
            "key_risks": [
                "Seismic design requirements add 5-8% to construction costs",
                "Water availability increasingly politicized in the Great Salt Lake Basin",
            ],
            "next_steps": (
                "Commission seismic study for target parcels. Engage Rocky "
                "Mountain Power for interconnection pre-application. Contact "
                "GOED (Governor's Office of Economic Development) for EDTIF "
                "program requirements and timeline."
            ),
        },
        {
            "rank": 3,
            "market_name": "Central Indiana (Indianapolis–Lebanon Corridor)",
            "overall_viability": "moderate",
            "power": {
                "summary": (
                    "AES Indiana and Duke Energy Indiana serving the region. "
                    "New 765kV transmission investment underway but large-load "
                    "interconnection queue is backed up 24-30 months. Some "
                    "substations near Lebanon have 20-40MW available now, but "
                    "50MW may require a dedicated feed or substation upgrade."
                ),
                "signal": "mixed",
            },
            "community_sentiment": {
                "summary": (
                    "Boone County and Lebanon city government highly "
                    "supportive. Governor's office actively promoting Indiana "
                    "as a data center hub. No organized opposition. Community "
                    "broadly welcoming of economic development and job "
                    "creation."
                ),
                "signal": "supportive",
            },
            "tax_and_incentives": {
                "summary": (
                    "Indiana offers one of the strongest data center incentive "
                    "packages in the Midwest. Sales tax exemption on all "
                    "qualifying equipment. Up to 100% personal property tax "
                    "abatement for 10 years through EDGE credits. Additional "
                    "utility rate discounts negotiable for large loads."
                ),
                "signal": "strong_incentives",
            },
            "natural_hazards": {
                "summary": (
                    "Low seismic risk. Moderate tornado exposure in spring. "
                    "Minimal flood risk at target sites. No wildfire concern. "
                    "Humid summers reduce economizer efficiency. Abundant "
                    "water from White River watershed and groundwater. No "
                    "water stress concerns."
                ),
                "signal": "low_risk",
            },
            "connectivity": (
                "Improving but still second-tier. Indianapolis IX growing. "
                "Fiber routes along I-65 and I-70. Good latency to Chicago "
                "(~5ms) and reasonable to East Coast hubs. Less diverse fiber "
                "than Texas or Virginia."
            ),
            "recent_activity": (
                "Meta developing large campus near Lebanon. Microsoft "
                "announced 250MW expansion. Several smaller operators "
                "entering the market. State reporting over $6B in data center "
                "investment commitments since 2023."
            ),
            "key_risks": [
                "Interconnection timelines may exceed 24-month target for 50MW load",
                "Fiber diversity still limited compared to primary markets",
                "Tornado exposure requires enhanced structural design",
            ],
            "next_steps": (
                "Submit interconnection pre-application to AES Indiana and "
                "Duke Energy. Confirm timeline feasibility for 50MW. Meet "
                "with Boone County economic development to discuss EDGE "
                "credit application. Evaluate Lebanon industrial park sites."
            ),
        },
        {
            "rank": 4,
            "market_name": "Reno-Sparks (Tahoe Reno Industrial Center)",
            "overall_viability": "cautious",
            "power": {
                "summary": (
                    "NV Energy serving the region with new 525kV transmission "
                    "from southern Nevada. However, large-load queue is "
                    "competitive with multiple hyperscalers ahead. 50MW "
                    "allocation likely requires 28-36 month timeline. Utility "
                    "receptive but grid expansion lagging behind demand."
                ),
                "signal": "constrained",
            },
            "community_sentiment": {
                "summary": (
                    "Generally supportive at the state and county level. TRIC "
                    "is zoned for industrial use with streamlined permitting. "
                    "Some concerns from Reno residents about strain on "
                    "infrastructure and water, but no organized opposition or "
                    "moratoriums."
                ),
                "signal": "supportive",
            },
            "tax_and_incentives": {
                "summary": (
                    "Nevada offers partial abatement of sales, property, and "
                    "modified business tax for qualifying data centers. "
                    "Abatement period up to 20 years for large investments. "
                    "No state income tax. TRIC offers competitive land costs "
                    "and pre-entitled parcels."
                ),
                "signal": "strong_incentives",
            },
            "natural_hazards": {
                "summary": (
                    "Moderate seismic risk — design for Seismic Zone 3. Low "
                    "flood risk at TRIC elevation. Wildfire risk in "
                    "surrounding foothills but TRIC itself is desert terrain. "
                    "Excellent dry climate for free cooling. Water sourced "
                    "from Truckee River and groundwater — availability is "
                    "tight and politically sensitive."
                ),
                "signal": "moderate_risk",
            },
            "connectivity": (
                "Fiber along I-80 to Bay Area with sub-10ms latency. "
                "Multiple carriers present. Switch SUPERNAP proximity. Good "
                "for West Coast workloads but limited eastbound diversity."
            ),
            "recent_activity": (
                "Apple, Google, and Switch operating large campuses. Tesla "
                "Gigafactory driving infrastructure investment. New entrants "
                "finding it harder to secure power allocation. Market "
                "tightening significantly."
            ),
            "key_risks": [
                "Power timeline likely exceeds 24-month target",
                "Water availability is the single biggest constraint — Truckee River allocations are contentious",
                "Seismic design adds cost; insurance premiums higher than Midwest",
            ],
            "next_steps": (
                "Only pursue if West Coast latency is a hard requirement. "
                "Engage NV Energy early for realistic interconnection "
                "timeline. Assess water rights availability at target "
                "parcels before committing."
            ),
        },
    ],
    "markets_to_avoid": [
        {
            "market_name": "Northern Virginia (Loudoun County)",
            "reason": (
                "Despite being the largest US data center market, Loudoun "
                "County faces severe grid constraints with Dominion Energy "
                "interconnection queues extending 4-5 years. County board "
                "has implemented stricter zoning requirements and noise "
                "ordinances. Land costs are 3-5x other markets. Does not "
                "meet the 24-month timeline requirement."
            ),
        },
        {
            "market_name": "Phoenix West Valley (Goodyear–Buckeye)",
            "reason": (
                "APS and SRP reporting significant grid congestion with "
                "interconnection timelines of 36+ months for large loads. "
                "Extreme water scarcity concerns — Buckeye recently lost "
                "access to Saudi-backed groundwater supply. Cooling costs "
                "highest in the country. Recent community pushback against "
                "water usage by data centers gaining political momentum."
            ),
        },
    ],
    "methodology_note": (
        "This screening dossier was generated using automated web research "
        "across utility filings, government economic development portals, "
        "news sources, and industry databases. Power availability figures "
        "are approximate and based on publicly available data — actual "
        "capacity at specific substations requires direct utility "
        "engagement. Community sentiment reflects public signals from news "
        "coverage and government statements, not private negotiations. Tax "
        "incentive details should be verified with state economic "
        "development offices as programs may have changed. This dossier is "
        "a screening tool to narrow the field; it is not a substitute for "
        "on-the-ground due diligence."
    ),
}

# ── Endpoints ─────────────────────────────────────────────


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/screen")
async def screen(body: ScreenRequest):
    if not body.requirements.strip():
        return JSONResponse(
            status_code=400, content={"error": "requirements_missing"}
        )

    prompt = AGENT_PROMPT.replace("{{requirements}}", body.requirements)

    try:
        run = await asyncio.wait_for(
            asyncio.to_thread(
                get_client().run,
                engine="tim-claude",
                input={
                    "instructions": prompt,
                    "tools": TOOLS,
                    "answerFormat": SiteScreeningDossier,
                },
                options={"await_completion": True},
            ),
            timeout=900,
        )

        answer = run.result.answer

        # SDK returns answer as string — parse if needed
        if isinstance(answer, str) and answer.strip():
            try:
                dossier = json.loads(answer)
            except json.JSONDecodeError:
                return JSONResponse(
                    status_code=502,
                    content={
                        "error": "agent_failure",
                        "detail": "Response is not valid JSON",
                    },
                )
        elif isinstance(answer, dict):
            dossier = answer
        else:
            return JSONResponse(
                status_code=502,
                content={
                    "error": "agent_failure",
                    "detail": "Response missing required fields",
                },
            )

        if "candidate_markets" not in dossier:
            return JSONResponse(
                status_code=502,
                content={
                    "error": "agent_failure",
                    "detail": "Response missing candidate_markets",
                },
            )

        return dossier

    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=504, content={"error": "agent_timeout"}
        )
    except Exception as err:
        return JSONResponse(
            status_code=502,
            content={"error": "agent_failure", "detail": str(err)},
        )


@app.get("/api/screen/mock")
def screen_mock():
    return MOCK_DOSSIER
