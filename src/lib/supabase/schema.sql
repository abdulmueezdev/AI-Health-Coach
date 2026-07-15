-- 1. Create private storage bucket for meal photos
insert into storage.buckets (id, name, public) values ('meal-photos', 'meal-photos', false);

-- Enable RLS on storage bucket
create policy "Users can only access their own meal photos"
on storage.objects for all
using ( bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1] );

-- 2. profiles
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  goal_type text,
  starting_weight numeric,
  target_weight numeric,
  height numeric,
  activity_level text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can manage their own profiles" on public.profiles
  for all using (auth.uid() = user_id);

-- 3. meals
create type public.meal_source as enum ('photo', 'manual');

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  logged_at timestamptz not null,
  photo_url text,
  description text not null,
  calories_estimate integer not null,
  macros jsonb not null,
  source public.meal_source not null
);

create index idx_meals_user_logged_at on public.meals(user_id, logged_at);

alter table public.meals enable row level security;
create policy "Users can manage their own meals" on public.meals
  for all using (auth.uid() = user_id);

-- 4. workouts
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  date date not null,
  type text not null,
  exercises jsonb not null,
  duration_min integer not null,
  intensity text not null,
  notes text
);

create index idx_workouts_user_date on public.workouts(user_id, date);

alter table public.workouts enable row level security;
create policy "Users can manage their own workouts" on public.workouts
  for all using (auth.uid() = user_id);

-- 5. habits
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  name text not null,
  frequency text not null,
  streak_count integer default 0 not null,
  last_completed_at timestamptz
);

alter table public.habits enable row level security;
create policy "Users can manage their own habits" on public.habits
  for all using (auth.uid() = user_id);

-- 6. habit_logs
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  completed_at timestamptz not null
);

create index idx_habit_logs_habit_completed_at on public.habit_logs(habit_id, completed_at);

alter table public.habit_logs enable row level security;
create policy "Users can manage their own habit_logs" on public.habit_logs
  for all using (auth.uid() = user_id);

-- 7. goals
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  type text not null,
  target_value numeric not null,
  target_date date,
  status text not null
);

alter table public.goals enable row level security;
create policy "Users can manage their own goals" on public.goals
  for all using (auth.uid() = user_id);

-- 8. progress_snapshots
create table public.progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  date date not null,
  weight numeric,
  body_stat jsonb
);

create index idx_progress_snapshots_user_date on public.progress_snapshots(user_id, date);

alter table public.progress_snapshots enable row level security;
create policy "Users can manage their own progress_snapshots" on public.progress_snapshots
  for all using (auth.uid() = user_id);

-- 9. ai_interactions
create type public.ai_role as enum ('user', 'assistant');

create table public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete cascade not null,
  role public.ai_role not null,
  content text not null,
  created_at timestamptz default now() not null
);

create index idx_ai_interactions_user_created_at on public.ai_interactions(user_id, created_at desc);

alter table public.ai_interactions enable row level security;
create policy "Users can manage their own ai_interactions" on public.ai_interactions
  for all using (auth.uid() = user_id);

-- 10. ai_profile_summary
create table public.ai_profile_summary (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  summary_text text,
  updated_at timestamptz default now() not null
);

alter table public.ai_profile_summary enable row level security;
create policy "Users can manage their own ai_profile_summary" on public.ai_profile_summary
  for all using (auth.uid() = user_id);
