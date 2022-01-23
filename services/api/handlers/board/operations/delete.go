package operations

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
)

type deleteInput struct {
	Ids     []string `json:"ids"`
	Archive bool     `json:"archive"`
}

func Delete(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs deleteInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)

	// create a new postgres update query
	query := psql.Update("board")

	// always send to user's trash
	query = query.Set("archived", true)

	if eventArgs.Archive == false {
		// also remove from user's view completely
		query = query.Set("active", false)
	}

	// where statements
	query = query.Where(squirrel.Eq{"active": true})
	query = query.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
	query = query.Where(squirrel.Eq{"id": eventArgs.Ids})

	// returning
	query = query.Suffix("RETURNING id")

	// construct statement
	sql, args, err := query.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// execute query
	rows, qErr := dbq.Query(ctx, sql, args...)
	if qErr != nil {
		fmt.Printf("qErr %+v\n", qErr)
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}
	defer rows.Close()

	// iterate over rows to build output from RETURNING statement
	var outputs []int
	for rows.Next() {
		var id int

		sErr := rows.Scan(&id)
		if sErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
		}
		outputs = append(outputs, id)
	}

	// convert output to json and return
	outputJson, err := json.Marshal(outputs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(outputJson),
	}
}
