import { ANTHROPIC_API_KEY } from '@/lib/env';

import { fetchWithRetry } from './httpClient';
import { buildCoachSystemPrompt, buildSpeakingEvalPrompt, buildWritingEvalPrompt } from './prompts';
import { SpeakingEvaluationSchema, WritingEvaluationSchema, type SpeakingEvaluation, type WritingEvaluation } from './schemas';
import type { AiProvider, ChatMessage, CoachContext, SpeakingEvalInput, WritingEvalInput } from './types';

// Default to the latest Sonnet model; override via EXPO_PUBLIC_ANTHROPIC_MODEL for a different tier.
const MODEL = process.env.EXPO_PUBLIC_ANTHROPIC_MODEL || 'claude-sonnet-5';
const API_BASE = 'https://api.anthropic.com/v1';
const ANTHROPIC_VERSION = '2023-06-01';

function extractJson(text: string): string {
  // Models occasionally wrap JSON in prose or markdown fences despite instructions — extract the first {...} block defensively.
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

async function callMessages(system: string | undefined, userContent: string, maxTokens = 1024): Promise<string> {
  const res = await fetchWithRetry(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Anthropic response missing content');
  return text;
}

export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic';

  async evaluateWriting(input: WritingEvalInput): Promise<WritingEvaluation> {
    const text = await callMessages(undefined, buildWritingEvalPrompt(input));
    const parsed = WritingEvaluationSchema.safeParse(JSON.parse(extractJson(text)));
    if (!parsed.success) throw new Error(`Anthropic writing evaluation failed schema validation: ${parsed.error.message}`);
    return parsed.data;
  }

  async evaluateSpeaking(input: SpeakingEvalInput): Promise<SpeakingEvaluation> {
    const text = await callMessages(undefined, buildSpeakingEvalPrompt(input));
    const parsed = SpeakingEvaluationSchema.safeParse(JSON.parse(extractJson(text)));
    if (!parsed.success) throw new Error(`Anthropic speaking evaluation failed schema validation: ${parsed.error.message}`);
    return parsed.data;
  }

  async chat(messages: ChatMessage[], context: CoachContext): Promise<string> {
    const system = buildCoachSystemPrompt(context);
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    // Anthropic's API expects alternating turns; for simplicity we send the
    // full recent transcript flattened into a single user turn with the
    // system prompt carrying persistent context.
    const transcript = messages.map((m) => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`).join('\n');
    const prompt = `${transcript}\n\nRespond as the Coach to the student's latest message: "${lastUser}"`;
    return callMessages(system, prompt);
  }

  async transcribeAudio(): Promise<string> {
    throw new Error('Anthropic does not support audio transcription — configure an OpenAI key for real speech-to-text.');
  }
}
