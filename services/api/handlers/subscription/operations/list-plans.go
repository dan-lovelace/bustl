package operations

import (
	"context"
	"project-oakwood/services/api/types"
	"time"
)

type listPlansInput struct {
	Id int `json:"id,omitempty"`
}

type listPlansOutput struct {
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Active    bool      `json:"active"`

	Filename        string `json:"filename"`
	ProcessingState string `json:"processing_state"`
	Src             string `json:"src"`
}

func ListPlans(ctx context.Context, event types.LambdaEvent) types.LambdaResponse {
	return types.LambdaResponse{StatusCode: 200, Data: "null"}
}
