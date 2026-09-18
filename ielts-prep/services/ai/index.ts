import { EdgeFunctionProvider } from './edgeFunctionProvider';
import type { AiProvider, ChatMessage, CoachContext, SpeakingEvalInput, StudyPlanSuggestionInput, WritingEvalInput } from './types';
import type { SpeakingEvaluation, StudyPlanSuggestion, WritingEvaluation } from './schemas';

export { friendlyAiErrorMessage } from './httpClient';

/** Tags an AI result with whether it actually came from the configured real
 * provider — always 'real' now that there is no runtime mock fallback; kept
 * as a discriminant so callers/tests don't need to change shape. */
export type AiSource = 'real' | 'mock';
export type WritingEvaluationResult = WritingEvaluation & { aiSource: AiSource };
export type SpeakingEvaluationResult = SpeakingEvaluation & { aiSource: AiSource };
export type ChatResult = { reply: string; aiSource: AiSource };
export type StudyPlanSuggestionResult = StudyPlanSuggestion & { aiSource: AiSource };

export * from './types';
export * from './schemas';

// No client-side "which provider + key" decision — that would mean shipping
// a secret in the bundle, which is exactly what this architecture exists to
// avoid. Whether the Edge Function actually has a real OpenAI/Anthropic key
// configured server-side is entirely the server's decision (via `supabase
// secrets set`) — if it doesn't, the function returns a clean
// "ai_not_configured" error, which every function below surfaces to the
// caller as a real, visible error rather than silently substituting mock
// output. There is no local mock fallback in runtime code any more: a
// missing/invalid Supabase config renders ConfigurationErrorScreen (see
// app/_layout.tsx) before any screen that would call these functions is
// ever reachable.
const provider: AiProvider = new EdgeFunctionProvider();

/** Returns the currently active AI provider. */
export function getAiProvider(): AiProvider {
  return provider;
}

export function getAiProviderName(): string {
  return provider.name;
}

/** Always true now that there is no runtime mock provider — kept so
 * existing callers (e.g. DemoAiBadge) don't need to change. */
export function isRealAiActive(): boolean {
  return true;
}

export async function evaluateWriting(input: WritingEvalInput): Promise<WritingEvaluationResult> {
  // Deliberately never silently substitutes mock output on failure — a
  // Writing band is a scored result a student trusts; see
  // evaluateSpeaking's comment for the production incident this class of
  // bug caused.
  return { ...(await provider.evaluateWriting(input)), aiSource: 'real' };
}

export async function evaluateSpeaking(input: SpeakingEvalInput): Promise<SpeakingEvaluationResult> {
  // A real-provider failure must surface as a visible error, never a
  // silently substituted mock band. This was the root cause of a
  // release-blocking bug — a near-silent real-device recording ("Yeah. Gods
  // [no speech detected] [no speech detected]") that produced Overall Band
  // 5.5 because the real evaluate-speaking call failed and a prior version
  // of this code quietly handed back a heuristic mock score instead of an
  // error. See lib/speakingEvidence.ts for the separate, mandatory
  // insufficient-evidence gate that runs before this function is ever
  // called at all.
  return { ...(await provider.evaluateSpeaking(input)), aiSource: 'real' };
}

export async function chatWithCoach(messages: ChatMessage[], context: CoachContext): Promise<ChatResult> {
  // Deliberately does NOT silently fall back to a mock heuristic reply on a
  // real-provider failure — same reasoning as evaluateWriting/
  // evaluateSpeaking/transcribeAudio above. A real production incident
  // showed exactly why: a coach reply that reads as a normal, plausible
  // conversational response is far more convincing (and more dangerous to
  // silently swap out) than a visibly-scored number — a user has no way to
  // sanity-check "hi, here's some advice" the way they might question an
  // out-of-place band score.
  return { reply: await provider.chat(messages, context), aiSource: 'real' };
}

export async function transcribeAudio(audioUri: string): Promise<string> {
  // Deliberately never silently substitutes a fabricated transcript when
  // the real one fails — that would let the rest of the Speaking flow carry
  // on as if nothing was wrong. A transcription failure must surface to the
  // user visibly and let them retry with their real answer, not silently
  // reword it.
  return provider.transcribeAudio(audioUri);
}

export async function suggestStudyPlanFocus(input: StudyPlanSuggestionInput): Promise<StudyPlanSuggestionResult> {
  // Same reasoning as chatWithCoach: no silent mock substitution. The
  // caller (Home's focus-note query) already treats a thrown error as "no
  // note to show today" rather than a blank screen — see
  // app/(tabs)/index.tsx's focusQuery.
  return { ...(await provider.suggestStudyPlanFocus(input)), aiSource: 'real' };
}
