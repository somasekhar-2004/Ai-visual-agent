import { computeOverallBand, roundIeltsBand } from '@/lib/bandScore';
import { computeCurrentStreak } from '@/lib/streak';
import { supabase } from '@/lib/supabase';
import { throwIfSupabaseError } from '@/lib/supabaseErrors';
import { getDeviceTimeZone, getLocalDateString } from '@/lib/timezone';
import { checkAndUnlockStreakAchievements } from '@/services/repository/social';
import { getPurchasesProvider } from '@/services/purchases';
import type {
  IeltsType,
  NotificationCategory,
  Profile,
  SkillKey,
  SkillOrOverall,
  Subscription,
  UserGoal,
} from '@/types/models';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).maybeSingle();
  // maybeSingle() returns { data: null, error: null } for a genuine "no row"
  // — only a non-null error means the query itself failed (RLS/permission
  // denial, network error, ...), which must never be read as "no profile".
  throwIfSupabaseError(error, 'Failed to load profile');
  if (!data) return null;
  return { id: data.id, fullName: data.full_name, avatarUrl: data.avatar_url, createdAt: data.created_at };
}

export async function updateProfileName(userId: string, fullName: string): Promise<void> {
  const { error } = await supabase!.from('profiles').update({ full_name: fullName }).eq('id', userId);
  throwIfSupabaseError(error, 'Failed to update profile');
}

export async function getActiveGoal(userId: string): Promise<UserGoal | null> {
  const { data, error } = await supabase!
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  throwIfSupabaseError(error, 'Failed to load your study goal');
  if (data) return mapGoalRow(data);

  // No row has is_active=true — before concluding "this user never set up a
  // goal" (and sending them back through onboarding), check for ANY goal
  // row under this account. This is now a legacy-recovery path only:
  // saveOnboardingGoal upserts a single current goal row in place (see its
  // own comment and migration 0013's uq_user_goals_one_active_per_user
  // constraint), so a healthy account can never actually reach a
  // zero-active-goals state going forward. Kept for any account whose data
  // predates that migration — recover the most recent goal by reactivating
  // it, rather than silently sending someone who genuinely already set up a
  // goal through onboarding again.
  const { data: anyGoal, error: anyGoalError } = await supabase!
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  throwIfSupabaseError(anyGoalError, 'Failed to load your study goal');
  if (!anyGoal) return null;

  const { error: reactivateError } = await supabase!.from('user_goals').update({ is_active: true }).eq('id', anyGoal.id);
  if (reactivateError) {
    // Recovery itself failed (e.g. a transient network error) — still
    // return the goal we found rather than losing it entirely; the next
    // refresh will retry reactivation.
    console.warn('[repository] found an inactive goal to recover but failed to reactivate it:', reactivateError.message);
  }
  return mapGoalRow({ ...anyGoal, is_active: true });
}

export type OnboardingInput = {
  ieltsType: IeltsType;
  currentBand: number | null;
  targetBand: number;
  examDate: string | null;
  weakestSkill: SkillKey | null;
  dailyStudyMinutes: number;
};

export async function saveOnboardingGoal(userId: string, input: OnboardingInput): Promise<UserGoal> {
  // True upsert semantics: at most one CURRENT (is_active) goal row per
  // user, enforced by migration 0013's partial unique index
  // (uq_user_goals_one_active_per_user) — Postgres itself now rejects a
  // second active row for the same user, so editing a goal updates that one
  // row in place with a single atomic UPDATE instead of the previous
  // "insert a new row, then separately deactivate the rest" two-step (which
  // that unique index would now reject outright on the insert). This also
  // means `updated_at` (bumped by a DB trigger on every UPDATE) is now the
  // authoritative "this goal actually just changed" signal — see
  // lib/studyPlanQueryKeys.ts, which keys the study-plan/AI-note caches on
  // it precisely because `id` no longer changes across edits.
  const { data: existing, error: existingError } = await supabase!
    .from('user_goals')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  throwIfSupabaseError(existingError, 'Failed to check your existing study goal');

  const payload = {
    ielts_type: input.ieltsType,
    current_band: input.currentBand,
    target_band: input.targetBand,
    exam_date: input.examDate,
    weakest_skill: input.weakestSkill,
    daily_study_minutes: input.dailyStudyMinutes,
  };

  const { data, error } = existing
    ? await supabase!.from('user_goals').update(payload).eq('id', existing.id).select('*').single()
    : await supabase!.from('user_goals').insert({ user_id: userId, is_active: true, ...payload }).select('*').single();
  // A failed write (RLS rejection, missing/expired auth session, constraint
  // violation, network error) surfaces here as `error` set and `data` null.
  // Never pass that straight to mapGoalRow — it doesn't defend against a null
  // row, by design, so a real failure is never silently reshaped into a fake
  // "empty" goal.
  if (error || !data) {
    throw new Error(
      `Failed to save your study goal: ${error?.message ?? 'the database returned no row for the goal.'}` +
        (error?.code ? ` (code: ${error.code})` : '')
    );
  }
  return mapGoalRow(data);
}

function mapGoalRow(data: any): UserGoal {
  return {
    id: data.id,
    userId: data.user_id,
    ieltsType: data.ielts_type,
    currentBand: data.current_band,
    targetBand: data.target_band,
    examDate: data.exam_date,
    weakestSkill: data.weakest_skill,
    dailyStudyMinutes: data.daily_study_minutes,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export type SkillBandMap = Partial<Record<SkillOrOverall, number>>;

export async function getLatestBandScores(userId: string): Promise<SkillBandMap> {
  const { data, error } = await supabase!
    .from('band_scores')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: true });
  throwIfSupabaseError(error, 'Failed to load band scores');
  const map: SkillBandMap = {};
  for (const row of data ?? []) map[row.skill as SkillOrOverall] = Number(row.band);
  return map;
}

export async function getBandScoreHistory(userId: string): Promise<import('@/types/models').BandScoreEntry[]> {
  const { data, error } = await supabase!
    .from('band_scores')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: true });
  throwIfSupabaseError(error, 'Failed to load band score history');
  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    skill: row.skill,
    band: Number(row.band),
    source: row.source,
    recordedAt: row.recorded_at,
  }));
}

export async function recordBandScore(
  userId: string,
  skill: SkillOrOverall,
  band: number,
  source: 'mock' | 'practice' | 'ai_estimate' | 'manual'
): Promise<void> {
  const { error } = await supabase!.from('band_scores').insert({ user_id: userId, skill, band, source });
  throwIfSupabaseError(error, 'Failed to record band score');
}

/** Recomputes and stores the overall band from the four skill bands, using
 * the official IELTS rounding rule — but ONLY once all four have a real
 * recorded score. A missing skill used to silently default to band 6,
 * which meant a brand-new user got a fabricated "Overall Band 6.0" the
 * moment they finished onboarding, before ever attempting a single test.
 * Returns null (and records nothing) when any of the four is still
 * missing, so the UI can correctly show "not enough data yet" instead of
 * inventing a number. */
export async function refreshOverallBand(userId: string): Promise<number | null> {
  const bands = await getLatestBandScores(userId);
  if (bands.listening === undefined || bands.reading === undefined || bands.writing === undefined || bands.speaking === undefined) {
    return null;
  }
  const overall = computeOverallBand({ listening: bands.listening, reading: bands.reading, writing: bands.writing, speaking: bands.speaking });
  await recordBandScore(userId, 'overall', roundIeltsBand(overall), 'manual');
  return overall;
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase!.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
  throwIfSupabaseError(error, 'Failed to load subscription');
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    plan: data.plan,
    status: data.status,
    revenuecatCustomerId: data.revenuecat_customer_id,
    currentPeriodEnd: data.current_period_end,
  };
}

export async function setSubscription(
  userId: string,
  plan: Subscription['plan'],
  status: Subscription['status'],
  currentPeriodEnd?: string | null
): Promise<void> {
  const { error } = await supabase!
    .from('subscriptions')
    .update({ plan, status, ...(currentPeriodEnd !== undefined ? { current_period_end: currentPeriodEnd } : {}) })
    .eq('user_id', userId);
  throwIfSupabaseError(error, 'Failed to update subscription');
}

/** Re-checks the store's own entitlement record (RevenueCat when
 * configured; always inactive via UnavailablePurchasesProvider otherwise)
 * and reconciles the locally stored subscription if it disagrees — the only
 * way the app finds out about a cancellation or expiry that happened
 * outside it (App Store / Play Store settings), since nothing pushes that
 * event to the app otherwise. Never throws: a failed check just leaves the
 * last-known local state in place rather than risking an incorrect
 * downgrade. */
export async function syncSubscriptionEntitlement(userId: string): Promise<void> {
  try {
    const status = await getPurchasesProvider().checkEntitlement();
    const current = await getSubscription(userId);
    if (status.active && status.plan) {
      // Still entitled — but flag "cancelled" (rather than "active") once
      // the user has turned off auto-renew, so the UI can say "active until
      // <date>" instead of implying the subscription will continue.
      const nextStatus: Subscription['status'] = status.willRenew === false ? 'cancelled' : 'active';
      if (current?.plan !== status.plan || current?.status !== nextStatus || current?.currentPeriodEnd !== status.expirationDate) {
        await setSubscription(userId, status.plan, nextStatus, status.expirationDate);
      }
    } else if (!status.active && current && current.plan !== 'free') {
      // Confirmed inactive by the store itself (not a failed check) — the
      // subscription lapsed or was cancelled outside the app.
      await setSubscription(userId, 'free', 'expired', null);
    }
  } catch (err) {
    console.warn('[subscription] entitlement sync failed, keeping last-known state:', (err as Error).message);
  }
}

const DEFAULT_NOTIFICATION_PREFS: Record<NotificationCategory, boolean> = {
  daily_reminder: true,
  streak_reminder: true,
  test_countdown: true,
  unfinished_plan: true,
  weekly_summary: true,
};

export async function getNotificationPrefs(userId: string): Promise<Record<NotificationCategory, boolean>> {
  const { data, error } = await supabase!.from('notification_prefs').select('category, enabled').eq('user_id', userId);
  throwIfSupabaseError(error, 'loading notification preferences');
  const prefs = { ...DEFAULT_NOTIFICATION_PREFS };
  for (const row of data ?? []) {
    prefs[row.category as NotificationCategory] = row.enabled;
  }
  return prefs;
}

export async function setNotificationPref(userId: string, category: NotificationCategory, enabled: boolean): Promise<void> {
  const { error } = await supabase!
    .from('notification_prefs')
    .upsert({ user_id: userId, category, enabled, updated_at: new Date().toISOString() }, { onConflict: 'user_id,category' });
  throwIfSupabaseError(error, 'saving notification preference');
}

/** Reads every local-calendar-day the user has a recorded qualifying
 * activity for (supabase/migrations/0015_streak_activity.sql's
 * user_daily_activity — one row per user per local day, never per
 * activity) and derives the current streak from them (lib/streak.ts). Not
 * capped/paginated: at most one row per calendar day of the account's
 * entire lifetime, so even a years-long streak is a tiny, cheap read — an
 * arbitrary limit here would silently under-report a genuinely long streak
 * once it's exceeded. */
export async function getStreak(userId: string): Promise<{ count: number; lastActiveDate: string | null }> {
  const { data, error } = await supabase!
    .from('user_daily_activity')
    .select('activity_date_local')
    .eq('user_id', userId)
    .order('activity_date_local', { ascending: false });
  throwIfSupabaseError(error, 'loading your streak');
  const activityDates = (data ?? []).map((row: { activity_date_local: string }) => row.activity_date_local);
  const todayLocal = getLocalDateString(getDeviceTimeZone());
  return computeCurrentStreak(activityDates, todayLocal);
}

export async function getXp(userId: string): Promise<number> {
  const { data, error } = await supabase!.from('profiles').select('xp').eq('id', userId).maybeSingle();
  throwIfSupabaseError(error, 'loading your XP');
  return (data as { xp: number } | null)?.xp ?? 0;
}

/**
 * Call whenever the user completes a meaningful unit of study — a real
 * Reading/Listening/Writing/Speaking submission, a finished Grammar
 * practice set, a completed lesson, or a scored Practice session. Never on
 * merely opening a screen, starting-but-not-submitting, or a failed
 * submission — see each call site's own comment for why that exact point
 * is where this is called.
 *
 * Computes the LOCAL calendar day (never UTC) via this device's current
 * timezone at the moment of the call, then upserts it through the
 * `record_daily_activity` Postgres function (0015_streak_activity.sql),
 * whose ON CONFLICT (user_id, activity_date_local) is what makes this safe
 * against concurrent/duplicate calls for the same user on the same day —
 * it can never create two rows for one day no matter how many times or how
 * concurrently this is called; it only ever increments that day's
 * activity_count and adds to the running XP total. A network/DB failure
 * throws (the caller's own try/catch — see e.g. app/reading-test.tsx —
 * decides what a failed submission means for that screen); the streak
 * achievement check that follows is best-effort and never turns a failure
 * there into a false "your activity wasn't recorded" for the caller, since
 * the activity itself has already been durably written by that point. */
export async function recordDailyActivity(userId: string, xpEarned: number): Promise<void> {
  const timezone = getDeviceTimeZone();
  const activityDateLocal = getLocalDateString(timezone);
  const { error } = await supabase!.rpc('record_daily_activity', {
    p_user_id: userId,
    p_activity_date_local: activityDateLocal,
    p_timezone: timezone,
    p_xp_earned: xpEarned,
  });
  throwIfSupabaseError(error, 'recording today\'s study activity');

  try {
    const streak = await getStreak(userId);
    await checkAndUnlockStreakAchievements(userId, streak.count);
  } catch (err) {
    console.warn('[app] streak-achievement check failed (activity was still recorded):', (err as Error).message);
  }
}
