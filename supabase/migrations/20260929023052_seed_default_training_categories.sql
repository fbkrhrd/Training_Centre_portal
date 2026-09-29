insert into public.training_categories (name_ko, name_en, is_active)
select '역량교육', 'Competency Development', true
where not exists (
  select 1 from public.training_categories where name_ko = '역량교육'
);

insert into public.training_categories (name_ko, name_en, is_active)
select '직무교육', 'Job Skills Development', true
where not exists (
  select 1 from public.training_categories where name_ko = '직무교육'
);
