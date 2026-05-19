// Strips a fenced ```json ... ``` block if present, otherwise slices from the
// first "{" to the last "}". Defensive helper for parsing model JSON output —
// every JSON-returning system prompt instructs the model NOT to wrap in fences,
// but models occasionally still do.
export function extractJson(s: string): string {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1) return s.slice(first, last + 1);
  return s;
}
