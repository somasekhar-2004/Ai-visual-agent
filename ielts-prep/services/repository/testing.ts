import { content } from '@/lib/content';
import { getDb, mutateDb } from '@/lib/demoStore';
import { isDemoMode } from '@/lib/env';
import { generateId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { throwIfSupabaseError } from '@/lib/supabaseErrors';
import type {
  ActivityType,
  IeltsType,
  ListeningAttempt,
  MockAttempt,
  MockSection,
  MockTest,
  ReadingAttempt,
  SpeakingFeedback,
  SpeakingPart,
  SpeakingResponse,
  SpeakingSession,
  TestHistoryEntry,
  WritingFeedback,
  WritingSubmission,
  WritingTaskType,
} from '@/types/models';

export function listMockTests(): MockTest[] {
  return content.mockTests;
}

export function getMockSections(mockTestId: string): MockSection[] {
  return content.mockSections.filter((s) => s.mockTestId === mockTestId).sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function startMockAttempt(userId: string, mockTestId: string): Promise<MockAttempt> {
  const attempt: MockAttempt = {
    id: generateId('mock'),
    userId,
    mockTestId,
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    completedAt: null,
    overallBand: null,
    state: {},
  };
  if (isDemoMode) {
    await mutateDb((db) => {
      db.mockAttempts.unshift(attempt);
    });
    return attempt;
  }
  const { data, error } = await supabase!
    .from('mock_attempts')
    .insert({ user_id: userId, mock_test_id: mockTestId, status: 'in_progress' })
    .select('*')
    .single();
  // A failed insert (RLS/permission denial, network error, ...) surfaces as
  // `error` set and `data` null — never hand that to mapMockAttempt, which
  // doesn't defend against a null row, so a real failure can't silently
  // crash with "Cannot read property 'id' of null" instead of a clear cause.
  throwIfSupabaseError(error, 'Failed to start the mock test');
  if (!data) throw new Error('Failed to start the mock test: the database returned no row for the new attempt.');
  return mapMockAttempt(data);
}

export async function saveMockAttemptState(attemptId: string, state: Record<string, unknown>): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      const attempt = db.mockAttempts.find((a) => a.id === attemptId);
      if (attempt) attempt.state = state;
    });
    return;
  }
  const { error } = await supabase!.from('mock_attempts').update({ state }).eq('id', attemptId);
  throwIfSupabaseError(error, 'Failed to save your mock test progress');
}

export async function completeMockAttempt(attemptId: string, overallBand: number): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      const attempt = db.mockAttempts.find((a) => a.id === attemptId);
      if (attempt) {
        attempt.status = 'completed';
        attempt.completedAt = new Date().toISOString();
        attempt.overallBand = overallBand;
      }
    });
    return;
  }
  const { error } = await supabase!
    .from('mock_attempts')
    .update({ status: 'completed', completed_at: new Date().toISOString(), overall_band: overallBand })
    .eq('id', attemptId);
  throwIfSupabaseError(error, 'Failed to complete the mock test');
}

export async function getMockAttempts(userId: string): Promise<MockAttempt[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.mockAttempts;
  }
  const { data, error } = await supabase!
    .from('mock_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  throwIfSupabaseError(error, 'Failed to load your mock test attempts');
  return (data ?? []).map(mapMockAttempt);
}

/** Scoped to a single mock test — without `mockTestId`, an in-progress
 * attempt abandoned on one mock test would be resumed while navigating the
 * flow steps of a completely different mock test the user just started,
 * silently mixing that other test's content into this attempt's saved
 * state. */
export async function getInProgressMockAttempt(userId: string, mockTestId: string): Promise<MockAttempt | null> {
  const attempts = await getMockAttempts(userId);
  return attempts.find((a) => a.status === 'in_progress' && a.mockTestId === mockTestId) ?? null;
}

function mapMockAttempt(data: any): MockAttempt {
  return {
    id: data.id,
    userId: data.user_id,
    mockTestId: data.mock_test_id,
    status: data.status,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    overallBand: data.overall_band,
    state: data.state ?? {},
  };
}

export async function getReadingAttempts(userId: string): Promise<ReadingAttempt[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.readingAttempts;
  }
  const { data, error } = await supabase!.from('reading_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  throwIfSupabaseError(error, 'Failed to load your reading attempts');
  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    mockAttemptId: row.mock_attempt_id,
    ieltsType: row.ielts_type,
    passageIds: row.passage_ids,
    rawScore: row.raw_score,
    totalQuestions: row.total_questions,
    band: row.band,
    timeSpentSeconds: row.time_spent_seconds,
    answers: row.answers,
    createdAt: row.created_at,
  }));
}

export async function getListeningAttempts(userId: string): Promise<ListeningAttempt[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.listeningAttempts;
  }
  const { data, error } = await supabase!.from('listening_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  throwIfSupabaseError(error, 'Failed to load your listening attempts');
  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    mockAttemptId: row.mock_attempt_id,
    trackIds: row.track_ids,
    rawScore: row.raw_score,
    totalQuestions: row.total_questions,
    band: row.band,
    answers: row.answers,
    createdAt: row.created_at,
  }));
}

export async function saveReadingAttempt(
  userId: string,
  input: {
    mockAttemptId?: string | null;
    ieltsType: IeltsType;
    passageIds: string[];
    rawScore: number;
    totalQuestions: number;
    band: number;
    timeSpentSeconds: number;
    answers: Record<string, string | string[]>;
  }
): Promise<ReadingAttempt> {
  const attempt: ReadingAttempt = {
    id: generateId('ra'),
    userId,
    mockAttemptId: input.mockAttemptId ?? null,
    ieltsType: input.ieltsType,
    passageIds: input.passageIds,
    rawScore: input.rawScore,
    totalQuestions: input.totalQuestions,
    band: input.band,
    timeSpentSeconds: input.timeSpentSeconds,
    answers: input.answers,
    createdAt: new Date().toISOString(),
  };
  if (isDemoMode) {
    await mutateDb((db) => {
      db.readingAttempts.unshift(attempt);
    });
  } else {
    const { error } = await supabase!.from('reading_attempts').insert({
      user_id: userId,
      mock_attempt_id: input.mockAttemptId,
      ielts_type: input.ieltsType,
      passage_ids: input.passageIds,
      raw_score: input.rawScore,
      total_questions: input.totalQuestions,
      band: input.band,
      time_spent_seconds: input.timeSpentSeconds,
      answers: input.answers,
    });
    throwIfSupabaseError(error, 'Failed to save your reading result');
  }
  await addTestHistory(userId, 'reading', attempt.id, input.band, {
    rawScore: input.rawScore,
    totalQuestions: input.totalQuestions,
    timeSpentSeconds: input.timeSpentSeconds,
  });
  return attempt;
}

export async function saveListeningAttempt(
  userId: string,
  input: {
    mockAttemptId?: string | null;
    trackIds: string[];
    rawScore: number;
    totalQuestions: number;
    band: number;
    answers: Record<string, string | string[]>;
  }
): Promise<ListeningAttempt> {
  const attempt: ListeningAttempt = {
    id: generateId('la'),
    userId,
    mockAttemptId: input.mockAttemptId ?? null,
    trackIds: input.trackIds,
    rawScore: input.rawScore,
    totalQuestions: input.totalQuestions,
    band: input.band,
    answers: input.answers,
    createdAt: new Date().toISOString(),
  };
  if (isDemoMode) {
    await mutateDb((db) => {
      db.listeningAttempts.unshift(attempt);
    });
  } else {
    const { error } = await supabase!.from('listening_attempts').insert({
      user_id: userId,
      mock_attempt_id: input.mockAttemptId,
      track_ids: input.trackIds,
      raw_score: input.rawScore,
      total_questions: input.totalQuestions,
      band: input.band,
      answers: input.answers,
    });
    throwIfSupabaseError(error, 'Failed to save your listening result');
  }
  await addTestHistory(userId, 'listening', attempt.id, input.band, { rawScore: input.rawScore, totalQuestions: input.totalQuestions });
  return attempt;
}

export async function submitWriting(
  userId: string,
  input: {
    mockAttemptId?: string | null;
    promptId: string | null;
    taskType: WritingTaskType;
    essayText: string;
    wordCount: number;
    timeSpentSeconds: number;
  }
): Promise<WritingSubmission> {
  const submission: WritingSubmission = {
    id: generateId('ws'),
    userId,
    mockAttemptId: input.mockAttemptId ?? null,
    promptId: input.promptId,
    taskType: input.taskType,
    essayText: input.essayText,
    wordCount: input.wordCount,
    timeSpentSeconds: input.timeSpentSeconds,
    createdAt: new Date().toISOString(),
  };
  if (isDemoMode) {
    await mutateDb((db) => {
      db.writingSubmissions.unshift(submission);
    });
    return submission;
  }
  const { data, error } = await supabase!
    .from('writing_submissions')
    .insert({
      user_id: userId,
      mock_attempt_id: input.mockAttemptId,
      prompt_id: input.promptId,
      task_type: input.taskType,
      essay_text: input.essayText,
      word_count: input.wordCount,
      time_spent_seconds: input.timeSpentSeconds,
    })
    .select('*')
    .single();
  throwIfSupabaseError(error, 'Failed to submit your essay');
  if (!data) throw new Error('Failed to submit your essay: the database returned no row for the new submission.');
  return {
    id: data.id,
    userId: data.user_id,
    mockAttemptId: data.mock_attempt_id,
    promptId: data.prompt_id,
    taskType: data.task_type,
    essayText: data.essay_text,
    wordCount: data.word_count,
    timeSpentSeconds: data.time_spent_seconds,
    createdAt: data.created_at,
  };
}

export async function saveWritingFeedback(
  submissionId: string,
  userId: string,
  feedback: Omit<WritingFeedback, 'id' | 'submissionId' | 'createdAt'>
): Promise<WritingFeedback> {
  const full: WritingFeedback = { id: generateId('wf'), submissionId, createdAt: new Date().toISOString(), ...feedback };
  if (isDemoMode) {
    await mutateDb((db) => {
      db.writingFeedback.unshift(full);
    });
  } else {
    const { error } = await supabase!.from('writing_feedback').insert({
      submission_id: submissionId,
      overall_band: feedback.overallBand,
      task_achievement: feedback.taskAchievement,
      coherence_cohesion: feedback.coherenceCohesion,
      lexical_resource: feedback.lexicalResource,
      grammatical_range: feedback.grammaticalRange,
      strengths: feedback.strengths,
      weaknesses: feedback.weaknesses,
      suggestions: feedback.suggestions,
      improved_example: feedback.improvedExample,
      ai_model: feedback.aiModel,
    });
    throwIfSupabaseError(error, 'Failed to save your writing feedback');
  }
  await addTestHistory(userId, 'writing', submissionId, feedback.overallBand, {
    taskAchievement: feedback.taskAchievement,
    coherenceCohesion: feedback.coherenceCohesion,
    lexicalResource: feedback.lexicalResource,
    grammaticalRange: feedback.grammaticalRange,
  });
  return full;
}

export async function getWritingHistory(userId: string): Promise<{ submission: WritingSubmission; feedback: WritingFeedback | null }[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.writingSubmissions.map((submission) => ({
      submission,
      feedback: db.writingFeedback.find((f) => f.submissionId === submission.id) ?? null,
    }));
  }
  const { data, error } = await supabase!
    .from('writing_submissions')
    .select('*, writing_feedback(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  throwIfSupabaseError(error, 'Failed to load your writing history');
  return (data ?? []).map((row: any) => ({
    submission: {
      id: row.id,
      userId: row.user_id,
      mockAttemptId: row.mock_attempt_id,
      promptId: row.prompt_id,
      taskType: row.task_type,
      essayText: row.essay_text,
      wordCount: row.word_count,
      timeSpentSeconds: row.time_spent_seconds,
      createdAt: row.created_at,
    },
    feedback: row.writing_feedback?.[0] ?? null,
  }));
}

export async function createSpeakingSession(userId: string, part: SpeakingPart, topicId: string | null): Promise<SpeakingSession> {
  const session: SpeakingSession = {
    id: generateId('ss'),
    userId,
    mockAttemptId: null,
    part,
    topicId,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
  if (isDemoMode) {
    await mutateDb((db) => {
      db.speakingSessions.unshift(session);
    });
    return session;
  }
  const { data, error } = await supabase!
    .from('speaking_sessions')
    .insert({ user_id: userId, part, topic_id: topicId })
    .select('*')
    .single();
  // A failed insert here (RLS/permission denial, network error) used to
  // reach `data.id` on a null row from an unguarded `.then()` in
  // app/speaking-session.tsx's mount effect — an unhandled promise
  // rejection surfacing as an uncaught TypeError, regardless of which turn
  // the user happened to be on when it fired.
  throwIfSupabaseError(error, 'Failed to start the speaking session');
  if (!data) throw new Error('Failed to start the speaking session: the database returned no row for the new session.');
  return {
    id: data.id,
    userId: data.user_id,
    mockAttemptId: data.mock_attempt_id,
    part: data.part,
    topicId: data.topic_id,
    startedAt: data.started_at,
    completedAt: data.completed_at,
  };
}

export async function addSpeakingResponse(
  sessionId: string,
  input: { questionText: string; audioUrl: string | null; transcript: string | null; durationSeconds: number; orderIndex: number }
): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      db.speakingResponses.push({ id: generateId('sr'), sessionId, ...input });
    });
    return;
  }
  const { error } = await supabase!.from('speaking_responses').insert({
    session_id: sessionId,
    question_text: input.questionText,
    audio_url: input.audioUrl,
    transcript: input.transcript,
    duration_seconds: input.durationSeconds,
    order_index: input.orderIndex,
  });
  throwIfSupabaseError(error, 'Failed to save your speaking response');
}

export async function completeSpeakingSession(sessionId: string): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      const session = db.speakingSessions.find((s) => s.id === sessionId);
      if (session) session.completedAt = new Date().toISOString();
    });
    return;
  }
  const { error } = await supabase!.from('speaking_sessions').update({ completed_at: new Date().toISOString() }).eq('id', sessionId);
  throwIfSupabaseError(error, 'Failed to complete the speaking session');
}

export async function saveSpeakingFeedback(
  sessionId: string,
  userId: string,
  feedback: Omit<SpeakingFeedback, 'id' | 'sessionId' | 'createdAt'>
): Promise<SpeakingFeedback> {
  const full: SpeakingFeedback = { id: generateId('sf'), sessionId, createdAt: new Date().toISOString(), ...feedback };
  if (isDemoMode) {
    await mutateDb((db) => {
      db.speakingFeedback.unshift(full);
    });
  } else {
    const { error } = await supabase!.from('speaking_feedback').insert({
      session_id: sessionId,
      overall_band: feedback.overallBand,
      fluency_coherence: feedback.fluencyCoherence,
      lexical_resource: feedback.lexicalResource,
      grammatical_range: feedback.grammaticalRange,
      pronunciation: feedback.pronunciation,
      filler_word_count: feedback.fillerWordCount,
      strengths: feedback.strengths,
      weaknesses: feedback.weaknesses,
      suggested_exercises: feedback.suggestedExercises,
    });
    throwIfSupabaseError(error, 'Failed to save your speaking feedback');
  }
  await addTestHistory(userId, 'speaking', sessionId, feedback.overallBand, {
    fillerWordCount: feedback.fillerWordCount,
    fluencyCoherence: feedback.fluencyCoherence,
    lexicalResource: feedback.lexicalResource,
    grammaticalRange: feedback.grammaticalRange,
    pronunciation: feedback.pronunciation,
  });
  return full;
}

export async function getSpeakingHistory(
  userId: string
): Promise<{ session: SpeakingSession; responses: SpeakingResponse[]; feedback: SpeakingFeedback | null }[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.speakingSessions.map((session) => ({
      session,
      responses: db.speakingResponses.filter((r) => r.sessionId === session.id),
      feedback: db.speakingFeedback.find((f) => f.sessionId === session.id) ?? null,
    }));
  }
  const { data, error } = await supabase!
    .from('speaking_sessions')
    .select('*, speaking_responses(*), speaking_feedback(*)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  throwIfSupabaseError(error, 'Failed to load your speaking history');
  return (data ?? []).map((row: any) => ({
    session: {
      id: row.id,
      userId: row.user_id,
      mockAttemptId: row.mock_attempt_id,
      part: row.part,
      topicId: row.topic_id,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    },
    responses: row.speaking_responses ?? [],
    feedback: row.speaking_feedback?.[0] ?? null,
  }));
}

export async function addTestHistory(
  userId: string,
  activityType: ActivityType,
  refId: string,
  band: number | null,
  summary: Record<string, unknown>
): Promise<void> {
  const entry: TestHistoryEntry = {
    id: generateId('th'),
    userId,
    activityType,
    refId,
    band,
    summary,
    createdAt: new Date().toISOString(),
  };
  if (isDemoMode) {
    await mutateDb((db) => {
      db.testHistory.unshift(entry);
    });
    return;
  }
  const { error } = await supabase!.from('test_history').insert({
    user_id: userId,
    activity_type: activityType,
    ref_id: refId,
    band,
    summary,
  });
  throwIfSupabaseError(error, 'Failed to record test history');
}

export async function getTestHistory(userId: string): Promise<TestHistoryEntry[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.testHistory;
  }
  const { data, error } = await supabase!
    .from('test_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  throwIfSupabaseError(error, 'Failed to load your test history');
  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    activityType: row.activity_type,
    refId: row.ref_id,
    band: row.band,
    summary: row.summary,
    createdAt: row.created_at,
  }));
}
