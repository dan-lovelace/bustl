package subscription

import "project-oakwood/services/api/types"

var plansData = map[string]types.SubscriptionPlan{
	"free": {
		Name: "free",
		Features: []types.SubscriptionFeature{
			{
				Name: "board-create",
				Flags: []types.SubscriptionFeatureFlag{
					{
						Description: "Number of created boards per 30 days",
						Key:         "30-day-create-limit",
						Value:       "3",
						ExceedText:  "Monthly board create limit exceeded",
					},
					{
						Description: "Total number of active boards",
						Key:         "total-active-limit",
						Value:       "20",
						ExceedText:  "Total active board limit exceeded",
					},
				},
			},
			{
				Name: "image-upload",
				Flags: []types.SubscriptionFeatureFlag{
					{
						Description: "Number of upload requests per 30 days",
						Key:         "30-day-request-limit",
						Value:       "3",
						ExceedText:  "Monthly upload request limit exceeded",
					},
					{
						Description: "Maximum file size before being lossily compressed",
						Key:         "compress-after-mb-limit",
						Value:       "2",
						ExceedText:  "",
					},
					{
						Description: "File upload size limit in MB",
						Key:         "file-size-mb-limit",
						Value:       "10",
						ExceedText:  "",
					},
				},
			},
		},
	},
}

func GetPlanData(name string) types.SubscriptionPlan {
	return plansData[name]
}
