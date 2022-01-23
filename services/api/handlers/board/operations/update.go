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

type updateBoardInput struct {
	Archived *bool `json:"archived,omitempty"`
}

type updateInput struct {
	Id    string           `json:"id"`
	Input updateBoardInput `json:"input"`
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

	// validate update id
	tErr := gql.ValidateBoardId(ctx, dbq, eventArgs.Id, event.Context.Identity)
	if tErr != nil {
		return types.LambdaResponse{StatusCode: 400, Error: tErr.Error()}
	}

	// convert id to int
	boardId, err := strconv.Atoi(eventArgs.Id)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// initialize update query
	bQuery := psql.Update("board")

	// where statements
	bQuery = bQuery.Where("id = ?", boardId)
	bQuery = bQuery.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username)
	bQuery = bQuery.Where("active = true")

	// optional input fields
	if eventArgs.Input.Archived != nil {
		archivedVal := bool(*eventArgs.Input.Archived)
		bQuery = bQuery.Set("archived", archivedVal)
	}

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

	// check for zero case
	if rows.Next() == false {
		return types.LambdaResponse{StatusCode: 500, Error: "Update failed"}
	}

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

	// construct output
	output := types.BoardGQLOutput{
		Id:        id,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
		Archived:  archived,
		ImageId:   imageId,
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
