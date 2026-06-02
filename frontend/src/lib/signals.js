export const SIGNALS = {
    // Power
    favorable: { label: "Favorable", color: "green" },
    mixed: { label: "Mixed", color: "amber" },
    constrained: { label: "Constrained", color: "red" },
    // Community
    supportive: { label: "Supportive", color: "green" },
    hostile: { label: "Hostile", color: "red" },
    // Incentives
    strong_incentives: { label: "Strong Incentives", color: "green" },
    moderate_incentives: { label: "Moderate", color: "amber" },
    weak_incentives: { label: "Weak Incentives", color: "red" },
    // Hazards
    low_risk: { label: "Low Risk", color: "green" },
    moderate_risk: { label: "Moderate Risk", color: "amber" },
    high_risk: { label: "High Risk", color: "red" },
};
export const SIGNAL_COLORS = {
    green: { text: "var(--signal-green-text)", bg: "var(--signal-green-bg)" },
    amber: { text: "var(--signal-amber-text)", bg: "var(--signal-amber-bg)" },
    red: { text: "var(--signal-red-text)", bg: "var(--signal-red-bg)" },
};
export const VIABILITY = {
    strong: { label: "Strong Candidate", color: "green" },
    moderate: { label: "Moderate Candidate", color: "amber" },
    cautious: { label: "Approach with Caution", color: "red" },
};
