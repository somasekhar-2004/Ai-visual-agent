import type { Question } from '@/types/models';

export type QuestionGroup = {
  key: string;
  passageId: string | null;
  listeningTrackId: string | null;
  questions: Question[];
};

/** Groups a flat question list into passage/track blocks, preserving the
 * order groups first appear in. Reading questions sharing a passageId (and
 * listening questions sharing a listeningTrackId) are kept together so the
 * source text/audio can be shown once per group instead of once per
 * question. Questions with neither reference stay as their own group. */
export function groupQuestions(questions: Question[]): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  const indexByKey = new Map<string, number>();

  for (const q of questions) {
    const key = q.passageId ? `passage:${q.passageId}` : q.listeningTrackId ? `track:${q.listeningTrackId}` : `solo:${q.id}`;
    const existingIndex = indexByKey.get(key);
    if (existingIndex !== undefined && key !== `solo:${q.id}`) {
      groups[existingIndex].questions.push(q);
    } else {
      indexByKey.set(key, groups.length);
      groups.push({ key, passageId: q.passageId, listeningTrackId: q.listeningTrackId, questions: [q] });
    }
  }
  return groups;
}
