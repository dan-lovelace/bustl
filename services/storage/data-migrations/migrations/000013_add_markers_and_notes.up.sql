-- create new tables
create table project (
    id serial primary key,
	created_at timestamptz not null,
	updated_at timestamptz not null,
    active boolean not null,

    app_user_id integer references app_user(id) on delete cascade not null,

    name varchar(1024),
    sort_position integer
);

create table note_type (
    id serial primary key,
	created_at timestamptz not null,
	updated_at timestamptz not null,
    active boolean not null,

    project_id integer references project(id) on delete cascade not null,

    name varchar(1024),
    sort_position integer
);

create table note (
    id serial primary key,
	created_at timestamptz not null,
	updated_at timestamptz not null,
    active boolean not null,

    note_type_id integer references note_type(id) on delete cascade not null,

    archived boolean not null default false,
    title varchar(1024),
    body text,
    sort_position integer
);

create table board_marker (
    id serial primary key,
	created_at timestamptz not null,
	updated_at timestamptz not null,
    active boolean not null,

    board_id integer references board(id) on delete cascade not null,
    
    marker_type varchar(1024) not null,
    x_position integer not null,
    y_position integer not null,
    
    note_id integer references note(id),
    add_to_calendar_time timestamptz,
    sort_position integer
);

-- create triggers
drop trigger if exists project_row_inserted on project;
create trigger project_row_inserted before insert
  on project
  for each row
  execute procedure handle_row_insert();

drop trigger if exists project_row_updated on project;
create trigger project_row_updated before update
  on project
  for each row
  execute procedure handle_row_update();

drop trigger if exists note_type_row_inserted on note_type;
create trigger note_type_row_inserted before insert
  on note_type
  for each row
  execute procedure handle_row_insert();

drop trigger if exists note_type_row_updated on note_type;
create trigger note_type_row_updated before update
  on note_type
  for each row
  execute procedure handle_row_update();

drop trigger if exists note_row_inserted on note;
create trigger note_row_inserted before insert
  on note
  for each row
  execute procedure handle_row_insert();

drop trigger if exists note_row_updated on note;
create trigger note_row_updated before update
  on note
  for each row
  execute procedure handle_row_update();

drop trigger if exists board_marker_row_inserted on board_marker;
create trigger board_marker_row_inserted before insert
  on board_marker
  for each row
  execute procedure handle_row_insert();

drop trigger if exists board_marker_row_updated on board_marker;
create trigger board_marker_row_updated before update
  on board_marker
  for each row
  execute procedure handle_row_update();