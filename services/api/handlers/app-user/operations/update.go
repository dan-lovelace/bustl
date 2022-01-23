package operations

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
)

type updateAppUserInput struct {
	Email *string `json:"email,omitempty"`
}

type updateInput struct {
	Id    string             `json:"id"`
	Input updateAppUserInput `json:"input"`
}

func Update(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs updateInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string("null"),
	}
}
