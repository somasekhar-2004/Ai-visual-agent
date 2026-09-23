// Regression coverage for the FINAL PRE-LAUNCH PRODUCT AUDIT's Mock Test
// section: resume behavior and step sequencing had no test coverage at
// all before this. Uses the real bundled content (Academic Full Mock Test
// 1) rather than a synthetic fixture, so this also doubles as a structural
// check that a real mock's sections actually produce a sane, ordered flow.

import { buildHref } from '@/lib/buildHref';
import { content } from '@/lib/content';
import { buildMockFlowSteps, hrefForFlowStep, nextFlowHref } from '@/lib/mockFlow';

const ACADEMIC_MOCK_1_ID = '60000000-0000-0000-0000-000000000001';

describe('buildMockFlowSteps — real bundled content', () => {
  it('produces one step per section, in orderIndex order, except Writing which expands to one step per prompt', () => {
    const steps = buildMockFlowSteps(ACADEMIC_MOCK_1_ID);
    // The real Academic Full Mock Test 1 section is (listening, reading,
    // writing[2 prompts], speaking) — Writing's single section contains two
    // writingPromptIds (Task 1 + Task 2), which must become two independent
    // flow steps so each task gets its own timed screen.
    expect(steps.map((s) => s.skill)).toEqual(['listening', 'reading', 'writing', 'writing', 'speaking']);
  });

  it('carries the real content ids through for Reading/Listening/Writing/Speaking', () => {
    const steps = buildMockFlowSteps(ACADEMIC_MOCK_1_ID);
    const listening = steps.find((s) => s.skill === 'listening')!;
    const reading = steps.find((s) => s.skill === 'reading')!;
    const writingSteps = steps.filter((s) => s.skill === 'writing');
    const speaking = steps.find((s) => s.skill === 'speaking')!;

    expect(listening.skill === 'listening' && listening.trackIds.length).toBeGreaterThan(0);
    expect(reading.skill === 'reading' && reading.passageIds.length).toBeGreaterThan(0);
    expect(writingSteps).toHaveLength(2);
    expect(writingSteps.every((s) => s.skill === 'writing' && typeof s.promptId === 'string')).toBe(true);
    expect(speaking.skill === 'speaking' && speaking.groupId).toBeTruthy();
  });

  it('returns an empty array for a mock test id with no sections', () => {
    expect(buildMockFlowSteps('not-a-real-mock-test-id')).toEqual([]);
  });

  it('resolves the speaking step\'s groupId from the actual speaking_topics group, not the raw topic id', () => {
    const steps = buildMockFlowSteps(ACADEMIC_MOCK_1_ID);
    const speaking = steps.find((s) => s.skill === 'speaking')!;
    const section = content.mockSections.find((s) => s.mockTestId === ACADEMIC_MOCK_1_ID && s.skill === 'speaking')!;
    const firstTopicId = section.contentRef.speakingTopicIds![0];
    const expectedGroupId = content.speakingTopics.find((t) => t.id === firstTopicId)?.groupId;
    expect(speaking.skill === 'speaking' && speaking.groupId).toBe(expectedGroupId);
  });
});

describe('hrefForFlowStep', () => {
  const mockAttemptId = 'attempt-1';

  it('builds the exact href buildHref would for a reading step', () => {
    const steps = buildMockFlowSteps(ACADEMIC_MOCK_1_ID);
    const reading = steps.find((s) => s.skill === 'reading')!;
    const href = hrefForFlowStep(reading, ACADEMIC_MOCK_1_ID, mockAttemptId, 1);
    expect(href).toBe(
      reading.skill === 'reading'
        ? buildHref('/reading-test', {
            mockTestId: ACADEMIC_MOCK_1_ID,
            mockAttemptId,
            stepIndex: '1',
            passageIds: reading.passageIds.join(','),
            durationMinutes: String(reading.durationMinutes),
          })
        : ''
    );
  });

  it('gives each of the two Writing steps its own promptId in the href (never the same task twice)', () => {
    const steps = buildMockFlowSteps(ACADEMIC_MOCK_1_ID);
    const writingSteps = steps.filter((s) => s.skill === 'writing');
    const hrefs = writingSteps.map((s, i) => hrefForFlowStep(s, ACADEMIC_MOCK_1_ID, mockAttemptId, i));
    const promptIds = hrefs.map((h) => new URLSearchParams(h.split('?')[1]).get('promptId'));
    expect(new Set(promptIds).size).toBe(2);
  });
});

describe('nextFlowHref — mock-flow resume/advance behavior', () => {
  const mockAttemptId = 'attempt-1';

  it('advances from the first step to the second step', () => {
    const href = nextFlowHref(ACADEMIC_MOCK_1_ID, mockAttemptId, 0);
    const steps = buildMockFlowSteps(ACADEMIC_MOCK_1_ID);
    expect(href).toBe(hrefForFlowStep(steps[1], ACADEMIC_MOCK_1_ID, mockAttemptId, 1));
    expect(href).not.toBe(hrefForFlowStep(steps[0], ACADEMIC_MOCK_1_ID, mockAttemptId, 0));
  });

  it('advances correctly across the two-step Writing expansion (Task 1 -> Task 2, not skipped)', () => {
    const steps = buildMockFlowSteps(ACADEMIC_MOCK_1_ID);
    const firstWritingIndex = steps.findIndex((s) => s.skill === 'writing');
    const href = nextFlowHref(ACADEMIC_MOCK_1_ID, mockAttemptId, firstWritingIndex);
    expect(steps[firstWritingIndex + 1].skill).toBe('writing');
    expect(href).toContain('/writing-test');
  });

  it('falls back to the results screen once the last step (Speaking) has been completed — partial completion never silently loops or dead-ends', () => {
    const steps = buildMockFlowSteps(ACADEMIC_MOCK_1_ID);
    const lastIndex = steps.length - 1;
    const href = nextFlowHref(ACADEMIC_MOCK_1_ID, mockAttemptId, lastIndex);
    expect(href).toBe(buildHref('/mock-result', { mockAttemptId }));
  });

  it('also lands on the results screen if called with an out-of-range step index (defensive, never throws)', () => {
    const href = nextFlowHref(ACADEMIC_MOCK_1_ID, mockAttemptId, 999);
    expect(href).toBe(buildHref('/mock-result', { mockAttemptId }));
  });
});
