import { getAnthropic, MODEL_ID } from "@/lib/anthropic";
import { COMMITTEE_BY_ID } from "@/lib/committee";
import type { Brief, MemberId, Turn } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Payload {
  memberId: MemberId;
  brief: Brief;
  turns: Turn[];
}

export async function POST(req: Request) {
  const { memberId, brief, turns } = (await req.json()) as Payload;
  const member = COMMITTEE_BY_ID[memberId];
  if (!member) {
    return new Response("unknown member", { status: 400 });
  }

  // Build the conversation: map presenter turns to "user", member turns to "assistant"
  // (one shared assistant voice is fine — each member call has its own system prompt).
  const messages = turns
    .filter((t) => t.text.trim().length > 0)
    .map((t) => ({
      role: t.role === "presenter" ? ("user" as const) : ("assistant" as const),
      content:
        t.role === "member" && t.memberId && t.memberId !== memberId
          ? `[${COMMITTEE_BY_ID[t.memberId]?.archetype ?? "Committee"}]: ${t.text}`
          : t.text,
    }));

  // If the conversation is empty or starts with assistant, seed with a kickoff user turn.
  if (messages.length === 0 || messages[0].role !== "user") {
    messages.unshift({
      role: "user",
      content: "The presenter has just taken their seat. Open with your first question.",
    });
  }

  const client = getAnthropic();
  const stream = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 800,
    system: member.systemPrompt(brief),
    messages,
    stream: true,
  });

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
