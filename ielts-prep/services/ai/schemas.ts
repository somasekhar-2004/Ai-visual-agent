import { z } from 'zod';

// All AI scoring outputs are validated against these schemas before being
// trusted by the app. If a real provider returns malformed JSON, callers
// fall back to the mock provider's deterministic output rather than crash
// or display garbage — see services/ai/index.ts.

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
  /** Specific sentences from the essay with a concrete issue + fix, not just
   * general feedback — points at exact text the writer can act on. */
  sentenceIssues: z.array(SentenceIssueSchema).default([]),
  /** Content words repeated often enough that a synonym swap would help. */
  repeatedWords: z.array(z.string()).default([]),
  /** The single highest-leverage change to make for the next attempt. */
  nextBandAction: z.string().min(1),
});
export type WritingEvaluation = z.infer<typeof WritingEvaluationSchema>;
export type SentenceIssue = z.infer<typeof SentenceIssueSchema>;

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
  /** Content words repeated often enough to stand out to an examiner. */
  repeatedWords: z.array(z.string()).default([]),
  /** Set when answers were too short/underdeveloped to fully judge fluency
   * — a distinct, actionable flag rather than folded into "weaknesses". */
  developmentNote: z.string().nullable().default(null),
  nextBandAction: z.string().min(1),
});
export type SpeakingEvaluation = z.infer<typeof SpeakingEvaluationSchema>;

export const StudyPlanSuggestionSchema = z.object({
  focusSummary: z.string().min(1),
  motivationalNote: z.string().min(1),
});
export type StudyPlanSuggestion = z.infer<typeof StudyPlanSuggestionSchema>;
