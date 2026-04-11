from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/hello")
def hello(name: str = "world"):
    return {"message": f"Hello, {name}!"}


@app.get("/api/screen/mock")
def screen_mock():
    return {
        "executive_summary": (
            "Screening identified three viable Sun Belt and Midwest markets for a 50MW hyperscale AI training facility "
            "with a 24-month energization target. Phoenix metro offers the strongest near-term power availability and "
            "established hyperscale precedent, despite mixed community sentiment around water use. Columbus presents a "
            "favorable regulatory climate and grid investment pipeline but faces tighter near-term capacity. San Antonio "
            "carries execution risk due to ERCOT interconnection timelines and recent utility rate proceedings."
        ),
        "candidate_markets": [
            {
                "rank": 1,
                "market_name": "Phoenix Metro (West Valley)",
                "overall_viability": "strong",
                "power": {
                    "summary": (
                        "APS and SRP both have large-load programs with dedicated hyperscale teams. Multiple substations "
                        "in Goodyear and Buckeye corridors can support 50MW within 18–22 months. SRP has publicly "
                        "committed to 2GW of new large-load capacity by 2027."
                    ),
                    "signal": "favorable",
                },
                "community_sentiment": {
                    "summary": (
                        "Strong municipal support in Goodyear and Avondale, with both cities actively recruiting "
                        "hyperscale tenants. Some organized opposition from water-rights groups given the state's ongoing "
                        "drought conditions; low-water-use commitments significantly reduce friction."
                    ),
                    "signal": "mixed",
                },
                "tax_and_incentives": {
                    "summary": (
                        "Arizona offers a datacenter sales tax exemption on servers and power infrastructure (TPT "
                        "exemption, ARS §42-5159). Maricopa County has approved GPLET agreements for qualifying "
                        "facilities. Combined state and local incentive stack is competitive."
                    ),
                    "signal": "strong_incentives",
                },
                "natural_hazards": {
                    "summary": (
                        "Flood risk minimal in West Valley elevated sites. No significant seismic exposure. Primary "
                        "hazard is extreme heat (115°F+ design days), which increases cooling CAPEX but is well-understood "
                        "and manageable. No tornado or hurricane exposure."
                    ),
                    "signal": "low_risk",
                },
                "connectivity": (
                    "Excellent fiber density along I-10 and Loop 303 corridors. Lumen, Zayo, and CenturyLink all have "
                    "lit routes. Phoenix is a Tier 1 internet exchange hub (PhxIX). Round-trip latency to LA under 15ms, "
                    "Denver under 20ms."
                ),
                "recent_activity": (
                    "Microsoft announced 800MW Phoenix expansion in Q1 2024. Meta's Mesa campus reached 500MW total. "
                    "Google broke ground on 300MW Goodyear campus in late 2023. High developer activity may increase "
                    "competition for utility capacity and shovel-ready land."
                ),
                "key_risks": [
                    "Water scarcity creates reputational and regulatory risk; dry-cooling or hybrid cooling required to maintain community license to operate",
                    "Utility queue congestion rising as hyperscale demand surges — early utility engagement critical to secure 2025–2026 energization windows",
                    "Land costs in established corridors have increased 35–50% YoY; off-corridor sites require infrastructure investment",
                ],
                "next_steps": (
                    "Engage APS Large Load team and SRP Economic Development within 30 days to assess available substation "
                    "capacity for a 50MW load. Issue an RFP to 3–4 West Valley land brokers for site options in Goodyear, "
                    "Buckeye, and Surprise. Initiate water-use analysis to model dry-cooling feasibility at the target density."
                ),
            },
            {
                "rank": 2,
                "market_name": "Columbus Metro (New Albany Technology Corridor)",
                "overall_viability": "moderate",
                "power": {
                    "summary": (
                        "AEP Ohio serves the New Albany corridor and has invested in transmission upgrades driven by Intel "
                        "and Google campuses. Near-term 50MW blocks are constrained through mid-2025, but AEP's Capital "
                        "South substation expansion (scheduled Q3 2025) should open capacity."
                    ),
                    "signal": "mixed",
                },
                "community_sentiment": {
                    "summary": (
                        "New Albany and Licking County are among the most datacenter-friendly jurisdictions in the Midwest. "
                        "Township trustees have approved multiple hyperscale sites without significant opposition. Intel's "
                        "$20B Ohio One campus has normalized large industrial development in the region."
                    ),
                    "signal": "supportive",
                },
                "tax_and_incentives": {
                    "summary": (
                        "Ohio offers a 100% sales tax exemption on datacenter equipment (ORC §5739.02) and a 15-year "
                        "property tax abatement via the Enterprise Zone program. New Albany has approved TIF arrangements "
                        "for qualifying projects. One of the strongest incentive environments in the country."
                    ),
                    "signal": "strong_incentives",
                },
                "natural_hazards": {
                    "summary": (
                        "Central Ohio has no significant seismic, hurricane, or flood risk. Tornado risk is present but "
                        "below average for the Midwest; sites are designed to F3 wind loading standards. Mild climate "
                        "reduces cooling load versus Sun Belt alternatives."
                    ),
                    "signal": "low_risk",
                },
                "connectivity": (
                    "Columbus sits on multiple Tier 1 backbone routes between Chicago and the Mid-Atlantic. Zayo, "
                    "Windstream, and AT&T all have diverse fiber routes. Latency to Chicago under 10ms, NYC under 15ms."
                ),
                "recent_activity": (
                    "Google's New Albany campus reached 1GW total capacity in 2023. Amazon AWS announced a $7.8B Ohio "
                    "investment in 2024. Intel Ohio One construction ongoing with expected 2026 partial completion. "
                    "Strong institutional activity validates the market but increases grid pressure."
                ),
                "key_risks": [
                    "AEP capacity queue is congested through mid-2025; a 50MW project targeting 24-month energization must enter queue by Q2 2024 to hit the timeline",
                    "Labor and construction costs elevated due to Intel and AWS activity drawing on the same contractor pool",
                ],
                "next_steps": (
                    "Contact AEP Ohio Economic Development to obtain a formal capacity assessment for the New Albany "
                    "substation area. Engage Licking County and New Albany planning offices to confirm site availability "
                    "in the Technology Corridor. Evaluate timing relative to Intel construction labor demand."
                ),
            },
            {
                "rank": 3,
                "market_name": "San Antonio Metro (Brooks City-Base / South Side)",
                "overall_viability": "cautious",
                "power": {
                    "summary": (
                        "CPS Energy serves San Antonio and has been adding generation capacity, but ERCOT interconnection "
                        "timelines remain the primary constraint. A 50MW project entering interconnection today faces a "
                        "28–36 month timeline under current queue backlogs. CPS's TechQ program offers some prioritization "
                        "but has not consistently compressed timelines for hyperscale loads."
                    ),
                    "signal": "constrained",
                },
                "community_sentiment": {
                    "summary": (
                        "City Council and the Mayor's office have been supportive of datacenter investment as part of the "
                        "Brooks City-Base redevelopment strategy. No organized community opposition identified. CPS Energy's "
                        "rate proceedings drew some criticism from commercial ratepayers in 2023, but not directed at "
                        "datacenter tenants specifically."
                    ),
                    "signal": "mixed",
                },
                "tax_and_incentives": {
                    "summary": (
                        "Texas offers a sales tax exemption on qualifying datacenter equipment under HB 2592 (requires "
                        "$200M+ investment over 5 years). Chapter 380 agreements available through City of San Antonio. "
                        "Incentive stack is competitive but contingent on investment thresholds."
                    ),
                    "signal": "moderate_incentives",
                },
                "natural_hazards": {
                    "summary": (
                        "Primary risks are severe weather events and ERCOT grid stability. Winter Storm Uri (2021) exposed "
                        "grid reliability risk; ERCOT has since added reserve margin, but risk remains elevated versus "
                        "non-ERCOT markets. Flood risk in some South Side areas; hail and severe thunderstorm risk above "
                        "national average."
                    ),
                    "signal": "moderate_risk",
                },
                "connectivity": (
                    "San Antonio has multiple fiber routes along I-10 and I-35. AT&T, Zayo, and Lumen all provide diverse "
                    "routes. Connectivity is adequate but thinner than Phoenix or Columbus for network-critical workloads. "
                    "Latency to Dallas under 5ms, Austin under 3ms."
                ),
                "recent_activity": (
                    "Amazon AWS opened a 200MW campus in 2022. Iron Mountain acquired a 50MW colocation asset in 2023. "
                    "CPS Energy launched a Flex Power program for large industrial customers following Uri. Activity is "
                    "growing but the market is less saturated than Phoenix."
                ),
                "key_risks": [
                    "ERCOT interconnection timeline of 28–36 months likely exceeds the 24-month grid-ready requirement without extraordinary CPS TechQ prioritization",
                    "ERCOT grid reliability risk during weather extremes; on-site generation or battery backup at scale required for Tier III+ uptime",
                    "Investment thresholds for Texas sales tax exemption may require phased commitment documentation",
                ],
                "next_steps": (
                    "Request a formal large-load feasibility study from CPS Energy to determine whether TechQ "
                    "prioritization can compress the interconnection timeline to 24 months. If timeline cannot be "
                    "confirmed within 60 days, deprioritize in favor of Phoenix or Columbus. Obtain flood plain maps "
                    "for candidate South Side parcels."
                ),
            },
        ],
        "markets_to_avoid": [
            {
                "market_name": "Las Vegas Metro",
                "reason": (
                    "NV Energy's large-load queue is fully subscribed through 2027 with hyperscale commitments from "
                    "Google, Microsoft, and Switch. No viable path to 50MW energization within 24 months. Extreme heat "
                    "combined with severe water scarcity makes the market unattractive for new entrants at this time."
                ),
            },
            {
                "market_name": "California (Inland Empire)",
                "reason": (
                    "CAISO interconnection timelines averaging 4+ years for new large loads. State utility regulatory "
                    "environment has imposed large-load moratoria in several SCE and PG&E service territories. High "
                    "construction labor costs and state property tax exposure erode the incentive stack. Not viable for "
                    "a 24-month timeline."
                ),
            },
        ],
        "methodology_note": (
            "This dossier was produced by the SiteScope AI research agent using public sources including utility "
            "commission filings, state legislative records, county assessor data, and industry reporting. Power "
            "availability assessments reflect publicly disclosed utility programs and interconnection queue data as of "
            "Q1 2024. Incentive structures are subject to annual legislative change and project-specific negotiation. "
            "This analysis should be treated as an initial screening tool; site-specific due diligence, utility load "
            "studies, and legal review are required before any capital commitment."
        ),
    }
