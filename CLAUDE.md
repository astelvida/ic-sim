# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What is IC-Sim

IC-Sim is a rehearsal tool for VC analysts and principals to practice defending a deal against four AI investment-committee personas:

- **The Skeptic** (Pat Herrington) — TAM, competition, moat, switching costs.
- **The Operator** (Rhea Kowalski) — unit economics, burn, hiring, architecture, execution.
- **The Regulatory Hawk** (Samuel Oduya) — EU AI Act, GDPR, DORA, MDR, FCA, compliance moat.
- **The Portfolio Lens** (Mira Chen) — overlap, co-invest dynamics, reserves, construction, thesis fit.

It ships as **two surfaces in parallel**: a Next.js web app (the deployable browser product) and a set of Claude Code skills under `.claude/skills/` (a terminal-native variant that runs entirely inside a Claude Code session with no Anthropic API key on the user's machine). The web app increasingly depends on the skills as its upstream — see the asymmetry note in the architecture section below.

The user journey, end to end: (1) **brief** the deal with `/ic-brief` in Claude Code, (2) **paste** the resulting JSON into the web landing page, (3) **defend** across ten streaming turns in the room, (4) **score** with a 5-dimension rubric + PDF export.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`, `pnpm-lock.yaml`).

- `pnpm dev` — Next.js dev server on `http://localhost:3000`
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint (flat config, Next 16's `eslint-config-next`)

There is no test runner configured.

## Required env (`.env.local`)

- `ANTHROPIC_API_KEY` — required for `/api/brief`, `/api/turn`, and `/api/score`. Without it, those routes throw at first call (see `lib/anthropic.ts`). Brief generation lives in two places by design: `/api/brief` for the web "Generate →" path and the `ic-brief` Claude Code skill for the terminal flow. See the duplication caveat below in the architecture section.
- `NOTION_TOKEN` — required for `/api/deals`. The web app's "Browse your pipeline" panel (`components/DealsList.tsx`) calls `/api/deals` on expand, which uses `lib/notion.ts` to query the Dealflow database. The skill side (`ic-deals`) still uses the user's Notion MCP server independently — same data, two integrations.
- `NOTION_DEALFLOW_DS_ID` — optional override for the Dealflow data source ID hard-coded in `lib/notion.ts`. Kept in sync with the skill's hard-coded ID in `.claude/skills/ic-sim/SKILL.md` (`6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f`).

## Architecture — two surfaces, one product

This repo ships the IC-Sim product in **two parallel forms** that share the same four committee personas:

1. **Next.js web app** (`app/`, `components/`, `lib/`) — the deployable browser product. Now scoped to the room (`/api/turn`) and the report (`/api/score`); brief generation and deal browsing have moved out.
2. **Claude Code skills** under `.claude/skills/` — a terminal-native suite of five skills, invoked individually or chained:
   - `ic-deals` — browse the Notion Dealflow pipeline via Notion MCP
   - `ic-brief` — produce the one-page IC brief (JSON + markdown)
   - `ic-turn` — one in-character committee question on demand
   - `ic-score` — post-room rubric, summary, improvement notes
   - `ic-sim` — the orchestrator that runs all four phases end to end via subagents (`.claude/agents/ic-{skeptic,operator,hawk,portfolio}.md`)

**Two-lane briefing — known duplication.** Brief generation has been intentionally re-duplicated for UX reasons. The web app offers `/api/brief` (called by the "generate →" button in `DealsList`) which composes an inline `BRIEF_SYSTEM` prompt, fetches the Notion deal via `lib/notion.ts`, calls the Anthropic SDK directly, and parses the JSON. The skill side offers `/ic-brief` (in `.claude/skills/ic-brief/SKILL.md`) which uses the user's Claude Code session credentials and the Notion MCP server. Both produce the same `Brief` shape from `lib/types.ts`. The `DealsList` row exposes both lanes: "generate →" for the web flow, "copy prompt" for the skill flow. Deal *browsing* is also dual-surface: `/api/deals` server-side via `lib/notion.ts` for visual triage; `ic-deals` skill via Notion MCP for terminal-flow disambiguation. **The duplication tax**: any change to the `Brief` schema must land in three places — `lib/types.ts`, the inline `BRIEF_SYSTEM` in `app/api/brief/route.ts`, and the brief shape in `.claude/skills/ic-brief/SKILL.md`. `parseBrief` in `DealPicker.tsx` is the safety net that catches drift at runtime.

Persona changes must be made in **both places** or the surfaces drift. The web personas live in `lib/committee.ts` (`SHARED_RULES` + per-member `systemPrompt`). The skill personas live in `.claude/agents/ic-{skeptic,operator,hawk,portfolio}.md`. The skill's orchestrator (`SKILL.md`) is the source of truth for the session shape (10 turns, opening-statement framing, sentiment dashboard, scored rubric). The brief schema is now owned by `.claude/skills/ic-brief/SKILL.md` — `lib/types.ts`'s `Brief` type and the web app's `parseBrief` validation in `components/DealPicker.tsx` must stay in sync with it.

### Web-app session flow

`app/page.tsx` renders three sections in order: the hero/header, the "How it works" explainer, and a collapsible `<DealsList />` panel (lazy-fetches `/api/deals` on expand and renders the active pipeline with a "copy id" button per row). Below those sits the primary CTA: `<DealPicker />` accepts a **pasted brief JSON** (produced by `/ic-brief` in the user's Claude Code session, or any JSON matching the `Brief` shape in `lib/types.ts`) → `parseBrief` validates required fields → in-memory `Brief` in `SessionProvider` → `/room` (`CommitteeRoom`) → streaming `/api/turn` per committee turn → `/api/score` → `/report` (`ScoreReport`, with `@react-pdf/renderer` export).

The whole session lives in a `useReducer` inside `lib/session-context.tsx`. There is no persistence: refreshing on `/room` or `/report` checks `brief` and redirects to `/` when null. The PDF export is the only way to save a session.

### The streaming contract

`/api/turn` (`app/api/turn/route.ts`) is the hot path. It:

1. Receives `{ memberId, brief, turns }`.
2. Maps the prior `turns` into Anthropic `messages`, tagging cross-member chatter with `[ArchetypeName]:` prefixes so each member "hears" the others without confusing roles.
3. Streams `content_block_delta` events as a plain text response.
4. The client (`CommitteeRoom.runMember`) accumulates the stream and runs `parseSentiment` (in `lib/turn-router.ts`) on each chunk to keep the visible text clean of the trailing `[sentiment: X]` line.

The sentiment tag is **mandatory** for every committee reply — written by the LLM under `SHARED_RULES` in `lib/committee.ts`, parsed off the last line, and surfaced as a colored dot in `MemberCard`. If a model output omits it, `parseSentiment` silently defaults to `neutral`.

### The turn router

`lib/turn-router.ts` is deterministic — it does not call an LLM. It picks the next member by:

- penalizing repeats (the last member who spoke gets `-10`),
- scoring keyword matches against each member's `domain` (in `lib/committee.ts`),
- adding a novelty bonus for members who haven't spoken yet,
- plus a small random tiebreaker.

If you need to change who jumps in on a given keyword, edit the `domain` arrays — not the router.

### Brief & score JSON contracts

Three places hold a JSON-emitting system prompt: `app/api/brief/route.ts` (the `BRIEF_SYSTEM` constant), `app/api/score/route.ts`, and `.claude/skills/ic-brief/SKILL.md`. All three require the model to return **bare JSON** (no markdown fences, no prose). All three are defended at parse time by a local `extractJson` helper that strips a fenced block if present and otherwise slices from the first `{` to the last `}`. Don't add prose to these prompts or you'll break the `JSON.parse`.

`DealPicker.tsx` carries a sibling `extractJson` helper for parsing the brief JSON the user pastes in — same defensive logic, same reason. The single source of truth for the `Brief` shape is `lib/types.ts`; `REQUIRED_BRIEF_FIELDS` in `DealPicker.tsx` is the runtime contract that catches schema drift between the web brief route and the skill.

### Notion integration

`lib/notion.ts` uses `@notionhq/client` v5 (notionVersion `2025-09-03`) and exposes two functions: `listDeals()` (queries the Dealflow data source, filters out `❌ Pass`, sorts by `Last Edited At` desc, returns `DealListItem[]`) and `fetchDeal(pageId)` (returns the full mapped-properties object for a single page). `listDeals` tries the newer **Data Sources** endpoint first (`dataSources.query`); if the configured ID is actually a database container, it resolves the database to its first data source via `databases.retrieve` and retries. The field-mapping (Company, One-liner, Sector, SSI Score, Kill Criteria, etc.) is the contract shared with `ic-brief`'s skill output — they must stay in sync, or paste-validation will reject server-fetched data. Only `/api/deals` consumes `lib/notion.ts` today; the skill side uses the Notion MCP server independently.

## Model and SDK

- `lib/anthropic.ts` pins `MODEL_ID = "claude-sonnet-4-5"`. The Anthropic client is lazily instantiated and reused per server process.
- SDK: `@anthropic-ai/sdk` v0.88.0. `/api/turn` uses `stream: true`; `/api/score` uses the non-streaming `messages.create`.

## Conventions

- **Path alias**: `@/*` → repo root (`tsconfig.json`). Used everywhere as `@/lib/...`, `@/components/...`.
- **TypeScript**: `strict: true`. All shared types live in `lib/types.ts` — `MemberId`, `Brief`, `Turn`, `Sentiment`, `Rubric`. Adding a new committee member means updating `MemberId`, `lib/committee.ts`, **and** adding a matching `.claude/agents/ic-<id>.md`.
- **React**: 19.2.x with the new `useReducer` patterns. The session context uses `useCallback`-wrapped dispatchers; don't pass raw `dispatch` out of the provider.
- **Styling**: Tailwind v4 via `@tailwindcss/postcss`. Custom utility classes (`hairline`, `mono`, `display`, `text-bone`, `grain`) are defined in `app/globals.css` — search there before inventing new ones.
- **Fonts**: Three Google fonts wired in `app/layout.tsx` (Fraunces / Inter Tight / JetBrains Mono) as CSS variables — `--font-fraunces` etc.

## When editing personas

The four members ship under two names: an `id` and an `archetype`. They must agree across files:

| `MemberId`  | Archetype           | Web file (`lib/committee.ts`) | Skill file                        |
|-------------|---------------------|-------------------------------|-----------------------------------|
| `skeptic`   | The Skeptic         | Pat Herrington                | `.claude/agents/ic-skeptic.md`    |
| `operator`  | The Operator        | Rhea Kowalski                 | `.claude/agents/ic-operator.md`   |
| `hawk`      | The Regulatory Hawk | Samuel Oduya                  | `.claude/agents/ic-hawk.md`       |
| `portfolio` | The Portfolio Lens  | Mira Chen                     | `.claude/agents/ic-portfolio.md`  |

Changing a persona's voice in one place without the other will produce visible drift between the web product and the skill.
