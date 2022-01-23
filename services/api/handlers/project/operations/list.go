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

type listOutput struct {
	Id        int32     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Active    bool      `json:"active"`

	Name         string `json:"name"`
	SortPosition int    `json:"sort_position,omitempty"`
}

func List(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// construct query
	selects := []string{
		"id",
		"created_at",
		"updated_at",
		"active",
		"app_user_id",
		"name",
		"sort_position",
	}
	query := psql.Select(selects...).From("project")

	// filter inactive
	query = query.Where("active = true")

	// filter by current user
	query = query.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)

	// order by sort position
	query = query.OrderBy("sort_position")

	// get sql statement and its args
	sql, args, err := query.ToSql()
	fmt.Println("sql", sql)
	fmt.Println("args", args)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// query db
	var rows []types.Project
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
