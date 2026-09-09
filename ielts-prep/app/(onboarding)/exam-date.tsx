import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { Text } from '@/components/ui';
import { useOnboardingStore } from '@/store/useOnboardingStore';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const OPTIONS = [
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '6 weeks', days: 42 },
  { label: '2 months', days: 60 },
  { label: '3+ months', days: 90 },
];

export default function ExamDateScreen() {
  const router = useRouter();
  const { examDate, setExamDate } = useOnboardingStore();
  // The store's examDate defaults to null, which is also the "no date yet"
  // option's own value — track whether the user has actually pressed
  // something yet so that option doesn't render pre-selected on first view.
  const [hasChosen, setHasChosen] = useState(false);

  return (
    <OnboardingScaffold
      step={4}
      totalSteps={9}
      title="When is your IELTS test?"
      subtitle="We'll use this to pace your study plan and countdown."
      onPrimary={() => router.push('/(onboarding)/weakest-skill')}
    >
      <View>
        {OPTIONS.map((opt) => {
          const date = daysFromNow(opt.days);
          return (
            <OptionCard
              key={opt.label}
              title={`In about ${opt.label}`}
              subtitle={date}
              icon="calendar-outline"
              selected={hasChosen && examDate === date}
              onPress={() => {
                setHasChosen(true);
                setExamDate(date);
              }}
            />
          );
        })}
        <OptionCard
          title="I haven't booked a date yet"
          icon="help-circle-outline"
          selected={hasChosen && examDate === null}
          onPress={() => {
            setHasChosen(true);
            setExamDate(null);
          }}
        />
      </View>
      <Text variant="caption" color="tertiary" style={{ marginTop: 8 }}>
        You can fine-tune your exact date later in Settings.
      </Text>
    </OnboardingScaffold>
  );
}
