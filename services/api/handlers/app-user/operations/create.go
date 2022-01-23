package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/stripe/stripe-go/v72"

	"project-oakwood/services/api/types"
	"project-oakwood/services/storage/db"
	"project-oakwood/services/toolbox"
	"project-oakwood/services/toolbox/subscription"
	"project-oakwood/services/toolbox/uploads"
)

type createAppUserInput struct {
	CognitoId    string `json:"cognito_id"`
	CognitoGroup string `json:"cognito_group"`
}

type createInput struct {
	Input createAppUserInput `json:"input"`
}

func Create(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs createInput
	gqlArgsJson, err := json.Marshal(event.GQLArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	// requires cognito id
	trimmedCognitoId := strings.TrimSpace(eventArgs.Input.CognitoId)
	if len(trimmedCognitoId) < 1 {
		return types.LambdaResponse{StatusCode: 500, Error: "Requires cognito id"}
	}

	// parse and validate cognito group
	var userGroup string
	switch eventArgs.Input.CognitoGroup {
	case "system_admin":
		userGroup = "system-admin"
	case "system_user":
		userGroup = "system-user"
	}

	if userGroup == "" {
		return types.LambdaResponse{StatusCode: 400, Error: "Invalid cognito group"}
	}

	// lookup cognito user?
	// cognitoUser, err := toolbox.GetCognitoUserByUsername(trimmedCognitoId)
	// if err != nil {
	// 	return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	// }
	// fmt.Printf("cognitoUser %+v\n", cognitoUser)

	// initialize app_user insert statement
	insert := db.PostgresBuilder.Insert("app_user")
	insert = insert.Columns("cognito_id")
	insert = insert.Values(trimmedCognitoId)

	// returning
	returning := []string{
		"id",
		"created_at",
		"updated_at",
		"cognito_id",
		"stripe_customer_id",
	}
	insert = insert.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))

	iSql, iArgs, iSqlErr := insert.ToSql()
	if iSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: iSqlErr.Error()}
	}
	fmt.Println("inserting user")

	// execute query
	rows, qErr := dbq.Query(ctx, iSql, iArgs...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}
	defer rows.Close()

	// check for zero case
	if rows.Next() == false {
		return types.LambdaResponse{StatusCode: 500, Error: "Create failed"}
	}

	var newAppUserId int
	var createdAt time.Time
	var updatedAt time.Time
	var cognitoId string
	var stripeCustomerId *string
	iErr := rows.Scan(&newAppUserId, &createdAt, &updatedAt, &cognitoId, &stripeCustomerId)
	if iErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// close connection for reuse
	rows.Close()

	// add db values to output
	output := types.AppUserGQLOutput{
		Id:               newAppUserId,
		CreatedAt:        createdAt,
		UpdatedAt:        updatedAt,
		CognitoId:        cognitoId,
		StripeCustomerId: stripeCustomerId,
		// TODO: add email?
	}
	fmt.Printf("output %+v\n", output)

	// add user to specified cognito group
	_, groupErr := toolbox.AddCognitoUserToGroup(cognitoId, userGroup)
	if groupErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: groupErr.Error()}
	}
	fmt.Println("adding user to stripe")
	// add user to stripe using cognito_id as an identifier
	customer, err := subscription.CreateCustomer(stripe.CustomerParams{
		Name: stripe.String(cognitoId),
	})
	if err != nil {
		fmt.Println("err", err)
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	fmt.Printf("new customer %+v\n", customer)

	// update app_user record with stripe customer id
	update := db.PostgresBuilder.Update("app_user")
	update = update.Set("stripe_customer_id", customer.ID)
	update = update.Where("id = ?", newAppUserId)

	uSql, uArgs, uSqlErr := update.ToSql()
	if uSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: uSqlErr.Error()}
	}

	_, uErr := dbq.Exec(ctx, uSql, uArgs...)
	if uErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: uErr.Error()}
	}

	// create default project
	projectQuery := psql.Insert("project")
	projectQuery = projectQuery.Columns("app_user_id", "name", "sort_position")
	projectQuery = projectQuery.Values(newAppUserId, "My First Project", 1)
	projectQuery = projectQuery.Suffix("RETURNING id")

	projectSql, projectArgs, err := projectQuery.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	var projectId int
	pErr := dbq.QueryRow(ctx, projectSql, projectArgs...).Scan(&projectId)
	if pErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: pErr.Error()}
	} else if projectId == 0 {
		return types.LambdaResponse{StatusCode: 500, Error: "Failed to create default project"}
	}

	// create default note_type
	noteTypeQuery := psql.Insert("note_type")
	noteTypeQuery = noteTypeQuery.Columns("project_id", "name", "sort_position")
	noteTypeQuery = noteTypeQuery.Values(projectId, "Default List", 1)
	noteTypeQuery = noteTypeQuery.Suffix("RETURNING id")

	noteTypeSql, noteTypeArgs, err := noteTypeQuery.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	var noteTypeId int
	nErr := dbq.QueryRow(ctx, noteTypeSql, noteTypeArgs...).Scan(&noteTypeId)
	if nErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: nErr.Error()}
	} else if noteTypeId == 0 {
		return types.LambdaResponse{StatusCode: 500, Error: "Failed to create default note type"}
	}

	// create default image
	imageName := uuid.New().String()
	imageFilename := fmt.Sprintf("%s.jpg", imageName)
	imagePrepend := types.LabelConfig["large"]
	s3Key := uploads.GetUserUploadPostProcessingKey(trimmedCognitoId, imagePrepend, imageFilename)
	fmt.Println("s3Key", s3Key)

	imageData, err := ioutil.ReadFile("./handlers/app-user/static/default_board.jpg")
	if err != nil {
		fmt.Println("err", err)
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	uBucket := os.Getenv("USER_UPLOADS_BUCKET_NAME")
	_, s3Err := toolbox.PutS3Object(uBucket, s3Key, string(imageData))
	if s3Err != nil {
		fmt.Println("s3Err", s3Err)
		return types.LambdaResponse{StatusCode: 500, Error: s3Err.Error()}
	}

	imageQuery := psql.Insert("image")
	imageQuery = imageQuery.Columns("filename", "processing_state", "app_user_id")
	imageQuery = imageQuery.Values(imageFilename, types.PreProcessingState, newAppUserId)
	imageQuery = imageQuery.Suffix("RETURNING id")

	imageSql, imageArgs, err := imageQuery.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	var imageId int
	imageError := dbq.QueryRow(ctx, imageSql, imageArgs...).Scan(&imageId)
	if imageError != nil {
		return types.LambdaResponse{StatusCode: 500, Error: imageError.Error()}
	} else if imageId == 0 {
		return types.LambdaResponse{StatusCode: 500, Error: "Failed to create default image"}
	}

	// create default board
	boardQuery := psql.Insert("board")
	boardQuery = boardQuery.Columns("image_id", "app_user_id")
	boardQuery = boardQuery.Values(imageId, newAppUserId)
	boardQuery = boardQuery.Suffix("RETURNING id")

	boardSql, boardArgs, err := boardQuery.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	var boardId int
	boardError := dbq.QueryRow(ctx, boardSql, boardArgs...).Scan(&boardId)
	if boardError != nil {
		return types.LambdaResponse{StatusCode: 500, Error: boardError.Error()}
	} else if boardId == 0 {
		return types.LambdaResponse{StatusCode: 500, Error: "Failed to create default board"}
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
