-- add named unique constraint
alter table image
add constraint filename_key unique (filename);