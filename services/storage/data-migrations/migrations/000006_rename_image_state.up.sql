-- delete existing images
delete from image;

-- drop state column
alter table image
drop column state;

-- add new column
alter table image
add column
processing_state varchar(255) not null;