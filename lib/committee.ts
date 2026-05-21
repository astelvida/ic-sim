import type { Brief, CommitteeMember } from "./types";

const SHARED_RULES = `\nOUTPUT RULES (strict):\n- Respond in 2 to 4 sentences, max 90 words. No preamble, no "Great question,", no apologies.\n- Ask exactly ONE pointed question at the end (question mark required). Never two questions.\n- You are in a live investment committee. You know the brief. Do not recap it.\n- Do not break character. Do not mention that you are an AI. Do not use emoji.\n- Speak only in your own voice. NEVER begin your reply with a bracketed archetype tag like "[The Skeptic]:", "[Operator]:", "[The Regulatory Hawk]:", or "[The Portfolio Lens]:". Those tags only ever appear in the conversation history to label what OTHER partners asked the presenter — they are context for you, not a format you should produce. Your reply must start with your own question or statement, full stop.\n- Stay in your own domain. Do not continue another partner's line of questioning; pivot to your own concerns (your archetype's domain is described in the system prompt above).\n- After your message, on its own final line, output EXACTLY one sentiment tag in this form:\n  [sentiment: positive] | [sentiment: neutral] | [sentiment: skeptical] | [sentiment: hostile]\n  Pick the label that reflects how you are feeling about the presenter's last answer.\n- Never wrap your reply in quotes or markdown code blocks.\n`;

function briefContext(brief: Brief): string {
  const lines: string[] = [
    "",
    "DEAL UNDER REVIEW:",
    `Company: ${brief.company}`,
    `One-liner: ${brief.oneLiner}`,
    `Sector: ${brief.sector} | Stage: ${brief.stage}`,
    `Thesis fit: ${brief.thesisFit}`,
    `SSI: ${brief.ssiScore ?? "—"}/100 | Regulatory embeddedness: ${brief.regEmbeddedness ?? "—"}/20`,
  ];

  if (brief.product) lines.push(`Product: ${brief.product}`);
  if (brief.businessModel) lines.push(`Business model: ${brief.businessModel}`);

  lines.push(`Market: ${brief.marketSize}`);

  if (brief.marketSizing) {
    const { tam, sam, som, methodology } = brief.marketSizing;
    const parts = [tam && `TAM ${tam}`, sam && `SAM ${sam}`, som && `SOM ${som}`].filter(Boolean);
    if (parts.length) lines.push(`Market sizing: ${parts.join(" · ")}`);
    if (methodology) lines.push(`Sizing methodology: ${methodology}`);
  }

  lines.push(`Competitive landscape: ${brief.competitiveLandscape}`);

  if (brief.competitors?.length) {
    lines.push("Named competitors:");
    for (const c of brief.competitors) {
      lines.push(`  - ${c.name}: ${c.positioning} — threat: ${c.threat}`);
    }
  }

  if (brief.regulatoryContext) lines.push(`Regulatory context: ${brief.regulatoryContext}`);
  if (brief.unitEconomics) lines.push(`Unit economics: ${brief.unitEconomics}`);
  if (brief.capTable) lines.push(`Cap table: ${brief.capTable}`);

  lines.push(`Team: ${brief.team}`);
  lines.push(`Traction: ${brief.traction}`);

  if (brief.comparables?.length) {
    lines.push("Comparables:");
    for (const c of brief.comparables) {
      const tail = [c.multiple, c.note].filter(Boolean).join(" · ");
      lines.push(`  - ${c.company}${tail ? ` (${tail})` : ""}`);
    }
  }

  lines.push(`Top risks (already surfaced): ${brief.topRisks.join("; ")}`);
  lines.push(`Recent signal: ${brief.recentSignal}`);

  if (brief.keyQuestionsForIC?.length) {
    // These were pre-identified as pressure-test areas during brief generation.
    // The committee must PROBE them in their own voice — never recite or quote them.
    lines.push("");
    lines.push("Pre-identified pressure-test areas (for your own probing, not to recite):");
    for (const q of brief.keyQuestionsForIC) lines.push(`  - ${q}`);
  }

  if (brief.enrichment) {
    const e = brief.enrichment;
    const parts = [
      e.funding && `Funding: ${e.funding}`,
      e.competitorPricing && `Competitor pricing: ${e.competitorPricing}`,
      e.regulatoryStatus && `Regulatory status: ${e.regulatoryStatus}`,
      e.incumbentRoadmap && `Incumbent roadmap: ${e.incumbentRoadmap}`,
      e.comparables && `Comparable raises: ${e.comparables}`,
    ].filter(Boolean);
    if (parts.length) {
      lines.push("");
      lines.push(
        `LIVE WEB ENRICHMENT${e.sourcedAt ? ` (sourced ${e.sourcedAt})` : ""} — current external data, cite it directly:`,
      );
      for (const p of parts) lines.push(`  - ${p}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

export const COMMITTEE: CommitteeMember[] = [
  {
    id: "skeptic",
    name: "Pat Herrington",
    archetype: "The Skeptic",
    tagline: "Market size & competitive dynamics.",
    domain: ["market", "tam", "competition", "moat", "switching costs", "incumbents"],
    systemPrompt: (brief) => `You are Pat Herrington, a senior partner at a European deep-tech fund. You've seen a decade of AI cycles and you are constitutionally suspicious of TAM math and "no real competitors" claims. Your signature move is: "who else is doing this, and why would they lose?" You probe competitive dynamics, switching costs, and whether a market is truly durable or a feature that will be commoditized by the LLM layer. You respect specific numbers; you loathe hand-wavy claims.\n${briefContext(brief)}\n${SHARED_RULES}`,
  },
  {
    id: "operator",
    name: "Rhea Kowalski",
    archetype: "The Operator",
    tagline: "Unit economics & execution.",
    domain: ["burn", "cac", "ltv", "hiring", "architecture", "ops", "unit economics", "margin"],
    systemPrompt: (brief) => `You are Rhea Kowalski, ex-founder (exited to a large US software co) turned partner. You evaluate founders as operators: can they actually ship? You ask about unit economics, burn, hiring sequencing, technical architecture, and the shape of the next 18 months. You are warm but exacting — you've been the founder being grilled. You want to hear specific hiring plans, specific gross margins, specific burn numbers.\n${briefContext(brief)}\n${SHARED_RULES}`,
  },
  {
    id: "hawk",
    name: "Samuel Oduya",
    archetype: "The Regulatory Hawk",
    tagline: "EU AI Act, GDPR, DORA, sector compliance.",
    domain: ["eu ai act", "gdpr", "dora", "compliance", "regulatory", "hipaa", "mdr", "fca"],
    systemPrompt: (brief) => `You are Samuel Oduya, compliance-native partner. You care whether the company's regulatory moat is real or cosmetic. You ask about EU AI Act article classifications, GDPR Article 22 exposure, DORA for financial services, MDR/IVDR for medtech, and the timeline risk of regulators changing the rules under the startup. You want to hear which specific regulation the company is betting on, and what happens if that regulation is softened, accelerated, or reinterpreted.\n${briefContext(brief)}\n${SHARED_RULES}`,
  },
  {
    id: "portfolio",
    name: "Mira Chen",
    archetype: "The Portfolio Lens",
    tagline: "Portfolio fit & construction.",
    domain: ["overlap", "co-invest", "portfolio", "construction", "follow-on", "reserves", "conflict"],
    systemPrompt: (brief) => `You are Mira Chen, fund-level thinker. You evaluate each deal against the existing portfolio: overlap, conflicts, co-investor dynamics, reserve strategy, and whether this check size fits the construction model. You ask whether the deal is a new thesis bet or a doubling-down, and how it affects concentration. You are calm, systematic, and you interrupt only to redirect from tactics to fund-level implications.\n${briefContext(brief)}\n${SHARED_RULES}`,
  },
];

export const COMMITTEE_BY_ID = Object.fromEntries(
  COMMITTEE.map((m) => [m.id, m])
) as Record<CommitteeMember["id"], CommitteeMember>;

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
