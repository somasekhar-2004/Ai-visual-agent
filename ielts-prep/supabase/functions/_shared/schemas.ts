// Mirrors services/ai/schemas.ts (the mobile app's copy) and
// services/ai/types.ts's input shapes. Duplicated rather than shared via an
// import because Edge Functions are a separate Deno deploy unit from the
// Expo/Metro-bundled RN app and cannot import its `@/`-aliased TypeScript
// files — keep the two in sync by hand if either changes.
import { z } from 'npm:zod@3';

// mockAttemptId is only a CLAIM at this point — never trusted by itself.
// The edge function looks it up against `mock_attempts` (scoped to the
// caller's own JWT) before treating the request as a genuine Full Mock
// evaluation; see _shared/mockAttempt.ts. null/omitted means Practice.
const mockAttemptIdField = z.string().uuid().nullable().optional();

export const WritingEvalRequestSchema = z.object({
  taskType: z.enum(['task1_academic', 'task1_general', 'task2']),
  promptText: z.string().min(1).max(4000),
  essayText: z.string().min(1).max(20000),
  wordCount: z.number().int().min(0).max(20000),
  minWords: z.number().int().min(0).max(2000),
  mockAttemptId: mockAttemptIdField,
});
export type WritingEvalRequest = z.infer<typeof WritingEvalRequestSchema>;

export const SpeakingEvalRequestSchema = z.object({
  part: z.enum(['part1', 'part2', 'part3', 'full']),
  topicCategory: z.string().min(1).max(200),
  transcript: z.string().min(1).max(20000),
  questionCount: z.number().int().min(0).max(100),
  totalDurationSeconds: z.number().min(0).max(7200),
  mockAttemptId: mockAttemptIdField,
});
export type SpeakingEvalRequest = z.infer<typeof SpeakingEvalRequestSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(4000),
});

export const CoachContextSchema = z.object({
  fullName: z.string().nullable(),
  ieltsType: z.enum(['academic', 'general']),
  // null means "not set yet" — never fabricated as a default number. See
  // services/ai/types.ts's CoachContext for the production incident this
  // fixes. This function also never trusts these client-sent identity/goal/
  // band fields anyway — fetchAuthoritativeCoachContext (userContext.ts)
  // overwrites them from the database by the caller's own authenticated
  // user id before they ever reach a prompt.
  targetBand: z.number().nullable(),
  currentBand: z.number().nullable(),
  examDate: z.string().nullable(),
  weakestSkill: z.enum(['listening', 'reading', 'writing', 'speaking']).nullable(),
  bandBySkill: z.record(z.string(), z.number()),
  streakDays: z.number().int().min(0),
  dailyStudyMinutes: z.number().int().min(0),
  overallAccuracy: z.number().min(0).max(1).nullable().optional(),
  questionsCompleted: z.number().int().min(0).optional(),
});
export type CoachContext = z.infer<typeof CoachContextSchema>;

export const AiCoachRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(50),
  context: CoachContextSchema,
});
export type AiCoachRequest = z.infer<typeof AiCoachRequestSchema>;

export const TranscribeRequestSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().min(1).max(100).default('audio/m4a'),
});
export type TranscribeRequest = z.infer<typeof TranscribeRequestSchema>;

export const StudyPlanSuggestionRequestSchema = z.object({
  context: CoachContextSchema,
  weakQuestionTypeBySkill: z.record(z.string(), z.string()).optional(),
  weakGrammarTopic: z.string().nullable().optional(),
});
export type StudyPlanSuggestionRequest = z.infer<typeof StudyPlanSuggestionRequestSchema>;

// --- AI output schemas (what the model must return) -----------------------

const SentenceIssueSchema = z.object({
  original: z.string().min(1),
  issue: z.string().min(1),
  suggestion: z.string().min(1),
});

export const WritingEvaluationSchema = z.object({
  overallBand: z.number().min(1).max(9),
  taskAchievement: z.number().min(1).max(9),
  coherenceCohesion: z.number().min(1).max(9),
  lexicalResource: z.number().min(1).max(9),
  grammaticalRange: z.number().min(1).max(9),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  suggestions: z.array(z.string()).min(1),
  improvedExample: z.string().min(1),
  sentenceIssues: z.array(SentenceIssueSchema).default([]),
  repeatedWords: z.array(z.string()).default([]),
  nextBandAction: z.string().min(1),
});
export type WritingEvaluation = z.infer<typeof WritingEvaluationSchema>;

export const SpeakingEvaluationSchema = z.object({
  overallBand: z.number().min(1).max(9),
  fluencyCoherence: z.number().min(1).max(9),
  lexicalResource: z.number().min(1).max(9),
  grammaticalRange: z.number().min(1).max(9),
  pronunciation: z.number().min(1).max(9),
  fillerWordCount: z.number().min(0),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  suggestedExercises: z.array(z.string()).min(1),
  repeatedWords: z.array(z.string()).default([]),
  developmentNote: z.string().nullable().default(null),
  nextBandAction: z.string().min(1),
});
export type SpeakingEvaluation = z.infer<typeof SpeakingEvaluationSchema>;

export const StudyPlanSuggestionSchema = z.object({
  focusSummary: z.string().min(1),
  motivationalNote: z.string().min(1),
});
export type StudyPlanSuggestion = z.infer<typeof StudyPlanSuggestionSchema>;
