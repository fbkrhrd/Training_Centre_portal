create type public.session_status as enum ('draft','open','closed','completed','cancelled');
create type public.enrollment_status as enum ('pending','approved','rejected','waiting','cancelled');
create type public.delivery_mode as enum ('in_person','online','blended');

create table public.training_categories (
  id uuid primary key default gen_random_uuid(),
  name_ko text not null, name_en text not null, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.courses (
  id uuid primary key default gen_random_uuid(), category_id uuid references public.training_categories(id),
  title_ko text not null, title_en text not null, description_ko text, description_en text,
  is_published boolean not null default false, created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.course_managers (
  course_id uuid not null references public.courses(id) on delete cascade,
  manager_id uuid not null references public.profiles(id), primary key(course_id, manager_id)
);
create table public.course_sessions (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
  session_no integer not null check(session_no > 0), status public.session_status not null default 'draft',
  delivery_mode public.delivery_mode not null, starts_at timestamptz not null, ends_at timestamptz not null check(ends_at > starts_at),
  location text, online_url text, capacity integer not null check(capacity > 0), application_opens_at timestamptz not null,
  application_closes_at timestamptz not null, cancellation_closes_at timestamptz not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(course_id, session_no), check(location is not null or online_url is not null)
);
create table public.enrollments (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references public.course_sessions(id) on delete cascade,
  participant_id uuid not null references public.profiles(id), status public.enrollment_status not null,
  requested_at timestamptz not null default now(), decided_at timestamptz, decided_by uuid references public.profiles(id),
  cancellation_reason text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(session_id, participant_id)
);
create index course_sessions_course_starts_idx on public.course_sessions(course_id, starts_at);
create index enrollments_participant_status_idx on public.enrollments(participant_id, status);
create index enrollments_session_status_idx on public.enrollments(session_id, status);

create trigger training_categories_set_updated_at before update on public.training_categories for each row execute function private.set_updated_at();
create trigger courses_set_updated_at before update on public.courses for each row execute function private.set_updated_at();
create trigger course_sessions_set_updated_at before update on public.course_sessions for each row execute function private.set_updated_at();
create trigger enrollments_set_updated_at before update on public.enrollments for each row execute function private.set_updated_at();

alter table public.training_categories enable row level security;
alter table public.courses enable row level security;
alter table public.course_managers enable row level security;
alter table public.course_sessions enable row level security;
alter table public.enrollments enable row level security;
revoke all on table public.training_categories, public.courses, public.course_managers, public.course_sessions, public.enrollments from anon, authenticated;
grant select on public.training_categories, public.courses, public.course_sessions to authenticated;
grant select, insert, update, delete on public.training_categories, public.courses, public.course_managers, public.course_sessions, public.enrollments to service_role;
