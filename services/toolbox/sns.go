package toolbox

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sns"
)

func PublishToSNSTopic(topicArn string, subject string, message string) error {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return err
	}

	svc := sns.New(sess)
	input := sns.PublishInput{
		TopicArn: aws.String(topicArn),
		Subject:  aws.String(subject),
		Message:  aws.String(message),
	}
	result, err := svc.Publish(&input)
	if err != nil {
		fmt.Println("err", err)
		return err
	}
	fmt.Printf("result %+v\n", result)

	return nil
}
