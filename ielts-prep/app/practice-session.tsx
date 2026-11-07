import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useShallow } from 'zustand/react/shallow';

import { CollapsiblePanel } from '@/components/practice/CollapsiblePanel';
import { QuestionCard } from '@/components/practice/QuestionCard';
import { HighlightablePassage } from '@/components/testing/HighlightablePassage';
import { TranscriptAudioPlayer } from '@/components/testing/TranscriptAudioPlayer';
import { Button, Chip, DailyLimitCard, IconCircle, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { confirmAsync } from '@/lib/confirm';
import { content } from '@/lib/content';
import { checkDailyLimit, FREE_DAILY_PRACTICE_QUESTIONS, practiceQuestionsUsedToday } from '@/lib/entitlements';
import { groupQuestions } from '@/lib/practiceGrouping';
import { deriveResumeFromAttempts } from '@/lib/resumeFromAttempts';
import {
  getBookmarks,
  getQuestionAttempts,
  listQuestions,
  recordDailyActivity,
  recordQuestionAttempt,
  toggleQuestionBookmark,
} from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { Difficulty, QuestionType, SkillKey } from '@/types/models';

type Params = { skill?: SkillKey; mode?: 'incorrect' | 'bookmarked'; questionType?: QuestionType };

export default function PracticeSessionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { skill, mode, questionType } = useLocalSearchParams<Params>();
  const { userId, isPremium, refreshUserData } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    isPremium: s.subscription?.plan !== 'free',
    refreshUserData: s.refreshUserData,
  })));

  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  // Synchronous re-entrancy guard for handleNext's "finish the session" path
  // below — a plain ref (not state) so a second rapid tap on "Finish",
  // dispatched before the await on recordDailyActivity resolves and before
  // any state update re-renders the screen, is still seen immediately by
  // the second call and bails out rather than double-recording the day's
  // activity/XP.
  const finishingRef = useRef(false);
  // Fires exactly once per session (reset on "Practice again" below) the
  // moment the FIRST answer is actually saved — never on merely opening
  // practice or viewing a question, and never required to reach the end of
  // the (potentially very long, unfiltered) question pool. This is
  // deliberately separate from handleNext's finish-time
  // recordDailyActivity call below: that one still awards the session's
  // real XP (results.length * 5) only on a genuine Finish, exactly as
  // before — this one awards 0 XP and exists solely to qualify today for
  // the streak, so leaving after a few questions without finishing still
  // counts as a qualifying day without double-awarding XP once a later
  // Finish (in this session or a later one today) adds the real amount.
  // The daily-activity RPC's own (user, local day) upsert already makes
  // calling it twice in one day a no-op for the day itself — this ref only
  // avoids firing the extra network call once per session, not a
  // correctness requirement.
  const dayQualifiedRef = useRef(false);

  // Scoped to exactly the session this screen instance represents (which
  // user, which skill/mode/questionType filter) so returning to a
  // different filter combination never resumes into the wrong session's
  // progress. `difficulty` is deliberately NOT part of the key — it's a
  // sub-filter of the same session, persisted as part of the session's own
  // state below instead.
  const sessionKey = `ielts-prep/practice-session/${userId ?? 'anon'}/${skill ?? 'all'}/${mode ?? 'none'}/${questionType ?? 'all'}`;
  // True once this session's saved progress (or the lack of it) has been
  // read from AsyncStorage — guards the persist effect below from firing
  // with the fresh {0, []} initial state and overwriting real saved
  // progress before it's even been loaded.
  const hydratedRef = useRef(false);

  // True once AsyncStorage.getItem(sessionKey) has resolved for the CURRENT
  // sessionKey and come back with nothing saved — i.e. there is no local
  // (same-install) progress to resume from at all, so the effect below
  // should try the server-side fallback instead. Not reset to false up
  // front when sessionKey changes: hydratedRef.current (reset below) is
  // what actually gates the resume-fallback effect, so a stale `true` from
  // a PREVIOUS sessionKey is harmless — hydratedRef already short-circuits
  // it until this effect's own callback re-establishes the right value one
  // way or the other for the new key.
  const [noLocalSave, setNoLocalSave] = useState(false);

  useEffect(() => {
    hydratedRef.current = false;
    let cancelled = false;
    AsyncStorage.getItem(sessionKey).then((raw) => {
      if (cancelled) return;
      if (raw) {
        try {
          const saved = JSON.parse(raw) as { results?: boolean[]; difficulty?: Difficulty | 'all' };
          if (Array.isArray(saved.results)) {
            setResults(saved.results);
            // Resuming always lands on the next UNANSWERED question —
            // results.length is exactly that index, since each answer
            // pushes one result and index only ever advances once the
            // current question already has a matching result (see
            // handleNext below), so the two can never drift apart.
            setIndex(saved.results.length);
          }
          if (saved.difficulty) setDifficulty(saved.difficulty);
        } catch (err) {
          console.warn('[practice-session] failed to parse saved session progress, starting fresh:', (err as Error).message);
        }
        hydratedRef.current = true;
      } else {
        // Nothing saved locally for this exact session (skill/mode/
        // questionType) — the common real case is a reinstall, where
        // AsyncStorage was wiped along with the rest of the app's local
        // storage but the account's real question_attempts on the server
        // were not. Deliberately does NOT mark hydratedRef true yet: the
        // server-fallback effect below does that once it has had a chance
        // to check attemptsQuery, so the persist effect never writes an
        // empty {results:[]} over real server progress before that check
        // has run.
        setNoLocalSave(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sessionKey]);

  // Server-side resume fallback — see lib/resumeFromAttempts.ts. Only runs
  // when there was no local save to restore from (case above) and only
  // once per sessionKey (hydratedRef guards re-running once it's already
  // settled this session one way or the other). Keyed to this exact
  // filtered `questions` list and the user's real question_attempts rows —
  // never a lifetime attempt count across every skill/filter.
  useEffect(() => {
    if (!hydratedRef.current) return;
    AsyncStorage.setItem(sessionKey, JSON.stringify({ results, difficulty })).catch(() => {});
  }, [sessionKey, results, difficulty]);

  /** The one place "start over" happens — Restart, a difficulty change, and
   * "Practice again" after finishing all call this, so XP/streak-qualifying
   * guards and saved progress are reset the exact same way every time
   * rather than three separately-maintained copies of the same reset. */
  function resetToFreshSession(nextDifficulty: Difficulty | 'all' = difficulty) {
    finishingRef.current = false;
    dayQualifiedRef.current = false;
    setIndex(0);
    setResults([]);
    setDifficulty(nextDifficulty);
  }

  async function handleRestart() {
    const confirmed = await confirmAsync(
      'Restart this practice session?',
      'Your progress on these questions will be cleared and you’ll start again from question 1. Answers you’ve already recorded stay recorded.',
      'Restart'
    );
    if (confirmed) resetToFreshSession();
  }

  const attemptsQuery = useQuery({
    queryKey: ['question-attempts', userId],
    queryFn: () => getQuestionAttempts(userId!),
    enabled: Boolean(userId),
  });
  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => getBookmarks(userId!),
    enabled: Boolean(userId),
  });

  const questions = useMemo(() => {
    let list = listQuestions({ skill, questionType, difficulty: difficulty === 'all' ? undefined : difficulty });
    if (mode === 'incorrect') {
      const incorrectIds = new Set(attemptsQuery.data?.filter((a) => !a.isCorrect).map((a) => a.questionId));
      list = list.filter((q) => incorrectIds.has(q.id));
    } else if (mode === 'bookmarked') {
      const bookmarkedIds = new Set(bookmarksQuery.data?.map((b) => b.questionId));
      list = list.filter((q) => bookmarkedIds.has(q.id));
    }
    return list;
  }, [skill, mode, questionType, difficulty, attemptsQuery.data, bookmarksQuery.data]);

  // Server-side resume fallback — see lib/resumeFromAttempts.ts. Only runs
  // when there was no local (same-install) save to restore from above, and
  // only once per sessionKey (hydratedRef guards re-running once it's
  // already settled this session one way or the other, including this
  // effect finding nothing and still marking it settled). Keyed to this
  // exact filtered `questions` list and the user's real question_attempts
  // rows — never a lifetime attempt count across every skill/filter.
  useEffect(() => {
    if (!noLocalSave || hydratedRef.current) return;
    if (!attemptsQuery.isSuccess) return;
    // Claimed synchronously (a ref mutation, not state) so a re-run of this
    // same effect before the microtask below settles — e.g. `questions`
    // changing again right away — sees hydratedRef already true and bails
    // out via the guard above, instead of double-applying the resume.
    hydratedRef.current = true;
    const attempts = attemptsQuery.data;
    Promise.resolve().then(() => {
      const resumed = deriveResumeFromAttempts(questions, attempts);
      if (resumed.length > 0) {
        setResults(resumed);
        setIndex(resumed.length);
      }
    });
  }, [noLocalSave, attemptsQuery.isSuccess, attemptsQuery.data, questions]);

  const current = questions[index];
  const bookmarkedIds = new Set(bookmarksQuery.data?.map((b) => b.questionId));
  const limitStatus = checkDailyLimit(practiceQuestionsUsedToday(attemptsQuery.data ?? []), FREE_DAILY_PRACTICE_QUESTIONS, isPremium);
  // Once already-attempted-today reaches the free cap, block starting a NEW
  // session — but never cut off a session already in progress mid-question.
  const blockedByLimit = index === 0 && results.length === 0 && !limitStatus.allowed;

  const groupByQuestionId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof groupQuestions>[number]>();
    for (const group of groupQuestions(questions)) {
      for (const q of group.questions) map.set(q.id, group);
    }
    return map;
  }, [questions]);

  const currentGroup = current ? groupByQuestionId.get(current.id) : undefined;
  const passage = currentGroup?.passageId ? content.readingPassages.find((p) => p.id === currentGroup.passageId) : undefined;
  const track = currentGroup?.listeningTrackId ? content.listeningTracks.find((t) => t.id === currentGroup.listeningTrackId) : undefined;
  const positionInGroup = currentGroup ? currentGroup.questions.findIndex((q) => q.id === current.id) + 1 : 0;

  async function handleAnswered(_answer: string | null, isCorrect: boolean) {
    if (!userId || !current) return;
    await recordQuestionAttempt(userId, current.id, _answer, isCorrect, current.estimatedTimeSeconds);
    setResults((r) => [...r, isCorrect]);
    if (!dayQualifiedRef.current) {
      dayQualifiedRef.current = true;
      // Best-effort and intentionally not awaited: qualifying today for the
      // streak must never block or delay answering the next question. A
      // failure here is logged, not surfaced — the question attempt above
      // (the thing the user actually did) is already saved either way.
      recordDailyActivity(userId, 0)
        .then(() => refreshUserData(userId))
        .catch((err) => console.warn("[practice-session] failed to qualify today's streak activity:", (err as Error).message));
    }
  }

  async function handleToggleBookmark() {
    if (!userId || !current) return;
    await toggleQuestionBookmark(userId, current.id);
    queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
  }

  async function handleNext() {
    if (index + 1 >= questions.length) {
      if (userId && !finishingRef.current) {
        finishingRef.current = true;
        await recordDailyActivity(userId, results.length * 5);
        // Home's "Questions done" stat and the ProgressDashboard read
        // question-attempts from this same react-query key, and its
        // streak/XP from the zustand store — neither refetches on its own
        // just because this screen navigates back to Home (the tab stays
        // mounted, so there's no remount to trigger it). Without these two
        // calls, a completed session only shows up after a full app
        // restart (which re-runs hydrate()/refreshUserData from scratch).
        queryClient.invalidateQueries({ queryKey: ['question-attempts', userId] });
        await refreshUserData(userId);
      }
      setIndex(index + 1); // moves past the end to show the summary screen
      return;
    }
    setIndex((i) => i + 1);
  }

  if (blockedByLimit) {
    return (
      <Screen>
        <ScreenHeader title="Practice" showBack />
        <View style={{ marginTop: theme.spacing.xl }}>
          <DailyLimitCard used={limitStatus.used} limit={limitStatus.limit} feature="Practice questions" />
        </View>
      </Screen>
    );
  }

  if (questions.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Practice" showBack />
        <View style={{ alignItems: 'center', marginTop: theme.spacing.xxxl, gap: theme.spacing.md }}>
          <IconCircle name="checkmark-done-circle-outline" size={72} />
          <Text variant="h3" align="center">
            No questions match this filter yet
          </Text>
          <Text color="secondary" align="center">
            Try a different difficulty, or check back after more practice.
          </Text>
          <Button label="Back" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (index >= questions.length) {
    const correctCount = results.filter(Boolean).length;
    return (
      <Screen>
        <ScreenHeader title="Session complete" showBack />
        <View style={{ alignItems: 'center', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
          <IconCircle name="ribbon-outline" size={80} backgroundColor={theme.colors.successSoft} color={theme.colors.success} />
          <Text variant="h1">
            {correctCount}/{results.length}
          </Text>
          <Text color="secondary">questions correct this session</Text>
          <Button label="Practice again" onPress={() => resetToFreshSession()} fullWidth />
          <Button label="Back to Practice" variant="ghost" onPress={() => router.back()} fullWidth />
        </View>
      </Screen>
    );
  }

  const hasProgress = index > 0 || results.length > 0;

  return (
    <Screen>
      <ScreenHeader
        title="Practice"
        showBack
        right={
          hasProgress ? (
            <Pressable onPress={handleRestart} hitSlop={10} accessibilityRole="button" accessibilityLabel="Restart">
              <Ionicons name="refresh-outline" size={22} color={theme.colors.textSecondary} />
            </Pressable>
          ) : null
        }
      />
      <ProgressBar progress={index / questions.length} />
      <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.md }}>
        Question {index + 1} of {questions.length}
      </Text>

      {!mode ? (
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginBottom: theme.spacing.md, flexWrap: 'wrap' }}>
          {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
            <Chip key={d} label={d} selected={difficulty === d} onPress={() => resetToFreshSession(d)} />
          ))}
        </View>
      ) : null}

      {passage ? (
        <CollapsiblePanel
          title={passage.title}
          subtitle={`Question ${positionInGroup} of ${currentGroup!.questions.length} for this passage`}
          icon="book-outline"
        >
          <HighlightablePassage title={passage.title} body={passage.body} showTitle={false} />
        </CollapsiblePanel>
      ) : null}

      {track ? (
        <CollapsiblePanel
          title={track.title}
          subtitle={`Question ${positionInGroup} of ${currentGroup!.questions.length} for this section`}
          icon="headset-outline"
          maxHeight={140}
        >
          <TranscriptAudioPlayer key={track.id} trackId={track.id} title={track.title} transcript={track.transcript} turns={track.turns} showTitle={false} />
        </CollapsiblePanel>
      ) : null}

      {/* A SIBLING scroll area for the question/answer area, never an
          ancestor/descendant of CollapsiblePanel's own internal ScrollView
          above (passage/transcript). Previously this whole screen was one
          outer ScrollView (`<Screen scroll>`), which put that panel's
          ScrollView and this content inside the SAME outer ScrollView —
          a real ScrollView nested inside another one. Nested ScrollViews on
          Android are a well-documented source of exactly the reported bug
          (a sibling rendered right after the nested scroll region only
          registering taps near its centre, not its full visible surface):
          Android's native nested-scrolling touch arbitration can leave the
          touch target for the next interactive view after the inner
          ScrollView smaller than its visual bounds. app/reading-test.tsx's
          Full Test screen already uses this exact sibling-ScrollViews
          layout (a fixed passage box next to, not around, the
          question/Next/Previous ScrollView) and has never had this bug
          reported against it — this mirrors that proven structure instead
          of inventing a new one. */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: theme.spacing.lg }} keyboardShouldPersistTaps="handled">
        <QuestionCard
          key={current.id}
          question={current}
          onAnswered={handleAnswered}
          isBookmarked={bookmarkedIds.has(current.id)}
          onToggleBookmark={handleToggleBookmark}
        />

        {results.length > index ? (
          <Button label={index + 1 === questions.length ? 'Finish' : 'Next question'} onPress={handleNext} fullWidth style={{ marginTop: theme.spacing.md }} />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
