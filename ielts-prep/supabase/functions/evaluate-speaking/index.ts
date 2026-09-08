// Evaluates an IELTS Speaking transcript with a real AI provider. See
// evaluate-writing/index.ts for the identical structure this follows.
import { getConfiguredTextProvider, runSpeakingEval } from '../_shared/aiProviders.ts';
import { handleCorsPreflight } from '../_shared/cors.ts';
import { friendlyAiErrorMessage } from '../_shared/httpClient.ts';
import { checkRateLimit, recordUsage } from '../_shared/rateLimit.ts';
import { errorResponse, jsonResponse } from '../_shared/responses.ts';
import { SpeakingEvalRequestSchema, SpeakingEvaluationSchema } from '../_shared/schemas.ts';
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
  const parsedInput = SpeakingEvalRequestSchema.safeParse(body);
  if (!parsedInput.success) return errorResponse(400, 'invalid_request', 'Request failed validation.', parsedInput.error.flatten());

  const provider = getConfiguredTextProvider();
  if (!provider) return errorResponse(503, 'ai_not_configured', 'No AI provider is configured on the server yet.');

  const rateLimit = await checkRateLimit(supabase, user, 'speaking_eval');
  if (!rateLimit.allowed) {
    return errorResponse(429, 'rate_limited', `Daily Speaking evaluation limit reached (${rateLimit.used}/${rateLimit.limit}). Try again tomorrow.`);
  }

  try {
    const raw = await runSpeakingEval(provider, parsedInput.data);
    const parsedOutput = SpeakingEvaluationSchema.safeParse(JSON.parse(raw));
    if (!parsedOutput.success) {
      await recordUsage(supabase, user, 'speaking_eval', provider, false);
      return errorResponse(502, 'invalid_ai_output', 'The AI provider returned a response that failed validation.', parsedOutput.error.flatten());
    }
    await recordUsage(supabase, user, 'speaking_eval', provider, true);
    return jsonResponse({ result: parsedOutput.data, provider });
  } catch (err) {
    await recordUsage(supabase, user, 'speaking_eval', provider, false);
    console.error('[evaluate-speaking] provider call failed:', err);
    return errorResponse(502, 'upstream_error', friendlyAiErrorMessage(err));
  }
});
