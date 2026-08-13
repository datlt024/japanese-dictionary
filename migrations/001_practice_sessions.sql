-- Migration 001: Practice Sessions
-- Lưu kết quả mỗi phiên luyện tập

create table if not exists practice_sessions (
    id           uuid        primary key default gen_random_uuid(),
    user_id      uuid        not null references auth.users(id) on delete cascade,
    notebook_id  uuid        not null references notebooks(id) on delete cascade,
    mode         text        not null check (mode in ('flashcard', 'quiz', 'writing', 'minitest')),
    known_ids    text[]      not null default '{}',
    unknown_ids  text[]      not null default '{}',
    total_items  int         not null,
    time_taken   int,        -- giây, chỉ có khi mode = 'minitest'
    created_at   timestamptz not null default now()
);

create index if not exists practice_sessions_user_created_idx
    on practice_sessions(user_id, created_at desc);

create index if not exists practice_sessions_notebook_idx
    on practice_sessions(notebook_id);

alter table practice_sessions enable row level security;

create policy "users can insert own practice sessions"
    on practice_sessions for insert to authenticated
    with check (auth.uid() = user_id);

create policy "users can view own practice sessions"
    on practice_sessions for select to authenticated
    using (auth.uid() = user_id);
