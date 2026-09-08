import { useRouter } from 'expo-router';
import React from 'react';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const OPTIONS = [
  { minutes: 15, label: '15 minutes', subtitle: 'Light and steady' },
  { minutes: 30, label: '30 minutes', subtitle: 'Balanced daily habit' },
  { minutes: 45, label: '45 minutes', subtitle: 'Focused preparation' },
  { minutes: 60, label: '1 hour', subtitle: 'Intensive prep' },
  { minutes: 90, label: '1.5 hours+', subtitle: 'Exam is coming up fast' },
];

export default function StudyTimeScreen() {
  const router = useRouter();
  const { dailyStudyMinutes, setDailyStudyMinutes } = useOnboardingStore();

  return (
    <OnboardingScaffold
      step={6}
      totalSteps={9}
      title="How much time can you study each day?"
      subtitle="Be realistic — a consistent short session beats an occasional long one."
      onPrimary={() => router.push('/(onboarding)/notifications')}
      primaryDisabled={!dailyStudyMinutes}
    >
      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.minutes}
          title={opt.label}
          subtitle={opt.subtitle}
          icon="time-outline"
          selected={dailyStudyMinutes === opt.minutes}
          onPress={() => setDailyStudyMinutes(opt.minutes)}
        />
      ))}
    </OnboardingScaffold>
  );
}
