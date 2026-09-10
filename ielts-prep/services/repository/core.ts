import { computeOverallBand, roundIeltsBand } from '@/lib/bandScore';
import { DEMO_USER_ID, getDb, mutateDb } from '@/lib/demoStore';
import { isDemoMode } from '@/lib/env';
import { generateId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { throwIfSupabaseError } from '@/lib/supabaseErrors';
import { getPurchasesProvider, isPurchasesMocked } from '@/services/purchases';
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
  if (isDemoMode) {
    const db = await getDb();
    return db.profile.id === userId || userId === DEMO_USER_ID ? db.profile : null;
  }
  const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).maybeSingle();
  // maybeSingle() returns { data: null, error: null } for a genuine "no row"
  // — only a non-null error means the query itself failed (RLS/permission
  // denial, network error, ...), which must never be read as "no profile".
  throwIfSupabaseError(error, 'Failed to load profile');
  if (!data) return null;
  return { id: data.id, fullName: data.full_name, avatarUrl: data.avatar_url, createdAt: data.created_at };
}

export async function updateProfileName(userId: string, fullName: string): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      db.profile.fullName = fullName;
    });
    return;
  }
  const { error } = await supabase!.from('profiles').update({ full_name: fullName }).eq('id', userId);
  throwIfSupabaseError(error, 'Failed to update profile');
}

export async function getActiveGoal(userId: string): Promise<UserGoal | null> {
  if (isDemoMode) {
    const db = await getDb();
    return db.goal ?? null;
  }
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
  // row under this account. A real-device bug left existing users stuck on
  // the setup screen despite having completed onboarding: saveOnboardingGoal
  // used to deactivate every previous goal *before* inserting the new one,
  // as two separate, non-transactional requests — an app kill, a dropped
  // connection, or any failure between those two calls left the account
  // with zero active goals and no way back short of a real DB fix. That
  // ordering is fixed below (insert first, deactivate after), but this
  // fallback is the actual recovery path for any account that already hit
  // it: recover the most recent goal — reactivating it — rather than
  // silently sending someone who genuinely already set up a goal through
  // onboarding again.
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
  if (isDemoMode) {
    return mutateDb((db) => {
      db.goal = {
        id: generateId('goal'),
        userId,
        ieltsType: input.ieltsType,
        currentBand: input.currentBand,
        targetBand: input.targetBand,
        examDate: input.examDate,
        weakestSkill: input.weakestSkill,
        dailyStudyMinutes: input.dailyStudyMinutes,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      return db.goal;
    });
  }
  // Insert the new goal BEFORE deactivating any previous one — deliberately
  // the opposite order from an earlier version of this function. These are
  // two separate, non-transactional requests; deactivating first meant that
  // any failure between the two calls (an app kill, a dropped connection,
  // a timeout) left the account with every goal marked inactive and the new
  // one never inserted — zero active goals, with no way back short of a
  // direct DB fix. Inserting first means the same failure instead just
  // leaves an old goal active alongside a new one (getActiveGoal picks the
  // most recently created), which is a soft, self-correcting inconsistency
  // rather than "no goal exists" (see this file's Listening rollout /
  // integrity-audit history for the real-device bug this caused).
  const { data, error } = await supabase!
    .from('user_goals')
    .insert({
      user_id: userId,
      ielts_type: input.ieltsType,
      current_band: input.currentBand,
      target_band: input.targetBand,
      exam_date: input.examDate,
      weakest_skill: input.weakestSkill,
      daily_study_minutes: input.dailyStudyMinutes,
      is_active: true,
    })
    .select('*')
    .single();
  // A failed insert (RLS rejection, missing/expired auth session, constraint
  // violation, network error) surfaces here as `error` set and `data` null.
  // Never pass that straight to mapGoalRow — it doesn't defend against a null
  // row, by design, so a real failure is never silently reshaped into a fake
  // "empty" goal.
  if (error || !data) {
    throw new Error(
      `Failed to save onboarding goal: ${error?.message ?? 'the database returned no row for the new goal.'}` +
        (error?.code ? ` (code: ${error.code})` : '')
    );
  }

  const { error: deactivateError } = await supabase!.from('user_goals').update({ is_active: false }).eq('user_id', userId).neq('id', data.id);
  if (deactivateError) {
    // The new goal is already saved and active — a failure to deactivate
    // old ones is a (harmless-to-Home) cleanup step, not a reason to throw
    // and make onboarding look like it failed when it actually succeeded.
    console.warn('[repository] saved new goal but failed to deactivate previous ones:', deactivateError.message);
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
  };
}

export type SkillBandMap = Partial<Record<SkillOrOverall, number>>;

export async function getLatestBandScores(userId: string): Promise<SkillBandMap> {
  if (isDemoMode) {
    const db = await getDb();
    const map: SkillBandMap = {};
    for (const entry of db.bandScores) {
      map[entry.skill] = entry.band;
    }
    return map;
  }
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
  if (isDemoMode) {
    const db = await getDb();
    return [...db.bandScores].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  }
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
  if (isDemoMode) {
    await mutateDb((db) => {
      db.bandScores.push({ id: generateId('band'), userId, skill, band, source, recordedAt: new Date().toISOString() });
    });
    return;
  }
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
  if (isDemoMode) {
    const db = await getDb();
    return db.subscription;
  }
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
  if (isDemoMode) {
    await mutateDb((db) => {
      db.subscription = { ...db.subscription, plan, status, ...(currentPeriodEnd !== undefined ? { currentPeriodEnd } : {}) };
    });
    return;
  }
  const { error } = await supabase!
    .from('subscriptions')
    .update({ plan, status, ...(currentPeriodEnd !== undefined ? { current_period_end: currentPeriodEnd } : {}) })
    .eq('user_id', userId);
  throwIfSupabaseError(error, 'Failed to update subscription');
}

/** Re-checks the store's own entitlement record (RevenueCat when
 * configured; a no-op in Demo Mode) and reconciles the locally stored
 * subscription if it disagrees — the only way the app finds out about a
 * cancellation or expiry that happened outside it (App Store / Play Store
 * settings), since nothing pushes that event to the app otherwise. Never
 * throws: a failed check just leaves the last-known local state in place
 * rather than risking an incorrect downgrade. */
export async function syncSubscriptionEntitlement(userId: string): Promise<void> {
  if (isPurchasesMocked()) return;
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

export async function getNotificationPrefs(userId: string): Promise<Record<NotificationCategory, boolean>> {
  if (isDemoMode) {
    const db = await getDb();
    return db.notificationPrefs;
  }
  // Real backend: derive from the notifications table's category distinct opt-outs,
  // or a dedicated preferences table — kept simple here with sensible defaults.
  return {
    daily_reminder: true,
    streak_reminder: true,
    test_countdown: true,
    unfinished_plan: true,
    weekly_summary: true,
  };
}

export async function setNotificationPref(userId: string, category: NotificationCategory, enabled: boolean): Promise<void> {
  if (isDemoMode) {
    await mutateDb((db) => {
      db.notificationPrefs[category] = enabled;
    });
  }
}

export async function getStreak(userId: string): Promise<{ count: number; lastActiveDate: string | null }> {
  if (isDemoMode) {
    const db = await getDb();
    return db.streak;
  }
  return { count: 0, lastActiveDate: null };
}

export async function getXp(userId: string): Promise<number> {
  if (isDemoMode) {
    const db = await getDb();
    return db.xp;
  }
  return 0;
}

/** Call whenever the user completes a meaningful unit of study — bumps the daily streak (once per day) and awards XP. */
export async function recordDailyActivity(userId: string, xpEarned: number): Promise<void> {
  if (!isDemoMode) return;
  const today = new Date().toISOString().slice(0, 10);
  await mutateDb((db) => {
    db.xp += xpEarned;
    if (db.streak.lastActiveDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    db.streak.count = db.streak.lastActiveDate === yesterday ? db.streak.count + 1 : 1;
    db.streak.lastActiveDate = today;
  });
}
