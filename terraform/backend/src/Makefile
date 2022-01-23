.PHONY: build clean deploy validate-workspace

build:
	env GOOS=linux go build -ldflags="-s -w" -o bin/pre-sign-up pre-sign-up/handler.go

clean:
	rm -rf ./bin

deploy: validate-workspace clean build


validate-workspace:
ifndef TERRAFORM_WORKSPACE
	$(error Missing TERRAFORM_WORKSPACE)
endif