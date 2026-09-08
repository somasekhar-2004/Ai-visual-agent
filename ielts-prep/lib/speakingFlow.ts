import { content } from '@/lib/content';
import type { SpeakingPart } from '@/types/models';

export type SpeakingTurn = {
  id: string;
  part: SpeakingPart;
  topicId: string;
  questionText: string;
  isCue: boolean;
  cueCardText?: string;
  prepSeconds: number;
  maxSpeakSeconds: number;
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Builds the question sequence for a speaking session. Part 1, 2, and 3 are
 * always drawn from the SAME topic group (Part 3 is written to logically
 * extend Part 2's cue-card theme into broader discussion) — never three
 * independently-random topics, which would make Part 3 unrelated to what
 * the candidate just described in Part 2.
 *
 * `groupId` pins a specific group (used by full mock tests, so a given mock
 * test always asks the same coherent group); omit it to pick one at random
 * (used by ad-hoc practice sessions). */
export function buildSpeakingTurns(part: SpeakingPart, groupId?: string): SpeakingTurn[] {
  const turns: SpeakingTurn[] = [];
  const allGroupIds = Array.from(new Set(content.speakingTopics.map((t) => t.groupId)));
  const resolvedGroupId = groupId && allGroupIds.includes(groupId) ? groupId : pickRandom(allGroupIds);
  const groupTopics = content.speakingTopics.filter((t) => t.groupId === resolvedGroupId);

  function topicFor(p: SpeakingPart) {
    return groupTopics.find((t) => t.part === p) ?? pickRandom(content.speakingTopics.filter((t) => t.part === p));
  }

  function addPart1() {
    const topic = topicFor('part1');
    topic.questions.forEach((q, i) =>
      turns.push({ id: `${topic.id}-${i}`, part: 'part1', topicId: topic.id, questionText: q, isCue: false, prepSeconds: 0, maxSpeakSeconds: 45 })
    );
  }
  function addPart2() {
    const topic = topicFor('part2');
    turns.push({
      id: `${topic.id}-cue`,
      part: 'part2',
      topicId: topic.id,
      questionText: topic.questions[0],
      isCue: true,
      cueCardText: topic.cueCardText ?? topic.questions[0],
      prepSeconds: 60,
      maxSpeakSeconds: 120,
    });
  }
  function addPart3() {
    const topic = topicFor('part3');
    topic.questions.forEach((q, i) =>
      turns.push({ id: `${topic.id}-${i}`, part: 'part3', topicId: topic.id, questionText: q, isCue: false, prepSeconds: 0, maxSpeakSeconds: 60 })
    );
  }

  if (part === 'part1') addPart1();
  else if (part === 'part2') addPart2();
  else if (part === 'part3') addPart3();
  else {
    addPart1();
    addPart2();
    addPart3();
  }
  return turns;
}
