.PHONY: get-aws-exports build clean deploy validate-workspace

build:
	REACT_APP_ABOUT_CLIENT_DOMAIN_NAME=$(ABOUT_CLIENT_DOMAIN_NAME)
	npm run build

clean:
	rm -rf ./build

deploy: validate-workspace get-aws-exports clean build
	aws s3 sync ./build/ s3://$(DEPLOY_BUCKET)/
	AWS_PAGER="" aws cloudfront create-invalidation --distribution-id $(DISTRIBUTION_ID) --paths "/*" --region us-east-2

DEPLOY_BUCKET = $(shell aws ssm get-parameter --name "/$(TERRAFORM_WORKSPACE)/web_client_bucket_name" --region us-east-2 --with-decryption --query Parameter.Value --output text)
DISTRIBUTION_ID = $(shell aws ssm get-parameter --name "/$(TERRAFORM_WORKSPACE)/web_client_cloudfront_id" --region us-east-2 --with-decryption --query Parameter.Value --output text)
ABOUT_CLIENT_DOMAIN_NAME = $(shell aws ssm get-parameter --name "/$(TERRAFORM_WORKSPACE)/about_client_domain_name" --region us-east-2 --with-decryption --query Parameter.Value --output text)

get-aws-exports: validate-workspace
	$(info Getting $(KEY) from $(BUCKET_NAME))
	aws s3 cp s3://$(BUCKET_NAME)/$(KEY) ./src/$(KEY)

BUCKET_NAME = $(shell aws ssm get-parameter --name "/$(TERRAFORM_WORKSPACE)/web_client_bucket_name" --region us-east-2 --with-decryption --query Parameter.Value --output text)
KEY = aws-exports.json

validate-workspace:
ifndef TERRAFORM_WORKSPACE
	$(error Missing TERRAFORM_WORKSPACE)
endif