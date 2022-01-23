package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
)

type listOneInput struct {
	Id string `json:"id"`
}

type listOneOutput struct {
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	NoteTypeId int    `json:"note_type_id"`
	Title      string `json:"title"`
	Archived   bool   `json:"archived"`

	Body         *string `json:"body,omitempty"`
	SortPosition *int    `json:"sort_position,omitempty"`
}

func ListOne(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs listOneInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	if eventArgs.Id == "" {
		return types.LambdaResponse{StatusCode: 200, Data: "null"}
	}

	// initialize query
	query := psql.Select("note.*").From("note")
	query = query.InnerJoin("note_type ON note_type_id = note_type.id")
	query = query.InnerJoin("project ON note_type.project_id = project.id")
	query = query.Where("note.id = ?", eventArgs.Id)
	query = query.Where("project.app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
	query = query.Where("note.active = true")
	query = query.Where("note_type.active = true")
	query = query.Where("project.active = true")

	// convert query to SQL and get argument list for parameterization
	sql, args, err := query.ToSql()
	fmt.Println("sql", sql)
	fmt.Println("args", args)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// query db using statement and arguments
	var rows []types.Note
	qErr := pgxscan.Select(ctx, dbq, &rows, sql, args...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}

	// check for zero case
	if len(rows) == 0 {
		return types.LambdaResponse{StatusCode: 200, Data: "null"}
	}

	// convert first row to json and return
	rJson, err := json.Marshal(rows[0])
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// populate shared db fields
	var output listOneOutput
	json.Unmarshal(rJson, &output)

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
