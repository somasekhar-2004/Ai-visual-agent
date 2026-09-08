import { useRouter } from 'expo-router';
import React from 'react';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import type { SkillKey } from '@/types/models';

const SKILLS: { key: SkillKey; title: string; subtitle: string; icon: 'headset-outline' | 'book-outline' | 'create-outline' | 'mic-outline' }[] = [
  { key: 'listening', title: 'Listening', subtitle: 'Understanding spoken English at natural pace', icon: 'headset-outline' },
  { key: 'reading', title: 'Reading', subtitle: 'Comprehension and time pressure', icon: 'book-outline' },
  { key: 'writing', title: 'Writing', subtitle: 'Structure, grammar, and vocabulary range', icon: 'create-outline' },
  { key: 'speaking', title: 'Speaking', subtitle: 'Fluency, pronunciation, and confidence', icon: 'mic-outline' },
];

export default function WeakestSkillScreen() {
  const router = useRouter();
  const { weakestSkill, setWeakestSkill } = useOnboardingStore();

  return (
    <OnboardingScaffold
      step={5}
      totalSteps={9}
      title="Which skill feels most challenging?"
      subtitle="We'll prioritise this in your daily study plan."
      onPrimary={() => router.push('/(onboarding)/study-time')}
      primaryDisabled={!weakestSkill}
    >
      {SKILLS.map((s) => (
        <OptionCard
          key={s.key}
          title={s.title}
          subtitle={s.subtitle}
          icon={s.icon}
          selected={weakestSkill === s.key}
          onPress={() => setWeakestSkill(s.key)}
        />
      ))}
    </OnboardingScaffold>
  );
}
