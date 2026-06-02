import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import SignalDot from "./SignalDot";
import ViabilityBadge from "./ViabilityBadge";
import { SIGNALS, SIGNAL_COLORS } from "../lib/signals";
import { parseMarketName } from "../lib/parseMarketName";
const DIMS = [
    {
        label: "Power & Grid",
        hasSignal: true,
        getSignal: (m) => m.power.signal,
        getSummary: (m) => m.power.summary,
    },
    {
        label: "Community Sentiment",
        hasSignal: true,
        getSignal: (m) => m.community_sentiment.signal,
        getSummary: (m) => m.community_sentiment.summary,
    },
    {
        label: "Tax & Incentives",
        hasSignal: true,
        getSignal: (m) => m.tax_and_incentives.signal,
        getSummary: (m) => m.tax_and_incentives.summary,
    },
    {
        label: "Natural Hazards",
        hasSignal: true,
        getSignal: (m) => m.natural_hazards.signal,
        getSummary: (m) => m.natural_hazards.summary,
    },
    {
        label: "Connectivity",
        hasSignal: false,
        getText: (m) => m.connectivity,
    },
    {
        label: "Recent Activity",
        hasSignal: false,
        getText: (m) => m.recent_activity,
    },
];
const DIM_LABEL = {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--text-tertiary)",
};
export default function RightPanel({ market }) {
    const parsed = parseMarketName(market.market_name);
    return (_jsxs("div", { style: {
            flex: 1,
            overflowY: "auto",
            padding: "var(--sp-6)",
        }, children: [_jsxs("div", { style: { marginBottom: "var(--sp-6)" }, children: [_jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }, children: [_jsxs("span", { style: {
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 32,
                                    fontWeight: 700,
                                    color: "#C8C8C2",
                                    lineHeight: 1,
                                }, children: ["#", market.rank] }), _jsx("h2", { style: {
                                    fontFamily: "var(--font-display)",
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    margin: 0,
                                }, children: parsed.name }), _jsx(ViabilityBadge, { viability: market.overall_viability })] }), parsed.region && (_jsx("p", { style: {
                            fontFamily: "var(--font-body)",
                            fontSize: 13,
                            color: "var(--text-tertiary)",
                            fontStyle: "italic",
                            margin: 0,
                        }, children: parsed.region }))] }), DIMS.map((dim) => (_jsxs("div", { style: { marginBottom: "var(--sp-5)" }, children: [_jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                        }, children: [_jsx("span", { style: DIM_LABEL, children: dim.label }), dim.hasSignal && (() => {
                                const sig = dim.getSignal(market);
                                const entry = SIGNALS[sig];
                                const color = SIGNAL_COLORS[entry.color].text;
                                return (_jsxs(_Fragment, { children: [_jsx(SignalDot, { signal: sig }), _jsx("span", { style: {
                                                fontFamily: "var(--font-mono)",
                                                fontSize: 11,
                                                color,
                                            }, children: entry.label })] }));
                            })()] }), _jsx("p", { style: {
                            fontFamily: "var(--font-body)",
                            fontSize: 13,
                            color: "var(--text-secondary)",
                            lineHeight: 1.7,
                            margin: 0,
                        }, children: dim.hasSignal
                            ? dim.getSummary(market)
                            : dim.getText(market) })] }, dim.label))), _jsxs("div", { style: { marginBottom: "var(--sp-5)" }, children: [_jsx("div", { style: {
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "var(--signal-amber-text)",
                            marginBottom: 8,
                        }, children: "Key Risks" }), market.key_risks.map((risk, i) => (_jsxs("div", { style: {
                            borderLeft: "2px solid #92600E33",
                            paddingLeft: 12,
                            marginBottom: 8,
                            fontSize: 13,
                            color: "var(--signal-amber-text)",
                            lineHeight: 1.6,
                            fontFamily: "var(--font-body)",
                        }, children: ["\u2014 ", risk] }, i)))] }), _jsxs("div", { style: {
                    background: "var(--accent-light)",
                    border: "1px solid #C6E7CD",
                    borderRadius: 4,
                    padding: "14px 16px",
                }, children: [_jsx("div", { style: {
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            textTransform: "uppercase",
                            color: "var(--accent)",
                            marginBottom: 6,
                            letterSpacing: "0.06em",
                        }, children: "Recommended Next Steps" }), _jsx("p", { style: {
                            fontFamily: "var(--font-body)",
                            fontSize: 13,
                            color: "#1A6B32",
                            lineHeight: 1.6,
                            margin: 0,
                        }, children: market.next_steps })] })] }));
}
