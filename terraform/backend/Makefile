.PHONY: build clean deploy validate-workspace

build: validate-workspace clean
	# post-confirmation lambda
	env GOOS=linux go build -ldflags="-s -w" -o src/bin/post-confirmation src/post-confirmation/handler.go
	cd src/bin && \
		zip -r ../../post-confirmation.zip ./post-confirmation

	# pre-sign-up lambda
	env GOOS=linux go build -ldflags="-s -w" -o src/bin/pre-sign-up src/pre-sign-up/handler.go
	cd src/bin && \
		zip -r ../../pre-sign-up.zip ./pre-sign-up

	# pre-token-gen lambda
	env GOOS=linux go build -ldflags="-s -w" -o src/bin/pre-token-gen src/pre-token-gen/handler.go
	cd src/bin && \
		zip -r ../../pre-token-gen.zip ./pre-token-gen

clean:
	rm -rf src/bin

	rm -rf post-confirmation.zip
	rm -rf pre-token-gen.zip
	rm -rf pre-sign-up.zip

deploy: validate-workspace
	terraform workspace select $(TERRAFORM_WORKSPACE)
	terraform plan --var-file ../$(TERRAFORM_WORKSPACE).tfvars -out plan.out
	terraform apply plan.out

validate-workspace:
ifndef TERRAFORM_WORKSPACE
	$(error Missing TERRAFORM_WORKSPACE)
endif