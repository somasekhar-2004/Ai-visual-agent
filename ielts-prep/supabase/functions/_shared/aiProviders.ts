// The only place in this whole system that reads a real AI provider's
// secret key. These are plain (non-EXPO_PUBLIC_) environment variables set
// via `supabase secrets set` — see supabase/functions/.env.example — so
// they exist only in the Edge Function runtime and are never bundled into
// the mobile app or sent to a client in any response.
import { fetchWithRetry } from './httpClient.ts';
import { buildCoachSystemPrompt, buildSpeakingEvalPrompt, buildStudyPlanSuggestionPrompt, buildWritingEvalPrompt } from './prompts.ts';
import type { CoachContext, SpeakingEvalRequest, WritingEvalRequest } from './schemas.ts';

export type ProviderName = 'openai' | 'anthropic';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';
const ANTHROPIC_MODEL = Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-5';
// Which provider to prefer when both keys happen to be set. Defaults to
// openai since it's also the only one that supports transcription.
const PREFERRED_PROVIDER = (Deno.env.get('AI_PROVIDER') as ProviderName | undefined) || 'openai';

const OPENAI_BASE = 'https://api.openai.com/v1';
const ANTHROPIC_BASE = 'https://api.anthropic.com/v1';
const ANTHROPIC_VERSION = '2023-06-01';

/** Returns the provider to use for text generation, or null if no key is
 * configured at all — callers must treat null as "AI not configured on the
 * server" and respond accordingly (never crash, never fall back to a fake
 * result: the mobile client's own mock provider is the fallback). */
export function getConfiguredTextProvider(): ProviderName | null {
  if (PREFERRED_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY) return 'anthropic';
  if (OPENAI_API_KEY) return 'openai';
  if (ANTHROPIC_API_KEY) return 'anthropic';
  return null;
}

/** Only OpenAI (Whisper) is wired for transcription — Anthropic has no
 * audio API. */
export function getConfiguredTranscriptionProvider(): 'openai' | null {
  return OPENAI_API_KEY ? 'openai' : null;
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

/** Runs a JSON-shaped evaluation prompt against whichever provider is
 * configured and returns the raw JSON text — the caller (each function's
 * index.ts) is responsible for Zod-validating it before trusting it. */
export async function runJsonPrompt(provider: ProviderName, prompt: string): Promise<string> {
  if (provider === 'openai') return openAiChatCompletion(prompt);
  const text = await anthropicMessages(prompt, undefined);
  return extractJson(text);
}

export async function runWritingEval(provider: ProviderName, input: WritingEvalRequest): Promise<string> {
  return runJsonPrompt(provider, buildWritingEvalPrompt(input));
}

export async function runSpeakingEval(provider: ProviderName, input: SpeakingEvalRequest): Promise<string> {
  return runJsonPrompt(provider, buildSpeakingEvalPrompt(input));
}

export async function runStudyPlanSuggestion(
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
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const transcript = messages.map((m) => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`).join('\n');
  const prompt = `${transcript}\n\nRespond as the Coach to the student's latest message: "${lastUser}"`;
  return anthropicMessages(prompt, system);
}

export async function transcribeWithOpenAi(audioBytes: Uint8Array, mimeType: string): Promise<string> {
  const ext = mimeType.includes('mp4') || mimeType.includes('m4a') ? 'm4a' : mimeType.includes('wav') ? 'wav' : 'm4a';
  const form = new FormData();
  form.append('file', new Blob([audioBytes], { type: mimeType }), `speech.${ext}`);
  form.append('model', 'whisper-1');

  const res = await fetchWithRetry(
    `${OPENAI_BASE}/audio/transcriptions`,
    { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }, body: form },
    { timeoutMs: 60_000 }
  );
  const data = await res.json();
  if (!data.text) throw new Error('OpenAI transcription response missing text');
  return data.text as string;
}
