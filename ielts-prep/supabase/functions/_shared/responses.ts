import { corsHeaders } from './cors.ts';

/** Every error response uses this shape so the client can distinguish
 * failure classes (auth vs validation vs rate-limit vs upstream) instead of
 * parsing free-text messages. `code` is stable and meant to be matched on;
 * `message` is safe to show a user as-is. */
export type ApiErrorBody = { error: { code: string; message: string; details?: unknown } };

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(status: number, code: string, message: string, details?: unknown): Response {
  const body: ApiErrorBody = { error: { code, message, ...(details !== undefined ? { details } : {}) } };
  return jsonResponse(body, status);
}
