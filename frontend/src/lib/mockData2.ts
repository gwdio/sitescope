import type { Dossier } from "./types";

export const MOCK_QUERY_2 =
  "3–5 edge PoP sites across the US Southeast for real-time financial services workloads. 1 MW per site, co-location only, no greenfield. Sub-10 ms latency to Charlotte, Atlanta, Nashville, and Richmond metro areas. 9-month deployment target. Connectivity density and uptime reliability are the top priorities; power cost is secondary.";

export const MOCK_DOSSIER_2: Dossier = {
  executive_summary:
    "Three Southeast markets were evaluated for a financial services edge PoP deployment targeting sub-10 ms latency across the region's major metro corridors. At 1 MW per site in carrier-neutral co-location, the primary selection criteria are internet exchange presence, fiber route diversity, and utility reliability — not power cost or greenfield incentives, which are structurally inaccessible at this scale.\n\nCharlotte ranks first: the US-62 carrier corridor and the Cologix CLT campus provide the deepest IX fabric in the Southeast outside of Atlanta, with Tier 1 routes reaching all four target metros within the latency envelope. Nashville ranks second, offering the lowest-cost co-location of the three markets, a central position on the Southeast fiber backbone, and strong NES utility reliability — with a thin but improving IX presence. Richmond is included as a cautious recommendation: proximity to AWS us-east-1 in Northern Virginia is valuable for workloads with cloud dependencies, but Dominion Energy's constrained interconnection queue and Virginia's inaccessible data center tax exemption threshold significantly reduce the market's attractiveness at sub-5 MW scale.\n\nAtlanta is excluded despite its carrier density: 55 Marietta Street co-location vacancy has fallen below 2%, pricing for available space runs 50–70% above Charlotte comparables, and no new carrier-neutral inventory is expected within the 9-month deployment window. Miami is excluded on latency grounds — its distance from the interior Southeast puts Nashville and Richmond outside the sub-10 ms envelope.",

  candidate_markets: [
    {
      rank: 1,
      market_name: "Charlotte, NC",
      overall_viability: "strong",
      power: {
        summary:
          "Duke Energy Carolinas serves the market with highly reliable regulated rates averaging $0.071/kWh for commercial loads — above ERCOT deregulated rates but consistent and predictable with no retail competition volatility. Duke's transmission infrastructure in the Charlotte metro is robust; large commercial interconnection at the 1 MW scale closes in 4–6 months with no material queue congestion. The regulated structure suits a co-location deployment where the facility operator, not the tenant, carries utility risk. No supply reliability events in the Charlotte metro in the past five years.",
        signal: "favorable",
      },
      community_sentiment: {
        summary:
          "Pro-business environment with no organized opposition to data center or technology infrastructure development. Charlotte-Mecklenburg economic development actively recruits financial services infrastructure, reinforcing the market's existing position as the second-largest US banking center. City Council and county commissioners have approved co-location facility expansions without friction. The financial services cluster — Bank of America HQ, Wells Fargo East Coast operations, Truist — creates a culturally receptive environment for fintech infrastructure investment.",
        signal: "supportive",
      },
      tax_and_incentives: {
        summary:
          "North Carolina's data center tax incentive program (G.S. 105-164.13) provides a full sales and use tax exemption on qualifying data center equipment for facilities meeting a $75M investment threshold over five years — accessible to a multi-site operator pooling Charlotte with other NC deployments. Charlotte-Mecklenburg County offers One North Carolina Fund grants and Job Development Investment Grants (JDIG) for qualifying technology investments. Combined incentive packages at the 1 MW co-location scale, structured through a master service agreement, have delivered effective tax savings of $800K–1.5M over five years for comparable deployments.",
        signal: "strong_incentives",
      },
      natural_hazards: {
        summary:
          "Low-risk profile. Inland location eliminates coastal hurricane risk — Charlotte sits 230 miles from the Atlantic. No seismic exposure. Primary natural hazard is ice storm activity (1–2 significant events per year); Duke Energy's grid hardening program has reduced outage duration by 40% since 2018, and all major co-location facilities maintain N+1 UPS and generator capacity rated for 72-hour islanded operation. Tornado risk is below the Southeast average. Flood risk is minimal for sites above the Catawba River flood plain.",
        signal: "low_risk",
      },
      connectivity:
        "Southeast's strongest IX and carrier density outside Atlanta. Cologix CLT1 and CLT2 anchor the market; AT&T, Zayo, Crown Castle, Lumen, and Windstream all maintain lit routes along the US-62 and I-85 fiber corridors. CLNC-IX provides regional peering with 40+ networks. Direct on-ramps to AWS us-east-1 (via cross-connect to NoVa), Azure East US, and GCP us-east1. Measured latency: Atlanta 11 ms, Washington DC 8 ms, Nashville 9 ms, Richmond 6 ms — all four target metros within the sub-10 ms envelope.",
      recent_activity:
        "Cologix expanded CLT2 by 4 MW of raised-floor capacity (Q1 2024). QTS announced a 48 MW build-to-suit campus in the University Research Park corridor (Dec 2023). Bank of America completed a 2 MW private suite expansion at Cologix CLT1 for trading infrastructure (Q3 2023). Fiber construction along the Monroe Road corridor added two new diverse entry paths into the Cologix campus (Feb 2024).",
      key_risks: [
        "Cologix CLT1 and CLT2 retail suite availability is limited; 1 MW deployment may require a 4–6 month lead time for cage buildout or a pre-signed LOI to hold space",
        "Duke Energy regulated rate structure provides no mechanism for renewable energy direct procurement; green tariff options are limited to Duke's GreenSource Advantage program, which has a waitlist",
        "Charlotte's financial services concentration creates correlated demand spikes during market stress events — ensure diverse fiber entry paths to avoid single-corridor congestion",
      ],
      next_steps:
        "Issue RFP to Cologix, QTS, and Switch immediately to baseline cage and suite availability for a 1 MW deployment. Request a Duke Energy commercial interconnection feasibility study for each target facility to confirm timeline and rate schedule. Engage Charlotte-Mecklenburg Economic Development to structure a JDIG application ahead of lease signing. Confirm fiber entry path diversity with the co-location operator before executing the MSA.",
    },
    {
      rank: 2,
      market_name: "Nashville, TN",
      overall_viability: "strong",
      power: {
        summary:
          "Nashville Electric Service (NES), a TVA-sourced municipal utility, delivers among the most reliable power in the Southeast — NES recorded a system average interruption duration index (SAIDI) of 44 minutes in 2023, well below the national average of 120 minutes. Commercial rates average $0.068/kWh, slightly below Charlotte's Duke Energy rate. The TVA wholesale supply chain provides backstop resilience that investor-owned utilities in the region cannot match. Large commercial interconnection at 1 MW closes in 3–5 months. NES has no material large-load queue congestion at the 1–5 MW scale.",
        signal: "favorable",
      },
      community_sentiment: {
        summary:
          "Strongly pro-technology-infrastructure. Nashville Metro Council has approved all recent co-location and hyperscale expansions without opposition. The Mayor's office has actively positioned Nashville as a 'tech gateway' to the Southeast, and the Amazon HQ2 partial selection has normalized large technology investment in the region. No organized opposition groups targeting data center or network infrastructure development. The Gulch and MetroCenter business corridors are culturally aligned with tech investment.",
        signal: "supportive",
      },
      tax_and_incentives: {
        summary:
          "Tennessee has no state income tax, providing a structural cost advantage for operational entities. However, Tennessee does not offer a dedicated data center sales tax exemption comparable to North Carolina's program; equipment purchases are subject to the standard 7% state sales tax rate. The Tennessee FastTrack Infrastructure Development Program provides infrastructure grants for qualifying economic development projects, and Nashville's Metro Council has approved payment-in-lieu-of-taxes (PILOT) arrangements for technology investments. Net incentive value at 1 MW co-location scale is estimated at $300–600K over five years — meaningful but below the Charlotte benchmark.",
        signal: "moderate_incentives",
      },
      natural_hazards: {
        summary:
          "Low-risk profile for data center operations. Inland location eliminates coastal risk entirely. No seismic exposure. Primary hazard is tornado activity (avg. 2–3 significant events per year in Middle Tennessee); all major co-location facilities in the market are built to IBC wind zone standards with reinforced concrete construction. The May 2020 Nashville tornado caused no outages at any carrier-neutral facility. Flood risk exists along the Cumberland River corridor but is negligible for sites on elevated terrain in MetroCenter and the 100 Oaks corridor. NES grid hardening post-2020 has materially reduced storm restoration times.",
        signal: "low_risk",
      },
      connectivity:
        "Central position on the Southeast fiber backbone makes Nashville an efficient hub for regional traffic. Cologix NSH1 anchors the market; AT&T, Zayo, Lumen, and Crown Castle maintain lit I-65 corridor routes connecting Chicago to Atlanta through Nashville. NASH-IX is smaller than CLNC-IX but growing, with 25+ connected networks. Cloud on-ramps to AWS us-east-2 (Ohio) via Zayo express route (12 ms), Azure East US 2, and GCP us-east1 (Atlanta). Measured latency: Charlotte 9 ms, Atlanta 7 ms, Chicago 12 ms, Richmond 14 ms — all target metros within envelope.",
      recent_activity:
        "Cologix NSH1 completed a 3 MW capacity expansion (Q4 2023). Switch announced a Nashville campus in the Antioch corridor with 20 MW initial phase (Jan 2024). Amazon Web Services expanded its Nashville technical operations hub by 200 engineers, driving increased demand for local infrastructure. AT&T completed a dark fiber ring expansion in the MetroCenter corridor, adding two new diverse entry paths to Cologix NSH1 (Q1 2024).",
      key_risks: [
        "NASH-IX is growing but not yet at the density of Charlotte or Atlanta; workloads with heavy regional peering requirements may require additional transit spend",
        "Tennessee's lack of a data center equipment tax exemption increases CapEx by approximately 7% on hardware purchased for the facility versus a North Carolina deployment",
        "Nashville's rapid growth is attracting hyperscale development that may increase competition for Cologix capacity in 2025–2026; securing space by Q3 2024 is advisable",
      ],
      next_steps:
        "Issue RFP to Cologix NSH1 and Switch Nashville for 1 MW cage or suite availability. Confirm AT&T and Zayo diverse fiber entry path availability at each facility. Engage Tennessee Department of Economic and Community Development for FastTrack grant pre-qualification. Evaluate NASH-IX peering policy to assess whether transit costs offset the exchange's limited current density.",
    },
    {
      rank: 3,
      market_name: "Richmond, VA",
      overall_viability: "cautious",
      power: {
        summary:
          "Dominion Energy Virginia serves the market, but Northern Virginia hyperscaler demand — the largest concentration of data center load in the world — has created significant interconnection queue congestion that is now spilling into the Richmond metro. New 1 MW commercial interconnection requests in the Richmond market are experiencing 14–20 month timelines, well above the 9-month deployment target. Dominion's rate schedule for large commercial loads averages $0.081/kWh, the highest of the three evaluated markets. Existing co-location facilities with available cage capacity sidestep the interconnection queue entirely, making facility selection critical to timeline viability.",
        signal: "constrained",
      },
      community_sentiment: {
        summary:
          "Generally permissive but not actively pro-data-center. Richmond City Council has not opposed co-location facility expansions but does not have an active economic development program targeting data center investment. The presence of QTS RIC1 and a modest colocation ecosystem normalizes the infrastructure category. Some residential opposition has emerged in the Henrico County corridor against proposed hyperscale campuses (not co-location), creating a general climate of scrutiny for large industrial energy users. A co-location deployment within an existing facility will not encounter this friction.",
        signal: "mixed",
      },
      tax_and_incentives: {
        summary:
          "Virginia's data center tax incentive program (Va. Code §58.1-609.3) provides a sales and use tax exemption on qualifying equipment, but requires a minimum $150M investment over three years — structurally inaccessible for a 1 MW single-site or even a five-site portfolio at this scale. Richmond and Henrico County do not offer site-specific equipment tax abatements or PILOT arrangements for co-location tenants. The absence of an accessible incentive framework at sub-hyperscale investment levels means a Richmond deployment will carry the full Virginia tax burden on equipment purchases. This is the weakest incentive environment of the three evaluated markets.",
        signal: "weak_incentives",
      },
      natural_hazards: {
        summary:
          "Low natural hazard risk. Inland location (100 miles from coast) substantially reduces hurricane exposure — tropical storm remnants occasionally affect the region but rarely cause extended outages at hardened facilities. No seismic exposure. Primary risk is winter ice events (2–3 per year); QTS RIC1 and other established facilities are fully hardened and generator-backed. Flood risk is low for sites above the James River flood plain. The risk profile compares favorably to Charlotte and Nashville.",
        signal: "low_risk",
      },
      connectivity:
        "Primary value proposition. Richmond sits on the high-density fiber corridor between Northern Virginia (AWS us-east-1) and the Southeast, with Segra, Lumos, Zayo, and Lumen all maintaining lit diverse routes. QTS RIC1 provides carrier-neutral co-location with direct cross-connects to the AWS NoVa campus (35 ms to us-east-1 origin). RICA-IX is small (12 connected networks) but present. Measured latency: Washington DC 4 ms, Charlotte 6 ms, New York 6 ms. The proximity to the largest cloud concentration in the world is Richmond's primary differentiator for latency-sensitive financial workloads with cloud dependencies.",
      recent_activity:
        "QTS RIC1 completed a 2 MW cage expansion serving financial services tenants (Q2 2023). Dominion Energy filed a transmission expansion plan with FERC that includes Richmond-area substation upgrades, with completion expected 2026–2027. Segra completed a fiber ring extension into the QTS RIC1 campus, adding a third diverse entry path (Q4 2023). Two Richmond-area hyperscale campus proposals drew Henrico County planning board scrutiny in 2023, contributing to the current permitting sensitivity.",
      key_risks: [
        "Dominion Energy interconnection queue congestion (14–20 months) means only co-location in facilities with existing utility service is viable within the 9-month deployment window — greenfield or shell space is not an option",
        "Virginia's $150M investment threshold for data center equipment tax exemptions is inaccessible at 1 MW scale; full equipment tax burden adds approximately 7% to hardware CapEx versus a qualifying NC deployment",
        "QTS RIC1 is the primary carrier-neutral option; limited competitive co-location alternatives reduces negotiating leverage on pricing and SLA terms",
        "Dominion's high commercial rate ($0.081/kWh) combined with NoVa-driven rate proceedings creates upward rate pressure; lock-in provisions in co-location MSA should be a negotiating priority",
      ],
      next_steps:
        "Limit Richmond evaluation to existing co-location inventory at QTS RIC1 — do not consider shell space or powered shell, as Dominion interconnection timelines make these non-viable. Issue a targeted RFP to QTS for 1 MW cage availability, specifying 90-day or less delivery. Obtain Segra and Zayo fiber route quotes for diverse entry paths. Model the 7% equipment tax cost differential against Richmond's cloud proximity advantage to determine net economics for this specific workload profile.",
    },
  ],

  markets_to_avoid: [
    {
      market_name: "Atlanta, GA",
      reason:
        "Carrier-neutral co-location vacancy in Atlanta has fallen below 2% metro-wide. 55 Marietta Street — the primary IX hub — has no available cage or suite space; pricing on the secondary market runs 50–70% above Charlotte comparables for equivalent power density. Switch, QTS, and Compass all report fully committed inventory through at least Q4 2024. No new carrier-neutral inventory is expected to deliver within the 9-month deployment window. Atlanta is a viable long-term market but cannot support the required deployment timeline.",
    },
    {
      market_name: "Miami, FL",
      reason:
        "Miami's NAP of the Americas campus is operating near capacity, with available co-location space limited to small cages at premium pricing. More critically, Miami's geographic position places Nashville (35 ms) and Richmond (42 ms) outside the sub-10 ms latency requirement for this deployment. Miami is well-suited for Latin American edge workloads but structurally misaligned with a Southeast-interior latency target.",
    },
  ],

  dimension_weights: { power: 2, community: 2, tax: 3, hazards: 4 },
};
