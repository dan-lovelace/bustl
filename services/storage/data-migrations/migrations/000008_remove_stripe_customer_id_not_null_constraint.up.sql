-- remove existing users
delete from app_user;

-- remove original column
alter table app_user
drop column stripe_customer_id;

-- re-add without not null constraint
alter table app_user
add column
stripe_customer_id varchar(128);