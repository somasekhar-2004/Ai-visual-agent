// Generates one AI Coach chat reply. The conversation itself (its title,
// messages) is persisted by the mobile client directly to Supabase
// (services/repository/social.ts, RLS-protected) — this function is
// stateless and only turns a message history + student context into the
// next reply.
import { getConfiguredTextProvider, runChat } from '../_shared/aiProviders.ts';
import { handleCorsPreflight } from '../_shared/cors.ts';
import { healthCheckResponse, isHealthCheckPing } from '../_shared/healthCheck.ts';
import { friendlyAiErrorMessage } from '../_shared/httpClient.ts';
import { checkRateLimit, recordUsage } from '../_shared/rateLimit.ts';
import { errorResponse, jsonResponse } from '../_shared/responses.ts';
import { AiCoachRequestSchema } from '../_shared/schemas.ts';
import { requireUser } from '../_shared/supabaseClient.ts';

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;
  if (req.method !== 'POST') return errorResponse(405, 'method_not_allowed', 'Use POST.');

  const auth = await requireUser(req);
  if ('error' in auth) return errorResponse(401, 'unauthorized', auth.error);
  const { user, supabase } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'invalid_json', 'Request body must be valid JSON.');
  }
  if (isHealthCheckPing(body)) return healthCheckResponse(getConfiguredTextProvider());

  const parsedInput = AiCoachRequestSchema.safeParse(body);
  if (!parsedInput.success) return errorResponse(400, 'invalid_request', 'Request failed validation.', parsedInput.error.flatten());

  const provider = getConfiguredTextProvider();
  if (!provider) return errorResponse(503, 'ai_not_configured', 'No AI provider is configured on the server yet.');

  const rateLimit = await checkRateLimit(supabase, user, 'ai_coach');
  if (!rateLimit.allowed) {
    return errorResponse(429, 'rate_limited', `Daily AI Coach message limit reached (${rateLimit.used}/${rateLimit.limit}). Try again tomorrow.`);
  }

  try {
    const reply = await runChat(provider, parsedInput.data.messages, parsedInput.data.context);
    await recordUsage(supabase, user, 'ai_coach', provider, true);
    return jsonResponse({ reply, provider });
  } catch (err) {
    await recordUsage(supabase, user, 'ai_coach', provider, false);
    console.error('[ai-coach] provider call failed:', err);
    return errorResponse(502, 'upstream_error', friendlyAiErrorMessage(err));
  }
});
