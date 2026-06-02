# SiteScope — Deploy Roadmap (v2)

Plan for getting SiteScope to a live, publicly shareable URL at `sitescope.grantwang.dev`.

**Architecture pivot since v1:** the deploy is now **frontend-only with a bring-your-own-key (BYO-key) model** — the browser calls Subconscious directly, no backend in the request path — *contingent on the Phase 0 validation gate*. This deletes FastAPI, Lambda, the async refactor, DynamoDB, polling, and the CloudFront `/api/*` routing from v1. Deploy collapses to `vite build → S3 → CloudFront`.

### What changed from v1 (and why)

- **The Subconscious Runs API is gone.** The live OpenAPI contract (`/api-reference/openapi.json`) exposes only `/chat/completions` and `/messages`. A `POST /v1/runs` returns 404. The detailed Runs/`runId`/poll docs that v1's refactor was built on survive only in the stale `llms-full.txt` aggregate. **v1's entire 1.3 "SDK migration / `await_completion: False` / `runId` / poll" plan is invalid** — do not build on it.
- **Structured output moved.** `answerFormat` was a Runs-API field. On the compat endpoint it's `response_format: { type: "json_schema", ... }`.
- **Model name:** `tim-claude` is gone; the GA model is `subconscious/tim-qwen3.6-27b`.
- **CORS is open.** A preflight from an arbitrary origin gets that origin reflected back in `access-control-allow-origin`, with `Authorization` allowed. So the browser can call Subconscious directly — no proxy needed *for the call itself*.
- **No long-running Lambda.** Holding a server open for a multi-minute run was the thing that forced the whole async design (CloudFront caps origin response at 60s). Frontend-only removes the server from the path entirely, so the timeout problem disappears instead of being worked around.

---

## Phase 0 — Validation Gate (do this FIRST, before deleting any backend code)

Three questions get answered by a small amount of work here. Do not rip out the backend until they're settled.

### 0.1 Rotate the API key

Generate a fresh `SUBCONSCIOUS_API_KEY` in the dashboard and revoke the current one. The current key has been pasted in plaintext into external tooling, so treat it as compromised regardless of git history. Do this before any test runs.

### 0.2 The decisive test: does the research actually happen?

This is the gate the whole architecture depends on. SiteScope's value is the agentic multi-search across seven dimensions. That was driven by Subconscious **platform tools** on the Runs API. The compat `/chat/completions` endpoint **does not expose a `tools` field at all**; `/messages` exposes *function* tools (you define and execute them), not Subconscious's built-in web search.

Run one real screen with the new key, `stream: true`, and your `response_format` schema, then inspect the result:

- **Does it perform real research, or does it hallucinate a plausible-looking dossier with no searches behind it?** Check for specific, verifiable, current facts (named utilities, real interconnection-queue figures, actual moratorium news). Generic-but-confident output = no real search = fail.
- Capture the `usage` object → real token cost per run (feeds the cost model).
- Confirm streaming works from a browser-style `fetch`.

### 0.3 Branch on the result

- **Research works on a plain compat call → Phase 1A (frontend-only).** Clean path, no backend.
- **Research needs server-side tool execution** (model emits `tool_use` for a search function that something must run and loop) → **Phase 1B (thin streaming proxy).** A minimal backend runs the tool loop. This is the fallback; only build it if 0.2 fails.

Everything below assumes Phase 1A unless noted.

---

## Phase 1A — Frontend-Only Deploy (primary path)

### 1A.1 Direct browser → Subconscious

- The browser calls `https://api.subconscious.dev/v1/chat/completions` with the visitor's BYO key in the `Authorization: Bearer` header.
- **Model:** `subconscious/tim-qwen3.6-27b`.
- **Structured output:** `response_format: { type: "json_schema", json_schema: { name: "SiteScreeningDossier", schema: {...} } }`. The schema is now a static JSON-Schema object shipped in the frontend (derive it once from the old Pydantic `SiteScreeningDossier` / your `types.ts`; it lives client-side now).
- **Streaming:** use `fetch` + a `ReadableStream` reader, **not `EventSource`** (`EventSource` is GET-only and can't set an `Authorization` header). Or use the OpenAI JS SDK with `dangerouslyAllowBrowser: true` and `stream: true`, which handles the SSE parsing for you.
- **No backend, no Lambda, no DynamoDB, no polling, no `PollResult` mapping.** `lib/api.ts` becomes a single streaming client call.

### 1A.2 BYO-key is mandatory (not optional)

You can never ship your own key in frontend code — open CORS or not, anyone can read it in devtools. So the only two flows are:

- **Demo** — loads `mockData`, no key, no API call. $0. Most visitors.
- **Live run** — visitor enters their own Subconscious key. Their key pays for their run.

This is the same BYO-key model v1 landed on, and it's what makes frontend-only viable.

### 1A.3 Deploy

- `vite build` → upload `dist/` to an S3 bucket (static hosting, `index.html` as both index and error doc for SPA routing).
- CloudFront distribution in front (HTTPS + caching). **Single origin (S3).** No `/api/*` behavior, no second origin, no cache-disable rules — there's no API to route to.

That's the entire backend story now.

---

## Phase 1B — Fallback: Thin Streaming Proxy (only if Phase 0.2 fails)

Build this *only* if the research needs server-side tool execution.

- One Lambda in **response-streaming mode** (`InvokeWithResponseStream`), behind a Function URL, fronted by CloudFront `/api/*`.
- It runs the function-tool loop: takes the visitor's BYO key + requirements, calls Subconscious, executes the search tool calls the model emits, feeds results back, and **streams** the assembled response straight through to the client.
- Key difference from v1's dead worker design: it is *actively streaming the whole time*, never idle-blocked, so it sidesteps the CloudFront 60s ceiling (continuous data) and Lambda's 15-min limit covers the run.
- Still BYO-key, passed through per request — never store it.
- Container-based Lambda (`public.ecr.aws/lambda/python:3.12`); whatever search backend the tools need.

Keep it as small as possible. The point of Phase 0 is to avoid ever building this.

---

## Phase 1.5 — Custom Domain + TLS (`sitescope.grantwang.dev`)

Same in either path:

1. Request an ACM cert for `sitescope.grantwang.dev` in `us-east-1` (required for CloudFront).
2. Add the CNAME validation record to `grantwang.dev` DNS.
3. Attach the cert; add `sitescope.grantwang.dev` as a CloudFront alternate domain name.
4. CNAME `sitescope.grantwang.dev → <distribution>.cloudfront.net`.

~30 minutes. Reads far more professional than a `*.cloudfront.net` URL on a résumé.

---

## Phase 1.6 — IaC (Optional but Recommended)

Even smaller now. In the frontend-only path it's just S3 + CloudFront + ACM (~80 lines of CDK/Terraform). Makes re-deploys and teardowns one command. Worth it before this goes on a portfolio.

---

## Phase 2 — Landing Page + Key Flow

### 2.1 New Landing Page

Two-path landing replacing the minimal `InputView`:

- **"See a Demo"** — loads a pre-baked dossier instantly, no key.
- **"Run a Screen"** — reveals the API key input + requirements form.

Short headline + 2-sentence value prop. Keep the enterprise-dense paper aesthetic.

### 2.2 BYO-Key Flow

1. Inline `Subconscious API Key` input (type=password) above the requirements textarea.
2. On submit, the **browser** calls Subconscious directly (1A) — or the proxy (1B).
3. Store the key in `localStorage` so returning visitors don't re-enter it. Add a "forget key" link.
4. Cheap pre-flight validation: a tiny throwaway completion (a few tokens) to confirm the key works before the multi-minute run, so an auth error surfaces immediately. Cheaper than a dedicated endpoint and needs no backend.
5. **Security note:** the key now lives in the browser (`localStorage`). This makes CSP (Phase 5) more important, not less — an XSS bug would expose the visitor's key. Call this out in the UI copy ("your key stays in your browser and is sent only to Subconscious").

### 2.3 Demo Mode Path

"See a Demo" → straight to the dossier view with `mockData.ts`, no key, no call. Header banner: `"Viewing demo data — enter your key to run a live screen"` linking back to the form.

---

## Phase 3 — Demo Content

(Unchanged from v1 — still the highest-leverage work, since demo mode is what most visitors see.)

### 3.1 Make `mockData.ts` / `mockData2.ts` showcase-quality

- All 4 signal types exercised across the matrix (green/amber/red spread).
- Summaries that read like real research: specific power figures, named utilities, real regulatory context.
- `key_risks` with 3+ substantive items per market.
- Actionable, non-generic `next_steps`.
- A compelling `markets_to_avoid` section.

### 3.2 Second Demo Scenario

A second distinct mock (e.g. 5MW edge colo vs. the existing 50MW hyperscale), as a toggle on the demo banner or a second CTA.

---

## Phase 4 — Loading Experience

Streaming changes the loading story, with one caveat worth understanding.

### 4.1 Real progress via streamed reasoning (preferred)

With `response_format: json_schema`, the streamed deltas are *partial JSON* — not renderable until complete, so you can't progressively draw the dossier. But if you enable thinking (`chat_template_kwargs: { enable_thinking: true }`), the model streams its reasoning in `<think>` tags *before* the final answer. Stream and display that reasoning live as genuine progress, then snap to the rendered dossier when the final JSON block completes. This is real progress, not theater.

### 4.2 Simulated step cycling (fallback)

If thinking isn't exposed or reads poorly, fall back to v1's cycling messages on a ~4s linear interval (do not loop; hold on "Synthesizing..."). Keep this as the backup, not the default.

### 4.3 Elapsed timer

Small `0:42` monospace timer below the current step. Sets expectations for a multi-minute wait.

### 4.4 Cancel / Reset

A "Cancel" link that aborts the in-flight `fetch` (`AbortController`) and returns to the input view. With streaming there's no poll loop to stop — just abort the request.

---

## Phase 5 — Polish

### 5.1 Error States

Friendly copy for: invalid key, timeout / stalled stream, malformed or incomplete JSON (the stream ended before the dossier closed). A "Try Again" button that pre-fills requirements from the failed attempt.

### 5.2 Mobile Responsiveness

The 420px fixed left panel breaks on narrow screens. Add a ~900px breakpoint where the split panel stacks vertically and the signal matrix scrolls horizontally.

### 5.3 Export Verification

Verify `ExportDossier.ts` is wired up in the deployed build and the self-contained HTML export renders correctly in print preview (the Google Fonts import must work in the exported file).

### 5.4 `<head>` / SEO

Meaningful `<title>`, `<meta description>`, and Open Graph tags in `index.html` for a clean LinkedIn link preview.

### 5.5 Analytics

No Lambda means no CloudWatch metrics. Use either CloudFront **standard logs** delivered to S3 (free-ish, query later with Athena) or a privacy-light client-side analytics call (e.g. Plausible) on: page load, "Run Screen" submit, demo view. Event counts only, no user data.

---

## Cost (summary)

- **Infrastructure: ~$0/month.** Static site on S3 + CloudFront sits inside permanent free tiers (CloudFront: 1 TB transfer + 10M requests/month; S3: a few MB). No Lambda in the frontend-only path. No WAF (BYO-key removes the quota-burn abuse surface that would have justified it).
- **Subconscious tokens: $0 to you.** Live runs are paid by the visitor's own key. Demo mode makes no API call. Measure one real run's `usage` (Phase 0.2) to know the per-run cost a *visitor* bears (rough prior: ~$0.10–$2.00, likely ~$0.25–$0.75, on `tim-qwen3.6-27b` at $0.50/1M in, $3.50/1M out).
- **Phase 1B fallback** adds Lambda, but at portfolio traffic it stays within the free tier too (~$0).

---

## Recommended Additions

- **Shareable results** *(nice to have)*: encode the dossier into the URL hash (compress with `lz-string` for large payloads). With no backend there's no server-side store, so the hash is the whole mechanism — accept a size ceiling rather than reintroducing storage.
- **Requirements templates**: 2–3 clickable example snippets to pre-fill the textarea. Reduces blank-page friction.
- **CSP headers** *(elevated priority)*: set a `Content-Security-Policy` via a CloudFront response-headers policy. With the visitor's key in `localStorage`, locking down script sources is the main defense against key exfiltration via XSS. Restrict `connect-src` to Subconscious + self.
- **Favicon**: one line in `index.html` + a simple SVG.

---

## Appendix — Subconscious API Reference (confirmed)

Everything here is verified against the live OpenAPI contract and live request tests (June 2026). The older `llms-full.txt` aggregate still describes a Runs API; ignore it — it is stale.

### Endpoints that exist

The live contract (`https://docs.subconscious.dev/api-reference/openapi.json`) defines exactly two paths:

- `POST /v1/chat/completions` — OpenAI Chat Completions compatible. **Primary endpoint for SiteScope (Phase 1A).**
- `POST /v1/messages` — Anthropic Messages compatible. Relevant only to the **1B fallback** (it's the one with tool use).

`POST /v1/runs` returns **404** — the Runs API is not available. There is no submit→poll mechanism.

### Auth

- Base URL: `https://api.subconscious.dev/v1` (Anthropic SDK uses `https://api.subconscious.dev`).
- Bearer: `Authorization: Bearer <KEY>`. The `/messages` endpoint also accepts `x-api-key: <KEY>`.
- Keys are dashboard-issued, prefixed `sky_…`.

### CORS (confirmed open)

A preflight from an arbitrary origin is reflected back, with credentials headers allowed:

```
> OPTIONS /v1/chat/completions   Origin: https://yoursite.com
< 204
< access-control-allow-origin: https://yoursite.com
< access-control-allow-methods: POST
< access-control-allow-headers: Authorization, Content-Type
```

Arbitrary origin reflected ⇒ any browser origin can call it directly with the key in the `Authorization` header. This is what makes the frontend-only path possible.

### `POST /v1/chat/completions` — request

Required: `model`, `messages`. Relevant optional fields:

| Field | Notes |
| --- | --- |
| `model` | `subconscious/tim-qwen3.6-27b` (only GA model; `tim-claude` is gone) |
| `messages` | `[{ role: "system"\|"user"\|"assistant", content: string }]` |
| `stream` | `true` → SSE; stream ends with `data: [DONE]` |
| `response_format` | `{ type: "json_schema", json_schema: { name, schema } }` for the dossier. (`json_object` and `text` also valid.) |
| `max_tokens` / `max_completion_tokens` | cap output |
| `temperature` | 0–2 |
| `stream_options` | `{ include_usage: true }` → token usage in the final streamed chunk |
| `chat_template_kwargs` | Subconscious extension. `{ enable_thinking: true }` → reasoning emitted in `<think>` tags before the answer (drives the Phase 4.1 live-progress display) |

**No `tools` field on this endpoint.** This is the crux of the Phase 0 gate — there is no way to attach Subconscious's built-in web search here.

Example (streaming + structured dossier + thinking):

```jsonc
POST /v1/chat/completions
Authorization: Bearer <USER_KEY>
{
  "model": "subconscious/tim-qwen3.6-27b",
  "messages": [
    { "role": "system", "content": "You are SiteScope, a data center site-screening agent..." },
    { "role": "user", "content": "<requirements: capacity, timeline, geography, weighting>" }
  ],
  "stream": true,
  "stream_options": { "include_usage": true },
  "response_format": {
    "type": "json_schema",
    "json_schema": { "name": "SiteScreeningDossier", "schema": { /* dossier JSON Schema */ } }
  },
  "chat_template_kwargs": { "enable_thinking": true }
}
```

### `POST /v1/chat/completions` — response

```jsonc
{
  "id": "chatcmpl-…",               // completion id, NOT a pollable run handle
  "object": "chat.completion",
  "created": 1716000000,
  "model": "subconscious/tim-qwen3.6-27b",
  "choices": [{
    "index": 0,
    "message": { "role": "assistant", "content": "<the dossier JSON string>" },
    "finish_reason": "stop"          // or "length"
  }],
  "usage": { "prompt_tokens": …, "completion_tokens": …, "total_tokens": … }
}
```

The dossier is a JSON **string** in `choices[0].message.content` — `JSON.parse` it. `usage` is your per-run cost basis (Phase 0.2).

### Streaming format (SSE)

OpenAI-compatible. Each event is a `ChatCompletionChunk`; deltas arrive on `choices[0].delta.content`; the stream terminates with `data: [DONE]`.

```
data: {"choices":[{"delta":{"content":"<think> evaluating power grid…"}}]}
data: {"choices":[{"delta":{"content":"…"}}]}
data: [DONE]
```

Browser consumption: `fetch` + `response.body.getReader()` (decode chunks, split on `\n\n`, strip `data: `), **not `EventSource`** (GET-only, can't set `Authorization`). Or OpenAI JS SDK with `dangerouslyAllowBrowser: true`, `stream: true`.

Caveat: with `response_format: json_schema`, the streamed deltas are *partial JSON* and aren't renderable until complete. Stream the `<think>` content for live progress; parse the final JSON for the dossier.

### `POST /v1/messages` — for the 1B fallback only

Anthropic Messages shape. The reason it matters: it **does** expose tool use, which `/chat/completions` lacks.

- Required: `model`, `messages`, `max_tokens`. System prompt is the top-level `system` field, not a message.
- `tools`: `[{ name, description, input_schema }]` — these are **function tools you define and execute**; the model emits `tool_use` blocks you must run and feed back as `tool_result`. (Not Subconscious-hosted search.)
- `tool_choice`: `{ type: "auto" | "any" | "tool", name? }`.
- `thinking`: `{ type: "enabled", budget_tokens }`.
- Structured output: no `response_format`; force a tool call whose `input_schema` is the dossier schema and read the `tool_use.input`.
- Response: `content[]` array of `text` / `thinking` / `tool_use` blocks; `stop_reason` ∈ `end_turn | max_tokens | tool_use`; `usage.{input_tokens, output_tokens, cache_read_input_tokens}`.

If Phase 0 shows research needs server-side tools, this is the endpoint the proxy drives, executing the search tool-call loop server-side.

### Pricing (`tim-qwen3.6-27b`)

| | per 1M tokens |
| --- | --- |
| Input | $0.50 |
| Cached input | $0.05 |
| Output | $3.50 |

Borne by the visitor's key in the BYO-key model. Confirm real per-run volume from a live `usage` object.