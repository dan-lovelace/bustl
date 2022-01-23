package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
)

type listOneInput struct {
	Id string `json:"id"`
}

type listOneOutput struct {
	Id        int32     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Name         string `json:"name"`
	SortPosition int    `json:"sort_position,omitempty"`
}

func ListOne(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs listOneInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	if eventArgs.Id == "" {
		return types.LambdaResponse{StatusCode: 200, Data: "Requires id"}
	}

	// initialize query
	query := psql.Select("project.*").From("project")
	query = query.InnerJoin("app_user ON app_user_id = app_user.id")
	query = query.Where("project.id = ?", eventArgs.Id)
	query = query.Where("app_user.cognito_id = ?", event.Context.Identity.Username)
	query = query.Where("project.active = true")

	// convert query to SQL and get argument list for parameterization
	sql, args, err := query.ToSql()
	fmt.Println("sql", sql)
	fmt.Println("args", args)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// query db using statement and arguments
	var rows []types.Project
	qErr := pgxscan.Select(ctx, dbq, &rows, sql, args...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// check for zero case
	if len(rows) == 0 {
		return types.LambdaResponse{StatusCode: 200, Data: "null"}
	}

	// convert first row to json and return
	rJson, err := json.Marshal(rows[0])
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// populate shared db fields
	var output listOneOutput
	json.Unmarshal(rJson, &output)

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
