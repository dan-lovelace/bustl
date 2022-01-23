package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
)

type listOneOutput struct {
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Active    bool      `json:"active"`

	AppUserId int  `json:"app_user_id"`
	Archived  bool `json:"archived"`
	ImageId   int  `json:"image_id"`
}

func ListOne(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	type listOneInput struct {
		Id string `json:"id,omitempty"`
	}

	// convert graphql arguments to input type
	var eventArgs listOneInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	// initialize query
	selects := []string{
		"id",
		"created_at",
		"updated_at",
		"active",
		"app_user_id",
		"image_id",
		"archived",
	}
	query := psql.Select(selects...).From("board")

	// filter by active only
	query = query.Where("active = true")

	// count arguments
	argCount := 0

	// filter by gqlArgs
	for key := range gqlArgs {
		if key == "id" {
			query = query.Where(sq.Eq{key: eventArgs.Id})
			argCount += 1
		}
	}

	// filter results by the current user
	cognitoId := event.Context.Identity.Username
	userWhere := fmt.Sprintf("app_user_id = (SELECT id FROM app_user WHERE cognito_id = $%d)", argCount+1)
	query = query.Where(userWhere, cognitoId)
	argCount += 1

	// convert query to SQL and get argument list for parameterization
	sql, args, err := query.ToSql()
	fmt.Println("sql", sql)
	fmt.Println("args", args)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// query db using statement and arguments
	var rows []types.Board
	qErr := pgxscan.Select(ctx, dbq, &rows, sql, args...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// check for zero case
	if len(rows) == 0 {
		return types.LambdaResponse{StatusCode: 200, Data: "null"}
	}

	// convert first row to json and return
	rJson, err := json.Marshal(rows[0])
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// populate shared db fields
	var output listOneOutput
	json.Unmarshal(rJson, &output)

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
