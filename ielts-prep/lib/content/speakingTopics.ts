import type { SpeakingTopic } from '@/types/models';

export const speakingTopics: SpeakingTopic[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    part: 'part1',
    topicCategory: 'Hometown',
    cueCardText: null,
    questions: [
      'Where is your hometown?',
      'What do you like most about your hometown?',
      'Has your hometown changed much since you were a child?',
      'Would you like to continue living there in the future?',
    ],
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    part: 'part1',
    topicCategory: 'Hobbies',
    cueCardText: null,
    questions: [
      'What do you like to do in your free time?',
      'Is this something you have enjoyed since childhood?',
      'Do you prefer hobbies you do alone or with other people?',
      'Would you like to try a new hobby in the future?',
    ],
  },
  {
    id: '50000000-0000-0000-0000-000000000003',
    part: 'part2',
    topicCategory: 'A memorable trip',
    cueCardText:
      'Describe a memorable trip you have been on. You should say: where you went, who you went with, what you did there, and explain why this trip was memorable for you.',
    questions: ['Describe a memorable trip you have been on.'],
  },
  {
    id: '50000000-0000-0000-0000-000000000004',
    part: 'part2',
    topicCategory: 'A skill you would like to learn',
    cueCardText:
      'Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how learning this skill would help you.',
    questions: ['Describe a skill you would like to learn.'],
  },
  {
    id: '50000000-0000-0000-0000-000000000005',
    part: 'part3',
    topicCategory: 'Travel and tourism',
    cueCardText: null,
    questions: [
      'How has tourism changed in your country over the last twenty years?',
      'What are the benefits and drawbacks of tourism for a local economy?',
      'Do you think international travel will become more or less common in the future? Why?',
      'Some people say travelling abroad is more valuable than studying it in books — do you agree?',
    ],
  },
  {
    id: '50000000-0000-0000-0000-000000000006',
    part: 'part3',
    topicCategory: 'Skills and education',
    cueCardText: null,
    questions: [
      'Do you think schools should teach practical skills alongside academic subjects?',
      'How has the internet changed the way people learn new skills?',
      'Is it more difficult for adults to learn new skills than for children? Why?',
      'What skills do you think will become more important in the next twenty years?',
    ],
  },
];
