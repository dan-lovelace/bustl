package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"project-oakwood/services/api/types"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
)

type listInput struct {
	ProjectId *string `json:"project_id,omitempty"`
}

type listOutput struct {
	Id        int32     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	ProjectId    int    `json:"project_id"`
	Name         string `json:"name"`
	SortPosition int    `json:"sort_position,omitempty"`
}

func List(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	var eventArgs listInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	// initialize query
	query := psql.Select("note_type.*").From("note_type")
	query = query.InnerJoin("project ON project_id = project.id")
	query = query.Where("project.app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
	query = query.Where("note_type.active = true")
	query = query.Where("project.active = true")

	// filter by project_id if it exists
	if eventArgs.ProjectId != nil {
		query = query.Where("note_type.project_id = ?", eventArgs.ProjectId)

		// order by sort position for project-specific queries
		query = query.OrderBy("note_type.sort_position")
	}

	// get sql statement and its args
	sql, args, err := query.ToSql()
	fmt.Println("sql", sql)
	fmt.Println("args", args)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// query db
	var rows []types.NoteType
	qErr := pgxscan.Select(ctx, dbq, &rows, sql, args...)
	if qErr != nil {
		fmt.Println("qErr", qErr)
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// check for zero case
	if len(rows) == 0 {
		return types.LambdaResponse{StatusCode: 200, Data: "null"}
	}

	// convert rows to json
	rJson, err := json.Marshal(rows)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// populate output with shared db fields
	var output []listOutput
	err = json.Unmarshal(rJson, &output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

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
