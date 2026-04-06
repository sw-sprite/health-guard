-- Health Guard — Migration 002
-- Run this in Supabase SQL Editor AFTER migration 001

-- 1. Add log type column to medication_logs
alter table public.medication_logs
  add column if not exists type text not null default 'medication'
    check (type in ('medication', 'hydration', 'exercise', 'note'));

-- 2. INSERT policy for user_profiles (needed for trigger + first-login fallback)
drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

-- 3. INSERT policy for notifications (so API routes can create them)
drop policy if exists "Users can insert own notifications" on public.notifications;
create policy "Users can insert own notifications" on public.notifications
  for insert with check (auth.uid() = user_id);

-- 4. INSERT policy for medication_logs
drop policy if exists "Users can insert own logs" on public.medication_logs;
create policy "Users can insert own logs" on public.medication_logs
  for insert with check (auth.uid() = user_id);

-- 5. INSERT policy for medications
drop policy if exists "Users can delete own medications" on public.medications;
drop policy if exists "Users can delete own medications" on public.medications;

-- 6. Auto-create user_profile on first Google login
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, name, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'Austin, TX'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
