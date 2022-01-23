-- delete existing users
delete from app_user;

-- add new app_user col
alter table app_user
add column stripe_customer_id varchar(128) not null;

-- add new events table
create table subscription_event (
  -- default fields
  id serial primary key,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  active boolean not null,

  -- required foreign keys
  app_user_id integer references app_user(id) on delete cascade not null,

  -- optional foreign keys
  image_id integer references image(id) on delete cascade,
  board_id integer references board(id) on delete cascade,

  -- everything else
  event_type varchar(255) not null
);

-- add triggers to new table
drop trigger if exists subscription_event_row_inserted on subscription_event;
create trigger subscription_event_row_inserted before insert
  on subscription_event
  for each row
  execute procedure handle_row_insert();

drop trigger if exists subscription_event_row_updated on subscription_event;
create trigger subscription_event_row_updated before update
  on subscription_event
  for each row
  execute procedure handle_row_update();