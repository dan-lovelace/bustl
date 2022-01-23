package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/handlers/image/lib"
	"project-oakwood/services/api/types"
)

type listInput struct {
	ImageSize string `json:"image_size"`
}

type listOutput struct {
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Active    bool      `json:"active"`

	Filename        string `json:"filename"`
	ProcessingState string `json:"processing_state"`
	Source          string `json:"source"`
	Thumbnail       string `json:"thumbnail"`
}

func List(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs listInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)

	// check requirements
	if eventArgs.ImageSize == "" {
		return types.LambdaResponse{StatusCode: 400, Error: "Requires image_size"}
	}

	// construct query
	selects := []string{
		"id",
		"created_at",
		"updated_at",
		"active",
		"filename",
		"processing_state",
		"app_user_id",
	}
	query := psql.Select(selects...).From("image")

	// filter results by the current user
	cognitoId := event.Context.Identity.Username
	query = query.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = $1)", cognitoId)

	// order by
	query = query.OrderBy("created_at DESC")

	// convert to SQL statement and its arguments
	sql, args, err := query.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// execute query
	var rows []types.Image
	qErr := pgxscan.Select(ctx, dbq, &rows, sql, args...)
	if qErr != nil {
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

	// populate shared db fields
	var outputs []listOutput
	json.Unmarshal(rJson, &outputs)

	// fetch image src for each result
	for i := 0; i < len(outputs); i++ {
		imageSource, err := lib.GetImageSource(cognitoId, outputs[i].Filename, outputs[i].ProcessingState)
		if err != nil {
			fmt.Println("error resolving image source", err)
		}
		outputs[i].Source = imageSource.Source
		outputs[i].Thumbnail = imageSource.Thumbnail
	}

	// convert outputs to json and return
	body, err := json.Marshal(outputs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}
}
