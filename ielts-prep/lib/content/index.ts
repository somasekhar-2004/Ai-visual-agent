import { achievements } from './achievements';
import { grammarLessons } from './grammar';
import { lessons } from './lessons';
import { listeningQuestions, listeningTracks } from './listening';
import { mockSections, mockTests } from './mockTests';
import { readingPassages, readingQuestions } from './reading';
import { speakingTopics } from './speakingTopics';
import { vocabularyTopics, vocabularyWords } from './vocabulary';
import { writingPrompts } from './writingPrompts';

export * from './achievements';
export * from './grammar';
export * from './lessons';
export * from './listening';
export * from './mockTests';
export * from './reading';
export * from './speakingTopics';
export * from './vocabulary';
export * from './writingPrompts';

export const allQuestions = [...readingQuestions, ...listeningQuestions];

/** Static, bundled IELTS Prep content — used directly by demo mode, and as
 * the fallback source when Supabase is not configured. When Supabase *is*
 * configured, `lib/repository.ts` reads the same shapes from the database
 * instead. */
export const content = {
  lessons,
  readingPassages,
  readingQuestions,
  listeningTracks,
  listeningQuestions,
  allQuestions,
  writingPrompts,
  speakingTopics,
  vocabularyWords,
  vocabularyTopics,
  grammarLessons,
  achievements,
  mockTests,
  mockSections,
};
