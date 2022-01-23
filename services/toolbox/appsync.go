package toolbox

import (
	"errors"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/appsync"
)

func GetGraphqlApi(env string) (*appsync.GraphqlApi, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return nil, err
	}

	svc := appsync.New(sess)
	input := &appsync.ListGraphqlApisInput{
		MaxResults: aws.Int64(25),
	}

	result, err := svc.ListGraphqlApis(input)
	if err != nil {
		return nil, err
	}

	for _, api := range result.GraphqlApis {
		if *api.Tags["STAGE"] == env {
			return api, nil
		}
	}

	return nil, errors.New("Not found")
}
