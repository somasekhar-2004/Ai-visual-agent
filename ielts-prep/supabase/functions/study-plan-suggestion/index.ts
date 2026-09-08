// Generates an optional short AI note (focus summary + motivational note)
// for a student's study plan, using the same real-performance signals as
// the deterministic plan builder (services/repository/studyPlan.ts). This
// endpoint exists so a future UI can layer an AI-written note on top of the
// existing heuristic plan without another security migration — the mobile
// app does not currently call it (the study plan screen's logic was not
// changed as part of this migration), but it follows the exact same
// auth/validation/rate-limit/logging contract as every other AI function
// here so it's ready to wire in.
import { getConfiguredTextProvider, runStudyPlanSuggestion } from '../_shared/aiProviders.ts';
import { handleCorsPreflight } from '../_shared/cors.ts';
import { friendlyAiErrorMessage } from '../_shared/httpClient.ts';
import { checkRateLimit, recordUsage } from '../_shared/rateLimit.ts';
import { errorResponse, jsonResponse } from '../_shared/responses.ts';
import { StudyPlanSuggestionRequestSchema, StudyPlanSuggestionSchema } from '../_shared/schemas.ts';
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
  const parsedInput = StudyPlanSuggestionRequestSchema.safeParse(body);
  if (!parsedInput.success) return errorResponse(400, 'invalid_request', 'Request failed validation.', parsedInput.error.flatten());

  const provider = getConfiguredTextProvider();
  if (!provider) return errorResponse(503, 'ai_not_configured', 'No AI provider is configured on the server yet.');

  const rateLimit = await checkRateLimit(supabase, user, 'study_plan_suggestion');
  if (!rateLimit.allowed) {
    return errorResponse(429, 'rate_limited', `Daily study plan suggestion limit reached (${rateLimit.used}/${rateLimit.limit}). Try again tomorrow.`);
  }

  try {
    const raw = await runStudyPlanSuggestion(provider, parsedInput.data.context, parsedInput.data.weakQuestionTypeBySkill, parsedInput.data.weakGrammarTopic);
    const parsedOutput = StudyPlanSuggestionSchema.safeParse(JSON.parse(raw));
    if (!parsedOutput.success) {
      await recordUsage(supabase, user, 'study_plan_suggestion', provider, false);
      return errorResponse(502, 'invalid_ai_output', 'The AI provider returned a response that failed validation.', parsedOutput.error.flatten());
    }
    await recordUsage(supabase, user, 'study_plan_suggestion', provider, true);
    return jsonResponse({ result: parsedOutput.data, provider });
  } catch (err) {
    await recordUsage(supabase, user, 'study_plan_suggestion', provider, false);
    console.error('[study-plan-suggestion] provider call failed:', err);
    return errorResponse(502, 'upstream_error', friendlyAiErrorMessage(err));
  }
});
