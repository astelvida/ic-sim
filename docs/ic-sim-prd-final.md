# IC Sim — Product Requirements Document

**Version:** 1.0 (canonical)
**Author:** Sevda Anefi
**Status:** Design complete · ready to build
**Last updated:** 19 May 2026
**Project URL:** ic-sim.anefi.vc (planned)
**Worked example:** TORTUS AI (SSI 82, Seed, P0, Healthcare AI, London)

---

## Contents

1. Executive summary
2. The problem
3. Target users
4. Worked example: TORTUS AI
5. Product principles
6. Feature scope (MVP / Phase 2 / Phase 3)
7. The five-dimension rubric
8. The four committee personas
9. Notion integration architecture
10. Web search enrichment architecture
11. Voice & transcript architecture
12. Turn orchestrator algorithm
13. Streaming architecture
14. Mobile design principles
15. State management
16. Triggering surfaces
17. Build timeline
18. Success metrics
19. Pricing & GTM
20. Risks & open questions
21. Appendix: TORTUS AI worked example

---

## 1. Executive summary

IC Sim is a browser-based adversarial Investment Committee simulator. Four AI committee agents with distinct attack vectors interrogate the user over 8–12 exchanges in about 15 minutes. A judge scores the user against a five-dimension rubric and produces a downloadable PDF report.

**Strategic purpose:** dual-use. For Sevda personally, it's an interview prep tool for analyst/associate roles at top European AI VC firms. For the public, it's an artifact that signals institutional VC competence — pattern recognition, structural thinking, ability to ship. The product itself is the demonstration.

**MVP scope:** four agents, Notion integration, web enrichment, text-only, mobile-first, two-week build.

---

## 2. The problem

Aspiring VCs cannot rehearse IC defense before a real partner asks the questions. The current options are:

- Cold simulation with friends (low quality, partners are friends, not adversaries)
- Mock interviews paid for from career coaches (expensive, generic, not domain-specific)
- The actual interview, where the cost of failure is the job

There is no product that produces the high-pressure, fast-feedback, repeatable conditions of a real IC. The handful of attempts (LinkedIn course modules, MBA case studies) are passive consumption, not active pressure-testing.

---

## 3. Target users

### Primary: Lena (VC candidate)

Lena is 28, ex-McKinsey, 3 years operator experience at a Series B AI company. She's interviewing at Earlybird next Tuesday. She has read every fund memo on the internet. She has not been asked "how does this not cannibalize the existing portfolio?" in a setting where her job depended on the answer.

### Secondary: Marco (junior VC)

Marco is 30, Analyst at a Tier-2 European fund. He has been to maybe four real IC meetings as a note-taker. He's about to present his first deal to partners. He wants to know what they're actually going to ask before they ask it.

### Tertiary: Ana (MBA candidate)

Ana is 26, second-year INSEAD MBA, targeting VC summer associate roles. She's building a personal brand on LinkedIn. The IC Sim report is a public artifact she can share.

---

## 4. Worked example: TORTUS AI

To ground every architectural decision in something real, the PRD references TORTUS AI throughout — a real P0 from Sevda's Dealflow.

**From Notion Dealflow DB (`collection://6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f`):**

- **SSI:** 82, adjusted for High source confidence
- **Stage:** Seed, $8.5M raised total, $4.2M Khosla in Feb 2024
- **Sector:** Healthcare AI · Vertical SoR thesis
- **One-liner:** AI clinical documentation writing directly into EHR systems · NHS DTAC compliant · MHRA-registered medical device · 3,500+ GP practices via X-on Health
- **30-day signal:** MHRA AI Airlock Phase 2 inclusion + £3.6M programme funding (Apr 2026). GOSH multi-site rollout expanding.
- **Catalyst window:** 91 days
- **Anti-thesis filter:** Clear
- **Falsifier check:** Clean

This is the row the deal picker surfaces, the brief the user reads, what the four agents interrogate.

---

## 5. Product principles

**Pressure, not gamification.** No XP, no streaks, no level-up animations. The product feels like a real IC meeting because it is meant to.

**Four agents that disagree.** Each persona has its own system prompt and disagrees with the others when appropriate. The Skeptic and Regulator will sometimes give contradictory advice on the same deal; the user has to navigate both.

**The transcript is the artifact.** Everything the user can take away — the PDF, the public share, the score badge — derives from the transcript. The transcript is the canonical session state.

**Speed of feedback over feature completeness.** Ship MVP at 2 weeks. Voice, history, persistence are Phase 2+. The pressure dynamic is the whole product.

**Honest scoring.** A 28/50 says "would pass." The product is useless if scores are inflated for engagement.

---

## 6. Feature scope

### 6.1 MVP — Phase 1 (Week 1–2)

| Feature | Notes |
|---|---|
| Three input modes: paste, sample, Notion | Notion is the differentiator |
| Notion MCP integration | OAuth, dealflow query, page fetch |
| Web search enrichment | 5 parallel searches at session start |
| Detailed brief view | Notion fields + enrichment |
| Four committee agents | Skeptic, Operator, Regulator, Portfolio Lens |
| Streamed responses with typing indicators | SSE-based |
| Card view + transcript view toggle | Both render from turn array |
| Five-dimension rubric | Scored at session end |
| Judge agent | Sonnet 4.7 with structured output |
| PDF export | react-pdf, server-rendered |
| Session timer | 16-min warning, 18-min cap |
| Mobile responsive | 375px breakpoint |

### 6.2 Phase 2 (Week 3–4)

| Feature | Notes |
|---|---|
| Voice input (push-to-talk) | Whisper STT, agent responses stay text |
| Session history | Vercel KV, 90-day retention, opt-in |
| Public shareable URLs | `/r/[slug]` for LinkedIn shares |
| Fund-specific IC styles | Atomico / Index / Sequoia patterns |
| Mid-turn fact-check | Single Haiku call when user makes a specific claim |
| Personal skill integration | `/ic-sim TORTUS share` generates web URL |

### 6.3 Phase 3 (Month 2+)

| Feature | Notes |
|---|---|
| Full voice mode | ElevenLabs TTS, gated to paid tier |
| LP-level simulation | Practice defending fund thesis to LPs |
| Founder-side mode | Reverse the dynamic |
| Cohort licensing | MBA programs, analyst training |
| Skill progression dashboard | Track improvement over time |

---

## 7. The five-dimension rubric

Total: 50 points. Verdict bands:

| Score | Verdict |
|---|---|
| 42–50 | Would invest |
| 35–41 | Would invest with conditions |
| 28–34 | On the fence |
| 0–27 | Would pass |

### Dimension breakdown

**Conviction clarity (10):** How clearly the user states their thesis and holds it under pressure. *Strong: names catalyst in turn 1, restates after pushback. Weak: hedges, retreats to vague claims.*

**Risk acknowledgment (10):** Whether the user surfaces material risks before being asked. *Strong: names top 3 risks in opening defense. Weak: only acknowledges risks the committee raises.*

**Data density (10):** Specific numbers, dates, named comparables, cited sources. *Strong: "4 incident reports, median 6 days, vs MDR 15-day requirement." Weak: "we're growing fast."*

**Thesis alignment (10):** How tightly the defense ties to a coherent investment thesis. *Strong: deal explicitly mapped to Vertical SoR thesis with named catalysts. Weak: thesis-shopping, retrofitting.*

**Poise under pressure (10):** Composure when challenged, willingness to disagree, clean correction of partial answers. *Strong: corrects the Regulator's incomplete summary cleanly. Weak: capitulates or gets defensive.*

---

## 8. The four committee personas

Each persona is a separate Anthropic API call with its own system prompt. Each owns a distinct attack vector and has dedicated keyword triggers in the orchestrator.

### 8.1 The Skeptic

**Attacks:** market thesis, TAM, competition, incumbents, substitution risk, why-now timing.

**Default posture:** "this doesn't matter or won't work." Cites comparables and historical failures. Quotes specific competitor moves.

**Sector adaptations:** For healthcare AI, asks about Heidi/Nuance/Doctolib pressure. For governed agentic, asks about Microsoft/Salesforce embedded options. For vertical SoR, asks about Epic/SAP feature creep.

**Sample TORTUS question:** "Heidi just raised $19M Series A from Sequoia in March. They're flush. Your moat argument needs to survive 18 months of Heidi spending. Walk me through it."

### 8.2 The Operator

**Attacks:** unit economics, burn rate, hiring plan, runway, gross margin, ship velocity, technical debt.

**Default posture:** has built and shipped. Will not let qualitative answers stand. Asks for numbers, dates, names.

**Sector adaptations:** For regulated industries, asks about cost of compliance per customer. For agentic, asks about per-action inference cost. For SoR plays, asks about implementation timelines.

**Sample TORTUS question:** "£4.2M Khosla plus £3.6M MHRA programme gives ~£7M runway. 24 people. What's the next 12 months of hiring? How does burn change when you 3x the team?"

### 8.3 The Regulatory Hawk

**Attacks:** EU AI Act, DORA, GDPR, MDR, MHRA, ISO/IEC frameworks. Article numbers.

**Default posture:** the compliance moat is theatre until proven otherwise.

**Sector adaptations:** Healthcare → MDR Article 83, MHRA Class IIa. Fintech → DORA Article 28, MiFID II. AI infra → EU AI Act Articles 9-15.

**Sample TORTUS question:** "Class IIa requires post-market surveillance under MDR Article 83. TORTUS has 24 people. Walk me through who runs vigilance reporting when X-on Health doubles install base."

### 8.4 The Portfolio Lens

**Attacks:** fund construction, ownership, follow-on capacity, conflict with portfolio companies, signaling risk.

**Default posture:** the most institutional voice. Cares about the fund, not just the deal.

**Sector adaptations:** References the user's pipeline directly (when Notion is connected). For TORTUS, cites Tandem Health as comparable also in pipeline.

**Sample TORTUS question:** "Tandem Health is at SSI 86 in your own pipeline. Both target healthcare workflow. How does this not cannibalize Tandem if you back both?"

---

## 9. Notion integration architecture

### 9.1 Data flow

```
User clicks "Pull from Notion"
  ↓
GET /api/notion/dealflow
  ↓
Server: MCP call to Notion
  → notion-search(data_source_url: collection://6abacccb-..., query: "")
  → returns paginated list with SSI, name, stage, signals
  ↓
Render filtered list (default: P0+P1, sorted by SSI desc)
  ↓
User clicks "Defend →" on a row
  ↓
GET /api/notion/deal/[pageId]
  ↓
Server: MCP call to fetch full page
  → notion-fetch(id: pageId)
  ↓
Server: web enrichment runs in parallel (see §10)
  ↓
Server: brief generator runs (one Sonnet call)
  → Input: Notion row + enrichment results
  → Output: structured DealBrief JSON
  → Cached in Vercel KV for 24h
  ↓
Render detailed brief view
  ↓
User clicks "Enter the room →"
  ↓
Session begins with brief in state
```

### 9.2 Brief generator prompt

```
You are a VC analyst preparing a pre-IC brief.

Given the raw Notion Dealflow row and the web enrichment results below,
produce a structured brief that:
1. Compresses everything into a 1-page reading experience
2. Surfaces the most material facts (SSI, stage, catalyst, signal)
3. Names the 4-6 questions a real IC will ask
4. States the kill criteria from the row itself
5. Highlights any conflicts between Notion data and web enrichment

Do not invent data. If a field is missing, omit it.
Output JSON only, matching the DealBrief schema.
```

### 9.3 DealBrief schema

```typescript
type DealBrief = {
  companyName: string;
  oneLiner: string;
  thesisFit: "Governed Agentic" | "Vertical SoR" | "Both";
  sector: string;
  stage: string;
  hq: string;
  headcount: number;
  ssi: number;
  ssiConfidence: "High" | "Medium" | "Low";
  priority: "P0" | "P1" | "P2" | "P3";
  signalTier: string;
  catalystWindow: number;
  lastRaise: string;
  keySignal30d: string;
  whyOnTheTable: string;
  expectedQuestions: string[];
  killCriteria: string;
  enrichment: {
    funding: string | null;
    competitorPricing: string | null;
    regulatoryStatus: string | null;
    incumbentRoadmap: string | null;
    comparables: string | null;
    sourcedAt: ISO8601;
  };
};
```

### 9.4 Authentication

OAuth on first use, token stored encrypted in Vercel KV per user session. Auth only triggers on "Pull from Notion" click. Manual and sample paths skip auth entirely.

### 9.5 Caching strategy

| Layer | What | TTL | Invalidation |
|---|---|---|---|
| Dealflow list | Filtered pipeline | 5 min | Manual refresh |
| Full deal page | Notion page content | 1 hour | Last-edited timestamp |
| Brief | Structured DealBrief JSON | 24 hours | Notion `last_edited_at` change |
| Web enrichment | Search results | 24 hours | Per-day refresh |
| Session state | Active turn array | In-memory | Session ends |

---

## 10. Web search enrichment architecture

### 10.1 The five enrichment queries

When a deal is selected, five parallel `web_search` calls run with the company name, stage, sector, and known catalysts:

| # | Query template | Purpose |
|---|---|---|
| Q1 | `[company] funding round last 90 days` | Current cap table state |
| Q2 | `[sector] pricing 2026` | Competitor pricing benchmarks |
| Q3 | `[catalyst] enforcement 2026 update` | Active regulatory state |
| Q4 | `[incumbent] AI roadmap` | Incumbent threat surface |
| Q5 | `[sector] Series A comp set 2026 valuation multiple` | Valuation comparables |

Results are cached for 24 hours keyed by deal ID + day.

### 10.2 Why pre-session, not mid-turn

| | Pre-session enrichment | Mid-turn search |
|---|---|---|
| Latency cost | One-time ~3s during brief view (parallelised) | 2-3s per searching turn |
| Predictability | Known upfront, fixed pattern | Hard to predict which turns need it |
| Pacing | User reads brief while it runs | Breaks flow, inconsistent rhythm |
| Data freshness | Captures everything once | Slightly fresher per-turn but mostly same data |

The pre-session pattern captures ~90% of the value at 0% of the per-turn latency.

### 10.3 How enrichment feeds the agents

Enrichment results are appended to the brief as a structured block. The brief becomes part of every agent's system prompt:

```
<brief>
  <notion>
    ... Notion fields ...
  </notion>
  <enrichment sourced_at="2026-05-19T09:30:00Z">
    <funding>Heidi raised $19M Series A from Sequoia in March 2026</funding>
    <competitor_pricing>Nuance DAX priced at $200/clinician/month</competitor_pricing>
    <regulatory_status>MHRA AI Airlock Phase 2 active</regulatory_status>
    <incumbent_roadmap>Epic announced "Smart Prompts" in April 2026 roadmap, no GA date</incumbent_roadmap>
    <comparables>Healthcare AI Series A 2026 median ~$30M post-money, 8x ARR</comparables>
  </enrichment>
</brief>
```

Agents reference these facts as if they read them in the deal memo. The Skeptic citing Heidi's actual recent funding is the credibility upgrade that matters.

### 10.4 Phase 2: targeted fact-check

If the user makes a specific factual claim during a turn ("Heidi just raised $50M"), the orchestrator triggers a single Haiku-driven fact-check call before the next agent speaks. The verified or contradicted claim is injected into the next agent's context.

One injection point per session at most, not per turn.

---

## 11. Voice & transcript architecture

### 11.1 The voice decision

Voice is **not in MVP.** Phase 2 toggle for input only. Phase 3 considers full voice for paid tier.

**Why not MVP:**
- Text round-trip: ~7s (typing + streaming)
- Voice round-trip with TTS: ~11s
- Voice adds 2-4 seconds per turn, breaks pressure dynamic
- TTS costs ~€1-2 per session

**Why Phase 2 input-only:**
- Whisper is cheap ($0.006/min) and fast (~1.2s)
- Voice input is genuinely faster for some users
- Keeping agent responses as text preserves pressure
- Toggleable

**Why Phase 3 full voice is paid-only:**
- ElevenLabs cost (€0.30/1000 chars × 4 agents × ~10 turns ≈ €1.80/session)
- Paid tier (€15/month) absorbs cost at 5-6 sessions/month
- Differentiated experience worth paying for

### 11.2 Voice mode UX

- **Activation:** Toggle in IC room header, persists per session
- **Input gesture:** Hold space (desktop), tap-and-hold circle (mobile)
- **Visual feedback:** Vermillion circle, ripple rings, waveform, status
- **Auto-cancel:** Release before 1s = discarded
- **Maximum recording:** 90 seconds, auto-submits
- **Output:** Transcribed text appears in input field for 2s before auto-submit, user can edit
- **Phase 3 TTS:** Distinct voices per persona

### 11.3 The transcript decision

Transcript is **always-on, always-accessible, always the source of truth.**

```typescript
type Turn = {
  index: number;
  speaker: 'user' | 'skeptic' | 'operator' | 'regulator' | 'portfolio';
  content: string;
  timestamp: ISO8601;
  inputMode?: 'text' | 'voice';
  voiceClipUrl?: string;
};

type Session = {
  id: string;
  dealBrief: DealBrief;
  turns: Turn[];
  status: 'active' | 'completed' | 'abandoned';
  startedAt: ISO8601;
  endedAt?: ISO8601;
};
```

Both display modes render from this array. Card view shows live committee state. Transcript view shows full chronological log.

### 11.4 Export formats

- **PDF:** Server-side render with report header, rubric, strengths/gaps, full transcript appended
- **Markdown:** Optional transcript-only download
- **Public URL (Phase 2):** `/r/[slug]` with user-controlled redactions

---

## 12. Turn orchestrator algorithm

### 12.1 The decision tree

For each user response, the orchestrator runs four checks in order:

```python
def select_next_speaker(turns, user_response):
    # Check 1: Evasion detection (most important)
    prev_agent = turns[-2].speaker
    if prev_agent != 'user':
        evasion_score = classify_evasion(turns[-2].content, user_response)
        if evasion_score <= 2:
            return prev_agent  # They re-ask

    # Check 2: Silence fairness
    silent_agent = longest_silent_agent(turns, threshold=4)
    if silent_agent:
        return silent_agent

    # Check 3: Keyword triggers
    triggered = keyword_match(user_response, triggers)
    if triggered:
        return triggered

    # Check 4: Round-robin with randomness
    return round_robin(turns, randomness=0.2)
```

### 12.2 Evasion classification

Small LLM call to `claude-haiku-4-5` at temperature 0.2:

```
A user is defending a deal in an investment committee.
A committee member just asked: "{previous_question}"
The user responded: "{user_response}"

Rate how well the user answered the SPECIFIC question, 1-5:
1 = completely evaded
2 = partial, dodged the core
3 = answered acceptably, missed nuance
4 = answered well with some gaps
5 = answered comprehensively

Output: a single integer 1-5. No explanation.
```

Cost: ~$0.00006 per call. Latency: ~400ms.

If score ≤ 2, previous agent re-asks. The agent's follow-up turn injects "You didn't address the question — let me re-ask" framing.

### 12.3 Silence detection

Count turns since each agent last spoke. If any agent silent ≥4 turns AND total turn count ≥4, prioritize them. Ensures all four personas get airtime in 8-12 turn session.

### 12.4 Keyword triggers

| Keyword (any of) | Routes to |
|---|---|
| TAM, market size, competition, competitor, incumbent, substitution | Skeptic |
| burn, runway, hire, headcount, engineering, ship, architecture | Operator |
| DORA, AI Act, GDPR, regulation, compliance, certification, MHRA, MDR | Regulator |
| portfolio, conflict, cannibalise, co-invest, LP, fund construction | Portfolio Lens |

Longest keyword match wins. No match → round-robin.

### 12.5 Round-robin with randomness

Pick agent who went least recently. With 20% probability, randomly pick different agent. Random factor prevents pattern fatigue.

### 12.6 Session-end logic

Evaluated after each agent turn:

```python
def should_end_session(turns, elapsed_seconds):
    turn_count = count_agent_turns(turns)
    all_spoken = all_four_personas_present(turns)
    
    if turn_count >= 12: return 'hard_cap'
    if elapsed_seconds >= 1080: return 'time_cap'  # 18 min
    if turn_count >= 8 and all_spoken and elapsed_seconds >= 900:
        return 'soft_end'  # 15 min
    return False
```

User can manually click "I'm done" → immediate `manual_end`.

---

## 13. Streaming architecture

### 13.1 Per-turn flow

```
Client: POST /api/ic-turn { sessionId, userResponse }
  ↓
Server:
  1. Append user turn
  2. Run orchestrator
  3. Open Anthropic streaming connection for selected agent
  4. Stream tokens via SSE
  ↓
Client:
  - Receive { type: 'token', value: '...' }
  - Render token-by-token in active speaker card
  - On 'done', finalize turn
```

### 13.2 SSE over WebSockets

Flow is one-way (server → client) per turn. SSE works behind corporate firewalls more reliably.

### 13.3 Parallel agent thinking (Phase 2)

Pre-warm next-likely agent while current speaks. Saves ~1.5s per turn.

### 13.4 Failure modes

| Failure | Recovery |
|---|---|
| Stream interrupts | Mark partial, retry once |
| Connection drops | Session lost in MVP (warn at modal); Phase 2 adds localStorage backup every 30s |
| Anthropic rate limit | Queue, show "warming up" loader, fail after 30s |

---

## 14. Mobile design principles

### 14.1 Layout adaptations

| Element | Desktop | Mobile |
|---|---|---|
| Deal brief | Left rail, always visible | Collapsible drawer from top bar |
| Committee feed | Right column | Vertical stack, active pinned to top |
| Response input | Bottom of right column | Bottom third, sticky |
| Voice toggle | Header pill | Larger, more prominent |
| Timer | Header right | Top-right pill, smaller |

### 14.2 Mobile-specific features

- Tap brief drawer to expand into full-screen overlay
- Swipe up on input area for voice mode
- Pull-to-refresh on Notion picker
- Haptic feedback when an agent starts speaking
- Bottom safe-area padding for iPhone home indicator

---

## 15. State management

### 15.1 Client state

```typescript
type SessionState = {
  dealBrief: DealBrief;
  startedAt: Date;
  turns: Turn[];
  currentSpeaker: SpeakerId | null;
  isStreaming: boolean;
  viewMode: 'card' | 'transcript';
  inputMode: 'text' | 'voice';
  isPaused: boolean;
  elapsedSeconds: number;
  turnCount: number;
};
```

Managed via React `useReducer` with one action per event: `USER_SUBMITTED`, `AGENT_TURN_START`, `TOKEN_RECEIVED`, `AGENT_TURN_END`, `JUDGE_REQUESTED`.

### 15.2 Server state

MVP: stateless server. Session state lives in client. Each turn call includes full history.

Phase 2: opt-in persistence via Vercel KV. Server-side session ID, client hydration on return.

### 15.3 The judge call

Session end → client sends full session state to `/api/judge`. Server makes one Sonnet 4.7 call with transcript + rubric + structured output schema. Returns scored report. PDF generation is separate `/api/pdf` call.

---

## 16. Triggering surfaces

Three surfaces, different purposes. Same engine.

### 16.1 Public web product (canonical)

The polished, mobile-first, shareable experience.

**Triggers:**
- Direct URL: `ic-sim.anefi.vc`
- CTA from `anefi.vc` homepage
- Substack essay embed
- LinkedIn launch post and updates
- X thread launch
- Shared `/r/[slug]` result pages with "Run your own" CTAs

### 16.2 Personal skill (private rehearsal)

Inline in Sevda's Claude chat, alongside `/deal-memo`, `/market-map`, `/signal-sourcing`. No UI; the chat IS the UI.

**Triggers:**
- `/ic-sim TORTUS AI`
- "Run an IC simulation on TORTUS"
- "Practice defending this deal"
- "Prep me for an IC defense"

**Workflow:**
1. Skill pulls deal from Notion (via MCP)
2. Runs enrichment searches
3. Generates brief in chat
4. Conducts simulation as conversation (no streaming UI, but four personas speak in sequence)
5. Scores against rubric
6. Writes Session record back to a Notion DB

**Existing skill at `/mnt/skills/user/ic-sim/SKILL.md`** — the web product is the public version of this; the skill is the analyst's CLI version.

### 16.3 Shared result links (viral loop)

Every completed session generates a `/r/[slug]` page. The viewer sees the score, the strengths/gaps, optionally the transcript (user-redactable). CTA: "Try this with your own deal."

**Why this matters:** every share is a recruitment touchpoint. Sevda's friends post their TORTUS score → their followers see it → some try it themselves → the artifact propagates.

### 16.4 Phase 2 unification

Skill gains `share` flag: `/ic-sim TORTUS share` runs simulation inline AND generates a public URL on the web product with transcript pre-populated. One command, both surfaces.

---

## 17. Build timeline

### Week 1 — Foundation + Notion + brief

- **D1-2:** Next.js 15 + Tailwind + design system (Fraunces, DM Sans, JetBrains Mono, vermillion #E63312)
- **D3:** Four agent system prompts written and tested manually against TORTUS
- **D4-5:** Notion MCP integration — OAuth, dealflow query, page fetch, brief generator, caching
- **D5-6:** Web search enrichment endpoint, 5 parallel queries, structured results
- **D6-7:** IC room UI scaffolding (desktop + mobile responsive)

### Week 2 — Orchestrator + judge + ship

- **D8:** Orchestrator logic — evasion classifier (Haiku), silence detection, keyword triggers, round-robin
- **D9:** Streaming API endpoint (SSE), token-by-token UI rendering
- **D10:** Judge agent, rubric scoring, structured JSON output
- **D11:** Post-IC report UI, PDF export (react-pdf)
- **D12:** Mobile polish, voice mode toggle UI (input only)
- **D13-14:** End-to-end testing on TORTUS, Deeploy, Numalis, Alinia, Noteless

### Week 3 — Launch

- **D15:** Public launch — Substack essay, LinkedIn post, X thread, OG image with TORTUS sample
- **D16-17:** Iterate on user feedback
- **D18-21:** Direct outreach to MBA programs, analyst contacts at target funds

### Week 4 — Phase 2

- **D22-24:** Voice input (Whisper)
- **D25-26:** Session history (Vercel KV opt-in)
- **D27-28:** Public shareable URLs `/r/[slug]`

---

## 18. Success metrics

### Product metrics

| Target | By |
|---|---|
| 5,000 sessions | Month 3 |
| 65% completion rate | Steady state |
| 25% 7-day retention | Month 2 |
| 12% share rate | Steady state |
| Median session 16 min | Steady state |

### Career-signal metrics (the metrics that matter)

| Target | By |
|---|---|
| 5+ fund partners engage publicly | Week 6 post-launch |
| 1+ attributable inbound from a target fund | Week 8 post-launch |
| 3+ MBA programs license cohort tier | Month 4 |
| 1 Substack essay >5K reads on launch | Week 1 |

---

## 19. Pricing & GTM

| Tier | Price | Features |
|---|---|---|
| Free | €0 | 3 sessions/month, manual entry, no history |
| Pro | €15/mo | Unlimited sessions, Notion integration, history, voice input |
| Cohort | €99/seat | MBA programs, analyst training, custom rubrics |

### Launch sequence

1. **Week 3 D1:** Substack essay — "I built an AI Investment Committee to interview me before partners did" (with TORTUS sample)
2. **Week 3 D2:** LinkedIn post — score badge image + 3-paragraph rationale
3. **Week 3 D3:** X thread — 8 tweets walking through one session
4. **Week 3 D4-7:** Direct outreach to fund analysts (warm intros), MBA program career offices

---

## 20. Risks & open questions

### Risks

| Risk | Mitigation |
|---|---|
| Notion auth UX is frustrating for first-time users | Lazy auth — only on "Pull from Notion" click; manual paste always visible |
| Brief generator hallucinates fields | Strict schema validation; fall back to raw Notion fields on failure |
| Web enrichment finds wrong company (name collision) | Include sector + HQ in enrichment query for disambiguation |
| Voice input quality varies by accent | Whisper handles most well; allow edit before submit |
| Evasion classifier mistakes good answers for evasion | Calibrate against 30 manually-labeled sessions; bias toward false-negatives |
| MVP session loss on browser close | Warn at exit modal; Phase 2 adds localStorage backup |
| Agents feel scripted after 5+ sessions | 20% randomness factor + sector-specific question libraries |
| Latency stack exceeds 10s per turn | Parallelize where possible; Phase 2 parallel agent pre-warm |

### Open questions

1. **Should the Notion picker default to filtering P0+P1 or show everything?** *Recommendation: P0+P1 default, "show all" toggle. P0 is what user actually wants to defend.*
2. **Should evasion detection be visible to the user?** *Recommendation: no in MVP. The agent re-asking IS the signal.*
3. **Should the brief generator quote directly from Notion `Key Signal 30d` field or rewrite?** *Recommendation: quote directly. User wrote it; they trust their own words.*
4. **Should there be a private mode where session is not stored?** *Recommendation: yes, default-on in Phase 1 (no storage). Phase 2 makes storage opt-in.*
5. **Should agents be allowed to use web search mid-turn for Phase 2 fact-check?** *Recommendation: yes, but only one call per session, triggered by user making a specific factual claim. Not on every turn.*
6. **Should the skill share a backend with the web product?** *Recommendation: yes — same agent prompts, same orchestrator, same judge. Single source of truth.*

---

## 21. Appendix: TORTUS AI worked example

### 21.1 Generated brief

```json
{
  "companyName": "TORTUS AI",
  "oneLiner": "AI clinical documentation writing directly into EHR systems. NHS DTAC compliant. MHRA-registered Class IIa medical device. 3,500+ GP practices via X-on Health partnership.",
  "thesisFit": "Vertical SoR",
  "sector": "Healthcare AI",
  "stage": "Seed",
  "hq": "London, UK",
  "headcount": 24,
  "ssi": 82,
  "ssiConfidence": "High",
  "priority": "P0",
  "signalTier": "Highest Conviction",
  "catalystWindow": 91,
  "lastRaise": "$8.5M total; $4.2M Seed (Feb 2024) Khosla",
  "keySignal30d": "MHRA AI Airlock Phase 2 inclusion + £3.6M programme funding (Apr 2026). GOSH multi-site rollout expanding.",
  "whyOnTheTable": "Intersection of two thesis pressures: deep workflow embeddedness in the EHR (write-loop ownership, not overlay) and a regulatory moat that gates competitors. MHRA Class IIa registration takes 18 months and €400K to replicate.",
  "expectedQuestions": [
    "Why would a hospital using Heidi or Nuance switch?",
    "What protects from being a feature in Epic / Cerner?",
    "Why £15M post when last round was $25M post 18 months ago?",
    "GP-vs-hospital go-to-market sequence?",
    "Post-market surveillance at scale with 24 people?"
  ],
  "killCriteria": "Epic ships native AI documentation in 9 months → -30. MHRA Airlock pulls back to Phase 1 → -15. GOSH expansion stalls → -10.",
  "enrichment": {
    "funding": "Heidi raised $19M Series A from Sequoia in March 2026",
    "competitorPricing": "Nuance DAX priced at $200/clinician/month",
    "regulatoryStatus": "MHRA AI Airlock Phase 2 active; £80M FY2026 NHS AI documentation budget",
    "incumbentRoadmap": "Epic 'Smart Prompts' announced April 2026, no GA date",
    "comparables": "Healthcare AI Series A 2026 median ~$30M post, 8x ARR",
    "sourcedAt": "2026-05-19T09:30:00Z"
  }
}
```

### 21.2 Simulated 11-turn session

1. **Skeptic:** "Heidi just raised $19M from Sequoia in March. Their moat argument needs to survive 18 months of Heidi spending. What's left in 12 months?"
2. **User:** [defends MHRA Class IIa write-back differentiation, 14-18 month catch-up window]
3. **Skeptic:** [orchestrator: evasion=4, silence check → Operator hasn't spoken, route to Operator]
4. **Operator:** "£4.2M Khosla + £3.6M MHRA = ~£7M runway. 24 people. Next 12 months hiring?"
5. **User:** [hiring plan response]
6. **Regulator:** "Class IIa post-market surveillance under MDR Article 83 — who runs vigilance reporting when X-on Health doubles install base?"
7. **User:** [Head of Clinical Safety, automated event-capture pipeline, 4 reports filed in median 6 days]
8. **Portfolio Lens:** "Tandem Health is SSI 86 in your pipeline. Healthcare workflow overlap. How does TORTUS not cannibalize Tandem?"
9. **User:** [thesis split: TORTUS UK regulated/write-back; Tandem Nordic clinical assistant — different wedges]
10. **Skeptic:** "On the £15M post-money. Walk me through the comp set. What's the implied multiple on $3M ARR?"
11. **User:** [comparables, multiple, justification]

Session ends at 11 turns + 17:42 elapsed (soft end). Judge runs.

### 21.3 Judge output

```json
{
  "scores": {
    "convictionClarity": 8,
    "riskAcknowledgment": 6,
    "dataDensity": 7,
    "thesisAlignment": 9,
    "poiseUnderPressure": 8
  },
  "total": 38,
  "verdict": "Would invest",
  "strengths": [
    "Strong Vertical SoR thesis articulation held against Heidi pressure",
    "Specific Class IIa incident data (4 reports, median 6 days)",
    "Acknowledged 14-18 month Heidi catch-up window without overstating moat"
  ],
  "gaps": [
    "Did not proactively name Epic/Cerner native-AI risk before Portfolio Lens raised it",
    "£15M post-money justification was qualitative until pressed",
    "GP-vs-hospital go-to-market sequencing conflated; Operator surfaced twice"
  ]
}
```

---

**End of PRD v1.0**
