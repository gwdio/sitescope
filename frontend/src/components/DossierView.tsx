import React, { useState } from "react";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import type { Dossier } from "../lib/types";

export interface DossierViewProps {
  dossier: Dossier;
  requirements: string;
  isDemo?: boolean;
  onHome?: () => void;
  onRunLive?: () => void;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export default function DossierView({ dossier, requirements, isDemo, onHome, onRunLive }: DossierViewProps): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const market = dossier.candidate_markets[selectedIndex];

  return (
    <div
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-page)",
      }}
    >
      {/* Demo banner */}
      {isDemo && (
        <div
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            Viewing demo data
          </span>
          <button
            type="button"
            onClick={onRunLive}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--accent)",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Enter your key to run a live screen
          </button>
        </div>
      )}

      {/* Header */}
      <header
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <button
            type="button"
            onClick={onHome}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: onHome ? "pointer" : "default",
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            SiteScope
          </button>
          <div
            style={{
              width: 1,
              height: 16,
              background: "var(--border)",
              margin: "0 12px",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            Market Screening Dossier
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-tertiary)",
          }}
        >
          {truncate(requirements, 80)}
        </span>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <LeftPanel
          dossier={dossier}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
        <RightPanel market={market} />
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "16px 24px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-tertiary)",
            marginBottom: 6,
          }}
        >
          Methodology
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--text-tertiary)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {isDemo
            ? "Pre-generated demo data — all figures, operator names, and market signals are illustrative and not sourced from a live research run."
            : "Research conducted via Subconscious AI using web search, news search, and company intelligence tools. Power pricing, incentive valuations, and timeline estimates are illustrative and should be verified with local counsel and utility providers before site selection decisions."}
        </p>
      </footer>
    </div>
  );
}
