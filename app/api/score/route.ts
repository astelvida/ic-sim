import { NextResponse } from "next/server";
import { getAnthropic, MODEL_ID } from "@/lib/anthropic";
import { COMMITTEE_BY_ID } from "@/lib/committee";
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

function extractJson(s: string): string {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1) return s.slice(first, last + 1);
  return s;
}

export async function POST(req: Request) {
  try {
    const { brief, turns } = (await req.json()) as { brief: Brief; turns: Turn[] };

    const user = `DEAL BRIEF:\n${JSON.stringify(brief, null, 2)}\n\nTRANSCRIPT:\n${renderTranscript(turns)}\n\nScore the presenter per the rubric.`;

    const client = getAnthropic();
    const res = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 1400,
      system: SCORE_SYSTEM,
      messages: [{ role: "user", content: user }],
    });

    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("")
      .trim();

    const rubric = JSON.parse(extractJson(text)) as Rubric;
    return NextResponse.json({ rubric });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
