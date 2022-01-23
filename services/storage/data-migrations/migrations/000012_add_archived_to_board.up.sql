-- add new column
alter table board
add column
archived boolean not null default false;