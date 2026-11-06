// The only place in this whole system that reads a real AI provider's
// secret key. These are plain (non-EXPO_PUBLIC_) environment variables set
// via `supabase secrets set` — see supabase/functions/.env.example — so
// they exist only in the Edge Function runtime and are never bundled into
// the mobile app or sent to a client in any response.
import { fetchWithRetry } from './httpClient.ts';
import { buildCoachSystemPrompt, buildSpeakingEvalPrompt, buildStudyPlanSuggestionPrompt, buildTranscriptionPromptText, buildWritingEvalPrompt } from './prompts.ts';
import type { CoachContext, SpeakingEvalRequest, WritingEvalRequest } from './schemas.ts';

export type ProviderName = 'openai' | 'anthropic' | 'gemini';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';
const ANTHROPIC_MODEL = Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-5';
// gemini-2.0-flash is on the free Gemini Developer API tier at the time this
// was written and supports responseMimeType: 'application/json' for
// structured output — check https://ai.google.dev/pricing for the current
// free-tier model list before relying on this default in production, and
// override with GEMINI_MODEL if it has changed.
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-2.0-flash';
// Transcription reuses GEMINI_MODEL by default (Gemini's flash-tier models
// are natively multimodal — text, audio, image, video in one generateContent
// call — and this exact model is already confirmed working live for
// evaluate-writing/evaluate-speaking/ai-coach/study-plan-suggestion). A
// dedicated "gemini-3.5-transcribe" model exists for higher-accuracy
// transcription with diarization/word timestamps, but it ships on a
// different API surface (the Interactions API, not generateContent) and is
// not on the free tier — not used here; override GEMINI_TRANSCRIBE_MODEL
// independently if you want to point transcription at it or another model
// later without changing the eval/chat model.
const GEMINI_TRANSCRIBE_MODEL = Deno.env.get('GEMINI_TRANSCRIBE_MODEL') || GEMINI_MODEL;
// Which provider to prefer when multiple keys happen to be set. Defaults to
// openai for backwards compatibility, but transcription now also works with
// AI_PROVIDER=gemini — see getConfiguredTranscriptionProvider below.
const PREFERRED_PROVIDER = (Deno.env.get('AI_PROVIDER') as ProviderName | undefined) || 'openai';

const OPENAI_BASE = 'https://api.openai.com/v1';
const ANTHROPIC_BASE = 'https://api.anthropic.com/v1';
const ANTHROPIC_VERSION = '2023-06-01';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/** Returns the provider to use for text generation, or null if no key is
 * configured at all — callers must treat null as "AI not configured on the
 * server" and respond accordingly (never crash, never fall back to a fake
 * result: the mobile client's own mock provider is the fallback). */
export function getConfiguredTextProvider(): ProviderName | null {
  if (PREFERRED_PROVIDER === 'gemini' && GEMINI_API_KEY) return 'gemini';
  if (PREFERRED_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY) return 'anthropic';
  if (PREFERRED_PROVIDER === 'openai' && OPENAI_API_KEY) return 'openai';
  if (OPENAI_API_KEY) return 'openai';
  if (ANTHROPIC_API_KEY) return 'anthropic';
  if (GEMINI_API_KEY) return 'gemini';
  return null;
}

export type TranscriptionProviderName = 'openai' | 'gemini';

/** OpenAI (Whisper) and Gemini (general multimodal generateContent) are
 * wired for transcription — Anthropic has no audio API. Mirrors
 * getConfiguredTextProvider's preference logic: explicit AI_PROVIDER=gemini
 * is honored even when an OpenAI key also happens to be set, otherwise
 * OpenAI is preferred for backwards compatibility with existing deployments. */
export function getConfiguredTranscriptionProvider(): TranscriptionProviderName | null {
  if (PREFERRED_PROVIDER === 'gemini' && GEMINI_API_KEY) return 'gemini';
  if (OPENAI_API_KEY) return 'openai';
  if (GEMINI_API_KEY) return 'gemini';
  return null;
}

function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

async function openAiChatCompletion(userContent: string, systemContent?: string): Promise<string> {
  const messages = systemContent ? [{ role: 'system', content: systemContent }, { role: 'user', content: userContent }] : [{ role: 'user', content: userContent }];
  const res = await fetchWithRetry(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: OPENAI_MODEL, messages, temperature: 0.4, response_format: { type: 'json_object' } }),
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI response missing content');
  return text;
}

async function anthropicMessages(userContent: string, systemContent: string | undefined, maxTokens = 1024): Promise<string> {
  const res = await fetchWithRetry(`${ANTHROPIC_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      ...(systemContent ? { system: systemContent } : {}),
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Anthropic response missing content');
  return text;
}

type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };
type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };

async function geminiGenerateContent(
  contents: GeminiContent[],
  systemContent: string | undefined,
  jsonMode: boolean,
  temperature = 0.4,
  model = GEMINI_MODEL,
  timeoutMs?: number,
  maxAttempts?: number
): Promise<string> {
  const body: Record<string, unknown> = {
    contents,
    generationConfig: { temperature, ...(jsonMode ? { responseMimeType: 'application/json' } : {}) },
    ...(systemContent ? { systemInstruction: { parts: [{ text: systemContent }] } } : {}),
  };
  const res = await fetchWithRetry(
    `${GEMINI_BASE}/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify(body),
    },
    timeoutMs || maxAttempts ? { ...(timeoutMs ? { timeoutMs } : {}), ...(maxAttempts ? { maxAttempts } : {}) } : undefined
  );
  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text: string | undefined = candidate?.content?.parts?.map((p: GeminiPart) => p.text ?? '').join('');
  if (!text) {
    // A missing candidate with no error status usually means the response was
    // blocked by Gemini's safety filters (finishReason: SAFETY) rather than a
    // network/auth failure — surface that distinctly rather than a generic error.
    const finishReason = candidate?.finishReason;
    throw new Error(finishReason ? `Gemini response had no content (finishReason: ${finishReason})` : 'Gemini response missing content');
  }
  return text;
}

/** Runs a JSON-shaped evaluation prompt against whichever provider is
 * configured and returns the raw JSON text — the caller (each function's
 * index.ts) is responsible for Zod-validating it before trusting it. */
export async function runJsonPrompt(provider: ProviderName, prompt: string): Promise<string> {
  if (provider === 'openai') return openAiChatCompletion(prompt);
  if (provider === 'gemini') {
    const text = await geminiGenerateContent([{ role: 'user', parts: [{ text: prompt }] }], undefined, true);
    return extractJson(text);
  }
  const text = await anthropicMessages(prompt, undefined);
  return extractJson(text);
}

export function runWritingEval(provider: ProviderName, input: WritingEvalRequest): Promise<string> {
  return runJsonPrompt(provider, buildWritingEvalPrompt(input));
}

export function runSpeakingEval(provider: ProviderName, input: SpeakingEvalRequest): Promise<string> {
  return runJsonPrompt(provider, buildSpeakingEvalPrompt(input));
}

export function runStudyPlanSuggestion(
  provider: ProviderName,
  context: CoachContext,
  weakQuestionTypeBySkill: Record<string, string> | undefined,
  weakGrammarTopic: string | null | undefined
): Promise<string> {
  return runJsonPrompt(provider, buildStudyPlanSuggestionPrompt(context, weakQuestionTypeBySkill, weakGrammarTopic));
}

/** Chat has its own path (not JSON-mode) since it returns free text, not a
 * structured object. */
export async function runChat(provider: ProviderName, messages: { role: string; content: string }[], context: CoachContext): Promise<string> {
  const system = buildCoachSystemPrompt(context);
  if (provider === 'openai') {
    const res = await fetchWithRetry(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'system', content: system }, ...messages], temperature: 0.6 }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI response missing content');
    return text;
  }
  if (provider === 'gemini') {
    // Gemini's contents array only accepts 'user'/'model' roles — a 'system'
    // role in the conversation (there isn't one today, but defensively
    // handled) is dropped since systemContent already carries instructions.
    const contents: GeminiContent[] = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    return geminiGenerateContent(contents, system, false, 0.6);
  }
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const transcript = messages.map((m) => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`).join('\n');
  const prompt = `${transcript}\n\nRespond as the Coach to the student's latest message: "${lastUser}"`;
  return anthropicMessages(prompt, system);
}

// RECOVERY NOTE (added 2026-11-06, Bandpath recovery session): this comment
// and TRANSCRIPTION_MAX_ATTEMPTS were missing from this git branch's copy of
// aiProviders.ts — recovered verbatim from the live "Bandpath IELTS" project
// (kudgtxdwbpfqobteyeqy) via the Supabase Management API (read-only token).
// Confirmed this file's rest (fetchWithRetry's own 3-attempt default) was
// already present and unchanged from this recovered version.
//
// Supabase Edge Functions have a 150-SECOND WALL-CLOCK REQUEST-IDLE
// TIMEOUT ON EVERY PLAN (not just free) — see
// https://supabase.com/docs/guides/troubleshooting/edge-function-wall-clock-time-limit-reached-Nk38bW
// and https://github.com/orgs/supabase/discussions/40074 — the platform
// itself kills a function that takes longer than that, independent of
// anything the client does. fetchWithRetry's SHARED default (3 attempts
// at a per-call timeoutMs, with exponential backoff between them) is
// fine for the fast JSON-eval calls (3×30s + backoff ≈ 91.8s worst case,
// safely under 150s), but transcription's per-attempt timeout is a much
// longer 60s — 3 full attempts there would have a worst case of ≈181.8s,
// which EXCEEDS the platform ceiling. That means the function could be
// killed mid-retry before it ever reaches its own final success/failure
// logic — and if the platform kill happens while the outbound fetch to
// the provider is still in flight, the provider may still finish (and
// bill for) that response with zero record of it on our side. Capping
// transcription at 2 attempts brings its worst case down to
// 60_000*2 + 600 ≈ 120.6s, comfortably under 150s with real margin left
// for the rest of the function's own overhead (auth, rate-limit check,
// idempotency claim — see aiOperations.ts).
const TRANSCRIPTION_MAX_ATTEMPTS = 2;

export async function transcribeWithOpenAi(audioBytes: Uint8Array, mimeType: string): Promise<string> {
  const ext = mimeType.includes('mp4') || mimeType.includes('m4a') ? 'm4a' : mimeType.includes('wav') ? 'wav' : 'm4a';
  const form = new FormData();
  form.append('file', new Blob([audioBytes as BlobPart], { type: mimeType }), `speech.${ext}`);
  form.append('model', 'whisper-1');

  const res = await fetchWithRetry(
    `${OPENAI_BASE}/audio/transcriptions`,
    { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }, body: form },
    { timeoutMs: 60_000, maxAttempts: TRANSCRIPTION_MAX_ATTEMPTS }
  );
  const data = await res.json();
  if (!data.text) throw new Error('OpenAI transcription response missing text');
  return data.text as string;
}

/** Transcribes via a general-purpose multimodal Gemini model's generateContent
 * endpoint (inline base64 audio + a verbatim-transcription instruction) —
 * the same endpoint and model already used for every other Gemini operation
 * here, rather than the separate, non-free-tier "gemini-3.5-transcribe"
 * model (which also ships on a different API, the Interactions API, not
 * generateContent). `audioBase64` is passed straight through from the
 * client's own base64 payload — no decode/re-encode round trip needed,
 * since Gemini's inlineData wants base64 too (unlike OpenAI's multipart
 * upload, which needs raw bytes). */
export async function transcribeWithGemini(audioBase64: string, mimeType: string): Promise<string> {
  const contents: GeminiContent[] = [
    { role: 'user', parts: [{ text: buildTranscriptionPromptText() }, { inlineData: { mimeType, data: audioBase64 } }] },
  ];
  const text = await geminiGenerateContent(contents, undefined, false, 0, GEMINI_TRANSCRIBE_MODEL, 60_000, TRANSCRIPTION_MAX_ATTEMPTS);
  const trimmed = text.trim().replace(/^["']|["']$/g, '');
  if (!trimmed) throw new Error('Gemini transcription response was empty');
  return trimmed;
}
