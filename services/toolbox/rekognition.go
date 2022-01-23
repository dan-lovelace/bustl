package toolbox

import (
	"fmt"
	"io/ioutil"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/rekognition"
)

// ModerateImage runs a check against a given S3 object to see if it contains explicit
// content. It uses AWS Rekognition to generate labels and uses its results to see if
// it contains specific content we need to clean up. If found, it will first delete the
// current S3 object then upload a placeholder image explaining to the user why their
// image was deleted.
func ModerateImage(bucket string, key string, replacementPath string) error {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	if err != nil {
		return err
	}

	input := &rekognition.DetectModerationLabelsInput{
		Image: &rekognition.Image{
			S3Object: &rekognition.S3Object{
				Bucket: aws.String(bucket),
				Name:   aws.String(key),
			},
		},
		MinConfidence: aws.Float64(0.51),
	}

	svc := rekognition.New(sess)
	modRes, err := svc.DetectModerationLabels(input)
	if err != nil {
		return err
	}
	fmt.Println("modRes", modRes)
	parentNameBlockList := []string{
		"Explicit Nudity",
	}

	for _, label := range modRes.ModerationLabels {
		for _, blockItem := range parentNameBlockList {
			if *label.ParentName == blockItem {
				fmt.Println("found blocked item", blockItem)
				err := DeleteS3Object(bucket, key)
				if err != nil {
					fmt.Println("Failed to delete blocked image", err)
					return fmt.Errorf("Error deleting moderated S3 object")
				}

				imageData, err := ioutil.ReadFile(replacementPath)
				if err != nil {
					return err
				}

				_, s3Err := PutS3Object(bucket, key, string(imageData))
				if s3Err != nil {
					return s3Err
				}
				fmt.Println("done replacing image")
			}
		}
	}
	return nil
}
