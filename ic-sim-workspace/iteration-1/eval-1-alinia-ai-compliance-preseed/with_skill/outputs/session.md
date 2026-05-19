# IC · SIM — Alinia

**Session date:** 2026-04-12
**Mode:** Self-contained smoke test. The orchestrator played the presenter; committee members were simulated in-line against their output contracts (Task-tool dispatch unavailable in this harness). Flagged transparently.
**Turns:** 5 committee turns

---

## Deal Brief

```
ALINIA · AI GOVERNANCE / REGTECH · PRE-SEED
AI compliance platform for EU AI Act Article 6 high-risk systems, landing in BaFin-regulated tier-2 German banks.

THESIS FIT — Regulated AI deployments in EU financial services are a forced-buy category as the AI Act compliance deadlines bite; Alinia sits at the intersection of the fund's RegTech and applied-AI theses.
MARKET — TAM unknown (inferred: EU AI Act high-risk enterprise governance, a low-single-digit €B segment by 2028). SAM: BaFin-supervised tier-2 DE banks (~50–80 institutions).
COMPETITIVE LANDSCAPE — Credo AI, Holistic AI, Fairly AI, Monitaur; incumbents: OneTrust, ServiceNow GRC, SAS Viya Governance.
TEAM — Solo-founder or small team led by ex-McKinsey digital partner; technical co-founder unknown.
TRACTION — 2 LOIs with tier-2 DE banks; 0 paid customers; 0 ARR.
RECENT SIGNAL — Raising €2M pre-seed on the back of LOI momentum and AI Act Article 6 compliance deadline (Aug 2026).
TOP RISKS
  - Article 6 classification scope may narrow; LOIs soft; no paid conversion.
  - Ex-consulting founder unproven as operator; technical depth unknown.
  - Horizontal GRC incumbents (OneTrust, ServiceNow) can bolt on.

SSI: unknown / Regulatory Embeddedness: unknown (inferred high — core thesis)
```

**Inferred vs. given:** TAM/SAM sizing, ARR, competitor list, incumbent threat set, and regulatory deadline are inferred from context — not supplied in the one-pager. SSI score unavailable.

---

## Transcript

### Round 1 — Opening

**▎Moderator:** You've taken your seat. Open with your thesis — why is this a fund-returner?

**▎Presenter (me):**
We think Alinia is a fund-returner because the EU AI Act creates a non-discretionary compliance spend in a sector — EU tier-2 banks — that cannot self-build. Article 6 high-risk classification forces conformity assessments, risk management systems, and post-market monitoring by August 2026, and BaFin has already signaled it will enforce alongside MaRisk. Every tier-2 bank we've spoken to is currently "figuring it out in a spreadsheet." That's the opening.

Our wedge is narrow and sharp: we're the AI Act conformity workflow for credit-decisioning and AML models, starting with BaFin. Two LOIs in 8 weeks validates pull. The founder ran bank transformation at McKinsey for six years — she knows the buying center. If we win 15–20 of the ~60 tier-2 DE banks at roughly €120–180K ACV, then expand to tier-1s and cross-EU, we get to €20M+ ARR in 36 months and the regulatory wedge locks in a defensible GRC category. That's the fund-returner shape.

---

### Turn 1 — Skeptic (market / moat)

**▎Pat Herrington — The Skeptic ● skeptical**

Credo AI, Holistic AI and Monitaur have been pitching the same AI Act conformity story to European banks for two years, and OneTrust has 1,000+ enterprise logos with an existing procurement channel into every BaFin bank on your list. Your "spreadsheet" framing is the pitch every AI governance startup has used since 2023 and the honest answer is most tier-2 banks will bolt this onto whatever GRC suite they already pay for. Why does a tier-2 Sparkasse or Landesbank buy a German-specific point tool instead of a module from the vendor already holding their policy, vendor-risk, and model-risk workflow?
[sentiment: skeptical]

**▎Presenter:**
Fair push, and I'll concede the incumbents are the real threat, not the other governance startups. But the bet is narrower: BaFin's AI Act guidance cross-references MaRisk AT 4.3.4 and BAIT in a way the horizontal suites don't encode. OneTrust's AI module today is essentially a questionnaire wrapper — it doesn't produce the technical documentation package (Annex IV), conformity artefacts, or post-market monitoring telemetry you need for a high-risk credit scoring model. The tier-2 banks we're talking to are the ones who don't have a 40-person model risk team; they need something opinionated, in German, mapped to BaFin's language, that ingests their model registry and spits out the Article 11 technical file.

Switching cost comes from being wired into the model lifecycle — not from the policy layer. Once we're the system-of-record for conformity artefacts across 40 models, ripping us out means redoing the technical file. That's the moat I'd underwrite. Incumbents catch up in 18 months at the policy layer; the question is whether we're embedded in model ops by then. I'll admit — I don't have a clean answer on how we win the tier-1s where internal teams can build this. Tier-2 is the durable wedge.

---

### Turn 2 — Hawk (regulatory specificity)

**▎Samuel Oduya — The Regulatory Hawk ● neutral**

Article 6 is a two-limb test — Annex I product safety and Annex III use cases — and for banks you're mostly relying on Annex III point 5(b) creditworthiness and Article 6(3) exception carve-outs that the Commission's February 2025 guidelines materially softened. If BaFin takes the narrow read, a tier-2 bank's internal credit scoring model may not be high-risk at all, which collapses your conformity-artefact wedge into an optional governance purchase. What's your scenario plan if the 6(3) exception gets applied broadly by BaFin, and can you name the specific conformity assessment pathway — internal control per Article 43(2) versus notified body — you expect your first customer to go down?
[sentiment: neutral]

**▎Presenter:**
Honest answer: the 6(3) preparatory-task exception is exactly the risk, and I'd be lying if I said we had a hedged product story for the narrow read. Our base case is that BaFin, because MaRisk already treats credit scoring as a material model, will not lean on 6(3) to exempt — they'll treat the Article 6 obligations as additive to existing model risk governance rather than a carve-out. That's a bet, and I want to be transparent it's a bet.

On the assessment pathway: for Annex III systems the default is internal control under Article 43(2), not notified body — that's actually helpful to us because it means the conformity file is self-attested, which is where our technical-file automation has the highest ROI. A tier-2 bank's compliance officer signs it; we make that signable. If BaFin demands third-party conformity assessment for specific use cases down the line, we'd partner with a notified body rather than become one — I don't think that's our business to build.

Scenario tree if 6(3) guts high-risk classification: the product pivots to a "voluntary best-practice" framing tied to supervisory review under SREP and MaRisk model-risk expectations, which are not going away. Smaller TAM, weaker pricing power, but not a zero. I won't pretend that's the same business.

---

### Turn 3 — Operator (unit economics — the fuzzy one)

**▎Rhea Kowalski — The Operator ● skeptical**

You threw out €120–180K ACV and a three-year path to €20M ARR but I haven't heard a single real number on how that deal gets built — sales cycle length, implementation cost, who sells it, gross margin shape. German tier-2 banks are 9-to-18-month procurement cycles with on-prem or sovereign-cloud requirements that eat margin. What's your payback period assumption and how much of that ACV is services revenue to get the first bank live?
[sentiment: skeptical]

**▎Presenter:**
I'll be direct — this is the area where I'm least sharp today. ACV of €120–180K is triangulated from what the two LOI banks told us they'd pay in year one, not from a finished pricing model. Sales cycle from first conversation to signed PO in the LOI accounts has been running around 5–7 months so far, but neither has closed as paid, so I'd mentally plan for 9 months average and 12 months for the colder top of funnel.

On gross margin — honestly, I don't have a firm number. The software itself should be 80%+ at steady state, but the first 5–10 deployments will be services-heavy because we're mapping each bank's model inventory and BaFin-specific controls. My rough gut is first-cohort blended margin is 50–60%, call it services 30% of ACV at the start, dropping to under 10% by deal 20. Payback I haven't modelled cleanly — if CAC is mostly founder-led sales and a partnerships hire, maybe €40–60K all-in per bank at this stage, so 9–12 month payback on year-one ACV, better on expansion. Those are estimates, not a model. I'd want a week with the CFO candidate to harden them. On "who sells it" — founder-led for the first 10, then a DACH enterprise AE with banking-sector rolodex. That's the hire plan.

---

### Turn 4 — Skeptic (pressing the weakness)

**▎Pat Herrington — The Skeptic ● hostile**

You just told the room you don't have a gross margin number, you haven't modelled payback, and the services mix is a guess — at a €2M raise, that is roughly 18 months of runway and you're selling into 9-to-12-month bank procurement. You're asking us to underwrite a services-heavy, founder-sold, regulation-bet business without unit economics, and the premise that 50–60% blended margins are venture-grade is exactly the kind of thing that looks fine at seed and kills you at Series A when Credo AI walks in with a 75% gross margin comp. What specifically have you already shipped in the last 90 days — not planned, shipped — that proves this becomes a software business and not a regulated-services boutique?
[sentiment: hostile]

**▎Presenter:**
Taking that on the chin. Shipped in the last 90 days, concretely: a working ingestion pipeline for three common model-registry formats (MLflow, SAS Model Manager exports, and a generic CSV path), an Article 11 technical-file generator that produces a PDF and structured JSON artefact from a populated model card, and a BaFin-language control-mapping library covering ~60 of the MaRisk AT 4.3.4 and BAIT items that overlap AI Act Annex IV. One of the LOI banks has run a model through the technical-file generator end-to-end in a sandbox — not production, but real their-data, not a demo.

What I have not shipped: post-market monitoring telemetry, the incident-reporting workflow under Article 73, or multi-tenant deployment. Those are the next two quarters.

On services versus software — I hear the concern and I won't pretend we'll be 80% margin at deal 10. The honest plan is to absorb the services burden at the first five deals as a loss-leader, productise the implementation playbook by deal 5–7, and refuse to take deals 8+ that require more than 20% services. If we can't hold that line, you're right — it's a boutique, and you should not fund the Series A. That's a real kill gate, not a hedge.

---

### Turn 5 — Portfolio (fund-level)

**▎Mira Chen — The Portfolio Lens ● neutral**

Stepping up a level — we already hold Veritan in model-risk monitoring and Kairoslex in EU financial-services compliance tooling, and both sell into the same BaFin buying center. A €2M pre-seed lead here almost certainly means a €3–4M reserve into the seed-extension and €6–8M into the A, which on current fund construction puts three positions into one buying center at one regulator. Is Alinia additive — a wedge our existing portfolio can channel into — or are we concentrating distribution risk behind a regulator whose Article 6 interpretation we just heard is the whole thesis?
[sentiment: neutral]

**▎Presenter:**
The overlap with Kairoslex is the one I'd want to pressure-test with their CEO before we lead — on paper Kairoslex is DORA and MiFID-facing and we're AI Act Article 6-facing, but both touch the same Head of Non-Financial Risk at a tier-2 bank and there's real channel conflict if their roadmap bends toward AI governance. I'd want a written non-compete on the AI Act conformity artefact layer as part of our deal. Veritan I think is complementary — they monitor live model drift, we produce the regulatory artefacts; there's an integration story rather than a collision.

On concentration: you're right that three positions behind BaFin's Article 6 read is a correlated bet, and if that's outside the fund's concentration tolerance we shouldn't lead — we should co-lead with a German fund that already has the BaFin relationship and take a 10–12% position instead of 18–20%. I'd actually prefer that structure because it brings a local signal investor and diversifies the board-level regulatory read. So my answer on additive-versus-redundant: additive at the product layer, correlated at the regulatory-thesis layer, and the right response is to resize the check rather than walk — unless the fund's exposure model says otherwise, in which case I defer.

---

## Running sentiment dashboard

```
Skeptic  ●skeptical → ●hostile
Operator ●skeptical
Hawk     ●neutral
Portfolio ●neutral
```

---

## IC · SIM — POST-COMMITTEE REPORT

ALINIA  ·  AI GOVERNANCE / REGTECH · PRE-SEED  ·  5 turns  ·  ~15:00 elapsed

**WEIGHTED SCORE:  6.4 / 10.0**

```
01 CONVICTION CLARITY      7 /10   Clear thesis and kill-gates; conceded tier-1 weakness without folding on wedge.
02 RISK ACKNOWLEDGMENT     8 /10   Named 6(3) exemption risk, services-trap, Kairoslex channel conflict explicitly.
03 DATA DENSITY            4 /10   ACV, sales cycle, ship log specific; margins, CAC, payback all hand-waved as gut.
04 THESIS ALIGNMENT        7 /10   BaFin Annex III + MaRisk mapping credible; regulatory-artefact moat well framed.
05 POISE UNDER PRESSURE    7 /10   Took Pat's hostile hit cleanly, offered a real kill gate instead of hedging.
```

**SUMMARY**
This is a classic "the regulatory insight is good, the financial model is a draft" pre-seed — the presenter holds position under pressure and knows what she doesn't know, which is more than most founders manage. Do not write the term sheet until she comes back with a unit-economics pack and a signed LOI-to-PO conversion on at least one of the two banks.

**IMPROVEMENT NOTES (next time)**
1. Walk in with a one-page unit-economics sheet: blended GM by deal cohort, services-% curve, CAC loaded with partnerships hire, payback at 3 scenarios — do not improvise this in the room.
2. Pre-bake the regulatory scenario tree as a slide: base / 6(3)-narrow / BaFin-accelerated, with product-shape and TAM under each — Samuel will always probe this and a visual kills the fuzziness.
3. Preempt the Kairoslex-style portfolio-conflict question before the Portfolio partner asks it: know the fund's existing positions in your sector and walk in with a proposed check-size and co-lead structure, not as a response.

**SENTIMENT TRAJECTORY**
```
Skeptic:    skeptical → hostile
Operator:   skeptical
Hawk:       neutral
Portfolio:  neutral
```
