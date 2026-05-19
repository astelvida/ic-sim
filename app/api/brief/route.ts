import { NextResponse } from "next/server";
import { getAnthropic, MODEL_ID } from "@/lib/anthropic";
import { fetchDeal } from "@/lib/notion";
import type { Brief } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const BRIEF_SYSTEM = `You are a VC principal drafting a one-page investment committee brief. The brief is tight, specific, and written for a partner who has 90 seconds to read it before entering the room. No marketing language, no hype. Use specific numbers where provided; if data is missing, write "unknown" — never invent numbers.

Return ONLY a single JSON object matching this schema (no prose, no markdown fences):
{
  "company": string,
  "oneLiner": string,                 // <= 14 words
  "sector": string,
  "stage": string,
  "thesisFit": string,                // 2-3 sentences
  "ssiScore": number | null,          // 0-100 if provided
  "regEmbeddedness": number | null,   // 0-20 if provided
  "topRisks": string[],               // exactly 3, each <= 14 words
  "marketSize": string,               // 1-2 sentences, cite figures if known
  "competitiveLandscape": string,     // 1-2 sentences, name competitors if known
  "team": string,                     // 1 sentence
  "traction": string,                 // 1 sentence
  "recentSignal": string,             // 1 sentence, the most recent meaningful signal
  "chips": string[]                   // 3-5 short tags like "Seed", "P1", "AI Governance"
}`;

const NOTION_MAPPING_INSTRUCTIONS = `Here is the raw Notion Dealflow record. Map its fields into the brief schema. Use "Kill Criteria" text to inform topRisks; use "Why Interesting" + "Thesis" + "Sector" to write thesisFit; use "Key Customers"/"Key Investors"/"Last Raise" for traction; use "Competitors" for competitiveLandscape; use "Founding Team" for team; use "Key Signal 30d" for recentSignal.`;

function buildUserMessage(input: { fromNotion?: unknown; rawText?: string }): string {
  if (input.rawText) {
    return `The presenter pasted this deal summary. Extract the brief faithfully — do not invent.\n\n---\n${input.rawText}\n---`;
  }
  return `${NOTION_MAPPING_INSTRUCTIONS}\n\n---\n${JSON.stringify(input.fromNotion, null, 2)}\n---`;
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
    const body = (await req.json()) as { notionId?: string; rawText?: string };

    let userMessage: string;
    if (body.notionId) {
      const deal = await fetchDeal(body.notionId);
      userMessage = buildUserMessage({ fromNotion: deal });
    } else if (body.rawText?.trim()) {
      userMessage = buildUserMessage({ rawText: body.rawText });
    } else {
      return NextResponse.json({ error: "provide notionId or rawText" }, { status: 400 });
    }

    const client = getAnthropic();
    const res = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 1400,
      system: BRIEF_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("")
      .trim();

    const brief = JSON.parse(extractJson(text)) as Brief;
    return NextResponse.json({ brief });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
