import { buildCoachContext } from '@/lib/coachContext';
import type { Profile, QuestionAttempt, UserGoal } from '@/types/models';

// Regression coverage for a real production bug: the AI Coach greeted a
// student by an unrelated name and confidently stated "Band 7" for an
// account whose real saved target was 7.5. The name turned out to be a
// genuine value already in that account's profile (not fabricated), but
// the band was a real bug — app/ai-coach.tsx built its request context
// with a hardcoded `goal?.targetBand ?? 7` fallback. buildCoachContext
// (lib/coachContext.ts) is the fix: every "missing" case below returns
// null, never a guessed number or invented name.

const PROFILE: Profile = { id: 'user-1', fullName: 'Priya', avatarUrl: null, createdAt: '2026-01-01' };
const GOAL: UserGoal = {
  id: 'goal-1',
  userId: 'user-1',
  ieltsType: 'academic',
  currentBand: 6,
  targetBand: 7.5,
  examDate: '2026-06-01',
  weakestSkill: 'writing',
  dailyStudyMinutes: 45,
  isActive: true,
  createdAt: '2026-01-01',
};

function makeAttempt(isCorrect: boolean): QuestionAttempt {
  return { id: `a-${Math.random()}`, userId: 'user-1', questionId: 'q1', selectedAnswer: null, isCorrect, timeSpentSeconds: 10, practiceSessionId: null, createdAt: '2026-01-01' };
}

describe('buildCoachContext', () => {
  it('a target band of 7.5 stays exactly 7.5 — never rounded, truncated, or replaced by a default', () => {
    const context = buildCoachContext({ profile: PROFILE, goal: GOAL, bandScores: {}, streak: { count: 0 }, attempts: [] });
    expect(context.targetBand).toBe(7.5);
  });

  it('a missing profile never becomes a fabricated name like "Bunny" — it is null, for a neutral greeting', () => {
    const context = buildCoachContext({ profile: null, goal: GOAL, bandScores: {}, streak: { count: 0 }, attempts: [] });
    expect(context.fullName).toBeNull();
  });

  it('a missing goal never fabricates a target band (e.g. the hardcoded 7 this bug shipped) — it is null', () => {
    const context = buildCoachContext({ profile: PROFILE, goal: null, bandScores: {}, streak: { count: 0 }, attempts: [] });
    expect(context.targetBand).toBeNull();
    expect(context.targetBand).not.toBe(7);
  });

  it('current band and target band read from distinct fields and are never confused or defaulted to each other', () => {
    const context = buildCoachContext({ profile: PROFILE, goal: GOAL, bandScores: {}, streak: { count: 0 }, attempts: [] });
    expect(context.currentBand).toBe(6);
    expect(context.targetBand).toBe(7.5);
    expect(context.currentBand).not.toBe(context.targetBand);

    // And when only one is missing, the other is untouched by it.
    const onlyTargetSet = buildCoachContext({
      profile: PROFILE,
      goal: { ...GOAL, currentBand: null },
      bandScores: {},
      streak: { count: 0 },
      attempts: [],
    });
    expect(onlyTargetSet.currentBand).toBeNull();
    expect(onlyTargetSet.targetBand).toBe(7.5);
  });

  it('a user with real practice history gets correct, computed analytics context — not a placeholder', () => {
    const attempts = [makeAttempt(true), makeAttempt(true), makeAttempt(false), makeAttempt(true)];
    const context = buildCoachContext({
      profile: PROFILE,
      goal: GOAL,
      bandScores: { reading: 7, listening: 6.5, writing: 6, speaking: 6.5, overall: 6.5 },
      streak: { count: 4 },
      attempts,
    });
    expect(context.questionsCompleted).toBe(4);
    expect(context.overallAccuracy).toBeCloseTo(0.75); // 3/4 correct
    expect(context.bandBySkill).toEqual({ reading: 7, listening: 6.5, writing: 6, speaking: 6.5, overall: 6.5 });
    expect(context.streakDays).toBe(4);
  });

  it('genuinely no practice attempts yet reports null accuracy, not a fabricated 0%', () => {
    const context = buildCoachContext({ profile: PROFILE, goal: GOAL, bandScores: {}, streak: { count: 0 }, attempts: [] });
    expect(context.questionsCompleted).toBe(0);
    expect(context.overallAccuracy).toBeNull();
  });
});
