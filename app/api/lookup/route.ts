import { NextResponse } from "next/server";
import { getAnthropic, MODEL_ID } from "@/lib/anthropic";
import { extractJson } from "@/lib/json-extract";
import { withRetry } from "@/lib/retry";
import type { Brief, LookupResult, Source } from "@/lib/types";

export const runtime = "nodejs";
// 60s is enough for max_uses=2 web searches + a small completion. Lookup runs
// inline while the user waits — push back if this consistently exceeds 8s.
export const maxDuration = 60;

// ~1.2k tokens — intentionally above Sonnet 4.6's 1024-token cache floor.
// Stays cached across consecutive lookups in the same session.
const LOOKUP_SYSTEM = `You are a research assistant supporting a founder defending their company in front of a VC investment committee. The founder is composing an answer right now and needs you to surface 2-3 specific, verifiable data points they could cite.

You will receive:
1. A deal brief describing the founder's company
2. The draft answer the founder has typed so far (may be empty)
3. Optionally, the most recent question a committee member asked

Use the web_search tool (max 2 searches) to find facts that would strengthen the draft. Prefer:
- Numbers with dates and sources (e.g., "Klaviyo NRR 119% (Q3 2025 10-Q)")
- Named comparables with public multiples or recent raise terms
- Regulatory citations with article numbers and enforcement dates
- Customer counts, pricing tiers, or deployment scale figures from competitors

Rules:
- DO NOT write the founder's answer for them. Return raw facts they can choose to cite.
- Each fact MUST be ≤ 25 words. Be tight.
- Prefer one strong number with a clear source over three vague claims.
- If the question is regulatory, cite the specific regulation and article number.
- If the question is unit-economics, cite a comparable's disclosed number with date.
- If web_search returns nothing useful, return facts with text that names the unknown ("Klaviyo's NRR disclosed; vertical-SaaS comp range 110-130%") — never fabricate numbers.

Return ONLY a JSON object (no prose, no markdown fences) matching this schema:
{
  "tip": string,                                  // 1-line directional headline, ≤ 12 words
  "facts": [
    {
      "text": string,                             // ≤ 25 words, citable
      "source": { "title": string, "url": string } // include when web_search returned a real URL
    }
  ]
}

Return 2-3 facts. Fewer is better than padding with weak ones.`;

function briefSnippet(brief: Brief): string {
  return [
    `Company: ${brief.company}`,
    `Sector: ${brief.sector} · Stage: ${brief.stage}`,
    brief.oneLiner ? `Pitch: ${brief.oneLiner}` : "",
    brief.product ? `Product: ${brief.product}` : "",
    brief.businessModel ? `Business model: ${brief.businessModel}` : "",
    brief.competitiveLandscape ? `Competitive landscape: ${brief.competitiveLandscape}` : "",
    brief.regulatoryContext ? `Regulatory context: ${brief.regulatoryContext}` : "",
    brief.unitEconomics ? `Unit economics: ${brief.unitEconomics}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildUserMessage(input: {
  brief: Brief;
  draftText: string;
  lastMemberQuestion?: string;
}): string {
  const parts = [
    `--- BRIEF SNIPPET ---\n${briefSnippet(input.brief)}`,
    input.lastMemberQuestion
      ? `--- MOST RECENT COMMITTEE QUESTION ---\n${input.lastMemberQuestion}`
      : "--- NO COMMITTEE QUESTION YET (founder is composing an opening statement) ---",
    `--- FOUNDER'S DRAFT (may be empty) ---\n${input.draftText || "(empty)"}`,
    "Find 2-3 specific, citable data points that would strengthen this draft. Use web_search.",
  ];
  return parts.join("\n\n");
}

// Lifted from /api/brief — defensive walk of response.content for
// web_search_tool_result blocks. Same shape, isolated to this route.
function collectSources(content: unknown[]): Source[] {
  const sources: Source[] = [];
  const seen = new Set<string>();
  const accessedAt = new Date().toISOString();
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    const b = block as Record<string, unknown>;
    if (b.type !== "web_search_tool_result") continue;
    const inner = b.content;
    if (!Array.isArray(inner)) continue;
    for (const r of inner) {
      if (!r || typeof r !== "object") continue;
      const item = r as Record<string, unknown>;
      const url = typeof item.url === "string" ? item.url : undefined;
      const title = typeof item.title === "string" ? item.title : url;
      if (!url || !title || seen.has(url)) continue;
      seen.add(url);
      sources.push({ title, url, accessedAt });
    }
  }
  return sources;
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    const body = (await req.json()) as {
      brief?: Brief;
      draftText?: string;
      lastMemberQuestion?: string;
    };
    const brief = body.brief;
    if (!brief) {
      return NextResponse.json({ error: "missing brief" }, { status: 400 });
    }

    const client = getAnthropic();
    const res = await withRetry(() =>
      client.messages.create({
        model: MODEL_ID,
        max_tokens: 800,
        system: [
          {
            type: "text",
            text: LOOKUP_SYSTEM,
            cache_control: { type: "ephemeral" },
          },
        ],
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 2,
            cache_control: { type: "ephemeral" },
          } as unknown as never,
        ],
        messages: [
          {
            role: "user",
            content: buildUserMessage({
              brief,
              draftText: (body.draftText ?? "").trim(),
              lastMemberQuestion: body.lastMemberQuestion?.trim(),
            }),
          },
        ],
      }),
    );

    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? (b as { text: string }).text : ""))
      .join("")
      .trim();

    let result: LookupResult;
    try {
      result = JSON.parse(extractJson(text)) as LookupResult;
    } catch (parseErr) {
      console.error(
        `[/api/lookup] JSON.parse failed. text.length=${text.length}, ` +
          `stop_reason=${res.stop_reason}, tail=${JSON.stringify(text.slice(-200))}`,
      );
      throw new Error(
        `lookup returned malformed JSON (${parseErr instanceof Error ? parseErr.message : "unknown"})`,
      );
    }

    // If the model omitted sources but web_search ran, splice harvested URLs in
    // by order — at least the first N facts get attribution.
    const harvested = collectSources(res.content as unknown[]);
    if (harvested.length) {
      result.facts = result.facts.map((f, i) => ({
        ...f,
        source: f.source ?? harvested[i] ?? undefined,
      }));
    }

    console.log(
      `[/api/lookup] ok in ${Date.now() - startedAt}ms · facts=${result.facts.length} · sources=${harvested.length}`,
    );
    return NextResponse.json({ result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    console.error(`[/api/lookup] failed in ${Date.now() - startedAt}ms: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
