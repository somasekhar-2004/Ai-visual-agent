import { buildHref } from './buildHref';
import { content } from './content';

// Deeply-nested `nextHref` query strings (each screen's href embedding the
// next screen's href embedding the next...) turned out to get mangled by
// expo-router on web after 2-3 hops (params silently duplicated, dropped, or
// resolved to the wrong depth). Flow steps sidestep that entirely: every
// screen in a mock test is given the same flat (mockTestId, mockAttemptId,
// stepIndex) triple and independently recomputes the whole step list plus
// its own position in it — no pre-built chain of hrefs is ever threaded
// through query params.

export type MockFlowStep =
  | { skill: 'reading'; passageIds: string[]; durationMinutes: number }
  | { skill: 'listening'; trackIds: string[]; durationMinutes: number }
  | { skill: 'writing'; promptId: string; durationMinutes: number }
  | { skill: 'speaking'; groupId: string | undefined; durationMinutes: number };

export function buildMockFlowSteps(mockTestId: string): MockFlowStep[] {
  const sections = content.mockSections.filter((s) => s.mockTestId === mockTestId).sort((a, b) => a.orderIndex - b.orderIndex);
  const steps: MockFlowStep[] = [];
  for (const s of sections) {
    if (s.skill === 'reading') {
      steps.push({ skill: 'reading', passageIds: s.contentRef.passageIds ?? [], durationMinutes: s.durationMinutes });
    } else if (s.skill === 'listening') {
      steps.push({ skill: 'listening', trackIds: s.contentRef.trackIds ?? [], durationMinutes: s.durationMinutes });
    } else if (s.skill === 'writing') {
      for (const promptId of s.contentRef.writingPromptIds ?? []) {
        steps.push({ skill: 'writing', promptId, durationMinutes: s.durationMinutes });
      }
    } else if (s.skill === 'speaking') {
      const ids = s.contentRef.speakingTopicIds ?? [];
      const groupId = content.speakingTopics.find((t) => ids.includes(t.id))?.groupId;
      steps.push({ skill: 'speaking', groupId, durationMinutes: s.durationMinutes });
    }
  }
  return steps;
}

export function hrefForFlowStep(step: MockFlowStep, mockTestId: string, mockAttemptId: string, stepIndex: number): string {
  const base = { mockTestId, mockAttemptId, stepIndex: String(stepIndex) };
  switch (step.skill) {
    case 'reading':
      return buildHref('/reading-test', { ...base, passageIds: step.passageIds.join(','), durationMinutes: String(step.durationMinutes) });
    case 'listening':
      return buildHref('/listening-test', { ...base, trackIds: step.trackIds.join(','), durationMinutes: String(step.durationMinutes) });
    case 'writing':
      return buildHref('/writing-test', { ...base, promptId: step.promptId });
    case 'speaking':
      return buildHref('/speaking-session', { ...base, part: 'full', groupId: step.groupId });
  }
}

/** The href the "Continue"/"Done" button on a mock-flow screen should go to
 * next, given where it currently is. Falls back to the results screen once
 * every step has been completed. */
export function nextFlowHref(mockTestId: string, mockAttemptId: string, currentStepIndex: number): string {
  const steps = buildMockFlowSteps(mockTestId);
  const next = steps[currentStepIndex + 1];
  if (!next) return buildHref('/mock-result', { mockAttemptId });
  return hrefForFlowStep(next, mockTestId, mockAttemptId, currentStepIndex + 1);
}
