.PHONY: build clean deploy validate-workspace

build:
	env GOOS=linux go build -ldflags="-s -w" -o bin/user-upload handler/main.go

clean:
	rm -rf ./bin

deploy: validate-workspace clean build
ifndef function
	sls deploy --stage $(TERRAFORM_WORKSPACE)
else
	sls deploy function --function $(function) --stage $(TERRAFORM_WORKSPACE)
endif

validate-workspace:
ifndef TERRAFORM_WORKSPACE
	$(error Missing TERRAFORM_WORKSPACE)
endif