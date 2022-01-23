package types

var PreProcessingState = "pre"
var PostProcessingState = "post"
var UploadVisibility = "private"

var LabelConfig = map[string]string{
	"small": "sm_",
	"large": "lg_",
}

var ResizeConfig = map[string]interface{}{
	"small": map[string]ResizeTypeConfig{
		"image/jpeg": {
			MaxDimension: 300,
			Quality:      60,
		},
		"image/png": {
			MaxDimension: 300,
		},
	},
	"large": map[string]ResizeTypeConfig{
		"image/jpeg": {
			MaxDimension: 2056,
			Quality:      80,
		},
		"image/png": {
			MaxDimension: 2056,
		},
	},
}
