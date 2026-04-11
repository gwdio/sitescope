import React from "react";

interface Props {
  requirements: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

export default function InputView({ requirements, onChange, onSubmit, error }: Props) {
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
      <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 520 }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 4px",
          }}
        >
          SiteScope
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--text-secondary)",
            margin: "0 0 20px",
          }}
        >
          Market Screening
        </p>
        {error && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--signal-red-text)",
              margin: "0 0 12px",
            }}
          >
            {error}
          </p>
        )}
        <textarea
          value={requirements}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: 12,
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--text-primary)",
            resize: "vertical",
            outline: "none",
            display: "block",
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: 12 }}
        >
          Run Screening
        </button>
      </form>
    </div>
  );
}
