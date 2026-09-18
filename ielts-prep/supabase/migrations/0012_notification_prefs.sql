-- ============================================================================
-- Notification preferences
-- ============================================================================
-- Backs services/repository/core.ts's getNotificationPrefs()/setNotificationPref().
-- Before this migration, the real (non-Demo-Mode) backend had no storage for
-- these at all: getNotificationPrefs() returned a hardcoded all-true object
-- and setNotificationPref() was a no-op, so a user's choice on
-- app/notification-settings.tsx (and the onboarding wizard's reminders step)
-- was applied to the device's local notification schedule for that one
-- session but never actually persisted — the next time prefs were read
-- (app restart, screen reopen) they'd silently revert to "all on" in the UI.
-- One row per (user, category); a missing row means "use the default"
-- (true), matching the previous hardcoded behavior for users who never
-- touch this screen.

create table if not exists notification_prefs (
  user_id uuid not null references profiles (id) on delete cascade,
  category text not null check (category in ('daily_reminder', 'streak_reminder', 'test_countdown', 'unfinished_plan', 'weekly_summary')),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, category)
);

alter table notification_prefs enable row level security;

do $$ begin
  create policy "owner_all" on notification_prefs for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
