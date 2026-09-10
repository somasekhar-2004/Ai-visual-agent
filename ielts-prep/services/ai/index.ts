import { isSupabaseConfigured } from '@/lib/env';

import { EdgeFunctionProvider } from './edgeFunctionProvider';
import { friendlyAiErrorMessage } from './httpClient';
import { MockAiProvider } from './mockProvider';
import type { AiProvider, ChatMessage, CoachContext, SpeakingEvalInput, StudyPlanSuggestionInput, WritingEvalInput } from './types';
import type { SpeakingEvaluation, StudyPlanSuggestion, WritingEvaluation } from './schemas';

export { friendlyAiErrorMessage } from './httpClient';

/** Tags an AI result with whether it actually came from the configured real
 * provider or fell back to the mock — distinct from `isRealAiActive()`,
 * which only reports whether a real provider is *configured*. A single call
 * can still fall back to mock output (network error, invalid response) even
 * with a real provider configured, and the UI must reflect that specific
 * result's true source rather than assuming every result matches the
 * provider setting. */
export type AiSource = 'real' | 'mock';
export type WritingEvaluationResult = WritingEvaluation & { aiSource: AiSource };
export type SpeakingEvaluationResult = SpeakingEvaluation & { aiSource: AiSource };
export type ChatResult = { reply: string; aiSource: AiSource };
export type StudyPlanSuggestionResult = StudyPlanSuggestion & { aiSource: AiSource };

export * from './types';
export * from './schemas';

const mock = new MockAiProvider();

/** No client-side "which provider + key" decision anymore — that would mean
 * shipping a secret in the bundle, which is exactly what this architecture
 * exists to avoid. The only thing the client decides is whether a backend
 * exists to call at all:
 *  - Demo Mode (no Supabase configured): always the local mock, zero
 *    network calls, fully offline — unchanged from before.
 *  - Supabase configured: attempt the Edge Function. Whether that function
 *    actually has a real OpenAI/Anthropic key configured server-side is
 *    entirely the server's decision (via `supabase secrets set`) — if it
 *    doesn't, the function returns a clean "ai_not_configured" error and
 *    `withFallback` below falls back to mock exactly as if the call had
 *    failed for any other reason. This is what makes requirement "Demo
 *    Mode works with zero config, production AI turns on automatically
 *    once Supabase + AI credentials are both configured" true without the
 *    client needing to know anything about AI credentials at all. */
function selectConfiguredProvider(): AiProvider {
  return isSupabaseConfigured ? new EdgeFunctionProvider() : mock;
}

let provider: AiProvider = selectConfiguredProvider();

/** Returns the currently active AI provider (mock unless Supabase is configured). */
export function getAiProvider(): AiProvider {
  return provider;
}

export function getAiProviderName(): string {
  return provider.name;
}

/** True whenever a real backend is configured to attempt real AI calls —
 * NOT a guarantee any specific call actually used it, since a call can
 * still fail server-side (no AI key set, provider error) and fall back to
 * mock. Use the per-call `aiSource` on a result for that. */
export function isRealAiActive(): boolean {
  return provider.name !== 'mock';
}

async function withFallback<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<{ data: T; source: AiSource }> {
  if (provider.name === 'mock') return { data: await fallback(), source: 'mock' };
  try {
    return { data: await operation(), source: 'real' };
  } catch (err) {
    console.warn(`[ai] Real provider call failed (${friendlyAiErrorMessage(err)}), falling back to mock output:`, (err as Error).message);
    return { data: await fallback(), source: 'mock' };
  }
}

export async function evaluateWriting(input: WritingEvalInput): Promise<WritingEvaluationResult> {
  const { data, source } = await withFallback(() => provider.evaluateWriting(input), () => mock.evaluateWriting(input));
  return { ...data, aiSource: source };
}

export async function evaluateSpeaking(input: SpeakingEvalInput): Promise<SpeakingEvaluationResult> {
  const { data, source } = await withFallback(() => provider.evaluateSpeaking(input), () => mock.evaluateSpeaking(input));
  return { ...data, aiSource: source };
}

export async function chatWithCoach(messages: ChatMessage[], context: CoachContext): Promise<ChatResult> {
  const { data, source } = await withFallback(() => provider.chat(messages, context), () => mock.chat(messages, context));
  return { reply: data, aiSource: source };
}

export async function transcribeAudio(audioUri: string): Promise<string> {
  // Deliberately does NOT use withFallback's silent-mock-on-failure
  // behaviour: substituting a fabricated transcript when the real one
  // fails would let the rest of the Speaking flow carry on as if nothing
  // was wrong (transcribeAudio never continues to evaluateSpeaking against
  // fake text). A transcription failure must surface to the user visibly
  // and let them retry with their real answer, not silently reword it.
  // Demo Mode (provider.name === 'mock') is unaffected — there's no real
  // backend to fail there in the first place.
  if (provider.name === 'mock') return mock.transcribeAudio(audioUri);
  return provider.transcribeAudio(audioUri);
}

export async function suggestStudyPlanFocus(input: StudyPlanSuggestionInput): Promise<StudyPlanSuggestionResult> {
  const { data, source } = await withFallback(() => provider.suggestStudyPlanFocus(input), () => mock.suggestStudyPlanFocus(input));
  return { ...data, aiSource: source };
}
