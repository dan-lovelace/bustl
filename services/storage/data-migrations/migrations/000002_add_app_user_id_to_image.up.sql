-- delete existing images
delete from image;

-- add new column
alter table image
add column 
app_user_id integer references app_user(id) on delete cascade not null;