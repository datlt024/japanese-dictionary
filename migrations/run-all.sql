-- ============================================================
-- Run this file in Supabase Dashboard > SQL Editor
-- Order: 001 → 002 → 003 (each section is idempotent)
-- ============================================================

-- 001: practice_sessions table
create table if not exists practice_sessions (
    id           uuid        primary key default gen_random_uuid(),
    user_id      uuid        not null references auth.users(id) on delete cascade,
    notebook_id  uuid        not null references notebooks(id) on delete cascade,
    mode         text        not null check (mode in ('flashcard','quiz','writing','minitest')),
    known_ids    text[]      not null default '{}',
    unknown_ids  text[]      not null default '{}',
    total_items  int         not null,
    time_taken   int,
    created_at   timestamptz not null default now()
);

create index if not exists practice_sessions_user_id_idx
    on practice_sessions (user_id, created_at desc);

create index if not exists practice_sessions_notebook_id_idx
    on practice_sessions (notebook_id, created_at desc);

alter table practice_sessions enable row level security;

do $$ begin
    if not exists (
        select 1 from pg_policies
        where tablename = 'practice_sessions' and policyname = 'Users can insert own practice sessions'
    ) then
        create policy "Users can insert own practice sessions"
            on practice_sessions for insert
            to authenticated
            with check (auth.uid() = user_id);
    end if;
end $$;

do $$ begin
    if not exists (
        select 1 from pg_policies
        where tablename = 'practice_sessions' and policyname = 'Users can view own practice sessions'
    ) then
        create policy "Users can view own practice sessions"
            on practice_sessions for select
            to authenticated
            using (auth.uid() = user_id);
    end if;
end $$;

-- 002: streak columns on user_profiles
alter table user_profiles
    add column if not exists updated_at         timestamptz default now(),
    add column if not exists streak_count       int  not null default 0,
    add column if not exists streak_last_date   date,
    add column if not exists streak_active_days int[] not null default '{}';

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on user_profiles;
create trigger trg_user_profiles_updated_at
    before update on user_profiles
    for each row execute function set_updated_at();

-- 003: clean up dead JSON columns in grammars (safe to skip if already done)
alter table grammars
    drop column if exists formation,
    drop column if exists examples,
    drop column if exists variants,
    drop column if exists notes,
    drop column if exists tags,
    drop column if exists common_pairs,
    drop column if exists short_forms,
    drop column if exists differences,
    drop column if exists similar_grammar,
    drop column if exists reading_rules;
