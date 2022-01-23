-- delete existing data
delete from calendar_event;

-- add new column
alter table calendar_event
add column
calendar_type varchar(256) not null;