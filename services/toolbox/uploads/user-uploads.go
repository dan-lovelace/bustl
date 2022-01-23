package uploads

import (
	"errors"
	"fmt"
	"os"
	"project-oakwood/services/api/types"
	"strings"

	"github.com/google/uuid"
)

type imageUploadKeyDetails struct {
	// Bucket is the S3 bucket name
	Bucket string `json:"bucket"`

	// Extension is the key extension (jpg or png)
	Extension string `json:"extension"`

	// Filename is the file name without extension (1234)
	Filename string `json:"filename"`

	// FilenameFull is the file name with extension (1234.jpg)
	FilenameFull string `json:"filenameFull"`

	// Key is the full S3 object key (pre/private/1234/1234.jpg)
	Key string `json:"key"`

	// State is the processing state (pre or post)
	State string `json:"state"`

	// Username is the Cognito ID in the key
	Username string `json:"username"`

	// Visibility is the intended audience (public or private)
	Visibility string `json:"visibility"`
}

var UploadsBucket = os.Getenv("USER_UPLOADS_BUCKET_NAME")
var ValidExtensions = []string{"jpeg", "jpg", "png"}
var ValidMimes = map[string]string{"image/jpeg": "jpg", "image/png": "png"}

func GetUserUploadPreProcessingKey(username string, filename string) string {
	return fmt.Sprintf("%s/%s/%s/%s", types.PreProcessingState, types.UploadVisibility, username, filename)
}

func GetUserUploadPostProcessingKey(username string, prepend string, filename string) string {
	return fmt.Sprintf("%s/%s/%s/%s%s", types.PostProcessingState, types.UploadVisibility, username, prepend, filename)
}

// ParseUploadKey splits an upload key into parts and returns the named pieces.
func ParseUploadKey(key string) (*imageUploadKeyDetails, error) {
	keyParts := strings.Split(key, "/")

	// split file name
	fileParts := strings.Split(keyParts[3], ".")
	if len(fileParts) != 2 {
		return nil, errors.New("Invalid upload key")
	}

	// validate file name
	_, err := uuid.Parse(fileParts[0])
	if err != nil {
		return nil, errors.New("Invalid upload key")
	}

	// validate file extension
	valid := false
	for _, val := range ValidExtensions {
		if fileParts[1] == val {
			valid = true
		}
	}
	if valid != true {
		return nil, errors.New("Invalid upload key")
	}

	// output vars
	filename := fileParts[0]
	extension := fileParts[1]
	filenameFull := fmt.Sprintf("%s.%s", filename, extension)

	// build return object with details
	ret := imageUploadKeyDetails{
		Bucket:       UploadsBucket,
		Key:          key,
		State:        types.PreProcessingState,
		Visibility:   types.UploadVisibility,
		Username:     keyParts[2],
		Filename:     filename,
		FilenameFull: filenameFull,
		Extension:    extension,
	}

	return &ret, nil
}

// ValidateUploadKey provides authorization support for a given upload key and
// Cognito identity.
func ValidateUploadKey(key string, identity types.LambdaEventContextIdentity) error {
	/*
		Key must match something like:
		pre/private/b3433e12-ff4f-4f22-962c-3cc0b6275db2/db0f989f-af1b-459f-adf3-f23e9f400cc0.jpg
				   |______current user cognito_id_______|
	*/

	// authorize based on directory cognito username
	keyParts := strings.Split(key, "/")
	if len(keyParts) != 4 || keyParts[0] != types.PreProcessingState || keyParts[1] != types.UploadVisibility || keyParts[2] != identity.Username {
		return errors.New("Invalid upload key")
	}

	return nil
}
