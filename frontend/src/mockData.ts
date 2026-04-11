export const MOCK_DOSSIER = {
  executive_summary:
    "Based on comprehensive market research of Texas data center markets, this analysis evaluates four major metros for a 5MW colocation facility with a 24-month timeline. Texas offers significant advantages: deregulated energy markets (except Austin), competitive power costs 36-50% below national average, extensive fiber infrastructure via LOGIX and regional providers, and robust ERCOT grid management. The state is positioned to become the nation's top data center market by 2028. \n\nDallas-Fort Worth ranks first with the most mature ecosystem (168-190 data centers, 591 MW inventory), excellent power availability at $0.0334/kWh, and premier connectivity through DE-CIX and 80+ carriers. San Antonio emerges as second, demonstrating the strongest growth momentum (2.4x absorption rate) with competitive power costs and excellent disaster resilience. Houston ranks third, leveraging its energy infrastructure and strategic Latin America connectivity.\n\nAustin must be avoided despite its tech reputation due to regulated power markets causing 50% higher costs, persistent power constraints that delay projects, and infrastructure limitations that make the 24-month timeline highly risky.",
  candidate_markets: [
    {
      rank: 1,
      market_name: "Dallas-Fort Worth",
      overall_viability: "strong" as const,
      power: {
        summary:
          "Excellent power availability through deregulated ERCOT market with multiple utility options. Average power cost of $0.0334/kWh (47-50% below national average). Diverse energy mix including natural gas, wind, and solar. Current inventory of 591 MW with strong grid infrastructure. Build timelines approximately 18 months. Power transmission becoming more complex but manageable with proper planning.",
        signal: "favorable" as const,
      },
      community_sentiment: { summary: "", signal: "mixed" as const },
      tax_and_incentives: { summary: "", signal: "moderate_incentives" as const },
      natural_hazards: { summary: "", signal: "moderate_risk" as const },
      connectivity:
        "Premier connectivity infrastructure with LOGIX Fiber Networks (7,000+ route miles, 80+ connected data centers), DE-CIX Dallas (OIX-1 certified Internet Exchange), 130,000+ miles of fiber optic cable, and 80+ carrier options. Direct cloud on-ramps to AWS, Azure, and Google Cloud. Ranked #3 globally among established data center markets. Exceptional peering and network density.",
      recent_activity: "",
      key_risks: [
        "High competition for available capacity with 94.5% preleasing rate",
        "Power transmission constraints increasing in complexity",
        "Rising land prices due to strong demand",
        "18-month build timeline requires immediate action for 24-month deadline",
      ],
      next_steps:
        "Engage with colocation providers immediately to secure capacity. Prioritize operators with existing power allocations and established utility relationships. Verify specific substation capacity and interconnection timelines. Evaluate locations in Wilmer, Red Oak, Lancaster for newer infrastructure.",
    },
    {
      rank: 2,
      market_name: "San Antonio",
      overall_viability: "strong" as const,
      power: {
        summary:
          "Strong power availability through CPS Energy (municipal utility) with costs 36% below national average. Experiencing rapid growth with take-up momentum at 2.4x live supply, indicating strong market confidence. 44 operational data centers with expanding infrastructure. Power delivery timelines support 24-month deployment schedule.",
        signal: "favorable" as const,
      },
      community_sentiment: { summary: "", signal: "mixed" as const },
      tax_and_incentives: { summary: "", signal: "moderate_incentives" as const },
      natural_hazards: { summary: "", signal: "moderate_risk" as const },
      connectivity:
        "Good connectivity through LOGIX Fiber Networks regional connections, SAT-IX and FD-IX internet exchanges, and direct cloud on-ramps to Azure and Google Cloud. Known as 'Cyber City' with robust cybersecurity infrastructure. Network density lower than Dallas but sufficient for 5MW requirements. Strategic location for disaster recovery and business continuity services.",
      recent_activity: "",
      key_risks: [
        "Highest friction score in Texas due to commitments accumulating faster than construction (though driven by positive demand)",
        "Smaller carrier ecosystem compared to Dallas or Houston",
        "Rapid growth may strain infrastructure if not managed properly",
        "Less established market than Dallas-Fort Worth",
      ],
      next_steps:
        "Investigate mega-campus developments to assess construction capacity. Prioritize providers with construction underway or near-term delivery. Leverage market's disaster recovery positioning for differentiated service offerings. Confirm CPS Energy capacity allocations for target sites.",
    },
    {
      rank: 3,
      market_name: "Houston",
      overall_viability: "strong" as const,
      power: {
        summary:
          "Excellent power availability leveraging Houston's status as global energy capital. Centerpoint distribution with competitive provider choice in deregulated market. Abundant natural gas infrastructure with costs 36-47% below national average. Strong access to power generation resources. Infrastructure well-suited for data center loads with industrial heritage.",
        signal: "favorable" as const,
      },
      community_sentiment: { summary: "", signal: "mixed" as const },
      tax_and_incentives: { summary: "", signal: "moderate_incentives" as const },
      natural_hazards: { summary: "", signal: "moderate_risk" as const },
      connectivity:
        "Strong connectivity through LOGIX Fiber Networks connecting major Texas markets, HOUIX (Houston Internet Exchange) offering free multilateral peering, and strategic position as fiber landing point to Latin America. 49 operational data centers. Functions as gateway from South Central to Southeast US. Good carrier diversity though less dense than Dallas.",
      recent_activity: "",
      key_risks: [
        "Hurricane and coastal weather exposure requires careful site selection",
        "Smaller data center ecosystem (49 facilities) compared to Dallas",
        "Less tech-focused market culture compared to Dallas or Austin",
        "International connectivity focus may not align with domestic colocation needs",
      ],
      next_steps:
        "Prioritize inland sites away from coastal flood zones. Evaluate facilities with enhanced hurricane hardening and backup power systems. Assess HOUIX peering benefits for network strategy. Consider leveraging Houston's Latin America connectivity if serving international customers.",
    },
  ],
  markets_to_avoid: [
    {
      market_name: "Austin",
      reason:
        "Austin must be avoided due to regulated power market creating critical constraints: (1) Power costs are 50% higher than other Texas markets due to Austin Energy monopoly, significantly impacting operational economics for power-intensive colocation; (2) Persistent power availability constraints prevent many committed projects from progressing, with highest friction score indicating infrastructure cannot keep pace with demand; (3) Regulated market structure limits competition and flexibility compared to deregulated Dallas, Houston, and San Antonio; (4) 24-month timeline is at high risk as power constraints consistently delay large-format builds. Despite Austin's strong tech ecosystem and innovation reputation (Silicon Hills, 44 data centers, 1.54 GW market value), the combination of 50% higher power costs and limited availability make it unsuitable for a 5MW facility where power is the top priority.",
    },
  ],
  methodology_note: "",
};
