# IC-Sim — Roadmap

Living plan for what's next. Pairs with the three canonical reference docs in this
folder:

- **`ic-sim-prd-final.md`** — the full PRD (rationale for every architectural choice,
  the 5-dimension rubric, the 4 personas, Phase 1/2/3 scope, success metrics).
- **`ic-sim-build-prompt.md`** — the original day-by-day build spec and the file-layout
  contract.
- **`ic-sim-design-doc-final.html`** — the visual atlas (wireframes, architecture
  diagrams, mobile breakpoints). Open in a browser.

When this roadmap and the PRD disagree, the PRD is the design intent; this file is
the *current* sequencing decision. Update this file as items ship.

---

## Status — what's shipped

The web app has cleared most of the PRD's Phase 1 surface plus several Phase 2 items:

| Capability | State | Notes |
|---|---|---|
| 4 committee personas | ✅ | `lib/committee.ts` + `.claude/agents/ic-*.md` |
| Notion dealflow browser | ✅ | `/api/deals`, `components/DealsList.tsx` |
| Memo-depth brief generation | ✅ | `/api/brief` with `web_search_20250305` |
| Streaming room (10-turn) | ✅ | `/api/turn`, SSE-style plain-text stream |
| 5-dimension rubric + judge | ✅ | `/api/score`, `ScoreReport`, `ReportPDF` |
| PDF export | ✅ | `@react-pdf/renderer`, now incl. a Sources page |
| Sentiment dashboard | ✅ | per-member dot + post-room trajectory |
| Brief strip + full-memo drawer | ✅ | `DealBrief.tsx` (one-line strip in-room) |
| Input lookup helper | ✅ | `/api/lookup`, `LookupPanel.tsx` |
| **Evasion classifier + re-ask** | ✅ | `/api/evasion` (Haiku 4.5), PRD §12.2 |
| **Session caps + 16-min warning** | ✅ | `lib/session-end.ts`, PRD §12.6 |
| **Public share `/r/[token]`** | ✅ | stateless base64url, PRD §16.3 |
| **Sample-deal mode** | ✅ | `lib/sample-deal.ts` (TORTUS AI), one-click entry on `/` |
| **Card ↔ transcript toggle** | ✅ | `CommitteeLive` + `TranscriptView`, design-doc §10 |
| **Structured 5-query enrichment** | ✅ | `Brief.enrichment` block, PRD §9.3 |

Not yet built (PRD calls for these): Vercel KV caching, Notion OAuth per user,
sector-aware persona libraries, voice input, session history, fund-specific IC
styles, mid-turn fact-check.

---

## Tier 1 — quick wins (do these first)

Small, low-risk, high-leverage. Each is a single focused session.

### T1.1 · Upgrade to `web_search_20260209` with dynamic filtering
- **Why:** +11% accuracy on web-research turns, −24% input tokens (Anthropic, Feb 2026
  launch). Also lets us drop the `as unknown as never` casts in `/api/brief`,
  `/api/turn`, `/api/lookup`.
- **How:** bump `@anthropic-ai/sdk`, switch the tool `type` to `web_search_20260209`,
  add the code-execution tool as a sibling (dynamic filtering requires it). Re-test
  the brief + a full room.
- **Effort:** ~30–45 min. **Risk:** low — same response shape; `collectSources` still works.
- **Ref:** PRD §10; web research notes in the session log.

### T1.2 · Sample-deal mode (TORTUS AI hardcoded)
- **Status:** ✅ Shipped — `lib/sample-deal.ts` (the TORTUS `Brief`) + `components/SampleDeal.tsx`, surfaced as the first entry point on `/`.
- **Why:** PRD §6.1 lists three input modes — paste, **sample**, Notion. Sample is the
  zero-friction path for first-time visitors and demos; today the only entry is a live
  Notion fetch (60–120s) which is a brutal first impression.
- **How:** hardcode the TORTUS `Brief` (PRD §21.1 has the exact JSON), add a "Try a
  sample deal" button on `/` that `setBrief()`s it and routes straight to `/room`.
- **Effort:** ~1 h. **Risk:** none.

### T1.3 · Sector-aware persona adaptation
- **Why:** PRD §8 — the Skeptic should name Heidi/Nuance for healthcare, Microsoft/
  Salesforce for governed-agentic, Epic/SAP for vertical-SoR. Today the personas are
  sector-blind beyond what the brief text happens to mention.
- **How:** a `Record<sectorKeyword, string[]>` comparable map in `lib/committee.ts`,
  injected into each persona's `systemPrompt(brief)` preamble. Stays inside the cached
  prefix.
- **Effort:** ~1–1.5 h. **Risk:** low.

---

## Tier 2 — infra-gated features

These need Upstash Redis first (Vercel KV was deprecated; Upstash is the Marketplace
replacement, ~1-click provision).

### T2.1 · Upstash Redis — brief cache + share writeback + session backup
- **Why:** `/api/brief` currently has only *in-flight dedupe* — two clicks 90s apart
  still each pay the full 60–120s recompute. PRD §9.5 wants a 24h `brief:{pageId}:
  {last_edited_at}` cache. KV also unlocks mutable share links and cross-tab session
  backup.
- **How:** install Upstash Redis from the Vercel Marketplace; `@upstash/redis`. Replace
  the module-scoped `Map` in `/api/brief` with a real TTL cache; add a writeback in
  `/api/share` so `/r/[token]` rows become editable.
- **Effort:** ~2 h. **Risk:** medium — first external datastore in the project.
- **Ref:** PRD §9.5.

### T2.2 · Notion OAuth per user
- **Why:** today the app uses a single static `NOTION_TOKEN` — only the owner's
  pipeline works. The PRD's whole Pro-tier GTM (§19) needs per-user OAuth so anyone
  can connect their own Dealflow. **Gate for any public launch.**
- **How:** NextAuth + Notion OAuth 2.0; encrypted token per anonymous session in
  Upstash KV (so T2.1 must land first). PRD §9.4.
- **Effort:** ~4–6 h. **Risk:** medium-high — auth surface, token encryption.

### T2.3 · Session history
- **Why:** PRD §6.2 — opt-in 90-day session log so users can track improvement.
- **How:** KV-backed `session:{id}` rows; a `/history` list page. Depends on T2.1.
- **Effort:** ~3 h. **Risk:** low once KV is in.

---

## Tier 3 — depth features (sequence after Tier 1–2)

### T3.1 · Eval harness (Braintrust or minimal in-repo)
- **Why:** there is no test runner and no evals — every prompt change to a persona, the
  evasion classifier, or `BRIEF_SYSTEM` is a vibe-check. An eval set makes regressions
  visible.
- **How:** 5 reference deals (TORTUS + Deeploy/Numalis/Alinia/Noteless per the build
  prompt's test list) × scripted presenter answers → assert rubric stability + evasion
  classifier accuracy. Braintrust has a TS SDK that matches the stack; a minimal
  hand-rolled harness is also viable.
- **Effort:** ~3–4 h. **Risk:** low. **Do before any further prompt-engineering work.**

### T3.2 · Structured 5-query enrichment
- **Status:** ✅ Shipped — `Brief.enrichment` (`Enrichment` in `lib/types.ts`): the five
  named fields are emitted by `BRIEF_SYSTEM`, stamped server-side with `sourcedAt`, fed
  to the committee via `briefContext()`, and rendered in the memo drawer + PDF. Kept the
  single tool-using `/api/brief` call rather than a separate `/api/enrich` route — the
  one-call architecture is more efficient; only the output is now structured.
- **Why:** PRD §10 — five *named* findings (funding, competitor pricing, regulatory
  status, incumbent roadmap, comparables) the agents can cite explicitly.

### T3.3 · Card ↔ transcript view toggle
- **Status:** ✅ Shipped — the room is a single column with a `Live | Transcript` tab
  toggle. `CommitteeLive` renders the active question large above the input;
  `TranscriptView` is the full chronological log. Both render from the `turns` array.
  This also fixed two reported bugs: the active question was buried in a cramped right
  rail, and the deal memo crowded the top of the room.
- **Why:** PRD §11.3 / design-doc §10 — both display modes from the same turn array.

### T3.4 · Voice input (push-to-talk)
- **Why:** PRD §11 Phase 2 — Whisper STT, agent responses stay text. Genuinely faster
  for some users.
- **Effort:** ~4–6 h (`openai` SDK, base64 audio upload, recording UX). **Risk:** medium.

### T3.5 · Per-result OG image
- **Why:** `/r/[token]` shares currently use a static preview. A dynamic per-result OG
  image (company + score badge) lifts social click-through.
- **How:** `next/og` route at `app/r/[token]/og` — no new infra.
- **Effort:** ~1 h. **Risk:** low.

### T3.6 · Fund-specific IC styles
- **Why:** PRD §6.2 — Atomico / Index / Sequoia question patterns as selectable IC
  "modes".
- **Effort:** ~3 h. **Risk:** low.

---

## Bugs & tech debt

| # | Item | Severity | Fix |
|---|------|----------|-----|
| B-1 | Brief schema duplicated across `lib/types.ts` and `BRIEF_SYSTEM` in `/api/brief` — silent drift risk | Med | Add a sync-check (a test asserting the field lists agree), or generate the prompt schema from the TS type. The skill (`.claude/skills/ic-sim/SKILL.md`) emits a prose brief, so it is not part of the JSON-schema contract. |
| B-2 | `as unknown as never` casts on the `web_search` tool — brittle, hides SDK type errors | Med | Resolved by T1.1 (SDK bump — newer `Tool` union lists the server-tool versions). |
| B-3 | `/api/turn` web_search uncapped at scale | — | ✅ Fixed — `max_uses` dropped 3→1; each search added 5-10s of pre-stream latency, so a turn could stall 15-30s on an empty card. 12 turns × 1 = 12 searches/room. |
| B-4 | Soft-end badge can lag one turn — `softEndAvailable` useMemo recomputes on `memberTurns` change, not on a time tick | Low | Drive it off the existing 1s interval, or accept the lag (it's cosmetic). |
| B-5 | `/api/score` deterministic-failure loop — the retry button re-sends the identical prompt; a reproducible malformed-JSON failure loops | Low | Partly mitigated (max_tokens 1400→1800 this iteration). Consider a one-shot "repair" pass that re-prompts with the broken output. |
| B-6 | Mobile layout not yet QA'd at 375px | Low | Largely resolved — the room is now single-column (`CommitteeRoom` + `CommitteeLive` + `TranscriptView`), so it adapts to narrow viewports by default. A dedicated 375px QA pass is still worthwhile. |
| B-7 | No persistence beyond `sessionStorage` — closing the tab loses the session | Low | Resolved by T2.3 (KV session history). PRD §13.4 accepts this for MVP. |
| B-8 | `.claude/worktrees/` build artifacts were polluting lint (~500 errors) | — | ✅ Fixed — `eslint.config.mjs` now ignores `**/.next/**` + `.claude/worktrees/**`. |

---

## Recommended sequence

1. **T1.1** (web_search upgrade) — 30 min, free accuracy + cost win, clears B-2.
2. **T3.1** (eval harness) — *before* any further prompt work, so every change after
   has a regression number.
3. **T1.3** (sector personas) — a big realism lift. (T1.2 sample mode has shipped.)
4. **T2.1** (Upstash Redis) — unlocks the whole Tier 2 line.
5. **T2.2** (Notion OAuth) — the gate for a real public launch.
6. Remaining Tier 3 depth features as bandwidth allows (T3.2 and T3.3 have shipped).
