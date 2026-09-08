import { getDb, mutateDb } from '@/lib/demoStore';
import { isDemoMode } from '@/lib/env';
import { generateId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import type { SkillKey, StudyPlan, StudyPlanItem, UserGoal } from '@/types/models';

const SKILL_ORDER: SkillKey[] = ['reading', 'writing', 'listening', 'speaking'];

const SKILL_ACTIVITY: Record<SkillKey, { title: string; description: string }> = {
  reading: { title: 'Reading practice', description: 'True/False/Not Given question set' },
  writing: { title: 'Writing practice', description: 'Task 2 introduction & body paragraph drill' },
  listening: { title: 'Listening practice', description: 'Form completion with number/spelling focus' },
  speaking: { title: 'Speaking practice', description: 'Part 2 cue card with 1-minute prep' },
};

/** Deterministically builds a daily plan: the weakest skill gets the largest
 * share of the available time, the remaining time is split across the other
 * three skills in ascending order of estimated band (weakest first). */
export function buildPlanItems(goal: UserGoal, bandBySkill: Partial<Record<SkillKey, number>>): Omit<StudyPlanItem, 'id' | 'studyPlanId'>[] {
  const totalMinutes = goal.dailyStudyMinutes;
  const skillsByWeakness = [...SKILL_ORDER].sort((a, b) => (bandBySkill[a] ?? 6) - (bandBySkill[b] ?? 6));
  const primary = goal.weakestSkill ?? skillsByWeakness[0];
  const ordered = [primary, ...skillsByWeakness.filter((s) => s !== primary)];

  // Primary skill gets ~40%, remaining time split across the other three.
  const primaryMinutes = Math.max(10, Math.round(totalMinutes * 0.4));
  const remaining = Math.max(0, totalMinutes - primaryMinutes);
  const perOther = Math.floor(remaining / 3) || 5;

  return ordered.map((skill, index) => ({
    skill,
    title: SKILL_ACTIVITY[skill].title,
    description: SKILL_ACTIVITY[skill].description,
    durationMinutes: index === 0 ? primaryMinutes : perOther,
    orderIndex: index,
    isCompleted: false,
    linkRef: { skill },
  }));
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

  const items = buildPlanItems(goal, bandBySkill);

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
