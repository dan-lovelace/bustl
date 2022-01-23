-- remove old column
alter table app_user
drop column
terms_last_accepted;

-- add modified column
alter table app_user
add column
last_terms_accepted varchar(128);