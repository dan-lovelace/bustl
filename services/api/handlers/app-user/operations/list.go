package operations

import (
	"context"
	"encoding/json"
	"project-oakwood/services/api/types"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
)

func List(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// construct query
	selects := []string{
		"id",
		"created_at",
		"updated_at",
		"active",
		"username",
		"cognito_id",
	}
	query := psql.Select(selects...).From("app_user")

	// convert to sql
	sql, _, err := query.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// execute query
	var rows []types.AppUser
	qErr := pgxscan.Select(ctx, dbq, &rows, sql)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}

	// check for zero case
	if len(rows) == 0 {
		return types.LambdaResponse{StatusCode: 200, Data: "null"}
	}

	// convert to json and return
	body, err := json.Marshal(rows)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}
}
