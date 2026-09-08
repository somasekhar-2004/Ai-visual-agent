-- Schema additions to support a much larger, filterable content library
-- (mock test numbering/difficulty, writing prompt categorisation + chart
-- data, speaking topic Part1/2/3 grouping). Kept as its own migration so
-- 0001_init.sql stays a clean historical record of the original schema.

do $$ begin
  create type task2_category as enum ('opinion', 'discussion', 'advantages_disadvantages', 'problem_solution', 'two_part_question');
exception when duplicate_object then null; end $$;

alter table mock_tests
  add column if not exists test_number int not null default 1,
  add column if not exists difficulty difficulty_level not null default 'medium';

alter table writing_prompts
  add column if not exists category task2_category,
  add column if not exists chart_data jsonb;

-- chart_image_url is superseded by locally-rendered chart_data; keep the
-- column nullable for backward compatibility rather than dropping it.
alter table writing_prompts alter column chart_image_url drop not null;

alter table speaking_topics
  add column if not exists group_id text not null default 'ungrouped';

create index if not exists idx_speaking_topics_group on speaking_topics (group_id);
create index if not exists idx_mock_tests_type_number on mock_tests (ielts_type, test_number);
