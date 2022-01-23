.PHONY: build clean deploy newmigration migrateup validate-workspace

MIGRATIONS_DIRECTORY="migrations"

# ----- build and deploy commands ----- #

build:
	$(info Building...)
	env GOOS=linux go build -ldflags="-s -w" -o bin/create-db-app-user src/create-db-app-user.go
	zip -r out.zip ./migrations ./buildspec.yml ./Makefile ./bin

clean:
	$(info Cleaning...)
	rm -rf out.zip

deploy: validate-workspace clean build
	$(info Deploying with workspace: $(TERRAFORM_WORKSPACE))
	aws s3 cp ./out.zip s3://oakwood-codebuild-$(TERRAFORM_WORKSPACE)/db_migrations/out.zip

# ----- data migration commands ----- #

newmigration:
ifndef name
	$(info Invalid usage)
	$(info Expected: make newmigration name=my_new_migration)
	$(error Missing migration name)
endif

	$(info Creating new migration $(name))
	migrate create -ext sql -dir $(MIGRATIONS_DIRECTORY) -seq $(name)

migrateup: validate-db-connection
	$(info Migrating up)
	@migrate -path $(MIGRATIONS_DIRECTORY) -database $(DB_CONNECTION_STRING) -verbose up $(count)

migratedown: validate-db-connection
	$(info Migrating down)
	@migrate -path $(MIGRATIONS_DIRECTORY) -database $(DB_CONNECTION_STRING) -verbose down $(count)

migrateremote: validate-workspace validate-region
	# starts a build for a remote codebuild project
	$(info Running remote migrations for $(TERRAFORM_WORKSPACE))
	AWS_PAGER="" aws codebuild start-build --project-name oakwood-migrations-$(TERRAFORM_WORKSPACE) --region $(VPC_REGION)

# ----- input validation functions ----- #

validate-db-connection:
ifndef DB_CONNECTION_STRING
ifndef VPC_REGION
	$(error Missing VPC_REGION - Set DB_CONNECTION_STRING to run locally)
else ifndef DB_SUPERUSER_SECRET_ID
	$(error Missing DB_SUPERUSER_SECRET_ID)
else
DB_CONNECTION_STRING = $(shell aws secretsmanager get-secret-value --secret-id $(DB_SUPERUSER_SECRET_ID) --region $(VPC_REGION) --query SecretString --output text)
endif
endif

validate-workspace:
ifndef TERRAFORM_WORKSPACE
	$(error Missing TERRAFORM_WORKSPACE)
endif

validate-region:
ifndef VPC_REGION
	$(error Missing VPC_REGION)
endif
