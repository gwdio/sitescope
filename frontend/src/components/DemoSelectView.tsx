import React from "react";
import { MOCK_QUERY } from "../lib/mockData";
import { MOCK_QUERY_2 } from "../lib/mockData2";

interface DemoSelectViewProps {
  onSelect: (which: 1 | 2) => void;
  onBack: () => void;
}

const SCENARIOS = [
  {
    id: 1 as const,
    label: "Scenario 01",
    title: "Texas Colocation",
    meta: "5 MW · 24-month delivery · Power-priority",
    query: MOCK_QUERY,
  },
  {
    id: 2 as const,
    label: "Scenario 02",
    title: "Southeast Edge PoPs",
    meta: "1 MW/site · 9-month deployment · Connectivity-priority",
    query: MOCK_QUERY_2,
  },
];

export default function DemoSelectView({ onSelect, onBack }: DemoSelectViewProps): React.JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "var(--bg-page)",
        padding: "var(--sp-6)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-tertiary)",
            cursor: "pointer",
            padding: 0,
            marginBottom: 24,
            display: "block",
          }}
        >
          ← Back
        </button>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 6px",
          }}
        >
          Choose a demo
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--text-secondary)",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          Select a pre-run screening to explore the dossier view.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SCENARIOS.map((s) => (
            <div
              key={s.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-tertiary)",
                  marginBottom: 4,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 2,
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  marginBottom: 12,
                }}
              >
                {s.meta}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.55,
                  margin: "0 0 16px",
                  borderLeft: "2px solid var(--border)",
                  paddingLeft: 10,
                }}
              >
                {s.query}
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onSelect(s.id)}
                style={{ width: "100%" }}
              >
                View Demo
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
