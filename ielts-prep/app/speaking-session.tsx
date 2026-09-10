import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';

import { SpeakingFeedbackView } from '@/components/testing/SpeakingFeedbackView';
import { Badge, Button, Card, DailyLimitCard, IconCircle, ProgressBar, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { confirmAsync } from '@/lib/confirm';
import { activityUsedToday, checkDailyLimit, FREE_DAILY_SPEAKING_PRACTICE_EVALS } from '@/lib/entitlements';
import { firstParam } from '@/lib/firstParam';
import { nextFlowHref } from '@/lib/mockFlow';
import { assessSpeakingEvidence } from '@/lib/speakingEvidence';
import { buildSpeakingTurns } from '@/lib/speakingFlow';
import { evaluateSpeaking, transcribeAudio, type SpeakingEvaluationResult } from '@/services/ai';
import {
  addSpeakingResponse,
  completeSpeakingSession,
  createSpeakingSession,
  getTestHistory,
  recordDailyActivity,
  saveSpeakingFeedback,
} from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { SpeakingPart } from '@/types/models';

type Params = { part?: SpeakingPart; mockAttemptId?: string; mockTestId?: string; stepIndex?: string; nextHref?: string; groupId?: string };
type Phase = 'intro' | 'prep' | 'recording' | 'transcribing' | 'evaluating' | 'result' | 'insufficient_evidence' | 'permission_denied' | 'error';

export default function SpeakingSessionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const raw = useLocalSearchParams<Params>();
  const part = (firstParam(raw.part) as SpeakingPart | undefined) ?? 'full';
  const groupId = firstParam(raw.groupId);
  const mockAttemptId = firstParam(raw.mockAttemptId);
  const mockTestId = firstParam(raw.mockTestId);
  const stepIndex = firstParam(raw.stepIndex);
  const nextHref =
    mockTestId && mockAttemptId && stepIndex != null
      ? nextFlowHref(mockTestId, mockAttemptId, Number(stepIndex))
      : firstParam(raw.nextHref);
  const { userId, isPremium } = useAppStore(useShallow((s) => ({ userId: s.userId, isPremium: s.subscription?.plan !== 'free' })));
  const recorder = useVoiceRecorder();

  // Only enforce the free daily limit for standalone practice — a speaking
  // part that's already inside an unlocked mock attempt must not be blocked.
  const isStandalone = !mockAttemptId;
  const historyQuery = useQuery({
    queryKey: ['test-history', userId],
    queryFn: () => getTestHistory(userId!),
    enabled: Boolean(userId) && isStandalone,
  });
  const limitStatus = checkDailyLimit(activityUsedToday(historyQuery.data ?? [], 'speaking'), FREE_DAILY_SPEAKING_PRACTICE_EVALS, isPremium);
  const blockedByLimit = isStandalone && !limitStatus.allowed;

  const turns = useMemo(() => buildSpeakingTurns(part, groupId), [part, groupId]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [evaluation, setEvaluation] = useState<SpeakingEvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [insufficientEvidence, setInsufficientEvidence] = useState<{ reason: string; explanation: string } | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guards against stopRecording firing twice for the same turn — it's
  // reachable both from the countdown hitting zero and from the user tapping
  // "Stop and continue", and a near-simultaneous double call would push two
  // transcript entries and advance turnIndex twice, silently skipping a turn.
  const stoppingRef = useRef(false);

  const turn = turns[turnIndex];

  useEffect(() => {
    if (!userId || blockedByLimit) return;
    createSpeakingSession(userId, part, turn?.topicId ?? null)
      .then((s) => {
        sessionIdRef.current = s.id;
      })
      .catch((err) => {
        // A failed insert here (RLS/permission denial, network error) used
        // to throw from an unguarded `.then()` with no `.catch()` — an
        // unhandled promise rejection surfacing as an uncaught TypeError.
        // sessionIdRef.current simply stays null on failure: every write
        // below already checks `if (sessionIdRef.current)` before saving,
        // so the test can still be attempted and evaluated even though
        // nothing will persist to Supabase for it.
        console.warn('[speaking] failed to create speaking session:', err.message);
      });
    // Intentionally runs once on mount to open a single session for the whole flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockedByLimit]);

  useEffect(() => {
    if (blockedByLimit) return;
    if (phase === 'intro' && turn) {
      Speech.speak(turn.isCue ? `Here is your topic: ${turn.cueCardText}` : turn.questionText, { rate: 0.95 });
    }
    return () => {
      Speech.stop();
    };
    // `turn` is derived from `turnIndex`, which is already a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, turnIndex]);

  async function handleExit() {
    const confirmed = await confirmAsync('Exit test?', 'Your progress on this speaking test will not be saved. Are you sure you want to exit?', 'Exit');
    if (confirmed) {
      Speech.stop();
      router.back();
    }
  }

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startPrep() {
    setPhase('prep');
    setSecondsLeft(turn.prepSeconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          startRecording();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function startRecording() {
    try {
      const granted = await recorder.start();
      if (!granted) {
        setPhase('permission_denied');
        return;
      }
    } catch (err) {
      // A native recorder failure here (rare, but real on some devices) used
      // to throw uncaught from setInterval's fire-and-forget call in
      // startPrep/stopRecording — never leave the screen on whatever phase
      // it was in when that happened.
      setErrorMessage((err as Error).message);
      setPhase('error');
      return;
    }
    stoppingRef.current = false;
    setPhase('recording');
    setSecondsLeft(turn.maxSpeakSeconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          stopRecording();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function stopRecording() {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    clearTimer();
    setPhase('transcribing');
    try {
      const { uri, durationSeconds } = await recorder.stop();
      // A null uri means the native recorder itself never produced a file
      // (e.g. it failed to start) — silently transcribing that as an empty
      // string used to let the session carry on as if the user had simply
      // said nothing, instead of surfacing that the recording itself never
      // happened.
      if (!uri) throw new Error('No recording was captured — please try recording your answer again.');
      if (__DEV__) console.log(`[speaking] recorded ${durationSeconds}s, uri=${uri}`);
      const transcript = await transcribeAudio(uri);
      setTranscripts((t) => [...t, transcript]);
      setTotalDuration((d) => d + durationSeconds);

      if (sessionIdRef.current) {
        await addSpeakingResponse(sessionIdRef.current, {
          questionText: turn.questionText,
          audioUrl: uri,
          transcript,
          durationSeconds,
          orderIndex: turnIndex,
        });
      }

      if (turnIndex + 1 < turns.length) {
        setTurnIndex((i) => i + 1);
        setPhase('intro');
      } else {
        const allTranscripts = [...transcripts, transcript];
        await finishSession(allTranscripts, totalDuration + durationSeconds);
      }
    } catch (err) {
      // The screen must never get stuck on "Transcribing your answer..."
      // forever — a failure anywhere in stop/transcribe/save now surfaces
      // as a recoverable error state instead of an unhandled rejection.
      setErrorMessage((err as Error).message);
      setPhase('error');
    } finally {
      stoppingRef.current = false;
    }
  }

  async function finishSession(allTranscripts: string[], durationSeconds: number) {
    setPhase('evaluating');
    try {
      if (sessionIdRef.current) await completeSpeakingSession(sessionIdRef.current);

      // Mandatory gate, run before any provider (real or mock) is ever
      // asked for a band — see lib/speakingEvidence.ts. This is what
      // closes the real-device bug where a near-silent recording ("Yeah.
      // Gods [no speech detected] [no speech detected]") still produced a
      // full Overall Band 5.5 with fabricated criteria and strengths.
      const evidence = assessSpeakingEvidence(allTranscripts);
      if (!evidence.sufficient) {
        setInsufficientEvidence({ reason: evidence.reason, explanation: evidence.explanation });
        setPhase('insufficient_evidence');
        return;
      }

      const fullTranscript = allTranscripts.join(' ');
      const result = await evaluateSpeaking({
        part,
        topicCategory: turn.part,
        transcript: fullTranscript,
        questionCount: turns.length,
        totalDurationSeconds: durationSeconds,
        // The server verifies this independently before counting it
        // against the separate Full Mock quota — see SpeakingEvalInput.
        // One evaluateSpeaking call per whole session regardless of how
        // many turns were transcribed, so this is never claimed twice.
        mockAttemptId: mockAttemptId ?? null,
      });
      setEvaluation(result);
      if (userId && sessionIdRef.current) {
        await saveSpeakingFeedback(sessionIdRef.current, userId, {
          overallBand: result.overallBand,
          fluencyCoherence: result.fluencyCoherence,
          lexicalResource: result.lexicalResource,
          grammaticalRange: result.grammaticalRange,
          pronunciation: result.pronunciation,
          fillerWordCount: result.fillerWordCount,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          suggestedExercises: result.suggestedExercises,
        });
        await recordDailyActivity(userId, 20);
      }
      setPhase('result');
    } catch (err) {
      setErrorMessage((err as Error).message);
      setPhase('error');
    }
  }

  useEffect(() => clearTimer, []);

  if (blockedByLimit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md, justifyContent: 'center' }}>
        <DailyLimitCard used={limitStatus.used} limit={limitStatus.limit} feature="Speaking evaluations" />
      </SafeAreaView>
    );
  }

  if (phase === 'permission_denied') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}>
        <IconCircle name="mic-off" size={72} backgroundColor={theme.colors.errorSoft} color={theme.colors.error} />
        <Text variant="h3" align="center">
          Microphone access is required
        </Text>
        <Text color="secondary" align="center">
          The Speaking test records your real voice — enable microphone access for this app in your device settings, then try again.
        </Text>
        <Button
          label="Try again"
          onPress={async () => {
            const granted = await recorder.requestPermission();
            if (granted) startRecording();
          }}
        />
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}>
        <IconCircle name="alert-circle-outline" size={72} backgroundColor={theme.colors.errorSoft} color={theme.colors.error} />
        <Text variant="h3" align="center">
          Something went wrong
        </Text>
        <Text color="secondary" align="center">
          {errorMessage ?? 'We could not process your recording. Check your connection and try again.'}
        </Text>
        <Button
          label="Try this question again"
          onPress={() => {
            setErrorMessage(null);
            setPhase('intro');
          }}
        />
        <Button label="Exit test" variant="ghost" onPress={handleExit} />
      </SafeAreaView>
    );
  }

  if (phase === 'evaluating') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <Text variant="h3">Evaluating your speaking...</Text>
        <Text color="secondary">Analyzing fluency, vocabulary, grammar, and pronunciation.</Text>
      </SafeAreaView>
    );
  }

  if (phase === 'insufficient_evidence' && insufficientEvidence) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}>
        <IconCircle name="mic-outline" size={72} backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
        <Text variant="h3" align="center">
          {insufficientEvidence.reason}
        </Text>
        <Text color="secondary" align="center">
          {insufficientEvidence.explanation}
        </Text>
        <Button
          label="Try again"
          onPress={() => {
            setInsufficientEvidence(null);
            setTranscripts([]);
            setTotalDuration(0);
            setTurnIndex(0);
            setPhase('intro');
          }}
          fullWidth
        />
        <Button label="Exit test" variant="ghost" onPress={handleExit} />
      </SafeAreaView>
    );
  }

  if (phase === 'result' && evaluation) {
    return (
      <SpeakingFeedbackView
        evaluation={evaluation}
        transcript={transcripts.join(' ')}
        onDone={() => (nextHref ? router.replace(nextHref as any) : router.replace('/(tabs)/tests'))}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md }}>
        <Pressable onPress={handleExit} hitSlop={10}>
          <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
        </Pressable>
        <Badge label={turn.part.replace('part', 'Part ')} tone="brand" />
        <Text variant="caption" color="tertiary">
          Question {turnIndex + 1} of {turns.length}
        </Text>
      </View>

      <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center', gap: theme.spacing.lg }}>
        <IconCircle
          name={phase === 'recording' ? 'mic' : 'person-circle-outline'}
          size={80}
          backgroundColor={phase === 'recording' ? theme.colors.errorSoft : theme.colors.primarySoft}
          color={phase === 'recording' ? theme.colors.error : theme.colors.primary}
        />

        {turn.isCue && (phase === 'intro' || phase === 'prep') ? (
          <Card>
            <Text variant="bodyLg" style={{ lineHeight: 24 }}>
              {turn.cueCardText}
            </Text>
          </Card>
        ) : (
          <Text variant="h3">{turn.questionText}</Text>
        )}

        {phase === 'intro' ? (
          <Button label={turn.isCue ? 'Start 1-minute preparation' : 'Start speaking'} onPress={turn.isCue ? startPrep : startRecording} fullWidth />
        ) : null}

        {phase === 'prep' ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Text align="center" color="secondary">
              Preparation time — jot down a few keywords
            </Text>
            <Text variant="display" align="center">
              {secondsLeft}s
            </Text>
            <ProgressBar progress={1 - secondsLeft / turn.prepSeconds} />
          </View>
        ) : null}

        {phase === 'recording' ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Text align="center" color="error">
              Recording — {secondsLeft}s remaining
            </Text>
            <ProgressBar progress={1 - secondsLeft / turn.maxSpeakSeconds} color={theme.colors.error} />
            <Button label="Stop and continue" variant="danger" onPress={stopRecording} fullWidth leftIcon={<Ionicons name="stop" size={16} color={theme.colors.onPrimary} />} />
          </View>
        ) : null}

        {phase === 'transcribing' ? <Text align="center" color="secondary">Transcribing your answer...</Text> : null}
      </View>
    </SafeAreaView>
  );
}
