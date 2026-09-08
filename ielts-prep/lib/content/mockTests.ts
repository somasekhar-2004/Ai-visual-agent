import type { MockSection, MockTest } from '@/types/models';
import { speakingTopics } from './speakingTopics';
import { writingPrompts } from './writingPrompts';

// Reading and Listening content ids below follow the exact scheme used when
// each content set was generated (see lib/content/readingAcademic2.ts,
// readingGeneral2.ts, listening2.ts, listening3.ts) — 3 passages per Reading
// mock (sectionNumber 1-3) and 4 tracks per Listening mock (sectionNumber 1-4).
const ACADEMIC_MOCK2_PASSAGES = ['21000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000003'];
const GENERAL_MOCK2_PASSAGES = ['22000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000003'];

// Mock 1's listening test is completed by 2 tracks generated later
// (sections 2 and 3) alongside the original 2 (sections 1 and 4).
const LISTENING_MOCK1_TRACKS = [
  '30000000-0000-0000-0000-000000000001', // section 1 (original)
  '31000000-0000-0000-0000-000000000001', // section 2
  '31000000-0000-0000-0000-000000000002', // section 3
  '30000000-0000-0000-0000-000000000002', // section 4 (original)
];
const LISTENING_MOCK2_TRACKS = [
  '31000000-0000-0000-0000-000000000003',
  '31000000-0000-0000-0000-000000000004',
  '31000000-0000-0000-0000-000000000005',
  '31000000-0000-0000-0000-000000000006',
];
const LISTENING_MOCK3_TRACKS = [
  '32000000-0000-0000-0000-000000000001',
  '32000000-0000-0000-0000-000000000002',
  '32000000-0000-0000-0000-000000000003',
  '32000000-0000-0000-0000-000000000004',
];
const LISTENING_MOCK4_TRACKS = [
  '33000000-0000-0000-0000-000000000001',
  '33000000-0000-0000-0000-000000000002',
  '33000000-0000-0000-0000-000000000003',
  '33000000-0000-0000-0000-000000000004',
];

// Writing prompts and speaking topic groups are plentiful (95 prompts, 50
// groups) so mocks 1 and 2 for each IELTS type simply take the Nth distinct
// match instead of hand-picking ids — this keeps working automatically as
// more prompts/groups are added later.
function nthWritingPrompt(taskType: 'task1_academic' | 'task1_general', ieltsType: 'academic' | 'general', n: number): string {
  return writingPrompts.filter((p) => p.taskType === taskType && p.ieltsType === ieltsType)[n].id;
}
function nthTask2Prompt(ieltsType: 'academic' | 'general', n: number): string {
  return writingPrompts.filter((p) => p.taskType === 'task2' && p.ieltsType === ieltsType)[n].id;
}
function nthSpeakingGroupTopicIds(n: number): string[] {
  const groupIds = Array.from(new Set(speakingTopics.map((t) => t.groupId)));
  return speakingTopics.filter((t) => t.groupId === groupIds[n]).map((t) => t.id);
}

export const mockTests: MockTest[] = [
  { id: '60000000-0000-0000-0000-000000000001', title: 'IELTS Academic Full Mock Test 1', ieltsType: 'academic', testNumber: 1, difficulty: 'easy', isFree: true },
  { id: '60000000-0000-0000-0000-000000000002', title: 'IELTS General Training Full Mock Test 1', ieltsType: 'general', testNumber: 1, difficulty: 'easy', isFree: true },
  { id: '60000000-0000-0000-0000-000000000003', title: 'IELTS Academic Full Mock Test 2', ieltsType: 'academic', testNumber: 2, difficulty: 'medium', isFree: false },
  { id: '60000000-0000-0000-0000-000000000004', title: 'IELTS General Training Full Mock Test 2', ieltsType: 'general', testNumber: 2, difficulty: 'medium', isFree: false },
];

export const mockSections: MockSection[] = [
  // --- Academic Mock 1 (free) ---
  { id: 'ms-ac1-1', mockTestId: '60000000-0000-0000-0000-000000000001', skill: 'listening', orderIndex: 1, durationMinutes: 30, contentRef: { trackIds: LISTENING_MOCK1_TRACKS } },
  { id: 'ms-ac1-2', mockTestId: '60000000-0000-0000-0000-000000000001', skill: 'reading', orderIndex: 2, durationMinutes: 60, contentRef: { passageIds: ['20000000-0000-0000-0000-000000000001'] } },
  { id: 'ms-ac1-3', mockTestId: '60000000-0000-0000-0000-000000000001', skill: 'writing', orderIndex: 3, durationMinutes: 60, contentRef: { writingPromptIds: [nthWritingPrompt('task1_academic', 'academic', 0), nthTask2Prompt('academic', 0)] } },
  { id: 'ms-ac1-4', mockTestId: '60000000-0000-0000-0000-000000000001', skill: 'speaking', orderIndex: 4, durationMinutes: 14, contentRef: { speakingTopicIds: nthSpeakingGroupTopicIds(0) } },

  // --- General Mock 1 (free) ---
  { id: 'ms-gt1-1', mockTestId: '60000000-0000-0000-0000-000000000002', skill: 'listening', orderIndex: 1, durationMinutes: 30, contentRef: { trackIds: LISTENING_MOCK2_TRACKS } },
  { id: 'ms-gt1-2', mockTestId: '60000000-0000-0000-0000-000000000002', skill: 'reading', orderIndex: 2, durationMinutes: 60, contentRef: { passageIds: ['20000000-0000-0000-0000-000000000002'] } },
  { id: 'ms-gt1-3', mockTestId: '60000000-0000-0000-0000-000000000002', skill: 'writing', orderIndex: 3, durationMinutes: 60, contentRef: { writingPromptIds: [nthWritingPrompt('task1_general', 'general', 0), nthTask2Prompt('general', 0)] } },
  { id: 'ms-gt1-4', mockTestId: '60000000-0000-0000-0000-000000000002', skill: 'speaking', orderIndex: 4, durationMinutes: 14, contentRef: { speakingTopicIds: nthSpeakingGroupTopicIds(1) } },

  // --- Academic Mock 2 (premium) ---
  { id: 'ms-ac2-1', mockTestId: '60000000-0000-0000-0000-000000000003', skill: 'listening', orderIndex: 1, durationMinutes: 30, contentRef: { trackIds: LISTENING_MOCK3_TRACKS } },
  { id: 'ms-ac2-2', mockTestId: '60000000-0000-0000-0000-000000000003', skill: 'reading', orderIndex: 2, durationMinutes: 60, contentRef: { passageIds: ACADEMIC_MOCK2_PASSAGES } },
  { id: 'ms-ac2-3', mockTestId: '60000000-0000-0000-0000-000000000003', skill: 'writing', orderIndex: 3, durationMinutes: 60, contentRef: { writingPromptIds: [nthWritingPrompt('task1_academic', 'academic', 1), nthTask2Prompt('academic', 1)] } },
  { id: 'ms-ac2-4', mockTestId: '60000000-0000-0000-0000-000000000003', skill: 'speaking', orderIndex: 4, durationMinutes: 14, contentRef: { speakingTopicIds: nthSpeakingGroupTopicIds(2) } },

  // --- General Mock 2 (premium) ---
  { id: 'ms-gt2-1', mockTestId: '60000000-0000-0000-0000-000000000004', skill: 'listening', orderIndex: 1, durationMinutes: 30, contentRef: { trackIds: LISTENING_MOCK4_TRACKS } },
  { id: 'ms-gt2-2', mockTestId: '60000000-0000-0000-0000-000000000004', skill: 'reading', orderIndex: 2, durationMinutes: 60, contentRef: { passageIds: GENERAL_MOCK2_PASSAGES } },
  { id: 'ms-gt2-3', mockTestId: '60000000-0000-0000-0000-000000000004', skill: 'writing', orderIndex: 3, durationMinutes: 60, contentRef: { writingPromptIds: [nthWritingPrompt('task1_general', 'general', 1), nthTask2Prompt('general', 1)] } },
  { id: 'ms-gt2-4', mockTestId: '60000000-0000-0000-0000-000000000004', skill: 'speaking', orderIndex: 4, durationMinutes: 14, contentRef: { speakingTopicIds: nthSpeakingGroupTopicIds(3) } },
];
