package types

type ResizeType struct {
	Config ResizeTypeConfig
}

type ResizeTypeConfig struct {
	MaxDimension int
	Quality      int // jpeg only
}

type UserUploadSQSMessage struct {
	Bucket      string `json:"bucket"`
	Key         string `json:"key"`
	ContentType string `json:"contentType"`
	ImageId     int    `json:"imageId"`
}
