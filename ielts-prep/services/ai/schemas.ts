import { z } from 'zod';

// All AI scoring outputs are validated against these schemas before being
// trusted by the app. If a real provider returns malformed JSON, callers
// fall back to the mock provider's deterministic output rather than crash
// or display garbage — see services/ai/index.ts.

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
});
export type SpeakingEvaluation = z.infer<typeof SpeakingEvaluationSchema>;

export const StudyPlanSuggestionSchema = z.object({
  focusSummary: z.string().min(1),
  motivationalNote: z.string().min(1),
});
export type StudyPlanSuggestion = z.infer<typeof StudyPlanSuggestionSchema>;
