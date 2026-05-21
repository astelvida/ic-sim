import { getAnthropic, MODEL_ID } from "@/lib/anthropic";
import { COMMITTEE_BY_ID } from "@/lib/committee";
import { withRetry } from "@/lib/retry";
import type { Brief, MemberId, Turn } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Payload {
  memberId: MemberId;
  brief: Brief;
  turns: Turn[];
  // Set by the orchestrator (lib/turn-router.ts:pickNextMember) when the
  // evasion classifier scored the user's last answer ≤ 2. We prepend a small
  // non-cached system block instructing this member to re-ask the evaded
  // question, naming what was dodged. PRD §12.2.
  reaskOf?: string;
}

// Prepended as a SECOND system text block (without cache_control) so the
// cached persona prompt isn't invalidated. Sonnet 4.6 accepts multiple system
// text blocks; only those with cache_control are cached.
function reaskPreamble(reaskOf: string): string {
  return `\nIMPORTANT — RE-ASK MODE:\nThe presenter did NOT address your previous question. Re-ask it now, in a different way, naming the specific thing they dodged. Open your reply with: "You didn't address [the dodged topic] — let me re-ask:" — where [the dodged topic] is a 2-5 word handle on what was evaded (not a verbatim quote). Stay in your own voice and domain. Do not move to a new topic until they address what you originally asked.\n\nYour prior (evaded) question, for your reference only — do NOT quote verbatim:\n"""${reaskOf.trim()}"""\n`;
}

export async function POST(req: Request) {
  const { memberId, brief, turns, reaskOf } = (await req.json()) as Payload;
  const member = COMMITTEE_BY_ID[memberId];
  if (!member) {
    return new Response("unknown member", { status: 400 });
  }

  // Build the conversation. Three turn types map differently:
  //   presenter turn          -> role: "user"  (the human in the room)
  //   THIS member's prior turn -> role: "assistant" (this member's own prior speech)
  //   ANOTHER member's turn   -> role: "user"  framed as third-party context.
  //
  // The previous implementation assigned all member turns to role: "assistant" with a
  // `[ArchetypeName]:` prefix. The model treated those as its own prior outputs and
  // copied the prefix format, producing impersonation bugs (Mira opening with
  // "[The Skeptic]:" and continuing Pat's line of questioning). Framing other members'
  // turns as user-supplied context eliminates the template the model was mimicking.
  const messages = turns
    .filter((t) => t.text.trim().length > 0)
    .map((t) => {
      if (t.role === "presenter") {
        return { role: "user" as const, content: t.text };
      }
      if (t.memberId === memberId) {
        return { role: "assistant" as const, content: t.text };
      }
      const archetype =
        (t.memberId && COMMITTEE_BY_ID[t.memberId]?.archetype) || "Another partner";
      return {
        role: "user" as const,
        content: `[Earlier in the room, ${archetype} asked the presenter:]\n${t.text}`,
      };
    });

  // If the conversation is empty or starts with assistant, seed with a kickoff user turn.
  if (messages.length === 0 || messages[0].role !== "user") {
    messages.unshift({
      role: "user",
      content: "The presenter has just taken their seat. Open with your first question.",
    });
  }

  const client = getAnthropic();
  // System block + tools array are cached ephemerally. The persona prompt + briefContext
  // stays identical across all ~10 turns for a given member in a session, so the cache
  // breakpoint on the system block delivers ~90% input-cost reduction on hits (1.25x
  // write, 0.1x read). The brief is intentionally verbose enough (after the extension
  // in lib/committee.ts) to clear Sonnet 4.6's 1,024-token cacheability floor.
  const stream = await withRetry(() =>
    client.messages.create({
      model: MODEL_ID,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: member.systemPrompt(brief),
          cache_control: { type: "ephemeral" },
        },
        // Re-ask instruction (when triggered by the evasion classifier) lives in
        // a separate, non-cached block so it doesn't invalidate the persona
        // prompt's cache breakpoint. The block is short (~150 tokens) and only
        // present on re-ask turns.
        ...(reaskOf
          ? [{
              type: "text" as const,
              text: reaskPreamble(reaskOf),
            }]
          : []),
      ],
      messages,
      // Server-side web search, capped at a single use per turn. Each search
      // adds 5-10s of latency before any text streams, so the committee leans
      // on the already-enriched brief and reserves its one search for a genuine
      // fact-check (a fresh funding round, a regulatory change). The browser
      // only consumes text_delta events, so search-result blocks pass through
      // invisibly.
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 1,
          cache_control: { type: "ephemeral" },
        } as unknown as never,
      ],
      stream: true,
    }),
  );

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "stream error";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
