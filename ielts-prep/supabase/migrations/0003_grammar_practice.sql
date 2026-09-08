-- Grammar practice questions — a new content type alongside the existing
-- reading/listening `questions` table (kept separate since grammar
-- questions have a simpler shape: no passage/track linkage, no skill/tags).

do $$ begin
  create type grammar_question_type as enum ('multiple_choice', 'error_correction', 'fill_blank');
exception when duplicate_object then null; end $$;

create table if not exists grammar_questions (
  id uuid primary key default gen_random_uuid(),
  topic text not null, -- matches grammar_lessons.title, for weak-topic -> lesson recommendations
  difficulty difficulty_level not null default 'medium',
  question_type grammar_question_type not null,
  prompt text not null,
  options jsonb, -- string[] for multiple_choice, null otherwise
  correct_answer text not null,
  explanation text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_grammar_questions_topic on grammar_questions (topic);

create table if not exists grammar_question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  question_id uuid not null references grammar_questions (id) on delete cascade,
  selected_answer text,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_grammar_attempts_user on grammar_question_attempts (user_id, created_at desc);

alter table grammar_questions enable row level security;
alter table grammar_question_attempts enable row level security;

do $$ begin
  create policy "content_public_read" on grammar_questions for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owner_all" on grammar_question_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
