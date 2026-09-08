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
  targetBand: number;
  currentBand: number | null;
  examDate: string | null;
  weakestSkill: SkillKey | null;
  bandBySkill: Partial<Record<SkillKey, number>>;
  streakDays: number;
  dailyStudyMinutes: number;
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
