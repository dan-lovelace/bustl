package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
)

type createProjectInput struct {
	Name string `json:"name"`
}

type createInput struct {
	Input createProjectInput `json:"input"`
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

	// validate name
	trimmedName := strings.TrimSpace(eventArgs.Input.Name)
	if len(trimmedName) < 1 {
		return types.LambdaResponse{StatusCode: 400, Error: "Requires name"}
	}

	// initialize insert
	insert := psql.Insert("project")
	insert = insert.Columns("name", "app_user_id", "sort_position")

	// insert values
	insert = insert.Values(
		// trimmed and validated name
		trimmedName,

		// apply to current user
		squirrel.Expr("(SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username),

		// get next highest sort position number
		squirrel.Expr("COALESCE((SELECT MAX(sort_position) FROM project WHERE app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)) + 1, 1)", event.Context.Identity.Username),
	)

	// returning
	returning := []string{
		"id",
		"created_at",
		"updated_at",
		"name",
		"sort_position",
	}
	insert = insert.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))

	// sql and args
	insertSql, insertArgs, err := insert.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	fmt.Println("insertSql", insertSql)
	fmt.Println("insertArgs", insertArgs)

	// execute query
	rows, qErr := dbq.Query(ctx, insertSql, insertArgs...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}
	defer rows.Close()

	// check for zero case
	if rows.Next() == false {
		return types.LambdaResponse{StatusCode: 500, Error: "Create failed"}
	}

	// scan return values into destinations
	var id int
	var createdAt time.Time
	var updatedAt time.Time
	var name string
	var sortPosition *int
	sErr := rows.Scan(&id, &createdAt, &updatedAt, &name, &sortPosition)
	if sErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
	}

	// release previous connection to reuse it
	rows.Close()

	// create default note_type
	noteTypeQuery := psql.Insert("note_type")
	noteTypeQuery = noteTypeQuery.Columns("project_id", "name", "sort_position")
	noteTypeQuery = noteTypeQuery.Values(id, "Default List", 1)
	noteTypeQuery = noteTypeQuery.Suffix("RETURNING id")

	noteTypeSql, noteTypeArgs, err := noteTypeQuery.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	var noteTypeId int
	nErr := dbq.QueryRow(ctx, noteTypeSql, noteTypeArgs...).Scan(&noteTypeId)
	if nErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: nErr.Error()}
	} else if noteTypeId == 0 {
		return types.LambdaResponse{StatusCode: 500, Error: "Failed to create default note type"}
	}

	// construct output
	output := types.ProjectGQLOutput{
		Id:           id,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
		Name:         name,
		SortPosition: sortPosition,
	}
	fmt.Printf("output %+v\n", output)
	// convert first row to json and return
	body, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}
}
