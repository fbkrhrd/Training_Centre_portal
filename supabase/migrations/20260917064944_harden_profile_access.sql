grant select, insert, update on table public.departments to service_role;
grant select, insert, update on table public.profiles to service_role;

create function private.current_user_is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and employment_status = 'active'
  );
$$;

create function private.current_user_is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.id = (select auth.uid())
      and p.employment_status = 'active'
      and coalesce(u.raw_app_meta_data ->> 'role', '') in (
        'system_admin',
        'education_manager'
      )
  );
$$;

revoke all on function private.current_user_is_active() from public;
revoke all on function private.current_user_is_staff() from public;
grant usage on schema private to authenticated;
grant execute on function private.current_user_is_active() to authenticated;
grant execute on function private.current_user_is_staff() to authenticated;

drop policy profiles_select_self_or_staff on public.profiles;
create policy profiles_select_self_or_staff
on public.profiles
for select
to authenticated
using (
  private.current_user_is_active()
  and ((select auth.uid()) = id or private.current_user_is_staff())
);

drop policy profiles_update_own_locale on public.profiles;
create policy profiles_update_own_locale
on public.profiles
for update
to authenticated
using (
  private.current_user_is_active()
  and (select auth.uid()) = id
)
with check (
  private.current_user_is_active()
  and (select auth.uid()) = id
);
