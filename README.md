# project-oakwood

A Serverless/React app to manage physical whiteboarding sessions.

## Deployment

Requirements

- Credentials for AWS user `dan-programmatic`
- terraform v0.14.3
- serverless v2.17.0
- golang v1.15.6
- node v12

```sh
# package and deploy backend aws resources
cd terraform/backend
TERRAFORM_WORKSPACE=development make build

terraform workspace select development
terraform plan --var-file ../development.tfvars -out plan.out -var "oakwood_db_password=<some password>"
terraform apply plan.out

# frontend aws resources
cd terraform/frontend
TERRAFORM_WORKSPACE=development make build

terraform workspace select development
terraform plan -var-file ../development.tfvars -out plan.out
terraform apply plan.out

# data migrations
cd services/storage/data-migrations
TERRAFORM_WORKSPACE=development make deploy
VPC_REGION=us-east-2 TERRAFORM_WORKSPACE=development make migrateremote

# machine users
cd services/api
TERRAFORM_WORKSPACE=development make create-users

# appsync api
cd services/api
nvm use
TERRAFORM_WORKSPACE=development make deploy

# user upload processor
cd services/user-upload
TERRAFORM_WORKSPACE=development make deploy

# about client
cd clients/about
TERRAFORM_WORKSPACE=development make deploy

# web client
cd clients/web
TERRAFORM_WORKSPACE=development make deploy
```

** There is a bug when deploying that requires manual reconnection of the Cognito Lambda trigger(s):

1. Go to the Cognito console and select Triggers
2. Set the post confirmation trigger to 'none' and save
3. Set the post confirmation trigger back to the Oakwood post-confirmation trigger and save

** The Stripe keys need to be manually added:

1. Login to stripe.com and get the public and private keys
2. Update the associated secrets in Secrets Manager with plaintext values

** The contact email address needs to be manually verified

1. Locate the address in the `*.tfvars` file used to build
2. Login to the account wherever it's hosted
3. Check the inbox and verify
4. If no email shows up, it's possible the SES mode is in "sandbox" which requires manual intervention to request a change from AWS

Troubleshooting

- If you've deployed a new environment and are receiving an error on the Cognito login page, make sure the user pool was created with the desired host. Open up `terraform/backend/auth.tf` and look at the web client login/logout urls in `locals`. If you need to make changes, take the following steps:

    1. Update `auth.tf` to the desired configuration
    2. Terraform plan/apply the changes using the original `plan` command so the DB password doesn't change
    3. Redeploy the API in `services/api` with `make deploy`
    4. Redeploy the web client in `clients/web` with `make deploy`

## Appsync

The above script will create a Cognito user pool named `development_oakwood_users` with groups `system-admin` and `system-user`. In order to use the Appsync console, you'll need to manually create two users and add one to each group. Login to AppSync as the `system-admin` user and call the `CreateAppUser` mutation using the `system-user`'s Cognito username (UUID) as the `cognito_id` argument.

## Local Development

The serverless nature of the technologies used in this stack do not allow for a true local environment. A live environment such as development is used for local iteration and must be specially configured in order to work. This will immediately block public access to whichever environment you choose so choose wisely or make a new environment from scratch.. don't use production :)

Change the variables `web_client_login_callback_url` and `web_client_logout_url` in `terraform/backend/auth.tf` to point to `http://localhost:3010` (just uncomment what's already there) and terraform plan/apply the changes to the development workspace. This will point the development Cognito hosted UI to your local environment so you can login. You'll then need to run the `create-aws-exports.go` script (or `make postdeploy`) in `services/api/scripts` and get the latest exports json (below).

```sh
# get the latest aws exports json
cd clients/web
TERRAFORM_WORKSPACE=development make get-aws-exports

# start the dev server and login with a system-user's credentials
cd clients/web
npm start
```

Troubleshooting

- There is no file called `aws-exports.json` in the web client's S3 bucket
    - This file gets placed after successful deployment of the api service and can be manually placed by running `go run create-aws-exports.go development` in `services/api/scripts`.

## Destroy

```sh
# serverless
cd services/api
serverless remove --stage development

# frontend terraform
cd terraform/frontend
terraform workspace select development
terraform destroy --var-file ../development.tfvars

# backend terraform
cd terraform/backend
terraform workspace select development
terraform destroy --var-file ../development.tfvars
```

## New Environment Setup

1. Create a new OAuth client and its credentials in GCP: https://console.cloud.google.com/home/dashboard
2. Store the client ID and secret in AWS Secrets Manager that follows the same format as the existing secret `oakwood-google-cognito-idp-development`
3. Make a new .tfvars file using the new environment's name and follow the deployment steps above
4. Get the CloudFront domain name from the AWS console for whatever distribution has the `oakwood-web-client` origin and make a new Route 53 A alias record using the appropriate app domain