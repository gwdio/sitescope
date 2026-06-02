import React from "react";

export interface LoadingViewProps {
  elapsed: number;
  complete?: boolean;
  /** When set, calibrates the bar and step cycling to this known duration (ms). */
  durationMs?: number;
  onCancel: () => void;
}

const STEPS = [
  "Identifying candidate markets...",
  "Checking power availability...",
  "Parsing regulatory environment...",
  "Reviewing community sentiment...",
  "Assessing natural hazard exposure...",
  "Cross-referencing interconnection queues...",
  "Synthesizing dossier...",
];

function getProgress(elapsed: number): number {
  if (elapsed <= 22) return (elapsed / 22) * 88;
  if (elapsed <= 32) return 88 + (elapsed - 22) * 0.9;
  return 97;
}

export default function LoadingView({ elapsed, complete = false, durationMs, onCancel }: LoadingViewProps): React.JSX.Element {
  const totalSecs = durationMs != null ? durationMs / 1000 : null;
  const stepInterval = totalSecs != null ? totalSecs / STEPS.length : 4;
  const stepIndex = Math.min(Math.floor(elapsed / stepInterval), STEPS.length - 1);
  const progress = complete ? 100 : totalSecs != null
    ? Math.min(97, (elapsed / totalSecs) * 97)
    : getProgress(elapsed);
  const isOverdue = !complete && durationMs == null && elapsed > 32;

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
      <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--text-secondary)",
            margin: "0 0 20px",
            minHeight: 24,
          }}
        >
          {complete ? "Done." : STEPS[stepIndex]}
        </p>

        <div
          style={{
            height: 6,
            background: "var(--border)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--accent)",
              borderRadius: 3,
              transition: complete ? "width 0.3s ease-out" : "width 1s linear",
            }}
          />
        </div>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-tertiary)",
            margin: "0 0 24px",
            minHeight: 16,
          }}
        >
          {isOverdue ? "any minute now..." : ""}
        </p>

        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "none",
            border: "none",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-tertiary)",
            cursor: "pointer",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
