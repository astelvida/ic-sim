# IC Simulation — Suena Energy (Series A Pre-empt)

## Brief

- **Company:** Suena Energy
- **Round:** Series A pre-empt, $12M
- **Product:** Energy trading AI for European gas/power wholesale markets
- **Team:** 3 founders — ex-Vattenfall (trading desk), ex-Trayport (market infrastructure), plus a third technical/commercial co-founder
- **Traction:** ARR $2.4M, 4 paying tier-1 utility customers, 60% gross margin
- **Competitive landscape:** Montel (incumbent data/analytics provider) is the lead competitor; adjacent players include Enverus, Genscape/Wood Mackenzie, and in-house desks
- **Presenter profile (simulated):** Strong — leads with specifics, surfaces risks up front, answers in numbers
- **Committee:** Skeptic (market/competition), Operator (unit economics/execution), Regulatory Hawk (compliance), Portfolio Lens (fund fit)

---

## Transcript (5 turns)

### Presenter opening (pre-Q&A)

"Thanks. Three things up front before you dig in. One: we are $2.4M ARR across 4 tier-1 utility customers — RWE, Uniper, and two we cannot name under NDA — closed in the last 11 months, ACVs between $400K and $900K, 60% blended gross margin with a path to 72% once we migrate off a third-party curve vendor in Q3. Two: the risks I'd flag before you ask — (a) Montel has distribution we do not, (b) REMIT II and the EU AI Act both touch what we do, (c) trading-desk sales cycles are 5–7 months and we have concentration risk with our top customer at 38% of ARR. Three: the pre-empt is $12M at a $58M pre, led by our existing seed lead with a new strategic — we're not shopping. Happy to go deep on any of it."

---

### Turn 1 — Skeptic (market/competition)

**Skeptic:** "Montel has 20+ years of relationships, a data moat, and sells into the exact same desks. Why does a utility rip out Montel for a 3-person startup, and what is the honest displacement rate in your 4 wins?"

**Presenter:** "We don't rip out Montel — we sit next to it. Montel is a data and news terminal; we are an execution-layer model that ingests Montel feeds plus ENTSO-E, JAO, and client-internal nomination data, then outputs hedging signals and intraday quote recommendations. In our 4 wins, 3 kept Montel and added us; 1 consolidated away from a competing analytics vendor (not Montel). Measured lift in the two deployments past the 90-day mark: 11 bps and 17 bps on intraday P&L versus the control book, audited by the customer's middle office. The honest version of the threat is not Montel today — it's Montel acquiring or building a similar model layer in 24–36 months. Our defensibility is the proprietary training set we've accumulated from those 4 desks: roughly 2.1 billion labeled intraday ticks with desk-action outcomes, which is not replicable from public feeds."

---

### Turn 2 — Operator (unit economics/execution)

**Operator:** "Walk me through CAC, payback, and net revenue retention. And with a 3-person founding team at $2.4M ARR, who is actually delivering implementations — and does that break at 10 customers?"

**Presenter:** "Blended CAC to date is $180K fully loaded, payback 9 months on first-year ACV, expected to compress to 6 months as we standardize the onboarding. NRR is not meaningful yet — only one customer has hit renewal, and they expanded from $420K to $710K, so gross retention 100%, net 169% on an n of 1. I won't defend that number until we have four renewals. On delivery: today my co-founder (ex-Trayport) runs every implementation with one contractor. That breaks at customer 7, not 10. The $12M plan hires a Head of Deployment in month 2, two solutions engineers by month 5, and productizes the connector layer — we've mapped the 14 data source integrations and 9 of them are now config-driven rather than bespoke. If we miss the productization milestone, the business becomes a services firm, and I'd rather you know that is the single biggest execution risk."

---

### Turn 3 — Regulatory Hawk (compliance)

**Regulatory Hawk:** "You're giving trading recommendations to regulated utilities in EU power and gas. REMIT II, MAR, and the EU AI Act all potentially apply. Who holds the liability when your model mis-signals, and have you been audited by any customer's compliance function?"

**Presenter:** "Three pieces. First, contractually we are a decision-support tool, not an RIA-equivalent — every signal is human-in-the-loop, the trader clicks to act, and our MSA explicitly disclaims trading liability. That has been reviewed by RWE's and Uniper's legal and compliance teams; both signed. Second, REMIT II — we are not a PPAT and do not execute, but we do ingest inside-information-adjacent data from customers, so we run a Chinese wall per tenant, SOC 2 Type II completed January, and we've filed the internal-market-monitoring notification template with two customers' compliance. Third, EU AI Act: our system is currently classified as limited-risk by customer counsel because it's advisory, not autonomous; if ESMA or a customer reclassifies us as high-risk, we have a 14-month compliance runway estimate, budgeted at roughly $600K, which is in the use-of-funds. The honest gap: we have not yet been audited by a regulator directly, only by customer second-line functions. That audit will come and we're staffing a Head of Compliance in month 4."

---

### Turn 4 — Portfolio Lens (fund fit)

**Portfolio Lens:** "Our thesis is vertical AI with enterprise data moats and a path to $100M ARR in 5–6 years. Two concerns: European-only TAM, and whether this is really a $1B+ outcome versus a $150–250M strategic exit to someone like Montel, ICE, or Trayport. Make the case for outcome size."

**Presenter:** "European wholesale gas and power is a $1.2T notional market; the analytics and execution-support software wedge I'd defend is roughly $2.8B of software spend today, growing with renewables volatility. Our 5-year plan is $65M ARR from Europe alone at ~15% of tier-1 and tier-2 utilities plus large industrials and trading houses — that's 140 logos at a blended $460K ACV. The $100M ARR path requires either (a) North American ISOs, which we've scoped but are not funding in this round, or (b) expansion into adjacent asset classes — carbon, LNG, ancillary services — where the same model architecture applies and where two of our current customers have already asked for carbon. On exit size: you're right that the floor is a strategic acquisition in the $200–400M range; that's the downside case, not the base. The $1B+ case requires us to become the execution layer, not just signals — and that is a product decision in year 3 that I won't pretend is de-risked today. For fund fit: we match your vertical-AI thesis, we don't match if you need a US-first story in year 1."

---

### Turn 5 — Skeptic (follow-up, market/competition)

**Skeptic:** "38% customer concentration and one renewal is a thin empirical base. What happens to the round and the plan if that top customer churns or negotiates down at renewal in the next 9 months?"

**Presenter:** "Top customer is RWE, contract is 24 months with 14 months remaining, so churn inside 9 months requires a termination-for-cause event — possible but not a renewal-cycle risk in that window. Renegotiation-down at their mid-term true-up is the realistic risk; our mitigation is that we're now deployed across three of their desks (gas LDZ, German power intraday, and as of last month French power) and the expansion itself creates switching cost. If they cut us 30% at true-up, ARR drops to ~$2.1M and the $12M plan's 18-month runway becomes 16 months — still past the next fundraise milestone of $8M ARR. If they terminate, runway is 14 months and we'd need a bridge; I'd tell you that directly rather than pretend the plan survives unchanged. The concentration resolves structurally only by closing customers 5 and 6, both of which are in late-stage procurement — Fortum at $550K expected close May, and a Benelux TSO-adjacent trader at ~$700K expected July. If either slips past September, that is the signal to worry."

---

## Scored Report

| Dimension | Score (1–10) | Rationale |
|---|---|---|
| Conviction clarity | 9 | Every answer leads with a number or a structural claim, then qualifies it. Thesis is articulated without hedging language; downside cases are stated in the same register as upside. |
| Risk acknowledgment | 9 | Surfaced three material risks unprompted in the opening (Montel distribution, REMIT II/AI Act, 38% concentration). Voluntarily named the productization-miss scenario, the n=1 NRR caveat, and the "becomes a services firm" failure mode. |
| Data density | 9 | Specific ACVs, CAC ($180K), payback (9 months), gross margin bridge (60→72%), bps lift (11 and 17), training set size (2.1B ticks), TAM ($2.8B wedge), concentration math (38%, runway 18→16→14 months). Only soft spot: NRR credibly flagged as n=1. |
| Thesis alignment | 7 | Vertical AI with enterprise data moat — strong fit. But European-only near-term and the $1B+ outcome case depends on a year-3 product bet (signals → execution layer) that the presenter honestly admits is not de-risked. Fund-fit answer is candid rather than tailored. |
| Poise under pressure | 9 | Handled follow-up concentration question by giving the exact mechanics (RWE, 14 months remaining, true-up math, named pipeline covers, explicit "signal to worry" date). No defensiveness, no retreat into narrative. Flagged what they won't defend (NRR) as clearly as what they will. |

**Overall: 43/50**

### Summary (2 sentences)

A high-signal presentation: the founder led with specific numbers, pre-empted three of the committee's four likely objections, and handled follow-ups with the exact operational detail (customer names, bps lift, runway math, pipeline close dates) that makes diligence efficient rather than adversarial. The case breaks cleanly into a strong near-term European vertical-AI story and a genuinely uncertain $1B+ outcome bet that depends on a year-3 platform expansion the founder refused to oversell.

### Improvement notes (3)

1. **Strengthen the NRR story before the next IC.** One renewal at 169% net is a great anecdote but a weak data point; commit to showing 3–4 renewal cohorts at the next meeting and pre-register the expansion metric you'll be measured on (logos expanded, seats expanded, or desk count) so the committee doesn't choose the worst-looking framing for you.
2. **Tighten the $1B+ outcome narrative.** The honest "signals-to-execution-layer" pivot is credible but currently lands as a hope rather than a plan. Bring a one-page product/regulatory sequencing map for year 3 — what has to be true in capability, compliance, and customer permission — so the fund-fit answer has a spine rather than a qualifier.
3. **Pre-build the concentration-mitigation dashboard.** Fortum (May) and the Benelux trader (July) are load-bearing; don't let the committee discover slippage in a future update. Offer a monthly pipeline-and-RWE-health note between now and close, with the specific triggers ("if Fortum slips past September…") that you already articulated verbally — make the commitment structural, not conversational.
