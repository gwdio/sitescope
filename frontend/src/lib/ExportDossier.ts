import type { Dossier, CandidateMarket } from "./types";
import { SIGNALS, VIABILITY } from "./signals";
import { parseMarketName } from "./parseMarketName";

type SignalKey = keyof typeof SIGNALS;

const DOT_COLOR: Record<string, string> = {
  green: "#1A7A3A",
  amber: "#92600E",
  red:   "#A3261B",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dot(signal: SignalKey): string {
  const c = DOT_COLOR[SIGNALS[signal].color];
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c};flex-shrink:0;vertical-align:middle;margin-right:5px"></span>`;
}

function signalChip(signal: SignalKey): string {
  const entry = SIGNALS[signal];
  const c = DOT_COLOR[entry.color];
  return `${dot(signal)}<span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${c};text-transform:uppercase;letter-spacing:.06em">${esc(entry.label)}</span>`;
}

function matrixDot(signal: SignalKey): string {
  const c = DOT_COLOR[SIGNALS[signal].color];
  return `<td style="text-align:center;padding:0 6px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c}"></span></td>`;
}

function renderMarket(m: CandidateMarket, pageBreak: boolean): string {
  const parsed = parseMarketName(m.market_name);
  const vEntry = VIABILITY[m.overall_viability];
  const vColor = DOT_COLOR[vEntry.color];

  const sigDims = [
    { label: "Power & Grid",          signal: m.power.signal as SignalKey,                  summary: m.power.summary },
    { label: "Community Sentiment",   signal: m.community_sentiment.signal as SignalKey,    summary: m.community_sentiment.summary },
    { label: "Tax & Incentives",      signal: m.tax_and_incentives.signal as SignalKey,     summary: m.tax_and_incentives.summary },
    { label: "Natural Hazards",       signal: m.natural_hazards.signal as SignalKey,        summary: m.natural_hazards.summary },
  ];

  return `
<div style="${pageBreak ? "page-break-before:always;" : ""}padding:40px 0;${pageBreak ? "border-top:2px solid #E5E4DF;" : ""}">
  <div style="margin-bottom:24px">
    <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:4px;flex-wrap:wrap">
      <span style="font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;color:#C8C8C2;line-height:1">#${m.rank}</span>
      <h2 style="font-family:'Fraunces',serif;font-size:22px;font-weight:700;color:#1A1A18;margin:0">${esc(parsed.name)}</h2>
      <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${vColor};text-transform:uppercase;letter-spacing:.06em;border:1px solid ${vColor};padding:2px 7px;border-radius:2px">${esc(vEntry.label)}</span>
    </div>
    ${parsed.region ? `<p style="font-family:'Instrument Sans',sans-serif;font-size:13px;color:#9C9C96;font-style:italic;margin:0">${esc(parsed.region)}</p>` : ""}
  </div>

  ${sigDims.map(d => `
  <div style="margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <span style="font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#9C9C96">${d.label}</span>
      ${signalChip(d.signal)}
    </div>
    <p style="font-family:'Instrument Sans',sans-serif;font-size:13px;color:#6B6B66;line-height:1.7;margin:0">${esc(d.summary)}</p>
  </div>`).join("")}

  <div style="margin-bottom:20px">
    <div style="margin-bottom:6px"><span style="font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#9C9C96">Connectivity</span></div>
    <p style="font-family:'Instrument Sans',sans-serif;font-size:13px;color:#6B6B66;line-height:1.7;margin:0">${esc(m.connectivity)}</p>
  </div>

  <div style="margin-bottom:20px">
    <div style="margin-bottom:6px"><span style="font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#9C9C96">Recent Activity</span></div>
    <p style="font-family:'Instrument Sans',sans-serif;font-size:13px;color:#6B6B66;line-height:1.7;margin:0">${esc(m.recent_activity)}</p>
  </div>

  <div style="margin-bottom:20px">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#92600E;margin-bottom:8px">Key Risks</div>
    ${m.key_risks.map(r => `<div style="border-left:2px solid rgba(146,96,14,.2);padding-left:12px;margin-bottom:8px;font-family:'Instrument Sans',sans-serif;font-size:13px;color:#92600E;line-height:1.6">— ${esc(r)}</div>`).join("")}
  </div>

  <div style="background:#F0FAF2;border:1px solid #C6E7CD;border-radius:4px;padding:14px 16px">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;color:#2A5F2E;margin-bottom:6px;letter-spacing:.06em">Recommended Next Steps</div>
    <p style="font-family:'Instrument Sans',sans-serif;font-size:13px;color:#1A6B32;line-height:1.6;margin:0">${esc(m.next_steps)}</p>
  </div>
</div>`;
}

export function exportDossier(dossier: Dossier, requirements: string): void {
  const date = new Date().toISOString().slice(0, 10);

  const matrixCols = [
    { label: "Power",      sig: (m: CandidateMarket) => m.power.signal as SignalKey },
    { label: "Community",  sig: (m: CandidateMarket) => m.community_sentiment.signal as SignalKey },
    { label: "Incentives", sig: (m: CandidateMarket) => m.tax_and_incentives.signal as SignalKey },
    { label: "Hazards",    sig: (m: CandidateMarket) => m.natural_hazards.signal as SignalKey },
  ];

  const matrixHtml = `
<table style="width:100%;border-collapse:collapse;margin-bottom:32px">
  <thead>
    <tr>
      <th style="text-align:left;padding:0 12px 8px 0;font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9C9C96;font-weight:400"></th>
      ${matrixCols.map(c => `<th style="text-align:center;padding:0 6px 8px;font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9C9C96;font-weight:400">${c.label}</th>`).join("")}
    </tr>
  </thead>
  <tbody>
    ${dossier.candidate_markets.map(m => {
      const parsed = parseMarketName(m.market_name);
      return `
    <tr style="border-bottom:1px solid #E5E4DF">
      <td style="padding:10px 12px 10px 0">
        <div style="font-family:'Instrument Sans',sans-serif;font-size:14px;font-weight:600;color:#1A1A18">${esc(parsed.name)}</div>
        ${parsed.region ? `<div style="font-family:'Instrument Sans',sans-serif;font-size:11px;color:#9C9C96;margin-top:2px">${esc(parsed.region)}</div>` : ""}
      </td>
      ${matrixCols.map(c => matrixDot(c.sig(m))).join("")}
    </tr>`;
    }).join("")}
  </tbody>
</table>`;

  const avoidHtml = dossier.markets_to_avoid.length > 0 ? `
<div style="border-top:1px solid #E5E4DF;padding-top:24px;margin-bottom:32px">
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#A3261B;margin-bottom:10px">Deprioritize</div>
  ${dossier.markets_to_avoid.map(m => `
  <div style="margin-bottom:8px">
    <span style="font-family:'Instrument Sans',sans-serif;font-size:13px;font-weight:600;color:#A3261B">${esc(m.market_name)}</span>
    <span style="font-family:'Instrument Sans',sans-serif;font-size:12px;color:#6B6B66"> — ${esc(m.reason)}</span>
  </div>`).join("")}
</div>` : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SiteScope — Market Screening Dossier — ${date}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,400&family=Instrument+Sans:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{margin:0;padding:0;background:#FAFAF9}
    @media print{body{background:#fff}.no-print{display:none}}
    @page{margin:20mm 18mm}
  </style>
</head>
<body>
  <div style="max-width:860px;margin:0 auto;padding:48px 32px">

    <header style="border-bottom:2px solid #E5E4DF;padding-bottom:24px;margin-bottom:32px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:#2A5F2E;letter-spacing:.04em">SiteScope</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#9C9C96">${date}</span>
      </div>
      <h1 style="font-family:'Fraunces',serif;font-size:28px;font-weight:700;color:#1A1A18;margin:0 0 12px">Market Screening Dossier</h1>
      <p style="font-family:'Instrument Sans',sans-serif;font-size:12px;color:#9C9C96;margin:0;font-style:italic">${esc(requirements.slice(0, 200))}${requirements.length > 200 ? "…" : ""}</p>
    </header>

    <div style="margin-bottom:32px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9C9C96;margin-bottom:8px">Executive Summary</div>
      <div style="background:#F3F2EE;padding:16px;border-radius:4px">
        <p style="font-family:'Instrument Sans',sans-serif;font-size:13px;color:#6B6B66;line-height:1.7;margin:0">${esc(dossier.executive_summary)}</p>
      </div>
    </div>

    ${matrixHtml}
    ${avoidHtml}

    ${dossier.candidate_markets.map((m, i) => renderMarket(m, i > 0)).join("")}

    <footer style="border-top:1px solid #E5E4DF;margin-top:40px;padding-top:16px">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9C9C96;margin-bottom:6px">Methodology</div>
      <p style="font-family:'Instrument Sans',sans-serif;font-size:12px;color:#9C9C96;line-height:1.6;margin:0">Research conducted via Subconscious AI. Power pricing, incentive valuations, and timeline estimates are illustrative and should be verified with local counsel and utility providers before site selection decisions.</p>
    </footer>
  </div>
  <script>
    document.fonts.ready.then(function() {
      window.print();
      window.addEventListener('afterprint', function() { window.close(); });
    });
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    // popup blocked — fall back to HTML download
    const a = document.createElement("a");
    a.href = url;
    a.download = `SiteScope_Dossier_${date}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
