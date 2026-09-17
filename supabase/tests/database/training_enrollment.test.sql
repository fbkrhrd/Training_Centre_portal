begin;
select plan(8);

select has_table('public', 'training_categories', 'categories exist');
select has_table('public', 'courses', 'courses exist');
select has_table('public', 'course_managers', 'course managers exist');
select has_table('public', 'course_sessions', 'sessions exist');
select has_table('public', 'enrollments', 'enrollments exist');
select has_column('public', 'course_sessions', 'starts_at', 'session start exists');
select has_column('public', 'enrollments', 'status', 'enrollment status exists');
select col_is_unique('public', 'enrollments', array['session_id', 'participant_id'], 'one enrollment per participant and session');

select * from finish();
rollback;
