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

type archiveInput struct {
	Ids []string `json:"ids"`
}

func Archive(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs archiveInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)

	// create a new postgres update query
	bQuery := psql.Update("board")

	// update archived field
	bQuery = bQuery.Set("archived", true)

	// where statements
	bQuery = bQuery.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
	bQuery = bQuery.Where(squirrel.Eq{"active": true})
	bQuery = bQuery.Where(squirrel.Eq{"id": eventArgs.Ids})

	// returning
	returning := []string{
		"id",
		"created_at",
		"updated_at",
		"archived",
		"image_id",
	}
	bQuery = bQuery.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))

	// sql and args
	bSql, bArgs, bSqlErr := bQuery.ToSql()
	if bSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: bSqlErr.Error()}
	}
	fmt.Println("bSql", bSql)
	fmt.Printf("bArgs %+v\n", bArgs)

	// execute query
	rows, qErr := dbq.Query(ctx, bSql, bArgs...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}
	defer rows.Close()

	// iterate over rows to build output from RETURNING statement
	var outputs []types.BoardGQLOutput
	for rows.Next() {
		// scan return values into destinations
		var id int
		var createdAt time.Time
		var updatedAt time.Time
		var archived bool
		var imageId int
		sErr := rows.Scan(&id, &createdAt, &updatedAt, &archived, &imageId)
		if sErr != nil {
			return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
		}

		outputs = append(outputs, types.BoardGQLOutput{
			Id:        id,
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
			Archived:  archived,
			ImageId:   imageId,
		})
	}

	// convert output to json and return
	outputJson, err := json.Marshal(outputs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(outputJson),
	}
}
