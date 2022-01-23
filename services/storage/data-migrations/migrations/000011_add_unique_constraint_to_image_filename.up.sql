-- add new constraint
alter table image
add constraint filename_unique unique (filename);