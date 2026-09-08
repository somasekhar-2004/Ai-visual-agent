import type { StudyPlanItem } from '@/types/models';

export type StudyPlanNavTarget = { pathname: string; params?: Record<string, string> };

/** Maps a study plan item's `linkRef` (produced by services/repository/studyPlan.ts)
 * to the actual screen that satisfies it. `linkRef` shapes are open-ended by
 * design (a plain JSON blob stored alongside the item), so this is the single
 * place that has to stay in sync with every shape `buildPlanItems` can emit. */
export function studyPlanItemTarget(item: StudyPlanItem): StudyPlanNavTarget {
  const ref = item.linkRef ?? {};

  if (typeof ref.grammarTopic === 'string') {
    return { pathname: '/grammar-practice', params: { topic: ref.grammarTopic } };
  }
  if (ref.mockRecommended) {
    return { pathname: '/(tabs)/tests' };
  }
  if (ref.skill === 'writing') {
    return { pathname: '/writing-prompts' };
  }
  if (ref.skill === 'speaking') {
    const params: Record<string, string> = {};
    if (typeof ref.part === 'string') params.part = ref.part;
    return { pathname: '/speaking-session', params };
  }
  // reading / listening
  const params: Record<string, string> = { skill: String(ref.skill ?? item.skill) };
  if (typeof ref.questionType === 'string') params.questionType = ref.questionType;
  return { pathname: '/practice-session', params };
}
