import { computeOverallBand } from '@/lib/bandScore';
import { generateId } from '@/lib/id';
import { getJSON, setJSON } from '@/lib/localJsonStore';
import type {
  AiConversation,
  AiMessage,
  Bookmark,
  BandScoreEntry,
  ListeningAttempt,
  MockAttempt,
  NotificationCategory,
  Profile,
  QuestionAttempt,
  ReadingAttempt,
  SpeakingFeedback,
  SpeakingResponse,
  SpeakingSession,
  Subscription,
  StudyPlan,
  TestHistoryEntry,
  UserAchievement,
  UserGoal,
  UserVocabulary,
  WritingFeedback,
  WritingSubmission,
} from '@/types/models';

export const DEMO_USER_ID = 'demo-alex';
const STORAGE_KEY = 'ielts-prep/demo-db/v1';

export type DemoDb = {
  profile: Profile;
  goal: UserGoal;
  lessonProgress: Record<string, string>; // lessonId -> completedAt ISO
  questionAttempts: QuestionAttempt[];
  bookmarks: Bookmark[];
  mockAttempts: MockAttempt[];
  readingAttempts: ReadingAttempt[];
  listeningAttempts: ListeningAttempt[];
  writingSubmissions: WritingSubmission[];
  writingFeedback: WritingFeedback[];
  speakingSessions: SpeakingSession[];
  speakingResponses: SpeakingResponse[];
  speakingFeedback: SpeakingFeedback[];
  bandScores: BandScoreEntry[];
  studyPlans: StudyPlan[];
  userVocabulary: Record<string, UserVocabulary>;
  userAchievements: UserAchievement[];
  conversations: AiConversation[];
  messages: Record<string, AiMessage[]>;
  subscription: Subscription;
  notificationPrefs: Record<NotificationCategory, boolean>;
  testHistory: TestHistoryEntry[];
  streak: { count: number; lastActiveDate: string | null };
  xp: number;
};

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function buildDefaultDb(): DemoDb {
  const now = new Date().toISOString();
  const skillBands = { listening: 7.0, reading: 6.5, writing: 5.5, speaking: 6.0 };

  return {
    profile: {
      id: DEMO_USER_ID,
      fullName: 'Alex',
      avatarUrl: null,
      createdAt: now,
    },
    goal: {
      id: generateId('goal'),
      userId: DEMO_USER_ID,
      ieltsType: 'academic',
      currentBand: 6.0,
      targetBand: 7.5,
      examDate: daysFromNow(42),
      weakestSkill: 'writing',
      dailyStudyMinutes: 45,
      isActive: true,
      createdAt: now,
    },
    lessonProgress: {},
    questionAttempts: [],
    bookmarks: [],
    mockAttempts: [],
    readingAttempts: [],
    listeningAttempts: [],
    writingSubmissions: [],
    writingFeedback: [],
    speakingSessions: [],
    speakingResponses: [],
    speakingFeedback: [],
    bandScores: [
      { id: generateId('band'), userId: DEMO_USER_ID, skill: 'listening', band: skillBands.listening, source: 'mock', recordedAt: now },
      { id: generateId('band'), userId: DEMO_USER_ID, skill: 'reading', band: skillBands.reading, source: 'mock', recordedAt: now },
      { id: generateId('band'), userId: DEMO_USER_ID, skill: 'writing', band: skillBands.writing, source: 'mock', recordedAt: now },
      { id: generateId('band'), userId: DEMO_USER_ID, skill: 'speaking', band: skillBands.speaking, source: 'mock', recordedAt: now },
      { id: generateId('band'), userId: DEMO_USER_ID, skill: 'overall', band: computeOverallBand(skillBands), source: 'mock', recordedAt: now },
    ],
    studyPlans: [],
    userVocabulary: {},
    userAchievements: [],
    conversations: [],
    messages: {},
    subscription: {
      id: generateId('sub'),
      userId: DEMO_USER_ID,
      plan: 'free',
      status: 'none',
      revenuecatCustomerId: null,
      currentPeriodEnd: null,
    },
    notificationPrefs: {
      daily_reminder: true,
      streak_reminder: true,
      test_countdown: true,
      unfinished_plan: true,
      weekly_summary: true,
    },
    testHistory: [],
    streak: { count: 3, lastActiveDate: daysFromNow(-1) },
    xp: 240,
  };
}

let cache: DemoDb | null = null;
let loadPromise: Promise<DemoDb> | null = null;

async function load(): Promise<DemoDb> {
  if (cache) return cache;
  if (!loadPromise) {
    loadPromise = getJSON<DemoDb | null>(STORAGE_KEY, null).then((stored) => {
      cache = stored ?? buildDefaultDb();
      return cache;
    });
  }
  return loadPromise;
}

async function persist() {
  if (cache) await setJSON(STORAGE_KEY, cache);
}

/** Reads the current demo database (loading and seeding it on first call). */
export async function getDb(): Promise<DemoDb> {
  return load();
}

/** Applies a synchronous mutation to the demo database and persists it. */
export async function mutateDb<T>(fn: (db: DemoDb) => T): Promise<T> {
  const db = await load();
  const result = fn(db);
  await persist();
  return result;
}

/** Resets the demo database to its seeded defaults (used by "Reset demo data" in Settings). */
export async function resetDb(): Promise<DemoDb> {
  cache = buildDefaultDb();
  await persist();
  return cache;
}
