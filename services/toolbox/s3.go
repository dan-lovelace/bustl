package toolbox

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/minio/minio-go"
	"github.com/minio/minio-go/pkg/credentials"
	// "project-oakwood/services/toolbox/subscription"
)

type PostS3ObjectRequestInput struct {
	ContentType     *string
	DurationMinutes *int32
	FileSizeMaxMb   *int
}

// DeleteS3Object removes a file from S3.
func DeleteS3Object(bucket string, key string) error {
	fmt.Println("deleting s3 key", bucket, key)
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return err
	}

	svc := s3.New(sess)
	_, deleteErr := svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})

	if deleteErr != nil {
		return deleteErr
	}

	return nil
}

// GetS3Object downloads an S3 object and returns a reader.
func GetS3Object(bucket string, key string) (*aws.WriteAtBuffer, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return nil, err
	}

	downloader := s3manager.NewDownloader(sess)
	buff := &aws.WriteAtBuffer{}
	input := &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}
	fmt.Printf("input %+v\n", input)
	numBytes, err := downloader.Download(buff, input)
	if err != nil {
		return nil, err
	}
	fmt.Println("numBytes", numBytes)

	return buff, nil
}

// GetS3ObjectRequest produces a signed S3 URL for object download.
func GetS3ObjectRequest(bucket string, key string, durationMinutes int32) (string, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2"),
		// Endpoint: aws.String("dev-uploads.bus.tl"), // TODO
	})

	if err != nil {
		return "", err
	}

	svc := s3.New(sess)
	req, _ := svc.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})

	duration := time.Duration(durationMinutes) * time.Minute
	fmt.Println(">>>>>>>>>> SIGNING GET URL")
	str, err := req.Presign(duration)
	if err != nil {
		return "", err
	}
	fmt.Println("str", str)
	return str, nil
}

// GetObjectMimeType downloads the first 512 bytes of an S3 object in attempt to
// sniff its content type. Returns something like "image/jpeg" or "image/png".
func GetS3ObjectMimeType(bucket string, key string) (string, error) {
	// establish s3 session
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)
	if err != nil {
		return "", err
	}
	svc := s3.New(sess)

	// get the first 512 bytes of the s3 object
	bytesToGet := 512
	rangeString := fmt.Sprintf("bytes=0-%d", bytesToGet)
	input := &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Range:  aws.String(rangeString),
	}

	// query s3
	result, err := svc.GetObject(input)
	if err != nil {
		return "", err
	}
	defer result.Body.Close()

	// read result body
	buf := make([]byte, bytesToGet)
	_, err = result.Body.Read(buf)
	if err != nil {
		return "", err
	}

	// get content type and return
	cType := http.DetectContentType(buf)
	return cType, nil
}

// HeadS3Object checks to see if an S3 object exists without actually downloading.
func HeadS3Object(bucket string, key string) (string, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return "", err
	}

	svc := s3.New(sess)
	input := &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}

	result, err := svc.HeadObject(input)
	if err != nil {
		return "", err
	}

	return result.GoString(), nil
}

// PutS3Object places a new object in S3, overwriting anything already there.
func PutS3Object(bucket string, key string, body string) (string, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return "", err
	}

	svc := s3.New(sess)
	input := &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Body:   aws.ReadSeekCloser(strings.NewReader(body)),
	}

	result, err := svc.PutObject(input)
	if err != nil {
		return "", err
	}

	return result.GoString(), nil
}

// PutS3ObjectRequest generates a new presigned S3 URL for PUT requests.
func PutS3ObjectRequest(bucket string, key string, cType string, durationMinutes int32) (string, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return "", err
	}

	svc := s3.New(sess)
	req, _ := svc.PutObjectRequest(&s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		ContentType: aws.String(cType),
	})

	duration := time.Duration(durationMinutes) * time.Minute
	fmt.Println(">>>>>>>>>> SIGNING PUT URL")
	str, err := req.Presign(duration)
	if err != nil {
		return "", err
	}

	return str, nil
}

// PostS3ObjectRequest creates a signed S3 URL for POST requests. It is a lot more
// robust than the PUT request version and should be used when doing things like
// allowing a user-uploaded file.
func PostS3ObjectRequest(bucket string, key string, input PostS3ObjectRequestInput) (string, string, error) {
	if input.ContentType == nil || input.DurationMinutes == nil || input.FileSizeMaxMb == nil {
		return "", "", errors.New("Missing required inputs")
	}

	// initialize a minio client using the environment's aws credential
	creds := credentials.NewEnvAWS()
	client, err := minio.NewWithCredentials("s3.amazonaws.com", creds, true, "us-east-2")
	if err != nil {
		return "", "", err
	}

	// create a new post policy
	policy := minio.NewPostPolicy()

	// basic attributes
	policy.SetBucket(bucket)
	policy.SetKey(key)
	policy.SetContentType(*input.ContentType)

	// set expiry
	expires := time.Now().UTC().Add(time.Duration(*input.DurationMinutes) * time.Minute)
	policy.SetExpires(expires)

	// set file size limit min/max
	fileSizeMin := 1024 // 1 KB
	fileSizeMax := *input.FileSizeMaxMb * (1024 * 1024)
	policy.SetContentLengthRange(int64(fileSizeMin), int64(fileSizeMax))

	// get post url and form data structure
	fmt.Println(">>>>>>>>>> SIGNING POST URL")
	postUrl, formData, err := client.PresignedPostPolicy(policy)
	if err != nil {
		return "", "", err
	}

	// to test local upload
	// fmt.Printf("curl ")
	// for k, v := range formData {
	// 	fmt.Printf("-F %s=%s ", k, v)
	// }
	// fmt.Printf("-F file=@/etc/bash.bashrc ")

	// construct output and return
	url := postUrl.String()
	json, err := json.Marshal(formData)
	if err != nil {
		return "", "", err
	}
	fields := string(json)

	return url, fields, nil
}
