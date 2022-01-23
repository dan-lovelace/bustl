.PHONY: build clean deploy validate-workspace

build:
	npm run build

clean:
	rm -rf ./public

deploy: validate-workspace clean build
	aws s3 sync ./public/ s3://$(DEPLOY_BUCKET)/
	AWS_PAGER="" aws cloudfront create-invalidation --distribution-id $(DISTRIBUTION_ID) --paths "/*" --region us-east-2

DEPLOY_BUCKET = $(shell aws ssm get-parameter --name "/$(TERRAFORM_WORKSPACE)/about_client_bucket_name" --region us-east-2 --with-decryption --query Parameter.Value --output text)
DISTRIBUTION_ID = $(shell aws ssm get-parameter --name "/$(TERRAFORM_WORKSPACE)/about_client_cloudfront_id" --region us-east-2 --with-decryption --query Parameter.Value --output text)

validate-workspace:
ifndef TERRAFORM_WORKSPACE
	$(error Missing TERRAFORM_WORKSPACE)
endif