package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(event events.CognitoEventUserPoolsPreTokenGen) (events.CognitoEventUserPoolsPreTokenGen, error) {
	fmt.Printf("PreSignup of user: %s\n", event.UserName)
	fmt.Printf("event %+v\n", event)

	// event.Response.ClaimsOverrideDetails = events.ClaimsOverrideDetails{
	// 	GroupOverrideDetails: events.GroupConfiguration{
	// 		GroupsToOverride: []string{"system-user"},
	// 	},
	// }

	return event, nil
}

func main() {
	lambda.Start(handler)
}
