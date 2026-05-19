# IC Simulation — Mindgard (Seed, AI Security)

_Date: 2026-04-12_
_Format: Mock Investment Committee, 5 turns, 4 members + presenting associate_

---

## 1. Deal Brief

**Company:** Mindgard
**Sector:** AI Security — automated red-teaming for LLMs, multimodal models, and agentic systems
**Stage:** Seed
**Geography:** United Kingdom (spin-out of Lancaster University)
**Team size:** ~8 FTE
**Round context (assumed):** ~$5–7M seed at ~$25–30M post, with existing pre-seed from UK deep-tech investors (e.g., Lakestar/IQ Capital-style syndicate). We would lead or co-lead with ~$3M for ~10–12%.
**Primary competitor:** HiddenLayer (US, Series B, ~$50M raised, broader AI-SPM positioning)
**Other competitors:** Robust Intelligence (acquired by Cisco 2024), Protect AI, Lakera, CalypsoAI, open-source Garak, Giskard.
**Commercial traction:**
- 3 FTSE 100 customers in paid/unpaid pilot (1 paid, 2 POCs)
- Paid pilot ARR-equivalent ~£60k (one 12-month contract, financial services)
- 2 unpaid pilots with 60-day conversion windows in Q2/Q3 2026
**Product:** Continuous automated red-team harness — attack library (~300 techniques mapped to MITRE ATLAS + OWASP LLM Top 10), CI/CD integration for model releases, runtime monitoring for deployed agents. SaaS + on-prem option.
**Thesis summary:** AI adoption in regulated enterprises is outpacing the controls around it. The EU AI Act high-risk provisions begin applying in stages through 2026–27, and NIST AI RMF / UK AISI guidance is hardening into procurement requirements. Mindgard sits at a defensible wedge: deep academic provenance in adversarial ML, UK-based (advantage in UK/EU regulated verticals), and an attack-library moat that scales with published research.

---

## 2. Transcript — 5 Committee Turns

### Turn 1 — Skeptic (Market Size & Competition)

**Skeptic:** "HiddenLayer has ~$50M in the bank and brand share in US banks. Robust Intelligence is now Cisco. Protect AI raised $60M Series B. What is the *specific* market Mindgard wins in, quantified, that these incumbents cannot trivially enter? And don't tell me 'the UK' — give me numbers."

**Presenter:** "Fair challenge. I'll be concrete. The addressable wedge for Mindgard in the next 36 months is **regulated EU/UK enterprises deploying generative AI into customer-facing or decisioning workflows** — specifically financial services, insurance, healthcare, and public sector. Sizing that: there are ~1,800 UK/EU enterprises above €500M revenue with active GenAI production workloads per IDC Q4 2025 data (up from 400 in 2024). Assume average AI-security spend of £80–120k/year at steady state (triangulated from Gartner's 2025 AI-TRiSM forecast and what Mindgard is charging today — £60k for one business unit, £200–300k enterprise-wide). That's a **£150–220M SAM in UK/EU by 2028**, growing 60%+ YoY.

Why Mindgard wins a meaningful share rather than zero: (1) **data residency** — HiddenLayer and Protect AI are US-headquartered and most of their infra is US-hosted; EU regulated buyers increasingly require EEA-only processing, and Mindgard runs on-prem plus UK/Dublin. Two of the three FTSE 100 pilots cited this as the *reason they shortlisted*. (2) **Attack library depth on agents, not just LLMs** — HiddenLayer's public positioning is heavy on model-scanning (ML-BOM, supply chain). Mindgard's differentiator is runtime red-teaming of *agents with tools*, which is where 2026 enterprise pain is concentrated. (3) **Channel** — they have a standing MOU with UK AI Safety Institute for benchmark contribution; that's a procurement signal US vendors cannot replicate in 12 months.

I don't think Mindgard becomes the global leader. I think they become the **default EU/UK regulated-sector vendor**, which at 10–15% share of that SAM in 2029 is £20–30M ARR — a fund-returner at our entry price if they're acquired or mark up at Series B."

---

### Turn 2 — Operator (Unit Economics & Execution)

**Operator:** "One paid customer at £60k. Eight people. Walk me through burn, runway at close, and your honest view on the CAC/LTV trajectory. And what's the sales cycle reality — not the pitch deck reality?"

**Presenter:** "Current burn is ~£180k/month — 8 FTE loaded (6 engineers, 1 founder-led sales, 1 ops), plus AWS/compute ~£15k/mo and a fractional CFO. With the £5M raise net of fees, cash-in is ~£4.7M; plan is to grow to 18 FTE over 18 months, taking burn to ~£320k/month by month 12. That gives **~18–20 months runway** to a Series A target of £10M ARR at Q3 2027.

Sales cycle honest view: the FTSE 100 paid deal took **8 months from first meeting to PO** — two security reviews, a procurement round, and a pen-test of Mindgard itself. That is the realistic enterprise cycle. The two unpaid pilots are on month 4 and month 2 respectively; I modeled 50% conversion to paid at £80k ACV average, which is conservative versus the 67% pilot-to-paid rate HiddenLayer disclosed at RSA 2025.

CAC today is ugly because sales is founder-led — effectively £40–50k fully loaded per won logo, but the founders are doing it, so cash CAC is near zero. Once they hire 2 AEs + 1 SE in month 6, blended CAC goes to ~£90–110k per logo on ~£100k ACV. That's a **~1.0x CAC payback year-one on ACV, ~0.45x on gross profit** (assume 75% GM on SaaS, lower on on-prem). Not great, typical for regulated-enterprise seed. LTV at 5-year retention with 110% NRR (assumption, anchored to Snyk/Wiz comps) is ~£550k → **LTV/CAC ~5x by year 3**, which is the bar I'd want before Series A.

Biggest execution risk I'd flag: the founding team is research-heavy (3 of 5 founders are PhDs). They don't have an enterprise sales leader today. That's hire #1 post-close, and I'd want it written into the plan. I'd also want a CRO search firm retained by month 3."

---

### Turn 3 — Regulatory Hawk (Compliance & Regulatory Tailwinds)

**Regulatory Hawk:** "You're leaning on the EU AI Act and NIST as tailwinds. Be specific: which *provisions*, in force *when*, create a procurement-forcing event that Mindgard sells into? And what happens to the thesis if the US federal AI executive order posture softens further or if the AI Act enforcement slips — which, historically, EU tech regulation does."

**Presenter:** "Three concrete forcing functions, in order of certainty:

**(1) EU AI Act Article 15 (accuracy, robustness, cybersecurity) for high-risk systems** — obligations apply from **2 August 2026** for high-risk AI systems, which explicitly includes credit scoring, insurance risk assessment, employment screening, and critical infrastructure. Article 15(5) requires 'appropriate measures against adversarial attacks.' That is, literally, the Mindgard product category. National competent authorities have to be designated by August 2025 (already happening — UK is out of scope but tracking closely; France's CNIL and Germany's BNetzA are moving). Penalty exposure is up to 3% of global turnover.

**(2) DORA (Digital Operational Resilience Act) threat-led penetration testing** — already in force since **17 January 2025** for EU financial entities. TLPT requirements under DORA + ECB TIBER-EU framework are being interpreted by several national regulators to include AI/ML systems where they are critical. Two of the three FTSE 100 pilots are DORA-scoped subsidiaries; this is the immediate wedge.

**(3) UK AI Safety Institute procurement guidance** — less binding but directionally clear. The UK government's AI procurement playbook (updated Dec 2025) now requires vendors of AI systems to public sector to provide red-team evidence. Mindgard is on the AISI supplier panel as of Q1 2026.

On the downside scenario you named: you're right to worry. If the AI Act enforcement slips 12 months (plausible — the Code of Practice for GPAI was already delayed), the 2026 revenue plan takes a **~25–30% haircut** because some pilots slow-walk procurement. That's survivable on the 20-month runway but compresses Series A timing to Q1 2028. If the US softens further — honestly, I think that *helps* Mindgard's EU positioning by sharpening the regulatory divergence; US-only vendors become harder to sell into EU regulated buyers. The real risk isn't regulatory softening, it's **regulatory fragmentation** — each EU member state implementing differently, forcing Mindgard to build 5 compliance SKUs. I'd want to see their product roadmap for a configurable compliance layer before closing."

---

### Turn 4 — Portfolio Lens (Fund Fit & Reserves)

**Portfolio Lens:** "We're a £250M fund, already deployed into two security companies — one cloud posture, one identity. How does Mindgard *not* cannibalize our existing portfolio relationships, and what's the reserve strategy? Give me a check-size and follow-on plan that doesn't wreck our pacing."

**Presenter:** "Cannibalization first: I've checked with both portfolio companies. The cloud posture co (CSPM) has no AI-security roadmap item before 2027 and their CEO explicitly told me they'd prefer a partner over a build. The identity co is orthogonal — agentic identity is adjacent but not overlapping with red-teaming. **Neither is a buyer or builder of Mindgard's category in the next 24 months.** There may actually be a GTM partnership opportunity with the CSPM co for joint RFP responses in financial services, which I've warm-introduced.

Check sizing: recommended initial check **£2.5M at £25M post for ~10%**, co-leading with an existing pre-seed investor who wants to double down. This sits comfortably in our seed bucket — £2–3M initial is our policy band. For reserves, I'd propose **£5M reserved (2x initial)** across Series A and B, which assumes: (a) Series A pro-rata at £10M ARR / £80–100M post ~ £2M to maintain 8–9%; (b) Series B selective top-up of £3M if they're on a credible path to £25M ARR. Total committed exposure £7.5M, or **3% of fund** — within our single-position cap of 5%.

Pacing impact: we've done 4 of a target 10 seeds in Fund III, and our sector balance is currently skewed to dev tools. Security is under-indexed; this fills a gap. The deployment pace stays on schedule.

Return math at the 10% initial / 8% fully-diluted post-reserves: if Mindgard exits at £500M (a reasonable acquisition scenario — HiddenLayer's last round implied ~£400M, and category M&A is active), our £7.5M returns ~£40M gross, **~5.3x MOIC, ~0.16x of fund**. Not a fund-returner alone, but a strong position. The fund-returner case requires them to become the EU category leader and exit at >£1.5B, which I'd put at ~15% probability."

---

### Turn 5 — Skeptic (round 2 — pressure on the thesis seam)

**Skeptic:** "You just told the operator LTV/CAC is 5x by year 3 and told the portfolio lens a £500M exit is a 'reasonable acquisition scenario.' Those two things are in tension — if unit economics only break positive at year 3, who is acquiring this pre-profitability, and at what multiple, and why now rather than waiting for Mindgard to burn its cash? Convince me this isn't a flat round or worse in 18 months."

**Presenter:** "That's the sharpest question of the session and I'll take it head-on. You're right that the tension is real, so let me separate three scenarios rather than defend a single number:

**Scenario A — base case (55% probability):** Mindgard hits £3–4M ARR at month 18, does a £10–15M Series A at ~£60–80M post. Not an exit; a markup. Our £2.5M marks to ~£7–8M on paper. This is the most likely outcome and it doesn't require an acquisition thesis at all.

**Scenario B — acquisition case (20% probability):** A strategic — Cisco (already owns Robust Intelligence but has gaps in EU), CrowdStrike, Palo Alto, or a Big 4 cyber consultancy buying for category entry — acquires at £300–600M between 2027 and 2029. These buyers don't buy on LTV/CAC; they buy on **category position, customer logos, and attack-library IP**. Robust Intelligence sold to Cisco at roughly 20x forward ARR with ~£15M ARR — a comparable outcome for Mindgard implies £300–400M at £15–20M ARR. Why now rather than waiting: because if Mindgard is clearly winning EU regulated-sector logos by 2027, the *option value* of acquiring before a competitor does is what drives strategic premiums.

**Scenario C — downside (25% probability):** pilots don't convert, a flat or down Series A extension, we mark down 30–50%. Loss exposure on initial check is £1.25M; fund-level impact ~0.5%.

Probability-weighted: **expected MOIC ~3.2x** on the initial check, **~2.4x blended with reserves**. The asymmetry I like is that Scenario C's loss is small and Scenario B's upside is category-defining. The thesis doesn't rely on unit economics being beautiful at exit — it relies on Mindgard being the obvious EU answer when a strategic needs one. If I'm wrong about the category-consolidation timing, we mark down, not zero. I'm comfortable recommending the investment with the caveat that the CRO hire and one additional paid FTSE 100 logo before our next board meeting are non-negotiable milestones."

---

## 3. Final Report & Rubric Scoring

### Rubric (1–10)

| Dimension | Score | Rationale |
|---|---|---|
| **Conviction clarity** | 7 | Presenter stated a clear thesis (EU regulated-sector default vendor) and named the probability-weighted outcome. Lost a point for hedging on the fund-returner case and not stating a single recommendation verdict until Turn 5. |
| **Risk acknowledgment** | 8 | Surfaced real risks unprompted: research-heavy team without sales leader, regulatory fragmentation, flat-round downside, CAC payback being poor in year 1. Slightly stronger if downside scenario had been sized in Turn 1 rather than extracted. |
| **Data density** | 8 | Specific numbers throughout: £180k burn, 8-month sales cycle, SAM triangulation with IDC/Gartner, Article 15 effective date, DORA date, Robust Intelligence 20x comp. A few figures are assumption-heavy (110% NRR) but flagged as such. |
| **Thesis alignment** | 7 | Thesis — EU regulated wedge defensible vs US incumbents — is coherent and consistent across turns. Slight drift in Turn 4 where portfolio lens answer emphasized acquisition math that Turn 5 then had to reconcile. |
| **Poise under pressure** | 8 | Turn 5 (the sharpest) was handled well: did not retreat, reframed with three scenarios, named the weakest link (LTV/CAC/acquisition-premium tension) explicitly. Turn 2 also strong — volunteered CAC is "ugly," which builds trust. |

**Weighted average: 7.6 / 10**

### Two-Sentence Summary

Mindgard is a credible seed-stage bet on the EU/UK regulated-sector wedge in AI security, with real early enterprise traction (1 paid FTSE 100, 2 pilots), a defensible academic-IP moat in agentic red-teaming, and hard regulatory tailwinds (EU AI Act Article 15, DORA) creating procurement-forcing events in 2026–27. The presenter made a coherent, numerate case with honest acknowledgment of execution risk (no sales leader) and thesis risk (acquisition-premium vs unit-economics tension), earning a provisional recommendation to proceed with £2.5M initial / £5M reserved, conditional on a CRO hire and a second paid FTSE 100 logo before the next board.

### Three Improvement Notes for the Presenter

1. **Lead with the verdict, not the context.** State "I recommend we lead at £2.5M" in the opening, then let the Q&A pressure-test it. The committee knew where you were heading by Turn 3; saying it in Turn 1 would have sharpened every subsequent answer and forced the committee to argue against a concrete proposition rather than fish for one.

2. **Pre-empt the thesis-seam question.** The tension the Skeptic surfaced in Turn 5 (year-3 unit economics vs near-term acquisition exit) was predictable. Bring the three-scenario probability tree as a pre-built slide rather than constructing it live — it reads stronger, and it signals the thesis has survived internal challenge already.

3. **Source-qualify the soft numbers.** Figures like 110% NRR, 67% pilot-to-paid at HiddenLayer, and the "~1,800 UK/EU enterprises" SAM anchor were cited but not fully sourced in the moment. In a real committee, have the primary source cited inline (IDC report ID, RSA talk title, etc.) or flagged as "my assumption, happy to walk through the triangulation." Assumption-flagging is credibility-positive; silent assumption-as-fact is credibility-negative if caught.

---

_End of session._
