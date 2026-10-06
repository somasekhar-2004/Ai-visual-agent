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
    public readonly retryable: boolean,
    // Set only for a 429 whose body identifies it as exhausted
    // quota/billing rather than a genuine short-lived rate limit — see
    // isQuotaExceededBody below. Left undefined for every other error so
    // existing 3-arg call sites (and the AiRequestError-shaped checks
    // elsewhere) are unaffected.
    public readonly kind?: 'quota_exceeded'
  ) {
    super(message);
    this.name = 'AiRequestError';
  }
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

/**
 * Verified against each provider's own current documentation (checked
 * 2026-10-05):
 *
 * - Anthropic (platform.claude.com/docs/en/api/errors): billing/payment
 *   problems are their OWN distinct HTTP status — 402 `billing_error`, e.g.
 *   "There's an issue with your billing or payment information" — separate
 *   from 429 `rate_limit_error`. This is a clean, unambiguous, status-code
 *   level signal (see isBillingStatus below), not something that needs body
 *   inspection.
 * - OpenAI (developers.openai.com/api/docs/guides/error-codes): by
 *   contrast, OpenAI folds every 429 sub-case into the one status code —
 *   its documented table lists "Credit balance exhausted" ("Your
 *   organization has no prepaid credits remaining"), org/project spend
 *   limits, and an org usage limit as 429s DISTINCT from genuine
 *   rate-limiting ("You are sending requests too quickly" / "Your request
 *   rate increased too quickly") — confirmed by openai-python's own
 *   exception hierarchy, which has exactly one RateLimitError(429) class
 *   and no separate quota/billing exception type. Body inspection is the
 *   only way to tell these apart for OpenAI. `insufficient_quota` /
 *   "exceeded your current quota" are kept here as well — a long-
 *   established, widely-observed OpenAI error `code`/message for this same
 *   condition in real responses, even though this session's fetch of the
 *   current docs page didn't independently re-surface that exact string
 *   (the page describes the condition in prose, not the raw JSON `code`
 *   field) — kept as defensive belt-and-suspenders matching, not as
 *   something freshly confirmed today.
 *
 * KNOWN GAP: Anthropic's docs state a 429 `rate_limit_error` is also
 * returned when "your organization ... reached its usage tier's monthly
 * spend cap" — a non-transient condition retrying can't fix, same as true
 * quota exhaustion — but the error `type` string is identical to a genuine
 * rate limit; Anthropic's only documented way to tell them apart is that a
 * spend-cap 429 has no `retry-after` header. This function does not inspect
 * response headers and so cannot currently distinguish that specific case —
 * an Anthropic spend-cap condition is still (incorrectly) treated as a
 * retryable, temporary rate limit. Flagged here rather than silently
 * claimed as handled.
 */
function isQuotaExceededBody(bodyText: string): boolean {
  const lower = bodyText.toLowerCase();
  return (
    lower.includes('insufficient_quota') ||
    lower.includes('exceeded your current quota') ||
    lower.includes('credit balance is too low') ||
    lower.includes('no prepaid credits remaining') ||
    lower.includes('spend limit') ||
    lower.includes('usage limit')
  );
}

/** Anthropic's documented, unambiguous billing/payment status — see
 * isQuotaExceededBody's comment. Checked by status code alone, not body
 * text, since Anthropic's docs describe this as its own dedicated code. */
function isBillingStatus(status: number): boolean {
  return status === 402;
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
      const quotaExceeded = isBillingStatus(res.status) || (res.status === 429 && isQuotaExceededBody(bodyText));
      const retryable = isRetryableStatus(res.status) && !quotaExceeded;
      lastError = new AiRequestError(
        `Request failed: ${res.status} ${bodyText}`.slice(0, 500),
        res.status,
        retryable,
        quotaExceeded ? 'quota_exceeded' : undefined
      );
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
    if (err.kind === 'quota_exceeded') {
      // Deliberately does NOT say "try again shortly" — a retry (by the
      // user, or by fetchWithRetry above, which already skips retrying
      // this case) cannot fix an exhausted quota/billing problem. This is
      // the one AiRequestError case that needs a human to go check the AI
      // provider account, not patience.
      return 'The AI provider account has run out of quota or credit. This needs to be fixed in the provider account, not by retrying.';
    }
    if (err.status === 401 || err.status === 403) return 'The AI provider rejected the request — its API key may be invalid.';
    if (err.status === 429) return 'The AI provider is rate-limiting requests right now. Please try again shortly.';
    if (err.status && err.status >= 500) return 'The AI provider is temporarily unavailable. Please try again shortly.';
    if (err.message.includes('timed out')) return 'The AI request took too long and timed out. Please try again.';
  }
  return 'Something went wrong reaching the AI provider.';
}
