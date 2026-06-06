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

// If `error` looks like an Anthropic auth failure (missing or invalid key —
// "ANTHROPIC_API_KEY is not set" from getAnthropic above, or a 401 from the
// API itself with `authentication_error` / `x-api-key` in the body), return a
// friendly diagnostic the routes can surface verbatim. Otherwise null.
export function friendlyAnthropicAuthMessage(error: unknown): string | null {
  const raw = error instanceof Error ? error.message : "";
  if (!raw) return null;
  const isAuth = /authentication_error|x-api-key|ANTHROPIC_API_KEY|\b401\b/.test(raw);
  return isAuth
    ? "Anthropic API authentication failed (HTTP 401). The ANTHROPIC_API_KEY on this deployment is missing or invalid — set a valid key in the Vercel project settings and redeploy."
    : null;
}
