# IC-Sim

A rehearsal tool for VC analysts and principals. Pick a deal, defend it against four AI investment-committee partners — Skeptic, Operator, Regulatory Hawk, Portfolio Lens — under a 12-turn / 18-minute cap, and walk out with a scored rubric and an optional shareable result link.

Built for reps before the real room. The committee has no sympathy by design. If you dodge a question, the same partner re-asks it — naming what you ducked.

**Live:** https://adversarial-ic-sim-astelvidas-projects.vercel.app

## Two surfaces

The product ships as two parallel forms that share the same four personas:

- **Next.js web app** (`app/`, `components/`, `lib/`) — the deployable browser surface. Browses a Notion-backed dealflow, generates a memo-depth brief via `/api/brief` (Anthropic `web_search_20250305` server tool), runs the live "room", and produces the post-room scored report (PDF export + stateless `/r/[token]` share link).
- **Claude Code skills** (`.claude/skills/ic-{sim,brief,deals,turn,score}/`) — the terminal-native surface. Runs entirely inside the user's Claude Code session, no Anthropic API key needed.

Persona definitions must stay in sync across both surfaces — see `CLAUDE.md` § "When editing personas".

## Run it locally

```bash
pnpm install
pnpm dev          # http://localhost:3000  (PORT=4321 pnpm dev to override)
```

Required env (`.env.local`):

- `ANTHROPIC_API_KEY` — for every LLM-driven route: `/api/brief`, `/api/turn`, `/api/score`, `/api/lookup`, `/api/evasion`.
- `NOTION_TOKEN` — for `/api/deals` (the dealflow browser) and `/api/brief` (Notion-sourced brief generation).
- `NOTION_DEALFLOW_DS_ID` — optional override for the hard-coded Dealflow data-source ID.

See `CLAUDE.md` for the full env list and what each variable powers.

## The user flow (web app)

1. **Pick** — Expand the "Browse your pipeline" panel on `/`. The list lazy-fetches the Notion Dealflow database (filtered, sorted by SSI desc). Click "enter the room →" on any deal.
2. **Brief** — `/api/brief` fetches the Notion page, calls Sonnet 4.6 with up to 4 `web_search` calls, returns a memo-depth `Brief` (~20-40s). The room opens with a dense executive card; the full 16-section memo lives in a side drawer one click away.
3. **Defend** — Up to 12 turns or 18 minutes, whichever hits first. After every answer the orchestrator runs a Haiku 4.5 **evasion classifier** (1-5 score); on ≤2 the same partner re-asks with a "you didn't address X — let me re-ask" preamble. Otherwise the next partner is picked by keyword + novelty + tiebreaker. An amber **"Soft end available"** badge appears after 8 turns + 15 min + all 4 voices heard; a **"2 min left"** toast fires at 16 min; the room hard-finalizes at 18 min.
4. **Lookup** — While composing an answer, click "Look up" — `/api/lookup` returns 2-3 cited facts you can insert as blockquotes at the caret. Powered by the same `web_search_20250305` tool, scoped to your draft + the last committee question.
5. **Score** — `/api/score` returns a 5-dimension rubric, a 2-sentence partner-voice summary, and 3 concrete improvement notes.
6. **Share or save** — Download a PDF (with full transcript + sources page), or generate a **stateless `/r/[token]` share link** (base64url-encoded payload, no database — copy-pasteable, fits in a tweet).

Skip the web app and run the whole thing in Claude Code with `/ic-sim` — same personas, same scoring, terminal-only.

## Design docs

The canonical design intent lives in `docs/`:

- **`docs/ic-sim-prd-final.md`** — the full PRD (4 personas, 5-dimension rubric, turn orchestrator, Notion + enrichment architecture, Phase 1/2/3 scope, success metrics).
- **`docs/ic-sim-build-prompt.md`** — the original day-by-day build spec.
- **`docs/ic-sim-design-doc-final.html`** — the visual atlas (wireframes, architecture diagrams, mobile breakpoints) — open in a browser.
- **`docs/ROADMAP.md`** — the living plan: what's shipped, tiered next steps, and the bug / tech-debt register.

## Where to look first

- `CLAUDE.md` — architecture, env vars, the streaming contract, the turn router (sync kickoff + async evasion path), the session-end policy, the share token format, the JSON contracts. Read this before changing anything non-cosmetic.
- `docs/ROADMAP.md` — start here if you're picking up "what's next".
- `lib/committee.ts` — the four personas as the web app sees them (`SHARED_RULES`, per-member `systemPrompt`, keyword `domain` arrays).
- `lib/session-end.ts` — soft / hard cap constants. Import these, don't hard-code 8 / 12 / 15 / 16 / 18.
- `lib/turn-router.ts` — `pickNextMemberSync` (kickoff) + `pickNextMember` (async, with evasion classifier).
- `lib/share-token.ts` — base64url encode/decode for the `/r/[token]` page. Stateless, immutable, no infra.
- `.claude/skills/ic-sim/SKILL.md` — the orchestrator for the skill-side simulation; source of truth for terminal-flow session shape.
- `lib/types.ts` — `Brief`, `Turn`, `Rubric`, `MemberId`, `Sentiment`, `Source`, `LookupResult`, `SharePayload`. The contracts shared by every surface.
