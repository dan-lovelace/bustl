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
	vQuery := psql.Select("note.id").From("note")
	vQuery = vQuery.InnerJoin("note_type ON note_type_id = note_type.id")
	vQuery = vQuery.InnerJoin("project ON project_id = project.id")
	vQuery = vQuery.Where(squirrel.Eq{"note.id": eventArgs.Ids})
	vQuery = vQuery.Where("project.app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
	vQuery = vQuery.Where("note.active = true")
	vQuery = vQuery.Where("note_type.active = true")
	vQuery = vQuery.Where("project.active = true")

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
		var validNoteId int
		err := vRows.Scan(&validNoteId)
		if err != nil {
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}

		validIds = append(validIds, validNoteId)
	}

	// return error if db query rows don't match received ids
	if len(validIds) != len(eventArgs.Ids) {
		return types.LambdaResponse{StatusCode: 500, Error: "One or more invalid note id(s)"}
	}

	// close vRows to continue using the connection
	vRows.Close()

	// initialize note update statement
	nUpdate := psql.Update("note")

	// deactivate
	nUpdate = nUpdate.Set("active", false)

	// where id is in event arg ids. there ids were validated previously.
	nUpdate = nUpdate.Where(squirrel.Eq{"id": eventArgs.Ids})

	// returning
	nUpdate = nUpdate.Suffix("RETURNING id")

	// sql and args
	nSql, nArgs, nSqlErr := nUpdate.ToSql()
	if nSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: nSqlErr.Error()}
	}
	fmt.Println("nSql", nSql)
	fmt.Println("nArgs", nArgs)

	// execute update
	nRows, nErr := dbq.Query(ctx, nSql, nArgs...)
	if nErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: nErr.Error()}
	}
	fmt.Printf("nRows %+v\n", nRows)

	// construct array of affected row ids for output
	var outputs []int
	for nRows.Next() {
		var noteId int
		sErr := nRows.Scan(&noteId)
		if sErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
		}
		outputs = append(outputs, noteId)
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
