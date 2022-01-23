package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"project-oakwood/services/toolbox"
)

func createAWSExports() {
	// get target environment
	args := os.Args
	if len(args) < 2 {
		fmt.Println(("No environment provided"))
		os.Exit(1)
	}
	env := strings.TrimSpace(args[1])

	// get web client bucket name
	webClientBucket, err := toolbox.GetSSMParameter(env, "web_client_bucket_name")
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// get cognito auth exports
	ssmAuth, err := toolbox.GetSSMParameter(env, "aws_exports_auth")
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// convert ssm value to map
	var auth map[string]interface{}
	json.Unmarshal([]byte(ssmAuth), &auth)

	// get env's appsync api
	api, err := toolbox.GetGraphqlApi(env)
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// merge auth and appsync
	merged := map[string]interface{}{
		"aws_appsync_graphqlEndpoint":    *api.Uris["GRAPHQL"],
		"aws_appsync_region":             *api.UserPoolConfig.AwsRegion,
		"aws_appsync_authenticationType": *api.AuthenticationType,
		"Auth":                           auth,
	}

	// convert to json
	exports, err := json.MarshalIndent(merged, "", "    ")
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// save to s3
	key := "aws-exports.json"
	res, err := toolbox.PutS3Object(webClientBucket, key, string(exports))
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}
	fmt.Println("res", res)
}

func main() {
	createAWSExports()
}
