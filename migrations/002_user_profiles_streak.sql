-- Migration 002: Thêm streak và updated_at vào user_profiles

alter table user_profiles
    add column if not exists updated_at        timestamptz default now(),
    add column if not exists streak_count      int         not null default 0,
    add column if not exists streak_last_date  date,
    add column if not exists streak_active_days int[]      not null default '{}';

-- Tự động cập nhật updated_at khi record thay đổi
create or replace function update_user_profiles_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger trg_user_profiles_updated_at
    before update on user_profiles
    for each row execute function update_user_profiles_updated_at();
