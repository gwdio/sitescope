interface Props {
  elapsed: number;
  thinking: string;
  onCancel: () => void;
}

function formatElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function LoadingView({ elapsed, thinking, onCancel }: Props) {
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
      <div style={{ width: "100%", maxWidth: 520, textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--text-secondary)",
            margin: "0 0 8px",
          }}
        >
          Researching markets...
        </p>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--text-tertiary)",
            margin: "0 0 20px",
          }}
        >
          {formatElapsed(elapsed)}
        </p>

        {thinking && (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "10px 14px",
              marginBottom: 20,
              textAlign: "left",
              maxHeight: 160,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 6px",
              }}
            >
              Reasoning
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {thinking.slice(-600)}
            </p>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 40,
                background: "linear-gradient(transparent, var(--bg-surface))",
                pointerEvents: "none",
              }}
            />
          </div>
        )}

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
