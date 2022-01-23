-- delete existing images
delete from image;

-- add new column
alter table image
add column
state varchar(255) not null;