import { VIABILITY, SIGNAL_COLORS } from "../lib/signals";
import type { ViabilitySignal } from "../lib/types";

interface Props {
  viability: ViabilitySignal;
}

export default function ViabilityBadge({ viability }: Props) {
  const entry = VIABILITY[viability];
  const colors = SIGNAL_COLORS[entry.color];
  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: 3,
        padding: "2px 8px",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: colors.text,
        background: colors.bg,
      }}
    >
      {entry.label}
    </span>
  );
}
