-- add new columns
alter table app_user
add column
subscription_status varchar(128) not null default 'incomplete';

alter table app_user
add column
subscription_plan varchar(128) not null default 'free';