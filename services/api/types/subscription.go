package types

type Subscription struct {
	Plan   SubscriptionPlan  `json:"plan"`
	Status string            `json:"status"`
	Usage  SubscriptionUsage `json:"usage"`
}

type SubscriptionFeature struct {
	Name        string                    `json:"name"`
	Description string                    `json:"description"`
	Flags       []SubscriptionFeatureFlag `json:"flags"`
}

type SubscriptionFeatureFlag struct {
	Description string `json:"description"`
	Key         string `json:"key"`
	Value       string `json:"value"`
	ExceedText  string `json:"exceed_text"`
}

type SubscriptionPlan struct {
	Name     string                `json:"name"`
	Features []SubscriptionFeature `json:"features"`
}

type SubscriptionUsage struct {
	BoardCreateMonthly        SubscriptionUsageItem `json:"board_create_monthly"`
	BoardCreateTotalActive    SubscriptionUsageItem `json:"board_create_total_active"`
	ImageUploadRequestMonthly SubscriptionUsageItem `json:"image_upload_request_monthly"`
}

type SubscriptionUsageItem struct {
	Current string                  `json:"current"`
	Flag    SubscriptionFeatureFlag `json:"flag"`
}
