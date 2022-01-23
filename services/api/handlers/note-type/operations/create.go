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
	"project-oakwood/services/toolbox/gql"
)

type createNoteTypeInput struct {
	ProjectId string `json:"project_id"`
	Name      string `json:"name"`
}

type createInput struct {
	Input createNoteTypeInput `json:"input"`
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

	// validate project id
	pErr := gql.ValidateProjectId(ctx, dbq, eventArgs.Input.ProjectId, event.Context.Identity)
	if pErr != nil {
		return types.LambdaResponse{StatusCode: 400, Error: pErr.Error()}
	}

	insert := psql.Insert("note_type")
	insert = insert.Columns("project_id", "name", "sort_position")

	insert = insert.Values(
		// validated project_id
		eventArgs.Input.ProjectId,

		// trimmed and validated name
		trimmedName,

		// get next highest sort position number for the associated project
		squirrel.Expr(`COALESCE((SELECT MAX(sort_position) FROM note_type WHERE project_id = ?) + 1, 1)`, eventArgs.Input.ProjectId),
	)

	// returning
	returning := []string{
		"id",
		"created_at",
		"updated_at",
		"project_id",
		"name",
		"sort_position",
	}
	insert = insert.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))

	// sql and args
	insertSql, insertArgs, err := insert.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

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
	var projectId int
	var name string
	var sortPosition *int
	sErr := rows.Scan(&id, &createdAt, &updatedAt, &projectId, &name, &sortPosition)
	if sErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
	}

	// construct output
	output := types.NoteTypeGQLOutput{
		Id:           id,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
		ProjectId:    projectId,
		Name:         name,
		SortPosition: sortPosition,
	}

	// convert first row to json and return
	outputJson, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(outputJson),
	}
}
