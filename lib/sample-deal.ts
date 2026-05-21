import type { Brief } from "./types";

// Hard-coded sample deal powering the zero-friction "try the sample" entry on
// the landing page. It lets a first-time visitor walk straight into the room —
// no Notion connection, no 60-120s /api/brief generation. The content is the
// PRD's canonical worked example (TORTUS AI, docs/ic-sim-prd-final.md §21.1),
// mapped from the PRD's raw shape into the lib/types.ts `Brief` schema.
export const SAMPLE_BRIEF: Brief = {
  company: "TORTUS AI",
  oneLiner:
    "AI clinical documentation that writes directly into EHR systems. NHS DTAC compliant, MHRA-registered Class IIa medical device, live in 3,500+ GP practices via the X-on Health partnership.",
  sector: "Healthcare AI",
  stage: "Seed",
  thesisFit:
    "Vertical SoR — deep EHR write-loop ownership (not a copy-paste overlay) plus a regulatory moat that gates fast-followers.",
  ssiScore: 82,
  regEmbeddedness: 17,
  chips: ["Healthcare AI", "Seed", "SSI 82", "P0", "London"],
  topRisks: [
    "Epic ships native AI documentation within ~9 months — a kill criterion worth −30 SSI.",
    "MHRA AI Airlock pulled back from Phase 2 to Phase 1 — −15 SSI.",
    "GOSH multi-site rollout stalls before it proves the hospital wedge — −10 SSI.",
    "£15M post-money against a $25M post 18 months ago reads as a flat-to-down round.",
  ],
  marketSize:
    "UK/EU clinical documentation. The NHS has an ~£80M FY2026 budget line for AI documentation; the global ambient clinical documentation market is estimated at $8-10B by 2030.",
  competitiveLandscape:
    "Crowded and well-funded. Heidi raised a $19M Series A from Sequoia (Mar 2026); Nuance DAX (Microsoft) anchors pricing at ~$200/clinician/month; Nabla and Abridge are scaling in the US. Platform risk: Epic announced 'Smart Prompts' in April 2026 with no GA date.",
  team:
    "24 people, London. Clinician-founder-led, built around native EHR write-back integration. A Head of Clinical Safety is in place to own MDR vigilance reporting.",
  traction:
    "Live in 3,500+ GP practices via the X-on Health channel partnership. GOSH multi-site hospital rollout expanding. ~$3M ARR. $8.5M raised to date.",
  recentSignal:
    "MHRA AI Airlock Phase 2 inclusion plus £3.6M programme funding (Apr 2026); GOSH multi-site rollout expanding. Catalyst window ~91 days.",
  product:
    "An ambient AI scribe that captures the clinical encounter and writes structured notes directly into the EHR — owning the write loop rather than sitting beside it as an overlay. Registered with the MHRA as a Class IIa medical device and NHS DTAC compliant.",
  businessModel:
    "Per-clinician subscription. Lands through the X-on Health channel into GP practices, expands directly into NHS hospital trusts. Channel-led distribution keeps acquisition cost low against direct-sales incumbents.",
  competitors: [
    {
      name: "Heidi Health",
      positioning:
        "Ambient AI scribe with a free clinician tier; $19M Series A from Sequoia (Mar 2026).",
      threat: "High — well-capitalised, fast-moving, freemium distribution.",
    },
    {
      name: "Nuance DAX (Microsoft)",
      positioning:
        "Incumbent ambient documentation at ~$200/clinician/month, deep Epic integration.",
      threat:
        "High — balance sheet and distribution, though US-centric and weaker on UK/EU regulatory fit.",
    },
    {
      name: "Epic 'Smart Prompts'",
      positioning: "Native EHR-vendor AI documentation, announced Apr 2026, no GA date.",
      threat: "Existential if it ships — the platform owns the system of record.",
    },
    {
      name: "Nabla / Abridge",
      positioning: "Ambient scribes scaling quickly in the US market.",
      threat: "Medium — limited UK/EU regulatory footprint today.",
    },
  ],
  marketSizing: {
    tam: "$8-10B global ambient clinical documentation by 2030",
    sam: "UK + EU public health systems; ~£80M NHS AI documentation budget in FY2026",
    som: "UK GP practices and NHS trusts — 3,500+ practices already live",
    methodology:
      "Bottom-up from per-clinician pricing across the reachable NHS install base, cross-checked against the published NHS AI documentation budget line.",
  },
  regulatoryContext:
    "MHRA-registered Class IIa medical device; NHS DTAC compliant; currently in MHRA AI Airlock Phase 2. Class IIa triggers post-market surveillance obligations under MDR Article 83. The moat: replicating Class IIa registration takes roughly 18 months and ~€400K — the gate fast-followers have to clear.",
  capTable:
    "$8.5M raised to date; $4.2M Seed (Feb 2024) led by Khosla. New round proposed at ~£15M post-money — flat-to-down versus a $25M post 18 months ago, so watch founder dilution and the down-round signal.",
  comparables: [
    {
      company: "Healthcare AI Series A (2026 median)",
      multiple: "~8x ARR",
      note: "~$30M median post-money",
    },
    { company: "Heidi Health", note: "$19M Series A, Sequoia, Mar 2026" },
    { company: "Nuance DAX", note: "~$200/clinician/month — incumbent pricing anchor" },
  ],
  unitEconomics:
    "~$3M ARR. Channel-led distribution via X-on Health keeps CAC well below direct-sales incumbents. Gross margin is gated by inference cost per generated note; payback is the number to watch as the team 3x's headcount.",
  keyQuestionsForIC: [
    "Why would a hospital already using Heidi or Nuance switch to TORTUS?",
    "What stops TORTUS from becoming a feature inside Epic or Cerner?",
    "Why a £15M post-money when the last round was a $25M post 18 months ago?",
    "What is the GP-practice vs hospital-trust go-to-market sequence?",
    "How does a 24-person team run post-market surveillance at scale?",
  ],
  enrichment: {
    funding:
      "Heidi Health raised a $19M Series A from Sequoia in March 2026; TORTUS has raised $8.5M total, including a $4.2M Seed led by Khosla in February 2024.",
    competitorPricing:
      "Nuance DAX is priced at roughly $200/clinician/month; Heidi runs a free individual-clinician tier as an acquisition wedge.",
    regulatoryStatus:
      "MHRA AI Airlock Phase 2 is active; the NHS has an estimated £80M FY2026 budget line for AI clinical documentation.",
    incumbentRoadmap:
      "Epic announced 'Smart Prompts' AI documentation in April 2026, with no general-availability date.",
    comparables:
      "Healthcare AI Series A rounds in 2026 are clearing an estimated ~$30M median post-money at roughly 8x ARR.",
    sourcedAt: "2026-05-19T09:30:00.000Z",
  },
};
