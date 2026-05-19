import { COMMITTEE } from "./committee";
import type { MemberId, Sentiment, Turn } from "./types";

// Synchronous orchestrator. Used for the kickoff turn (no prior presenter
// answer to evaluate for evasion) and as the fallback inside the async path.
export function pickNextMemberSync(turns: Turn[]): MemberId {
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

export interface PickResult {
  memberId: MemberId;
  // Populated when the orchestrator decided the previous member should re-ask
  // (PRD §12.2 evasion path). /api/turn uses this text to prepend a "you
  // didn't address X — let me re-ask" preamble to the system prompt.
  reaskOf?: string;
  // The 1-5 evasion classifier score. Optional & dev-only telemetry — surfaced
  // in dev console for calibration; never rendered to the user.
  evasionScore?: number;
}

// Async orchestrator — layers PRD §12.2 evasion classification on top of the
// sync pick. The classifier rates the user's last answer 1-5 against the most
// recent member question; if ≤ 2 (completely evaded or dodged the core), the
// same member re-asks instead of moving on. Otherwise we fall through to the
// keyword + novelty + random scoring in pickNextMemberSync.
export async function pickNextMember(
  turns: Turn[],
  opts?: { signal?: AbortSignal },
): Promise<PickResult> {
  // Find the most recent member-question and most recent presenter-answer.
  let lastMemberIdx = -1;
  let lastPresenterIdx = -1;
  for (let i = turns.length - 1; i >= 0; i--) {
    if (lastPresenterIdx === -1 && turns[i].role === "presenter") lastPresenterIdx = i;
    if (lastMemberIdx === -1 && turns[i].role === "member") lastMemberIdx = i;
    if (lastMemberIdx !== -1 && lastPresenterIdx !== -1) break;
  }

  // Evasion only makes sense when the presenter answered AFTER a member asked
  // (the standard exchange shape). On the very first turn, or when the user
  // opened with an unprompted statement, skip the classifier.
  const canEvaluate =
    lastMemberIdx >= 0 &&
    lastPresenterIdx > lastMemberIdx &&
    !!turns[lastMemberIdx].memberId &&
    turns[lastMemberIdx].text.trim().length > 0 &&
    turns[lastPresenterIdx].text.trim().length > 0;

  if (canEvaluate) {
    const question = turns[lastMemberIdx].text;
    const answer = turns[lastPresenterIdx].text;
    try {
      const res = await fetch("/api/evasion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
        signal: opts?.signal,
      });
      if (res.ok) {
        const data = (await res.json()) as { score?: number };
        const score = typeof data.score === "number" ? data.score : 3;
        if (score <= 2) {
          // Re-ask path: same member, carry forward the evaded question.
          return {
            memberId: turns[lastMemberIdx].memberId as MemberId,
            reaskOf: question,
            evasionScore: score,
          };
        }
        return { memberId: pickNextMemberSync(turns), evasionScore: score };
      }
    } catch (e) {
      // Network blip / abort → silent fall-through to the sync path. The
      // simulator should never stall on a classifier failure; we just lose
      // the re-ask signal for this turn.
      if (e instanceof Error && e.name !== "AbortError") {
        console.warn("[pickNextMember] evasion classifier failed:", e.message);
      }
    }
  }

  return { memberId: pickNextMemberSync(turns) };
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

// Per-member sentiment trajectory across a session, in turn order.
// Used by the post-room report (web + PDF) and mirrors the skill-side rendering
// in .claude/skills/ic-score/SKILL.md.
export function sentimentTrajectory(memberId: MemberId, turns: Turn[]): Sentiment[] {
  return turns
    .filter((t) => t.role === "member" && t.memberId === memberId && t.sentiment)
    .map((t) => t.sentiment as Sentiment);
}
