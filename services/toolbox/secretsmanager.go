package toolbox

import (
	// "fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
)

func GenerateRandomPassword(excludePunctuation bool) (string, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return "", err
	}

	svc := secretsmanager.New(sess)
	input := &secretsmanager.GetRandomPasswordInput{
		ExcludePunctuation: aws.Bool(excludePunctuation),
	}
	result, err := svc.GetRandomPassword(input)

	if err != nil {
		return "", err
	}

	return *result.RandomPassword, nil
}

func GetSecret(id string) (string, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return "", err
	}

	svc := secretsmanager.New(sess)
	input := &secretsmanager.GetSecretValueInput{
		SecretId: aws.String(id),
	}

	result, err := svc.GetSecretValue(input)
	if err != nil {
		return "", err
	}

	return *result.SecretString, nil
}

func UpdateSecret(id string, secret string) (string, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return "", err
	}

	svc := secretsmanager.New(sess)
	input := &secretsmanager.PutSecretValueInput{
		SecretId:     aws.String(id),
		SecretString: aws.String(secret),
	}
	result, err := svc.PutSecretValue(input)

	if err != nil {
		return "", err
	}

	return *result.Name, nil
}
