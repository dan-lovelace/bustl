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
	Ids []string `json:"ids"`
}

type deleteOutput struct {
	Id int `json:"id"`
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
	fmt.Printf("eventArgs %+v\n", eventArgs)

	// validate ids
	vQuery := psql.Select("id").From("calendar_event")
	vQuery = vQuery.Where(squirrel.Eq{"id": eventArgs.Ids})
	vQuery = vQuery.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
	vQuery = vQuery.Where("active = true")

	vQuerySql, vQueryArgs, vSqlErr := vQuery.ToSql()
	if vSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: vSqlErr.Error()}
	}
	fmt.Println("vQuerySql", vQuerySql)
	fmt.Println("vQueryArgs", vQueryArgs)
	vRows, vErr := dbq.Query(ctx, vQuerySql, vQueryArgs...)
	if vErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: vErr.Error()}
	}
	defer vRows.Close()

	var validIds []int
	for vRows.Next() {
		var validId int
		err := vRows.Scan(&validId)
		if err != nil {
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}

		validIds = append(validIds, validId)
	}

	// return error if db query rows don't match received ids
	if len(validIds) != len(eventArgs.Ids) {
		return types.LambdaResponse{StatusCode: 500, Error: "One or more invalid calendar event id(s)"}
	}

	// close vRows to continue using the connection
	vRows.Close()

	// initialize calendar_event update statement
	ceUpdate := psql.Update("calendar_event")

	// deactivate
	ceUpdate = ceUpdate.Set("active", false)

	// where id is in event arg ids. there ids were validated previously.
	ceUpdate = ceUpdate.Where(squirrel.Eq{"id": eventArgs.Ids})

	// returning
	ceUpdate = ceUpdate.Suffix("RETURNING id")

	// sql and args
	ceSql, ceArgs, ceSqlErr := ceUpdate.ToSql()
	if ceSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: ceSqlErr.Error()}
	}
	fmt.Println("ceSql", ceSql)
	fmt.Println("ceArgs", ceArgs)

	// execute update
	ceRows, ceErr := dbq.Query(ctx, ceSql, ceArgs...)
	if ceErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: ceErr.Error()}
	}
	fmt.Printf("ceRows %+v\n", ceRows)

	// construct array of affected row ids for output
	var outputs []int
	for ceRows.Next() {
		var calendarEventId int
		sErr := ceRows.Scan(&calendarEventId)
		if sErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
		}
		outputs = append(outputs, calendarEventId)
	}

	// convert to json and return
	outputJson, err := json.Marshal(outputs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(outputJson),
	}
}
