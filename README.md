# IC-Sim

A rehearsal tool for VC analysts and principals. Pick a deal, defend it for ten turns against four AI investment-committee partners — Skeptic, Operator, Regulatory Hawk, Portfolio Lens — and walk out with a scored rubric.

Built for reps before the real room. The committee has no sympathy by design.

## Two surfaces

The product ships as two parallel forms that share the same four personas:

- **Next.js web app** (`app/`, `components/`, `lib/`) — the deployable browser surface. Runs the live "room" and the post-room scored report (with PDF export).
- **Claude Code skills** (`.claude/skills/ic-{sim,brief,deals,turn,score}/`) — the terminal-native surface. Runs entirely inside the user's Claude Code session, no Anthropic API key needed.

Today the skills are also the **upstream producer** of the brief artifact: you generate the brief in Claude Code with `/ic-brief`, then paste its JSON into the web app to start a room. Persona definitions must stay in sync across both surfaces — see `CLAUDE.md` § "When editing personas".

## Run it locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Required env (`.env.local`):

- `ANTHROPIC_API_KEY` — for `/api/turn` (committee streaming) and `/api/score` (post-room rubric).

See `CLAUDE.md` for the full env list and what each variable powers.

## The user flow

1. **Brief** — Run `/ic-brief` in Claude Code on a Notion deal page or pasted text. Optionally run `/ic-deals` first to browse the Dealflow pipeline and pick a target.
2. **Paste** — Drop the brief JSON into the landing page at `http://localhost:3000`.
3. **Defend** — Ten turns. Four AI partners cycle in based on what you say. Each turn streams in real time.
4. **Score** — A 5-dimension rubric, a 2-sentence partner-voice summary, three concrete improvement notes. Export to PDF if you want to keep it.

You can also skip the web app and run the whole thing in Claude Code with `/ic-sim` — same personas, same scoring, terminal-only.

## Where to look first

- `CLAUDE.md` — architecture, env vars, the streaming contract, the turn router, the JSON contracts. Read this before changing anything non-cosmetic.
- `lib/committee.ts` — the four personas as the web app sees them (`SHARED_RULES`, per-member `systemPrompt`, keyword `domain` arrays).
- `.claude/skills/ic-sim/SKILL.md` — the orchestrator for the skill-side simulation; source of truth for session shape (10 turns, opening-statement framing, sentiment dashboard).
- `lib/types.ts` — `Brief`, `Turn`, `Rubric`, `MemberId`, `Sentiment`. The contracts shared by every surface.
