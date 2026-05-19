import { COMMITTEE } from "./committee";
import type { MemberId, Turn } from "./types";

// Pick the next member based on (a) topic overlap with the last presenter turn,
// (b) never repeat the previous member twice in a row, (c) gentle round-robin fallback.
export function pickNextMember(turns: Turn[]): MemberId {
  const memberTurns = turns.filter((t) => t.role === "member");
  const lastMember = memberTurns[memberTurns.length - 1]?.memberId;

  const presenterTurns = turns.filter((t) => t.role === "presenter");
  const lastPresenter = presenterTurns[presenterTurns.length - 1]?.text.toLowerCase() ?? "";

  // Score by keyword match
  const scored = COMMITTEE.map((m) => {
    if (m.id === lastMember) return { id: m.id, score: -10 };
    const hits = m.domain.reduce(
      (acc, kw) => (lastPresenter.includes(kw) ? acc + 2 : acc),
      0
    );
    // encourage members who haven't spoken yet
    const spokenCount = memberTurns.filter((t) => t.memberId === m.id).length;
    const novelty = spokenCount === 0 ? 3 : -spokenCount * 0.6;
    return { id: m.id, score: hits + novelty + Math.random() * 0.5 };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].id;
}

export function parseSentiment(text: string): {
  clean: string;
  sentiment: Turn["sentiment"];
} {
  const match = text.match(/\[sentiment:\s*(positive|neutral|skeptical|hostile)\s*\]/i);
  if (!match) return { clean: text.trim(), sentiment: "neutral" };
  const sentiment = match[1].toLowerCase() as Turn["sentiment"];
  const clean = text.replace(match[0], "").trim();
  return { clean, sentiment };
}
