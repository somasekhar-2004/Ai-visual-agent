// Regression coverage for a real launch-risk found in audit: two onboarding
// completion paths — app/(onboarding)/account.tsx's finishOnboarding() and
// app/confirm.tsx's handleContinue() (the email-confirmation deep-link
// screen) — used `targetBand: onboarding.targetBand ?? 7` (and
// `dailyStudyMinutes: onboarding.dailyStudyMinutes ?? 30`) when calling
// completeOnboarding(). In the normal linear wizard this is unreachable
// (each required step disables "Next" until answered), but confirm.tsx's
// save only ever checked `if (onboarding.ieltsType)` before saving — an
// email-confirmation link opened after a partially-completed/abandoned
// onboarding session (app killed mid-wizard, a stale link) could silently
// insert a real user_goals row with a fabricated Band 7 the user never
// chose.
//
// The fix: lib/onboardingValidation.ts's validateOnboardingInput() is now
// the single source of truth for "is this goal actually save-ready" —
// never substitutes a default for a missing required field — and
// firstMissingOnboardingStepRoute() sends the user back to finish it
// instead. Both screens were rewritten to use these.
//
// These tests exercise validateOnboardingInput/firstMissingOnboardingStepRoute
// directly, plus small mirror functions of each screen's exact decision
// logic (the same style __tests__/goalEditFlow.test.ts uses for
// profile-edit.tsx's handleSave) — proving the branching itself, not just
// the helpers in isolation.
import { firstMissingOnboardingStepRoute, validateOnboardingInput, type OnboardingWizardState } from '@/lib/onboardingValidation';
import type { OnboardingInput } from '@/services/repository';

const COMPLETE_STATE: OnboardingWizardState = {
  ieltsType: 'academic',
  currentBand: 6,
  targetBand: 7.5,
  examDate: '2026-06-01',
  weakestSkill: 'writing',
  dailyStudyMinutes: 45,
};

describe('validateOnboardingInput — never fabricates a required field', () => {
  it('a fully complete state with a real target of 7.5 saves exactly 7.5, not a rounded/defaulted value', () => {
    const input = validateOnboardingInput(COMPLETE_STATE);
    expect(input).toEqual<OnboardingInput>({
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7.5,
      examDate: '2026-06-01',
      weakestSkill: 'writing',
      dailyStudyMinutes: 45,
    });
  });

  it('a missing target band returns null — never substitutes Band 7', () => {
    const input = validateOnboardingInput({ ...COMPLETE_STATE, targetBand: null });
    expect(input).toBeNull();
  });

  it('a missing ielts type returns null', () => {
    const input = validateOnboardingInput({ ...COMPLETE_STATE, ieltsType: null });
    expect(input).toBeNull();
  });

  it('a missing daily study time returns null — never substitutes 30 minutes', () => {
    const input = validateOnboardingInput({ ...COMPLETE_STATE, dailyStudyMinutes: null });
    expect(input).toBeNull();
  });

  it('legitimately optional fields (currentBand, examDate, weakestSkill) left null still produce a valid, save-ready input', () => {
    const input = validateOnboardingInput({ ...COMPLETE_STATE, currentBand: null, examDate: null, weakestSkill: null });
    expect(input).toEqual<OnboardingInput>({
      ieltsType: 'academic',
      currentBand: null,
      targetBand: 7.5,
      examDate: null,
      weakestSkill: null,
      dailyStudyMinutes: 45,
    });
  });

  it('an entirely empty (freshly-reset) state returns null', () => {
    const empty: OnboardingWizardState = { ieltsType: null, currentBand: null, targetBand: null, examDate: null, weakestSkill: null, dailyStudyMinutes: null };
    expect(validateOnboardingInput(empty)).toBeNull();
  });
});

describe('firstMissingOnboardingStepRoute — resumes at the right step, in wizard order', () => {
  it('sends the user to ielts-type first when nothing is answered', () => {
    const empty: OnboardingWizardState = { ieltsType: null, currentBand: null, targetBand: null, examDate: null, weakestSkill: null, dailyStudyMinutes: null };
    expect(firstMissingOnboardingStepRoute(empty)).toBe('/(onboarding)/ielts-type');
  });

  it('sends the user to target-band when ielts type is answered but target band is not', () => {
    expect(firstMissingOnboardingStepRoute({ ...COMPLETE_STATE, targetBand: null })).toBe('/(onboarding)/target-band');
  });

  it('sends the user to study-time when everything but daily study time is answered', () => {
    expect(firstMissingOnboardingStepRoute({ ...COMPLETE_STATE, dailyStudyMinutes: null })).toBe('/(onboarding)/study-time');
  });

  it('returns null once nothing required is missing', () => {
    expect(firstMissingOnboardingStepRoute(COMPLETE_STATE)).toBeNull();
  });
});

/** Mirrors app/(onboarding)/account.tsx's finishOnboarding() exactly. */
async function runAccountFinishOnboarding(onboarding: OnboardingWizardState, completeOnboarding: jest.Mock, routerReplace: jest.Mock) {
  const input = validateOnboardingInput(onboarding);
  if (!input) {
    const route = firstMissingOnboardingStepRoute(onboarding);
    if (route) routerReplace(route);
    return;
  }
  await completeOnboarding(input);
  routerReplace('/(onboarding)/plan-ready');
}

describe("app/(onboarding)/account.tsx's finishOnboarding — mirrored decision logic", () => {
  it('a complete onboarding state saves the goal and advances to plan-ready', async () => {
    const completeOnboarding = jest.fn().mockResolvedValue(undefined);
    const routerReplace = jest.fn();
    await runAccountFinishOnboarding(COMPLETE_STATE, completeOnboarding, routerReplace);
    expect(completeOnboarding).toHaveBeenCalledWith(expect.objectContaining({ targetBand: 7.5 }));
    expect(routerReplace).toHaveBeenCalledWith('/(onboarding)/plan-ready');
  });

  it('an incomplete state (reached via a stale deep link) never calls completeOnboarding — no fabricated goal is ever saved', async () => {
    const completeOnboarding = jest.fn();
    const routerReplace = jest.fn();
    await runAccountFinishOnboarding({ ...COMPLETE_STATE, targetBand: null }, completeOnboarding, routerReplace);
    expect(completeOnboarding).not.toHaveBeenCalled();
    expect(routerReplace).toHaveBeenCalledWith('/(onboarding)/target-band');
  });
});

/** Mirrors app/confirm.tsx's handleContinue() decision branching exactly
 * (minus hydrate()/exchangeConfirmationCode(), which this doesn't need to
 * re-prove — those are unrelated to the fabrication fix). */
async function runConfirmHandleContinue(
  onboarding: OnboardingWizardState,
  deps: { completeOnboarding: jest.Mock; reset: jest.Mock; setOnboardingComplete: jest.Mock; routerReplace: jest.Mock }
) {
  const input = validateOnboardingInput(onboarding);
  if (input) {
    await deps.completeOnboarding(input);
    deps.reset();
    deps.routerReplace('/(tabs)');
  } else if (onboarding.ieltsType) {
    deps.routerReplace(firstMissingOnboardingStepRoute(onboarding)!);
  } else {
    await deps.setOnboardingComplete();
    deps.routerReplace('/(tabs)');
  }
}

describe("app/confirm.tsx's handleContinue — never fabricates a goal from an incomplete deep-link arrival", () => {
  function makeDeps() {
    return {
      completeOnboarding: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn(),
      setOnboardingComplete: jest.fn().mockResolvedValue(undefined),
      routerReplace: jest.fn(),
    };
  }

  it('a complete confirmation flow (all required wizard answers present) saves the goal correctly and clears the wizard store', async () => {
    const deps = makeDeps();
    await runConfirmHandleContinue(COMPLETE_STATE, deps);
    expect(deps.completeOnboarding).toHaveBeenCalledWith(expect.objectContaining({ targetBand: 7.5, dailyStudyMinutes: 45 }));
    expect(deps.reset).toHaveBeenCalledTimes(1);
    expect(deps.setOnboardingComplete).not.toHaveBeenCalled();
    expect(deps.routerReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('a confirmation deep-link arriving with real-but-incomplete onboarding state (e.g. app was killed before target-band) saves NO goal row and resumes the wizard instead', async () => {
    const deps = makeDeps();
    await runConfirmHandleContinue({ ...COMPLETE_STATE, targetBand: null }, deps);
    expect(deps.completeOnboarding).not.toHaveBeenCalled();
    expect(deps.reset).not.toHaveBeenCalled(); // already-entered answers (ieltsType, currentBand, ...) are preserved, not discarded
    expect(deps.setOnboardingComplete).not.toHaveBeenCalled();
    expect(deps.routerReplace).toHaveBeenCalledWith('/(onboarding)/target-band');
  });

  it('a confirmation deep-link with a completely empty wizard store (re-confirmation for an account whose goal already exists) saves no goal and just marks onboarding complete — the pre-existing, correct behavior', async () => {
    const deps = makeDeps();
    const empty: OnboardingWizardState = { ieltsType: null, currentBand: null, targetBand: null, examDate: null, weakestSkill: null, dailyStudyMinutes: null };
    await runConfirmHandleContinue(empty, deps);
    expect(deps.completeOnboarding).not.toHaveBeenCalled();
    expect(deps.setOnboardingComplete).toHaveBeenCalledTimes(1);
    expect(deps.routerReplace).toHaveBeenCalledWith('/(tabs)');
  });
});
