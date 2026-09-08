import { achievements } from './achievements';
import { grammarLessons } from './grammar';
import { grammarQuestions } from './grammarQuestions';
import { lessons } from './lessons';
import { listeningQuestions, listeningTracks } from './listening';
import { listeningQuestionsSet2, listeningTracksSet2 } from './listening2';
import { listeningQuestionsSet3, listeningTracksSet3 } from './listening3';
import { listeningQuestionsSet4, listeningTracksSet4 } from './listening4';
import { listeningQuestionsSet5, listeningTracksSet5 } from './listening5';
import { listeningQuestionsSet6, listeningTracksSet6 } from './listening6';
import { mockSections, mockTests } from './mockTests';
import { readingPassages, readingQuestions } from './reading';
import { readingPassagesAcademic2, readingQuestionsAcademic2 } from './readingAcademic2';
import { readingPassagesAcademic3, readingQuestionsAcademic3 } from './readingAcademic3';
import { readingPassagesAcademic4, readingQuestionsAcademic4 } from './readingAcademic4';
import { readingPassagesGeneral2, readingQuestionsGeneral2 } from './readingGeneral2';
import { readingPassagesGeneral3, readingQuestionsGeneral3 } from './readingGeneral3';
import { readingPassagesGeneral4, readingQuestionsGeneral4 } from './readingGeneral4';
import { speakingTopics } from './speakingTopics';
import { speakingTopicsBatchC } from './speakingTopics2';
import { vocabularyWords } from './vocabulary';
import { vocabularyWordsBatch2 } from './vocabulary2';
import { vocabularyWordsBatch3 } from './vocabulary3';
import { vocabularyWordsBatch4 } from './vocabulary4';
import { vocabularyWordsBatch5 } from './vocabulary5';
import { writingPrompts } from './writingPrompts';

export * from './achievements';
export * from './grammar';
export * from './grammarQuestions';
export * from './lessons';
export * from './listening';
export * from './listening2';
export * from './listening3';
export * from './listening4';
export * from './listening5';
export * from './listening6';
export * from './mockTests';
export * from './reading';
export * from './readingAcademic2';
export * from './readingAcademic3';
export * from './readingAcademic4';
export * from './readingGeneral2';
export * from './readingGeneral3';
export * from './readingGeneral4';
export * from './speakingTopics';
export * from './speakingTopics2';
export * from './vocabulary';
export * from './vocabulary2';
export * from './vocabulary3';
export * from './vocabulary4';
export * from './vocabulary5';
export * from './writingPrompts';

export const allReadingPassages = [
  ...readingPassages,
  ...readingPassagesAcademic2,
  ...readingPassagesAcademic3,
  ...readingPassagesAcademic4,
  ...readingPassagesGeneral2,
  ...readingPassagesGeneral3,
  ...readingPassagesGeneral4,
];
export const allReadingQuestions = [
  ...readingQuestions,
  ...readingQuestionsAcademic2,
  ...readingQuestionsAcademic3,
  ...readingQuestionsAcademic4,
  ...readingQuestionsGeneral2,
  ...readingQuestionsGeneral3,
  ...readingQuestionsGeneral4,
];
export const allListeningTracks = [
  ...listeningTracks,
  ...listeningTracksSet2,
  ...listeningTracksSet3,
  ...listeningTracksSet4,
  ...listeningTracksSet5,
  ...listeningTracksSet6,
];
export const allListeningQuestions = [
  ...listeningQuestions,
  ...listeningQuestionsSet2,
  ...listeningQuestionsSet3,
  ...listeningQuestionsSet4,
  ...listeningQuestionsSet5,
  ...listeningQuestionsSet6,
];
export const allQuestions = [...allReadingQuestions, ...allListeningQuestions];
export const allSpeakingTopics = [...speakingTopics, ...speakingTopicsBatchC];
export const allVocabularyWords = [
  ...vocabularyWords,
  ...vocabularyWordsBatch2,
  ...vocabularyWordsBatch3,
  ...vocabularyWordsBatch4,
  ...vocabularyWordsBatch5,
];
export const allVocabularyTopics = Array.from(new Set(allVocabularyWords.map((v) => v.topic)));

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
  speakingTopics: allSpeakingTopics,
  vocabularyWords: allVocabularyWords,
  vocabularyTopics: allVocabularyTopics,
  grammarLessons,
  grammarQuestions,
  achievements,
  mockTests,
  mockSections,
};
