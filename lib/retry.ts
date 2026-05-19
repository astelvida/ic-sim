// Retry with exponential backoff for Anthropic SDK calls.
// Retries only on transient server errors (5xx / 529 overloaded).
// 4xx errors are caller bugs — never retry those.

interface AnthropicError {
  status?: number;
  message?: string;
}

function isRetryable(e: unknown): boolean {
  const err = e as AnthropicError;
  const status = err?.status;
  return typeof status === "number" && (status >= 500 || status === 529);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const base = opts.baseDelayMs ?? 400;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isRetryable(e) || i === attempts - 1) throw e;
      // 400ms, 1200ms, 3600ms with mild jitter
      const delay = base * Math.pow(3, i) + Math.random() * 200;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
