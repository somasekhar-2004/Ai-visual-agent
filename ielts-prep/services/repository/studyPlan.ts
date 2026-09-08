import { weakestQuestionType } from '@/lib/analytics';
import { getDb, mutateDb } from '@/lib/demoStore';
import { isDemoMode } from '@/lib/env';
import { generateId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { suggestStudyPlanFocus, type CoachContext, type StudyPlanSuggestionResult } from '@/services/ai';
import type { GrammarQuestionAttempt, QuestionAttempt, SkillKey, StudyPlan, StudyPlanItem, TestHistoryEntry, UserGoal } from '@/types/models';

import { getQuestionAttempts, getGrammarQuestionAttempts, weakGrammarTopics } from './learning';
import { getTestHistory } from './testing';

const SKILL_ORDER: SkillKey[] = ['reading', 'writing', 'listening', 'speaking'];

const SKILL_ACTIVITY: Record<SkillKey, { title: string; description: string }> = {
  reading: { title: 'Reading practice', description: 'True/False/Not Given question set' },
  writing: { title: 'Writing practice', description: 'Task 2 introduction & body paragraph drill' },
  listening: { title: 'Listening practice', description: 'Form completion with number/spelling focus' },
  speaking: { title: 'Speaking practice', description: 'Part 2 cue card with 1-minute prep' },
};

const CRITERION_LABEL: Record<string, string> = {
  taskAchievement: 'Task Achievement',
  coherenceCohesion: 'Coherence & Cohesion',
  lexicalResource: 'Lexical Resource',
  grammaticalRange: 'Grammatical Range',
  fluencyCoherence: 'Fluency & Coherence',
  pronunciation: 'Pronunciation',
};

/** Real signals pulled from the user's actual attempt history, used to make
 * each day's recommendation specific (e.g. "Reading — matching_headings,
 * your weakest question type" rather than a fixed generic drill). Every
 * field is optional so callers/tests that only have a goal + band map can
 * still call buildPlanItems without gathering all of this first. */
export type PlanPerformanceContext = {
  weakQuestionTypeBySkill?: Partial<Record<'reading' | 'listening', string>>;
  weakWritingCriterion?: string | null;
  weakSpeakingCriterion?: string | null;
  weakGrammarTopic?: string | null;
};

function lowestCriterion(history: TestHistoryEntry[], activityType: 'writing' | 'speaking', keys: string[]): string | null {
  const latest = [...history].filter((h) => h.activityType === activityType)[0]; // history is newest-first
  if (!latest) return null;
  let worstKey: string | null = null;
  let worstValue = Infinity;
  for (const key of keys) {
    const v = latest.summary[key];
    if (typeof v === 'number' && v < worstValue) {
      worstValue = v;
      worstKey = key;
    }
  }
  return worstKey;
}

/** Gathers the real weak-area signals `buildPlanItems` needs from the
 * user's actual attempt history — separated from `buildPlanItems` itself so
 * the latter stays a pure, easily-testable function. */
export function derivePerformanceContext(
  questionAttempts: QuestionAttempt[],
  testHistory: TestHistoryEntry[],
  grammarAttempts: GrammarQuestionAttempt[]
): PlanPerformanceContext {
  return {
    weakQuestionTypeBySkill: {
      reading: weakestQuestionType(questionAttempts, 'reading') ?? undefined,
      listening: weakestQuestionType(questionAttempts, 'listening') ?? undefined,
    },
    weakWritingCriterion: lowestCriterion(testHistory, 'writing', ['taskAchievement', 'coherenceCohesion', 'lexicalResource', 'grammaticalRange']),
    weakSpeakingCriterion: lowestCriterion(testHistory, 'speaking', ['fluencyCoherence', 'lexicalResource', 'grammaticalRange', 'pronunciation']),
    weakGrammarTopic: weakGrammarTopics(grammarAttempts)[0] ?? null,
  };
}

function activityFor(skill: SkillKey, context: PlanPerformanceContext): { title: string; description: string; linkRef: Record<string, unknown> } {
  const fallback = SKILL_ACTIVITY[skill];
  if (skill === 'reading' || skill === 'listening') {
    const weakType = context.weakQuestionTypeBySkill?.[skill];
    if (weakType) {
      const label = weakType.replace(/_/g, ' ');
      return {
        title: `${fallback.title} — ${label}`,
        description: `Focused set on ${label}, your lowest-accuracy question type recently.`,
        linkRef: { skill, questionType: weakType },
      };
    }
    return { ...fallback, linkRef: { skill } };
  }
  if (skill === 'writing') {
    const crit = context.weakWritingCriterion;
    if (crit) {
      return {
        title: 'Writing practice — Task 2',
        description: `Timed Task 2 response, focused on raising ${CRITERION_LABEL[crit] ?? crit} (your lowest score last time).`,
        linkRef: { skill, taskType: 'task2', criterion: crit },
      };
    }
    return { ...fallback, linkRef: { skill } };
  }
  // speaking
  const crit = context.weakSpeakingCriterion;
  if (crit) {
    return {
      title: 'Speaking practice — Part 2',
      description: `Cue card practice, focused on raising ${CRITERION_LABEL[crit] ?? crit} (your lowest score last time).`,
      linkRef: { skill, part: 'part2', criterion: crit },
    };
  }
  return { ...fallback, linkRef: { skill } };
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

/** Deterministically builds a daily plan: the weakest skill gets the largest
 * share of the available time, the remaining time is split across the other
 * three skills in ascending order of estimated band (weakest first). Each
 * item's specific focus reflects the user's real recent performance
 * (`context`) rather than a fixed description — see `activityFor`. When a
 * weak grammar topic is known, a short grammar review item is added. When
 * the exam is 14 days away or closer, a full mock test recommendation is
 * added so mock frequency actually increases as the date approaches. */
export function buildPlanItems(
  goal: UserGoal,
  bandBySkill: Partial<Record<SkillKey, number>>,
  context: PlanPerformanceContext = {}
): Omit<StudyPlanItem, 'id' | 'studyPlanId'>[] {
  const totalMinutes = goal.dailyStudyMinutes;
  const skillsByWeakness = [...SKILL_ORDER].sort((a, b) => (bandBySkill[a] ?? 6) - (bandBySkill[b] ?? 6));
  const primary = goal.weakestSkill ?? skillsByWeakness[0];
  const ordered = [primary, ...skillsByWeakness.filter((s) => s !== primary)];

  // Primary skill gets ~40%, remaining time split across the other three.
  const primaryMinutes = Math.max(10, Math.round(totalMinutes * 0.4));
  const remaining = Math.max(0, totalMinutes - primaryMinutes);
  const perOther = Math.floor(remaining / 3) || 5;

  const items: Omit<StudyPlanItem, 'id' | 'studyPlanId'>[] = ordered.map((skill, index) => {
    const activity = activityFor(skill, context);
    return {
      skill,
      title: activity.title,
      description: activity.description,
      durationMinutes: index === 0 ? primaryMinutes : perOther,
      orderIndex: index,
      isCompleted: false,
      linkRef: activity.linkRef,
    };
  });

  if (context.weakGrammarTopic) {
    items.push({
      skill: 'writing',
      title: `Grammar review — ${context.weakGrammarTopic}`,
      description: 'A short lesson + quiz on the grammar topic you have been getting wrong most often.',
      durationMinutes: 10,
      orderIndex: items.length,
      isCompleted: false,
      linkRef: { grammarTopic: context.weakGrammarTopic },
    });
  }

  const examDays = daysUntil(goal.examDate);
  if (examDays !== null && examDays >= 0 && examDays <= 14) {
    items.push({
      skill: primary,
      title: examDays <= 3 ? 'Full mock test (final review)' : 'Full mock test',
      description: `Your exam is ${examDays} day${examDays === 1 ? '' : 's'} away — take a complete timed mock this week to build exam stamina, on top of today's focused practice.`,
      durationMinutes: 150,
      orderIndex: items.length,
      isCompleted: false,
      linkRef: { mockRecommended: true },
    });
  }

  return items;
}

export async function getStudyPlanForDate(userId: string, date: string): Promise<StudyPlan | null> {
  if (isDemoMode) {
    const db = await getDb();
    return db.studyPlans.find((p) => p.date === date) ?? null;
  }
  const { data } = await supabase!
    .from('study_plans')
    .select('*, study_plan_items(*)')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (!data) return null;
  return mapPlanRow(data);
}

export async function generateStudyPlan(
  userId: string,
  goal: UserGoal,
  bandBySkill: Partial<Record<SkillKey, number>>,
  date: string = new Date().toISOString().slice(0, 10)
): Promise<StudyPlan> {
  const existing = await getStudyPlanForDate(userId, date);
  if (existing) return existing;

  const [questionAttempts, testHistory, grammarAttempts] = await Promise.all([
    getQuestionAttempts(userId),
    getTestHistory(userId),
    getGrammarQuestionAttempts(userId),
  ]);
  const context = derivePerformanceContext(questionAttempts, testHistory, grammarAttempts);
  const items = buildPlanItems(goal, bandBySkill, context);

  if (isDemoMode) {
    return mutateDb((db) => {
      const plan: StudyPlan = {
        id: generateId('plan'),
        userId,
        date,
        generatedAt: new Date().toISOString(),
        isCompleted: false,
        items: items.map((item) => ({ ...item, id: generateId('planitem'), studyPlanId: '' })),
      };
      plan.items.forEach((i) => (i.studyPlanId = plan.id));
      db.studyPlans.unshift(plan);
      return plan;
    });
  }

  const { data: planRow } = await supabase!
    .from('study_plans')
    .insert({ user_id: userId, date })
    .select('*')
    .single();
  const { data: itemRows } = await supabase!
    .from('study_plan_items')
    .insert(
      items.map((item) => ({
        study_plan_id: planRow.id,
        skill: item.skill,
        title: item.title,
        description: item.description,
        duration_minutes: item.durationMinutes,
        order_index: item.orderIndex,
        link_ref: item.linkRef,
      }))
    )
    .select('*');
  return mapPlanRow({ ...planRow, study_plan_items: itemRows });
}

/** A short AI-written note (focus summary + motivational line) layered on
 * top of the deterministic plan above — this never changes which items are
 * in the plan or their order/duration/links, only adds a sentence of
 * framing. Uses the exact same real-AI-with-heuristic-fallback pattern as
 * Writing/Speaking eval and the AI Coach (services/ai's `withFallback`):
 * production AI when Supabase + a server-side AI key are configured, the
 * same local heuristic MockAiProvider uses otherwise, and the result's
 * `aiSource` tells the caller which one actually produced it so the UI can
 * show "Live AI" vs "Demo AI" rather than imply every plan is AI-written. */
export async function getStudyPlanFocusSuggestion(userId: string, context: CoachContext): Promise<StudyPlanSuggestionResult> {
  const [questionAttempts, testHistory, grammarAttempts] = await Promise.all([
    getQuestionAttempts(userId),
    getTestHistory(userId),
    getGrammarQuestionAttempts(userId),
  ]);
  const perf = derivePerformanceContext(questionAttempts, testHistory, grammarAttempts);
  return suggestStudyPlanFocus({
    context,
    weakQuestionTypeBySkill: perf.weakQuestionTypeBySkill,
    weakGrammarTopic: perf.weakGrammarTopic,
  });
}

export async function completeStudyPlanItem(planId: string, itemId: string): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      const plan = db.studyPlans.find((p) => p.id === planId);
      const item = plan?.items.find((i) => i.id === itemId);
      if (item) item.isCompleted = true;
      if (plan && plan.items.every((i) => i.isCompleted)) plan.isCompleted = true;
    });
    return;
  }
  await supabase!.from('study_plan_items').update({ is_completed: true }).eq('id', itemId);
  const { data: items } = await supabase!.from('study_plan_items').select('is_completed').eq('study_plan_id', planId);
  if (items?.every((i: any) => i.is_completed)) {
    await supabase!.from('study_plans').update({ is_completed: true }).eq('id', planId);
  }
}

function mapPlanRow(data: any): StudyPlan {
  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    generatedAt: data.generated_at,
    isCompleted: data.is_completed,
    items: (data.study_plan_items ?? []).map((i: any) => ({
      id: i.id,
      studyPlanId: i.study_plan_id,
      skill: i.skill,
      title: i.title,
      description: i.description,
      durationMinutes: i.duration_minutes,
      orderIndex: i.order_index,
      isCompleted: i.is_completed,
      linkRef: i.link_ref ?? {},
    })),
  };
}
