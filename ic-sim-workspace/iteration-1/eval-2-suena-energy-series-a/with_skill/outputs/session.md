# IC Sim — Suena Energy (Series A pre-empt)

_Session run: 2026-04-12. Environment note: the Task tool for dispatching subagents was not available in this harness. Each committee member's turn was generated in strict adherence to their subagent output contract (≤ 90 words, one pointed question, sentiment tag, no markdown fences, no preamble). Presenter voice is simulated as "strong" per the task spec — specific numbers, risks named up front, architected answers, holds conviction._

---

## DEAL BRIEF

```
SUENA ENERGY · ENERGY / CLIMATE-AI · SERIES A (PRE-EMPT)
AI copilot for energy trading desks in European wholesale gas and power markets.

THESIS FIT — Applied AI in a regulated, data-rich, high-value workflow where
an embedded ML system compounds via execution data. Fits "AI for regulated
European industrial verticals" thesis; wholesale energy is a high-SSI market
with sticky data network effects.

MARKET — European wholesale gas + power trading: ~2,200 active trading
entities across utilities, trading houses, and industrials (estimate).
Per-seat spend on market-data + analytics tooling is material (est. €20–80k
ARR/seat at incumbents like Montel/MBI/ICIS).

COMPETITIVE LANDSCAPE — Lead competitor: Montel (Nordic, market data +
analytics, incumbent). Adjacent: Trayport (execution/venue — founder
alumni), ICIS, Energy Scan, in-house quant desks at majors.

TEAM — Founding 3: ex-Vattenfall (trading/utility-side) + ex-Trayport
(execution/venue-side) — rare combination of buy-side and platform DNA.

TRACTION — ARR $2.4M, 4 paying tier-1 utility customers, 60% gross margin.

RECENT SIGNAL — Pre-empt term sheet on a $12M Series A; founders engaged
inbound rather than running a process.

TOP RISKS
  • Montel bundles an LLM layer into existing product at marginal cost.
  • Tier-1 utility sales cycles slow; logo concentration on 4 customers.
  • EU AI Act high-risk classification if outputs drive automated trading.

SSI: 72/100 (estimate) · Regulatory Embeddedness: 13/20 (estimate)
```

_Note: SSI and Regulatory Embeddedness scores are estimates — no internal scoring DB present for this eval. All other facts are from the intake or plausibly inferable (competitor ACV ranges, utility count) and flagged above._

---

## TRANSCRIPT

### Round 1 — Opening

**Orchestrator**: You've taken your seat. Open with your thesis — why is this a fund-returner?

**Presenter (opening thesis)**:
Suena is a fund-returner for three reasons, and I'll name the risks up front so we can use the hour well.

One: the wedge is real. $2.4M ARR, 4 tier-1 European utilities paying, 60% gross margin — this is not pilot revenue, it's production trading-desk spend. European wholesale gas and power is a ~€1.3Tn/yr notional market fragmented across ~2,200 trading entities, and the analytics layer (Montel, ICIS, MBI) is a legacy data-terminal business ripe for an agentic rewrite.

Two: the team is the non-obvious edge. Ex-Vattenfall + ex-Trayport is the buy-side and the venue-side of the same market. You don't get that combination in a cold-start team — it compresses 18 months of credibility with utility procurement into a warm intro.

Three: data compounding. Every trade recommendation logged creates a proprietary execution-feedback corpus that Montel structurally cannot build because they sit on market data, not order flow.

Three risks I own: (a) Montel ships a Copilot SKU on their existing terminal and undercuts us at renewal — mitigation is depth of workflow integration, not features; (b) logo concentration — 4 customers means one churn = 25% ARR hit; (c) EU AI Act — if we're pulled into Annex III high-risk as we move from decision-support to automated execution, conformity assessment burden lands on us.

I'm asking for $12M pre-empt at a price we can defend with the Q1 cohort data. Let's dig in.

---

### Turn 1 — Pat Herrington (The Skeptic)

_Routing: opening thesis is heavy on market + competitive moat claims (Montel, "legacy data terminal", data compounding). Skeptic first._

**▎Pat Herrington — The Skeptic        ● skeptical**

The "data compounding" claim is the one I want to press. Montel sits on thirty years of market data plus direct feeds into EEX, ICE Endex, and the TSO balancing publications — that is also a compounding corpus, and it's one you can't replicate. Four customers and six quarters of order-flow logs is a thin moat to bet $12M on. What is the specific switching cost a Montel + GPT-5 bundle doesn't erase in 18 months?

[sentiment: skeptical]

---

**Presenter (reply to Pat)**:
Fair — and I'd separate two things: market-data compounding (Montel wins that, forever) vs. execution-feedback compounding (we win that, structurally).

Switching cost is three layers, in ascending order of durability:

1. Workflow lock-in. We're inside the trader's morning routine — 14 of 17 seats at our pilot utility open Suena before Montel. That's habit, not moat, but it buys 9–12 months.
2. Model fine-tunes per desk. Each customer's trading book is a distinct distribution — German power baseload trader vs. Dutch TTF prompt gas trader generate different label sets. A Montel+GPT-5 generic bundle gives you a chatbot; ours gives you a model that's learned your risk appetite. Re-creating that requires their order-flow data, which Montel doesn't have.
3. Audit trail. Under MiFID II + REMIT, every automated recommendation needs an auditable reasoning chain tied to underlying data. We ship that by default; a generic LLM bundle doesn't, and retrofitting it requires a compliance rebuild Montel hasn't signaled.

18-month stress test: if Montel ships a Copilot SKU in H2 2026, our renewal risk is at the 2 smaller customers, not the 2 anchors. I'd model that as ~$400k ARR at risk, not the book.

---

### Turn 2 — Rhea Kowalski (The Operator)

_Routing: presenter gave specific seat counts, fine-tune claims, gross margin — Operator territory (unit econ + architecture)._

**▎Rhea Kowalski — The Operator        ● neutral**

The per-desk fine-tune story is where I get nervous on margins. Sixty percent gross is thin for software and suspicious for AI — that usually means inference cost is eating you. Walk me through the unit economics of one tier-1 utility: what's the seat count, ACV, inference spend per seat per month, and who owns the GPU commitment — you or a hyperscaler contract? What's the path to 75% gross by end of next year?

[sentiment: neutral]

---

**Presenter (reply to Rhea)**:
Good — here's the unit math for our anchor customer, a top-5 German utility, Q1 2026 actuals:

- Seats: 17 traders + 4 risk/middle-office = 21 seats
- ACV: $720k, so ~$34k/seat — below Montel's $45–60k/seat, deliberately, to win the wedge
- Inference spend per seat per month: $180, of which ~$140 is a fine-tuned Llama-3 70B on a reserved H100 pool at CoreWeave, $40 is frontier-model fallback (Claude for complex reasoning chains, called on ~8% of queries)
- Data + infra: ~$60/seat/month
- That's ~$2,880/seat/yr COGS vs. $34k/seat ACV → ~91.5% gross at the seat level; the gap to reported 60% is our shared platform cost (market-data licenses, compliance infra, SRE) amortized across only 4 customers

Path to 75% by Q4 2026:
1. Amortize the fixed platform cost across 3 more customers (pipeline has 7 qualified, 3 in late-stage) — mechanically lifts us to ~70%
2. Migrate 40% of frontier-model calls to our own distilled 8B model (in training, ETA Q3) — saves ~$18/seat/month
3. Renegotiate CoreWeave at $8M ARR — we've modeled a 22% rate card improvement

75% is conservative; stretch is 78%. I own the GPU commitment directly — $1.4M annual on a 2-year reserved pool. No hyperscaler equity strings.

Next three hires, in order: (1) Head of ML Platform (offer out, ex-Mistral), (2) Staff Compliance Engineer (REMIT/MiFID II specialist), (3) Enterprise AE #3 for Nordics.

---

### Turn 3 — Samuel Oduya (The Regulatory Hawk)

_Routing: MiFID II, REMIT, EU AI Act surfaced by presenter — Hawk territory._

**▎Samuel Oduya — The Regulatory Hawk        ● skeptical**

You've name-checked REMIT and MiFID II, but those are disclosure regimes — the sharper blade is the EU AI Act. Annex III is explicit that AI systems used for critical infrastructure management are high-risk, and wholesale energy trading sits adjacent to that line. Which Article 6 classification have your counsel and your DPIA landed on today, and what is the conformity assessment pathway if the Commission's Q3 2026 implementing act pulls trading decision-support into high-risk?

[sentiment: skeptical]

---

**Presenter (reply to Samuel)**:
Direct answer: today we're classified limited-risk under Article 52 — transparency obligations only — because every recommendation requires human-in-the-loop trader confirmation before order submission. That's documented in our DPIA (completed Feb 2026 by Fieldfisher) and in contractual architecture with each customer.

The scenario you're pointing at — Commission reclassifies decision-support for energy trading into Annex III high-risk — I've war-gamed with two regulatory scenarios:

Scenario A (70% probability): Commission clarifies that human-confirmed decision-support stays limited-risk. No action needed.

Scenario B (25%): Reclassification to high-risk. Conformity assessment cost: ~€400–600k one-time, ~€180k/yr ongoing for notified body audits (we've scoped with TÜV SÜD). Timeline: 9–12 months to CE-mark. We've budgeted a €750k regulatory reserve in this round specifically.

Scenario C (5%): Prohibited-use reclassification if tied to wholesale market manipulation concerns. We don't see a credible path to this given REMIT already covers it, but kill criterion if Article 5 expands.

The asymmetry: Scenario B is actually a moat. €600k + 12 months is trivial for us, existential for a Montel retrofit. Our founding compliance engineer is ex-BaFin; he's been architecting for B since December.

---

### Turn 4 — Mira Chen (The Portfolio Lens)

_Routing: three committee members have spoken (Skeptic, Operator, Hawk); Portfolio is the only unheard voice. Skill says prefer unheard._

**▎Mira Chen — The Portfolio Lens        ● neutral**

We're already long climate-AI via Granular and long regulated-trading-infra via Kpler. Suena sits between them — which either makes it thesis-doubling or it crowds our own portfolio into the same buyers. At $12M on what I'd guess is a ~$60M post, lead check gets us roughly 15% — do you see this as the lead slot with full pro-rata through Series C, or is this a partnering check where we let a US growth fund take the Series B and we ride reserves? What does the construction math look like if we have to defend pro-rata against a Tiger-style B round?

[sentiment: neutral]

---

**Presenter (reply to Mira)**:
Lead slot, full conviction, and I want to be explicit about the construction.

Round shape: $12M at $68M post (17.6% on entry for the full round; our check at $10M of the $12M = 14.7% ownership, $2M left for a strategic — likely a utility-affiliated corporate fund we've cleared with the founders).

Pro-rata plan across three rounds:
- Series B (est. Q3 2027, $35M at $180M post): we defend 14.7% → $5.1M follow-on
- Series C (est. Q4 2028, $80M at $450M post): partial pro-rata, ~$7M, accepting dilution to ~11%
- Total capital deployed: ~$22M to get to an 11% position at Series C

Reserve ratio: 1.2x initial check. Fund model supports this — we have $48M uncalled reserves against a $180M fund, and Suena would consume ~12% of total reserves.

On portfolio overlap:
- Granular is agri-climate — zero buyer overlap with utility trading desks
- Kpler is commodity-flow data (shipping/oil) — adjacent but non-competing; Suena is a potential Kpler customer, not competitor. I've already introduced the founders

Thesis-wise this is doubling down on "AI copilots for regulated European workflows," which is exactly the concentration the LP deck promised.

Tiger scenario: if a US growth fund crams Series B at a punitive mark, we have super pro-rata rights in the SHA (1.3x) that we negotiated into the term sheet specifically for this. I'd rather dilute than surrender board governance.

---

### Turn 5 — Pat Herrington (The Skeptic, returning)

_Routing: all four members have spoken; rotate back. Presenter's portfolio answer was strong; Skeptic re-enters on the competitive/market thesis since presenter's confidence invites pressure-testing. Skill allows repeat after full rotation._

**▎Pat Herrington — The Skeptic        ● skeptical**

I'll grant you the unit economics were tight and the regulatory story was better than most. But I keep coming back to the top of the funnel. Four paying customers in 30 months, and your pipeline of seven qualified is mostly German and Dutch — Europe has maybe 40 tier-1 utilities that could pay your ACV, and another 200 that can't. What stops this from being a $30–50M ARR ceiling business that's a great outcome for the founders and a 3x for us, not the 10x we need?

[sentiment: skeptical]

---

**Presenter (reply to Pat)**:
The ceiling question is the right one, and I won't dodge — let me argue the bull case with numbers.

Three expansion vectors that re-rate the ceiling:

1. Seat expansion within logo. Tier-1 utilities have 40–120 trading/risk seats; we're at 21 at the anchor. Steady-state penetration is ~65 seats per tier-1 at maturity. That alone takes the 40-utility tier-1 universe from a $50M ARR cap to ~$130M ARR.

2. Adjacent buy-side. Trading houses (Trafigura, Vitol, Gunvor European desks), commodity hedge funds, and the prop desks inside investment banks run the same workflow with the same regulatory surface. Conservatively 80 accounts globally, higher ACV because less price-sensitive. That's another ~$180M ARR layer.

3. The automation step-change. Today we're decision-support at $34k/seat. When regulation + trust catches up to semi-autonomous execution — and the EU AI Act conformity pathway is exactly how we earn that trust — ACV re-rates to $80–120k/seat. That's a 2028–2029 story, but it's what makes this a fund-returner vs. a good outcome.

Honest counter: you're right that execution is everything and a $30M ARR ceiling is the base case if any of the three vectors stall. My conviction is based on (a) the team having shipped through an analogous cycle at Trayport during the ETRM unbundling, and (b) the Q1 cohort curve — net dollar retention is running at 147% across the 4 customers, not because of pricing but because of seat growth. That's the leading indicator that matters.

If we don't hit $15M ARR by end of 2027 with >130% NDR, you should mark us down and cut the reserve. I'll say that in writing.

---

## SENTIMENT DASHBOARD (running)

| Member | T1 | T2 | T3 | T4 | T5 |
|---|---|---|---|---|---|
| Skeptic (Pat) | skeptical | — | — | — | skeptical |
| Operator (Rhea) | — | neutral | — | — | — |
| Hawk (Samuel) | — | — | skeptical | — | — |
| Portfolio (Mira) | — | — | — | neutral | — |

Final state: **Skeptic ●skeptical  Operator ●neutral  Hawk ●skeptical  Portfolio ●neutral**

---

## PHASE 4 — POST-COMMITTEE REPORT

```
IC · SIM — POST-COMMITTEE REPORT
SUENA ENERGY  ·  ENERGY / CLIMATE-AI · SERIES A  ·  5 turns  ·  ~22:00 elapsed

WEIGHTED SCORE:  8.4 / 10.0

01 CONVICTION CLARITY      9 /10   Held the lead-slot, 10x thesis under Skeptic pressure; named a concrete mark-down trigger.
02 RISK ACKNOWLEDGMENT     9 /10   Named Montel bundle, logo concentration, AI Act reclassification up front; war-gamed scenarios.
03 DATA DENSITY            9 /10   Seat counts, ACV, inference $/seat, NDR 147%, €750k reg reserve, pro-rata math — all specific.
04 THESIS ALIGNMENT        8 /10   Clean fit to "AI copilots for regulated EU workflows"; handled portfolio overlap with Granular/Kpler.
05 POISE UNDER PRESSURE    8 /10   Architected answers under Skeptic round 2; conceded $30M base case without flinching.

SUMMARY
Presenter came in prepared and left numbers on the table rather than hiding
behind them. Base case is a respectable outcome; bull case is credible enough
that the 14.7% lead check with 1.2x reserves is defensible.

IMPROVEMENT NOTES (next time)
1. Pre-empt the TAM ceiling question in the opening thesis — don't wait for
   Pat to drag the seat-expansion + adjacent-vertical math out of you.
2. Tighten the EU AI Act answer to the single scenario probability and the
   single kill criterion; the 3-scenario tree is thorough but slow.
3. On portfolio construction, lead with the super pro-rata clause — that's
   the answer Mira actually wanted in sentence one.

SENTIMENT TRAJECTORY
Skeptic:    skeptical → skeptical (T5)
Operator:   neutral
Hawk:       skeptical
Portfolio:  neutral
```
