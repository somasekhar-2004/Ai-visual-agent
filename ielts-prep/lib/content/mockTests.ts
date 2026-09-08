import type { MockSection, MockTest } from '@/types/models';

export const mockTests: MockTest[] = [
  { id: '60000000-0000-0000-0000-000000000001', title: 'IELTS Academic Full Mock Test 1', ieltsType: 'academic', isFree: true },
  { id: '60000000-0000-0000-0000-000000000002', title: 'IELTS General Training Full Mock Test 1', ieltsType: 'general', isFree: false },
];

export const mockSections: MockSection[] = [
  { id: 'ms-ac-1', mockTestId: '60000000-0000-0000-0000-000000000001', skill: 'listening', orderIndex: 1, durationMinutes: 30, contentRef: { trackIds: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'] } },
  { id: 'ms-ac-2', mockTestId: '60000000-0000-0000-0000-000000000001', skill: 'reading', orderIndex: 2, durationMinutes: 60, contentRef: { passageIds: ['20000000-0000-0000-0000-000000000001'] } },
  { id: 'ms-ac-3', mockTestId: '60000000-0000-0000-0000-000000000001', skill: 'writing', orderIndex: 3, durationMinutes: 60, contentRef: { writingPromptIds: ['40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003'] } },
  { id: 'ms-ac-4', mockTestId: '60000000-0000-0000-0000-000000000001', skill: 'speaking', orderIndex: 4, durationMinutes: 14, contentRef: { speakingTopicIds: ['50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000005'] } },

  { id: 'ms-gt-1', mockTestId: '60000000-0000-0000-0000-000000000002', skill: 'listening', orderIndex: 1, durationMinutes: 30, contentRef: { trackIds: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'] } },
  { id: 'ms-gt-2', mockTestId: '60000000-0000-0000-0000-000000000002', skill: 'reading', orderIndex: 2, durationMinutes: 60, contentRef: { passageIds: ['20000000-0000-0000-0000-000000000002'] } },
  { id: 'ms-gt-3', mockTestId: '60000000-0000-0000-0000-000000000002', skill: 'writing', orderIndex: 3, durationMinutes: 60, contentRef: { writingPromptIds: ['40000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004'] } },
  { id: 'ms-gt-4', mockTestId: '60000000-0000-0000-0000-000000000002', skill: 'speaking', orderIndex: 4, durationMinutes: 14, contentRef: { speakingTopicIds: ['50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000006'] } },
];
