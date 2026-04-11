# SiteScope — Spec 4: Export

## HTML dossier generation and download

**Depends on:** Spec 1 (Data Contract) for schema, signal maps, and design tokens. Spec 3 (Frontend UI) for the export button placement in the header bar.

---

## 1. Purpose

The export function generates a self-contained `.html` file that renders the full dossier as a linear, scrollable document styled as a professional consulting deliverable. It is a separate layout from the split-panel app view — built from a template literal, not cloned from the DOM.

---

## 2. Trigger

"Export Dossier" button in the header bar (right-aligned, after query params string).

| Property | Value |
|---|---|
| Label | "Export Dossier" (optional `↓` prefix character) |
| Border | `1px solid var(--border)` |
| Background | `#FFF` |
| Text | `var(--text-primary)`, `--font-body`, 12px, weight 500 |
| Padding | `6px 14px` |
| Border-radius | `3px` |
| Hover | `background: var(--bg-surface)` |

---

## 3. Download Mechanics

```js
function exportDossier(dossier) {
  const html = buildExportHTML(dossier); // §4
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SiteScope_Dossier_${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

Filename example: `SiteScope_Dossier_2026-04-11.html`.

---

## 4. Export Document Layout

The HTML string is built via template literal. It includes inline `<style>` and Google Fonts `<link>` tags. No external JS dependencies.

### 4.1 Page Setup

- `max-width: 720px`, centered.
- `background: #FFFFFF` (this is a document, not the app — white is correct here).
- Fonts loaded via Google Fonts `<link>` tags: Fraunces, Instrument Sans, JetBrains Mono.
- Padding: `48px` top, `24px` sides.

### 4.2 Document Header

| Element | Spec |
|---|---|
| Top line | "SiteScope — Market Screening Dossier" — mono, 11px, uppercase, tertiary |
| Title | Query description (e.g. "50MW Hyperscale Site Screening") — serif, 26px, weight 700 |
| Metadata | Region, timeline, workload, date — 13px, tertiary, separated by middots (`·`) |
| Bottom border | `2px solid #1A1A18` |

### 4.3 Executive Summary

- Background: `#F3F2EE`, padding `20px 24px`.
- Label: "SUMMARY" — mono, 11px, tertiary.
- Body: 15px serif, `line-height: 1.8`, secondary text color.

### 4.4 Comparison Table

Full-width HTML `<table>`. Clean, minimal.

| Element | Spec |
|---|---|
| Header row | `border-bottom: 2px solid #DDD`. Column headers in mono, 10px, uppercase, tertiary |
| Columns | Market, Power, Community, Incentives, Hazards |
| Market cell | Rank number (mono, tertiary) + market name (weight 600) |
| Signal cells | Colored text label from signal map — **no dots** (text only for print compatibility) |
| Row borders | `1px solid #EEE` |

### 4.5 Market Sections

One per candidate market. Separated by `48px` top margin.

**Header:**
- Rank: mono, 24px, tertiary.
- Name: serif, 20px, weight 700.
- Viability badge: same pill style as app (colored bg + text, border-radius 3px, 11px uppercase).
- Region: 13px, tertiary, italic.

**Content container:** `border-left: 3px solid #E5E4DF`, `padding-left: 20px`.

**Each dimension within the container:**

| Element | Spec |
|---|---|
| Label | sans, 12px, weight 600, tertiary, uppercase |
| Signal label | Inline or right-aligned, colored text from signal map. Omit for Connectivity and Recent Activity |
| Body | 14px, primary text, `line-height: 1.7` |

**Key Risks:**
- Amber text (`#92600E`), em-dash prefixed.

**Next Steps:**
- Green card: `background: #F0FAF2`, `border: 1px solid #C6E7CD`, `border-radius: 4px`, `padding: 14px 16px`.
- Label: mono, 11px, accent green, uppercase.
- Body: 13px, `#1A6B32`.

### 4.6 Markets to Deprioritize

Red-tinted card:
- Background: `#FEF2F2`.
- Border: `1px solid #FECACA`.
- Border-radius: `4px`, padding: `16px 20px`.
- Each market: name in `#A3261B` weight 600, em dash, reason in `#7F1D1D`.

### 4.7 Methodology Footer

- Top border: `1px solid #DDD`, `padding-top: 20px`.
- Label: "METHODOLOGY" — mono, 10px, uppercase.
- Body: 12px, tertiary, `line-height: 1.7`.

---

## 5. Print Styles

Include in the `<style>` block:

```css
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .market-section + .market-section {
    page-break-before: always;
  }

  .comparison-table {
    page-break-inside: avoid;
  }
}
```

Rules:
- `page-break-before: always` on each market section **after the first**.
- `page-break-inside: avoid` on the comparison table.
- Preserve background colors for signal badges and cards (`print-color-adjust: exact`).
- Hide nothing — the export is the full dossier.

---

## 6. Implementation Notes

- Build the HTML as a JavaScript template literal. Do not clone or serialize the app DOM.
- Inject dossier data directly into the template using string interpolation.
- Use the same `SIGNALS`, `SIGNAL_COLORS`, and `VIABILITY` maps from Spec 1 to resolve colors and labels.
- All CSS is inline in a `<style>` tag. No external stylesheets beyond Google Fonts `<link>`.
- The export document uses hardcoded hex colors (not CSS variables) since it's a standalone file.
- Sanitize any user-provided text before injecting into the HTML template (escape `<`, `>`, `&`, `"`, `'`).

```js
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

---

## 7. File Location

```
src/
  lib/
    exportDossier.js   — buildExportHTML() + exportDossier() functions
```

Or inline in the main app file if using a single-file approach.

---

## 8. Acceptance Criteria

- [ ] "Export Dossier" button in header triggers download of a `.html` file.
- [ ] Filename follows pattern `SiteScope_Dossier_YYYY-MM-DD.html`.
- [ ] File opens correctly in Chrome, Firefox, and Safari.
- [ ] Document renders at 720px max-width with correct fonts (loaded via Google Fonts).
- [ ] Document header shows title, metadata, and bottom border.
- [ ] Executive summary renders in surface-colored card.
- [ ] Comparison table renders with all markets and colored signal labels (no dots).
- [ ] Each market section renders with rank, name, badge, all dimensions, risks, and next steps.
- [ ] Deprioritize section renders in red-tinted card.
- [ ] Methodology footer renders with border and tertiary text.
- [ ] Print preview shows page breaks between market sections.
- [ ] Comparison table does not break across pages in print.
- [ ] No broken layouts, unstyled elements, or missing data in the export.