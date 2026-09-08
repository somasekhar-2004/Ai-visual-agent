import { useRouter } from 'expo-router';
import React from 'react';

import { BandGrid } from '@/components/onboarding/BandGrid';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Text } from '@/components/ui';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function TargetBandScreen() {
  const router = useRouter();
  const { targetBand, setTargetBand } = useOnboardingStore();

  return (
    <OnboardingScaffold
      step={3}
      totalSteps={9}
      title="What's your target band?"
      subtitle="This is the score your course, employer, or visa application requires."
      onPrimary={() => router.push('/(onboarding)/exam-date')}
      primaryDisabled={!targetBand}
    >
      <BandGrid value={targetBand} onChange={setTargetBand} />
      {targetBand ? (
        <Text variant="body" color="secondary" style={{ marginTop: 16 }}>
          Target band: {targetBand.toFixed(1)}
        </Text>
      ) : null}
    </OnboardingScaffold>
  );
}
