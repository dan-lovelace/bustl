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

type createCalendarEventInput struct {
	Title        string    `json:"title"`
	StartTime    time.Time `json:"start_time"`
	CalendarType string    `json:"calendar_type"`
	EndTime      time.Time `json:"end_time"`
	AllDay       bool      `json:"all_day"`
	Description  string    `json:"description"`
}

type createInput struct {
	Input createCalendarEventInput `json:"input"`
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

	// construct sql and args
	calendarEventQuery := psql.Insert("calendar_event")
	calendarEventQuery = calendarEventQuery.Columns("app_user_id", "title", "start_time", "calendar_type", "end_time", "all_day", "description")
	calendarEventQuery = calendarEventQuery.Values(
		// user id
		squirrel.Expr("(SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username),

		// trimmed and validated title
		eventArgs.Input.Title,

		// everything else
		eventArgs.Input.StartTime.Format(time.RFC3339),
		eventArgs.Input.CalendarType,
		eventArgs.Input.EndTime.Format(time.RFC3339),
		eventArgs.Input.AllDay,
		eventArgs.Input.Description,
	)

	// returning
	returning := []string{
		"id",
		"created_at",
		"updated_at",
		"title",
		"archived",
		"start_time",
		"calendar_type",
		"end_time",
		"all_day",
		"description",
	}
	calendarEventQuery = calendarEventQuery.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))

	// sql and args
	calendarEventSql, calendarEventArgs, err := calendarEventQuery.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	fmt.Println("sql", calendarEventSql)
	fmt.Println("args", calendarEventArgs)

	// execute query
	rows, qErr := dbq.Query(ctx, calendarEventSql, calendarEventArgs...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}
	defer rows.Close()
	// check for zero case
	fmt.Println("rows", rows)
	fmt.Printf("rows value %+v\n", rows)
	if rows.Next() == false {
		fmt.Println("rows after", rows)
		fmt.Printf("rows after value %+v\n", rows)
		return types.LambdaResponse{StatusCode: 500, Error: "Create failed"}
	}

	// scan return values into destinations
	var id int
	var createdAt time.Time
	var updatedAt time.Time
	var title string
	var archived bool
	var startTime time.Time
	var calendarType string
	var endTime *time.Time
	var allDay *bool
	var description *string
	sErr := rows.Scan(&id, &createdAt, &updatedAt, &title, &archived, &startTime, &calendarType, &endTime, &allDay, &description)
	if sErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
	}

	// construct output
	output := types.CalendarEventGQLOutput{
		Id:           id,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
		Title:        title,
		Archived:     archived,
		StartTime:    startTime,
		CalendarType: calendarType,
		EndTime:      endTime,
		AllDay:       allDay,
		Description:  description,
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
