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
