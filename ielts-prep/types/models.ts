// Domain types mirroring the Supabase schema (supabase/migrations/0001_init.sql).
// Kept hand-written rather than generated so demo-mode data can share the
// exact same shapes as real Supabase rows.

export type IeltsType = 'academic' | 'general';
export type SkillKey = 'listening' | 'reading' | 'writing' | 'speaking';
export type SkillOrOverall = SkillKey | 'overall';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';
export type WritingTaskType = 'task1_academic' | 'task1_general' | 'task2';
export type SpeakingPart = 'part1' | 'part2' | 'part3' | 'full';
export type ScoreSource = 'mock' | 'practice' | 'ai_estimate' | 'manual';
export type VocabStatus = 'new' | 'learning' | 'mastered';
export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_yearly';
export type SubscriptionStatus = 'active' | 'trialing' | 'expired' | 'cancelled' | 'none';
export type NotificationCategory =
  | 'daily_reminder'
  | 'streak_reminder'
  | 'test_countdown'
  | 'unfinished_plan'
  | 'weekly_summary';
export type ActivityType = 'mock_test' | 'reading' | 'listening' | 'writing' | 'speaking' | 'practice' | 'ai_chat';
export type BandScale = 'listening' | 'reading_academic' | 'reading_general';

export type Profile = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type UserGoal = {
  id: string;
  userId: string;
  ieltsType: IeltsType;
  currentBand: number | null;
  targetBand: number;
  examDate: string | null;
  weakestSkill: SkillKey | null;
  dailyStudyMinutes: number;
  isActive: boolean;
  createdAt: string;
};

export type LessonSection = { heading: string; body: string; tips: string[] };

export type Lesson = {
  id: string;
  skill: SkillKey;
  category: string;
  title: string;
  subtitle: string | null;
  content: LessonSection[];
  orderIndex: number;
  isPremium: boolean;
  estimatedMinutes: number;
};

export type LessonProgress = {
  id: string;
  userId: string;
  lessonId: string;
  completedAt: string | null;
};

export type ReadingPassage = {
  id: string;
  ieltsType: IeltsType;
  title: string;
  body: string;
  wordCount: number;
  sectionNumber: number;
};

export type ListeningTrack = {
  id: string;
  title: string;
  transcript: string;
  audioUrl: string | null;
  sectionNumber: number;
};

export type QuestionType =
  | 'multiple_choice'
  | 'true_false_not_given'
  | 'yes_no_not_given'
  | 'matching_headings'
  | 'matching_information'
  | 'matching_features'
  | 'sentence_completion'
  | 'summary_completion'
  | 'short_answer'
  | 'form_completion'
  | 'note_completion'
  | 'table_completion'
  | 'diagram_labeling'
  | 'map_labeling';

export type Question = {
  id: string;
  skill: SkillKey;
  questionType: QuestionType;
  topic: string | null;
  difficulty: Difficulty;
  estimatedBand: number | null;
  prompt: string;
  passageId: string | null;
  listeningTrackId: string | null;
  options: string[] | null;
  correctAnswer: string | string[];
  explanation: string | null;
  strategyNote: string | null;
  tags: string[];
  estimatedTimeSeconds: number;
  orderIndex: number;
  isPremium: boolean;
};

export type QuestionAttempt = {
  id: string;
  userId: string;
  questionId: string;
  selectedAnswer: string | string[] | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  practiceSessionId: string | null;
  createdAt: string;
};

export type PracticeSession = {
  id: string;
  userId: string;
  skill: SkillKey;
  startedAt: string;
  endedAt: string | null;
  questionCount: number;
  correctCount: number;
};

export type Bookmark = {
  id: string;
  userId: string;
  questionId: string | null;
  vocabularyWordId: string | null;
  lessonId: string | null;
  createdAt: string;
};

export type MockTest = {
  id: string;
  title: string;
  ieltsType: IeltsType;
  testNumber: number;
  difficulty: Difficulty;
  isFree: boolean;
};

export type MockSectionContentRef = {
  passageIds?: string[];
  trackIds?: string[];
  questionIds?: string[];
  writingPromptIds?: string[];
  speakingTopicIds?: string[];
};

export type MockSection = {
  id: string;
  mockTestId: string;
  skill: SkillKey;
  orderIndex: number;
  durationMinutes: number;
  contentRef: MockSectionContentRef;
};

export type MockAttempt = {
  id: string;
  userId: string;
  mockTestId: string;
  status: AttemptStatus;
  startedAt: string;
  completedAt: string | null;
  overallBand: number | null;
  state: Record<string, unknown>;
};

export type ReadingAttempt = {
  id: string;
  userId: string;
  mockAttemptId: string | null;
  ieltsType: IeltsType;
  passageIds: string[];
  rawScore: number;
  totalQuestions: number;
  band: number;
  timeSpentSeconds: number;
  answers: Record<string, string | string[]>;
  createdAt: string;
};

export type ListeningAttempt = {
  id: string;
  userId: string;
  mockAttemptId: string | null;
  trackIds: string[];
  rawScore: number;
  totalQuestions: number;
  band: number;
  answers: Record<string, string | string[]>;
  createdAt: string;
};

export type Task2Category = 'opinion' | 'discussion' | 'advantages_disadvantages' | 'problem_solution' | 'two_part_question';

export type WritingChartSeries = { label: string; points: { x: string; y: number }[] };
export type WritingChartSegment = { label: string; value: number };

/** Structured chart/diagram data rendered locally by components/writing/WritingChart.tsx
 * — no external images required. `type` selects which shape the other fields use. */
export type WritingChartData =
  | { type: 'bar' | 'line'; unit?: string; series: WritingChartSeries[] }
  | { type: 'pie'; unit?: string; segments: WritingChartSegment[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'process'; steps: string[] }
  | { type: 'map'; description: string; features: string[] };

export type WritingPrompt = {
  id: string;
  taskType: WritingTaskType;
  ieltsType: IeltsType;
  title: string;
  promptText: string;
  category: Task2Category | null;
  chartData: WritingChartData | null;
  minWords: number;
  timeLimitMinutes: number;
};

export type WritingSubmission = {
  id: string;
  userId: string;
  mockAttemptId: string | null;
  promptId: string | null;
  taskType: WritingTaskType;
  essayText: string;
  wordCount: number;
  timeSpentSeconds: number;
  createdAt: string;
};

export type WritingFeedback = {
  id: string;
  submissionId: string;
  overallBand: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedExample: string | null;
  aiModel: string | null;
  createdAt: string;
};

export type SpeakingTopic = {
  id: string;
  part: SpeakingPart;
  /** Groups a Part 1 set, a Part 2 cue card, and a Part 3 set that discuss
   * the same underlying theme, so a full speaking mock can select one
   * coherent group instead of three unrelated random topics. */
  groupId: string;
  topicCategory: string;
  cueCardText: string | null;
  questions: string[];
};

export type SpeakingSession = {
  id: string;
  userId: string;
  mockAttemptId: string | null;
  part: SpeakingPart;
  topicId: string | null;
  startedAt: string;
  completedAt: string | null;
};

export type SpeakingResponse = {
  id: string;
  sessionId: string;
  questionText: string;
  audioUrl: string | null;
  transcript: string | null;
  durationSeconds: number;
  orderIndex: number;
};

export type SpeakingFeedback = {
  id: string;
  sessionId: string;
  overallBand: number;
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  fillerWordCount: number;
  strengths: string[];
  weaknesses: string[];
  suggestedExercises: string[];
  createdAt: string;
};

export type BandScoreEntry = {
  id: string;
  userId: string;
  skill: SkillOrOverall;
  band: number;
  source: ScoreSource;
  recordedAt: string;
};

export type StudyPlan = {
  id: string;
  userId: string;
  date: string;
  generatedAt: string;
  isCompleted: boolean;
  items: StudyPlanItem[];
};

export type StudyPlanItem = {
  id: string;
  studyPlanId: string;
  skill: SkillKey;
  title: string;
  description: string | null;
  durationMinutes: number;
  orderIndex: number;
  isCompleted: boolean;
  linkRef: Record<string, unknown>;
};

export type VocabularyWord = {
  id: string;
  word: string;
  definition: string;
  exampleSentence: string | null;
  topic: string;
  synonyms: string[];
  collocations: string[];
  pronunciationIpa: string | null;
  difficulty: Difficulty;
};

export type UserVocabulary = {
  id: string;
  userId: string;
  wordId: string;
  status: VocabStatus;
  nextReviewAt: string;
  reviewCount: number;
};

export type GrammarLesson = {
  id: string;
  title: string;
  category: string;
  content: LessonSection[];
  orderIndex: number;
};

export type GrammarQuestionType = 'multiple_choice' | 'error_correction' | 'fill_blank';

export type GrammarQuestion = {
  id: string;
  /** Matches a GrammarLesson.category so weak-topic detection and
   * "recommend grammar practice" logic can point at the right lessons. */
  topic: string;
  difficulty: Difficulty;
  questionType: GrammarQuestionType;
  prompt: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
};

export type GrammarQuestionAttempt = {
  id: string;
  userId: string;
  questionId: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  createdAt: string;
};

export type Achievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  criteria: Record<string, unknown>;
};

export type UserAchievement = {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
};

export type AiConversation = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
};

export type AiMessage = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

export type Subscription = {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  revenuecatCustomerId: string | null;
  currentPeriodEnd: string | null;
};

export type AppNotification = {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  scheduledAt: string | null;
  sentAt: string | null;
  readAt: string | null;
};

export type TestHistoryEntry = {
  id: string;
  userId: string;
  activityType: ActivityType;
  refId: string | null;
  band: number | null;
  summary: Record<string, unknown>;
  createdAt: string;
};

export type BandConversionRow = {
  scale: BandScale;
  rawMin: number;
  rawMax: number;
  band: number;
};
