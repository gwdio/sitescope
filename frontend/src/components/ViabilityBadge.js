import { jsx as _jsx } from "react/jsx-runtime";
import { VIABILITY, SIGNAL_COLORS } from "../lib/signals";
export default function ViabilityBadge({ viability }) {
    const entry = VIABILITY[viability];
    const colors = SIGNAL_COLORS[entry.color];
    return (_jsx("span", { style: {
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
        }, children: entry.label }));
}
