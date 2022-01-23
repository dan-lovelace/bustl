package toolbox

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ssm"
)

func GetSSMParameter(env string, parameter string) (string, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return "", err
	}

	svc := ssm.New(sess)
	decrypt := true
	name := fmt.Sprintf("/%s/%s", env, parameter)
	input := &ssm.GetParameterInput{
		Name:           aws.String(name),
		WithDecryption: &decrypt,
	}

	result, err := svc.GetParameter(input)
	if err != nil {
		return "", err
	}

	return *result.Parameter.Value, nil
}
