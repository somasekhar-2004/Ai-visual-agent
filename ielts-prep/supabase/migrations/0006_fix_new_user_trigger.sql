create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'none');

  return new;
end;
$$;
