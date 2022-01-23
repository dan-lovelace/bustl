package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
)

type createBoardMarkerInput struct {
	BoardId    string `json:"board_id"`
	XPosition  int    `json:"x_position"`
	YPosition  int    `json:"y_position"`
	MarkerType string `json:"marker_type"`
	Hidden     bool   `json:"hidden"`

	NoteId          *string `json:"note_id"`
	CalendarEventId *string `json:"calendar_event_id"`
}

type createInput struct {
	Input createBoardMarkerInput `json:"input"`
}

type createOutput struct {
	Id         int       `json:"id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	BoardId    int       `json:"board_id"`
	XPosition  int       `json:"x_position"`
	YPosition  int       `json:"y_position"`
	MarkerType string    `json:"marker_type"`
	Hidden     bool      `json:"hidden"`

	NoteId          *int `json:"note_id,omitempty"`
	CalendarEventId *int `json:"calendar_event_id,omitempty"`
	SortPosition    *int `json:"sort_position,omitempty"`
}

func Create(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert input to eventArgs
	var eventArgs createInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	// validate board_id
	if eventArgs.Input.BoardId == "" {
		return types.LambdaResponse{StatusCode: 400, Error: "Requires board_id"}
	}
	boardQuery := psql.Select("board.id").From("board")
	boardQuery = boardQuery.InnerJoin("app_user ON app_user_id = app_user.id")
	boardQuery = boardQuery.Where("board.id = ?", eventArgs.Input.BoardId)
	boardQuery = boardQuery.Where("app_user.cognito_id = ?", event.Context.Identity.Username)
	boardQuery = boardQuery.Where("board.active = true")

	boardSql, boardArgs, err := boardQuery.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	var validBoardId int
	bErr := dbq.QueryRow(ctx, boardSql, boardArgs...).Scan(&validBoardId)
	if bErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: "Invalid board_id"}
	}

	// validate note_id if it exists
	if eventArgs.Input.NoteId != nil {
		fmt.Println("checking note id")
		noteQuery := psql.Select("note.id").From("note")
		noteQuery = noteQuery.InnerJoin("note_type on note.note_type_id = note_type.id")
		noteQuery = noteQuery.InnerJoin("project ON note_type.project_id = project.id")
		noteQuery = noteQuery.Where("note.id = ?", eventArgs.Input.NoteId)
		noteQuery = noteQuery.Where("project.app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
		noteQuery = noteQuery.Where("note.active = true")
		noteQuery = noteQuery.Where("note_type.active = true")
		noteQuery = noteQuery.Where("project.active = true")

		noteSql, noteArgs, err := noteQuery.ToSql()
		if err != nil {
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}
		fmt.Println("noteSql", noteSql)
		fmt.Println("noteArgs", noteArgs)
		var validNoteId int
		nErr := dbq.QueryRow(ctx, noteSql, noteArgs...).Scan(&validNoteId)
		if nErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: "Invalid note_id"}
		}
		fmt.Println("validNoteId", validNoteId)
	}

	// construct sql and args
	boardMarkerQuery := psql.Insert("board_marker")
	boardMarkerQuery = boardMarkerQuery.Columns("board_id", "x_position", "y_position", "marker_type", "note_id", "calendar_event_id", "hidden")
	boardMarkerQuery = boardMarkerQuery.Values(
		eventArgs.Input.BoardId,
		eventArgs.Input.XPosition,
		eventArgs.Input.YPosition,
		eventArgs.Input.MarkerType,
		eventArgs.Input.NoteId,
		eventArgs.Input.CalendarEventId,
		eventArgs.Input.Hidden,
	)

	// returning
	returning := []string{
		"id",
		"created_at",
		"updated_at",
		"board_id",
		"x_position",
		"y_position",
		"marker_type",
		"hidden",
		"note_id",
		"calendar_event_id",
		"sort_position",
	}
	boardMarkerQuery = boardMarkerQuery.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))

	// sql and args
	boardMarkerSql, boardMarkerArgs, err := boardMarkerQuery.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// execute query
	rows, qErr := dbq.Query(ctx, boardMarkerSql, boardMarkerArgs...)
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
	var boardId int
	var xPosition int
	var yPosition int
	var markerType string
	var hidden bool
	var noteId *int
	var calendarEventId *int
	var sortPosition *int
	sErr := rows.Scan(&id, &createdAt, &updatedAt, &boardId, &xPosition, &yPosition, &markerType, &hidden, &noteId, &calendarEventId, &sortPosition)
	if sErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
	}

	// construct output
	output := createOutput{
		Id:              id,
		CreatedAt:       createdAt,
		UpdatedAt:       updatedAt,
		BoardId:         boardId,
		XPosition:       xPosition,
		YPosition:       yPosition,
		MarkerType:      markerType,
		Hidden:          hidden,
		NoteId:          noteId,
		CalendarEventId: calendarEventId,
		SortPosition:    sortPosition,
	}

	// convert to json and return
	body, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	fmt.Printf("output %+v\n", output)
	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}
}
