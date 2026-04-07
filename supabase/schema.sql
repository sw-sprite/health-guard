-- ============================================================
--  Health Guard — Full Schema
--  Single source of truth. Run in Supabase SQL Editor.
--  Drops all existing data and rebuilds from scratch.
-- ============================================================

-- ── 1. Drop trigger + function ────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ── 2. Drop tables (leaf → root) ─────────────────────────────
drop table if exists public.habit_entries   cascade;
drop table if exists public.habits          cascade;
drop table if exists public.notifications   cascade;
drop table if exists public.medication_logs cascade;
drop table if exists public.medications     cascade;
drop table if exists public.user_profiles   cascade;

-- ── 3. Tables ─────────────────────────────────────────────────

create table public.user_profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text not null,
  city       text not null default '',
  avatar_url text,
  created_at timestamptz default now()
);

create table public.habits (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid not null references auth.users on delete cascade,
  name                       text not null,
  icon                       text not null default 'task_alt',
  category                   text not null default 'lifestyle'
                               check (category in ('medication','health','lifestyle')),
  goal_amount                integer not null default 1,
  goal_unit                  text not null default 'times',
  goal_per                   text not null default 'day'
                               check (goal_per in ('day','week','month','year')),
  repeat_type                text not null default 'daily'
                               check (repeat_type in ('daily','monthly','interval')),
  repeat_config              jsonb not null default '{}',
  time_of_day                text[] not null default '{}',
  start_date                 date not null default current_date,
  end_condition              text not null default 'never'
                               check (end_condition in ('never','on_date')),
  end_date                   date,
  reminder_time              text not null default '08:00 AM',
  medication_dosage          text,
  medication_frequency_hours integer,
  created_at                 timestamptz default now()
);

create table public.habit_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  habit_id   uuid not null references public.habits on delete cascade,
  entry_date date not null,
  status     text not null default 'pending'
               check (status in ('pending','success','skipped','failed')),
  amount     integer not null default 0,
  created_at timestamptz default now(),
  unique (habit_id, entry_date)
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  title      text not null,
  message    text not null,
  type       text not null check (type in ('info','warning','critical')),
  read       boolean not null default false,
  created_at timestamptz default now()
);

-- ── 4. Row Level Security ─────────────────────────────────────

alter table public.user_profiles enable row level security;
alter table public.habits         enable row level security;
alter table public.habit_entries  enable row level security;
alter table public.notifications  enable row level security;

-- user_profiles
create policy "profiles_select" on public.user_profiles
  for select using (auth.uid() = id);
create policy "profiles_insert" on public.user_profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update" on public.user_profiles
  for update using (auth.uid() = id);

-- habits
create policy "habits_select" on public.habits
  for select using (auth.uid() = user_id);
create policy "habits_insert" on public.habits
  for insert with check (auth.uid() = user_id);
create policy "habits_update" on public.habits
  for update using (auth.uid() = user_id);
create policy "habits_delete" on public.habits
  for delete using (auth.uid() = user_id);

-- habit_entries
create policy "entries_select" on public.habit_entries
  for select using (auth.uid() = user_id);
create policy "entries_insert" on public.habit_entries
  for insert with check (auth.uid() = user_id);
create policy "entries_update" on public.habit_entries
  for update using (auth.uid() = user_id);
create policy "entries_delete" on public.habit_entries
  for delete using (auth.uid() = user_id);

-- notifications
create policy "notifs_select" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifs_insert" on public.notifications
  for insert with check (auth.uid() = user_id);
create policy "notifs_update" on public.notifications
  for update using (auth.uid() = user_id);

-- ── 5. Auto-create profile on first login ─────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, name, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    ''
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
