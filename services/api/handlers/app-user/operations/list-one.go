package operations

import (
	"context"
	"encoding/json"
	"project-oakwood/services/api/types"

	sq "github.com/Masterminds/squirrel"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
)

// ListOne retrieves a single app_user given either an `id` or `cognito_id`. It is available to
// system admins only and should not be filtered by the current user's identity.
func ListOne(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// define input structure
	type gqlInput struct {
		Id        *int    `json:"id,omitempty"`
		CognitoId *string `json:"cognito_id,omitempty"`
	}

	// convert graphql arguments to input type
	var eventArgs gqlInput
	gqlArgs := event.GQLArgs
	gqlJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlJson, &eventArgs)

	// check for missing required arguments
	if eventArgs.Id == nil && eventArgs.CognitoId == nil {
		return types.LambdaResponse{StatusCode: 400, Error: "Requires id or cognito_id"}
	}

	// initialize query, add SELECT and FROM
	selects := []string{
		"id",
		"created_at",
		"updated_at",
		"active",
		"username",
		"cognito_id",
		"stripe_customer_id",
	}
	query := psql.Select(selects...).From("app_user")

	// add WHERE operations
	for key := range gqlArgs {
		if key == "id" {
			query = query.Where(sq.Eq{key: eventArgs.Id})
		} else if key == "cognito_id" {
			query = query.Where(sq.Eq{key: eventArgs.CognitoId})
		}
	}

	// convert query to SQL and get argument list for parameterization
	sql, args, err := query.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// query db using statement and arguments
	var rows []types.AppUser
	qErr := pgxscan.Select(ctx, dbq, &rows, sql, args...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}

	// check for zero case
	if len(rows) == 0 {
		return types.LambdaResponse{StatusCode: 200, Data: "null"}
	}

	// convert first row to json and return
	body, err := json.Marshal(rows[0])
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}
}
