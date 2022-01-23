package gql

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"project-oakwood/services/api/types"
	"project-oakwood/services/storage/db"

	"github.com/jackc/pgx/v4"
)

func ValidateBoardId(ctx context.Context, dbq *pgx.Conn, boardId string, identity types.LambdaEventContextIdentity) error {
	if boardId == "" {
		return errors.New("Requires board id")
	}

	boardQuery := db.PostgresBuilder.Select("board.id")
	boardQuery = boardQuery.From("board")
	boardQuery = boardQuery.InnerJoin("app_user ON board.app_user_id = app_user.id")
	boardQuery = boardQuery.Where("app_user.cognito_id = ?", identity.Username)
	boardQuery = boardQuery.Where("board.active = true")

	boardSql, boardArgs, boardSqlErr := boardQuery.ToSql()
	if boardSqlErr != nil {
		return boardSqlErr
	}

	var validBoardId int
	bErr := dbq.QueryRow(ctx, boardSql, boardArgs...).Scan(&validBoardId)
	if bErr != nil {
		return bErr
	} else if validBoardId == 0 {
		return errors.New("Invalid board id")
	}

	return nil
}

func ValidateCalendarEventId(ctx context.Context, dbq *pgx.Conn, calendarEventId int, identity types.LambdaEventContextIdentity) error {
	if calendarEventId == 0 {
		return errors.New("Requires calendar event id")
	}

	calendarEventQuery := db.PostgresBuilder.Select("id")
	calendarEventQuery = calendarEventQuery.From("calendar_event")
	calendarEventQuery = calendarEventQuery.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", identity.Username)
	calendarEventQuery = calendarEventQuery.Where("active = true")

	calendarEventSql, calendarEventArgs, calendarEventSqlErr := calendarEventQuery.ToSql()
	if calendarEventSqlErr != nil {
		return calendarEventSqlErr
	}

	var validCalendarEventId int
	bErr := dbq.QueryRow(ctx, calendarEventSql, calendarEventArgs...).Scan(&validCalendarEventId)
	if bErr != nil {
		return bErr
	} else if validCalendarEventId == 0 {
		return errors.New("Invalid calendar event id")
	}

	return nil
}

func ValidateImageId(ctx context.Context, dbq *pgx.Conn, imageId string, identity types.LambdaEventContextIdentity) error {
	if imageId == "" {
		return errors.New("Requires image id")
	}

	imageQuery := db.PostgresBuilder.Select("image.id")
	imageQuery = imageQuery.From("image")
	imageQuery = imageQuery.InnerJoin("app_user ON image.app_user_id = app_user.id")
	imageQuery = imageQuery.Where("app_user.cognito_id = ?", identity.Username)
	imageQuery = imageQuery.Where("image.active = true")

	imageSql, imageArgs, imageSqlErr := imageQuery.ToSql()
	if imageSqlErr != nil {
		return imageSqlErr
	}

	var validImageId int
	bErr := dbq.QueryRow(ctx, imageSql, imageArgs...).Scan(&validImageId)
	if bErr != nil {
		return bErr
	} else if validImageId == 0 {
		return errors.New("Invalid image id")
	}

	return nil
}

func ValidateNoteId(ctx context.Context, dbq *pgx.Conn, noteId int, identity types.LambdaEventContextIdentity) error {
	noteQuery := db.PostgresBuilder.Select("note.id")
	noteQuery = noteQuery.From("note")
	noteQuery = noteQuery.InnerJoin("note_type ON note_type_id = note_type.id")
	noteQuery = noteQuery.InnerJoin("project ON note_type.project_id = project.id")
	noteQuery = noteQuery.Where("project.app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", identity.Username)
	noteQuery = noteQuery.Where("note.active = true")
	noteQuery = noteQuery.Where("note_type.active = true")
	noteQuery = noteQuery.Where("project.active = true")

	noteSql, noteArgs, noteSqlErr := noteQuery.ToSql()
	if noteSqlErr != nil {
		return noteSqlErr
	}

	var validNoteId int
	nErr := dbq.QueryRow(ctx, noteSql, noteArgs...).Scan(&validNoteId)
	if nErr != nil {
		return nErr
	} else if validNoteId == 0 {
		return errors.New("Invalid note id")
	}

	return nil
}

func ValidateNoteTypeId(ctx context.Context, dbq *pgx.Conn, noteTypeId string, identity types.LambdaEventContextIdentity) error {
	trimmedId := strings.TrimSpace(noteTypeId)
	if trimmedId == "" {
		return errors.New("Requires note type id")
	}

	noteTypeQuery := db.PostgresBuilder.Select("note_type.id")
	noteTypeQuery = noteTypeQuery.From("note_type")
	noteTypeQuery = noteTypeQuery.InnerJoin("project ON project_id = project.id")
	noteTypeQuery = noteTypeQuery.Where("note_type.id = ?", noteTypeId)
	noteTypeQuery = noteTypeQuery.Where("project.app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", identity.Username)
	noteTypeQuery = noteTypeQuery.Where("note_type.active = true")
	noteTypeQuery = noteTypeQuery.Where("project.active = true")

	noteTypeSql, noteTypeArgs, noteTypeSqlErr := noteTypeQuery.ToSql()
	if noteTypeSqlErr != nil {
		return noteTypeSqlErr
	}

	var validNoteTypeId int
	nErr := dbq.QueryRow(ctx, noteTypeSql, noteTypeArgs...).Scan(&validNoteTypeId)
	if nErr != nil {
		return nErr
	} else if validNoteTypeId == 0 {
		return errors.New("Invalid note type id")
	}

	return nil
}

func ValidateProjectId(ctx context.Context, dbq *pgx.Conn, projectId string, identity types.LambdaEventContextIdentity) error {
	trimmedId := strings.TrimSpace(projectId)
	if trimmedId == "" {
		return errors.New("Requires project id")
	}

	projectQuery := db.PostgresBuilder.Select("project.id").From("project")
	projectQuery = projectQuery.InnerJoin("app_user ON app_user_id = app_user.id")
	projectQuery = projectQuery.Where("project.id = ?", trimmedId)
	projectQuery = projectQuery.Where("app_user.cognito_id = ?", identity.Username)
	projectQuery = projectQuery.Where("project.active = true")

	projectSql, projectArgs, err := projectQuery.ToSql()
	if err != nil {
		return err
	}

	var validProjectId int
	bErr := dbq.QueryRow(ctx, projectSql, projectArgs...).Scan(&validProjectId)
	if bErr != nil {
		return bErr
	} else if validProjectId == 0 {
		return errors.New("Invalid project_id")
	}

	return nil
}

func checkMinimum(position int) error {
	min := 1
	if position < min {
		return errors.New("Sort position must be greater than zero")
	}

	return nil
}

func ValidateNoteSortPosition(ctx context.Context, dbq *pgx.Conn, noteTypeId int, position int, identity types.LambdaEventContextIdentity) error {
	// enforce minimum
	minErr := checkMinimum(position)
	if minErr != nil {
		return minErr
	}

	// make sure the position is within the bounds of the current note type
	noteQuery := db.PostgresBuilder.Select("COALESCE(MAX(note.sort_position), 1)").From("note")
	noteQuery = noteQuery.InnerJoin("note_type ON note_type_id = note_type.id")
	noteQuery = noteQuery.InnerJoin("project ON note_type.project_id = project.id")
	noteQuery = noteQuery.Where("note_type.id = ?", noteTypeId)
	noteQuery = noteQuery.Where("project.app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", identity.Username)
	// noteQuery = noteQuery.Where("note.id = ?", noteTypeId)

	nSql, nArgs, nSqlErr := noteQuery.ToSql()
	if nSqlErr != nil {
		return nSqlErr
	}
	fmt.Println("nSql", nSql)
	fmt.Println("nArgs", nArgs)
	var maxAllowedPosition int
	pErr := dbq.QueryRow(ctx, nSql, nArgs...).Scan(&maxAllowedPosition)
	if pErr != nil {
		return pErr
	}
	fmt.Println("maxAllowedPosition", maxAllowedPosition)
	if position > maxAllowedPosition {
		return errors.New("Sort position is too high")
	}

	return nil
}

func ValidateNoteTypeSortPosition(ctx context.Context, dbq *pgx.Conn, projectId int, position int, identity types.LambdaEventContextIdentity) error {
	// enforce minimum
	minErr := checkMinimum(position)
	if minErr != nil {
		return minErr
	}

	// make sure the position is within the bounds of the current project
	noteTypeQuery := db.PostgresBuilder.Select("COALESCE(MAX(note_type.sort_position), 1)").From("note_type")
	noteTypeQuery = noteTypeQuery.InnerJoin("project ON project_id = project.id")
	noteTypeQuery = noteTypeQuery.Where("project.id = ?", projectId)
	noteTypeQuery = noteTypeQuery.Where("project.app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", identity.Username)
	// noteTypeQuery = noteTypeQuery.Where("note_type.id = ?", noteTypeId)

	ntSql, ntArgs, ntSqlErr := noteTypeQuery.ToSql()
	if ntSqlErr != nil {
		return ntSqlErr
	}
	fmt.Println("ntSql", ntSql)
	fmt.Println("ntArgs", ntArgs)
	var maxAllowedPosition int
	pErr := dbq.QueryRow(ctx, ntSql, ntArgs...).Scan(&maxAllowedPosition)
	if pErr != nil {
		return pErr
	}
	fmt.Println("maxAllowedPosition", maxAllowedPosition)
	if position > maxAllowedPosition {
		return errors.New("Sort position is too high")
	}

	return nil
}

// ValidateProjectSortPosition provides a check for the sort_position field of the
// updateProject mutation. It makes sure the received sort position is within the
// boundaries of the current user by querying the current highest sort position and
// returning an error if the new one is higher than that.
func ValidateProjectSortPosition(ctx context.Context, dbq *pgx.Conn, position int, identity types.LambdaEventContextIdentity) error {
	// enforce minimum
	minErr := checkMinimum(position)
	if minErr != nil {
		return minErr
	}

	// make sure the position is within the bounds of the current user
	projectQuery := db.PostgresBuilder.Select("COALESCE(MAX(sort_position), 1)").From("project")
	projectQuery = projectQuery.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", identity.Username)

	pSql, pArgs, pSqlErr := projectQuery.ToSql()
	if pSqlErr != nil {
		return pSqlErr
	}

	var maxAllowedPosition int
	pErr := dbq.QueryRow(ctx, pSql, pArgs...).Scan(&maxAllowedPosition)
	if pErr != nil {
		return pErr
	}

	if position > maxAllowedPosition {
		return errors.New("Sort position is too high")
	}

	return nil
}
