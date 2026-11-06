// Evaluates an IELTS Speaking transcript with a real AI provider. See
// evaluate-writing/index.ts for the identical structure this follows.
//
// RECOVERY NOTE (added 2026-11-06, Bandpath recovery session): the
// operationId idempotency check below was missing from this git branch's
// copy of this file — recovered verbatim from the live "Bandpath IELTS"
// project (v10, last updated 2026-10-29T11:22:59Z) via the Supabase
// Management API (read-only token).
import { getConfiguredTextProvider, runSpeakingEval } from '../_shared/aiProviders.ts';
import { claimOrGetCachedResult, recordOperationFailure, recordOperationSuccess } from '../_shared/aiOperations.ts';
import { handleCorsPreflight } from '../_shared/cors.ts';
import { healthCheckResponse, isHealthCheckPing } from '../_shared/healthCheck.ts';
import { friendlyAiErrorMessage } from '../_shared/httpClient.ts';
import { verifyMockAttemptOwnership } from '../_shared/mockAttempt.ts';
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
  if (isHealthCheckPing(body)) return healthCheckResponse(getConfiguredTextProvider());

  const parsedInput = SpeakingEvalRequestSchema.safeParse(body);
  if (!parsedInput.success) return errorResponse(400, 'invalid_request', 'Request failed validation.', parsedInput.error.flatten());

  // A claimed mockAttemptId is never trusted by itself — it must resolve to
  // a real mock_attempts row owned by this exact authenticated user (RLS +
  // an explicit ownership check; see _shared/mockAttempt.ts). Anything else
  // (missing, forged, someone else's id) is rejected outright rather than
  // silently downgraded to Practice — a mismatched id here means the
  // client is confused or tampering, not that this is a normal Practice
  // request.
  const { mockAttemptId, operationId } = parsedInput.data;
  let verifiedMockAttemptId: string | null = null;
  if (mockAttemptId != null) {
    const ok = await verifyMockAttemptOwnership(supabase, user, mockAttemptId);
    if (!ok) return errorResponse(403, 'invalid_mock_attempt', 'The referenced mock attempt does not exist or does not belong to you.');
    verifiedMockAttemptId = mockAttemptId;
  }
  const isMock = verifiedMockAttemptId != null;
  const operation = isMock ? 'speaking_eval_mock' : 'speaking_eval_practice';

  // See evaluate-writing/index.ts's identical check for the full
  // reasoning — must run before the rate limit and before the provider.
  if (operationId) {
    const decision = await claimOrGetCachedResult(supabase, user, operationId, 'speaking_eval');
    if (decision.action === 'return_cached') {
      return jsonResponse({ result: decision.result, provider: decision.provider });
    }
    if (decision.action === 'in_progress') {
      return errorResponse(409, 'operation_in_progress', 'This submission is still being evaluated — please wait a moment and try again.');
    }
  }

  const provider = getConfiguredTextProvider();
  if (!provider) return errorResponse(503, 'ai_not_configured', 'No AI provider is configured on the server yet.');

  const rateLimit = await checkRateLimit(supabase, user, operation);
  if (!rateLimit.allowed) {
    const label = isMock ? 'Daily Full Mock Speaking evaluation limit' : 'Daily Speaking evaluation limit';
    if (operationId) await recordOperationFailure(supabase, user, operationId, 'rate_limited');
    return errorResponse(429, 'rate_limited', `${label} reached (${rateLimit.used}/${rateLimit.limit}). Try again tomorrow.`);
  }

  try {
    const raw = await runSpeakingEval(provider, parsedInput.data);
    const parsedOutput = SpeakingEvaluationSchema.safeParse(JSON.parse(raw));
    if (!parsedOutput.success) {
      await recordUsage(supabase, user, operation, provider, false, verifiedMockAttemptId);
      if (operationId) await recordOperationFailure(supabase, user, operationId, 'invalid_ai_output');
      return errorResponse(502, 'invalid_ai_output', 'The AI provider returned a response that failed validation.', parsedOutput.error.flatten());
    }
    await recordUsage(supabase, user, operation, provider, true, verifiedMockAttemptId);
    if (operationId) await recordOperationSuccess(supabase, user, operationId, parsedOutput.data, provider);
    return jsonResponse({ result: parsedOutput.data, provider });
  } catch (err) {
    await recordUsage(supabase, user, operation, provider, false, verifiedMockAttemptId);
    if (operationId) await recordOperationFailure(supabase, user, operationId, (err as Error).message);
    console.error('[evaluate-speaking] provider call failed:', err);
    return errorResponse(502, 'upstream_error', friendlyAiErrorMessage(err));
  }
});
