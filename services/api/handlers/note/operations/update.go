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
	"project-oakwood/services/storage/db"
	"project-oakwood/services/toolbox/gql"
)

type updateNoteTypeInput struct {
	NoteTypeId   *string `json:"note_type_id,omitempty"`
	Title        *string `json:"title,omitempty"`
	Archived     *bool   `json:"archived,omitempty"`
	Body         *string `json:"body,omitempty"`
	SortPosition *int    `json:"sort_position,omitempty"`
}

type updateInput struct {
	Id    string              `json:"id"`
	Input updateNoteTypeInput `json:"input"`
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
	if eventArgs.Input.NoteTypeId == nil && eventArgs.Input.Title == nil && eventArgs.Input.Archived == nil && eventArgs.Input.Body == nil && eventArgs.Input.SortPosition == nil {
		return types.LambdaResponse{StatusCode: 400, Error: "At least one update field is required"}
	}

	// convert id to int
	noteId, err := strconv.Atoi(eventArgs.Id)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// validate update id
	tErr := gql.ValidateNoteId(ctx, dbq, noteId, event.Context.Identity)
	if tErr != nil {
		return types.LambdaResponse{StatusCode: 400, Error: tErr.Error()}
	}

	// initialize update transaction
	trx, err := dbq.Begin(ctx)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	defer trx.Rollback(ctx)

	// initialize update query
	nQuery := psql.Update("note")

	// where statements
	nQuery = nQuery.Where("id = ?", eventArgs.Id)
	nQuery = nQuery.Where("active = true")

	// optional input fields
	if eventArgs.Input.NoteTypeId != nil || eventArgs.Input.SortPosition != nil {
		// need to do something with sort_position

		// return error if one or the other is missing
		if eventArgs.Input.NoteTypeId == nil {
			return types.LambdaResponse{StatusCode: 400, Error: "Sort position update requires note type id"}
		} else if eventArgs.Input.SortPosition == nil {
			return types.LambdaResponse{StatusCode: 400, Error: "Note type update requires sort position"}
		}

		// validate note_type id
		pErr := gql.ValidateNoteTypeId(ctx, dbq, *eventArgs.Input.NoteTypeId, event.Context.Identity)
		if pErr != nil {
			return types.LambdaResponse{StatusCode: 400, Error: "Invalid note_type id"}
		}

		// convert note_type id to int
		gqlNoteTypeId, err := strconv.Atoi(*eventArgs.Input.NoteTypeId)
		if err != nil {
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}

		// convert received sort position to int
		gqlSortPosition := int(*eventArgs.Input.SortPosition)

		// default update position to event args
		newPosition := gqlSortPosition

		// get current note_type_id and sort_position
		cpQuery := db.PostgresBuilder.Select("note_type_id", "sort_position").From("note")
		cpQuery = cpQuery.Where("id = ?", noteId)
		cpSql, cpArgs, cpSqlErr := cpQuery.ToSql()
		if cpSqlErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: cpSqlErr.Error()}
		}
		fmt.Println("cpSql", cpSql)
		fmt.Println("cpArgs", cpArgs)

		var currentNoteTypeId int
		var dbPosition *int // nullable at the moment
		cpErr := dbq.QueryRow(ctx, cpSql, cpArgs...).Scan(&currentNoteTypeId, &dbPosition)
		if cpErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: cpErr.Error()}
		}
		fmt.Println("currentNoteTypeId", currentNoteTypeId)
		fmt.Println("dbPosition", dbPosition)

		var currentPosition int
		if dbPosition != nil {
			currentPosition = *dbPosition
		}
		fmt.Println("currentPosition", currentPosition)

		if currentNoteTypeId != gqlNoteTypeId {
			fmt.Println("different note type id")
			// move within new note type's list, allow + 1 when validating position to support
			// adding to the end of a list
			validationPosition := gqlSortPosition
			if validationPosition > 1 {
				validationPosition -= 1
			}

			spErr := gql.ValidateNoteSortPosition(ctx, dbq, gqlNoteTypeId, validationPosition, event.Context.Identity)
			if spErr != nil {
				return types.LambdaResponse{StatusCode: 400, Error: spErr.Error()}
			}

			// decrement all higher positions in the current project's note_types
			curProjectQuery := db.PostgresBuilder.Update("note")
			curProjectQuery = curProjectQuery.Set("sort_position", squirrel.Expr("sort_position - 1"))
			curProjectQuery = curProjectQuery.Where("note_type_id = ?", currentNoteTypeId)
			curProjectQuery = curProjectQuery.Where("sort_position > ?", currentPosition)

			// update sql and args
			cSql, cArgs, cSqlErr := curProjectQuery.ToSql()
			if cSqlErr != nil {
				return types.LambdaResponse{StatusCode: 500, Error: cSqlErr.Error()}
			}
			fmt.Println("cSql", cSql)
			fmt.Println("cArgs", cArgs)

			// add update to transaction
			_, cErr := trx.Exec(ctx, cSql, cArgs...)
			if cErr != nil {
				return types.LambdaResponse{StatusCode: 500, Error: cErr.Error()}
			}

			// increment everything at the new position and higher of the new list
			uQuery := db.PostgresBuilder.Update("note")

			// increment positions of the new project list
			uQuery = uQuery.Set("sort_position", squirrel.Expr("sort_position + 1"))
			uQuery = uQuery.Where("note_type_id = ?", gqlNoteTypeId)
			uQuery = uQuery.Where("sort_position >= ?", gqlSortPosition)

			// update sql and args
			uSql, uArgs, uSqlErr := uQuery.ToSql()
			if uSqlErr != nil {
				return types.LambdaResponse{StatusCode: 500, Error: uSqlErr.Error()}
			}
			fmt.Println("uSql", uSql)
			fmt.Println("uArgs", uArgs)

			// add update to transaction
			_, aErr := trx.Exec(ctx, uSql, uArgs...)
			if aErr != nil {
				return types.LambdaResponse{StatusCode: 500, Error: aErr.Error()}
			}
		} else {
			fmt.Println("same note type id")
			// validate received sort position
			spErr := gql.ValidateNoteSortPosition(ctx, dbq, gqlNoteTypeId, gqlSortPosition, event.Context.Identity)
			if spErr != nil {
				return types.LambdaResponse{StatusCode: 400, Error: spErr.Error()}
			}

			// move within current project's list
			if newPosition != currentPosition {
				// update existing rows' sort positions accordingly
				uQuery := db.PostgresBuilder.Update("note")

				if newPosition > currentPosition {
					// decrement positions between current and new
					uQuery = uQuery.Set("sort_position", squirrel.Expr("sort_position - 1"))
					uQuery = uQuery.Where("note_type_id = ?", currentNoteTypeId)
					uQuery = uQuery.Where("sort_position <= ?", newPosition)
					uQuery = uQuery.Where("sort_position > ?", currentPosition)
				} else {
					// increment positions
					uQuery = uQuery.Set("sort_position", squirrel.Expr("sort_position + 1"))
					uQuery = uQuery.Where("note_type_id = ?", currentNoteTypeId)
					uQuery = uQuery.Where("sort_position >= ?", newPosition)
					uQuery = uQuery.Where("sort_position < ?", currentPosition)
				}

				// update sql and args
				uSql, uArgs, uSqlErr := uQuery.ToSql()
				if uSqlErr != nil {
					return types.LambdaResponse{StatusCode: 500, Error: uSqlErr.Error()}
				}
				fmt.Println("uSql", uSql)
				fmt.Println("uArgs", uArgs)

				// add update to transaction
				_, aErr := trx.Exec(ctx, uSql, uArgs...)
				if aErr != nil {
					return types.LambdaResponse{StatusCode: 500, Error: aErr.Error()}
				}
			}
		}

		// append set clauses to query
		nQuery = nQuery.Set("note_type_id", gqlNoteTypeId)
		nQuery = nQuery.Set("sort_position", newPosition)
	}

	// if eventArgs.Input.NoteTypeId != nil {

	// 	// validate note_type id
	// 	pErr := gql.ValidateNoteTypeId(ctx, dbq, *eventArgs.Input.NoteTypeId, event.Context.Identity)
	// 	if pErr != nil {
	// 		return types.LambdaResponse{StatusCode: 400, Error: "Invalid note_type id"}
	// 	}
	// 	// convert note_type id to int
	// 	noteTypeId, err := strconv.Atoi(*eventArgs.Input.NoteTypeId)
	// 	if err != nil {
	// 		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	// 	}

	// 	nQuery = nQuery.Set("note_type_id", noteTypeId)
	// }

	if eventArgs.Input.Title != nil {
		// trim and validate title
		trimmedTitle := strings.TrimSpace(*eventArgs.Input.Title)
		if len(trimmedTitle) < 1 {
			return types.LambdaResponse{StatusCode: 400, Error: "Title is too short"}
		}
		nQuery = nQuery.Set("title", trimmedTitle)
	}

	if eventArgs.Input.Archived != nil {
		archivedVal := bool(*eventArgs.Input.Archived)
		nQuery = nQuery.Set("archived", archivedVal)
	}

	if eventArgs.Input.Body != nil {
		bodyVal := string(*eventArgs.Input.Body)
		nQuery = nQuery.Set("body", bodyVal)
	}

	// if eventArgs.Input.SortPosition != nil {
	// 	// validate sort position
	// 	spErr := gql.ValidateNoteSortPosition(*eventArgs.Input.SortPosition)

	// 	// convert to int and add to query
	// 	sortPosition := int(*eventArgs.Input.SortPosition)
	// 	if spErr != nil {
	// 		return types.LambdaResponse{StatusCode: 400, Error: spErr.Error()}
	// 	}
	// 	nQuery = nQuery.Set("sort_position", sortPosition)
	// }

	// returning
	// returning := []string{
	// 	"id",
	// 	"created_at",
	// 	"updated_at",
	// 	"note_type_id",
	// 	"title",
	// 	"archived",
	// 	"body",
	// 	"sort_position",
	// }
	// nQuery = nQuery.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))
	// fmt.Printf("nQuery %+v\n", nQuery)

	// sql and args
	nSql, nArgs, nSqlErr := nQuery.ToSql()
	if nSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: nSqlErr.Error()}
	}
	fmt.Println("nSql", nSql)
	fmt.Printf("nArgs %+v\n", nArgs)

	// add update to transaction
	_, aErr := trx.Exec(ctx, nSql, nArgs...)
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
		"note_type_id",
		"title",
		"archived",
		"body",
		"sort_position",
	}
	rQuery := psql.Select(selects...).From("note")
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
