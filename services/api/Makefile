.PHONY: build clean create-users deploy validate-workspace

build:
	env GOOS=linux go build -ldflags="-s -w" -o bin/app-user handlers/app-user/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/board handlers/board/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/board-marker handlers/board-marker/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/calendar-event handlers/calendar-event/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/contact-message handlers/contact-message/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/image handlers/image/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/note handlers/note/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/note-type handlers/note-type/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/project handlers/project/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/subscription handlers/subscription/main.go

clean:
	rm -rf ./bin

create-users: validate-workspace
	env GOOS=linux go build -ldflags="-s -w" -o bin/create-machine-users scripts/create-machine-users/main.go
	bin/create-machine-users $(TERRAFORM_WORKSPACE)

postdeploy: validate-workspace
	$(info POSTDEPLOY CALLED)
	env GOOS=linux go build -ldflags="-s -w" -o bin/create-aws-exports scripts/create-aws-exports/main.go 
	bin/create-aws-exports $(TERRAFORM_WORKSPACE)

deploy: validate-workspace clean build
ifndef function
	sls deploy --stage $(TERRAFORM_WORKSPACE)
	$(MAKE) postdeploy
else
	sls deploy function --function $(function) --stage $(TERRAFORM_WORKSPACE)
endif

validate-workspace:
ifndef TERRAFORM_WORKSPACE
	$(error Missing TERRAFORM_WORKSPACE)
endif