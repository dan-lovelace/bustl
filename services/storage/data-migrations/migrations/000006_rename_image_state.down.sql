-- drop new column
alter table image
drop column processing_state;

-- add old state column
alter table image
add column
state varchar(255) not null;

-- cannot add existing images