# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`, `pnpm-lock.yaml`).

- `pnpm dev` — Next.js dev server on `http://localhost:3000`
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint (flat config, Next 16's `eslint-config-next`)

There is no test runner configured.

## Required env (`.env.local`)

- `ANTHROPIC_API_KEY` — required for `/api/brief`, `/api/turn`, `/api/score`. Without it, those routes throw at first call (see `lib/anthropic.ts`).
- `NOTION_TOKEN` — required for `/api/deals` and the Notion path of `/api/brief`.
- `NOTION_DEALFLOW_DS_ID` — optional override; defaults to the hard-coded Dealflow data source ID in `lib/notion.ts`.

## Architecture — two surfaces, one product

This repo ships the IC-Sim product in **two parallel forms** that share the same four committee personas:

1. **Next.js web app** (`app/`, `components/`, `lib/`) — the deployable browser product.
2. **Claude Code skill** (`.claude/skills/ic-sim/SKILL.md` + `.claude/agents/ic-*.md`) — a terminal-native variant invoked by `/ic-sim`, orchestrated by the skill and executed by four subagents.

Persona changes must be made in **both places** or the surfaces drift. The web personas live in `lib/committee.ts` (`SHARED_RULES` + per-member `systemPrompt`). The skill personas live in `.claude/agents/ic-{skeptic,operator,hawk,portfolio}.md`. The skill's orchestrator (`SKILL.md`) is the source of truth for the session shape (10 turns, opening-statement framing, sentiment dashboard, scored rubric).

### Web-app session flow

`app/page.tsx` (`DealPicker`) → `/api/brief` → in-memory `Brief` in `SessionProvider` → `/room` (`CommitteeRoom`) → streaming `/api/turn` per committee turn → `/api/score` → `/report` (`ScoreReport`, with `@react-pdf/renderer` export).

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

`/api/brief/route.ts` and `/api/score/route.ts` each hold their own system prompt inline. Both prompts require the model to return **bare JSON** (no markdown fences, no prose), and both routes defend against fences anyway via a local `extractJson` helper that strips a fenced block if present and otherwise slices from the first `{` to the last `}`. Don't add prose to those prompts or you'll break the `JSON.parse`. If a third surface ever needs the same prompt, that's the signal to extract it back into a shared module — until then, keep it inline so the schema and the parser live next to each other.

### Notion integration

`lib/notion.ts` calls the Notion API directly (no SDK). It first tries the newer **Data Sources** endpoint (`/v1/data_sources/{id}/query`), then falls back to the legacy **Databases** endpoint. The Dealflow page fields it maps (Company, One-liner, Sector, SSI Score, Kill Criteria, etc.) are the contract with `BRIEF_SYSTEM` in `lib/prompts.ts` — they must stay in sync, or the brief will silently fill with `"unknown"`.

## Model and SDK

- `lib/anthropic.ts` pins `MODEL_ID = "claude-sonnet-4-5"`. The Anthropic client is lazily instantiated and reused per server process.
- SDK: `@anthropic-ai/sdk` v0.88.0. `/api/turn` uses `stream: true`; `/api/brief` and `/api/score` use the non-streaming `messages.create`.

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
