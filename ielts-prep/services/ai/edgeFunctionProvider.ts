import { FunctionsHttpError } from '@supabase/supabase-js';
import { readAsStringAsync } from 'expo-file-system/legacy';

import { supabase } from '@/lib/supabase';

import { AiRequestError } from './httpClient';
import { SpeakingEvaluationSchema, WritingEvaluationSchema, type SpeakingEvaluation, type WritingEvaluation } from './schemas';
import type { AiProvider, ChatMessage, CoachContext, SpeakingEvalInput, WritingEvalInput } from './types';

/** The only client-side AI provider left: it holds no secret key at all
 * and never talks to OpenAI/Anthropic directly. Every call goes through a
 * Supabase Edge Function (supabase/functions/*), authenticated with the
 * signed-in user's own session — supabase-js attaches that Authorization
 * header automatically. Real provider keys live only in the Edge Function
 * runtime's environment (`supabase secrets set`), never in this bundle. */
export class EdgeFunctionProvider implements AiProvider {
  // Updated after each successful call to the actual provider the server
  // used (e.g. "openai"), so getAiProviderName() reflects reality instead
  // of a guess — see services/ai/index.ts. Starts as a generic label since
  // the client can't know which provider is configured server-side until
  // a call succeeds.
  name = 'cloud';

  private async invoke<T>(functionName: string, body: Record<string, unknown>): Promise<T> {
    if (!supabase) throw new AiRequestError('Supabase is not configured.', null, false);
    const { data, error } = await supabase.functions.invoke(functionName, { body });
    if (error) {
      if (error instanceof FunctionsHttpError) {
        const parsed = await error.context.json().catch(() => null);
        const status = error.context.status as number | undefined;
        const message = parsed?.error?.message ?? error.message;
        const retryable = status === 429 || (status ?? 0) >= 500;
        throw new AiRequestError(message, status ?? null, retryable);
      }
      throw new AiRequestError(error.message ?? 'Edge Function call failed.', null, true);
    }
    return data as T;
  }

  async evaluateWriting(input: WritingEvalInput): Promise<WritingEvaluation> {
    const data = await this.invoke<{ result: unknown; provider: string }>('evaluate-writing', input);
    const parsed = WritingEvaluationSchema.safeParse(data.result);
    if (!parsed.success) throw new Error(`Edge Function writing evaluation failed schema validation: ${parsed.error.message}`);
    this.name = data.provider;
    return parsed.data;
  }

  async evaluateSpeaking(input: SpeakingEvalInput): Promise<SpeakingEvaluation> {
    const data = await this.invoke<{ result: unknown; provider: string }>('evaluate-speaking', input);
    const parsed = SpeakingEvaluationSchema.safeParse(data.result);
    if (!parsed.success) throw new Error(`Edge Function speaking evaluation failed schema validation: ${parsed.error.message}`);
    this.name = data.provider;
    return parsed.data;
  }

  async chat(messages: ChatMessage[], context: CoachContext): Promise<string> {
    const data = await this.invoke<{ reply: string; provider: string }>('ai-coach', { messages, context });
    this.name = data.provider;
    return data.reply;
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    const audioBase64 = await readAsStringAsync(audioUri, { encoding: 'base64' });
    const data = await this.invoke<{ text: string; provider: string }>('transcribe-audio', {
      audioBase64,
      mimeType: 'audio/m4a',
    });
    this.name = data.provider;
    return data.text;
  }
}
