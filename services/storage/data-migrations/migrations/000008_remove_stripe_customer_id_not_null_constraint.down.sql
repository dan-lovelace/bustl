-- remove new column
alter table app_user
drop column stripe_customer_id;

-- re-add column with old configuration
alter table app_user
add column
stripe_customer_id varchar(128) not null;

-- cannot recreate existing users