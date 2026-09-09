import { content } from '@/lib/content';
import { getDb, mutateDb } from '@/lib/demoStore';
import { isDemoMode } from '@/lib/env';
import { generateId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { throwIfSupabaseError } from '@/lib/supabaseErrors';
import type {
  Bookmark,
  Difficulty,
  GrammarQuestion,
  GrammarQuestionAttempt,
  Lesson,
  Question,
  QuestionAttempt,
  SkillKey,
  UserVocabulary,
  VocabStatus,
} from '@/types/models';

export function listLessons(skill?: SkillKey): Lesson[] {
  return skill ? content.lessons.filter((l) => l.skill === skill) : content.lessons;
}

export function getLessonById(id: string): Lesson | undefined {
  return content.lessons.find((l) => l.id === id);
}

export async function getLessonProgressMap(userId: string): Promise<Record<string, string | null>> {
  if (isDemoMode) {
    const db = await getDb();
    return db.lessonProgress;
  }
  const { data, error } = await supabase!.from('lesson_progress').select('*').eq('user_id', userId);
  throwIfSupabaseError(error, 'Failed to load lesson progress');
  const map: Record<string, string | null> = {};
  for (const row of data ?? []) map[row.lesson_id] = row.completed_at;
  return map;
}

export async function markLessonComplete(userId: string, lessonId: string): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      db.lessonProgress[lessonId] = new Date().toISOString();
    });
    return;
  }
  const { error } = await supabase!
    .from('lesson_progress')
    .upsert({ user_id: userId, lesson_id: lessonId, completed_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' });
  throwIfSupabaseError(error, 'Failed to save lesson completion');
}

export type QuestionFilters = {
  skill?: SkillKey;
  difficulty?: Difficulty;
  questionType?: string;
  topic?: string;
};

export function listQuestions(filters: QuestionFilters = {}): Question[] {
  return content.allQuestions.filter((q) => {
    if (filters.skill && q.skill !== filters.skill) return false;
    if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
    if (filters.questionType && q.questionType !== filters.questionType) return false;
    if (filters.topic && q.topic !== filters.topic) return false;
    return true;
  });
}

export function getQuestionById(id: string): Question | undefined {
  return content.allQuestions.find((q) => q.id === id);
}

export async function getQuestionAttempts(userId: string): Promise<QuestionAttempt[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.questionAttempts;
  }
  const { data, error } = await supabase!
    .from('question_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  throwIfSupabaseError(error, 'Failed to load your question attempts');
  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    questionId: row.question_id,
    selectedAnswer: row.selected_answer,
    isCorrect: row.is_correct,
    timeSpentSeconds: row.time_spent_seconds,
    practiceSessionId: row.practice_session_id,
    createdAt: row.created_at,
  }));
}

export async function recordQuestionAttempt(
  userId: string,
  questionId: string,
  selectedAnswer: string | string[] | null,
  isCorrect: boolean,
  timeSpentSeconds: number
): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      db.questionAttempts.unshift({
        id: generateId('qa'),
        userId,
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpentSeconds,
        practiceSessionId: null,
        createdAt: new Date().toISOString(),
      });
    });
    return;
  }
  const { error } = await supabase!.from('question_attempts').insert({
    user_id: userId,
    question_id: questionId,
    selected_answer: selectedAnswer,
    is_correct: isCorrect,
    time_spent_seconds: timeSpentSeconds,
  });
  throwIfSupabaseError(error, 'Failed to record your answer');
}

export async function getBookmarks(userId: string): Promise<Bookmark[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.bookmarks;
  }
  const { data, error } = await supabase!.from('bookmarks').select('*').eq('user_id', userId);
  throwIfSupabaseError(error, 'Failed to load your bookmarks');
  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    questionId: row.question_id,
    vocabularyWordId: row.vocabulary_word_id,
    lessonId: row.lesson_id,
    createdAt: row.created_at,
  }));
}

export async function toggleQuestionBookmark(userId: string, questionId: string): Promise<boolean> {
  if (isDemoMode) {
    return mutateDb((db) => {
      const idx = db.bookmarks.findIndex((b) => b.questionId === questionId);
      if (idx >= 0) {
        db.bookmarks.splice(idx, 1);
        return false;
      }
      db.bookmarks.push({
        id: generateId('bm'),
        userId,
        questionId,
        vocabularyWordId: null,
        lessonId: null,
        createdAt: new Date().toISOString(),
      });
      return true;
    });
  }
  const existing = await supabase!.from('bookmarks').select('id').eq('user_id', userId).eq('question_id', questionId).maybeSingle();
  throwIfSupabaseError(existing.error, 'Failed to check your bookmarks');
  if (existing.data) {
    const { error } = await supabase!.from('bookmarks').delete().eq('id', existing.data.id);
    throwIfSupabaseError(error, 'Failed to remove bookmark');
    return false;
  }
  const { error } = await supabase!.from('bookmarks').insert({ user_id: userId, question_id: questionId });
  throwIfSupabaseError(error, 'Failed to add bookmark');
  return true;
}

export function listVocabulary(topic?: string) {
  return topic ? content.vocabularyWords.filter((v) => v.topic === topic) : content.vocabularyWords;
}

export async function getUserVocabularyMap(userId: string): Promise<Record<string, UserVocabulary>> {
  if (isDemoMode) {
    const db = await getDb();
    return db.userVocabulary;
  }
  const { data, error } = await supabase!.from('user_vocabulary').select('*').eq('user_id', userId);
  throwIfSupabaseError(error, 'Failed to load your vocabulary progress');
  const map: Record<string, UserVocabulary> = {};
  for (const row of data ?? []) {
    map[row.word_id] = {
      id: row.id,
      userId: row.user_id,
      wordId: row.word_id,
      status: row.status,
      nextReviewAt: row.next_review_at,
      reviewCount: row.review_count,
    };
  }
  return map;
}

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 16, 35]; // simple spaced-repetition ladder

export async function reviewVocabWord(userId: string, wordId: string, remembered: boolean): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      const existing = db.userVocabulary[wordId];
      const reviewCount = remembered ? (existing?.reviewCount ?? 0) + 1 : 0;
      const intervalDays = REVIEW_INTERVALS_DAYS[Math.min(reviewCount, REVIEW_INTERVALS_DAYS.length - 1)];
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + intervalDays);
      const status: VocabStatus = reviewCount >= REVIEW_INTERVALS_DAYS.length ? 'mastered' : reviewCount > 0 ? 'learning' : 'new';
      db.userVocabulary[wordId] = {
        id: existing?.id ?? generateId('uv'),
        userId,
        wordId,
        status,
        nextReviewAt: nextReview.toISOString(),
        reviewCount,
      };
    });
    return;
  }
  // Supabase path mirrors the same ladder logic server-side/client-side.
  const { data: existing, error: readError } = await supabase!
    .from('user_vocabulary')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .maybeSingle();
  throwIfSupabaseError(readError, 'Failed to load vocabulary review state');
  const reviewCount = remembered ? (existing?.review_count ?? 0) + 1 : 0;
  const intervalDays = REVIEW_INTERVALS_DAYS[Math.min(reviewCount, REVIEW_INTERVALS_DAYS.length - 1)];
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + intervalDays);
  const status: VocabStatus = reviewCount >= REVIEW_INTERVALS_DAYS.length ? 'mastered' : reviewCount > 0 ? 'learning' : 'new';
  const { error } = await supabase!.from('user_vocabulary').upsert(
    { user_id: userId, word_id: wordId, status, next_review_at: nextReview.toISOString(), review_count: reviewCount },
    { onConflict: 'user_id,word_id' }
  );
  throwIfSupabaseError(error, 'Failed to save vocabulary review');
}

export function listGrammarLessons() {
  return content.grammarLessons;
}

export function getGrammarLessonById(id: string) {
  return content.grammarLessons.find((l) => l.id === id);
}

export type GrammarQuestionFilters = { topic?: string; difficulty?: Difficulty };

export function listGrammarQuestions(filters: GrammarQuestionFilters = {}): GrammarQuestion[] {
  return content.grammarQuestions.filter((q) => {
    if (filters.topic && q.topic !== filters.topic) return false;
    if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
    return true;
  });
}

export async function getGrammarQuestionAttempts(userId: string): Promise<GrammarQuestionAttempt[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.grammarQuestionAttempts;
  }
  const { data, error } = await supabase!.from('grammar_question_attempts').select('*').eq('user_id', userId);
  throwIfSupabaseError(error, 'Failed to load your grammar attempts');
  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    questionId: row.question_id,
    selectedAnswer: row.selected_answer,
    isCorrect: row.is_correct,
    createdAt: row.created_at,
  }));
}

export async function recordGrammarAttempt(userId: string, questionId: string, selectedAnswer: string, isCorrect: boolean): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      db.grammarQuestionAttempts.push({
        id: generateId('ga'),
        userId,
        questionId,
        selectedAnswer,
        isCorrect,
        createdAt: new Date().toISOString(),
      });
    });
    return;
  }
  const { error } = await supabase!.from('grammar_question_attempts').insert({
    user_id: userId,
    question_id: questionId,
    selected_answer: selectedAnswer,
    is_correct: isCorrect,
  });
  throwIfSupabaseError(error, 'Failed to record your grammar answer');
}

/** Topics where the user's grammar-question accuracy is below 70% (with at
 * least 2 attempts) — used to recommend targeted grammar lessons from the
 * study plan and weak-topic review, per the same pattern as weak vocabulary. */
export function weakGrammarTopics(attempts: GrammarQuestionAttempt[]): string[] {
  const byTopic = new Map<string, { correct: number; total: number }>();
  for (const a of attempts) {
    const q = content.grammarQuestions.find((gq) => gq.id === a.questionId);
    if (!q) continue;
    const stat = byTopic.get(q.topic) ?? { correct: 0, total: 0 };
    stat.total += 1;
    if (a.isCorrect) stat.correct += 1;
    byTopic.set(q.topic, stat);
  }
  return [...byTopic.entries()]
    .filter(([, s]) => s.total >= 2 && s.correct / s.total < 0.7)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
    .map(([topic]) => topic);
}
