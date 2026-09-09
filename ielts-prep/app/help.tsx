import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, View } from 'react-native';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { confirmAsync } from '@/lib/confirm';
import { deleteAccount } from '@/services/auth';
import { useAppStore } from '@/store/useAppStore';

export default function HelpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const signOut = useAppStore((s) => s.signOut);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    const confirmed = await confirmAsync(
      'Delete account',
      'This permanently deletes your profile, progress, and test history. This cannot be undone.',
      'Delete account'
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      const result = await deleteAccount();
      if (!result.ok) {
        Alert.alert('Could not delete account', result.message ?? 'Please try again later.');
        return;
      }
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (err) {
      Alert.alert('Could not delete account', (err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Help & support" showBack />

      <Card style={{ marginBottom: theme.spacing.md }}>
        <Text variant="bodyMedium" style={{ marginBottom: theme.spacing.xs }}>
          Frequently asked questions
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
          Q: Are the AI band scores official?{'\n'}A: No — every AI-generated score in this app is an estimate for practice purposes only, and is
          never an official IELTS result.
        </Text>
        <Text variant="body" color="secondary">
          Q: Can I use the app without an internet connection?{'\n'}A: Demo Mode works fully offline. Real AI evaluation and Supabase sync require
          a connection.
        </Text>
      </Card>

      <Card onPress={() => Linking.openURL('mailto:support@ieltsprep.app')} style={{ marginBottom: theme.spacing.md }}>
        <Text variant="bodyMedium">Contact support</Text>
        <Text variant="caption" color="secondary">
          support@ieltsprep.app
        </Text>
      </Card>

      <Card style={{ marginBottom: theme.spacing.md, gap: theme.spacing.sm }}>
        <Text variant="bodyMedium">Privacy Policy</Text>
        <Text variant="caption" color="secondary">
          Last updated: this build. This policy describes what IELTS Prep actually does with your data today.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Data we store: your profile (name, email, target band, exam date), practice/test attempts, vocabulary and grammar progress,
          writing and speaking submissions, and subscription status.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Where it&apos;s stored: in Demo Mode, entirely on your device (local storage) and never sent to us. When you sign in with a
          configured Supabase backend, the same data is stored in your account&apos;s rows in our database, isolated from other users.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Third parties: if a real AI provider (OpenAI or Anthropic) is configured, your written and transcribed spoken answers are sent
          to that provider solely to generate feedback — see their own privacy policies for how they handle that data. If a real payments
          provider (RevenueCat / your app store) is configured, purchase and subscription status is shared with them to validate your entitlement.
          We do not sell your data to anyone.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Your rights: you can delete your account and all associated data at any time from this screen. Deletion is permanent and
          cannot be undone.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Children: this app is not directed at children under 13, and we do not knowingly collect data from them.
        </Text>
        <Text variant="caption" color="secondary">
          Questions about this policy can be sent to support@ieltsprep.app. Before a public store launch, have this policy reviewed by counsel
          for your specific jurisdiction and business structure.
        </Text>
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Text variant="bodyMedium">Terms of Service</Text>
        <Text variant="caption" color="secondary">
          By using IELTS Prep, you agree to the following terms.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Practice tool, not an official result: every band score in this app — including AI-generated Writing and Speaking feedback —
          is an estimate for practice purposes only. It is not an official IELTS score and is not affiliated with, endorsed by, or administered by
          IDP, the British Council, or Cambridge Assessment English.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Your account: you are responsible for keeping your login credentials secure and for all activity under your account. You may
          request deletion of your account at any time.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Subscriptions: Premium is billed on a recurring monthly or yearly basis through your app store account. You can manage or
          cancel your subscription at any time from your device&apos;s subscription settings; access continues until the end of the current
          billing period.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Acceptable use: you agree not to misuse the service — including attempting to bypass entitlement checks, reverse-engineer the
          app, or submit content that is unlawful, abusive, or infringes on others&apos; rights.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Disclaimer and liability: the app is provided &quot;as is.&quot; We do not guarantee that using it will result in any particular
          IELTS exam outcome, and we are not liable for decisions made based on its AI-generated feedback.
        </Text>
        <Text variant="caption" color="secondary">
          {'•'} Changes: we may update these terms as the app evolves; continued use after an update means you accept the revised terms.
        </Text>
        <Text variant="caption" color="secondary">
          Before a public store launch, have these terms reviewed by counsel and add your business&apos;s specific governing-law and
          dispute-resolution clauses.
        </Text>
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Text variant="bodyMedium">Acknowledgements</Text>
        <Text variant="caption" color="secondary">
          Some Listening section audio is synthesized locally using the en_GB-vctk-medium voice model for Piper TTS, trained on the VCTK
          Corpus &#40;&copy; University of Edinburgh, Centre for Speech Technology Research&#41;, licensed under{' '}
          <Text
            variant="caption"
            color="brand"
            onPress={() => Linking.openURL('https://creativecommons.org/licenses/by/4.0/')}
          >
            CC BY 4.0
          </Text>
          . No audio, text, or other content from IDP, the British Council, or Cambridge Assessment English is used anywhere in this app.
        </Text>
      </Card>

      <View style={{ marginBottom: theme.spacing.huge }}>
        <Button label="Delete account" variant="danger" onPress={confirmDelete} loading={deleting} fullWidth />
      </View>
    </Screen>
  );
}
