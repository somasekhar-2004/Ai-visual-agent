import { useRouter } from 'expo-router';
import React from 'react';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notificationsEnabled, setNotificationsEnabled } = useOnboardingStore();

  return (
    <OnboardingScaffold
      step={7}
      totalSteps={9}
      title="Stay on track with reminders?"
      subtitle="We'll send a daily study reminder and a countdown as your exam approaches. You can change this anytime."
      onPrimary={() => router.push('/(onboarding)/account')}
    >
      <OptionCard
        title="Yes, remind me daily"
        subtitle="Recommended — students with reminders study more consistently"
        icon="notifications-outline"
        selected={notificationsEnabled}
        onPress={() => setNotificationsEnabled(true)}
      />
      <OptionCard
        title="No, I'll check the app myself"
        icon="notifications-off-outline"
        selected={!notificationsEnabled}
        onPress={() => setNotificationsEnabled(false)}
      />
    </OnboardingScaffold>
  );
}
