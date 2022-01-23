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
	ProjectId    *string `json:"project_id,omitempty"`
	Name         *string `json:"name,omitempty"`
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
	if eventArgs.Input.ProjectId == nil && eventArgs.Input.Name == nil && eventArgs.Input.SortPosition == nil {
		return types.LambdaResponse{StatusCode: 400, Error: "At least one update field is required"}
	}

	// validate update id
	tErr := gql.ValidateNoteTypeId(ctx, dbq, eventArgs.Id, event.Context.Identity)
	if tErr != nil {
		return types.LambdaResponse{StatusCode: 400, Error: tErr.Error()}
	}

	// convert id to int
	noteTypeId, err := strconv.Atoi(eventArgs.Id)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// initialize update transaction
	trx, err := dbq.Begin(ctx)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	defer trx.Rollback(ctx)

	// initialize update query
	ntQuery := psql.Update("note_type")

	// where statements
	ntQuery = ntQuery.Where("id = ?", noteTypeId)
	ntQuery = ntQuery.Where("active = true")

	// optional input fields
	if eventArgs.Input.ProjectId != nil || eventArgs.Input.SortPosition != nil {
		// need to do something with sort_position

		// return error if one or the other is missing
		if eventArgs.Input.ProjectId == nil {
			return types.LambdaResponse{StatusCode: 400, Error: "Sort position update requires project id"}
		} else if eventArgs.Input.SortPosition == nil {
			return types.LambdaResponse{StatusCode: 400, Error: "Project update requires sort position"}
		}

		// validate project id
		pErr := gql.ValidateProjectId(ctx, dbq, *eventArgs.Input.ProjectId, event.Context.Identity)
		if pErr != nil {
			return types.LambdaResponse{StatusCode: 400, Error: pErr.Error()}
		}

		// convert received project id to int
		gqlProjectId, err := strconv.Atoi(*eventArgs.Input.ProjectId)
		if err != nil {
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}

		// convert received sort position to int
		gqlSortPosition := int(*eventArgs.Input.SortPosition)

		// default update position to event args
		newPosition := gqlSortPosition

		// get current project_id and sort_position
		cpQuery := db.PostgresBuilder.Select("project_id", "sort_position").From("note_type")
		cpQuery = cpQuery.Where("id = ?", noteTypeId)
		cpSql, cpArgs, cpSqlErr := cpQuery.ToSql()
		if cpSqlErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: cpSqlErr.Error()}
		}
		fmt.Println("cpSql", cpSql)
		fmt.Println("cpArgs", cpArgs)

		var currentProjectId int
		var dbPosition *int // nullable at the moment
		cpErr := dbq.QueryRow(ctx, cpSql, cpArgs...).Scan(&currentProjectId, &dbPosition)
		if cpErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: cpErr.Error()}
		}
		fmt.Println("currentProjectId", currentProjectId)
		fmt.Println("dbPosition", dbPosition)

		var currentPosition int
		if dbPosition != nil {
			currentPosition = *dbPosition
		}
		fmt.Println("currentPosition", currentPosition)

		if currentProjectId != gqlProjectId {
			// move within new project's list, allow + 1 when validating position to support
			// adding to the end of a list
			validationPosition := gqlSortPosition
			if validationPosition > 1 {
				validationPosition -= 1
			}

			spErr := gql.ValidateNoteTypeSortPosition(ctx, dbq, gqlProjectId, validationPosition, event.Context.Identity)
			if spErr != nil {
				return types.LambdaResponse{StatusCode: 400, Error: spErr.Error()}
			}

			// decrement all higher positions in the current project's note_types
			curProjectQuery := db.PostgresBuilder.Update("note_type")
			curProjectQuery = curProjectQuery.Set("sort_position", squirrel.Expr("sort_position - 1"))
			curProjectQuery = curProjectQuery.Where("project_id = ?", currentProjectId)
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
			uQuery := db.PostgresBuilder.Update("note_type")

			// increment positions of the new project list
			uQuery = uQuery.Set("sort_position", squirrel.Expr("sort_position + 1"))
			uQuery = uQuery.Where("project_id = ?", gqlProjectId)
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
			// validate received sort position
			spErr := gql.ValidateNoteTypeSortPosition(ctx, dbq, gqlProjectId, gqlSortPosition, event.Context.Identity)
			if spErr != nil {
				return types.LambdaResponse{StatusCode: 400, Error: spErr.Error()}
			}

			// move within current project's list
			if newPosition != currentPosition {
				// update existing rows' sort positions accordingly
				uQuery := db.PostgresBuilder.Update("note_type")

				if newPosition > currentPosition {
					// decrement positions between current and new
					uQuery = uQuery.Set("sort_position", squirrel.Expr("sort_position - 1"))
					uQuery = uQuery.Where("project_id = ?", currentProjectId)
					uQuery = uQuery.Where("sort_position <= ?", newPosition)
					uQuery = uQuery.Where("sort_position > ?", currentPosition)
				} else {
					// increment positions
					uQuery = uQuery.Set("sort_position", squirrel.Expr("sort_position + 1"))
					uQuery = uQuery.Where("project_id = ?", currentProjectId)
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
		ntQuery = ntQuery.Set("project_id", gqlProjectId)
		ntQuery = ntQuery.Set("sort_position", newPosition)
	}

	if eventArgs.Input.Name != nil {
		// trim and validate name
		trimmedName := strings.TrimSpace(*eventArgs.Input.Name)
		if len(trimmedName) < 1 {
			return types.LambdaResponse{StatusCode: 400, Error: "Name is too short"}
		}
		ntQuery = ntQuery.Set("name", trimmedName)
	}

	// sql and args
	ntSql, ntArgs, ntSqlErr := ntQuery.ToSql()
	if ntSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: ntSqlErr.Error()}
	}
	fmt.Println("ntSql", ntSql)
	fmt.Printf("ntArgs %+v\n", ntArgs)

	// add update to transaction
	_, aErr := trx.Exec(ctx, ntSql, ntArgs...)
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
		"project_id",
		"name",
		"sort_position",
	}
	rQuery := psql.Select(selects...).From("note_type")
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
