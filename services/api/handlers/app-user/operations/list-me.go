package operations

import (
	"context"
	"encoding/json"
	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
)

func ListMe(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// initialize query
	query := psql.Select("*").From("app_user")

	// filter by current user only
	query = query.Where("cognito_id = ?", event.Context.Identity.Username)

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

	// get user info from cognito
	cognitoRes, err := toolbox.GetCognitoUserByUsername(event.Context.Identity.Username)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// iterate over the user attributes to extract `email` and `email_verified` values
	var email string
	var emailVerified string
	atts := cognitoRes.UserAttributes
	for _, v := range atts {
		if *v.Name == "email" {
			email = *v.Value
		}

		if *v.Name == "email_verified" {
			emailVerified = *v.Value
		}
	}

	// get the first row
	dbUser := rows[0]

	// get user's last terms accepted value
	lastTermsAccepted := dbUser.LastTermsAccepted
	lastTermsAcceptedValue := ""
	if lastTermsAccepted != nil {
		lastTermsAcceptedValue = *lastTermsAccepted
	}

	// get the must_accept_terms return value
	mustAcceptTerms := false
	appConfig, err := toolbox.GetAppConfig()
	if err == nil {
		// ignore errors returned from fetching app config so users aren't spammed to accept terms
		mustAcceptTerms = appConfig.TermsVersion != lastTermsAcceptedValue
	}

	// construct output
	output := types.AppUserGQLOutput{
		Id:               dbUser.Id,
		CreatedAt:        dbUser.CreatedAt,
		UpdatedAt:        dbUser.UpdatedAt,
		CognitoId:        dbUser.CognitoId,
		StripeCustomerId: dbUser.StripeCustomerId,
		Email:            email,
		EmailVerified:    emailVerified == "true",
		MustAcceptTerms:  mustAcceptTerms,
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
