import React from "react";
import SignalDot from "./SignalDot";
import { parseMarketName } from "../lib/parseMarketName";
import type { SignalKey } from "../lib/signals";
import type { Dossier, CandidateMarket } from "../lib/types";

interface Props {
  dossier: Dossier;
  selectedIndex: number;
  onSelect: (i: number) => void;
}

interface MatrixCol {
  label: string;
  getSignal: (m: CandidateMarket) => SignalKey;
}

const MATRIX_COLS: MatrixCol[] = [
  { label: "Power",      getSignal: (m) => m.power.signal },
  { label: "Community",  getSignal: (m) => m.community_sentiment.signal as SignalKey },
  { label: "Incentives", getSignal: (m) => m.tax_and_incentives.signal as SignalKey },
  { label: "Hazards",    getSignal: (m) => m.natural_hazards.signal as SignalKey },
];

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--text-tertiary)",
};

export default function LeftPanel({ dossier, selectedIndex, onSelect }: Props) {
  return (
    <div
      style={{
        width: 420,
        flexShrink: 0,
        padding: "var(--sp-6)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Executive Summary */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <div style={{ ...LABEL_STYLE, marginBottom: 8 }}>Summary</div>
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "var(--sp-4)",
            borderRadius: 4,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {dossier.executive_summary}
          </p>
        </div>
      </div>

      {/* Signal Matrix */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "0 12px 8px 15px" }} />
            {MATRIX_COLS.map((col) => (
              <th
                key={col.label}
                style={{
                  ...LABEL_STYLE,
                  textAlign: "center",
                  padding: "0 4px 8px",
                  fontWeight: 400,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dossier.candidate_markets.map((market, i) => {
            const selected = i === selectedIndex;
            const parsed = parseMarketName(market.market_name);
            return (
              <tr
                key={market.rank}
                onClick={() => onSelect(i)}
                style={{
                  cursor: "pointer",
                  borderLeft: selected
                    ? "3px solid var(--accent)"
                    : "3px solid transparent",
                  background: selected ? "var(--bg-surface)" : "transparent",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <td style={{ padding: "12px 12px 12px 12px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {parsed.name}
                  </div>
                  {parsed.region && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-tertiary)",
                        marginTop: 2,
                      }}
                    >
                      {parsed.region}
                    </div>
                  )}
                </td>
                {MATRIX_COLS.map((col) => (
                  <td
                    key={col.label}
                    style={{ textAlign: "center", padding: "0 4px" }}
                  >
                    <SignalDot signal={col.getSignal(market)} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Deprioritize Section */}
      {dossier.markets_to_avoid.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            marginTop: "var(--sp-6)",
            paddingTop: "var(--sp-6)",
          }}
        >
          <div
            style={{
              ...LABEL_STYLE,
              color: "var(--signal-red-text)",
              marginBottom: 10,
            }}
          >
            Deprioritize
          </div>
          {dossier.markets_to_avoid.map((m) => (
            <div key={m.market_name} style={{ marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--signal-red-text)",
                }}
              >
                {m.market_name}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                {" — "}
                {m.reason}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
