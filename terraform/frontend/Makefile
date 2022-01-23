.PHONY: build clean deploy validate-workspace

build: validate-workspace clean
	# about-client-lambda-edge lambda
	cd about-client-lambda-edge && \
		zip -r ../about-client-lambda-edge.zip .

clean:
	rm -rf about-client-lambda-edge.zip

deploy: validate-workspace
	terraform workspace select $(TERRAFORM_WORKSPACE)
	terraform plan --var-file ../$(TERRAFORM_WORKSPACE).tfvars -out plan.out
	terraform apply plan.out

validate-workspace:
ifndef TERRAFORM_WORKSPACE
	$(error Missing TERRAFORM_WORKSPACE)
endif