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
	BoardId string `json:"board_id"`
}

type listOutput struct {
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Active    bool      `json:"active"`

	XPosition  int    `json:"x_position"`
	YPosition  int    `json:"y_position"`
	MarkerType string `json:"marker_type"`
	Hidden     bool   `json:"hidden"`

	NoteId          *int `json:"note_id,omitempty"`
	CalendarEventId *int `json:"calendar_event_id,omitempty"`
	SortPosition    *int `json:"sort_position,omitempty"`
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

	if eventArgs.BoardId == "" {
		return types.LambdaResponse{StatusCode: 400, Error: "Requires board_id"}
	}

	// construct query
	query := psql.Select("board_marker.*").From("board_marker")
	query = query.InnerJoin("board ON board_id = board.id")
	query = query.Where("board.id = ?", eventArgs.BoardId)
	query = query.Where("board.app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
	query = query.Where("board.active = true")
	query = query.Where("board_marker.active = true")

	// list newest markers first
	query = query.OrderBy("board_marker.created_at DESC")

	// get sql statement and its args
	sql, args, err := query.ToSql()
	fmt.Println("sql", sql)
	fmt.Println("args", args)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// query db
	var rows []types.BoardMarker
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
	fmt.Printf("output %+v\n", output)
	// convert output to json and return
	body, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	bodyString := string(body)
	fmt.Println("bodyString", bodyString)
	return types.LambdaResponse{
		StatusCode: 200,
		Data:       bodyString,
	}
}
