package operations

import (
	"context"
	"encoding/json"
	"fmt"
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
	// convert gql args to input type
	var eventArgs deleteInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)

	// validate ids
	vQuery := psql.Select("project.id").From("project")
	vQuery = vQuery.InnerJoin("app_user ON app_user_id = app_user.id")
	vQuery = vQuery.Where(squirrel.Eq{"project.id": eventArgs.Ids})
	vQuery = vQuery.Where("app_user.cognito_id = ?", event.Context.Identity.Username)
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

	// count := vRows.CommandTag().RowsAffected()
	// fmt.Println("count", count)
	// if int(count) != len(eventArgs.Ids) {
	// 	return types.LambdaResponse{StatusCode: 400, Error: "One or more invalid project id(s)"}
	// }

	var dbIds []int
	for vRows.Next() {
		var validProjectId int
		err := vRows.Scan(&validProjectId)
		if err != nil {
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}
		dbIds = append(dbIds, validProjectId)
	}

	// return error if db query rows don't match received ids
	if len(dbIds) != len(eventArgs.Ids) {
		return types.LambdaResponse{StatusCode: 500, Error: "One or more invalid project id(s)"}
	}

	// close vRows to continue using the connection
	vRows.Close()

	// begin transaction to update projects and any associated note_types and notes
	trx, err := dbq.Begin(ctx)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	defer trx.Rollback(ctx)

	// construct project query
	pUpdate := psql.Update("project")
	pUpdate = pUpdate.Set("active", false)
	pUpdate = pUpdate.Where(squirrel.Eq{"id": eventArgs.Ids})

	pSql, pArgs, pSqlErr := pUpdate.ToSql()
	if pSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: pSqlErr.Error()}
	}

	// add project query to transaction
	pRows, pErr := trx.Exec(ctx, pSql, pArgs...)
	if pErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: pErr.Error()}
	}
	fmt.Printf("pRows %+v\n", pRows)

	// construct note_type query
	ntUpdate := psql.Update("note_type")
	ntUpdate = ntUpdate.Set("active", false)
	ntUpdate = ntUpdate.Where(squirrel.Eq{"project_id": eventArgs.Ids})
	ntUpdate = ntUpdate.Where("active = true")

	ntSql, ntArgs, ntSqlErr := ntUpdate.ToSql()
	if ntSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: ntSqlErr.Error()}
	}
	fmt.Println("nSql", ntSql)
	fmt.Println("nArgs", ntArgs)

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

	// manually build placeholders and args to use for project_id query
	var nPlaceholders []string
	var nArguments []interface{}
	for _, v := range eventArgs.Ids {
		nPlaceholders = append(nPlaceholders, "?")
		nArguments = append(nArguments, v)
	}

	nWhere := fmt.Sprintf("note_type_id IN (SELECT id FROM note_type WHERE project_id IN (%s))", strings.Join(nPlaceholders, ","))
	nUpdate = nUpdate.Where(nWhere, nArguments...)
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

	// // get number of affected rows and compare against input
	// aff := pRows.RowsAffected()
	// var outputs []int
	// if int(aff) == len(eventArgs.Ids) {
	// 	// number of affected rows match input, build list for output
	// 	for _, v := range eventArgs.Ids {
	// 		vInt, err := strconv.Atoi(v)
	// 		if err != nil {
	// 			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	// 		}

	// 		outputs = append(outputs, vInt)
	// 	}
	// }
	fmt.Println("dbIds", dbIds)
	// convert output to json and return
	body, err := json.Marshal(dbIds)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	fmt.Println("body string", string(body))
	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}
}
