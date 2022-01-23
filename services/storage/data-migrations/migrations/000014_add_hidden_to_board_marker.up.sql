-- add new column
alter table board_marker
add column
hidden boolean not null default false;