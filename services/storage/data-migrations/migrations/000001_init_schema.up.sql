-- TABLES: initial table schemas
create table app_user (
  id serial primary key,
	created_at timestamptz not null,
	updated_at timestamptz not null,
  active boolean not null,

  username varchar(512) unique not null,
  cognito_id varchar(255) unique not null
);

create table image (
  id serial primary key,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  active boolean not null,

  src varchar(2048) not null
);

create table board (
  id serial primary key,
	created_at timestamptz not null,
	updated_at timestamptz not null,
  active boolean not null,

  app_user_id integer references app_user(id) on delete cascade not null,
  image_id integer references image(id) on delete cascade not null,

  title varchar(1024),
	body text
);

-- FUNCTIONS: automatically update created_at and updated_at
create or replace function handle_row_insert()
  returns trigger
  language PLPGSQL
AS $$
begin
  new.created_at = now();
  new.updated_at = now();
  new.active = true;
  return new;
end;
$$;

create or replace function handle_row_update()
  returns trigger
  language PLPGSQL
AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- TRIGGERS: attach triggers to initial tables
drop trigger if exists app_user_row_inserted on app_user;
create trigger app_user_row_inserted before insert
  on app_user
  for each row
  execute procedure handle_row_insert();

drop trigger if exists app_user_row_updated on app_user;
create trigger app_user_row_updated before update
  on app_user
  for each row
  execute procedure handle_row_update();

drop trigger if exists image_row_inserted on image;
create trigger image_row_inserted before insert
  on image
  for each row
  execute procedure handle_row_insert();

drop trigger if exists image_row_updated on image;
create trigger image_row_updated before update
  on image
  for each row
  execute procedure handle_row_update();

drop trigger if exists board_row_inserted on board;
create trigger board_row_inserted before insert
  on board
  for each row
  execute procedure handle_row_insert();

drop trigger if exists board_row_updated on board;
create trigger board_row_updated before update
  on board
  for each row
  execute procedure handle_row_update();
