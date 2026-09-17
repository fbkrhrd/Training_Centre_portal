begin;
select plan(10);

select has_table('public', 'departments', 'departments exists');
select has_table('public', 'profiles', 'profiles exists');
select has_column('public', 'profiles', 'employee_no', 'employee number exists');
select has_column('public', 'profiles', 'preferred_locale', 'locale exists');
select col_is_unique(
  'public',
  'profiles',
  'employee_no',
  'employee number is unique'
);
select policies_are(
  'public',
  'profiles',
  array['profiles_select_self_or_staff', 'profiles_update_own_locale']
);
select table_privs_are(
  'authenticated',
  'public',
  'departments',
  array['SELECT']
);
select table_privs_are(
  'authenticated',
  'public',
  'profiles',
  array['SELECT']
);
select table_privs_are(
  'anon',
  'public',
  'profiles',
  array[]::text[]
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.profiles'::regclass
  ),
  true,
  'profiles has RLS enabled'
);

select * from finish();
rollback;
