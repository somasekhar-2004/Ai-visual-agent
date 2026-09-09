import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import { audioRegistry } from '@/lib/content/audioRegistry';
import { isRevenueCatConfigured, isSupabaseConfigured } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';

type CheckStatus = 'idle' | 'running' | 'pass' | 'fail' | 'info';
type CheckResult = { id: string; title: string; status: CheckStatus; detail: string };

const AI_FUNCTIONS = ['evaluate-writing', 'evaluate-speaking', 'ai-coach', 'transcribe-audio', 'study-plan-suggestion'] as const;

function initialResults(): CheckResult[] {
  return [
    { id: 'supabase-config', title: 'Supabase configured', status: 'idle', detail: '' },
    { id: 'supabase-reachable', title: 'Supabase reachable', status: 'idle', detail: '' },
    { id: 'auth', title: 'Auth working', status: 'idle', detail: '' },
    { id: 'db-read-write', title: 'Database read/write', status: 'idle', detail: '' },
    { id: 'edge-functions', title: 'AI Edge Functions reachable', status: 'idle', detail: '' },
    { id: 'ai-provider', title: 'AI provider configured (Writing/Speaking/Coach)', status: 'idle', detail: '' },
    { id: 'transcription-provider', title: 'Transcription provider configured', status: 'idle', detail: '' },
    { id: 'revenuecat', title: 'RevenueCat configured', status: 'idle', detail: '' },
    { id: 'audio-assets', title: 'Listening audio assets', status: 'idle', detail: '' },
  ];
}

const TONE: Record<CheckStatus, 'neutral' | 'success' | 'warning' | 'error' | 'brand'> = {
  idle: 'neutral',
  running: 'brand',
  pass: 'success',
  fail: 'error',
  info: 'warning',
};

const LABEL: Record<CheckStatus, string> = {
  idle: 'Not run',
  running: 'Running…',
  pass: 'Pass',
  fail: 'Fail',
  info: 'Info',
};

export default function DevHealthCheckScreen() {
  const theme = useTheme();
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);
  const [results, setResults] = useState<CheckResult[]>(initialResults());
  const [running, setRunning] = useState(false);

  const update = useCallback((id: string, status: CheckStatus, detail: string) => {
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status, detail } : r)));
  }, []);

  const runChecks = useCallback(async () => {
    setRunning(true);
    setResults(initialResults());

    // 1. Supabase configured (sync, purely informational — Demo Mode is a
    // valid, fully-supported state, not a failure).
    if (!isSupabaseConfigured) {
      update('supabase-config', 'info', 'Not configured — running in Demo Mode (local storage only). Everything below that needs Supabase is skipped.');
      update('supabase-reachable', 'info', 'Skipped (Demo Mode).');
      update('auth', 'info', 'Skipped (Demo Mode).');
      update('db-read-write', 'info', 'Skipped (Demo Mode).');
      update('edge-functions', 'info', 'Skipped (Demo Mode) — Edge Functions require a configured Supabase project.');
      update('ai-provider', 'info', 'Skipped (Demo Mode).');
      update('transcription-provider', 'info', 'Skipped (Demo Mode).');
    } else {
      update('supabase-config', 'pass', 'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.');

      // 2. Reachability: a lightweight query against a public-read table.
      try {
        const { error } = await supabase!.from('band_conversion_tables').select('scale', { count: 'exact', head: true });
        if (error) update('supabase-reachable', 'fail', error.message);
        else update('supabase-reachable', 'pass', 'Query against band_conversion_tables succeeded.');
      } catch (err) {
        update('supabase-reachable', 'fail', (err as Error).message);
      }

      // 3. Auth: is there a valid, server-verified session right now?
      let authedUserId: string | null = null;
      try {
        const { data, error } = await supabase!.auth.getUser();
        if (error) {
          update('auth', 'fail', error.message);
        } else if (!data.user) {
          update('auth', 'info', 'No signed-in session. Sign in with a real account (not Demo Mode) to test auth and DB read/write.');
        } else {
          authedUserId = data.user.id;
          update('auth', 'pass', `Signed in as ${data.user.email ?? data.user.id}.`);
        }
      } catch (err) {
        update('auth', 'fail', (err as Error).message);
      }

      // 4. DB read/write: round-trip a write + read against the caller's
      // own profile row (safe — no throwaway rows to clean up).
      if (!authedUserId) {
        update('db-read-write', 'info', 'Skipped — requires a signed-in session (see Auth above).');
      } else {
        try {
          const stamp = new Date().toISOString();
          const { error: writeErr } = await supabase!.from('profiles').update({ updated_at: stamp }).eq('id', authedUserId);
          if (writeErr) throw writeErr;
          const { data: readBack, error: readErr } = await supabase!.from('profiles').select('updated_at').eq('id', authedUserId).single();
          if (readErr) throw readErr;
          if (readBack?.updated_at === stamp) update('db-read-write', 'pass', 'Wrote and read back profiles.updated_at successfully.');
          else update('db-read-write', 'fail', 'Write succeeded but the read-back value did not match — check RLS/replication.');
        } catch (err) {
          update('db-read-write', 'fail', (err as Error).message);
        }
      }

      // 5-7. Edge Functions: ping every function with { healthCheck: true },
      // which every function short-circuits on immediately after verifying
      // the caller's session — before touching rate limits or the real AI
      // provider, so this is free to run repeatedly.
      const pingResults: { name: string; ok: boolean; provider: string | null; error?: string }[] = [];
      for (const fn of AI_FUNCTIONS) {
        try {
          const { data, error } = await supabase!.functions.invoke(fn, { body: { healthCheck: true } });
          if (error) pingResults.push({ name: fn, ok: false, provider: null, error: error.message });
          else pingResults.push({ name: fn, ok: Boolean(data?.ok), provider: data?.provider ?? null });
        } catch (err) {
          pingResults.push({ name: fn, ok: false, provider: null, error: (err as Error).message });
        }
      }
      const unreachable = pingResults.filter((r) => !r.ok);
      if (unreachable.length === 0) {
        update('edge-functions', 'pass', `All ${pingResults.length} functions responded (${AI_FUNCTIONS.join(', ')}).`);
      } else {
        update(
          'edge-functions',
          'fail',
          `${unreachable.length}/${pingResults.length} unreachable: ${unreachable.map((r) => `${r.name} (${r.error ?? 'no response'})`).join('; ')}. Have they been deployed? See "Production setup checklist".`
        );
      }

      const writingPing = pingResults.find((r) => r.name === 'evaluate-writing');
      if (writingPing?.ok) {
        update('ai-provider', writingPing.provider ? 'pass' : 'info', writingPing.provider ? `Configured: ${writingPing.provider}.` : 'Reachable, but no OPENAI_API_KEY/ANTHROPIC_API_KEY/GEMINI_API_KEY set — falls back to on-device mock.');
      } else {
        update('ai-provider', 'info', 'Could not determine — evaluate-writing was unreachable (see above).');
      }

      const transcribePing = pingResults.find((r) => r.name === 'transcribe-audio');
      if (transcribePing?.ok) {
        update('transcription-provider', transcribePing.provider ? 'pass' : 'info', transcribePing.provider ? `Configured: ${transcribePing.provider}.` : 'No OPENAI_API_KEY set — falls back to the mock simulated transcript.');
      } else {
        update('transcription-provider', 'info', 'Could not determine — transcribe-audio was unreachable (see above).');
      }
    }

    // RevenueCat: sync, client-side only.
    update(
      'revenuecat',
      isRevenueCatConfigured ? 'pass' : 'info',
      isRevenueCatConfigured ? 'EXPO_PUBLIC_REVENUECAT_IOS_KEY/_ANDROID_KEY are set.' : 'Not configured — paywall runs in mock purchase mode.'
    );

    // Listening audio assets: sync, always informational (the on-device TTS
    // fallback means this is never a hard failure).
    const generated = Object.keys(audioRegistry).length;
    const total = content.listeningTracks.length;
    update(
      'audio-assets',
      generated === total && total > 0 ? 'pass' : 'info',
      `${generated}/${total} tracks have pre-generated audio. The rest use the on-device text-to-speech fallback — never a hard failure.`
    );

    setRunning(false);
  }, [update]);

  // Dev-build-only: this screen can query internal reachability/config
  // details that shouldn't be reachable in a production build, even by a
  // deep link. Placed after every hook so hook order stays stable.
  if (!__DEV__) {
    return (
      <Screen>
        <ScreenHeader title="Not available" showBack />
        <Text color="secondary">This diagnostic screen is only available in development builds.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Developer health check" showBack />
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.md }}>
        Dev-build-only diagnostics for connecting a real Supabase project and AI provider. Never shipped to production builds.
      </Text>

      <Button label={running ? 'Running…' : 'Run all checks'} onPress={runChecks} loading={running} fullWidth style={{ marginBottom: theme.spacing.lg }} />

      {results.map((r) => (
        <Card key={r.id} style={{ marginBottom: theme.spacing.sm, gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="bodyMedium" style={{ flex: 1 }}>
              {r.title}
            </Text>
            <Badge label={LABEL[r.status]} tone={TONE[r.status]} />
          </View>
          {r.detail ? (
            <Text variant="caption" color="secondary">
              {r.detail}
            </Text>
          ) : null}
        </Card>
      ))}

      <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.huge }}>
        User ID: {userId ?? '(none)'}. See README &quot;Production setup checklist&quot; for what each check verifies and how to fix a failure.
      </Text>

      <Button label="Back to Profile" variant="ghost" onPress={() => router.back()} style={{ marginBottom: theme.spacing.huge }} />
    </Screen>
  );
}
