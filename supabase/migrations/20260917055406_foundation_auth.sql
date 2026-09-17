create type public.user_role as enum (
  'system_admin',
  'education_manager',
  'participant'
);

create type public.employment_status as enum ('active', 'inactive');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  employee_no text not null unique
    check (employee_no ~ '^[a-z0-9_-]{3,32}$'),
  full_name text not null check (length(trim(full_name)) > 0),
  department_id uuid references public.departments(id) on delete set null,
  company_email text not null,
  employment_status public.employment_status not null default 'active',
  grade text,
  job_title text,
  mobile_phone text,
  hired_on date,
  preferred_locale text not null default 'ko'
    check (preferred_locale in ('ko', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_department_id_idx on public.profiles (department_id);
create index profiles_employment_status_idx
  on public.profiles (employment_status);

create schema if not exists private;
revoke all on schema private from public;

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;

create trigger departments_set_updated_at
before update on public.departments
for each row execute function private.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

alter table public.departments enable row level security;
alter table public.profiles enable row level security;

revoke all on table public.departments from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;

grant select on table public.departments to authenticated;
grant select on table public.profiles to authenticated;
grant update (preferred_locale) on table public.profiles to authenticated;

create policy departments_select_authenticated
on public.departments
for select
to authenticated
using ((select auth.uid()) is not null);

create policy profiles_select_self_or_staff
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
  or coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') in (
    'system_admin',
    'education_manager'
  )
);

create policy profiles_update_own_locale
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
