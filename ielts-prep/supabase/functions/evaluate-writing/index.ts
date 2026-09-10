// Evaluates an IELTS Writing submission with a real AI provider. Requires an
// authenticated Supabase session; never accessible without one. See
// supabase/functions/_shared/ for the auth/validation/rate-limit/provider
// helpers shared across every AI function.
import { getConfiguredTextProvider, runWritingEval } from '../_shared/aiProviders.ts';
import { handleCorsPreflight } from '../_shared/cors.ts';
import { healthCheckResponse, isHealthCheckPing } from '../_shared/healthCheck.ts';
import { friendlyAiErrorMessage } from '../_shared/httpClient.ts';
import { verifyMockAttemptOwnership } from '../_shared/mockAttempt.ts';
import { checkRateLimit, recordUsage } from '../_shared/rateLimit.ts';
import { errorResponse, jsonResponse } from '../_shared/responses.ts';
import { WritingEvalRequestSchema, WritingEvaluationSchema } from '../_shared/schemas.ts';
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

  const parsedInput = WritingEvalRequestSchema.safeParse(body);
  if (!parsedInput.success) return errorResponse(400, 'invalid_request', 'Request failed validation.', parsedInput.error.flatten());

  // A claimed mockAttemptId is never trusted by itself — it must resolve to
  // a real mock_attempts row owned by this exact authenticated user (RLS +
  // an explicit ownership check; see _shared/mockAttempt.ts). Anything else
  // (missing, forged, someone else's id) is rejected outright rather than
  // silently downgraded to Practice — a mismatched id here means the
  // client is confused or tampering, not that this is a normal Practice
  // request.
  const { mockAttemptId } = parsedInput.data;
  let verifiedMockAttemptId: string | null = null;
  if (mockAttemptId != null) {
    const ok = await verifyMockAttemptOwnership(supabase, user, mockAttemptId);
    if (!ok) return errorResponse(403, 'invalid_mock_attempt', 'The referenced mock attempt does not exist or does not belong to you.');
    verifiedMockAttemptId = mockAttemptId;
  }
  const isMock = verifiedMockAttemptId != null;
  const operation = isMock ? 'writing_eval_mock' : 'writing_eval_practice';

  const provider = getConfiguredTextProvider();
  if (!provider) return errorResponse(503, 'ai_not_configured', 'No AI provider is configured on the server yet.');

  const rateLimit = await checkRateLimit(supabase, user, operation);
  if (!rateLimit.allowed) {
    const label = isMock ? 'Daily Full Mock Writing evaluation limit' : 'Daily Writing evaluation limit';
    return errorResponse(429, 'rate_limited', `${label} reached (${rateLimit.used}/${rateLimit.limit}). Try again tomorrow.`);
  }

  try {
    const raw = await runWritingEval(provider, parsedInput.data);
    const parsedOutput = WritingEvaluationSchema.safeParse(JSON.parse(raw));
    if (!parsedOutput.success) {
      await recordUsage(supabase, user, operation, provider, false, verifiedMockAttemptId);
      return errorResponse(502, 'invalid_ai_output', 'The AI provider returned a response that failed validation.', parsedOutput.error.flatten());
    }
    await recordUsage(supabase, user, operation, provider, true, verifiedMockAttemptId);
    return jsonResponse({ result: parsedOutput.data, provider });
  } catch (err) {
    await recordUsage(supabase, user, operation, provider, false, verifiedMockAttemptId);
    console.error('[evaluate-writing] provider call failed:', err);
    return errorResponse(502, 'upstream_error', friendlyAiErrorMessage(err));
  }
});
