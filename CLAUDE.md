# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What is IC-Sim

IC-Sim is a rehearsal tool for VC analysts and principals to practice defending a deal against four AI investment-committee personas:

- **The Skeptic** (Pat Herrington) — TAM, competition, moat, switching costs.
- **The Operator** (Rhea Kowalski) — unit economics, burn, hiring, architecture, execution.
- **The Regulatory Hawk** (Samuel Oduya) — EU AI Act, GDPR, DORA, MDR, FCA, compliance moat.
- **The Portfolio Lens** (Mira Chen) — overlap, co-invest dynamics, reserves, construction, thesis fit.

It ships as **two parallel surfaces** that share the same four committee personas: a Next.js web app (the deployable browser product) and five Claude Code skills under `.claude/skills/` (terminal-native, runs inside a Claude Code session with no Anthropic API key on the user's machine).

The user journey on the web side: (1) **pick** a deal from the Notion-backed pipeline panel on `/`, (2) the app calls `/api/brief` which uses Anthropic's `web_search_20250305` server tool to enrich the Notion data into a memo-depth brief, (3) **defend** in the room — committee picks the next member adaptively (Haiku-classified evasion → re-ask; otherwise keyword + novelty + random), capped at 12 turns or 18 minutes with a 16-minute warning, (4) **score** with a 5-dimension rubric + PDF export, optionally generate a stateless `/r/[token]` share link.

The user journey on the skill side: (1) `/ic-deals` to browse the pipeline, (2) `/ic-brief` to draft the brief, (3) `/ic-sim` to run the full simulation (or `/ic-turn` to rehearse a single question), (4) `/ic-score` for the post-room rubric.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`, `pnpm-lock.yaml`).

- `pnpm dev` — Next.js dev server on `http://localhost:3000`
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint (flat config, Next 16's `eslint-config-next`)

There is no test runner configured.

## Required env (`.env.local`)

- `ANTHROPIC_API_KEY` — required for `/api/brief`, `/api/turn`, and `/api/score`. Without it, those routes throw at first call (see `lib/anthropic.ts`).
- `NOTION_TOKEN` — required for `/api/deals` and `/api/brief`. The web app's "Browse your pipeline" panel (`components/DealsList.tsx`) calls `/api/deals` on expand, which uses `lib/notion.ts` to query the Dealflow database. The skill side (`ic-deals`, `ic-brief`) uses the user's Notion MCP server independently — same data, two integrations.
- `NOTION_DEALFLOW_DS_ID` — optional override for the Dealflow data source ID hard-coded in `lib/notion.ts`. Kept in sync with the skill's hard-coded ID in `.claude/skills/ic-brief/SKILL.md` (`6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f`).

## Architecture — two surfaces, one product

This repo ships the IC-Sim product in **two parallel forms** that share the same four committee personas:

1. **Next.js web app** (`app/`, `components/`, `lib/`) — the deployable browser product. Owns brief generation, the room, and the score report.
2. **Claude Code skills** under `.claude/skills/` — a terminal-native suite of five skills, invoked individually or chained:
   - `ic-deals` — browse the Notion Dealflow pipeline via Notion MCP
   - `ic-brief` — produce the memo-depth IC brief (JSON + markdown)
   - `ic-turn` — one in-character committee question on demand
   - `ic-score` — post-room rubric, summary, improvement notes
   - `ic-sim` — the orchestrator that runs all four phases end to end via subagents (`.claude/agents/ic-{skeptic,operator,hawk,portfolio}.md`)

**Two-lane briefing — intentional duplication.** Brief generation lives in two places so users on either surface can get a brief without context-switching. The web app's `/api/brief` (called by `DealsList`'s "enter the room →" button) calls the Anthropic SDK with an inline `BRIEF_SYSTEM` and the `web_search_20250305` server tool for live competitor / TAM / regulator verification. The skill's `/ic-brief` does the same job with the built-in `WebSearch` and `WebFetch` tools and the user's Notion MCP server. Both produce the same `Brief` shape from `lib/types.ts`. The `DealsList` row exposes both: "enter the room →" for the web flow, "/ic-sim" for the terminal flow. Deal *browsing* is also dual-surface: `/api/deals` server-side via `lib/notion.ts`; `ic-deals` skill via Notion MCP. **The duplication tax**: any change to the `Brief` schema must land in three places — `lib/types.ts`, the inline `BRIEF_SYSTEM` in `app/api/brief/route.ts`, and the brief shape in `.claude/skills/ic-brief/SKILL.md`. The pasted-JSON entry point has been removed; runtime schema validation now happens implicitly via `briefContext()` in `lib/committee.ts` (missing optional fields render as empty sections, missing required fields will surface as `undefined` in the room).

Persona changes must be made in **both places** or the surfaces drift. The web personas live in `lib/committee.ts` (`SHARED_RULES` + per-member `systemPrompt`). The skill personas live in `.claude/agents/ic-{skeptic,operator,hawk,portfolio}.md`. The skill's orchestrator (`SKILL.md`) is the source of truth for the session shape (10 turns, opening-statement framing, sentiment dashboard, scored rubric). The brief schema is co-owned by `lib/types.ts` (canonical TypeScript) and `.claude/skills/ic-brief/SKILL.md` (canonical prose-spec).

### Web-app session flow

`app/page.tsx` renders three sections: the hero/header, the "How it works" explainer, and a collapsible `<DealsList />` panel (lazy-fetches `/api/deals` on expand). The "enter the room →" button on each row calls `POST /api/brief {notionId}` → the Anthropic SDK with `web_search_20250305` enriches the Notion data into a memo-depth `Brief` (~20-40s) → `setBrief` in `SessionProvider` → router pushes to `/room` (`CommitteeRoom`) → streaming `/api/turn` per committee turn → `/api/score` → `/report` (`ScoreReport`, with `@react-pdf/renderer` export and a "Share result" button that hits `/api/share`).

`DealBrief` in `/room` renders a ~270px **executive card** by default — company, one-liner, chips, inline SSI / Reg metrics, top 3 risks — and opens the full 16-section memo in a right-anchored **drawer** (backdrop dimmer, Esc closes, body scroll lock) on click. The drawer is also where `brief.sources` web-search citations render as clickable links. The committee LLM still sees the full memo via `briefContext()` in `lib/committee.ts`; the drawer is purely a presentational compression.

Session state lives in a `useReducer` inside `lib/session-context.tsx` and is persisted to `sessionStorage` (tab-scoped, clears on tab close). `hydrated` is folded into the reducer state and flipped via a single atomic dispatch on mount — never via a standalone `useState` + effect (that pattern earlier produced both a TS error and a `react-hooks/set-state-in-effect` warning). Refreshing `/room` or `/report` rehydrates from storage; only navigating home or resetting clears it. The PDF export is still the canonical way to archive a session.

### Session-end policy

`lib/session-end.ts` is the single source of truth for the cap constants. PRD §12.6:

- **Soft end** (≥8 member turns AND ≥15 min AND all 4 members have spoken) — surfaces as an amber "Soft end available" badge in the room header. User clicks "End Session" to end; never automatic.
- **Hard cap on turns** (≥12 presenter responses) — `handlePresenterSubmit` auto-calls `finalize()` once the next submit would push past the cap. We cap on the *presenter* side so the committee is never cut off mid-question.
- **Hard cap on time** (≥18 min elapsed) — a 1-second `setInterval` in `CommitteeRoom` checks `Date.now() - startedAt` and calls `finalize()` when crossed. This is the only path that can fire when the user is idle between turns.
- **16-minute warning** — same interval surfaces a `<TimeoutWarning>` toast with "2 min left · Wrap your answer". Auto-dismisses after 8 s; manual ✕ sets a `warningDismissed` ref so it doesn't re-show.

`SessionTimer.tsx` color-escalates `text-bone → text-amber → text-oxblood` at the soft-end and warning thresholds for visual urgency. The `startedAt` field is persisted in the reducer, so a mid-session refresh keeps counting from the original start.

### The lookup helper (input-side research)

`/api/lookup` (`app/api/lookup/route.ts`) is a research-assist sidecar used by `TranscriptInput`. POST `{brief, draftText, lastMemberQuestion}` → the Anthropic SDK with `web_search_20250305` (`max_uses: 2`, ephemeral cache on system + tool) → returns `{tip, facts[]}` (2-3 citable data points, ≤25 words each). `LookupPanel` renders them above the textarea; clicking a fact inserts `> {text} — {source}` as a blockquote at the caret. Each lookup auto-dismisses when a new committee question arrives. `extractJson` defends the parse; `web_search_tool_result` URLs are spliced in if the model omits them.

### Share page (`/r/[token]`)

`app/r/[token]/page.tsx` is a server component that decodes a base64url-encoded `SharePayload` from the URL path and renders the score badge, verdict band, 5 rubric numbers, summary, and 3 improvement notes. **There is no KV.** The URL IS the data: `lib/share-token.ts` round-trips `JSON.stringify → utf8 → base64url`. A realistic payload is ~700-1100 chars, comfortable for Twitter/LinkedIn/iMessage. Malformed tokens render a friendly fallback (HTTP 200) with a "Defend your own deal →" CTA — never a 500. The trade-off accepted by this design: the URL is immutable. To redact, you re-share; old links live forever. KV-backed mutation is the obvious follow-up.

`generateMetadata` produces dynamic `<title>`, `<meta description>`, and Open Graph / Twitter Card tags from the decoded payload, so social-card previews show the company name and overall score.

### Error recovery

- **Turn streams** (`/api/turn`): the SDK call is wrapped in `withRetry` (`lib/retry.ts`) which retries 2x on 5xx/529. The client (`CommitteeRoom`) uses an `AbortController` per turn and aborts in-flight requests on unmount.
- **Score failures** (`/api/score`): the route is retried the same way. If scoring still fails, the user does NOT navigate to `/report` — `CommitteeRoom` surfaces an inline "Retry scoring" button instead. If the user reaches `/report` without a rubric, the page renders a "Re-score transcript" button using the persisted `turns`.

### The streaming contract

`/api/turn` (`app/api/turn/route.ts`) is the hot path. It:

1. Receives `{ memberId, brief, turns }`.
2. Maps the prior `turns` into Anthropic `messages`. Cross-member chatter (turns from members other than the one currently speaking) is framed as user-supplied context: `[Earlier in the room, X asked the presenter:] …`. The earlier-and-buggy approach assigned all member turns to `role: "assistant"` with `[ArchetypeName]:` prefixes, which caused impersonation (commit `f5672db` is the fix).
3. Calls the Anthropic SDK with `stream: true`, `system` as a single-element array marked `cache_control: { type: "ephemeral" }`, and the `web_search_20250305` tool also marked for caching.
4. Streams `content_block_delta.text_delta` events as a plain text response.
5. The client (`CommitteeRoom.runMember`) accumulates the stream and runs `parseSentiment` (in `lib/turn-router.ts`) on each chunk to keep the visible text clean of the trailing `[sentiment: X]` line.

The sentiment tag is **mandatory** for every committee reply — written by the LLM under `SHARED_RULES` in `lib/committee.ts`, parsed off the last line, and surfaced as a colored dot in `MemberCard`. If a model output omits it, `parseSentiment` silently defaults to `neutral`. The per-member sentiment trajectory is also surfaced in the post-room report (`ScoreReport` + `ReportPDF`) via `sentimentTrajectory()` in `lib/turn-router.ts`.

### Prompt caching

`/api/turn` and `/api/brief` mark their `system` block (and the `tools` array, where present) with `cache_control: { type: "ephemeral" }`. Sonnet 4.6's minimum cacheable prefix is **1,024 tokens**, which is why `briefContext()` in `lib/committee.ts` is deliberately verbose (rendering all the memo-depth brief fields, not just the original core ones). Cache write is 1.25x base input cost; cache reads are 0.1x. A 10-turn IC session with 4 personas yields ~28 cache reads after the initial writes, cutting input cost ~80% on the room. The cache TTL is 5 minutes (refreshed on each hit), which comfortably covers a 15-30 min session.

`/api/score` is **not cached** — `SCORE_SYSTEM` is ~300 tokens, below the Sonnet 4.6 floor. Don't try to pad it.

### The turn router

`lib/turn-router.ts` exposes **two orchestrators**:

- **`pickNextMemberSync(turns): MemberId`** — used for the kickoff turn (no prior presenter answer to evaluate). Picks by penalizing repeats (`-10` for the last member who spoke), scoring keyword matches against each member's `domain` (in `lib/committee.ts`), adding a novelty bonus for unspoken members, plus a small random tiebreaker.
- **`pickNextMember(turns, {signal?}): Promise<PickResult>`** — used for every subsequent turn. Layers PRD §12.2 evasion classification on top of the sync pick. Finds the most recent member-question / presenter-answer pair, POSTs them to `/api/evasion` (Haiku 4.5, `temperature: 0.2`, `max_tokens: 4`, returns 1-5). If score ≤ 2 → returns `{memberId: lastMember, reaskOf: question}` so the same member re-asks with a "you didn't address X — let me re-ask" preamble. Otherwise falls through to `pickNextMemberSync`. On any classifier failure the simulator silently degrades to keyword-only routing — it never stalls.

`CommitteeRoom.handlePresenterSubmit` is `async` and surfaces a "Conferring…" amber pulse on the right rail while the classifier is in flight (~300-600ms).

If you need to change who jumps in on a given keyword, edit the `domain` arrays — not the router. If you need to change re-ask wording, edit `reaskPreamble` in `app/api/turn/route.ts` (it's a second `system` text block without `cache_control` so it doesn't invalidate the persona's cached prefix).

### Brief & score JSON contracts

Five places hold a JSON-emitting system prompt: `app/api/brief/route.ts` (the `BRIEF_SYSTEM` constant), `app/api/score/route.ts`, `app/api/lookup/route.ts`, `app/api/share/route.ts` (no LLM but the same `SharePayload` shape contract), and `.claude/skills/ic-brief/SKILL.md`. The LLM-driven routes require the model to return **bare JSON** (no markdown fences, no prose). All are defended at parse time by the shared `extractJson` helper in `lib/json-extract.ts` — strips a fenced block if present, otherwise slices from the first `{` to the last `}`. Don't add prose to these prompts or you'll break the `JSON.parse`.

Both `/api/brief` and `/api/score` wrap `JSON.parse(extractJson(text))` in a `try/catch` that logs `text.length`, `stop_reason`, and the trailing 200 chars on failure. When the model truncates (the most common failure mode), the error message includes `stop_reason=max_tokens` so the cause is obvious from the client error alone — no need to dig server logs.

The single source of truth for the `Brief` shape is `lib/types.ts`. The web app no longer has a paste-JSON entry point, so there is no runtime schema validator — the only way to populate a `Brief` is through `/api/brief` (server-controlled) or `setBrief()` on the session context (currently only called from `DealsList`). If you add a new entry point that accepts an externally-supplied `Brief`, validate against `lib/types.ts` at the boundary.

### `/api/brief` in-flight dedupe

`app/api/brief/route.ts` keeps a module-scoped `Map<string, Promise<Brief>>` keyed by `notion:{pageId}` or `raw:{sha1(rawText).slice(0,16)}`. Two concurrent identical requests (e.g. the user double-clicks "enter the room →" out of impatience because briefs take 60-120s) share a single Anthropic + web_search pipeline; the second caller `await`s the first's promise. The key is released via `.finally(() => map.delete(key))` so a failed request can be retried, and a follow-up request 90s later still re-runs from scratch. This is **dedupe, not caching** — without Vercel KV, a TTL cache would either be lost on every cold start or serve stale briefs across Notion edits. KV-backed `brief:{pageId}:{last_edited_at}` caching with 24h TTL is the obvious next step (PRD §9.5).

### Notion integration

`lib/notion.ts` uses `@notionhq/client` v5 (notionVersion `2025-09-03`) and exposes two functions: `listDeals()` (queries the Dealflow data source, filters out `❌ Pass`, sorts by `Last Edited At` desc, returns `DealListItem[]`) and `fetchDeal(pageId)` (returns the full mapped-properties object for a single page). `listDeals` tries the newer **Data Sources** endpoint first (`dataSources.query`); if the configured ID is actually a database container, it resolves the database to its first data source via `databases.retrieve` and retries. The field-mapping (Company, One-liner, Sector, SSI Score, Kill Criteria, etc.) is the contract shared with `ic-brief`'s skill output — they must stay in sync, or paste-validation will reject server-fetched data. Only `/api/deals` consumes `lib/notion.ts` today; the skill side uses the Notion MCP server independently.

## Model and SDK

- `lib/anthropic.ts` pins two model IDs: `MODEL_ID = "claude-sonnet-4-6"` for `/api/brief`, `/api/turn`, `/api/score`, `/api/lookup`; `HAIKU_MODEL_ID = "claude-haiku-4-5-20251001"` for `/api/evasion` only (~10× cheaper, ~3× faster, needed because the classifier sits on the critical path of every turn). The Anthropic client is lazily instantiated and reused per server process.
- SDK: `@anthropic-ai/sdk` v0.88.0. `/api/turn` and `/api/brief` use `stream: true`/non-streaming respectively with the `web_search_20250305` server tool. SDK 0.88's `Tool` union doesn't list this server-tool version, hence the `as unknown as never` casts at the call sites — when bumping the SDK, drop those casts and re-test (the newer `web_search_20260209` is also available on Sonnet 4.6 with dynamic filtering, but isn't a drop-in syntactically).
- Retry: all LLM routes wrap `messages.create()` in `withRetry()` from `lib/retry.ts` — retries 2× with exponential backoff (400ms, 1200ms, 3600ms + jitter) on 5xx/529 only. 4xx errors are not retried.

### `web_search` cost ceiling

Anthropic's `web_search` server tool charges per search. Per-route caps:

| Route          | Model      | `max_uses` | Notes                                                              |
|----------------|------------|-----------:|---------------------------------------------------------------------|
| `/api/brief`   | Sonnet 4.6 | 4          | Was 6 — trimmed since each search adds 5-10s and bloats the loop. |
| `/api/turn`    | Sonnet 4.6 | 3          | Per committee turn. Up to 12 turns × 3 = 36 searches per room.    |
| `/api/lookup`  | Sonnet 4.6 | 2          | Narrower than a brief; the founder is composing inline.            |
| `/api/evasion` | Haiku 4.5  | —          | No web_search. Pure classification.                                |
| `/api/score`   | Sonnet 4.6 | —          | No tools; rubric only.                                             |
| `/api/share`   | —          | —          | No LLM. Pure transformation.                                       |

A pessimistic 12-turn IC session can therefore trigger up to 4 (brief) + 36 (room) + 24 (lookup, if used every turn) = **~64 web searches** plus 12 Haiku classifier calls. At scale, gate or cap. The Haiku calls are negligible (~$0.0003 each); the Sonnet `web_search` calls are the real cost.

### Why raw SDK, not the Vercel AI Gateway

The Vercel platform recommendation is to default to the AI Gateway (`provider/model` strings). For this project, raw `@anthropic-ai/sdk` is deliberate because (a) the prompt-caching `cache_control` syntax is most direct on the raw SDK, (b) the `web_search_20250305` server tool is Anthropic-specific, and (c) the streaming + sentiment-parsing contract is simpler when we own the event loop. If migrating to the AI Gateway later, the caching headers + server-tool support need to be re-verified.

## Conventions

- **Path alias**: `@/*` → repo root (`tsconfig.json`). Used everywhere as `@/lib/...`, `@/components/...`.
- **TypeScript**: `strict: true`. All shared types live in `lib/types.ts` — `MemberId`, `Brief`, `Turn`, `Sentiment`, `Rubric`, `Source`, `LookupFact`, `LookupResult`, `SharePayload`. Adding a new committee member means updating `MemberId`, `lib/committee.ts`, **and** adding a matching `.claude/agents/ic-<id>.md`.
- **React**: 19.2.x with the new `useReducer` patterns. The session context uses `useCallback`-wrapped dispatchers; don't pass raw `dispatch` out of the provider.
- **Styling**: Tailwind v4 via `@tailwindcss/postcss`. Custom utility classes (`hairline`, `mono`, `display`, `text-bone`, `grain`) are defined in `app/globals.css` — search there before inventing new ones.
- **Fonts**: Three Google fonts wired in `app/layout.tsx` (Fraunces / Inter Tight / JetBrains Mono) as CSS variables — `--font-fraunces` etc.
- **Motion**: framer-motion with house easing `[0.2, 0, 0, 1]` and durations 0.22-0.36s. Used in `MemberCard`, `DealBrief` drawer, `TimeoutWarning`, share-button toast, and the lookup panel. Re-use, don't invent.
- **Session-end constants**: never hard-code 8 / 12 / 15 / 16 / 18 — import from `lib/session-end.ts` (`SOFT_END_TURNS`, `SOFT_END_MS`, `HARD_CAP_TURNS`, `HARD_CAP_MS`, `WARNING_MS`).
- **Lint ignores**: `eslint.config.mjs` ignores `**/.next/**` and `.claude/worktrees/**`. The plain `.next/**` pattern only matched the repo root and missed nested build artifacts inside worktrees; that produced ~500 spurious errors before the fix.

## When editing personas

The four members ship under two names: an `id` and an `archetype`. They must agree across files:

| `MemberId`  | Archetype           | Web file (`lib/committee.ts`) | Skill file                        |
|-------------|---------------------|-------------------------------|-----------------------------------|
| `skeptic`   | The Skeptic         | Pat Herrington                | `.claude/agents/ic-skeptic.md`    |
| `operator`  | The Operator        | Rhea Kowalski                 | `.claude/agents/ic-operator.md`   |
| `hawk`      | The Regulatory Hawk | Samuel Oduya                  | `.claude/agents/ic-hawk.md`       |
| `portfolio` | The Portfolio Lens  | Mira Chen                     | `.claude/agents/ic-portfolio.md`  |

Changing a persona's voice in one place without the other will produce visible drift between the web product and the skill.
