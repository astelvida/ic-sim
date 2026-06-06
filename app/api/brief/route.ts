import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { friendlyAnthropicAuthMessage, getAnthropic, MODEL_ID } from "@/lib/anthropic";
import { fetchDeal } from "@/lib/notion";
import { extractJson } from "@/lib/json-extract";
import { withRetry } from "@/lib/retry";
import type { Brief, Source } from "@/lib/types";

export const runtime = "nodejs";
// 300s aligns with Vercel's current default function timeout. Brief generation
// can legitimately take 60-120s with web_search × 4; the headroom prevents 504s
// on the slow tail.
export const maxDuration = 300;

const BRIEF_SYSTEM = `You are a senior VC principal drafting a deep-dive Investment Committee brief on a European AI company. The brief reads like a partner-meeting memo: specific numbers, named competitors, real regulatory citations, and identified risks. No marketing language, no hype.

You have access to a web_search tool. USE IT. For every deal:
1. Search for the company name + sector to verify what they actually do
2. Search for named competitors and their recent rounds / pricing
3. Search for the specific EU regulations the deal touches (AI Act, CSRD, DORA, MDR, GDPR Article 22, etc.) — cite article numbers when relevant
4. Search for comparables: similar companies that have raised, exited, or shut down
5. Search for the founders' backgrounds when names are present

If the deal text mentions a regulatory tailwind, you MUST search for the actual current status of that regulation. If it claims a TAM, you MUST sanity-check it against public sources. Cite sources by name in prose ("according to the European Commission's Q4 2025 AI Act implementation timeline...").

When data genuinely cannot be verified, write "unknown — needs primary research" rather than inventing numbers.

Return ONLY a single JSON object (no prose, no markdown fences) matching this schema:
{
  "company": string,
  "oneLiner": string,                 // <= 14 words
  "sector": string,
  "stage": string,                    // e.g. "Seed", "Series A"
  "thesisFit": string,                // 3-5 sentences — why this fits the fund's thesis, including which thesis pillar (Compliance AI Moat / Vertical AI / AI Eval Infrastructure)
  "ssiScore": number | null,          // 0-100 if provided in source data
  "regEmbeddedness": number | null,   // 0-20 if provided
  "topRisks": string[],               // exactly 3, each <= 20 words, citing specific failure modes
  "marketSize": string,               // 2-4 sentences with cited figures and methodology — if web search returns numbers, cite the source name in prose
  "competitiveLandscape": string,     // 3-5 sentences naming specific competitors and their differentiation
  "team": string,                     // 2-3 sentences on founders' backgrounds and prior exits
  "traction": string,                 // 2-3 sentences: revenue, customers, pilots, ARR if known
  "recentSignal": string,             // 1-2 sentences on the most recent meaningful signal
  "chips": string[],                  // 3-6 short tags like "Seed", "P1", "EU AI Act", "MDR"

  "product": string,                  // 3-5 sentences on what the product technically does — architecture, integration surface, customer workflow
  "businessModel": string,            // 2-4 sentences on pricing, GTM motion, sales cycle, ACV range, expansion vector
  "competitors": [                    // 3-6 entries, prefer web-verified
    { "name": string, "positioning": string, "threat": string }
  ],
  "marketSizing": {                   // populate every field you can verify; methodology must explain the derivation
    "tam": string,
    "sam": string,
    "som": string,
    "methodology": string
  },
  "regulatoryContext": string,        // 3-5 sentences — name the specific regulations, article numbers, enforcement dates, member-state implementation status
  "capTable": string,                 // 2-3 sentences if known — lead investor, dilution, founder ownership, board composition
  "comparables": [                    // 2-5 entries from web search — companies at a similar stage in adjacent or same category
    { "company": string, "multiple": string, "note": string }
  ],
  "unitEconomics": string,            // 2-3 sentences — gross margin, CAC payback, NRR if disclosed; "unknown" with note if not
  "keyQuestionsForIC": string[],      // 5-8 pointed questions an IC partner should ask the founder, ordered by importance

  "enrichment": {                     // live web-search findings, structured — fill each field from your searches; write "unknown — needs primary research" only if no search surfaced it
    "funding": string,                // 1-2 sentences — the company's and key competitors' most recent funding rounds: amounts, lead investors, dates
    "competitorPricing": string,      // 1-2 sentences — current pricing of named competitors / incumbents
    "regulatoryStatus": string,       // 1-2 sentences — the current, verified status of the specific regulation(s) the deal depends on
    "incumbentRoadmap": string,       // 1-2 sentences — recent AI roadmap moves by incumbents that threaten this deal
    "comparables": string             // 1-2 sentences — recent comparable raises/exits and valuation multiples in the sector
  }
}`;

const NOTION_MAPPING_INSTRUCTIONS = `Here is the raw Notion Dealflow record. Map its fields into the brief schema and then use web_search to enrich every section with current external data. Use "Kill Criteria" text to inform topRisks; use "Why Interesting" + "Thesis" + "Sector" to write thesisFit; use "Key Customers"/"Key Investors"/"Last Raise" for traction; use "Competitors" as a starting point but verify and expand via web search; use "Founding Team" for team but search for the founders to add depth; use "Key Signal 30d" for recentSignal.`;

function buildUserMessage(input: { fromNotion?: unknown; rawText?: string }): string {
  if (input.rawText) {
    return `The presenter pasted this deal summary. Extract the brief faithfully, then enrich it with web_search.\n\n---\n${input.rawText}\n---`;
  }
  return `${NOTION_MAPPING_INSTRUCTIONS}\n\n---\n${JSON.stringify(input.fromNotion, null, 2)}\n---`;
}

// Defensive walk of response.content for web_search_tool_result blocks.
// Anthropic SDK 0.88 returns these with a nested `content` array of search results.
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

// Module-scoped in-flight dedupe. Two concurrent requests for the same notionId
// (e.g. the user double-clicked "enter the room →" because the brief takes 60s)
// share a single Anthropic + web_search pipeline instead of burning ~60-120s twice.
// This is NOT a TTL cache: as soon as the promise settles the key is removed, so
// a click 90s later still re-runs from scratch. A proper KV-backed cache keyed
// by Notion's last_edited_at would solve the recompute tax outright, but adding
// Vercel KV is out of scope for this iteration.
const inflightBriefs = new Map<string, Promise<Brief>>();

function briefDedupeKey(body: { notionId?: string; rawText?: string }): string | null {
  if (body.notionId) return `notion:${body.notionId}`;
  const raw = body.rawText?.trim();
  if (raw) {
    const hash = createHash("sha1").update(raw).digest("hex").slice(0, 16);
    return `raw:${hash}`;
  }
  return null;
}

async function generateBrief(body: { notionId?: string; rawText?: string }): Promise<Brief> {
  let userMessage: string;
  if (body.notionId) {
    const deal = await fetchDeal(body.notionId);
    userMessage = buildUserMessage({ fromNotion: deal });
  } else if (body.rawText?.trim()) {
    userMessage = buildUserMessage({ rawText: body.rawText });
  } else {
    // Caller is expected to validate before reaching this — defensive only.
    throw new Error("provide notionId or rawText");
  }

  // BRIEF_SYSTEM is ~1,500 tokens — well above Sonnet 4.6's 1,024-token cache floor.
  // When the user generates briefs for multiple deals in a session, subsequent calls
  // read the system prompt at 0.1x base input cost. Cache breakpoint also on the tools
  // array so the web_search tool definition cost is amortized.
  const createBrief = () => {
    const client = getAnthropic();
    return client.messages.create({
      model: MODEL_ID,
      // 8192 gives clean headroom for the memo-depth JSON. The model previously
      // truncated mid-JSON at ~position 13k with max_tokens=4096 on rich deals.
      max_tokens: 8192,
      system: [
        {
          type: "text",
          text: BRIEF_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [
        // Server-side web search runs on Anthropic infra; sources land in `web_search_tool_result` blocks.
        // Cast keeps the SDK happy when its `Tool` union doesn't list every server-tool version.
        // max_uses=4 (was 6) — each search adds 5-10s wall-time + bloats the tool-use loop's
        // context, which both slows the route and tightens the output token budget.
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 4,
          cache_control: { type: "ephemeral" },
        } as unknown as never,
      ],
      messages: [{ role: "user", content: userMessage }],
    });
  };

  // Translate Anthropic auth failures into a clear user-facing diagnostic
  // before the outer POST catch JSON-ifies them — otherwise the UI shows
  // "401 {\"type\":\"error\",...}" which is unhelpful. Notion-side failures
  // (fetchDeal above) keep their original messages.
  let res: Awaited<ReturnType<typeof createBrief>>;
  try {
    res = await withRetry(createBrief);
  } catch (e) {
    const friendly = friendlyAnthropicAuthMessage(e);
    if (friendly) throw new Error(friendly);
    throw e;
  }

  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => ("text" in b ? (b as { text: string }).text : ""))
    .join("")
    .trim();

  let brief: Brief;
  try {
    brief = JSON.parse(extractJson(text)) as Brief;
  } catch (parseErr) {
    // Diagnostic: log enough to debug truncation/syntax issues without leaking the full memo.
    console.error(
      `[/api/brief] JSON.parse failed. text.length=${text.length}, ` +
        `stop_reason=${res.stop_reason}, tail=${JSON.stringify(text.slice(-200))}`,
    );
    throw new Error(
      `brief generation returned malformed JSON (${parseErr instanceof Error ? parseErr.message : "unknown"}). ` +
        `stop_reason=${res.stop_reason}, output length=${text.length} chars.`,
    );
  }

  // Merge web_search citations into the brief.
  const harvested = collectSources(res.content as unknown[]);
  if (harvested.length) {
    brief.sources = [...(brief.sources ?? []), ...harvested].slice(0, 12);
  }

  // Stamp the enrichment block with a real server-side timestamp. The model
  // fills the five text fields; the freshness marker must not be hallucinated.
  if (brief.enrichment) {
    brief.enrichment.sourcedAt = new Date().toISOString();
  }

  return brief;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { notionId?: string; rawText?: string };
    const key = briefDedupeKey(body);
    if (!key) {
      return NextResponse.json({ error: "provide notionId or rawText" }, { status: 400 });
    }

    const existing = inflightBriefs.get(key);
    let briefPromise: Promise<Brief>;
    if (existing) {
      console.log(`[/api/brief] dedupe hit · key=${key}`);
      briefPromise = existing;
    } else {
      briefPromise = generateBrief(body).finally(() => inflightBriefs.delete(key));
      inflightBriefs.set(key, briefPromise);
    }

    const brief = await briefPromise;
    return NextResponse.json({ brief });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
