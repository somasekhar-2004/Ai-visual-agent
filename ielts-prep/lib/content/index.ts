import { achievements } from './achievements';
import { grammarLessons } from './grammar';
import { lessons } from './lessons';
import { listeningQuestions, listeningTracks } from './listening';
import { listeningQuestionsSet2, listeningTracksSet2 } from './listening2';
import { listeningQuestionsSet3, listeningTracksSet3 } from './listening3';
import { mockSections, mockTests } from './mockTests';
import { readingPassages, readingQuestions } from './reading';
import { readingPassagesAcademic2, readingQuestionsAcademic2 } from './readingAcademic2';
import { readingPassagesGeneral2, readingQuestionsGeneral2 } from './readingGeneral2';
import { speakingTopics } from './speakingTopics';
import { vocabularyTopics, vocabularyWords } from './vocabulary';
import { writingPrompts } from './writingPrompts';

export * from './achievements';
export * from './grammar';
export * from './lessons';
export * from './listening';
export * from './listening2';
export * from './listening3';
export * from './mockTests';
export * from './reading';
export * from './readingAcademic2';
export * from './readingGeneral2';
export * from './speakingTopics';
export * from './vocabulary';
export * from './writingPrompts';

export const allReadingPassages = [...readingPassages, ...readingPassagesAcademic2, ...readingPassagesGeneral2];
export const allReadingQuestions = [...readingQuestions, ...readingQuestionsAcademic2, ...readingQuestionsGeneral2];
export const allListeningTracks = [...listeningTracks, ...listeningTracksSet2, ...listeningTracksSet3];
export const allListeningQuestions = [...listeningQuestions, ...listeningQuestionsSet2, ...listeningQuestionsSet3];
export const allQuestions = [...allReadingQuestions, ...allListeningQuestions];

/** Static, bundled IELTS Prep content — used directly by demo mode, and as
 * the fallback source when Supabase is not configured. When Supabase *is*
 * configured, `lib/repository.ts` reads the same shapes from the database
 * instead. */
export const content = {
  lessons,
  readingPassages: allReadingPassages,
  readingQuestions: allReadingQuestions,
  listeningTracks: allListeningTracks,
  listeningQuestions: allListeningQuestions,
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
