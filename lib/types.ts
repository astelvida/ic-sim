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

export interface Brief {
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
