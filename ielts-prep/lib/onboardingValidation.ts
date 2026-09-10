import type { OnboardingInput } from '@/services/repository';
import type { IeltsType, SkillKey } from '@/types/models';

/** Structural shape of useOnboardingStore's persisted wizard answers —
 * every field nullable, exactly as the store itself declares them, so a
 * caller can pass the store's state object directly. */
export type OnboardingWizardState = {
  ieltsType: IeltsType | null;
  currentBand: number | null;
  targetBand: number | null;
  examDate: string | null;
  weakestSkill: SkillKey | null;
  dailyStudyMinutes: number | null;
};

/** The single source of truth for which wizard answers a goal actually
 * requires — mirrors each screen's own `primaryDisabled` gate exactly:
 * ielts-type.tsx, target-band.tsx, and study-time.tsx all disable "Next"
 * until their field has a real value, so these three are the ones that
 * must never be silently defaulted. currentBand, examDate, and
 * weakestSkill are genuinely optional (a student may not know their
 * current band, have booked an exam date, or identified a weakest skill
 * yet) — OnboardingInput accepts null for all three by design. */
function missingRequiredField(state: OnboardingWizardState): 'ieltsType' | 'targetBand' | 'dailyStudyMinutes' | null {
  if (!state.ieltsType) return 'ieltsType';
  if (!state.targetBand) return 'targetBand';
  if (!state.dailyStudyMinutes) return 'dailyStudyMinutes';
  return null;
}

/** Converts the wizard's nullable in-progress state into a save-ready
 * OnboardingInput — or null when any required field is still missing.
 * Never substitutes a default for a missing required field (that was the
 * exact bug: `targetBand: onboarding.targetBand ?? 7` could silently save
 * a fabricated Band 7 goal the user never actually chose). Callers must
 * check for null and resume the wizard rather than calling
 * completeOnboarding with invented values. */
export function validateOnboardingInput(state: OnboardingWizardState): OnboardingInput | null {
  if (missingRequiredField(state)) return null;
  return {
    ieltsType: state.ieltsType!,
    currentBand: state.currentBand,
    targetBand: state.targetBand!,
    examDate: state.examDate,
    weakestSkill: state.weakestSkill,
    dailyStudyMinutes: state.dailyStudyMinutes!,
  };
}

/** Where to send the user to finish the first missing required step, in
 * wizard order — used to safely resume an incomplete onboarding session
 * (e.g. the app was killed mid-wizard, or an email-confirmation deep link
 * arrives before all required steps were completed) instead of either
 * fabricating the missing value or silently discarding already-entered
 * answers. Returns null once nothing required is missing. */
export function firstMissingOnboardingStepRoute(
  state: OnboardingWizardState
): '/(onboarding)/ielts-type' | '/(onboarding)/target-band' | '/(onboarding)/study-time' | null {
  switch (missingRequiredField(state)) {
    case 'ieltsType':
      return '/(onboarding)/ielts-type';
    case 'targetBand':
      return '/(onboarding)/target-band';
    case 'dailyStudyMinutes':
      return '/(onboarding)/study-time';
    case null:
      return null;
  }
}
