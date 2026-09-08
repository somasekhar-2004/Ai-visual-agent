import { AI_PROVIDER, ANTHROPIC_API_KEY, OPENAI_API_KEY } from '@/lib/env';

import { AnthropicProvider } from './anthropicProvider';
import { MockAiProvider } from './mockProvider';
import { OpenAiProvider } from './openaiProvider';
import type { AiProvider, ChatMessage, CoachContext, SpeakingEvalInput, WritingEvalInput } from './types';
import type { SpeakingEvaluation, WritingEvaluation } from './schemas';

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

async function withFallback<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (err) {
    console.warn('[ai] Real provider call failed, falling back to mock output:', (err as Error).message);
    return fallback();
  }
}

export async function evaluateWriting(input: WritingEvalInput): Promise<WritingEvaluation> {
  return withFallback(() => provider.evaluateWriting(input), () => mock.evaluateWriting(input));
}

export async function evaluateSpeaking(input: SpeakingEvalInput): Promise<SpeakingEvaluation> {
  return withFallback(() => provider.evaluateSpeaking(input), () => mock.evaluateSpeaking(input));
}

export async function chatWithCoach(messages: ChatMessage[], context: CoachContext): Promise<string> {
  return withFallback(() => provider.chat(messages, context), () => mock.chat(messages, context));
}

export async function transcribeAudio(audioUri: string): Promise<string> {
  return withFallback(() => provider.transcribeAudio(audioUri), () => mock.transcribeAudio(audioUri));
}
