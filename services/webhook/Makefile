.PHONY: build clean deploy

build:
	export GO111MODULE=on
	env GOOS=linux go build -ldflags="-s -w" -o bin/stripe stripe/main.go

clean:
	rm -rf ./bin ./vendor go.sum

deploy: clean build
	sls deploy --stage development --verbose
