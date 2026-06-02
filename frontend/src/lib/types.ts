export type ViabilitySignal = "strong" | "moderate" | "cautious";
export type PowerSignal = "favorable" | "mixed" | "constrained";
export type CommunitySignal = "supportive" | "mixed" | "hostile";
export type IncentivesSignal = "strong_incentives" | "moderate_incentives" | "weak_incentives";
export type HazardsSignal = "low_risk" | "moderate_risk" | "high_risk";

export interface CandidateMarket {
  rank: number; // assigned client-side after weighted sort
  market_name: string;
  overall_viability: ViabilitySignal;
  power: { summary: string; signal: PowerSignal };
  community_sentiment: { summary: string; signal: CommunitySignal };
  tax_and_incentives: { summary: string; signal: IncentivesSignal };
  natural_hazards: { summary: string; signal: HazardsSignal };
  connectivity: string;
  recent_activity: string;
  key_risks: string[];
  next_steps: string;
}

export interface DimensionWeights {
  power: number;
  community: number;
  tax: number;
  hazards: number;
}

export interface Dossier {
  executive_summary: string;
  candidate_markets: CandidateMarket[];
  markets_to_avoid: { market_name: string; reason: string }[];
  methodology_note: string;
  dimension_weights: DimensionWeights;
}
