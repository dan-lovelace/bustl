package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"project-oakwood/services/api/types"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
)

type queryFilter struct {
	Archived bool `json:"archived"`
}

type listInput struct {
	Filter queryFilter `json:"filter"`
}

type listOutput struct {
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Active    bool      `json:"active"`

	AppUserId int  `json:"app_user_id"`
	Archived  bool `json:"archived"`
	ImageId   int  `json:"image_id"`
}

func List(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	var eventArgs listInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	// construct query
	selects := []string{
		"id",
		"created_at",
		"updated_at",
		"active",
		"app_user_id",
		"image_id",
		"archived",
	}
	query := psql.Select(selects...).From("board").OrderBy("created_at DESC")

	// filter by active only
	query = query.Where("active = true")

	// count arguments
	argCount := 0

	// apply gql filter if it exists
	// if eventArgs.Filter.Archived == true {
	// 	query = query.Where("archived = true")
	// } else {
	// 	query = query.Where("archived = false")
	// }

	// filter results by the current user
	cognitoId := event.Context.Identity.Username
	userWhere := fmt.Sprintf("app_user_id = (SELECT id FROM app_user WHERE cognito_id = $%d)", argCount+1)
	query = query.Where(userWhere, cognitoId)
	argCount += 1

	// get sql statement and its args
	sql, args, err := query.ToSql()
	fmt.Println("sql", sql)
	fmt.Println("args", args)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// query db
	var rows []types.Board
	qErr := pgxscan.Select(ctx, dbq, &rows, sql, args...)
	if qErr != nil {
		fmt.Println("qErr", qErr)
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// check for zero case
	if len(rows) == 0 {
		return types.LambdaResponse{StatusCode: 200, Data: "null"}
	}

	// convert rows to json
	rJson, err := json.Marshal(rows)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// populate output with shared db fields
	var output []listOutput
	err = json.Unmarshal(rJson, &output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// convert output to json and return
	body, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}
}
