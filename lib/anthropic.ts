import Anthropic from "@anthropic-ai/sdk";

export const MODEL_ID = "claude-sonnet-4-6";
// Smaller, ~10x cheaper model. Used only by /api/evasion for a 1-5 classification
// where we never need more than a few tokens of output and latency matters
// (the call runs on the critical path of every committee turn).
export const HAIKU_MODEL_ID = "claude-haiku-4-5-20251001";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}
