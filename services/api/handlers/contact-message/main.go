package main

import (
	"context"

	"github.com/aws/aws-lambda-go/lambda"

	ops "project-oakwood/services/api/handlers/contact-message/operations"
	"project-oakwood/services/api/types"
	"project-oakwood/services/storage/db"
)

func Handler(ctx context.Context, events []types.LambdaEvent) ([]types.LambdaResponse, error) {
	responses := make([]types.LambdaResponse, len(events))

	// create the db connection here so it can be reused for all events
	dbConn, err := db.GetAppUserConnection(ctx)
	if err != nil {
		return nil, err
	}
	defer dbConn.Close(ctx)

	for key, event := range events {
		switch event.Operation {
		case "create":
			responses[key] = ops.Create(ctx, event, dbConn)
		default:
			responses[key] = types.LambdaResponse{StatusCode: 400, Error: "Invalid operation"}
		}
	}

	return responses, nil
}

func main() {
	lambda.Start(Handler)
}
