import { jsx as _jsx } from "react/jsx-runtime";
import { SIGNALS, SIGNAL_COLORS } from "../lib/signals";
export default function SignalDot({ signal }) {
    const entry = SIGNALS[signal];
    const color = SIGNAL_COLORS[entry.color].text;
    return (_jsx("span", { title: entry.label, style: {
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
        } }));
}
