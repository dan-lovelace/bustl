package types

type CognitoCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LambdaEventContextIdentity struct {
	Username string `json:"username"`
	Email    string `json:"email"`
}

type LambdaEventContext struct {
	Identity LambdaEventContextIdentity `json:"identity"`
}

type LambdaEvent struct {
	Context   LambdaEventContext     `json:"context"`
	Operation string                 `json:"operation"`
	GQLArgs   map[string]interface{} `json:"gqlArgs"`
}

type LambdaResponse struct {
	StatusCode int    `json:"statusCode"`
	Data       string `json:"data,omitempty"`
	Error      string `json:"error,omitempty"`
}

type S3Bucket struct {
	Name string `json:"name"`
}

type S3BucketObject struct {
	Key  string `json:"key"`
	Size int    `json:"size"`
}

type S3LambdaEvent struct {
	Records []S3LambdaEventRecord `json:"Records"`
}

type S3LambdaEventRecord struct {
	EventName string                  `json:"eventName"`
	S3        S3LambdaEventRecordType `json:"s3"`
}

type S3LambdaEventRecordType struct {
	Bucket S3Bucket       `json:"bucket"`
	Object S3BucketObject `json:"object"`
}

type SQSLambdaEvent struct {
	Records []SQSLambdaEventRecord `json:"Records"`
}

type SQSLambdaEventRecord struct {
	AwsRegion     string `json:"awsRegion"`
	Body          string `json:"body"`
	MessageId     string `json:"messageId"`
	ReceiptHandle string `json:"receiptHandle"`
}
