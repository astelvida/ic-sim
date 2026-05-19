# IC Sim — Mindgard (AI Security / Red-Teaming · Seed)

_Session date: 2026-04-12 · 5 turns · ~18:00 elapsed_

---

## A. Deal Brief

```
MINDGARD · AI SECURITY (RED-TEAMING) · SEED
Automated red-teaming platform for LLMs and AI agents — continuous
adversarial testing, jailbreak detection, and runtime guardrail
validation for enterprise AI deployments.

THESIS FIT — AI-native security tooling is a durable seam as enterprises
operationalize LLMs under EU AI Act / NIST AI RMF pressure. UK academic
spinout (Lancaster University) [estimated provenance] gives technical-moat
signal consistent with our deep-tech thesis.

MARKET — LLM security / red-teaming TAM ~$2-4B by 2028 [estimated,
extrapolated from Gartner AI TRiSM forecasts]; near-term SAM ~$400M in
EU+UK regulated enterprise [estimated].

COMPETITIVE LANDSCAPE — HiddenLayer (US lead, Series A $50M [public]),
Robust Intelligence (acq. by Cisco 2024), Protect AI, Lakera, CalypsoAI.
Open-source baseline: Garak, Microsoft PyRIT.

TEAM — Founder/CEO Peter Garraghan (Prof., Lancaster — distributed
systems + ML security research). ~8 FTE [confirmed].

TRACTION — 3 FTSE 100 customers in pilot, 1 paid [confirmed]. ARR
~£150-250k [estimated from 1 paid FTSE pilot].

RECENT SIGNAL — NCSC / UK AISI tailwinds; EU AI Act Art. 15 cybersecurity
obligations enter force Aug 2026.

TOP RISKS
- HiddenLayer 5-10x capitalized; can out-hire and out-market.
- Red-teaming risks being absorbed into MLOps/cloud vendor suites.
- Open-source Garak / PyRIT commoditize core technique.

SSI: 68/100 [estimated] · Regulatory Embeddedness: 14/20 [estimated]
```

Transparency note: numbers tagged `[estimated]` are inferred by the presenter (a reasonably-prepared associate) rather than given in-deck. Confirmed facts: 8 FTE, UK, 3 FTSE 100 pilots with 1 paid, HiddenLayer as lead competitor, seed stage.

---

## B. Full Transcript

### Round 1 — Opening

**Moderator:** You've taken your seat. Open with your thesis — why is this a fund-returner?

**Presenter (Associate):**
Thesis: Mindgard becomes the compliance-grade red-teaming layer every EU+UK regulated enterprise is forced to buy between now and 2027, when AI Act Article 15 cyber obligations bite. Three reasons it's a fund-returner. (1) Founder is a category expert — Peter Garraghan runs the Lancaster AI security lab, which is rare provenance in a field where most competitors are re-skinned pentest shops. (2) We're catching them pre-GTM scale with 3 FTSE 100 pilots and 1 paid — that's an estimated £150-250k ARR off 8 FTE, which is disciplined burn. (3) HiddenLayer is the US category leader but structurally cannot win UK/EU regulated procurement the way a UK-academic-spinout can. Our bet: £1.5M at £12M post for ~11% ownership, with reserves earmarked to double down at Series A if £ARR clears £1.5M by month 18. Downside: this becomes a Cisco/Microsoft bundled feature. Upside: they're the Wiz of AI security in Europe.

---

### Turn 1 — ic-skeptic (Pat Herrington)

Routing rationale: opening statement is heavy on TAM, competitor positioning, and moat framing.

> **Pat Herrington — The Skeptic** ● skeptical
>
> Two things jar. "HiddenLayer structurally cannot win UK/EU procurement" is a claim, not a moat — Cisco owns Robust Intelligence and sells into every UK bank already, and HiddenLayer will hire a London GM the week they notice you. And the Lancaster provenance is lovely, but Garak is MIT-licensed and maintained by NVIDIA engineers. Where exactly does the willingness-to-pay come from once a CISO's own AppSec team can run Garak in a CI pipeline for free?
>
> `[sentiment: skeptical]`

**Presenter (Associate):**
Fair pressure. Willingness-to-pay sits in three places Garak doesn't touch. First, continuous regression — Garak is a one-shot CLI; Mindgard runs scheduled attack suites against staging and prod with diff-ing, SLA-backed reporting, and evidence artefacts a Big 4 auditor will accept under AI Act Art. 15. That's the paid FTSE customer's stated reason for buying — they priced the internal alternative at ~£400k/yr in headcount. Second, attack library breadth — Mindgard claims ~200 attack classes versus Garak's ~40, including agent-specific (tool-poisoning, indirect prompt injection across MCP). Third, on Cisco/HiddenLayer UK GTM: I agree a London GM lands in 12 months; the bet is Mindgard signs 8-10 FTSE 100 logos first on the back of NCSC / UK AISI warm intros that a US vendor can't replicate quickly. If they don't hit that by month 18 it's a kill criterion, not a pivot.

---

### Turn 2 — ic-operator (Rhea Kowalski)

Routing rationale: presenter invoked burn discipline, FTSE customer internal-build cost, attack-library architecture, hiring (London GM) — operator territory.

> **Rhea Kowalski — The Operator** ● neutral
>
> The "£400k internal alternative" number is exactly the kind of framing CISOs say in discovery and walk back at renewal — I've lived it. Eight FTE at seed with three live pilots means whoever is running customer success is also shipping product; that breaks by month nine. Who are the next three hires and what's the split between the £1.5M raise across R&D, GTM, and runway?
>
> `[sentiment: neutral]`

**Presenter (Associate):**
Agreed on the renewal-risk framing — the £400k is their stated displacement, I'd underwrite 40-50% of that landing as real renewal willingness, so ~£180-200k per FTSE logo at steady state. On headcount: next three hires are (1) a Forward-Deployed Security Engineer to own the three pilots end-to-end — their JD is open, £110k base; (2) a Founding AE with regulated-enterprise experience, someone from a Snyk or Darktrace background, £120k base + OTE; (3) a second ML security researcher to keep the attack-library lead over Garak — £130k. Split of the £1.5M: ~£950k payroll over 18 months (roughly 11 FTE blended £85k loaded), £250k cloud + attack infra, £150k GTM (events, SOC 2 audit, a design partner roadshow), £150k buffer. That's 18-month runway to a Series A on metrics, not time. Honest gap: we don't yet have a VP Eng, and Peter is still committing 40% of code — I'd want that off the critical path by month six.

---

### Turn 3 — ic-hawk (Samuel Oduya)

Routing rationale: presenter leaned on AI Act Art. 15 audit evidence and SOC 2. Hawk has not spoken and this is his turf.

> **Samuel Oduya — The Regulatory Hawk** ● skeptical
>
> You're pinning enterprise willingness-to-pay on AI Act Article 15, but Article 15 applies to providers of high-risk AI systems — Mindgard's FTSE buyers are deployers, and most of their LLM use-cases fall under limited-risk transparency obligations, not high-risk conformity assessment. SOC 2 is a control framework, not an AI Act artefact. Which specific Annex III use-case categories are your three FTSE pilots actually deploying, and what conformity-assessment path are they walking that makes Mindgard's output a required artefact rather than a nice-to-have?
>
> `[sentiment: skeptical]`

**Presenter (Associate):**
That's the sharpest question so far and I'll answer it honestly with the gap marked. Of the three FTSE pilots: one is a UK retail bank deploying an LLM copilot for retail-banking customer service — that touches Annex III point 5(b) creditworthiness-adjacent flows, so plausibly high-risk and conformity-assessment relevant. The second is an insurer doing claims triage — also Annex III 5(c) risk-assessment for life/health insurance, high-risk. The third is an FMCG company doing internal knowledge-management — limited-risk at best; that's the weakest regulatory anchor and likely won't renew on compliance grounds alone. So the honest read: ~2 of 3 are in the high-risk perimeter where Art. 15 robustness + cybersecurity becomes a required control, and Mindgard's red-team reports serve as evidence toward the conformity assessment — but they are not themselves a notified-body-accepted artefact. The bet is that Big 4 and notified bodies adopt red-team reports as de-facto evidence by 2027, similar to how SOC 2 reports became de-facto for enterprise SaaS. If that adoption lags 18-24 months, ARR compresses and this is a 3x, not a 10x. I flag that as the single biggest regulatory-timing risk.

---

### Turn 4 — ic-portfolio (Mira Chen)

Routing rationale: four members should speak; Mira is the only one who hasn't. Also the presenter introduced check size and reserve strategy in the opening, which is her remit.

> **Mira Chen — The Portfolio Lens** ● neutral
>
> We already own a position in Lakera at seed extension, which puts us on the cap table of a direct competitor in the same red-teaming wedge — that's a conflict, not just an overlap, and it will surface the first time either board discusses M&A or a strategic round. Either we pass on Mindgard, or we have a conversation with Lakera's board before we sign. What's your proposed conflict protocol, and are you pricing in the reputational cost if Lakera reads this as our hedge?
>
> `[sentiment: skeptical]`

**Presenter (Associate):**
I didn't know we were in Lakera — that's a material gap in my prep and I own it. Two paths I'd put to the partnership. Path A, cleaner: we pass on Mindgard as a lead, but offer to be a £250k participant in a syndicate led by Seedcamp or LocalGlobe, with explicit disclosure to Lakera's board and an information wall on our side — no board seat, no pro-rata rights beyond this round. Lakera is Swiss, EU-focused on guardrails more than red-teaming; the overlap is real but not head-on, and the write-up frames Mindgard as UK-regulated-enterprise specialist, which is a wedge Lakera has explicitly deprioritized in their last board deck [I'd need to confirm]. Path B: hard pass, and we introduce Mindgard to two or three co-investors to preserve the relationship for a later round. My recommendation is Path A contingent on Lakera's CEO giving verbal no-objection; if that's not obtainable in 10 days, we default to Path B. I should not have brought this to IC without flagging the overlap; that's on me.

---

### Turn 5 — ic-skeptic (Pat Herrington)

Routing rationale: presenter conceded a material prep gap and shifted the deal shape (lead → participant). The Skeptic opened the session and should close the loop on whether the thesis still holds under the new construction.

> **Pat Herrington — The Skeptic** ● neutral
>
> Credit for owning the Lakera miss cleanly — most presenters fold or bluster there, you did neither. But a £250k participation check doesn't return this fund even at a 20x — the ownership math requires leading, and you just argued we can't lead. So what's the actual IC ask now: are you pitching a £250k relationship check we book as a tracker, or are you still pitching this as a conviction position, and if the latter, how do you square that with the conflict you just described?
>
> `[sentiment: neutral]`

**Presenter (Associate):**
Honest reframe: the IC ask is a £250k tracker participation, not a conviction lead, and I should have landed there in the opening rather than arriving via Mira's challenge. Rationale for still doing it at £250k: (a) optionality — at seed pricing, a £250k check buys us a front-row view into whether the UK-regulated-enterprise wedge is real, and if it is, we have right-of-first-look at the Series A where we can lead with a £4-6M check at £40-60M post, which is where the fund-return math actually lives; (b) ecosystem — backing Peter Garraghan wins us credibility with the UK AI-security research community, which is a sourcing moat for the next five AI-security deals; (c) Lakera conflict is manageable at £250k non-board with disclosure, unmanageable at lead. If the room isn't comfortable with a tracker, my fallback is a warm intro to Seedcamp and we revisit at Series A with no capital committed now. I'd still rank this in the top quartile of seed opportunities I've seen this quarter, but I'm no longer asking for a lead mandate today.

---

## C. Sentiment Dashboard

| Member | T1 | T2 | T3 | T4 | T5 |
|---|---|---|---|---|---|
| Skeptic (Pat) | skeptical | — | — | — | neutral |
| Operator (Rhea) | — | neutral | — | — | — |
| Hawk (Samuel) | — | — | skeptical | — | — |
| Portfolio (Mira) | — | — | — | skeptical | — |

---

## D. Post-Committee Report

```
IC · SIM — POST-COMMITTEE REPORT
MINDGARD  ·  AI SECURITY / RED-TEAMING · SEED  ·  5 turns  ·  ~18:00 elapsed

WEIGHTED SCORE:  7.4 / 10.0

01 CONVICTION CLARITY      7 /10   Held the thesis, but re-shaped the ask mid-room; should have landed on tracker at open.
02 RISK ACKNOWLEDGMENT     9 /10   Named kill criteria, flagged Lakera miss unprompted, marked regulatory-timing downside.
03 DATA DENSITY            8 /10   Specific hires, £ splits, Annex III refs, £400k displacement — concrete, mostly plausible.
04 THESIS ALIGNMENT        6 /10   Fund-return math stops working once deal resizes to £250k tracker; alignment is softer than claimed.
05 POISE UNDER PRESSURE    8 /10   Owned the Lakera gap cleanly; did not bluster under Hawk's Annex III challenge.

SUMMARY
Strong technical and regulatory fluency, genuinely honest about gaps — this is the
associate you want defending a borderline deal. But the IC ask changed shape
under live fire, and a tracker check at seed is not what this committee is
convened to approve; come back with the real ask pre-wired.

IMPROVEMENT NOTES (next time)
1. Run the portfolio-conflict check before the brief leaves your desk — Lakera
   should have been the first slide, not a surprise in Turn 4.
2. State the IC ask (lead / co-lead / tracker / pass-with-relationship) in
   sentence one of the opening; don't let the committee back you into it.
3. When citing regulation (AI Act Art. 15), name the Annex III use-case class
   per customer in the brief itself — Samuel's challenge was foreseeable.

SENTIMENT TRAJECTORY
Skeptic:    skeptical → — → — → — → neutral
Operator:   — → neutral → — → — → —
Hawk:       — → — → skeptical → — → —
Portfolio:  — → — → — → skeptical → —

Net arc: opened skeptical, softened to neutral by session close —
presenter earned credibility through candor, lost ownership mandate
through a prep gap.
```
