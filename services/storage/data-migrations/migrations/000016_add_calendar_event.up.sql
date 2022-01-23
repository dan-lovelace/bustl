-- create new table
create table calendar_event (
    id serial primary key,
	created_at timestamptz not null,
	updated_at timestamptz not null,
    active boolean not null,

    archived boolean not null default false,
    title varchar(1024) not null,
    start_time timestamptz not null,
    end_time timestamptz,
    all_day boolean,
    description text
);

-- create triggers
drop trigger if exists calendar_event_row_inserted on calendar_event;
create trigger calendar_event_row_inserted before insert
  on calendar_event
  for each row
  execute procedure handle_row_insert();

drop trigger if exists calendar_event_row_updated on calendar_event;
create trigger calendar_event_row_updated before update
  on calendar_event
  for each row
  execute procedure handle_row_update();

-- add new column to board_marker
alter table board_marker
add column
calendar_event_id integer references calendar_event(id) on delete cascade;

-- remove old column from board_marker
alter table board_marker
drop column
add_to_calendar_time;