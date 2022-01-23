package operations

import (
	"context"
	"encoding/json"
	"fmt"

	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox/subscription"

	"github.com/jackc/pgx/v4"
)

type listOneInput struct {
	CognitoId string `json:"cognito_id"`
}

type listOneOutput struct {
	Status string                  `json:"status"`
	Plan   types.SubscriptionPlan  `json:"plan"`
	Usage  types.SubscriptionUsage `json:"usage"`
}

// ListOne fetches subscription data given any `cognito_id`. There is no direct query available
// to it and therefore should not be filtered by the current user. This filtering occurs further
// upstream by one of the root query handlers.
func ListOne(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	fmt.Printf("ListOne event %+v\n", event)
	// convert graphql arguments to input type
	var eventArgs listOneInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	// TODO: get these from db later
	status := "incomplete"
	plan := "free"

	// get plan and usage data
	planData := subscription.GetPlanData(plan)
	usageData := subscription.GetUsageData(ctx, dbq, pq, eventArgs.CognitoId, planData)

	// convert output to json and return
	var output = listOneOutput{
		Status: status,
		Plan:   planData,
		Usage:  usageData,
	}
	fmt.Printf("output %+v\n", output)
	body, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}

}
