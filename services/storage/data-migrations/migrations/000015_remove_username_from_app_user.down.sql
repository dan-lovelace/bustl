-- add old column
alter table app_user
add column username varchar(512) unique;