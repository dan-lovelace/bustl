package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox/gql"
)

type createNoteInput struct {
	NoteTypeId string `json:"note_type_id"`
	Title      string `json:"title"`
	Body       string `json:"body"`
}

type createInput struct {
	Input createNoteInput `json:"input"`
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

	// requires title
	trimmedTitle := strings.TrimSpace(eventArgs.Input.Title)
	if len(trimmedTitle) < 1 {
		return types.LambdaResponse{StatusCode: 400, Error: "Requires title"}
	}

	// requires note_type_id
	if eventArgs.Input.NoteTypeId == "" {
		return types.LambdaResponse{StatusCode: 400, Error: "Requires note_type_id"}
	}

	// validate note_type_id
	pErr := gql.ValidateNoteTypeId(ctx, dbq, eventArgs.Input.NoteTypeId, event.Context.Identity)
	if pErr != nil {
		return types.LambdaResponse{StatusCode: 400, Error: pErr.Error()}
	}

	// convert note_type id to int
	noteTypeIdInt, err := strconv.Atoi(eventArgs.Input.NoteTypeId)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// construct sql and args
	noteQuery := psql.Insert("note")
	noteQuery = noteQuery.Columns("note_type_id", "title", "body", "sort_position")
	noteQuery = noteQuery.Values(
		// validated note_type_id
		eventArgs.Input.NoteTypeId,

		// trimmed and validated title
		eventArgs.Input.Title,

		// description
		eventArgs.Input.Body,

		// get next highest sort position number for the associated note_type
		squirrel.Expr(`COALESCE((SELECT MAX(sort_position) FROM note WHERE note_type_id = ?) + 1, 1)`, noteTypeIdInt),
	)

	// returning
	returning := []string{
		"id",
		"created_at",
		"updated_at",
		"note_type_id",
		"title",
		"archived",
		"body",
		"sort_position",
	}
	noteQuery = noteQuery.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))

	// sql and args
	noteSql, noteArgs, err := noteQuery.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// execute query
	rows, qErr := dbq.Query(ctx, noteSql, noteArgs...)
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
	var noteTypeId int
	var title string
	var archived bool
	var body *string
	var sortPosition *int
	sErr := rows.Scan(&id, &createdAt, &updatedAt, &noteTypeId, &title, &archived, &body, &sortPosition)
	if sErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
	}

	// construct output
	output := types.NoteGQLOutput{
		Id:           id,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
		NoteTypeId:   noteTypeId,
		Title:        title,
		Archived:     archived,
		Body:         body,
		SortPosition: sortPosition,
	}

	// convert to output and return
	outputJson, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(outputJson),
	}
}
