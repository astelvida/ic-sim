import { NextResponse } from "next/server";
import { getAnthropic, MODEL_ID } from "@/lib/anthropic";
import { COMMITTEE_BY_ID } from "@/lib/committee";
import { extractJson } from "@/lib/json-extract";
import { withRetry } from "@/lib/retry";
import type { Brief, Rubric, Turn } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SCORE_SYSTEM = `You are a seasoned managing partner reviewing a recording of a VC associate defending a deal to the investment committee. Score rigorously but fairly. Be strict about data density — specific numbers beat hand-wavy claims — and about whether the presenter proactively surfaced risks before being asked. Be generous about conviction if the presenter held their position under pressure with substantive reasoning.

Return ONLY a single JSON object matching this schema (no prose, no markdown fences):
{
  "convictionClarity": { "score": 1-10, "justification": "<= 20 words" },
  "riskAck":           { "score": 1-10, "justification": "<= 20 words" },
  "dataDensity":       { "score": 1-10, "justification": "<= 20 words" },
  "thesisAlignment":   { "score": 1-10, "justification": "<= 20 words" },
  "poise":             { "score": 1-10, "justification": "<= 20 words" },
  "overall": number,                    // weighted average, 1 decimal
  "improvementNotes": string[],         // exactly 3, each a concrete, actionable next-time instruction
  "summary": string                     // 2 sentences, plain-spoken
}`;

function renderTranscript(turns: Turn[]): string {
  return turns
    .map((t) => {
      if (t.role === "presenter") return `PRESENTER: ${t.text}`;
      const m = t.memberId ? COMMITTEE_BY_ID[t.memberId] : null;
      return `${m?.archetype ?? "COMMITTEE"} (${m?.name ?? ""}): ${t.text}`;
    })
    .join("\n\n");
}

export async function POST(req: Request) {
  try {
    const { brief, turns } = (await req.json()) as { brief: Brief; turns: Turn[] };

    const user = `DEAL BRIEF:\n${JSON.stringify(brief, null, 2)}\n\nTRANSCRIPT:\n${renderTranscript(turns)}\n\nScore the presenter per the rubric.`;

    const client = getAnthropic();
    // No prompt caching here: SCORE_SYSTEM is ~300 tokens, well below Sonnet 4.6's
    // 1,024-token cacheability floor. Score also only runs once per session.
    const res = await withRetry(() =>
      client.messages.create({
        model: MODEL_ID,
        // 1800 (was 1400) so a rubric at the upper bound of all word counts +
        // 3 detailed improvement notes + a 2-sentence summary clears max_tokens
        // headroom. Truncation at the JSON closing brace was the most common
        // shape of /api/score 500s before this bump.
        max_tokens: 1800,
        system: SCORE_SYSTEM,
        messages: [{ role: "user", content: user }],
      }),
    );

    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("")
      .trim();

    let rubric: Rubric;
    try {
      rubric = JSON.parse(extractJson(text)) as Rubric;
    } catch (parseErr) {
      // Mirror /api/brief's diagnostic shape. stop_reason="max_tokens" is the
      // smoking gun for truncation; "end_turn" with a parse failure means the
      // model emitted prose around the JSON (rare, but extractJson handles it).
      console.error(
        `[/api/score] JSON.parse failed. text.length=${text.length}, ` +
          `stop_reason=${res.stop_reason}, tail=${JSON.stringify(text.slice(-200))}`,
      );
      throw new Error(
        `score generation returned malformed JSON (${parseErr instanceof Error ? parseErr.message : "unknown"}). ` +
          `stop_reason=${res.stop_reason}, output length=${text.length} chars.`,
      );
    }
    return NextResponse.json({ rubric });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
