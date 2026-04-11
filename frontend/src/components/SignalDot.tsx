import { SIGNALS, SIGNAL_COLORS } from "../lib/signals";
import type { SignalKey } from "../lib/signals";

interface Props {
  signal: SignalKey;
}

export default function SignalDot({ signal }: Props) {
  const entry = SIGNALS[signal];
  const color = SIGNAL_COLORS[entry.color].text;
  return (
    <span
      title={entry.label}
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}
