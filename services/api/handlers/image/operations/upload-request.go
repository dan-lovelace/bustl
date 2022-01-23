package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/handlers/image/lib"
	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox"
	"project-oakwood/services/toolbox/subscription"
	"project-oakwood/services/toolbox/uploads"
)

type uploadRequestInput struct {
	File types.File `json:"file"`
}

type uploadRequestOutput struct {
	UploadUrl string `json:"upload_url"`
	FormJson  string `json:"form_json"`
}

func UploadRequest(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs uploadRequestInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)

	// get plan and usage to throttle creates
	plan := subscription.GetPlanData("free") // TODO: get plan from db
	usage := subscription.GetUsageData(ctx, dbq, psql, event.Context.Identity.Username, plan)

	// monthly rate limit
	monthlyCreated, err := strconv.Atoi(usage.ImageUploadRequestMonthly.Current)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	monthlyFlag := usage.ImageUploadRequestMonthly.Flag
	monthlyAllowed, err := strconv.Atoi(monthlyFlag.Value)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	if monthlyCreated >= monthlyAllowed {
		return types.LambdaResponse{StatusCode: 400, Error: monthlyFlag.ExceedText}
	}

	// file size upload limit
	fileSizeFlag := subscription.GetFeatureFlag(plan, "image-upload", "file-size-mb-limit")
	fileSizeMb, err := strconv.Atoi(fileSizeFlag.Value)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// get the extension from the received mime
	extension, err := lib.ParseMimeType(eventArgs.File.ContentType)
	if err != nil {
		return types.LambdaResponse{StatusCode: 400, Error: err.Error()}
	}

	// generate a random filename using the expected extension
	name := uuid.New().String()
	filename := fmt.Sprintf("%s.%s", name, extension)

	// build the new key to store the file in the uploads bucket
	key := uploads.GetUserUploadPreProcessingKey(event.Context.Identity.Username, filename)

	// build a signed POST request
	bucket := os.Getenv("USER_UPLOADS_BUCKET_NAME")
	presignExpiration := int32(5) // expires in 5 minutes
	postRequestInput := toolbox.PostS3ObjectRequestInput{
		ContentType:     &eventArgs.File.ContentType,
		DurationMinutes: &presignExpiration,
		FileSizeMaxMb:   &fileSizeMb,
	}
	url, formJson, err := toolbox.PostS3ObjectRequest(bucket, key, postRequestInput)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// create subscription event
	eSql := `INSERT INTO subscription_event (event_type, app_user_id)
			 VALUES ('image_upload_request', (SELECT id FROM app_user WHERE cognito_id = $1))
			 RETURNING id;`
	eArgs := []interface{}{event.Context.Identity.Username}
	var eventId int
	eErr := dbq.QueryRow(ctx, eSql, eArgs...).Scan(&eventId)
	if eErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: eErr.Error()}
	}
	fmt.Printf("eventId %+v\n", eventId)

	// construct output
	output := uploadRequestOutput{
		UploadUrl: url,
		FormJson:  formJson,
	}

	// convert body to json and respond
	body, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{StatusCode: 200, Data: string(body)}
}
