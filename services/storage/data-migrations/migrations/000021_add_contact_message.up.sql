-- create new table
create table contact_message (
    id serial primary key,
    created_at timestamptz not null,
    updated_at timestamptz not null,

    subject varchar(1024) not null,
    body text,
    rating integer
);

-- create triggers
drop trigger if exists contact_message_row_inserted on contact_message;
create trigger contact_message_row_inserted before insert
    on contact_message
    for each row
    execute procedure handle_row_insert();

drop trigger if exists contact_message_row_updated on contact_message;
create trigger contact_message_row_updated before update
    on contact_message
    for each row
    execute procedure handle_row_update();