import { NextResponse } from "next/server";
import { encodeShareToken } from "@/lib/share-token";
import type { Brief, Rubric, SharePayload } from "@/lib/types";

export const runtime = "nodejs";
// No LLM call — pure transformation. 10s is generous; in practice this returns
// in single-digit milliseconds.
export const maxDuration = 10;

interface Payload {
  brief?: Brief;
  rubric?: Rubric;
}

export async function POST(req: Request) {
  try {
    const { brief, rubric } = (await req.json()) as Payload;
    if (!brief || !rubric) {
      return NextResponse.json(
        { error: "missing brief or rubric" },
        { status: 400 },
      );
    }

    const payload: SharePayload = {
      company: brief.company,
      sector: brief.sector,
      // Round to 1 decimal so the encoded JSON stays short and the badge
      // matches what /report shows.
      overall: Number((rubric.overall ?? 0).toFixed(1)),
      scores: {
        convictionClarity: rubric.convictionClarity.score,
        riskAck: rubric.riskAck.score,
        dataDensity: rubric.dataDensity.score,
        thesisAlignment: rubric.thesisAlignment.score,
        poise: rubric.poise.score,
      },
      improvementNotes: (rubric.improvementNotes ?? []).slice(0, 3),
      summary: rubric.summary ?? "",
      dateISO: new Date().toISOString(),
    };

    const token = encodeShareToken(payload);
    const origin = new URL(req.url).origin;
    const url = `${origin}/r/${token}`;
    return NextResponse.json({ token, url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
