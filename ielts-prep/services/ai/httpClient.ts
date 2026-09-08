// Error type + user-facing message mapping shared by the client's AI
// boundary. The actual outbound HTTP calls to OpenAI/Anthropic (with
// timeout + retry) no longer happen here — they moved server-side to
// supabase/functions/_shared/httpClient.ts, which is a separate Deno-only
// copy since Edge Functions can't import this RN-bundled file. This file
// now only holds what services/ai/edgeFunctionProvider.ts needs to
// classify a failed call to our own Edge Functions.

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

/** A user-friendly message for common failure classes — never leak raw
 * provider error text (which can include prompt fragments or internal
 * details) straight into the UI. */
export function friendlyAiErrorMessage(err: unknown): string {
  if (err instanceof AiRequestError) {
    if (err.status === 401 || err.status === 403) return 'Your session has expired — please sign in again.';
    if (err.status === 429) return 'You have reached today’s limit for this AI feature. Please try again tomorrow.';
    if (err.status === 503) return 'Real AI evaluation is not set up on the server yet — showing a simulated result instead.';
    if (err.status && err.status >= 500) return 'The AI service is temporarily unavailable. Please try again shortly.';
    if (err.message.includes('timed out')) return 'The AI request took too long and timed out. Please try again.';
  }
  return 'Something went wrong reaching the AI service.';
}
