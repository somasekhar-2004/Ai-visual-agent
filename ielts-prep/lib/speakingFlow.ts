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

export function buildSpeakingTurns(part: SpeakingPart): SpeakingTurn[] {
  const turns: SpeakingTurn[] = [];

  function addPart1() {
    const topic = pickRandom(content.speakingTopics.filter((t) => t.part === 'part1'));
    topic.questions.forEach((q, i) =>
      turns.push({ id: `${topic.id}-${i}`, part: 'part1', topicId: topic.id, questionText: q, isCue: false, prepSeconds: 0, maxSpeakSeconds: 45 })
    );
  }
  function addPart2() {
    const topic = pickRandom(content.speakingTopics.filter((t) => t.part === 'part2'));
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
    const topic = pickRandom(content.speakingTopics.filter((t) => t.part === 'part3'));
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
