// Ported from services/ai/httpClient.ts (the mobile app's copy) — timeout +
// retry wrapper for outbound calls to the real AI provider. Kept behavior-
// identical (same timeout/backoff/retryable-status rules) so moving the
// call server-side doesn't change reliability characteristics.
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 600;

export class AiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
    public readonly retryable: boolean
  ) {
    super(message);
    this.name = 'AiRequestError';
  }
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  opts: { timeoutMs?: number; maxAttempts?: number } = {}
): Promise<Response> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = opts.maxAttempts ?? MAX_ATTEMPTS;

  let lastError: AiRequestError = new AiRequestError('Request failed', null, true);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return res;

      const bodyText = await res.text().catch(() => '');
      const retryable = isRetryableStatus(res.status);
      lastError = new AiRequestError(`Request failed: ${res.status} ${bodyText}`.slice(0, 500), res.status, retryable);
      if (!retryable || attempt === maxAttempts) throw lastError;
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof AiRequestError) {
        if (!err.retryable || attempt === maxAttempts) throw err;
        lastError = err;
      } else {
        const aborted = err instanceof Error && err.name === 'AbortError';
        lastError = new AiRequestError(aborted ? 'Request timed out' : (err as Error).message, null, true);
        if (attempt === maxAttempts) throw lastError;
      }
    }
    await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1));
  }
  throw lastError;
}

/** A user-friendly message for common failure classes — never leak raw
 * provider error text (which can include prompt fragments or internal
 * details) into a client-facing response. */
export function friendlyAiErrorMessage(err: unknown): string {
  if (err instanceof AiRequestError) {
    if (err.status === 401 || err.status === 403) return 'The AI provider rejected the request — its API key may be invalid.';
    if (err.status === 429) return 'The AI provider is rate-limiting requests right now. Please try again shortly.';
    if (err.status && err.status >= 500) return 'The AI provider is temporarily unavailable. Please try again shortly.';
    if (err.message.includes('timed out')) return 'The AI request took too long and timed out. Please try again.';
  }
  return 'Something went wrong reaching the AI provider.';
}
