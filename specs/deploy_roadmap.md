# SiteScope — Deploy Roadmap

High-level plan for getting SiteScope to a live, publicly shareable URL at `sitescope.grantwang.dev`. Steps are ordered by dependency; most can be done independently within a phase.

---

## Pre-Flight — Key Rotation

Before anything else and before the repo is linked publicly: rotate the `SUBCONSCIOUS_API_KEY`. Even if the key has never been in git history, this is the moment to generate a fresh one and treat the old one as potentially compromised. Do this before Phase 1.

---

## Phase 1 — AWS Deployment

### 1.1 Architecture: Lambda (container) + S3/CloudFront

- **Frontend**: Build with `vite build`, upload to S3, serve via CloudFront.
- **Backend**: Wrap FastAPI with [Mangum](https://github.com/jordaneremieff/mangum), deploy as a container-based Lambda behind a Lambda Function URL.

CloudFront does path-routing: `/api/*` forwards to the Lambda Function URL origin, everything else serves from S3. This avoids CORS entirely — no header config needed.

**Cost model**: In production, no env-var API key fallback exists (see 1.3) — users must supply their own key. This means no runaway Subconscious quota burn, no WAF needed, and the infrastructure stays in the free tier (~$0–2/mo S3+CloudFront, Lambda near-zero for low usage).

### 1.2 Lambda Packaging — Container Image

Default to a container-based Lambda from the start. FastAPI + Mangum + Pydantic + the Subconscious SDK will likely hit or exceed the 50MB zip limit anyway, and the container path is more predictable.

- Write a `backend/Dockerfile` using AWS's `public.ecr.aws/lambda/python:3.12` base.
- Set `CMD ["main.lambda_handler"]`.
- Add `mangum` to `requirements.txt`, add `lambda_handler = Mangum(app)` in `main.py`.
- Set Lambda timeout to 60s — with the async refactor (1.3), individual invocations are short.

### 1.3 Async Backend Refactor (Must Complete Before Deploy)

The current `/api/screen` POST blocks synchronously for up to 900s. **CloudFront's origin response timeout maxes out at 60s by default (180s with a quota increase) — a synchronous 900s agent run will always 504, regardless of Lambda's timeout setting.** This refactor is not optional.

Refactor to:

1. **POST `/api/screen`**: Call Subconscious with `await_completion: False`. Return the Subconscious-native `run_id` immediately.
2. **GET `/api/screen/{run_id}`**: Forward the poll directly to the Subconscious status endpoint; translate the response to the existing `PollResult` shape the frontend already expects.

**First, verify the SDK**: Confirm that `await_completion: False` returns a pollable `run_id` from Subconscious. If it does, no storage layer is needed at all — the client holds the `run_id` and polls the backend, which proxies to Subconscious. If the SDK doesn't support async polling natively, fall back to a DynamoDB table (store `run_id → status`) and have the backend poll Subconscious on the client's behalf.

**No env-var key fallback in production.** The `ScreenRequest` body must include an `api_key` field. The backend instantiates `Subconscious(api_key=...)` per-request using the user-supplied key. If no key is provided, return 400. This simultaneously eliminates quota-burn risk, abuse surface, and the need for rate limiting.

1.2 and 1.3 are independent of each other and can be done in parallel. Both must be complete before the infra steps below are functional end-to-end.

### 1.4 Frontend Build + S3

- Set `VITE_API_URL` at build time to the CloudFront distribution URL (same domain, `/api` path — no CORS).
- S3 bucket: static hosting enabled, public read, `index.html` as both index and error document.
- CloudFront distribution: two origins (S3 + Lambda Function URL), two behaviors (`/api/*` → Lambda, `/*` → S3).
- **Disable caching on the `/api/*` behavior**: set TTL to 0, forward all headers and query strings. Default CloudFront caching on an API path will serve stale poll responses and mangle POSTs — easy to miss, annoying to debug.

### 1.5 Custom Domain + TLS

`sitescope.grantwang.dev`:

1. Request an ACM certificate for `sitescope.grantwang.dev` in `us-east-1` (required for CloudFront).
2. Add the CNAME validation record to grantwang.dev's DNS.
3. Attach the cert to the CloudFront distribution, add `sitescope.grantwang.dev` as an alternate domain name.
4. Add a CNAME record: `sitescope.grantwang.dev → <distribution>.cloudfront.net`.

~30 minutes total. Reads far more professional than a `*.cloudfront.net` URL in a portfolio.

### 1.6 IaC (Optional but Recommended)

A minimal CDK or Terraform config (~150 lines) defining the S3 bucket, CloudFront distribution, Lambda function, and ACM cert makes re-deploys and teardowns one command. Worth it before this goes on a portfolio.

---

## Phase 2 — Landing Page + Demo / API Key Flow

### 2.1 New Landing Page

Replace the current minimal `InputView` with a two-path landing page:

- **"See a Demo"** — instantly loads a pre-baked dossier, no key needed.
- **"Run a Screen"** — reveals the API key input + requirements form.

Short headline + 2-sentence value prop above the CTAs. Keep the enterprise-dense paper aesthetic.

### 2.2 User-Provided API Key Flow

For "Run a Screen":
1. Inline `Subconscious API Key` input (type=password) above the requirements textarea.
2. On submit, send `{ api_key, requirements }` to the Lambda backend.
3. Store the key in `localStorage` so returning users don't re-enter it. Add a small "forget key" link.
4. Add a cheap pre-flight validation: hit a `/api/validate-key` endpoint (or a lightweight Subconscious ping) before starting the full run. Surfaces an auth error immediately instead of after a 3-minute wait.
5. Do **not** log or persist user-provided keys server-side beyond the single request.

### 2.3 Demo Mode Path

Clicking "See a Demo" navigates directly to the dossier view with `mockData.ts` loaded — no API call, no key. Add a banner in the dossier header: `"Viewing demo data — enter your key to run a live screen"` with a link back to the form.

---

## Phase 3 — Demo Content

### 3.1 Improve Existing Mock Dossiers

Make `mockData.ts` and `mockData2.ts` showcase-quality:

- All 4 signal types exercised across the matrix (green/amber/red spread).
- Summaries that read like real research: specific power capacity numbers, named utilities, real regulatory context.
- `key_risks` with 3+ substantive items per market.
- `next_steps` that sound actionable, not generic.
- A compelling `markets_to_avoid` section.

### 3.2 Second Demo Scenario

Create a second distinct mock for a different use case (e.g., 5MW edge colocation vs. the existing 50MW hyperscale). Offer it as a toggle on the demo banner or a second CTA on the landing page.

---

## Phase 4 — Loading Experience

### 4.1 Research Step Cycling

Cycle through plausible research messages on a ~4s interval during loading:

```
"Scanning power grid availability across candidate markets..."
"Reviewing utility rate schedules and interconnection queues..."
"Analyzing community sentiment and local permitting history..."
"Checking state and county tax incentive programs..."
"Assessing natural hazard exposure (seismic, flood, wildfire)..."
"Evaluating fiber and network carrier density..."
"Reviewing recent datacenter announcements and land activity..."
"Synthesizing findings and ranking markets..."
```

Cycle **linearly, not randomly** — linear feels like real progress. Do not loop back; end on "Synthesizing..." and hold there until the result arrives.

### 4.2 Elapsed Time Display

Small elapsed timer (`0:42`) in muted monospace below the current step. Sets expectations — users know a 3-minute wait is normal.

### 4.3 Cancel / Reset

A "Cancel" link during loading stops polling and returns to the input view. Currently there's no escape without a page refresh.

---

## Phase 5 — Polish

### 5.1 Error States

Add:
- Friendly copy for common cases: invalid key, agent timeout, malformed response.
- A "Try Again" button that pre-fills requirements from the failed attempt.

### 5.2 Mobile Responsiveness

The 420px fixed left panel breaks on narrow screens. Add a responsive breakpoint (~900px) where the split panel stacks vertically and the signal matrix scrolls horizontally.

### 5.3 Export Verification

`ExportDossier.ts` exists — verify it's wired up in the deployed build and that the self-contained HTML export looks correct in print preview (the Google Fonts import needs to work in the exported file).

### 5.4 `<head>` / SEO

Meaningful `<title>`, `<meta description>`, and Open Graph tags in `index.html` so sharing the URL on LinkedIn produces a decent link preview.

### 5.5 Analytics

CloudWatch Logs on the Lambda function, targeting two metrics: number of runs and average run duration. No third-party service needed.

---

## Recommended Additions

- **Shareable results** *(nice to have)*: Encode the dossier into the URL hash for easy sharing. These dossiers can get large, so keep the 24h DynamoDB store (if you end up adding one for the async refactor) as a fallback for oversized payloads — store by a short UUID, share that instead.
- **Requirements templates**: 2–3 example snippets users can click to pre-fill the textarea. Reduces "blank page" friction for first-time visitors.
- **CSP headers**: Add a `Content-Security-Policy` via CloudFront response headers policy. Important once real user keys are in play.
- **Favicon**: One line in `index.html` + a simple SVG.
