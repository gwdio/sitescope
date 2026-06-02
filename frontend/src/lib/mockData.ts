import type { Dossier } from "./types";

export const MOCK_DOSSIER: Dossier = {
  executive_summary:
    "This analysis evaluates Texas data center markets for a 5 MW colocation deployment with a 24-month delivery requirement. Texas offers a compelling combination of deregulated power markets, aggressive tax incentive frameworks, and mature fiber infrastructure — factors that have positioned the state to surpass Northern Virginia as the largest data center market by capacity by 2027.\n\nDallas-Fort Worth ranks first on the strength of its mature carrier ecosystem, sub-$0.034/kWh deregulated power, and active 381 Economic Development Agreement pipeline that can compress effective land costs by 60–80% over ten years. San Antonio ranks second as the highest-growth submarket in Texas, with CPS Energy's municipal utility structure providing rate stability and a military-adjacent cybersecurity cluster driving sustained demand. Houston ranks third, offering strong power infrastructure and a unique Latin American connectivity gateway, offset by hurricane exposure and degraded grid resilience following Hurricane Beryl.\n\nAustin is excluded: regulated Austin Energy rates run 55–70% above the ERCOT deregulated average, interconnection queues exceed 18 months for large loads, and recent City Council actions signal increasing friction for large industrial energy consumers. The 24-month delivery target is not achievable under current Austin Energy queue conditions.",

  candidate_markets: [
    {
      rank: 1,
      market_name: "Dallas-Fort Worth",
      overall_viability: "strong",
      power: {
        summary:
          "Deregulated ERCOT market with direct access to 30+ retail energy providers. Nodal pricing at the NRTH hub averages $0.033–0.036/kWh for commercial loads, 44% below the national average. Oncor and TNMP serve the metro; both have active transmission expansion programs with ERCOT's 2024 CDR showing positive reserve margins through 2026. Multiple substations with available capacity in Garland, Mesquite, and the Stemmons Corridor. Large-load interconnection (5 MW+) typically closes in 9–14 months with a pre-application filed.",
        signal: "favorable",
      },
      community_sentiment: {
        summary:
          "Strongly pro-development across Collin, Dallas, and Tarrant counties. Local economic development councils actively recruit data center operators; Allen, Garland, and Grand Prairie have each approved facility permits within the past 18 months without community opposition. The DFW tech corridor narrative — anchored by AT&T, Texas Instruments, and a dense cloud-tenant base — creates a politically receptive environment. No organized opposition groups identified. Allen ISD and Garland ISD have both publicly supported HB 5 appraised value limitation agreements for data center investments.",
        signal: "supportive",
      },
      tax_and_incentives: {
        summary:
          "Texas HB 5 (2023) framework allows 10-year appraised value limitations on real and personal property for qualifying data centers. DFW submarkets routinely negotiate Chapter 381 Economic Development Agreements with municipalities, providing additional tax rebates of 25–50% on city and county levies. The Texas Data Center Exemption (Sec. 151.359) eliminates sales and use tax on qualifying equipment purchases for facilities meeting the 200 MW or $200M investment thresholds — operators in a campus context can pool to qualify. Effective all-in incentive packages in this market reduce 10-year operating costs by an estimated $8–12M per 5 MW deployment.",
        signal: "strong_incentives",
      },
      natural_hazards: {
        summary:
          "Low-risk profile for data center operations. Primary hazard is EF1–EF2 tornado activity (avg. 4–6 events per year within 50 miles); standard tilt-up concrete construction with reinforced roof systems fully mitigates this risk class, and all major operators in the market build to this standard. No seismic exposure, no coastal flooding risk, no wildfire interface zone. Winter ice events are the secondary concern: DFW sits in a more favorable thermal zone than Central Texas, and post-Uri ERCOT weatherization mandates have substantially reduced grid vulnerability to sustained cold events.",
        signal: "low_risk",
      },
      connectivity:
        "Premier carrier-neutral density. DE-CIX Dallas (OIX-1 certified) operates the primary internet exchange with 200+ connected networks. LOGIX Fiber Networks provides 7,200+ route-miles of owned dark fiber across the metro. The Equinix DA1–DA11 campus in West Dallas anchors the ecosystem; 80+ carriers maintain PoPs. Direct cloud on-ramps to AWS us-east-2 Dallas edge, Azure South Central US, and GCP us-south1. Zayo and Windstream provide subsea-adjacent connectivity to East and West Coast hubs. Measured round-trip latency to Chicago: 28 ms; New York: 42 ms.",
      recent_activity:
        "Switch announced a 1.2 GW campus in the Lufkin corridor (Jan 2024). QTS broke ground on a 400 MW hyperscale expansion in Irving (Q3 2023). Aligned Data Centers secured 200 acres in Grand Prairie with 500 MW planned capacity (Dec 2023). Microsoft and Google each expanded existing Texas footprints by more than 100 MW in 2023. Colocation absorption hit 94.5% preleasing across existing inventory, driving 14% YoY rent escalation for retail colo.",
      key_risks: [
        "Near-term capacity tight: 94.5% preleasing leaves fewer than 30 MW of uncommitted retail colo available metro-wide; 5 MW commitment likely requires a 12–18 month forward booking",
        "Power transmission congestion in North Dallas increasing; Oncor CPCN filings face PUCT review delays averaging 8 months",
        "Land costs in established corridors (Plano, Irving, Richardson) up 35% YoY; greenfield sites require new substation investment not captured in standard lease economics",
        "18-month interconnection timeline creates execution risk against 24-month delivery target — requires immediate pre-application filing to stay on schedule",
      ],
      next_steps:
        "File ERCOT large-load interconnection pre-application for target sites in Q1. Engage QTS, Compass, and Aligned Data Centers for forward capacity commitments — all three have sub-12-month delivery inventory. Issue RFP to Oncor and TNMP concurrently to baseline available substation capacity. Retain Texas economic development counsel to initiate Chapter 381 Agreement negotiations with Garland and Grand Prairie before site selection closes.",
    },
    {
      rank: 2,
      market_name: "San Antonio",
      overall_viability: "moderate",
      power: {
        summary:
          "CPS Energy, the nation's largest municipally owned utility, serves the market with stable regulated rates averaging $0.038/kWh for large commercial loads — competitive but 10–15% above the DFW deregulated floor. The municipal structure eliminates retail competition risk but also removes the ability to shop providers or hedge via direct PPA. CPS has publicly committed to 50% renewable generation by 2030 and offers a green tariff option. Active large-load queue: 3 GW of data center requests currently in interconnection study, implying 14–20 month interconnection timelines for new 5 MW applications.",
        signal: "favorable",
      },
      community_sentiment: {
        summary:
          "Mixed signals. City Council approved three data center permits in 2023 without opposition, and the city's 'Cyber City' economic development brand reflects genuine government support. However, two advocacy groups — Neighbors for Responsible Growth and the Texas Environmental Justice Coalition — have begun intervening in large industrial water-use permit proceedings, which is directly relevant for liquid-cooled deployments. Bexar County Judge's office actively courts data center investment and maintains a favorable working relationship with CPS Energy's large-load team. Net: supportive at the government level, emerging friction at the community level for facilities with high water or visual impact.",
        signal: "mixed",
      },
      tax_and_incentives: {
        summary:
          "Bexar County participates in the HB 5 appraised value limitation framework, though negotiations have historically been less aggressive than DFW counterparts. San Antonio's Chapter 380 economic development agreements provide city sales tax rebates of 15–30% on qualifying investments. The Texas Data Center Exemption applies but the $200M threshold requires multi-tenant or phased commitment to achieve for a single 5 MW facility. CPS Energy offers large-load economic development rates that reduce effective energy costs 8–12% for multi-year commitments above 2 MW. Net incentive value estimated at $4–6M over 10 years for a standalone 5 MW deployment.",
        signal: "moderate_incentives",
      },
      natural_hazards: {
        summary:
          "Favorable natural hazard profile. Inland location (150 miles from coast) eliminates hurricane risk entirely. No seismic exposure. Primary site-selection risk is flash flooding in low-lying areas draining the Edwards Plateau; the northwest I-10 corridor and the Schertz/Seguin submarkets are both above the 100-year flood plain and represent the preferred development zone. Tornado frequency is lower than DFW (avg. 1–2 relevant events per year). Winter storm risk is moderate: CPS Energy completed ERCOT-mandated weatherization post-Uri, reducing outage risk, but February 2021 demonstrated municipal utility vulnerability to extended cold events.",
        signal: "low_risk",
      },
      connectivity:
        "Solid regional connectivity with room to grow. SAT-IX and FD-IX provide internet exchange options; carrier count (22 major PoPs) is adequate for 5 MW colocation but thin compared to DFW. LOGIX and Zayo maintain metro fiber rings with reasonable diversity. Direct cloud on-ramps to Azure South Central US (San Antonio AZ) and limited AWS connectivity via Dallas cross-connects. Latency to DFW: 8 ms. Primary gap: no submarine cable access and limited on-net path diversity for international traffic — workloads requiring Latin American reach should route through Houston.",
      recent_activity:
        "Vantage Data Centers broke ground on a 36 MW, three-building campus on the northwest side (Q2 2023). Stream Data Centers opened a 16 MW facility in Live Oak (Jan 2024). CPS Energy approved three new large-load service agreements totaling 85 MW in H2 2023. USAA expanded its on-premises data center footprint by 12 MW for financial services resilience. The market absorbed 2.4x its live supply in 2023, the highest absorption ratio of any Texas submarket.",
      key_risks: [
        "CPS Energy interconnection queue at 3 GW creates a 14–20 month timeline risk against the 24-month delivery target — queue position must be established immediately",
        "Municipal utility structure prevents direct PPA or competitive retail energy procurement; all rate risk sits with CPS Energy's regulatory calendar",
        "Water-use opposition emerging; liquid-cooled deployments may face additional permitting scrutiny and 3–6 month delays in Bexar County",
        "Carrier ecosystem is thin relative to DFW; achieving redundant diverse-path connectivity requires an active cross-connect procurement strategy",
      ],
      next_steps:
        "Submit CPS Energy large-load application immediately to establish queue position ahead of further demand accumulation. Evaluate Vantage and Stream facilities for sublease or shell capacity — both have near-term availability that sidesteps the interconnection queue. Request Bexar County economic development pre-consultation to scope HB 5 eligibility and 380 Agreement structure. If liquid cooling is in scope, engage the Bexar County water authority early to pre-empt permitting friction before site selection locks.",
    },
    {
      rank: 3,
      market_name: "Houston",
      overall_viability: "moderate",
      power: {
        summary:
          "Deregulated ERCOT market with CenterPoint Energy as the transmission and distribution provider. Wholesale power costs are competitive at $0.034–0.040/kWh, but CenterPoint's distribution infrastructure sustained significant damage in Hurricane Beryl (July 2024), with some commercial customers experiencing 7–14 day outages. CenterPoint's $6B infrastructure recovery and resilience filing with PUCT (Aug 2024) outlines improvement timelines through 2027, but near-term distribution reliability is below DFW standard. On-site generation sized for 72-hour islanded operation is effectively required. ERCOT South Hub nodal pricing is historically more volatile during summer peaks than NRTH Hub; energy cost hedging is necessary for predictable OpEx.",
        signal: "mixed",
      },
      community_sentiment: {
        summary:
          "Industrial culture broadly accepts large-load infrastructure, and the Port of Houston economic development arm actively recruits tech investment. However, environmental advocacy is more active in Harris County than other Texas markets: Air Alliance Houston and Texas Campaign for the Environment have engaged in recent industrial permit proceedings. Two proposed data center campuses near residential corridors in Katy and Pearland faced community opposition in 2023, leading to redesigns that delayed timelines by 4–6 months. Sites in established industrial zones — the Northwest Houston corridor, Greens Road, and Beltway 8 — avoid this friction entirely.",
        signal: "mixed",
      },
      tax_and_incentives: {
        summary:
          "Harris County participates in HB 5 appraised value limitations and Houston offers Chapter 380 agreements, but incentive packages are less developed than in DFW or San Antonio. Houston's economic development focus skews toward energy sector, manufacturing, and port logistics; data center-specific agreements require more negotiation groundwork. Some operators have successfully negotiated property tax abatements through the Houston-Galveston Area Council, but timelines are longer and outcomes less predictable. The Texas Data Center Exemption applies. Net incentive value estimated at $2–4M over 10 years for a 5 MW deployment — the weakest incentive environment of the three recommended markets.",
        signal: "moderate_incentives",
      },
      natural_hazards: {
        summary:
          "Elevated risk profile relative to other Texas markets. Hurricane exposure is material: Category 3+ storms make direct landfall within 150 miles of Houston every 8–12 years on average; Beryl (2024), Harvey (2017), and Ike (2008) each caused significant infrastructure disruption. Flooding is the primary data center risk — Harris County carries the highest FEMA flood claim density in the US. Site selection must target locations above the 500-year flood plain; northwest corridors (Cypress, Katy, north Fort Bend County) meet this standard while low-lying areas near the Ship Channel and Galveston Bay do not. Total site hardening cost premium vs. DFW estimated at $2–4M for a 5 MW facility.",
        signal: "moderate_risk",
      },
      connectivity:
        "Strongest international connectivity of any Texas market. HOUIX (Houston Internet Exchange) provides free multilateral peering with 60+ networks. Houston is the US terminus for multiple subsea cable systems serving Latin America — AMX-1, ARCOS, and SAm-1 — providing low-latency paths to Mexico City (22 ms), Bogotá (48 ms), and São Paulo (105 ms). 49 operational data centers; Zayo, Windstream, and AT&T maintain dense metro rings. Carrier count (35 major PoPs) is below DFW but above San Antonio. Cloud connectivity available via Azure South Central US and AWS us-east-2 edge. HOUIX traffic grew 34% YoY as streaming and gaming operators expanded Latin American PoPs.",
      recent_activity:
        "CloudHQ announced a 72 MW campus in Northwest Houston (Q4 2023). Compass Data Centers expanded its Greens Road facility by 24 MW (Jan 2024). CenterPoint filed its $6B infrastructure recovery plan with PUCT following Hurricane Beryl (Aug 2024). Sabey Data Centers acquired a 40-acre greenfield site in Katy with 200 MW planned capacity. HOUIX recorded its highest-ever traffic volumes in Q3 2024, driven by Latin American streaming and AI inference workloads.",
      key_risks: [
        "CenterPoint grid resilience degraded post-Beryl; on-site generation requirement adds $1.5–2.5M to facility CapEx for a 5 MW build",
        "Flood risk demands premium site selection — 500-year flood plain parcels command a 20–30% land cost premium over 100-year sites, and due diligence must include FEMA FIRM map review",
        "Environmental permitting in Harris County may extend development timelines by 3–6 months versus DFW, particularly for sites with stormwater management complexity",
        "ERCOT South Hub summer price spikes create OpEx variability; unhedged energy exposure could increase annual power costs by 15–25% in extreme heat years",
      ],
      next_steps:
        "Restrict initial site search to northwest Harris County and Fort Bend County corridors above the 500-year flood plain. Spec on-site generation at 72-hour islanded capacity before issuing the RFP. Engage HOUIX directly — co-location within an HOUIX-connected facility captures the Latin American connectivity premium that differentiates Houston from DFW and San Antonio. Issue parallel RFPs to CenterPoint and ERCOT REPs to model delivered energy cost under hedged and spot pricing scenarios before committing to a site.",
    },
  ],

  markets_to_avoid: [
    {
      market_name: "Austin",
      reason:
        "Austin Energy's regulated monopoly structure makes this market unviable for large-load data center deployment at current economics. Effective commercial rates run $0.057–0.063/kWh — 55–70% above the DFW deregulated average — with no mechanism for competitive rate negotiation or direct renewable PPA. Large-load interconnection queues currently exceed 18 months with no priority pathway for data centers. The Austin City Council's 2023 resolution directing Austin Energy to study data center load caps introduces active regulatory risk: facilities approved today could face surcharges or curtailment orders before the end of their first lease term. Despite Austin's tech ecosystem, talent density, and 44 existing facilities, power cost alone makes a 5 MW facility operationally uncompetitive against DFW or San Antonio, and the 24-month delivery target is not achievable under current queue conditions.",
    },
  ],

  dimension_weights: { power: 5, community: 3, tax: 2, hazards: 2 },
};
