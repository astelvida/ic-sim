# IC Simulation: Alinia — AI Compliance Platform

## Brief

- **Company:** Alinia
- **Product:** AI compliance platform for EU AI Act Article 6 high-risk systems
- **Stage:** Pre-seed
- **Round:** €2M
- **Founder:** Ex-McKinsey digital
- **ICP (initial):** BaFin-regulated tier-2 German banks
- **Traction:** No paid customers; 2 LOIs
- **Presenter posture:** Moderately prepared; fuzzy on unit economics

## Committee

- **S — Skeptic (Market & Competition)**
- **O — Operator (Unit Economics & Execution)**
- **R — Regulatory Hawk (Compliance Depth)**
- **P — Portfolio Lens (Fund Fit)**

---

## Transcript (5 Turns)

### Turn 1 — Skeptic (Market & Competition)

**S:** "Article 6 high-risk lists are already being chased by Holistic AI, Credo AI, Saidot, Trail, plus the Big Four advisory practices wrapping their own tooling. What is your wedge, and why does a tier-2 German bank pick a pre-seed startup over PwC's AI Act offering that their board already knows?"

**Presenter:** "Great question. The incumbents you mentioned are mostly horizontal — they try to cover hiring, credit scoring, medical devices, everything. We're going deep on banking-specific control mappings: internal rating systems, AML/transaction monitoring, creditworthiness models under Annex III. Our wedge is that we ship pre-built evidence packs mapped to MaRisk AT 4.3 and BAIT, which is what BaFin examiners actually ask for. PwC can do it but charges €400k+ per engagement and it's human-led; we're software. We think we win on speed-to-audit-readiness and price point."

---

### Turn 2 — Operator (Unit Economics & Execution)

**O:** "Talk me through ACV, gross margin, sales cycle, and CAC payback. Pre-seed, I don't need precision, but I need to know you've modeled it. And who's closing these tier-2 banks — you, or a VP Sales you haven't hired yet?"

**Presenter:** "So ACV we're targeting €60–120k for tier-2 banks, maybe stretching to €200k for a tier-1 pilot down the line. Gross margin should be in the 75–80% range once we're past the early white-glove phase — right now honestly it's lower because we're doing a lot of config work ourselves. Sales cycle… I've seen 6–9 months in my McKinsey work for comparable RegTech, so I'm modeling nine. CAC payback, um, I don't have a tight number yet — we're assuming 18 months but that's more directional than bottom-up. It's me closing right now, plus one commercial advisor part-time. VP Sales is a post-seed hire."

---

### Turn 3 — Regulatory Hawk (Compliance Depth)

**R:** "The AI Act's high-risk obligations for Annex III systems phase in August 2026. Banks' existing model risk frameworks — SR 11-7 equivalents, ECB TRIM, MaRisk — already cover most of what Article 9, 10, 15 require. Why does a bank buy a *new* tool instead of extending their existing model governance stack from SAS, Yields.io, or their in-house MRM platform? And specifically: are you producing the Article 11 technical documentation, or just mapping to it?"

**Presenter:** "Yeah, this is the sharpest question. The honest answer is that existing MRM platforms cover model validation well but they don't cover Article 10 data governance evidence, Article 14 human oversight logs, or Article 13 transparency documentation in a structured way — those are new obligations. We generate the Article 11 technical file as an output, not just a mapping; it's a live artifact that updates as the model changes. Where I'll admit uncertainty: the line between 'extend MRM' and 'buy new' is genuinely contested at the banks I've talked to. Two of the five CROs I spoke with said they'd extend; three said they'd buy. Our LOIs are from the latter camp."

---

### Turn 4 — Portfolio Lens (Fund Fit)

**P:** "Our thesis is European B2B infrastructure with defensible data moats and €10M+ ARR potential within five years. Walk me through your path to €10M ARR. And candidly — does this become a services business dressed as SaaS? I've seen three RegTech pre-seeds in the last year that all ended up as €150k-ACV consulting shops with a dashboard."

**Presenter:** "Fair concern. Path to €10M: if we land 80-120 tier-2 European banks at blended €100k ACV, that's €8–12M ARR. There are roughly 300 tier-2 banks in DACH plus another 500 across France, Italy, Benelux, Nordics within our target profile. On the services question — I hear you. Today we're probably 40% services revenue equivalent if you value the config work. Our answer is productizing the control library: every engagement feeds back templates, so bank number 20 should be 80% self-serve configuration. I won't pretend we're there yet. The data moat is the accumulated control-to-evidence mappings — nobody else will have 50 banks' worth of normalized Annex III implementations."

---

### Turn 5 — Skeptic (follow-up, Market & Competition)

**S:** "You said tier-2 German banks first. BaFin is notoriously slow on procurement and these banks typically won't sign a net-new vendor without a three-month InfoSec review plus a pilot. Two LOIs, zero paid — what's your conversion timeline, and what happens to the round if neither LOI converts in the next 9 months?"

**Presenter:** "Both LOIs are targeting paid pilots in Q3 — one is in IT security review now, the other is waiting on board approval in June. Realistic conversion: I'd say 60% one converts, 35% both, 5% neither. If neither converts by month nine, that's a real signal — we'd need to either pivot ICP to tier-2 insurers (same regulator logic, faster procurement from what I hear) or move to an earlier-stage buyer like neobanks who have less procurement friction. I'm budgeting the €2M to give us 18 months of runway, which means we can absorb a two-quarter slip but not a full ICP pivot without a bridge."

---

## Scored Report

| Dimension | Score (1–10) | Rationale |
|---|---|---|
| Conviction clarity | 7 | Clear wedge articulation (banking-vertical, BAIT/MaRisk-specific). Loses a point for hedging on MRM-extension vs buy-new, though honesty is credited elsewhere. |
| Risk acknowledgment | 8 | Openly flagged the services-dressed-as-SaaS risk, the 3-of-5 CRO split, and the pivot plan if LOIs slip. Did not duck the sharpest questions. |
| Data density | 5 | Good qualitative grounding (5 CRO conversations, MaRisk citations, Annex III specifics) but thin on bottoms-up numbers — CAC payback was directional, gross margin "should be," services % was a hand-wave. |
| Thesis alignment | 7 | European B2B infra, regulatory moat, plausible €10M ARR path. Weak spot: data-moat story is asserted, not yet proven; fund would want to pressure-test defensibility. |
| Poise under pressure | 8 | Did not get rattled by the regulatory hawk or the "services shop" framing. Admitted uncertainty without collapsing. Stumbled mildly on CAC payback. |

**Overall: 35/50**

### Summary (2 sentences)

Alinia presents a credible vertical wedge into a real regulatory tailwind, with a founder who handles hard questions with composure and candor rather than bravado. The investment case is gated on two unresolved risks — whether existing MRM stacks absorb the Article 11 workload and whether the company can productize out of its services-heavy early posture — both of which should be diligence priorities before a yes.

### Improvement Notes

1. **Tighten unit economics before the next meeting.** Bring a bottoms-up CAC model (channel-by-channel, with assumed win rates and sales cycle length) and a gross-margin bridge showing the path from current (admitted-lower) to target 75–80%. "Directional" is acceptable at pre-seed only if the structure of the model is crisp; currently the structure itself is fuzzy.
2. **Quantify the productization glide path.** The "bank 20 is 80% self-serve" claim is the single most important commercial assumption in the deck and it was asserted, not demonstrated. Show the control-library coverage curve: how many Annex III control templates exist today, how many are needed for full self-serve, and what the marginal cost per new control is.
3. **Pre-empt the MRM-extension objection with primary evidence.** The 3-of-5 CRO split is the crux. Convert this into a short written appendix — anonymized CRO quotes, a decision-tree of when banks extend vs buy, and a concrete delta matrix showing exactly which Article 10/13/14 obligations existing MRM platforms do not cover. This turns the weakest part of the pitch into a defensible moat narrative.
