create extension if not exists "pgcrypto";

create table profiles (
  id uuid primary key default auth.uid(),
  email text,
  tz text default 'America/New_York',
  widgets jsonb default '{
    "order":["today","tasks","habits","gym","mood","civil","embeds"],
    "hidden":[],
    "settings":{}
  }'::jsonb
);
alter table profiles enable row level security;
create policy "self" on profiles for all using (id = auth.uid()) with check (id = auth.uid());

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  due_date date,
  status text not null default 'todo',
  created_at timestamptz default now(),
  completed_at timestamptz
);
alter table tasks enable row level security;
create policy "own" on tasks for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  goal_per_day int not null default 1,
  created_at timestamptz default now(),
  unique(user_id, name)
);
alter table habits enable row level security;
create policy "own" on habits for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  ts timestamptz not null default now(),
  qty int not null default 1
);
alter table habit_logs enable row level security;
create policy "own" on habit_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  ts timestamptz default now(),
  score int check (score between 1 and 5),
  note text
);
alter table moods enable row level security;
create policy "own" on moods for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  ts timestamptz default now(),
  bodypart text,
  notes text
);
alter table workouts enable row level security;
create policy "own" on workouts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  lift text, weight numeric, reps int
);
alter table workout_sets enable row level security;
create policy "cascade" on workout_sets for all using (
  exists(select 1 from workouts w where w.id = workout_sets.workout_id and w.user_id = auth.uid())
) with check (
  exists(select 1 from workouts w where w.id = workout_sets.workout_id and w.user_id = auth.uid())
);
