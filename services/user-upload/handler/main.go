package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/nfnt/resize"

	"project-oakwood/services/api/types"
	"project-oakwood/services/storage/db"
	"project-oakwood/services/toolbox"
	"project-oakwood/services/toolbox/uploads"
)

func Handler(ctx context.Context, event interface{}) (types.LambdaResponse, error) {
	fmt.Printf("ctx %+v\n", ctx)
	fmt.Printf("event %+v\n", event)

	// get sqs event
	eventJson, err := json.Marshal(event)
	if err != nil {
		fmt.Println("err", err)
		return types.LambdaResponse{}, err
	}
	fmt.Printf("eventJson %+v\n", eventJson)

	var sqsEvent types.SQSLambdaEvent
	json.Unmarshal(eventJson, &sqsEvent)
	fmt.Printf("sqsEvent %+v\n", sqsEvent)

	// get first event record
	record := sqsEvent.Records[0]
	fmt.Printf("record %+v\n", record)

	// get message body (bucket, key, content-type, etc.)
	var msgBody types.UserUploadSQSMessage
	err = json.Unmarshal([]byte(record.Body), &msgBody)
	if err != nil {
		fmt.Println("err", err)
		return types.LambdaResponse{}, err
	}
	fmt.Printf("msgBody %+v\n", msgBody)

	// download file from s3
	buf, err := toolbox.GetS3Object(msgBody.Bucket, msgBody.Key)
	if err != nil {
		return types.LambdaResponse{}, err
	}

	// decode file based on content type
	var file image.Image
	switch msgBody.ContentType {
	case "image/jpeg":
		j, err := jpeg.Decode(bytes.NewReader(buf.Bytes()))
		if err != nil {
			fmt.Println("err", err)
			return types.LambdaResponse{}, err
		}

		file = j
	case "image/png":
		p, err := png.Decode(bytes.NewReader(buf.Bytes()))
		if err != nil {
			fmt.Println("err", err)
			return types.LambdaResponse{}, err
		}

		file = p
	}

	uBucket := os.Getenv("USER_UPLOADS_BUCKET_NAME")
	uploadKey, err := uploads.ParseUploadKey(msgBody.Key)
	if err != nil {
		return types.LambdaResponse{}, err
	}

	// get small version configuration
	smallConfig := types.ResizeConfig["small"]
	smallTypeConfig := smallConfig.(map[string]types.ResizeTypeConfig)[msgBody.ContentType]
	smallMaxDimension := uint(smallTypeConfig.MaxDimension)

	// resize small version
	smallImage := resize.Thumbnail(smallMaxDimension, smallMaxDimension, file, resize.Lanczos3)

	// create new image from small version
	var smallBuf bytes.Buffer
	switch msgBody.ContentType {
	case "image/jpeg":
		err := jpeg.Encode(&smallBuf, smallImage, &jpeg.Options{
			Quality: smallTypeConfig.Quality,
		})
		if err != nil {
			fmt.Println("err", err)
			return types.LambdaResponse{}, err
		}
	case "image/png":
		err := png.Encode(&smallBuf, smallImage)
		if err != nil {
			fmt.Println("err", err)
			return types.LambdaResponse{}, err
		}
	}
	fmt.Println("smallBuf len", smallBuf.Len())

	// create a new object key using the small resize config
	smallPrepend := types.LabelConfig["small"]
	newSmallFilename := fmt.Sprintf("%s%s", smallPrepend, uploadKey.FilenameFull)
	newSmallKey := fmt.Sprintf("%s/%s/%s/%s", types.PostProcessingState, types.UploadVisibility, uploadKey.Username, newSmallFilename)

	// upload small version to s3
	smallPut, err := toolbox.PutS3Object(uBucket, newSmallKey, smallBuf.String())
	if err != nil {
		fmt.Println("err", err)
		return types.LambdaResponse{}, err
	}
	fmt.Printf("smallPut %+v\n", smallPut)

	// TODO: update image db state from pre to post (appsync?)
	sql := `UPDATE image
			SET processing_state = $1
			WHERE id = $2`
	args := []interface{}{types.PostProcessingState, msgBody.ImageId}
	dbq, err := db.GetAppUserConnection(ctx)
	if err != nil {
		return types.LambdaResponse{}, err
	}
	defer dbq.Close(ctx)

	res, err := dbq.Exec(ctx, sql, args...)
	if err != nil {
		return types.LambdaResponse{}, err
	}
	fmt.Println("res", res)

	// TODO: set up DLQ for errors that occur in this function

	return types.LambdaResponse{StatusCode: 200, Data: "success"}, nil
}

func main() {
	lambda.Start(Handler)
}

// map[
//     Records:[
//         map[
//             attributes:map[
//                 ApproximateFirstReceiveTimestamp:1611980309190
//                 ApproximateReceiveCount:3
//                 SenderId:AROA5CYIIHSXXTBJSV6NO:appsync-development-image
//                 SentTimestamp:1611980309184
//             ]
//             awsRegion:us-east-2
//             body:pre/private/592015cc-c246-4c19-a43d-6ababaddb554/50a2cbf1-ec50-458d-83b9-4a896ead415f.jpg
//             eventSource:aws:sqs
//             eventSourceARN:arn:aws:sqs:us-east-2:899276094639:oakwood-user-uploads-processing-development
//             md5OfBody:06354623c08cad963cdf2d754a0dfcbc
//             messageAttributes:map[]
//             messageId:e33f38a1-5f86-4d61-b33f-e5db7d6b6eea
//             receiptHandle:AQEBHIhbVCt9E12kaAVJHEbOBULT/dCjIVNBgGARwoLaayTQ/ZTLP6fpW6JhAcBtSeL/+DNVmJTL3wf2w+CA98ycuqXgNKdZokzD9cFFKePP7BRW+oZVpkHDrHN65OAwa1qiC2enQVeQ8BO/e7NqPsQzMY9tMFWMmIoS9vAhyivWUEP/RXDnrb3qUx/5pkPWv8sVgT8JttNZP1Zynin500q15sJcrCq2zJImxaR5VJp1miu4Ooatqe9HPtpbPm5fiZAIFoKL5bt36qDU6V45vl+D+F49RNmYnSHF8nb4fv3nzrLTNWqUnmmLEG8wZbYuTSDt/DCWzjW4CH8ovbfXzF8jr/szYr2lZfiri3KU68CJfJAQSp8C2mDQZLk8dO7Mto+399prVr3SItIOy2BJaFBFMH46tso4itb8sIKc7hYcQbqwzQolItwDhF/3VLrPpJSI
//         ]
//     ]
// ]
