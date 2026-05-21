export type MemberId = "skeptic" | "operator" | "hawk" | "portfolio";

export type Sentiment = "positive" | "neutral" | "skeptical" | "hostile";

export interface CommitteeMember {
  id: MemberId;
  name: string;
  archetype: string;
  tagline: string;
  domain: string[];
  systemPrompt: (brief: Brief) => string;
}

export interface Source {
  title: string;
  url: string;
  accessedAt?: string;
}

export interface Competitor {
  name: string;
  positioning: string;
  threat: string;
}

export interface MarketSizing {
  tam?: string;
  sam?: string;
  som?: string;
  methodology?: string;
}

export interface Comparable {
  company: string;
  multiple?: string;
  note?: string;
}

// Live web-search enrichment, structured as the five named queries from
// PRD §10.1 — funding / competitor pricing / regulatory status / incumbent
// roadmap / comparables. `sourcedAt` is stamped server-side in /api/brief
// (a real timestamp, never authored by the model).
export interface Enrichment {
  funding?: string;
  competitorPricing?: string;
  regulatoryStatus?: string;
  incumbentRoadmap?: string;
  comparables?: string;
  sourcedAt?: string;
}

export interface Brief {
  // Existing core fields
  company: string;
  oneLiner: string;
  sector: string;
  stage: string;
  thesisFit: string;
  ssiScore: number | null;
  regEmbeddedness: number | null;
  topRisks: string[];
  marketSize: string;
  competitiveLandscape: string;
  team: string;
  traction: string;
  recentSignal: string;
  chips: string[];
  raw?: string;

  // Extended VC-memo fields (all optional — older briefs still load)
  product?: string;                  // What the product technically does
  businessModel?: string;            // Pricing, GTM motion, ACVs, sales cycle
  competitors?: Competitor[];        // Named, structured competitor view
  marketSizing?: MarketSizing;       // TAM/SAM/SOM with methodology
  regulatoryContext?: string;        // Regulations that create or threaten the moat
  capTable?: string;                 // Cap-table observations: dilution, founder ownership
  comparables?: Comparable[];        // Public/private comparables with multiples
  unitEconomics?: string;            // CAC, payback, gross margin, net retention
  keyQuestionsForIC?: string[];      // What the IC should pressure-test
  sources?: Source[];                // Citations gathered during generation
  enrichment?: Enrichment;           // Structured live web-search findings (PRD §9.3)
}

export interface Turn {
  id: string;
  role: "presenter" | "member";
  memberId?: MemberId;
  text: string;
  sentiment?: Sentiment;
  timestamp: number;
}

export interface Rubric {
  convictionClarity: RubricScore;
  riskAck: RubricScore;
  dataDensity: RubricScore;
  thesisAlignment: RubricScore;
  poise: RubricScore;
  overall: number;
  improvementNotes: string[];
  summary: string;
}

export interface RubricScore {
  score: number;
  justification: string;
}

export interface LookupFact {
  text: string;
  source?: Source;
}

export interface LookupResult {
  tip: string;
  facts: LookupFact[];
}

export interface DealListItem {
  id: string;
  company: string;
  oneLiner: string;
  sector: string;
  stage: string;
  ssiScore: number | null;
  signalTier: string;
  priority: string;
  status: string;
}

// Compact payload for /r/[token]. The token IS the data — no KV, no DB. We
// keep this tight because the whole thing has to base64url-encode into a URL
// that fits comfortably in tweets, LinkedIn posts, and iMessage. ~500-800 bytes
// JSON → ~700-1100 chars base64url. Justifications and the full transcript are
// intentionally dropped; only the score badge + summary + improvement notes
// survive.
export interface SharePayload {
  company: string;
  sector: string;
  overall: number;
  scores: {
    convictionClarity: number;
    riskAck: number;
    dataDensity: number;
    thesisAlignment: number;
    poise: number;
  };
  improvementNotes: string[];
  summary: string;
  dateISO: string;
}
