// A cheap, authenticated "is this function deployed and reachable, and is
// an AI provider configured" probe, used only by the mobile app's dev-only
// health-check screen (app/dev-health-check.tsx). Sending `{ healthCheck:
// true }` short-circuits every function immediately after auth — before
// Zod validation of the real payload, before rate-limit accounting, and
// long before any real AI provider call — so running it costs nothing
// (no quota consumed, no ai_usage_log row written) and never requires a
// well-formed evaluation/chat payload just to check reachability.
import { jsonResponse } from './responses.ts';

export function isHealthCheckPing(body: unknown): boolean {
  return Boolean(body && typeof body === 'object' && (body as Record<string, unknown>).healthCheck === true);
}

export function healthCheckResponse(provider: string | null): Response {
  return jsonResponse({ ok: true, provider });
}
