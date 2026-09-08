import { AI_PROVIDER, ANTHROPIC_API_KEY, OPENAI_API_KEY } from '@/lib/env';

import { AnthropicProvider } from './anthropicProvider';
import { friendlyAiErrorMessage } from './httpClient';
import { MockAiProvider } from './mockProvider';
import { OpenAiProvider } from './openaiProvider';
import type { AiProvider, ChatMessage, CoachContext, SpeakingEvalInput, WritingEvalInput } from './types';
import type { SpeakingEvaluation, WritingEvaluation } from './schemas';

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

export * from './types';
export * from './schemas';

const mock = new MockAiProvider();

function selectConfiguredProvider(): AiProvider {
  if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) return new OpenAiProvider();
  if (AI_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY) return new AnthropicProvider();
  if (AI_PROVIDER !== 'mock') {
    console.warn(
      `[ai] EXPO_PUBLIC_AI_PROVIDER="${AI_PROVIDER}" requested but its API key is missing — falling back to the mock provider. Add the key to .env to use real AI.`
    );
  }
  return mock;
}

let provider: AiProvider = selectConfiguredProvider();

/** Returns the currently active AI provider (mock unless a real provider + API key is configured). */
export function getAiProvider(): AiProvider {
  return provider;
}

export function getAiProviderName(): string {
  return provider.name;
}

/** True when a real (non-mock) AI provider is active. */
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
  const { data } = await withFallback(() => provider.transcribeAudio(audioUri), () => mock.transcribeAudio(audioUri));
  return data;
}
