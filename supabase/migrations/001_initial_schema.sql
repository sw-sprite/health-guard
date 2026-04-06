-- Health Guard — Initial Schema
-- Run this in your Supabase SQL Editor

-- User profiles (extends Supabase auth.users)
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  city text not null default 'Austin, TX',
  avatar_url text,
  created_at timestamptz default now()
);

-- Medications configured per user
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles on delete cascade not null,
  name text not null,
  dosage text not null,
  frequency_hours integer not null default 24,
  created_at timestamptz default now()
);

-- Medication log entries
create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles on delete cascade not null,
  medication_id uuid references public.medications on delete set null,
  medication_name text not null,
  logged_at timestamptz not null default now(),
  notes text,
  created_at timestamptz default now()
);

-- In-app notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles on delete cascade not null,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'warning', 'critical')),
  read boolean not null default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.user_profiles enable row level security;
alter table public.medications enable row level security;
alter table public.medication_logs enable row level security;
alter table public.notifications enable row level security;

-- Policies: users can only see/edit their own data
create policy "Users can view own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id);

create policy "Users can view own medications" on public.medications for select using (auth.uid() = user_id);
create policy "Users can insert own medications" on public.medications for insert with check (auth.uid() = user_id);

create policy "Users can view own logs" on public.medication_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on public.medication_logs for insert with check (auth.uid() = user_id);

create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
