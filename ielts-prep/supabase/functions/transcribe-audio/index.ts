// Transcribes a recorded speaking-test answer. The mobile client reads the
// local recording as base64 (expo-file-system/legacy) and sends it as JSON
// — see services/ai/edgeFunctionProvider.ts. OpenAI (Whisper) and Gemini
// (general multimodal generateContent) are wired for this; if only an
// Anthropic key is configured server-side, this returns ai_not_configured so
// the client falls back to its own simulated transcript, exactly like a
// missing key does for the other operations.
import { getConfiguredTranscriptionProvider, transcribeWithGemini, transcribeWithOpenAi } from '../_shared/aiProviders.ts';
import { handleCorsPreflight } from '../_shared/cors.ts';
import { healthCheckResponse, isHealthCheckPing } from '../_shared/healthCheck.ts';
import { friendlyAiErrorMessage } from '../_shared/httpClient.ts';
import { checkRateLimit, recordUsage } from '../_shared/rateLimit.ts';
import { errorResponse, jsonResponse } from '../_shared/responses.ts';
import { TranscribeRequestSchema } from '../_shared/schemas.ts';
import { requireUser } from '../_shared/supabaseClient.ts';

// A generous ceiling well above any realistic single spoken answer, to
// bound decoded-audio memory use regardless of what a client sends.
const MAX_AUDIO_BASE64_CHARS = 20_000_000; // ~15MB decoded

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

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
  if (isHealthCheckPing(body)) return healthCheckResponse(getConfiguredTranscriptionProvider());

  const parsedInput = TranscribeRequestSchema.safeParse(body);
  if (!parsedInput.success) return errorResponse(400, 'invalid_request', 'Request failed validation.', parsedInput.error.flatten());
  if (parsedInput.data.audioBase64.length > MAX_AUDIO_BASE64_CHARS) {
    return errorResponse(413, 'payload_too_large', 'Audio recording is too large to transcribe.');
  }

  const provider = getConfiguredTranscriptionProvider();
  if (!provider) return errorResponse(503, 'ai_not_configured', 'Transcription is not configured on the server yet.');

  const rateLimit = await checkRateLimit(supabase, user, 'transcription');
  if (!rateLimit.allowed) {
    return errorResponse(429, 'rate_limited', `Daily transcription limit reached (${rateLimit.used}/${rateLimit.limit}). Try again tomorrow.`);
  }

  try {
    const text =
      provider === 'gemini'
        ? await transcribeWithGemini(parsedInput.data.audioBase64, parsedInput.data.mimeType)
        : await transcribeWithOpenAi(decodeBase64(parsedInput.data.audioBase64), parsedInput.data.mimeType);
    await recordUsage(supabase, user, 'transcription', provider, true);
    return jsonResponse({ text, provider });
  } catch (err) {
    await recordUsage(supabase, user, 'transcription', provider, false);
    console.error('[transcribe-audio] provider call failed:', err);
    return errorResponse(502, 'upstream_error', friendlyAiErrorMessage(err));
  }
});
