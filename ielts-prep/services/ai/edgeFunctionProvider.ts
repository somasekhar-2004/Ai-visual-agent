import { FunctionsHttpError } from '@supabase/supabase-js';
import { getInfoAsync, readAsStringAsync } from 'expo-file-system/legacy';

import { supabase } from '@/lib/supabase';

import { AiRequestError } from './httpClient';
import {
  SpeakingEvaluationSchema,
  StudyPlanSuggestionSchema,
  WritingEvaluationSchema,
  type SpeakingEvaluation,
  type StudyPlanSuggestion,
  type WritingEvaluation,
} from './schemas';
import type { AiProvider, ChatMessage, CoachContext, SpeakingEvalInput, StudyPlanSuggestionInput, WritingEvalInput } from './types';

// Writing/speaking evaluation is a structured-output LLM call, not a cheap
// lookup — and per the Bandpath recovery handover, a prior investigation
// found real-device "intermittent provider errors, then success on retry"
// caused by the CLIENT timing out and giving up before the SERVER's own
// (legitimate) retry budget for a transient provider error had finished.
//
// RECONCILED against the live backend (api.supabase.com, read-only token,
// 2026-11-06) — pulled the actual deployed supabase/functions/_shared/
// aiProviders.ts source: its own fetchWithRetry default is 3 attempts with
// backoff, ≈91.8s worst case for these JSON-eval calls, and Supabase Edge
// Functions have a 150s wall-clock ceiling on every plan (confirmed in that
// same source's comments). 70s — this file's own prior value — is SHORTER
// than that 91.8s server-side worst case, i.e. it was still exactly the bug
// this is meant to fix. Set above 91.8s with real margin for the network
// round trip on top of the server's own processing time, but not so far
// past the 150s platform ceiling that it waits for a function the platform
// has already killed.
const DEFAULT_TIMEOUT_MS = 110_000;
// transcribe-audio: the same live source confirms its own retry budget was
// deliberately tightened to 2 attempts at 60s (≈120.6s worst case,
// specifically to stay under the 150s platform ceiling — see that file's
// own comment on why 3 attempts there would exceed it). 130s — this file's
// prior value — left only ~9s of margin over that 120.6s for the network
// round trip itself, uncomfortably tight. Raised for real headroom.
const TRANSCRIBE_TIMEOUT_MS = 160_000;

/** Supabase-js's `functions.invoke` has no built-in timeout: on a real
 * device, a stalled upload or a connection that never completes leaves that
 * promise pending forever, with nothing to catch — see the "stuck on
 * Transcribing your answer..." investigation. This races the real call
 * against a timer that rejects, so every call this provider makes is
 * guaranteed to eventually settle one way or the other. */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new AiRequestError(timeoutMessage, null, true)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

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

  private async invoke<T>(functionName: string, body: Record<string, unknown>, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<T> {
    if (!supabase) throw new AiRequestError('Supabase is not configured.', null, false);
    const { data, error } = await withTimeout(
      supabase.functions.invoke(functionName, { body }),
      timeoutMs,
      `${functionName} took too long to respond. Check your connection and try again.`,
    );
    if (error) {
      if (error instanceof FunctionsHttpError) {
        const parsed = await error.context.json().catch(() => null);
        const status = error.context.status as number | undefined;
        const message = parsed?.error?.message ?? error.message;
        // 409 is this API's `operation_in_progress` response (see the
        // deployed evaluate-writing/evaluate-speaking/transcribe-audio
        // source: a concurrent or just-prior request for the same
        // operationId is still being claimed) — its own message literally
        // says "please wait a moment and try again", so it's retryable by
        // definition, not a terminal failure.
        const retryable = status === 429 || status === 409 || (status ?? 0) >= 500;
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

  async transcribeAudio(audioUri: string, operationId?: string | null): Promise<string> {
    // Validate the actual recorded file before spending a network round
    // trip on it — a missing or empty file is a client-side problem no
    // amount of server retrying will fix, and should surface immediately
    // and specifically rather than as a generic upstream failure (or,
    // previously, silently sending an empty payload).
    const info = await getInfoAsync(audioUri);
    if (!info.exists) throw new AiRequestError('The recording could not be found on this device — please record your answer again.', null, false);
    if (!info.size) throw new AiRequestError('The recording is empty (0 bytes) — please record your answer again.', null, false);

    const audioBase64 = await readAsStringAsync(audioUri, { encoding: 'base64' });
    if (__DEV__) {
      // Diagnostics only — the audio/text content itself is never logged,
      // just its shape, so this is safe to leave on in development builds.
      console.log(`[transcribe-audio] uploading ${info.size} bytes (${audioBase64.length} base64 chars) from ${audioUri}`);
    }
    const data = await this.invoke<{ text: string; provider: string }>(
      'transcribe-audio',
      // The deployed schema validates this with Zod's `z.string().uuid().
      // optional()` — optional, not nullable, so a literal `operationId:
      // null` fails validation outright (400 invalid_request) rather than
      // being treated as "not provided." The key must be omitted entirely
      // when there's no real id, never sent as null.
      { audioBase64, mimeType: 'audio/m4a', ...(operationId ? { operationId } : {}) },
      TRANSCRIBE_TIMEOUT_MS,
    );
    this.name = data.provider;
    return data.text;
  }

  async suggestStudyPlanFocus(input: StudyPlanSuggestionInput): Promise<StudyPlanSuggestion> {
    const data = await this.invoke<{ result: unknown; provider: string }>('study-plan-suggestion', input);
    const parsed = StudyPlanSuggestionSchema.safeParse(data.result);
    if (!parsed.success) throw new Error(`Edge Function study plan suggestion failed schema validation: ${parsed.error.message}`);
    this.name = data.provider;
    return parsed.data;
  }
}
