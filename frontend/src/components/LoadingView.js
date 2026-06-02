import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function formatElapsed(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
}
export default function LoadingView({ elapsed, thinking, onCancel }) {
    return (_jsx("div", { style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            background: "var(--bg-page)",
            padding: "var(--sp-6)",
        }, children: _jsxs("div", { style: { width: "100%", maxWidth: 520, textAlign: "center" }, children: [_jsx("p", { style: {
                        fontFamily: "var(--font-body)",
                        fontSize: 15,
                        color: "var(--text-secondary)",
                        margin: "0 0 8px",
                    }, children: "Researching markets..." }), _jsx("p", { style: {
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "var(--text-tertiary)",
                        margin: "0 0 20px",
                    }, children: formatElapsed(elapsed) }), thinking && (_jsxs("div", { style: {
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        padding: "10px 14px",
                        marginBottom: 20,
                        textAlign: "left",
                        maxHeight: 160,
                        overflow: "hidden",
                        position: "relative",
                    }, children: [_jsx("p", { style: {
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                color: "var(--text-tertiary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                margin: "0 0 6px",
                            }, children: "Reasoning" }), _jsx("p", { style: {
                                fontFamily: "var(--font-body)",
                                fontSize: 12,
                                color: "var(--text-secondary)",
                                margin: 0,
                                lineHeight: 1.6,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                            }, children: thinking.slice(-600) }), _jsx("div", { style: {
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 40,
                                background: "linear-gradient(transparent, var(--bg-surface))",
                                pointerEvents: "none",
                            } })] })), _jsx("button", { type: "button", onClick: onCancel, style: {
                        background: "none",
                        border: "none",
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: "var(--text-tertiary)",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                    }, children: "Cancel" })] }) }));
}
