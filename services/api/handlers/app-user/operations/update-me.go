package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
	"project-oakwood/services/storage/db"
	"project-oakwood/services/toolbox"
)

type updateMeInput struct {
	Email *string `json:"email,omitempty"`
}

type updateMeGQLInput struct {
	Input updateMeInput `json:"input"`
}

func UpdateMe(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs updateMeGQLInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	// make sure at least one update field is provided
	if eventArgs.Input.Email == nil {
		return types.LambdaResponse{StatusCode: 400, Error: "At least one update field is required"}
	}

	// trim and validate address
	trimmedEmail := strings.TrimSpace(*eventArgs.Input.Email)
	if len(trimmedEmail) < 1 {
		return types.LambdaResponse{StatusCode: 400, Error: "Email too short"}
	}

	// get current address info from cognito
	test, err := toolbox.GetCognitoUserByUsername(event.Context.Identity.Username)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// iterate over the user attributes to extract `email` and `email_verified` values
	var currentEmail string
	var currentEmailVerified string
	atts := test.UserAttributes
	for _, v := range atts {
		if *v.Name == "email" {
			currentEmail = *v.Value
		}

		if *v.Name == "email_verified" {
			currentEmailVerified = *v.Value
		}
	}
	fmt.Println("currentEmail", currentEmail)

	// set return values to current
	email := currentEmail
	emailVerified := currentEmailVerified == "true"

	if trimmedEmail != currentEmail {
		fmt.Println("email different")
		// email is requesting to be changed, send update to cognito
		res, err := toolbox.UpdateCognitoUserEmail(event.Context.Identity.Username, trimmedEmail)
		if err != nil {
			// always print this error to logs
			fmt.Println("error changing email", err)

			// do not return the cognito error here since it is potentially sensitive
			return types.LambdaResponse{StatusCode: 500, Error: "Update failed"}
		}
		fmt.Println("res", res)

		// update return values
		email = trimmedEmail
		emailVerified = false
	}

	// query db for return value
	uQuery := db.PostgresBuilder.Select("*").From("app_user")
	uQuery = uQuery.Where("cognito_id = ?", event.Context.Identity.Username)

	// sql and args
	uSql, uArgs, uSqlErr := uQuery.ToSql()
	if uSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: uSqlErr.Error()}
	}

	// execute query
	var rows []types.AppUser
	qErr := pgxscan.Select(ctx, dbq, &rows, uSql, uArgs...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}

	// check for zero case
	if len(rows) == 0 {
		return types.LambdaResponse{StatusCode: 500, Error: "Update failed"}
	}

	dbUser := rows[0]
	output := types.AppUserGQLOutput{
		Id:               dbUser.Id,
		CreatedAt:        dbUser.CreatedAt,
		UpdatedAt:        dbUser.UpdatedAt,
		CognitoId:        dbUser.CognitoId,
		StripeCustomerId: dbUser.StripeCustomerId,
		Email:            email,
		EmailVerified:    emailVerified,
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
