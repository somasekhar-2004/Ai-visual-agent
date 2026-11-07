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
import type { Difficulty, QuestionAttempt, QuestionType, SkillKey } from '@/types/models';

type Params = { skill?: SkillKey; mode?: 'incorrect' | 'bookmarked'; questionType?: QuestionType };

// questionId -> isCorrect for every question answered under ONE difficulty
// filter. Keyed by question id (not array position) so a filter's
// remembered position is self-correcting if the underlying question order
// for that difficulty ever changes, and so it can be matched directly
// against real question_attempts rows the same way the reinstall fallback
// (lib/resumeFromAttempts.ts) already does.
type AnsweredMap = Record<string, boolean>;

type PersistedSessionV2 = {
  difficulty: Difficulty | 'all';
  answeredByDifficulty: Partial<Record<Difficulty | 'all', AnsweredMap>>;
};

/** v24 and earlier only ever persisted ONE difficulty's progress at a time
 * — a plain answered-count array, with whichever difficulty was active
 * when it was last saved. Converted to AnsweredMap on first load after
 * this change by zipping it against that exact difficulty's own question
 * list (see the derivation effect below) — array position maps 1:1 to
 * question id at migration time, since that's exactly how the old scheme
 * computed its own resume index. */
type PersistedSessionV1Legacy = { results: boolean[]; difficulty?: Difficulty | 'all' };

function answeredMapToAttempts(map: AnsweredMap | undefined): { questionId: string; isCorrect: boolean; createdAt: string }[] {
  return Object.entries(map ?? {}).map(([questionId, isCorrect]) => ({ questionId, isCorrect, createdAt: '' }));
}

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

  // Live enforcement of the free daily practice-question cap — see the
  // "23/20 used today" bug this fixes. attemptsQuery only refetches once
  // per SESSION (at Finish), so reading practiceQuestionsUsedToday(
  // attemptsQuery.data) directly stays frozen at whatever it was when the
  // session started, no matter how many questions get answered after that
  // — the old blockedByLimit check also only ever ran once, at the very
  // start (index === 0 && results.length === 0), so nothing re-checked the
  // cap again for the rest of a long session either. Together those two
  // gaps are exactly how usage could run past the cap at all (and, since
  // the previous fix, switching difficulty no longer resets index/results
  // back to a point that would have re-triggered the old check, which
  // would have made this gap even easier to hit). Fixed with a plain local
  // counter instead of depending on the query ever refetching:
  // `baselineUsedToday` snapshots the server's real count once, the first
  // time attemptsQuery settles for this exact session (see the sessionKey
  // effect below, which resets it on a genuinely different skill/mode/
  // questionType); `sessionAnsweredCount` increments by exactly 1 in
  // handleAnswered for every attempt THIS screen instance itself records.
  // Their sum (liveUsedToday below) is always accurate in real time, with
  // no dependency on network timing.
  const [baselineUsedToday, setBaselineUsedToday] = useState<number | null>(null);
  const [sessionAnsweredCount, setSessionAnsweredCount] = useState(0);
  // A frozen-per-session copy of attemptsQuery.data — see its own longer
  // comment below, by the effect that sets it (needs `questions`'
  // surrounding context to explain fully). Declared here, ahead of
  // attemptsQuery itself, only so the early sessionKey-reset effect above
  // can reset it alongside baselineUsedToday/sessionAnsweredCount.
  const [attemptsSnapshot, setAttemptsSnapshot] = useState<QuestionAttempt[] | undefined>(undefined);

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
  // Every difficulty filter's own answered-questions map, by question id —
  // the single source of truth each filter's resume position is derived
  // from (see the derivation effect below, after `questions`). Mutated
  // directly (not state) so handleAnswered can update it synchronously
  // alongside the existing optimistic setResults call; the persist effect
  // below reads it whenever something changes.
  const answeredByDifficultyRef = useRef<Partial<Record<Difficulty | 'all', AnsweredMap>>>({});
  // Set during hydration when a v24-or-earlier (single-difficulty, plain
  // array) save is found — consumed exactly once by the derivation effect
  // below, which has `questions` available to zip it against. See
  // PersistedSessionV1Legacy's own comment.
  const legacyResultsRef = useRef<boolean[] | null>(null);

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
  // Bumped whenever answeredByDifficultyRef/legacyResultsRef change outside
  // of a `difficulty` state change (hydration completing, or the server
  // fallback populating the ref) — the derivation effect below depends on
  // `difficulty`, which doesn't necessarily change value just because the
  // ref it reads now has real data (e.g. hydrating while already on the
  // default 'all' difficulty), so this is what actually nudges it to run.
  const [hydrationTick, setHydrationTick] = useState(0);

  useEffect(() => {
    hydratedRef.current = false;
    answeredByDifficultyRef.current = {};
    legacyResultsRef.current = null;
    let cancelled = false;
    AsyncStorage.getItem(sessionKey).then((raw) => {
      if (cancelled) return;
      // See baselineUsedToday's and attemptsSnapshot's own comments above:
      // reset alongside everything else this effect resets for a genuinely
      // new session, inside this callback rather than synchronously at the
      // top of the effect.
      setBaselineUsedToday(null);
      setSessionAnsweredCount(0);
      setAttemptsSnapshot(undefined);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<PersistedSessionV2 & PersistedSessionV1Legacy>;
          if (parsed.answeredByDifficulty && typeof parsed.answeredByDifficulty === 'object') {
            answeredByDifficultyRef.current = parsed.answeredByDifficulty;
          } else if (Array.isArray(parsed.results)) {
            // v24-or-earlier save — migrated by the derivation effect below,
            // once `questions` for this exact (about-to-be-restored)
            // difficulty is available.
            legacyResultsRef.current = parsed.results;
          }
          if (parsed.difficulty) setDifficulty(parsed.difficulty);
        } catch (err) {
          console.warn('[practice-session] failed to parse saved session progress, starting fresh:', (err as Error).message);
        }
        hydratedRef.current = true;
        setHydrationTick((t) => t + 1);
      } else {
        // Nothing saved locally for this exact session (skill/mode/
        // questionType) — the common real case is a reinstall, where
        // AsyncStorage was wiped along with the rest of the app's local
        // storage but the account's real question_attempts on the server
        // were not. Deliberately does NOT mark hydratedRef true yet: the
        // server-fallback effect below does that once it has had a chance
        // to check attemptsQuery, so the persist effect never writes an
        // empty {answeredByDifficulty: {}} over real server progress before
        // that check has run.
        setNoLocalSave(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sessionKey]);

  // Persists every difficulty's own progress together, so switching back to
  // one visited earlier THIS install never needs the server fallback at
  // all. `results`/`difficulty` are triggers for "something changed" (an
  // answer was recorded, a filter was switched, a restart cleared one
  // filter's map) — the actual payload is always read fresh from the ref.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const payload: PersistedSessionV2 = { difficulty, answeredByDifficulty: answeredByDifficultyRef.current };
    AsyncStorage.setItem(sessionKey, JSON.stringify(payload)).catch(() => {});
  }, [sessionKey, results, difficulty]);

  /** Restart and "Practice again" call this — clears ONLY the active
   * difficulty's own remembered progress (never other filters', since each
   * filter now remembers its own place independently — see the derivation
   * effect below) and starts it over from question 1. */
  function resetToFreshSession() {
    finishingRef.current = false;
    dayQualifiedRef.current = false;
    answeredByDifficultyRef.current = { ...answeredByDifficultyRef.current, [difficulty]: {} };
    setResults([]);
    setIndex(0);
  }

  /** The difficulty chips call this — switching filters is pure navigation,
   * never a reset: each filter keeps its own remembered position (restored
   * by the derivation effect below from answeredByDifficultyRef), the
   * lifetime attempted count is untouched, and no attempt is recorded. */
  function switchDifficulty(nextDifficulty: Difficulty | 'all') {
    if (nextDifficulty === difficulty) return;
    // Scoped per-difficulty, not per-session — reaching the end of ONE
    // filter's question list must not block correctly finishing a
    // DIFFERENT filter reached later in the same screen instance.
    finishingRef.current = false;
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

  // Snapshots attemptsQuery.data exactly once per session — both the "used
  // today" baseline count above, and (for mode === 'incorrect') the
  // `questions` list below. Previously attemptsQuery only ever refetched at
  // the very end of a session, so reading it live throughout was
  // effectively already a frozen snapshot by accident; handleAnswered now
  // invalidates it after every answer (so OTHER screens — app/(tabs)/
  // practice.tsx's "done/total", Home — stop showing a stale count), which
  // means attemptsQuery.data CAN now change mid-session. For mode ===
  // 'incorrect' specifically, answering a previously-wrong question
  // correctly would otherwise shrink `questions` out from under the user
  // mid-session, shifting every later index to a DIFFERENT question than
  // the one they were actually looking at. Snapshotting once keeps this
  // screen's own idea of "the question list for this session" stable,
  // exactly like it always was, independent of that new invalidation.
  // `sessionKey` is a dependency specifically so this re-fires after a
  // skill/mode/questionType change even though attemptsQuery itself (keyed
  // only by userId, shared across every skill) might not actually refetch.
  useEffect(() => {
    if (attemptsSnapshot !== undefined || !attemptsQuery.isSuccess) return;
    const snapshot = attemptsQuery.data;
    Promise.resolve().then(() => setAttemptsSnapshot(snapshot));
  }, [sessionKey, attemptsSnapshot, attemptsQuery.isSuccess, attemptsQuery.data]);

  useEffect(() => {
    if (baselineUsedToday !== null || attemptsSnapshot === undefined) return;
    const snapshot = practiceQuestionsUsedToday(attemptsSnapshot ?? []);
    Promise.resolve().then(() => setBaselineUsedToday(snapshot));
  }, [baselineUsedToday, attemptsSnapshot]);

  const questions = useMemo(() => {
    let list = listQuestions({ skill, questionType, difficulty: difficulty === 'all' ? undefined : difficulty });
    if (mode === 'incorrect') {
      const incorrectIds = new Set(attemptsSnapshot?.filter((a) => !a.isCorrect).map((a) => a.questionId));
      list = list.filter((q) => incorrectIds.has(q.id));
    } else if (mode === 'bookmarked') {
      const bookmarkedIds = new Set(bookmarksQuery.data?.map((b) => b.questionId));
      list = list.filter((q) => bookmarkedIds.has(q.id));
    }
    return list;
  }, [skill, mode, questionType, difficulty, attemptsSnapshot, bookmarksQuery.data]);

  // Server-side resume fallback — see lib/resumeFromAttempts.ts. Only runs
  // when there was no local (same-install) save to restore from above, and
  // only once per sessionKey (hydratedRef guards re-running once it's
  // already settled this session one way or the other, including this
  // effect finding nothing and still marking it settled). Keyed to this
  // exact filtered `questions` list and the user's real question_attempts
  // rows — never a lifetime attempt count across every skill/filter.
  // Populates answeredByDifficultyRef for the CURRENT difficulty only (the
  // one active at hydration time); the derivation effect below is what
  // actually applies it to results/index.
  useEffect(() => {
    if (!noLocalSave || hydratedRef.current) return;
    if (!attemptsQuery.isSuccess) return;
    // Claimed synchronously (a ref mutation, not state) so a re-run of this
    // same effect before the microtask below settles — e.g. `questions`
    // changing again right away — sees hydratedRef already true and bails
    // out via the guard above, instead of double-applying the resume.
    hydratedRef.current = true;
    const attempts = attemptsQuery.data;
    const currentQuestions = questions;
    const currentDifficulty = difficulty;
    Promise.resolve().then(() => {
      const resumed = deriveResumeFromAttempts(currentQuestions, attempts);
      if (resumed.length > 0) {
        const map: AnsweredMap = {};
        currentQuestions.slice(0, resumed.length).forEach((q, i) => {
          map[q.id] = resumed[i];
        });
        answeredByDifficultyRef.current = { ...answeredByDifficultyRef.current, [currentDifficulty]: map };
      }
      setHydrationTick((t) => t + 1);
    });
  }, [noLocalSave, attemptsQuery.isSuccess, attemptsQuery.data, questions, difficulty]);

  // The one place results/index are ever derived from "remembered
  // progress" (as opposed to live answering, handled directly by
  // handleAnswered/handleNext below) — runs when the active difficulty
  // changes (a filter switch) or hydration completes (hydrationTick).
  // Deliberately does NOT depend on `questions` itself: `questions` can
  // change for reasons unrelated to a difficulty switch (e.g. attempts/
  // bookmarks refetching in the background for 'incorrect'/'bookmarked'
  // mode), and re-deriving then would yank the user away from wherever
  // they currently are mid-session (e.g. past the "revealed, tap Next"
  // state) — this only ever runs for an explicit filter change or initial
  // load, reading whatever `questions` value is current via closure at
  // that point, which is correct either way.
  useEffect(() => {
    if (!hydratedRef.current) return;
    let map = answeredByDifficultyRef.current[difficulty];
    if (!map && legacyResultsRef.current) {
      map = {};
      questions.slice(0, legacyResultsRef.current.length).forEach((q, i) => {
        map![q.id] = legacyResultsRef.current![i];
      });
      answeredByDifficultyRef.current = { ...answeredByDifficultyRef.current, [difficulty]: map };
      legacyResultsRef.current = null;
    }
    const resumed = deriveResumeFromAttempts(questions, answeredMapToAttempts(map));
    setResults(resumed);
    setIndex(resumed.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see comment above: `questions` is deliberately excluded from the trigger list, only read via closure.
  }, [difficulty, hydrationTick]);

  const current = questions[index];
  const bookmarkedIds = new Set(bookmarksQuery.data?.map((b) => b.questionId));
  // See baselineUsedToday's comment above — live, not a frozen snapshot
  // from whenever attemptsQuery last happened to fetch. Falls back to a
  // direct read for the one render before the baseline effect has run.
  const liveUsedToday = (baselineUsedToday ?? practiceQuestionsUsedToday(attemptsQuery.data ?? [])) + sessionAnsweredCount;
  const limitStatus = checkDailyLimit(liveUsedToday, FREE_DAILY_PRACTICE_QUESTIONS, isPremium);
  // Blocks the NEXT unanswered question once the cap is reached — never an
  // already-answered one still showing its feedback (results.length >
  // index) mid-reveal, and never once this difficulty's own question list
  // is already exhausted (index >= questions.length — that's the "session
  // complete" screen below's to show, not this one's).
  const blockedByLimit = !limitStatus.allowed && results.length === index && index < questions.length;

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
    // Defensive backstop, not the primary guard — blockedByLimit above
    // already keeps an unanswered question from ever being shown once the
    // cap is reached, so this should be unreachable in the normal flow.
    // Never trust a UI gate alone to protect a write, though.
    if (!isPremium && liveUsedToday >= FREE_DAILY_PRACTICE_QUESTIONS) return;
    await recordQuestionAttempt(userId, current.id, _answer, isCorrect, current.estimatedTimeSeconds);
    // Live counter for the cap above — see baselineUsedToday's comment.
    setSessionAnsweredCount((c) => c + 1);
    // Regression fix: previously only invalidated at the very end of a
    // session (reaching the literal end of a possibly 1000+-question
    // filtered list — see handleNext below). A user who answers a few
    // questions and leaves via Back without ever reaching that point left
    // every OTHER screen reading this same query key (app/(tabs)/
    // practice.tsx's own "done/total questions attempted", Home's
    // dashboard) showing a stale count indefinitely. Both screens stay
    // mounted as tabs, so invalidating here is enough for them to pick
    // this up the moment the user navigates back to them — no full app
    // restart needed.
    queryClient.invalidateQueries({ queryKey: ['question-attempts', userId] });
    // Kept in lockstep with the optimistic setResults call below — this is
    // what lets switching difficulty away and back find this question
    // already answered without waiting on attemptsQuery to refetch.
    answeredByDifficultyRef.current = {
      ...answeredByDifficultyRef.current,
      [difficulty]: { ...(answeredByDifficultyRef.current[difficulty] ?? {}), [current.id]: isCorrect },
    };
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
            <Chip key={d} label={d} selected={difficulty === d} onPress={() => switchDifficulty(d)} />
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
