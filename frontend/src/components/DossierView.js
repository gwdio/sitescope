import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
function truncate(s, max) {
    return s.length > max ? s.slice(0, max) + "…" : s;
}
export default function DossierView({ dossier, requirements, isDemo, onRunLive }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const market = dossier.candidate_markets[selectedIndex];
    return (_jsxs("div", { style: {
            maxWidth: 1120,
            margin: "0 auto",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-page)",
        }, children: [isDemo && (_jsxs("div", { style: {
                    background: "var(--bg-surface)",
                    borderBottom: "1px solid var(--border)",
                    padding: "8px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                }, children: [_jsx("span", { style: {
                            fontFamily: "var(--font-body)",
                            fontSize: 12,
                            color: "var(--text-secondary)",
                        }, children: "Viewing demo data" }), _jsx("button", { type: "button", onClick: onRunLive, style: {
                            background: "none",
                            border: "none",
                            fontFamily: "var(--font-body)",
                            fontSize: 12,
                            color: "var(--accent)",
                            cursor: "pointer",
                            padding: 0,
                            textDecoration: "underline",
                        }, children: "Enter your key to run a live screen" })] })), _jsxs("header", { style: {
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border)",
                    padding: "0 24px",
                    flexShrink: 0,
                }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 0 }, children: [_jsx("span", { style: {
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "var(--accent)",
                                }, children: "SiteScope" }), _jsx("div", { style: {
                                    width: 1,
                                    height: 16,
                                    background: "var(--border)",
                                    margin: "0 12px",
                                } }), _jsx("span", { style: {
                                    fontFamily: "var(--font-body)",
                                    fontSize: 12,
                                    color: "var(--text-secondary)",
                                }, children: "Market Screening Dossier" })] }), _jsx("span", { style: {
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--text-tertiary)",
                        }, children: truncate(requirements, 80) })] }), _jsxs("div", { style: { display: "flex", flex: 1, overflow: "hidden" }, children: [_jsx(LeftPanel, { dossier: dossier, selectedIndex: selectedIndex, onSelect: setSelectedIndex }), _jsx(RightPanel, { market: market })] }), _jsxs("footer", { style: {
                    borderTop: "1px solid var(--border)",
                    padding: "16px 24px",
                    flexShrink: 0,
                }, children: [_jsx("div", { style: {
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--text-tertiary)",
                            marginBottom: 6,
                        }, children: "Methodology" }), _jsx("p", { style: {
                            fontFamily: "var(--font-body)",
                            fontSize: 12,
                            color: "var(--text-tertiary)",
                            lineHeight: 1.6,
                            margin: 0,
                        }, children: dossier.methodology_note })] })] }));
}
