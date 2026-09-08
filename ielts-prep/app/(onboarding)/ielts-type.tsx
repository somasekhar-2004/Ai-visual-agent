import { useRouter } from 'expo-router';
import React from 'react';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function IeltsTypeScreen() {
  const router = useRouter();
  const { ieltsType, setIeltsType } = useOnboardingStore();

  return (
    <OnboardingScaffold
      step={1}
      totalSteps={9}
      title="Which test are you taking?"
      subtitle="This determines the reading passages, writing tasks, and question styles you'll practise."
      onPrimary={() => router.push('/(onboarding)/current-band')}
      primaryDisabled={!ieltsType}
    >
      <OptionCard
        title="IELTS Academic"
        subtitle="For university admission or professional registration"
        icon="school-outline"
        selected={ieltsType === 'academic'}
        onPress={() => setIeltsType('academic')}
      />
      <OptionCard
        title="IELTS General Training"
        subtitle="For work experience, immigration, or secondary education"
        icon="briefcase-outline"
        selected={ieltsType === 'general'}
        onPress={() => setIeltsType('general')}
      />
    </OnboardingScaffold>
  );
}
