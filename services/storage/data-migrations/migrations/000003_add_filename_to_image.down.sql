-- add old column
alter table image
add column 
src varchar(2048) not null;

-- remove new column
alter table image
drop column filename;

-- cannot add existing images
