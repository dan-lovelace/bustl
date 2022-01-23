package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

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
	vQuery := psql.Select("note_type.id").From("note_type")
	vQuery = vQuery.InnerJoin("project ON project_id = project.id")
	vQuery = vQuery.Where(squirrel.Eq{"note_type.id": eventArgs.Ids})
	vQuery = vQuery.Where("project.app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
	vQuery = vQuery.Where("project.active = true")
	vQuery = vQuery.Where("note_type.active = true")

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

	var dbIds []int
	for vRows.Next() {
		var validNoteTypeId int
		err := vRows.Scan(&validNoteTypeId)
		if err != nil {
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}

		dbIds = append(dbIds, validNoteTypeId)
	}

	// return error if db query rows don't match received ids
	if len(dbIds) != len(eventArgs.Ids) {
		return types.LambdaResponse{StatusCode: 500, Error: "One or more invalid note type id(s)"}
	}

	// close vRows to continue using the connection
	vRows.Close()

	// construct note_type query
	ntUpdate := psql.Update("note_type")
	ntUpdate = ntUpdate.Set("active", false)
	ntUpdate = ntUpdate.Where(squirrel.Eq{"id": eventArgs.Ids})

	// returning
	returning := []string{
		"id",
		"created_at",
		"updated_at",
		"project_id",
		"name",
		"sort_position",
	}
	ntUpdate = ntUpdate.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))

	// construct statement
	ntSql, ntArgs, ntSqlErr := ntUpdate.ToSql()
	if ntSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: ntSqlErr.Error()}
	}
	fmt.Println("ntSql", ntSql)
	fmt.Println("ntArgs", ntArgs)

	// begin transaction to update note_types and any associated notes
	trx, err := dbq.Begin(ctx)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	defer trx.Rollback(ctx)

	// add note_type query to transaction
	ntRows, ntErr := trx.Exec(ctx, ntSql, ntArgs...)
	if ntErr != nil {
		fmt.Printf("ntErr %+v\n", ntErr)
		return types.LambdaResponse{StatusCode: 500, Error: ntErr.Error()}
	}
	fmt.Printf("ntRows %+v\n", ntRows)

	// construct note query
	nUpdate := psql.Update("note")
	nUpdate = nUpdate.Set("active", false)
	nUpdate = nUpdate.Where(squirrel.Eq{"note_type_id": eventArgs.Ids})
	nUpdate = nUpdate.Where("active = true")

	nSql, nArgs, nSqlErr := nUpdate.ToSql()
	if nSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: nSqlErr.Error()}
	}
	fmt.Println("nSql", nSql)
	fmt.Println("nArgs", nArgs)

	// add note query to transaction
	nRows, nErr := trx.Exec(ctx, nSql, nArgs...)
	if nErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: nErr.Error()}
	}
	fmt.Printf("nRows %+v\n", nRows)

	// commit transaction
	tErr := trx.Commit(ctx)
	if tErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: tErr.Error()}
	}

	// get number of affected rows and compare against input
	aff := ntRows.RowsAffected()
	var outputs []int
	if int(aff) == len(eventArgs.Ids) {
		// number of affected rows match input, build list for output
		for _, v := range eventArgs.Ids {
			vInt, err := strconv.Atoi(v)
			if err != nil {
				return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
			}

			outputs = append(outputs, vInt)
		}
	}

	// convert to json and return
	body, err := json.Marshal(outputs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	fmt.Println("body string", string(body))
	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}
}
