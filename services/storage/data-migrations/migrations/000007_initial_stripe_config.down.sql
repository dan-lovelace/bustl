-- drop new table
drop table if exists subscription_event;

-- drop new column
alter table app_user
drop column stripe_customer_id;

-- cannot add existing users