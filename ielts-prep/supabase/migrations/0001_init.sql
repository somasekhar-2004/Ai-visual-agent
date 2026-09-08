-- IELTS Prep — initial schema
-- Run via Supabase CLI (`supabase db push`) or paste into the SQL editor.
-- Idempotent-ish: uses IF NOT EXISTS / OR REPLACE where practical.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- Enums
-- ============================================================================
do $$ begin
  create type ielts_type as enum ('academic', 'general');
exception when duplicate_object then null; end $$;

do $$ begin
  create type skill_key as enum ('listening', 'reading', 'writing', 'speaking');
exception when duplicate_object then null; end $$;

do $$ begin
  create type skill_or_overall as enum ('listening', 'reading', 'writing', 'speaking', 'overall');
exception when duplicate_object then null; end $$;

do $$ begin
  create type difficulty_level as enum ('easy', 'medium', 'hard');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attempt_status as enum ('in_progress', 'completed', 'abandoned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type writing_task_type as enum ('task1_academic', 'task1_general', 'task2');
exception when duplicate_object then null; end $$;

do $$ begin
  create type speaking_part as enum ('part1', 'part2', 'part3', 'full');
exception when duplicate_object then null; end $$;

do $$ begin
  create type score_source as enum ('mock', 'practice', 'ai_estimate', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vocab_status as enum ('new', 'learning', 'mastered');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_role as enum ('user', 'assistant', 'system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_plan as enum ('free', 'premium_monthly', 'premium_yearly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active', 'trialing', 'expired', 'cancelled', 'none');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_category as enum (
    'daily_reminder', 'streak_reminder', 'test_countdown', 'unfinished_plan', 'weekly_summary'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_type as enum (
    'mock_test', 'reading', 'listening', 'writing', 'speaking', 'practice'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type reading_band_scale as enum ('listening', 'reading_academic', 'reading_general');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Identity & goals
-- ============================================================================
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  ielts_type ielts_type not null default 'academic',
  current_band numeric(2,1),
  target_band numeric(2,1) not null,
  exam_date date,
  weakest_skill skill_key,
  daily_study_minutes int not null default 30,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_user_goals_user_active on user_goals (user_id, is_active);

-- ============================================================================
-- Content: lessons
-- ============================================================================
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  skill skill_key not null,
  category text not null,
  title text not null,
  subtitle text,
  content jsonb not null default '[]'::jsonb, -- array of {heading, body, tips[]}
  order_index int not null default 0,
  is_premium boolean not null default false,
  estimated_minutes int not null default 10,
  created_at timestamptz not null default now()
);
create index if not exists idx_lessons_skill on lessons (skill, order_index);

create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ============================================================================
-- Content: reading passages & listening audio
-- ============================================================================
create table if not exists reading_passages (
  id uuid primary key default gen_random_uuid(),
  ielts_type ielts_type not null default 'academic',
  title text not null,
  body text not null,
  word_count int not null default 0,
  section_number int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists listening_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  transcript text not null,
  audio_url text,
  section_number int not null default 1,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Content: questions
-- ============================================================================
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  skill skill_key not null,
  question_type text not null, -- e.g. 'true_false_not_given', 'matching_headings', 'multiple_choice'
  topic text,
  difficulty difficulty_level not null default 'medium',
  estimated_band numeric(2,1),
  prompt text not null,
  passage_id uuid references reading_passages (id) on delete set null,
  listening_track_id uuid references listening_tracks (id) on delete set null,
  options jsonb, -- array of choice strings, or null for short-answer
  correct_answer jsonb not null, -- string | string[] depending on question_type
  explanation text,
  strategy_note text,
  tags text[] not null default '{}',
  estimated_time_seconds int not null default 60,
  order_index int not null default 0,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_questions_skill_type on questions (skill, question_type);
create index if not exists idx_questions_passage on questions (passage_id);
create index if not exists idx_questions_track on questions (listening_track_id);

create table if not exists question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  selected_answer jsonb,
  is_correct boolean not null,
  time_spent_seconds int not null default 0,
  practice_session_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_question_attempts_user on question_attempts (user_id, created_at desc);

create table if not exists practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  skill skill_key not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  question_count int not null default 0,
  correct_count int not null default 0
);

create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  question_id uuid references questions (id) on delete cascade,
  vocabulary_word_id uuid,
  lesson_id uuid references lessons (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Mock tests
-- ============================================================================
create table if not exists mock_tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  ielts_type ielts_type not null default 'academic',
  is_free boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists mock_sections (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null references mock_tests (id) on delete cascade,
  skill skill_key not null,
  order_index int not null default 0,
  duration_minutes int not null,
  content_ref jsonb not null default '{}'::jsonb -- {passageIds:[], questionIds:[], trackIds:[], writingPromptIds:[], speakingTopicIds:[]}
);

create table if not exists mock_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  mock_test_id uuid not null references mock_tests (id) on delete cascade,
  status attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  overall_band numeric(2,1),
  state jsonb not null default '{}'::jsonb -- autosave/resume payload
);
create index if not exists idx_mock_attempts_user on mock_attempts (user_id, started_at desc);

create table if not exists reading_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  mock_attempt_id uuid references mock_attempts (id) on delete cascade,
  ielts_type ielts_type not null default 'academic',
  passage_ids uuid[] not null default '{}',
  raw_score int not null,
  total_questions int not null,
  band numeric(2,1) not null,
  time_spent_seconds int not null default 0,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists listening_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  mock_attempt_id uuid references mock_attempts (id) on delete cascade,
  track_ids uuid[] not null default '{}',
  raw_score int not null,
  total_questions int not null,
  band numeric(2,1) not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Writing
-- ============================================================================
create table if not exists writing_prompts (
  id uuid primary key default gen_random_uuid(),
  task_type writing_task_type not null,
  ielts_type ielts_type not null default 'academic',
  title text not null,
  prompt_text text not null,
  chart_image_url text,
  min_words int not null,
  time_limit_minutes int not null,
  created_at timestamptz not null default now()
);

create table if not exists writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  mock_attempt_id uuid references mock_attempts (id) on delete cascade,
  prompt_id uuid references writing_prompts (id) on delete set null,
  task_type writing_task_type not null,
  essay_text text not null,
  word_count int not null default 0,
  time_spent_seconds int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists writing_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references writing_submissions (id) on delete cascade,
  overall_band numeric(2,1) not null,
  task_achievement numeric(2,1) not null,
  coherence_cohesion numeric(2,1) not null,
  lexical_resource numeric(2,1) not null,
  grammatical_range numeric(2,1) not null,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  suggestions text[] not null default '{}',
  improved_example text,
  ai_model text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Speaking
-- ============================================================================
create table if not exists speaking_topics (
  id uuid primary key default gen_random_uuid(),
  part speaking_part not null,
  topic_category text not null,
  cue_card_text text,
  questions jsonb not null default '[]'::jsonb, -- string[]
  created_at timestamptz not null default now()
);

create table if not exists speaking_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  mock_attempt_id uuid references mock_attempts (id) on delete cascade,
  part speaking_part not null,
  topic_id uuid references speaking_topics (id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists speaking_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references speaking_sessions (id) on delete cascade,
  question_text text not null,
  audio_url text,
  transcript text,
  duration_seconds int not null default 0,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists speaking_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references speaking_sessions (id) on delete cascade,
  overall_band numeric(2,1) not null,
  fluency_coherence numeric(2,1) not null,
  lexical_resource numeric(2,1) not null,
  grammatical_range numeric(2,1) not null,
  pronunciation numeric(2,1) not null,
  filler_word_count int not null default 0,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  suggested_exercises text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Scores, plans, progress
-- ============================================================================
create table if not exists band_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  skill skill_or_overall not null,
  band numeric(2,1) not null,
  source score_source not null default 'practice',
  recorded_at timestamptz not null default now()
);
create index if not exists idx_band_scores_user on band_scores (user_id, skill, recorded_at desc);

create table if not exists band_conversion_tables (
  id uuid primary key default gen_random_uuid(),
  scale reading_band_scale not null,
  raw_min int not null,
  raw_max int not null,
  band numeric(2,1) not null
);
create index if not exists idx_band_conversion_scale on band_conversion_tables (scale, raw_min);

create table if not exists study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  date date not null,
  generated_at timestamptz not null default now(),
  is_completed boolean not null default false,
  unique (user_id, date)
);

create table if not exists study_plan_items (
  id uuid primary key default gen_random_uuid(),
  study_plan_id uuid not null references study_plans (id) on delete cascade,
  skill skill_key not null,
  title text not null,
  description text,
  duration_minutes int not null default 15,
  order_index int not null default 0,
  is_completed boolean not null default false,
  link_ref jsonb not null default '{}'::jsonb
);

-- ============================================================================
-- Vocabulary & grammar
-- ============================================================================
create table if not exists vocabulary_words (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  definition text not null,
  example_sentence text,
  topic text not null,
  synonyms text[] not null default '{}',
  collocations text[] not null default '{}',
  pronunciation_ipa text,
  difficulty difficulty_level not null default 'medium',
  created_at timestamptz not null default now()
);
create index if not exists idx_vocabulary_topic on vocabulary_words (topic);

create table if not exists user_vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  word_id uuid not null references vocabulary_words (id) on delete cascade,
  status vocab_status not null default 'new',
  next_review_at timestamptz not null default now(),
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, word_id)
);

create table if not exists grammar_lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  content jsonb not null default '[]'::jsonb,
  order_index int not null default 0
);

-- ============================================================================
-- Gamification
-- ============================================================================
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text not null,
  icon text not null default 'trophy-outline',
  criteria jsonb not null default '{}'::jsonb
);

create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  achievement_id uuid not null references achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

-- ============================================================================
-- AI Coach
-- ============================================================================
create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now()
);

create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations (id) on delete cascade,
  role message_role not null,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_messages_conversation on ai_messages (conversation_id, created_at);

-- ============================================================================
-- Subscriptions & notifications
-- ============================================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  plan subscription_plan not null default 'free',
  status subscription_status not null default 'none',
  revenuecat_customer_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  category notification_category not null,
  title text not null,
  body text not null,
  scheduled_at timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- History
-- ============================================================================
create table if not exists test_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  activity_type activity_type not null,
  ref_id uuid,
  band numeric(2,1),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_test_history_user on test_history (user_id, created_at desc);

-- ============================================================================
-- updated_at triggers
-- ============================================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on subscriptions;
create trigger trg_subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles enable row level security;
alter table user_goals enable row level security;
alter table lesson_progress enable row level security;
alter table question_attempts enable row level security;
alter table practice_sessions enable row level security;
alter table bookmarks enable row level security;
alter table mock_attempts enable row level security;
alter table reading_attempts enable row level security;
alter table listening_attempts enable row level security;
alter table writing_submissions enable row level security;
alter table writing_feedback enable row level security;
alter table speaking_sessions enable row level security;
alter table speaking_responses enable row level security;
alter table speaking_feedback enable row level security;
alter table band_scores enable row level security;
alter table study_plans enable row level security;
alter table study_plan_items enable row level security;
alter table user_vocabulary enable row level security;
alter table user_achievements enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table subscriptions enable row level security;
alter table notifications enable row level security;
alter table test_history enable row level security;

-- Public read-only content tables: RLS enabled but with a public select policy.
alter table lessons enable row level security;
alter table reading_passages enable row level security;
alter table listening_tracks enable row level security;
alter table questions enable row level security;
alter table mock_tests enable row level security;
alter table mock_sections enable row level security;
alter table writing_prompts enable row level security;
alter table speaking_topics enable row level security;
alter table vocabulary_words enable row level security;
alter table grammar_lessons enable row level security;
alter table achievements enable row level security;
alter table band_conversion_tables enable row level security;

do $$ begin
  create policy "content_public_read" on lessons for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on reading_passages for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on listening_tracks for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on questions for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on mock_tests for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on mock_sections for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on writing_prompts for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on speaking_topics for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on vocabulary_words for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on grammar_lessons for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on achievements for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "content_public_read" on band_conversion_tables for select using (true);
exception when duplicate_object then null; end $$;

-- Owner-only policies for every user-scoped table: the row's user_id (or a join
-- to one) must match the authenticated user. Written generically per table.
do $$
declare
  t text;
  owner_tables text[] := array[
    'profiles', 'user_goals', 'lesson_progress', 'question_attempts', 'practice_sessions',
    'bookmarks', 'mock_attempts', 'reading_attempts', 'listening_attempts',
    'writing_submissions', 'speaking_sessions', 'band_scores', 'study_plans',
    'user_vocabulary', 'user_achievements', 'ai_conversations', 'subscriptions',
    'notifications', 'test_history'
  ];
  id_col text;
begin
  foreach t in array owner_tables loop
    id_col := case when t = 'profiles' then 'id' else 'user_id' end;
    execute format(
      'do $p$ begin
         create policy "owner_all" on %I for all using (auth.uid() = %I) with check (auth.uid() = %I);
       exception when duplicate_object then null; end $p$;',
      t, id_col, id_col
    );
  end loop;
end $$;

-- Child tables scoped via a join to their parent owner table.
do $$ begin
  create policy "owner_via_submission" on writing_feedback for all
    using (exists (
      select 1 from writing_submissions s
      where s.id = writing_feedback.submission_id and s.user_id = auth.uid()
    ))
    with check (exists (
      select 1 from writing_submissions s
      where s.id = writing_feedback.submission_id and s.user_id = auth.uid()
    ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owner_via_session" on speaking_responses for all
    using (exists (
      select 1 from speaking_sessions s
      where s.id = speaking_responses.session_id and s.user_id = auth.uid()
    ))
    with check (exists (
      select 1 from speaking_sessions s
      where s.id = speaking_responses.session_id and s.user_id = auth.uid()
    ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owner_via_session" on speaking_feedback for all
    using (exists (
      select 1 from speaking_sessions s
      where s.id = speaking_feedback.session_id and s.user_id = auth.uid()
    ))
    with check (exists (
      select 1 from speaking_sessions s
      where s.id = speaking_feedback.session_id and s.user_id = auth.uid()
    ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owner_via_plan" on study_plan_items for all
    using (exists (
      select 1 from study_plans p
      where p.id = study_plan_items.study_plan_id and p.user_id = auth.uid()
    ))
    with check (exists (
      select 1 from study_plans p
      where p.id = study_plan_items.study_plan_id and p.user_id = auth.uid()
    ));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owner_via_conversation" on ai_messages for all
    using (exists (
      select 1 from ai_conversations c
      where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
    ))
    with check (exists (
      select 1 from ai_conversations c
      where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
    ));
exception when duplicate_object then null; end $$;

-- Auto-create a profile row when a new auth user signs up.
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name');
  insert into subscriptions (user_id, plan, status) values (new.id, 'free', 'none');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
