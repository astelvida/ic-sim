import { NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL_ID } from "@/lib/anthropic";
import { withRetry } from "@/lib/retry";

export const runtime = "nodejs";
// The classifier runs on the critical path of every committee turn — keep its
// timeout short. Haiku 4.5 typically returns in 200-600ms.
export const maxDuration = 30;

// Prompt is verbatim from PRD §12.2 — the wording matters: "SPECIFIC question",
// the 1-5 anchors, and the "single integer 1-5. No explanation." discipline are
// what keep Haiku from drifting into preambles.
const EVASION_SYSTEM = `A user is defending a deal in an investment committee.
A committee member just asked a question. The user responded.

Rate how well the user answered the SPECIFIC question, 1-5:
1 = completely evaded
2 = partial, dodged the core
3 = answered acceptably, missed nuance
4 = answered well with some gaps
5 = answered comprehensively

Output: a single integer 1-5. No explanation. No preamble. No suffix.`;

interface Payload {
  question?: string;
  answer?: string;
}

// Defensive parse — Haiku at temperature 0.2 reliably returns "3" / "4" etc,
// but if it ever preambles ("The user partially addressed...") we still find
// the digit. Falls back to 3 (neutral) on any malformed output so the route
// never throws and the orchestrator always gets a usable score.
function parseEvasionScore(raw: string): number {
  const match = raw.match(/[1-5]/);
  if (!match) return 3;
  const n = parseInt(match[0], 10);
  if (n < 1 || n > 5 || Number.isNaN(n)) return 3;
  return n;
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    const { question, answer } = (await req.json()) as Payload;
    if (!question?.trim() || !answer?.trim()) {
      // No question/answer pair → nothing to classify. Caller shouldn't have
      // hit us in this case, but return neutral so the orchestrator falls
      // through to the keyword path cleanly.
      return NextResponse.json({ score: 3 });
    }

    const client = getAnthropic();
    const res = await withRetry(() =>
      client.messages.create({
        model: HAIKU_MODEL_ID,
        max_tokens: 4,
        // temperature: 0.2 — low enough that Haiku's output is highly
        // consistent across retries on the same Q/A pair.
        temperature: 0.2,
        system: EVASION_SYSTEM,
        messages: [
          {
            role: "user",
            content: `Question:\n${question.trim()}\n\nAnswer:\n${answer.trim()}\n\nScore (1-5):`,
          },
        ],
      }),
    );

    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? (b as { text: string }).text : ""))
      .join("");
    const score = parseEvasionScore(text);

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[/api/evasion] score=${score} (raw=${JSON.stringify(text)}) in ${Date.now() - startedAt}ms`,
      );
    }
    return NextResponse.json({ score });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.error(`[/api/evasion] failed in ${Date.now() - startedAt}ms: ${message}`);
    // Even on outright failure, return a neutral 3 — the simulator should never
    // halt on a classifier error. The orchestrator just loses the re-ask signal
    // for this turn and falls through to keyword-based routing.
    return NextResponse.json({ score: 3, error: message }, { status: 200 });
  }
}
