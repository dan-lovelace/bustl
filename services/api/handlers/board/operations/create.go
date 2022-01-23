package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox/gql"
	"project-oakwood/services/toolbox/subscription"
)

type createBoardInput struct {
	ImageId string `json:"image_id"`
}

type createInput struct {
	Input createBoardInput `json:"input"`
}

func Create(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	fmt.Printf("create event: %+v\n", event)
	var eventArgs createInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)

	// validate image_id
	vErr := gql.ValidateImageId(ctx, dbq, eventArgs.Input.ImageId, event.Context.Identity)
	if vErr != nil {
		return types.LambdaResponse{StatusCode: 400, Error: vErr.Error()}
	}

	// get plan and usage to throttle creates
	plan := subscription.GetPlanData("free") // TODO: get plan from db
	usage := subscription.GetUsageData(ctx, dbq, psql, event.Context.Identity.Username, plan)

	// monthly rate limit
	// monthlyCreated, err := strconv.Atoi(usage.BoardCreateMonthly.Current)
	// if err != nil {
	// 	return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	// }

	// monthlyFlag := usage.BoardCreateMonthly.Flag
	// monthlyAllowed, err := strconv.Atoi(monthlyFlag.Value)
	// if err != nil {
	// 	return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	// }

	// if monthlyCreated >= monthlyAllowed {
	// 	return types.LambdaResponse{StatusCode: 400, Error: monthlyFlag.ExceedText}
	// }

	// total active limit
	totalActive, err := strconv.Atoi(usage.BoardCreateTotalActive.Current)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	totalFlag := usage.BoardCreateTotalActive.Flag
	totalAllowed, err := strconv.Atoi(totalFlag.Value)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	if totalActive >= totalAllowed {
		return types.LambdaResponse{StatusCode: 400, Error: totalFlag.ExceedText}
	}

	// construct sql and args
	sql := `INSERT INTO board (image_id, app_user_id)
			VALUES ($1, (SELECT id FROM app_user WHERE cognito_id = $2))
			RETURNING id, created_at, updated_at, active, image_id, app_user_id;`
	var args = []interface{}{eventArgs.Input.ImageId, event.Context.Identity.Username}

	// execute query
	var rows []types.Board
	qErr := pgxscan.Select(ctx, dbq, &rows, sql, args...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 400, Error: qErr.Error()}
	}
	log.Println("rows", rows)

	// check for zero case
	if len(rows) == 0 {
		return types.LambdaResponse{StatusCode: 500, Error: "Create failed"}
	}

	// create subscription event
	eSql := `INSERT INTO subscription_event (event_type, board_id, app_user_id)
			 VALUES ('board_create', $1, (SELECT id FROM app_user WHERE cognito_id = $2))
			 RETURNING id;`
	eArgs := []interface{}{rows[0].Id, event.Context.Identity.Username}
	var eventId int
	eErr := dbq.QueryRow(ctx, eSql, eArgs...).Scan(&eventId)
	if eErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: eErr.Error()}
	}
	fmt.Printf("eventId %+v\n", eventId)

	// convert first row to json and return
	body, err := json.Marshal(rows[0])
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}
}
