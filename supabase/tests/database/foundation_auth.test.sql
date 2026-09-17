begin;
select plan(14);

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
select table_privs_are(
  'service_role',
  'public',
  'departments',
  array['INSERT', 'SELECT', 'UPDATE']
);
select table_privs_are(
  'service_role',
  'public',
  'profiles',
  array['INSERT', 'SELECT', 'UPDATE']
);
select has_function('private', 'current_user_is_active', array[]::text[]);
select has_function('private', 'current_user_is_staff', array[]::text[]);

select * from finish();
rollback;
