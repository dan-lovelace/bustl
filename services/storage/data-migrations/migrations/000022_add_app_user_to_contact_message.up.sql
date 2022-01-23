-- add new column
alter table contact_message
add column
app_user_id int references app_user(id) on delete cascade not null;