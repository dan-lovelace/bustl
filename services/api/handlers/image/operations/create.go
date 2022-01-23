package operations

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"os"

	"project-oakwood/services/api/handlers/image/lib"
	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox"
	"project-oakwood/services/toolbox/uploads"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
	"github.com/nfnt/resize"
)

type createImageInput struct {
	Key string `json:"key"`
}

type gqlInput struct {
	Input createImageInput `json:"input"`
}

type gqlOutput struct {
	Id int `json:"id"`
}

func Create(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	// convert graphql arguments to input type
	var eventArgs gqlInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)
	fmt.Printf("eventArgs %+v\n", eventArgs)

	// validate the received upload key string using the current identity
	authErr := uploads.ValidateUploadKey(eventArgs.Input.Key, event.Context.Identity)
	if authErr != nil {
		return types.LambdaResponse{StatusCode: 403, Error: authErr.Error()}
	}

	// parse the received upload key
	parsed, err := uploads.ParseUploadKey(eventArgs.Input.Key)
	if err != nil {
		return types.LambdaResponse{StatusCode: 400, Error: err.Error()}
	}

	// make sure the filename does not already exist in the database
	// since the subsequent operations are expensive
	imageFilename := parsed.FilenameFull
	imageQuery := psql.Select("id").From("image").Where("filename = ?", imageFilename)
	imageSql, imageArgs, imageSqlErr := imageQuery.ToSql()
	if imageSqlErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: imageSqlErr.Error()}
	}

	var rows []types.Image
	imageQueryErr := pgxscan.Select(ctx, dbq, &rows, imageSql, imageArgs...)
	if imageQueryErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: imageQueryErr.Error()}
	}

	if len(rows) > 0 {
		return types.LambdaResponse{StatusCode: 400, Error: "Filename already exists"}
	}

	// sniff the uploaded file's content type by inspecting the first 512 bytes
	uploadsBucket := os.Getenv("USER_UPLOADS_BUCKET_NAME")
	fileType, err := toolbox.GetS3ObjectMimeType(uploadsBucket, eventArgs.Input.Key)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// make sure the sniffed type is a valid image type
	_, err = lib.ParseMimeType(fileType)
	if err != nil {
		return types.LambdaResponse{StatusCode: 400, Error: err.Error()}
	}

	// moderate content
	moderationResult := toolbox.ModerateImage(uploadsBucket, eventArgs.Input.Key, "./handlers/image/static/removed_board.jpg")
	if moderationResult != nil {
		return types.LambdaResponse{StatusCode: 400, Error: moderationResult.Error()}
	}

	// download file from s3
	buf, err := toolbox.GetS3Object(uploadsBucket, eventArgs.Input.Key)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// decode file based on content type
	var file image.Image
	switch fileType {
	case "image/jpeg":
		j, err := jpeg.Decode(bytes.NewReader(buf.Bytes()))
		if err != nil {
			fmt.Println("err", err)
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}

		file = j
	case "image/png":
		p, err := png.Decode(bytes.NewReader(buf.Bytes()))
		if err != nil {
			fmt.Println("err", err)
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}

		file = p
	}

	// get large image version configuration
	largeConfig := types.ResizeConfig["large"]
	largeTypeConfig := largeConfig.(map[string]types.ResizeTypeConfig)[fileType]
	largeMaxDimension := uint(largeTypeConfig.MaxDimension)

	// resize large version
	largeImage := resize.Thumbnail(largeMaxDimension, largeMaxDimension, file, resize.Lanczos3)

	// create new image from large version
	var largeBuf bytes.Buffer
	switch fileType {
	case "image/jpeg":
		err := jpeg.Encode(&largeBuf, largeImage, &jpeg.Options{
			Quality: largeTypeConfig.Quality,
		})
		if err != nil {
			fmt.Println("err", err)
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}
	case "image/png":
		err := png.Encode(&largeBuf, largeImage)
		if err != nil {
			fmt.Println("err", err)
			return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
		}
	}

	// create a new object key using the large resize config
	largePrepend := types.LabelConfig["large"]
	newLargeFilename := fmt.Sprintf("%s%s", largePrepend, imageFilename)

	// the resized images go into the post processing directory
	newLargeKey := fmt.Sprintf("%s/%s/%s/%s", types.PostProcessingState, types.UploadVisibility, event.Context.Identity.Username, newLargeFilename)

	// upload large version to s3
	largePut, err := toolbox.PutS3Object(uploadsBucket, newLargeKey, largeBuf.String())
	if err != nil {
		fmt.Println("err", err)
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	fmt.Printf("largePut %+v\n", largePut)

	// construct query to perform db insert, use the pre processing state
	sql := `INSERT INTO image (filename, processing_state, app_user_id)
			VALUES ($1, $2, (SELECT id FROM app_user WHERE cognito_id = $3))
			RETURNING id;`
	var args = []interface{}{imageFilename, types.PreProcessingState, event.Context.Identity.Username}

	// execute query
	var newId int
	qErr := dbq.QueryRow(ctx, sql, args...).Scan(&newId)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}

	// send message to user uploads queue
	queue := os.Getenv("USER_UPLOADS_PROCESSING_QUEUE_URL")
	msg := types.UserUploadSQSMessage{
		Bucket:      uploadsBucket,
		Key:         eventArgs.Input.Key,
		ContentType: fileType,
		ImageId:     newId,
	}
	msgBody, err := json.Marshal(msg)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}
	sErr := toolbox.SendSQSMessage(queue, string(msgBody))
	if sErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// convert output to json and return
	var output = gqlOutput{Id: newId}
	body, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(body),
	}
}
