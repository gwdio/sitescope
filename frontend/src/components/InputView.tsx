import React, { useState } from "react";

export interface InputViewProps {
  requirements: string;
  onChange: (val: string) => void;
  apiKey: string;
  onApiKeyChange: (val: string) => void;
  onForgetKey: () => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onDemo: () => void;
  error: string | null;
}

export default function InputView({
  requirements,
  onChange,
  apiKey,
  onApiKeyChange,
  onForgetKey,
  onSubmit,
  onDemo,
  error,
}: InputViewProps): React.JSX.Element {
  const [showForm, setShowForm] = useState<boolean>(!!apiKey);

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
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 8px",
          }}
        >
          SiteScope
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--text-secondary)",
            margin: "0 0 28px",
            lineHeight: 1.5,
          }}
        >
          AI-powered data center site screening. Enter your requirements,
          get a ranked market dossier across power, community, incentives,
          and risk.
        </p>

        {!showForm ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onDemo}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              See a Demo
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowForm(true)}
              style={{ flex: 1 }}
            >
              Run a Screen
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
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

            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Subconscious API Key
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="sky_…"
                required
                autoComplete="off"
                style={{
                  flex: 1,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  padding: "8px 10px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
              {apiKey && (
                <button
                  type="button"
                  onClick={onForgetKey}
                  style={{
                    padding: "8px 10px",
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Forget key
                </button>
              )}
            </div>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                color: "var(--text-tertiary)",
                margin: "0 0 16px",
                lineHeight: 1.5,
              }}
            >
              Your key stays in your browser and is sent only to Subconscious. Stored in localStorage.
            </p>

            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Requirements
            </label>
            <textarea
              value={requirements}
              onChange={(e) => onChange(e.target.value)}
              rows={6}
              required
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
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 16px",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--text-tertiary)",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                Run Screening
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
