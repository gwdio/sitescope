import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SignalDot from "./SignalDot";
import { parseMarketName } from "../lib/parseMarketName";
const MATRIX_COLS = [
    { label: "Power", getSignal: (m) => m.power.signal },
    { label: "Community", getSignal: (m) => m.community_sentiment.signal },
    { label: "Incentives", getSignal: (m) => m.tax_and_incentives.signal },
    { label: "Hazards", getSignal: (m) => m.natural_hazards.signal },
];
const LABEL_STYLE = {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-tertiary)",
};
export default function LeftPanel({ dossier, selectedIndex, onSelect }) {
    return (_jsxs("div", { style: {
            width: 420,
            flexShrink: 0,
            padding: "var(--sp-6)",
            borderRight: "1px solid var(--border)",
        }, children: [_jsxs("div", { style: { marginBottom: "var(--sp-6)" }, children: [_jsx("div", { style: { ...LABEL_STYLE, marginBottom: 8 }, children: "Summary" }), _jsx("div", { style: {
                            background: "var(--bg-surface)",
                            padding: "var(--sp-4)",
                            borderRadius: 4,
                        }, children: _jsx("p", { style: {
                                fontFamily: "var(--font-body)",
                                fontSize: 13,
                                color: "var(--text-secondary)",
                                lineHeight: 1.7,
                                margin: 0,
                            }, children: dossier.executive_summary }) })] }), _jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { textAlign: "left", padding: "0 12px 8px 15px" } }), MATRIX_COLS.map((col) => (_jsx("th", { style: {
                                        ...LABEL_STYLE,
                                        textAlign: "center",
                                        padding: "0 4px 8px",
                                        fontWeight: 400,
                                    }, children: col.label }, col.label)))] }) }), _jsx("tbody", { children: dossier.candidate_markets.map((market, i) => {
                            const selected = i === selectedIndex;
                            const parsed = parseMarketName(market.market_name);
                            return (_jsxs("tr", { onClick: () => onSelect(i), style: {
                                    cursor: "pointer",
                                    borderLeft: selected
                                        ? "3px solid var(--accent)"
                                        : "3px solid transparent",
                                    background: selected ? "var(--bg-surface)" : "transparent",
                                    borderBottom: "1px solid var(--border)",
                                }, children: [_jsxs("td", { style: { padding: "12px 12px 12px 12px" }, children: [_jsx("div", { style: {
                                                    fontFamily: "var(--font-body)",
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: "var(--text-primary)",
                                                }, children: parsed.name }), parsed.region && (_jsx("div", { style: {
                                                    fontSize: 11,
                                                    color: "var(--text-tertiary)",
                                                    marginTop: 2,
                                                }, children: parsed.region }))] }), MATRIX_COLS.map((col) => (_jsx("td", { style: { textAlign: "center", padding: "0 4px" }, children: _jsx(SignalDot, { signal: col.getSignal(market) }) }, col.label)))] }, market.rank));
                        }) })] }), dossier.markets_to_avoid.length > 0 && (_jsxs("div", { style: {
                    borderTop: "1px solid var(--border)",
                    marginTop: "var(--sp-6)",
                    paddingTop: "var(--sp-6)",
                }, children: [_jsx("div", { style: {
                            ...LABEL_STYLE,
                            color: "var(--signal-red-text)",
                            marginBottom: 10,
                        }, children: "Deprioritize" }), dossier.markets_to_avoid.map((m) => (_jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("span", { style: {
                                    fontFamily: "var(--font-body)",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "var(--signal-red-text)",
                                }, children: m.market_name }), _jsxs("span", { style: {
                                    fontFamily: "var(--font-body)",
                                    fontSize: 12,
                                    color: "var(--text-secondary)",
                                }, children: [" — ", m.reason] })] }, m.market_name)))] }))] }));
}
