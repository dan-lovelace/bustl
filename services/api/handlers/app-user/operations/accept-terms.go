package operations

import (
	"context"

	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox"
)

func AcceptTerms(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// get app config so we can get the terms version value
	appConfig, err := toolbox.GetAppConfig()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// update user row with the terms version
	uQuery := psql.Update("app_user")
	uQuery = uQuery.Where("cognito_id = ?", event.Context.Identity.Username)
	uQuery = uQuery.Set("last_terms_accepted", appConfig.TermsVersion)

	// sql and args
	uSql, uArgs, uSqlErr := uQuery.ToSql()
	if uSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: uSqlErr.Error()}
	}

	// execute query
	_, qErr := dbq.Query(ctx, uSql, uArgs...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       "true",
	}
}
