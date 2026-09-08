import type { WritingTaskType, SpeakingPart, IeltsType, SkillKey } from '@/types/models';
import type { SpeakingEvaluation, WritingEvaluation } from './schemas';

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

export interface AiProvider {
  readonly name: string;
  evaluateWriting(input: WritingEvalInput): Promise<WritingEvaluation>;
  evaluateSpeaking(input: SpeakingEvalInput): Promise<SpeakingEvaluation>;
  chat(messages: ChatMessage[], context: CoachContext): Promise<string>;
  /** Transcribes a recorded audio file (local URI) to text. Providers without
   * real speech-to-text should throw so callers can fall back gracefully. */
  transcribeAudio(audioUri: string): Promise<string>;
}
