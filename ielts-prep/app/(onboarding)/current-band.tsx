import { useRouter } from 'expo-router';
import React from 'react';

import { BandGrid } from '@/components/onboarding/BandGrid';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Text } from '@/components/ui';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function CurrentBandScreen() {
  const router = useRouter();
  const { currentBand, setCurrentBand } = useOnboardingStore();

  return (
    <OnboardingScaffold
      step={2}
      totalSteps={9}
      title="What's your current estimated band?"
      subtitle="Not sure? Give your best guess — you'll get a more precise estimate after your first mock test."
      onPrimary={() => router.push('/(onboarding)/target-band')}
      secondaryLabel="I don't know yet"
      onSecondary={() => router.push('/(onboarding)/target-band')}
      primaryDisabled={!currentBand}
    >
      <BandGrid value={currentBand} onChange={setCurrentBand} />
      {currentBand ? (
        <Text variant="body" color="secondary" style={{ marginTop: 16 }}>
          Estimated current band: {currentBand.toFixed(1)}
        </Text>
      ) : null}
    </OnboardingScaffold>
  );
}
