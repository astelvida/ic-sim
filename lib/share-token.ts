// Stateless share tokens — the URL IS the payload. base64url-encoded JSON of
// the SharePayload type. No KV, no DB, no row to mutate later: deferred per
// the iteration's "no new infra" constraint.
//
// Tradeoffs intentional:
//   - The link is immutable. A user who wants to redact a strength has to
//     re-share; the old link lives forever.
//   - Anyone with the link can read the payload. Treat shares as public.
//   - URL length ≈ 700-1100 chars. Fine for Twitter/LinkedIn/iMessage; some
//     enterprise email clients add an aggressive "this URL is suspicious"
//     interstitial above ~2,000 chars, but we never approach that ceiling.
//
// `Buffer.from(..., "base64url")` is built into Node 16+. We never need this
// helper to run in the browser today (server-only API route + server page).

import type { SharePayload } from "./types";

export function encodeShareToken(payload: SharePayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

// Returns null on any malformed input (bad base64url, not JSON, missing fields,
// wrong types). Callers should render a friendly fallback rather than throwing.
export function decodeShareToken(token: string): SharePayload | null {
  if (!token || token.length > 4000) return null;
  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(json);
    if (!isSharePayload(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isSharePayload(v: unknown): v is SharePayload {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  if (
    typeof p.company !== "string" ||
    typeof p.sector !== "string" ||
    typeof p.overall !== "number" ||
    typeof p.summary !== "string" ||
    typeof p.dateISO !== "string"
  ) {
    return false;
  }
  if (!Array.isArray(p.improvementNotes)) return false;
  if (!p.improvementNotes.every((n): n is string => typeof n === "string")) return false;
  if (!p.scores || typeof p.scores !== "object") return false;
  const s = p.scores as Record<string, unknown>;
  return (
    typeof s.convictionClarity === "number" &&
    typeof s.riskAck === "number" &&
    typeof s.dataDensity === "number" &&
    typeof s.thesisAlignment === "number" &&
    typeof s.poise === "number"
  );
}
