import React from "react";
import SignalDot from "./SignalDot";
import ViabilityBadge from "./ViabilityBadge";
import { SIGNALS, SIGNAL_COLORS } from "../lib/signals";
import { parseMarketName } from "../lib/parseMarketName";
import type { SignalKey } from "../lib/signals";
import type { CandidateMarket } from "../lib/types";

interface Props {
  market: CandidateMarket;
}

interface DimConfig {
  label: string;
  hasSignal: true;
  getSignal: (m: CandidateMarket) => SignalKey;
  getSummary: (m: CandidateMarket) => string;
}

interface TextConfig {
  label: string;
  hasSignal: false;
  getText: (m: CandidateMarket) => string;
}

type DimRow = DimConfig | TextConfig;

const DIMS: DimRow[] = [
  {
    label: "Power & Grid",
    hasSignal: true,
    getSignal: (m) => m.power.signal,
    getSummary: (m) => m.power.summary,
  },
  {
    label: "Community Sentiment",
    hasSignal: true,
    getSignal: (m) => m.community_sentiment.signal,
    getSummary: (m) => m.community_sentiment.summary,
  },
  {
    label: "Tax & Incentives",
    hasSignal: true,
    getSignal: (m) => m.tax_and_incentives.signal,
    getSummary: (m) => m.tax_and_incentives.summary,
  },
  {
    label: "Natural Hazards",
    hasSignal: true,
    getSignal: (m) => m.natural_hazards.signal,
    getSummary: (m) => m.natural_hazards.summary,
  },
  {
    label: "Connectivity",
    hasSignal: false,
    getText: (m) => m.connectivity,
  },
  {
    label: "Recent Activity",
    hasSignal: false,
    getText: (m) => m.recent_activity,
  },
];

const DIM_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--text-tertiary)",
};

export default function RightPanel({ market }: Props) {
  const parsed = parseMarketName(market.market_name);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "var(--sp-6)",
      }}
    >
      {/* Market Header */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 32,
              fontWeight: 700,
              color: "#C8C8C2",
              lineHeight: 1,
            }}
          >
            #{market.rank}
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            {parsed.name}
          </h2>
          <ViabilityBadge viability={market.overall_viability} />
        </div>
        {parsed.region && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--text-tertiary)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            {parsed.region}
          </p>
        )}
      </div>

      {/* Dimension Blocks */}
      {DIMS.map((dim) => (
        <div key={dim.label} style={{ marginBottom: "var(--sp-5)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span style={DIM_LABEL}>{dim.label}</span>
            {dim.hasSignal && (() => {
              const sig = (dim as DimConfig).getSignal(market);
              const entry = SIGNALS[sig];
              const color = SIGNAL_COLORS[entry.color].text;
              return (
                <>
                  <SignalDot signal={sig} />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color,
                    }}
                  >
                    {entry.label}
                  </span>
                </>
              );
            })()}
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {dim.hasSignal
              ? (dim as DimConfig).getSummary(market)
              : (dim as TextConfig).getText(market)}
          </p>
        </div>
      ))}

      {/* Key Risks */}
      <div style={{ marginBottom: "var(--sp-5)" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--signal-amber-text)",
            marginBottom: 8,
          }}
        >
          Key Risks
        </div>
        {market.key_risks.map((risk, i) => (
          <div
            key={i}
            style={{
              borderLeft: "2px solid #92600E33",
              paddingLeft: 12,
              marginBottom: 8,
              fontSize: 13,
              color: "var(--signal-amber-text)",
              lineHeight: 1.6,
              fontFamily: "var(--font-body)",
            }}
          >
            — {risk}
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div
        style={{
          background: "var(--accent-light)",
          border: "1px solid #C6E7CD",
          borderRadius: 4,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 6,
            letterSpacing: "0.06em",
          }}
        >
          Recommended Next Steps
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "#1A6B32",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {market.next_steps}
        </p>
      </div>
    </div>
  );
}
