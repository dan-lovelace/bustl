package toolbox

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
)

func SendSQSMessage(queue string, body string) error {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return err
	}

	svc := sqs.New(sess)
	input := sqs.SendMessageInput{
		QueueUrl:    aws.String(queue),
		MessageBody: aws.String(body),
	}
	result, err := svc.SendMessage(&input)
	if err != nil {
		fmt.Println("err", err)
		return err
	}
	fmt.Printf("result %+v\n", result)

	return nil
}
