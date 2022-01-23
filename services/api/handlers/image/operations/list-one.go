package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/handlers/image/lib"
	"project-oakwood/services/api/types"
)

type listOneInput struct {
	Id int `json:"id"`
}

type listOneOutput struct {
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Active    bool      `json:"active"`

	Filename        string `json:"filename"`
	ProcessingState string `json:"processing_state"`
	Source          string `json:"source"`
	Thumbnail       string `json:"thumbnail"`
}

func ListOne(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs listOneInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)

	// check requirements
	if eventArgs.Id == 0 {
		return types.LambdaResponse{StatusCode: 400, Error: "Requires id"}
	}

	// initialize query
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

	// add gql WHERE operation(s) and count them
	argCount := 0
	for key := range gqlArgs {
		if key == "id" {
			query = query.Where(sq.Eq{key: eventArgs.Id})
			argCount += 1
		}
	}

	// filter results by the current user
	userWhere := fmt.Sprintf("app_user_id = (SELECT id FROM app_user WHERE cognito_id = $%d)", argCount+1)
	query = query.Where(userWhere, event.Context.Identity.Username)

	// convert query to SQL and get argument list for parameterization
	sql, args, err := query.ToSql()
	fmt.Println("sql", sql)
	fmt.Println("args", args)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// query db using statement and arguments
	var rows []types.Image
	qErr := pgxscan.Select(ctx, dbq, &rows, sql, args...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// check for zero case
	if len(rows) == 0 {
		return types.LambdaResponse{StatusCode: 200, Data: "null"}
	}

	// convert first row to json
	rJson, err := json.Marshal(rows[0])
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// populate shared db fields
	var output listOneOutput
	json.Unmarshal(rJson, &output)

	// fetch image src
	imageSource, err := lib.GetImageSource(event.Context.Identity.Username, output.Filename, output.ProcessingState)
	if err != nil {
		fmt.Println("error resolving image source", err)
	}
	output.Source = imageSource.Source
	output.Thumbnail = imageSource.Thumbnail

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
