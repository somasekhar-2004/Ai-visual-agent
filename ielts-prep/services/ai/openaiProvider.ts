import { OPENAI_API_KEY } from '@/lib/env';

import { fetchWithRetry } from './httpClient';
import { buildCoachSystemPrompt, buildSpeakingEvalPrompt, buildWritingEvalPrompt } from './prompts';
import { SpeakingEvaluationSchema, WritingEvaluationSchema, type SpeakingEvaluation, type WritingEvaluation } from './schemas';
import type { AiProvider, ChatMessage, CoachContext, SpeakingEvalInput, WritingEvalInput } from './types';

const CHAT_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini';
const API_BASE = 'https://api.openai.com/v1';

async function chatCompletion(messages: { role: string; content: string }[], jsonMode: boolean): Promise<string> {
  const res = await fetchWithRetry(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      temperature: 0.4,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI response missing content');
  return text;
}

export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';

  async evaluateWriting(input: WritingEvalInput): Promise<WritingEvaluation> {
    const text = await chatCompletion(
      [{ role: 'user', content: buildWritingEvalPrompt(input) }],
      true
    );
    const parsed = WritingEvaluationSchema.safeParse(JSON.parse(text));
    if (!parsed.success) throw new Error(`OpenAI writing evaluation failed schema validation: ${parsed.error.message}`);
    return parsed.data;
  }

  async evaluateSpeaking(input: SpeakingEvalInput): Promise<SpeakingEvaluation> {
    const text = await chatCompletion(
      [{ role: 'user', content: buildSpeakingEvalPrompt(input) }],
      true
    );
    const parsed = SpeakingEvaluationSchema.safeParse(JSON.parse(text));
    if (!parsed.success) throw new Error(`OpenAI speaking evaluation failed schema validation: ${parsed.error.message}`);
    return parsed.data;
  }

  async chat(messages: ChatMessage[], context: CoachContext): Promise<string> {
    const system = { role: 'system', content: buildCoachSystemPrompt(context) };
    return chatCompletion([system, ...messages], false);
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    const form = new FormData();
    // React Native's fetch/FormData accepts this { uri, name, type } shape for files.
    form.append('file', { uri: audioUri, name: 'speech.m4a', type: 'audio/m4a' } as unknown as Blob);
    form.append('model', 'whisper-1');

    const res = await fetchWithRetry(
      `${API_BASE}/audio/transcriptions`,
      { method: 'POST', headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }, body: form },
      { timeoutMs: 60_000 } // audio uploads/transcription take longer than a chat completion
    );
    const data = await res.json();
    if (!data.text) throw new Error('OpenAI transcription response missing text');
    return data.text as string;
  }
}
