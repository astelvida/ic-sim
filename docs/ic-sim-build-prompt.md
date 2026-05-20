# IC Sim — Claude Code Build Prompt

Paste this entire document into Claude Code to start the build. Treat each section as a contract: tech stack, file structure, and day-by-day order are non-negotiable. Implementation details inside each day are negotiable.

Companion documents:
- `ic-sim-design-doc-final.html` — visual atlas, wireframes, architecture diagrams
- `ic-sim-prd-final.md` — full PRD with rationale for every architectural choice

---

## What you're building

A browser-based adversarial Investment Committee simulator at `ic-sim.anefi.vc`. User picks a deal (from their Notion Dealflow, paste, or sample). Reads a brief enriched with current web data. Defends the deal against four AI committee agents over 8–12 streamed exchanges. Receives a five-dimension scored report as a downloadable PDF. Two-week MVP. Mobile-first.

Worked example throughout the build: TORTUS AI (SSI 82, Seed, P0, Healthcare AI, London) from the real Notion Dealflow.

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15, App Router | Server Actions for non-streaming, Route Handlers for SSE |
| Language | TypeScript strict mode | No `any` |
| Styling | Tailwind CSS v4 | Design tokens match brand spec below |
| LLM | Anthropic SDK | `claude-sonnet-4-7` for agents + judge + brief generator; `claude-haiku-4-5` for evasion classifier + Phase 2 fact-check |
| Streaming | Server-Sent Events | Native browser EventSource on client |
| Notion | Notion MCP server (`@notionhq/mcp-server-notion`) | OAuth per user; Vercel env for credentials |
| Web search | Anthropic web_search tool (server-side) | Or Tavily MCP as fallback |
| State | React `useReducer` + `useEffect` | No external state lib in MVP |
| PDF | `@react-pdf/renderer` | Server-side render |
| Voice (P2) | OpenAI Whisper via `openai` SDK | Push-to-talk, audio uploaded as base64 |
| Hosting | Vercel | Edge runtime where possible |
| Cache | Vercel KV | Brief cache 24h, web enrichment 24h |
| Auth | NextAuth.js | Phase 2 only; MVP is no-login |

---

## Design tokens

```css
--warm-white: #FAFAF7;
--ink: #1A1A1A;
--muted: #6B6B68;
--hairline: #E5E3DC;
--vermillion: #E63312;
--vermillion-soft: #FCEBE7;
--slate-soft: #F1F2F4;
--amber-soft: #FAEEDA;
--amber-text: #854F0B;
--green-soft: #EAF3DE;
--green-text: #3B6D11;
--info-soft: #E6F1FB;
--info-text: #185FA5;

font-family-serif: "Fraunces", Georgia, serif;
font-family-sans: "DM Sans", -apple-system, sans-serif;
font-family-mono: "JetBrains Mono", monospace;
```

---

## File structure

```
ic-sim/
├─ app/
│  ├─ page.tsx                          # Landing: 3 entry modes
│  ├─ sim/
│  │  ├─ page.tsx                       # IC Room shell
│  │  └─ [sessionId]/page.tsx           # Post-IC report
│  ├─ r/[slug]/page.tsx                 # Phase 2 · public shared result
│  ├─ api/
│  │  ├─ notion/
│  │  │  ├─ dealflow/route.ts           # GET pipeline list
│  │  │  └─ deal/[pageId]/route.ts      # GET full page
│  │  ├─ brief/route.ts                 # POST · generate brief from deal + enrichment
│  │  ├─ enrich/route.ts                # POST · 5 parallel web searches
│  │  ├─ ic-turn/route.ts               # POST · streaming SSE turn
│  │  ├─ judge/route.ts                 # POST · score session
│  │  └─ pdf/route.ts                   # POST · generate PDF
│  └─ layout.tsx
├─ components/
│  ├─ landing/
│  │  ├─ EntryTabs.tsx                  # paste / sample / notion
│  │  ├─ NotionDealPicker.tsx
│  │  └─ ManualEntryForm.tsx
│  ├─ brief/
│  │  ├─ BriefHero.tsx
│  │  ├─ BriefSidebar.tsx
│  │  └─ BriefMain.tsx
│  ├─ ic-room/
│  │  ├─ ICHeader.tsx
│  │  ├─ ICBriefRail.tsx
│  │  ├─ CommitteeFeed.tsx              # card view
│  │  ├─ TranscriptView.tsx
│  │  ├─ MemberCard.tsx
│  │  ├─ ResponseInput.tsx
│  │  ├─ VoiceInput.tsx                 # P2
│  │  ├─ PauseModal.tsx
│  │  └─ TimeoutWarning.tsx
│  └─ report/
│     ├─ ScoreHero.tsx
│     ├─ RubricBars.tsx
│     ├─ FeedbackLists.tsx
│     └─ ReportActions.tsx
├─ lib/
│  ├─ agents/
│  │  ├─ skeptic.ts                     # system prompt + sector adaptations
│  │  ├─ operator.ts
│  │  ├─ regulator.ts
│  │  ├─ portfolio.ts
│  │  └─ judge.ts
│  ├─ orchestrator/
│  │  ├─ selectSpeaker.ts               # 4-check decision tree
│  │  ├─ classifyEvasion.ts             # Haiku call
│  │  ├─ keywordTriggers.ts
│  │  └─ sessionEnd.ts
│  ├─ enrichment/
│  │  └─ runEnrichment.ts               # 5 parallel searches
│  ├─ notion/
│  │  ├─ client.ts                      # MCP wrapper
│  │  └─ briefGenerator.ts
│  ├─ types.ts                          # DealBrief, Turn, Session, etc
│  └─ kv.ts                             # Vercel KV helpers
├─ public/
│  └─ og-tortus.png                     # social share preview
└─ tailwind.config.ts
```

---

## Day-by-day build order

### Day 1 — Scaffolding

- `npx create-next-app@latest ic-sim --typescript --tailwind --app`
- Install: `@anthropic-ai/sdk`, `@react-pdf/renderer`, `@vercel/kv`, `lucide-react`
- Set up design tokens in `tailwind.config.ts`
- Install fonts (Fraunces, DM Sans, JetBrains Mono) via `next/font`
- Build `app/layout.tsx` with brand fonts and warm-white background
- Build landing page shell at `app/page.tsx` with three entry tabs (paste / sample / Notion)
- Create `lib/types.ts` with `DealBrief`, `Turn`, `Session`, `SpeakerId`, `RubricScore`

### Day 2 — Sample deal end-to-end (no Notion yet)

- Hardcode TORTUS sample deal in `lib/sampleDeals/tortus.ts`
- Build manual entry form (`ManualEntryForm.tsx`) with company name, stage, description, ask
- Wire "Load sample" button to push hardcoded TORTUS into session state
- Build brief view shell with mocked content
- Build IC Room shell at `app/sim/page.tsx` with hardcoded mock turns
- Verify the routing and mobile responsiveness BEFORE wiring agents

### Day 3 — Four agent system prompts

- Write `lib/agents/skeptic.ts` with system prompt + sector keyword adapters
- Same for `operator.ts`, `regulator.ts`, `portfolio.ts`
- Each agent exports: `getSystemPrompt({ brief, transcript, sector })` and `keywords: string[]`
- Test each agent in isolation: feed it the TORTUS brief + a fake user response, verify it produces a question in character
- Calibrate temperature and max_tokens per agent
- This day is the most important. The system prompts ARE the product personality. Spend the full day.

### Day 4 — Notion MCP integration

- Install Notion MCP server, configure OAuth flow
- Build `lib/notion/client.ts` with `listDealflow()` and `fetchDeal(pageId)` wrappers
- Build `app/api/notion/dealflow/route.ts` and `app/api/notion/deal/[pageId]/route.ts`
- Build `NotionDealPicker.tsx` rendering the live pipeline list
- Filter UI: thesis × stage × priority × signal tier
- Sort: SSI desc default
- Verify against real Dealflow DB (`collection://6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f`)

### Day 5 — Web enrichment + brief generator

- Build `lib/enrichment/runEnrichment.ts` — 5 parallel `web_search` tool calls via Anthropic SDK
- Cache results in Vercel KV, keyed by `deal:[pageId]:[YYYY-MM-DD]`
- Build `lib/notion/briefGenerator.ts` — one Sonnet 4.6 call that takes Notion row + enrichment → DealBrief JSON
- Strict schema validation; if validation fails, fall back to a structured-from-fields brief without the LLM rewrite
- Cache brief in KV for 24h, keyed by `brief:[pageId]:[last_edited_at]`
- Wire end-to-end: pick deal → fetch → enrich → brief → render brief view

### Day 6 — IC Room UI (desktop)

- `ICHeader.tsx` with timer, session title, exit button
- `ICBriefRail.tsx` showing collapsed brief on left
- `CommitteeFeed.tsx` rendering four `MemberCard.tsx`s with active speaker highlighted, queued members showing placeholder text
- `ResponseInput.tsx` with text area, char counter, submit button
- `TranscriptView.tsx` as alternative display mode
- Tab toggle between card view and transcript view at top
- Use mock turn data; no streaming yet

### Day 7 — IC Room UI (mobile)

- Mobile breakpoint at 768px — committee feed becomes vertical stack
- Brief becomes collapsible drawer accessed from top bar
- Response input becomes sticky bottom
- Test on real iPhone safari + Android chrome (use ngrok or Vercel preview deploy)
- Fix iOS safe-area padding for home indicator

### Day 8 — Orchestrator

- Build `lib/orchestrator/selectSpeaker.ts` implementing the 4-check decision tree
- Build `lib/orchestrator/classifyEvasion.ts` — Haiku call at temp 0.2, prompt from PRD §12.2
- Build `lib/orchestrator/keywordTriggers.ts` with the keyword map
- Build `lib/orchestrator/sessionEnd.ts` with the three end conditions
- Unit-test the orchestrator against synthetic turn arrays — should ALWAYS pick a valid speaker, never pick a speaker not in [skeptic, operator, regulator, portfolio]

### Day 9 — Streaming SSE endpoint

- Build `app/api/ic-turn/route.ts` as a streaming endpoint
- Flow: accept user response + session, run orchestrator, open Anthropic stream for selected agent, pipe tokens via SSE
- Client-side: EventSource consumes the stream, dispatches `TOKEN_RECEIVED` actions to reducer
- Active speaker card updates token-by-token
- Handle stream interruption, connection drops, rate limits
- On `done` event, update session state and mark turn complete

### Day 10 — Judge + report

- Build `lib/agents/judge.ts` with system prompt: takes full transcript + brief + rubric criteria, outputs structured JSON
- Use Anthropic's structured output / JSON mode
- Schema: `{ scores: { convictionClarity, riskAcknowledgment, dataDensity, thesisAlignment, poiseUnderPressure }, total, verdict, strengths: string[], gaps: string[] }`
- Build `app/sim/[sessionId]/page.tsx` rendering the report
- `ScoreHero.tsx`, `RubricBars.tsx`, `FeedbackLists.tsx`, `ReportActions.tsx`

### Day 11 — PDF export

- Build `app/api/pdf/route.ts` using `@react-pdf/renderer`
- Layout: header with score, rubric table, strengths/gaps lists, full transcript appended
- Match the brand spec (Fraunces for headings, DM Sans body, JetBrains Mono for meta)
- Download button on report page triggers POST → blob → trigger browser download

### Day 12 — Mid-session states + voice toggle UI

- Build `PauseModal.tsx` shown on exit click
- Build `TimeoutWarning.tsx` shown at 16:00 elapsed
- Add voice mode toggle in IC header (Phase 2; UI present but disabled with "Coming soon" tooltip in MVP)
- Final mobile polish pass
- Loading states for every async boundary

### Day 13 — End-to-end testing

- Run a full session on TORTUS AI start-to-finish, three times
- Same for Deeploy, Numalis, Alinia, Noteless from the pipeline
- Hand-verify: brief is accurate, agents stay in character, orchestrator routes sensibly, judge scores reasonably
- Calibrate judge prompt against your own judgment of the 5 test sessions
- Fix any visible bugs

### Day 14 — Deploy

- Vercel project setup, env vars (ANTHROPIC_API_KEY, NOTION_OAUTH_*, KV_*)
- Custom domain: `ic-sim.anefi.vc`
- OG image for social shares (use TORTUS sample score as the hero)
- Smoke test on production
- Tweet sample run as confirmation

---

## Critical implementation details

### Notion OAuth

- Use Notion's OAuth 2.0 flow
- Store access token encrypted in Vercel KV per anonymous session ID (UUID in cookie)
- Token never reaches the client
- On token expiry, redirect to re-auth, preserve user's intended action

### SSE streaming pattern

```typescript
// app/api/ic-turn/route.ts (simplified)
export async function POST(req: Request) {
  const { sessionId, userResponse, transcript, brief } = await req.json();
  
  const speakerId = selectNextSpeaker(transcript, userResponse);
  const agent = getAgent(speakerId);
  
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      controller.enqueue(encoder.encode(
        `event: start\ndata: ${JSON.stringify({ speaker: speakerId })}\n\n`
      ));
      
      const response = await anthropic.messages.stream({
        model: 'claude-sonnet-4-7',
        max_tokens: 600,
        system: agent.getSystemPrompt({ brief, transcript }),
        messages: buildMessages(transcript, userResponse),
      });
      
      for await (const event of response) {
        if (event.type === 'content_block_delta') {
          controller.enqueue(encoder.encode(
            `event: token\ndata: ${JSON.stringify({ value: event.delta.text })}\n\n`
          ));
        }
      }
      
      controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

### Orchestrator decision tree

```typescript
async function selectNextSpeaker(turns: Turn[], userResponse: string): Promise<SpeakerId> {
  const lastAgentTurn = turns.filter(t => t.speaker !== 'user').pop();
  
  // Check 1: Evasion
  if (lastAgentTurn) {
    const evasionScore = await classifyEvasion(lastAgentTurn.content, userResponse);
    if (evasionScore <= 2) return lastAgentTurn.speaker;
  }
  
  // Check 2: Silence
  const silentAgent = findLongestSilent(turns, threshold: 4);
  if (silentAgent && turns.length >= 4) return silentAgent;
  
  // Check 3: Keywords
  const triggered = matchKeywords(userResponse);
  if (triggered) return triggered;
  
  // Check 4: Round-robin + 20% randomness
  return roundRobinWithRandomness(turns, 0.2);
}
```

### Agent system prompt template

Each persona's `getSystemPrompt` returns something like:

```
You are {persona name}, a partner at a European VC fund.
Your role in this Investment Committee is to attack {attack vector}.

You have just received this deal brief:
{full DealBrief, including web enrichment}

Conversation so far:
{transcript}

The user just said:
{userResponse}

Your response rules:
1. Ask a single sharp question that exposes the weakest point in their answer
2. Reference specific facts from the brief (especially the enrichment block)
3. Maximum 80 words
4. Do not introduce yourself; you have already been speaking
5. Do not be polite; you are interrogating, not chatting
6. If they evaded the last question, name it explicitly: "You didn't address X — let me re-ask."

Respond as {persona name}. Begin.
```

### Vercel KV schema

```
brief:{pageId}:{last_edited_at}     → DealBrief JSON · TTL 24h
enrich:{pageId}:{YYYY-MM-DD}        → enrichment JSON · TTL 24h
session:{sessionId}                  → Phase 2 only · session state · TTL 90d
notion_token:{cookieSessionId}      → encrypted Notion OAuth token · TTL 30d
```

---

## Out of scope for MVP

Do NOT build:

- Voice input or output (Phase 2)
- Session history or persistence beyond the browser tab (Phase 2)
- Public shareable result URLs (Phase 2)
- User accounts or login (Phase 2)
- Payment / subscription gating (Phase 2)
- Personal skill integration with web product (Phase 2)
- Moderator interventions during turns (Phase 2)
- Mid-turn fact-check calls (Phase 2)
- Parallel agent pre-warming (Phase 2)
- Fund-specific IC styles (Phase 2)
- LP-side simulation (Phase 3)
- Founder-side simulation (Phase 3)
- ElevenLabs TTS (Phase 3)
- Cohort licensing infrastructure (Phase 3)

If a task feels Phase 2, defer it. Two-week MVP is the constraint.

---

## Definition of done

The MVP is shippable when:

1. ✅ Three entry modes work: paste, sample (loads TORTUS), Notion (live pipeline read)
2. ✅ Notion OAuth flow completes, dealflow list renders, deal selection produces a brief
3. ✅ Brief view shows Notion fields + 5 enrichment results, in under 6s total
4. ✅ IC Room shows committee with active speaker highlighted, streaming tokens visible
5. ✅ Orchestrator selects valid speakers, handles evasion, ensures all four personas speak
6. ✅ Card view and transcript view both render from the same turn array
7. ✅ Session ends correctly at 12 turns OR 18 minutes OR user click
8. ✅ Judge produces structured score, report renders with correct verdict band
9. ✅ PDF export downloads with full transcript + score + feedback
10. ✅ Mobile experience works on 375px-wide iPhone 14 and 360px Android
11. ✅ End-to-end run-through on TORTUS, Deeploy, Numalis, Alinia, Noteless without crashes
12. ✅ Deployed at `ic-sim.anefi.vc` with valid SSL

Latency targets:
- Brief generation (incl. enrichment): <6s
- First token of agent response: <2.5s
- Full agent response: <8s
- Judge + PDF: <12s end-to-end

---

## Start command for Claude Code

```
I want to build IC Sim, an adversarial Investment Committee simulator at ic-sim.anefi.vc.

I have three documents:
- ic-sim-design-doc-final.html (wireframes and architecture)
- ic-sim-prd-final.md (full PRD with rationale)
- ic-sim-build-prompt.md (this file, step-by-step build instructions)

Start at Day 1 of the build prompt. Scaffold the Next.js project, set up the design tokens, build the landing page shell with three entry tabs. Stop when Day 1 is complete and show me what you've built. Then I'll tell you to proceed to Day 2.

Do not skip ahead. Do not build out-of-scope features. Do not add libraries beyond what's specified.

Worked example throughout: TORTUS AI (SSI 82, Seed, Healthcare AI, London) — real deal from my Notion Dealflow at collection://6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f.
```

---

## Notes for the build

The four agent system prompts (Day 3) are the most important hour of work in the entire MVP. They are the product personality. Treat them like writing tasks, not engineering tasks. Pull from your existing skills (`fund-tracker`, `regulatory-monitor`, `signal-sourcing`) for sector-specific question patterns the agents should reference.

The orchestrator (Day 8) is the second most important. If it picks badly, the simulation feels random. If it picks well, it feels real. Calibrate against transcripts of real ICs you've sat in or read.

Everything else is execution.

---

**End of build prompt v1.0**
