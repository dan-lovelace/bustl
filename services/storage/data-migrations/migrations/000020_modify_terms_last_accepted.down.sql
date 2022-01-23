-- remove modified column
alter table app_user
drop column
last_terms_accepted;

-- add old column
alter table app_user
add column
terms_last_accepted timestamptz;