-- remove named constraint
alter table image
drop constraint if exists filename_key;