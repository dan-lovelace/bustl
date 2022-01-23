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
	"project-oakwood/services/storage/db"
	"project-oakwood/services/toolbox/gql"
)

type updateProjectInput struct {
	Name         *string `json:"name,omitempty"`
	SortPosition *int    `json:"sort_position,omitempty"`
}

type updateInput struct {
	Id    string             `json:"id"`
	Input updateProjectInput `json:"input"`
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
	if eventArgs.Input.Name == nil && eventArgs.Input.SortPosition == nil {
		return types.LambdaResponse{StatusCode: 400, Error: "At least one update field is required"}
	}

	// validate update id
	tErr := gql.ValidateProjectId(ctx, dbq, eventArgs.Id, event.Context.Identity)
	if tErr != nil {
		return types.LambdaResponse{StatusCode: 400, Error: tErr.Error()}
	}

	// init update query
	pQuery := psql.Update("project")

	// where statements
	pQuery = pQuery.Where("id = ?", eventArgs.Id)
	pQuery = pQuery.Where("active = true")

	// optional input fields
	if eventArgs.Input.Name != nil {
		// trim and validate name
		trimmedName := strings.TrimSpace(*eventArgs.Input.Name)
		if len(trimmedName) < 1 {
			return types.LambdaResponse{StatusCode: 400, Error: "Name is too short"}
		}
		pQuery = pQuery.Set("name", trimmedName)
	}

	if eventArgs.Input.SortPosition != nil {
		// validate received sort position
		newPosition := int(*eventArgs.Input.SortPosition)
		spErr := gql.ValidateProjectSortPosition(ctx, dbq, newPosition, event.Context.Identity)
		if spErr != nil {
			return types.LambdaResponse{StatusCode: 400, Error: spErr.Error()}
		}

		// get current sort position
		cpQuery := db.PostgresBuilder.Select("sort_position").From("project")
		cpQuery = cpQuery.Where("id = ?", eventArgs.Id)
		cpSql, cpArgs, cpSqlErr := cpQuery.ToSql()
		if cpSqlErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: cpSqlErr.Error()}
		}
		fmt.Println("cpSql", cpSql)
		fmt.Println("cpArgs", cpArgs)
		var dbPosition *int // nullable at the moment
		cpErr := dbq.QueryRow(ctx, cpSql, cpArgs...).Scan(&dbPosition)
		if cpErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: cpErr.Error()}
		}
		fmt.Println("dbPosition", dbPosition)

		var currentPosition int
		if dbPosition != nil {
			currentPosition = *dbPosition
		}
		fmt.Println("currentPosition", currentPosition)

		// see if other rows need to be updated
		if newPosition != currentPosition {
			// update existing rows' sort positions accordingly
			uQuery := db.PostgresBuilder.Update("project")

			if newPosition > currentPosition {
				// decrement positions between current and new
				uQuery = uQuery.Set("sort_position", squirrel.Expr("sort_position - 1"))
				uQuery = uQuery.Where("sort_position <= ?", newPosition)
				uQuery = uQuery.Where("sort_position > ?", currentPosition)
			} else {
				// increment positions
				uQuery = uQuery.Set("sort_position", squirrel.Expr("sort_position + 1"))
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
			// execute update and close connection
			rows, aErr := dbq.Query(ctx, uSql, uArgs...)
			if aErr != nil {
				return types.LambdaResponse{StatusCode: 500, Error: aErr.Error()}
			}
			rows.Close()
		}

		// append set clause to query
		pQuery = pQuery.Set("sort_position", newPosition)
	}

	// returning
	returning := []string{
		"id",
		"created_at",
		"updated_at",
		"name",
		"sort_position",
	}
	pQuery = pQuery.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))
	fmt.Printf("pQuery %+v\n", pQuery)
	// sql and args
	pSql, pArgs, pSqlErr := pQuery.ToSql()
	if pSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: pSqlErr.Error()}
	}
	fmt.Println("pSql", pSql)
	fmt.Printf("pArgs %+v\n", pArgs)
	rows, qErr := dbq.Query(ctx, pSql, pArgs...)
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
	var name string
	var sortPosition *int
	sErr := rows.Scan(&id, &createdAt, &updatedAt, &name, &sortPosition)
	if sErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
	}

	// construct output
	output := types.ProjectGQLOutput{
		Id:           id,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
		Name:         name,
		SortPosition: sortPosition,
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
