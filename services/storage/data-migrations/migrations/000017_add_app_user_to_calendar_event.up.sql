-- add new column
alter table calendar_event
add column
app_user_id int references app_user(id) on delete cascade not null;