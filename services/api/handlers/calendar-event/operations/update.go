package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox/gql"
)

type updateCalendarEventInput struct {
	Title        *string    `json:"title,omitempty"`
	Archived     *bool      `json:"archived,omitempty"`
	StartTime    *time.Time `json:"start_time,omitempty"`
	CalendarType *string    `json:"calendar_type,omitempty"`
	EndTime      *time.Time `json:"end_time,omitempty"`
	AllDay       *bool      `json:"all_day,omitempty"`
	Description  *string    `json:"description,omitempty"`
}

type updateInput struct {
	Id    string                   `json:"id"`
	Input updateCalendarEventInput `json:"input"`
}

func Update(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs updateInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	// make sure at least one update field is provided
	if eventArgs.Input.Title == nil && eventArgs.Input.Archived == nil && eventArgs.Input.StartTime == nil && eventArgs.Input.CalendarType == nil && eventArgs.Input.EndTime == nil && eventArgs.Input.AllDay == nil && eventArgs.Input.Description == nil {
		return types.LambdaResponse{StatusCode: 400, Error: "At least one update field is required"}
	}

	// convert id to int
	calendarEventId, err := strconv.Atoi(eventArgs.Id)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// validate update id
	tErr := gql.ValidateCalendarEventId(ctx, dbq, calendarEventId, event.Context.Identity)
	if tErr != nil {
		return types.LambdaResponse{StatusCode: 400, Error: tErr.Error()}
	}

	// initialize update transaction
	// TODO: this doesn't need to be a transaction
	trx, err := dbq.Begin(ctx)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	defer trx.Rollback(ctx)

	// initialize update query
	ceQuery := psql.Update("calendar_event")

	// where statements
	ceQuery = ceQuery.Where("id = ?", eventArgs.Id)
	ceQuery = ceQuery.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
	ceQuery = ceQuery.Where("active = true")

	// optional input fields
	if eventArgs.Input.Title != nil {
		// trim and validate title
		trimmedTitle := strings.TrimSpace(*eventArgs.Input.Title)
		if len(trimmedTitle) < 1 {
			return types.LambdaResponse{StatusCode: 400, Error: "Title is too short"}
		}
		ceQuery = ceQuery.Set("title", trimmedTitle)
	}

	if eventArgs.Input.Archived != nil {
		archivedVal := bool(*eventArgs.Input.Archived)
		ceQuery = ceQuery.Set("archived", archivedVal)
	}

	if eventArgs.Input.StartTime != nil {
		startTimeVal := eventArgs.Input.StartTime.Format(time.RFC3339)
		ceQuery = ceQuery.Set("start_time", startTimeVal)
	}

	if eventArgs.Input.CalendarType != nil {
		calendarTypeVal := string(*eventArgs.Input.CalendarType)
		ceQuery = ceQuery.Set("calendar_type", calendarTypeVal)
	}

	if eventArgs.Input.EndTime != nil {
		endTimeVal := eventArgs.Input.EndTime.Format(time.RFC3339)
		ceQuery = ceQuery.Set("end_time", endTimeVal)
	}

	if eventArgs.Input.AllDay != nil {
		allDayVal := bool(*eventArgs.Input.AllDay)
		ceQuery = ceQuery.Set("all_day", allDayVal)
	}

	if eventArgs.Input.Description != nil {
		descriptionVal := string(*eventArgs.Input.Description)
		ceQuery = ceQuery.Set("description", descriptionVal)
	}

	// sql and args
	ceSql, ceArgs, ceSqlErr := ceQuery.ToSql()
	if ceSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: ceSqlErr.Error()}
	}
	fmt.Println("ceSql", ceSql)
	fmt.Printf("ceArgs %+v\n", ceArgs)

	// add update to transaction
	_, aErr := trx.Exec(ctx, ceSql, ceArgs...)
	if aErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: aErr.Error()}
	}

	// commit transaction
	trxErr := trx.Commit(ctx)
	if trxErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: trxErr.Error()}
	}

	// query new row
	selects := []string{
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
	rQuery := psql.Select(selects...).From("calendar_event")
	rQuery = rQuery.Where("id = ?", eventArgs.Id)

	// sql and args
	qSql, qArgs, qSqlErr := rQuery.ToSql()
	if qSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qSqlErr.Error()}
	}

	// execute query
	rows, qErr := dbq.Query(ctx, qSql, qArgs...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}

	// check for zero case
	if rows.Next() == false {
		return types.LambdaResponse{StatusCode: 500, Error: "Update failed"}
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

	// convert output to json and return
	outputJson, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(outputJson),
	}
}
