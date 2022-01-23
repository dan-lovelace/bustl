-- delete existing images
delete from image;

-- add new column
alter table image
add column 
filename varchar(512) not null;

-- remove old column
alter table image
drop column src;