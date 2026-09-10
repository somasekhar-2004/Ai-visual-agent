import type { WritingTaskType, SpeakingPart, IeltsType, SkillKey } from '@/types/models';
import type { SpeakingEvaluation, StudyPlanSuggestion, WritingEvaluation } from './schemas';

export type WritingEvalInput = {
  taskType: WritingTaskType;
  promptText: string;
  essayText: string;
  wordCount: number;
  minWords: number;
};

export type SpeakingEvalInput = {
  part: SpeakingPart;
  topicCategory: string;
  transcript: string;
  questionCount: number;
  totalDurationSeconds: number;
};

export type CoachContext = {
  fullName: string | null;
  ieltsType: IeltsType;
  /** null means the student has not set a target band yet — never fabricate
   * a number here (this was a real production bug: a hardcoded `?? 7`
   * fallback made the coach confidently state "Band 7" for an account whose
   * real target was 7.5, simply because the client asked before its own
   * goal had finished loading). Real Supabase mode also has this
   * server-overridden with the authoritative value straight from
   * `user_goals` — see supabase/functions/_shared/userContext.ts — so a
   * stale/racy client read like that can no longer reach the model at all. */
  targetBand: number | null;
  currentBand: number | null;
  examDate: string | null;
  weakestSkill: SkillKey | null;
  bandBySkill: Partial<Record<SkillKey, number>>;
  streakDays: number;
  dailyStudyMinutes: number;
  /** Optional: real Supabase mode always overrides these server-side from
   * `question_attempts` (see userContext.ts), so callers that can't cheaply
   * compute them (e.g. a queryFn with no attempts query of its own) may omit
   * them entirely rather than guessing. */
  overallAccuracy?: number | null;
  questionsCompleted?: number;
};

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export type StudyPlanSuggestionInput = {
  context: CoachContext;
  weakQuestionTypeBySkill?: Partial<Record<'reading' | 'listening', string>>;
  weakGrammarTopic?: string | null;
};

export interface AiProvider {
  /** Not always readonly in practice: EdgeFunctionProvider updates this
   * after each successful call to reflect which real provider the server
   * actually used (see services/ai/edgeFunctionProvider.ts). */
  name: string;
  evaluateWriting(input: WritingEvalInput): Promise<WritingEvaluation>;
  evaluateSpeaking(input: SpeakingEvalInput): Promise<SpeakingEvaluation>;
  chat(messages: ChatMessage[], context: CoachContext): Promise<string>;
  /** Transcribes a recorded audio file (local URI) to text. Providers without
   * real speech-to-text should throw so callers can fall back gracefully. */
  transcribeAudio(audioUri: string): Promise<string>;
  /** A short, personalized note (focus summary + motivational line) layered
   * on top of the deterministic study plan built by
   * services/repository/studyPlan.ts — that plan's items/durations/links
   * never depend on this succeeding. */
  suggestStudyPlanFocus(input: StudyPlanSuggestionInput): Promise<StudyPlanSuggestion>;
}
