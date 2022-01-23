-- add old column back to board_marker
alter table board_marker
add column
add_to_calendar_time timestamptz;

-- remove new column from board_marker
alter table board_marker
drop column calendar_event_id;

-- drop new table
drop table if exists calendar_event;