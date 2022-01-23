package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"

	ops "project-oakwood/services/api/handlers/subscription/operations"
	"project-oakwood/services/api/types"
	"project-oakwood/services/storage/db"
)

func Handler(ctx context.Context, rawEvents []interface{}) ([]types.LambdaResponse, error) {
	fmt.Printf("rawEvents %+v\n", rawEvents)

	eventsJson, err := json.Marshal(rawEvents)
	if err != nil {
		return []types.LambdaResponse{}, errors.New("Broke")
	}

	var events []types.LambdaEvent
	json.Unmarshal(eventsJson, &events)

	responses := make([]types.LambdaResponse, len(events))

	// create the db connection here so it can be reused for all events
	dbConn, err := db.GetAppUserConnection(ctx)
	if err != nil {
		return nil, err
	}
	defer dbConn.Close(ctx)

	for key, event := range events {
		fmt.Printf("event %+v\n", event)
		switch event.Operation {
		// case "listPlans":
		// 	responses[key] = ops.ListPlans(ctx, event)
		case "listOne":
			responses[key] = ops.ListOne(ctx, event, dbConn)
		default:
			responses[key] = types.LambdaResponse{StatusCode: 400, Error: "Invalid operation"}
		}
	}

	return responses, nil
}

func main() {
	lambda.Start(Handler)
}
