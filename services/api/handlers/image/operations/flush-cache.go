package operations

import (
	"context"

	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox"
)

func FlushCache(ctx context.Context, event types.LambdaEvent) types.LambdaResponse {
	err := toolbox.FlushAll()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{StatusCode: 200, Data: "true"}
}
