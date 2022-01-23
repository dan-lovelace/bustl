package subscription

import (
	"context"
	"fmt"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
)

func GetFeatureFlag(plan types.SubscriptionPlan, featureName string, featureFlagKey string) types.SubscriptionFeatureFlag {
	var feature *types.SubscriptionFeature
	for _, f := range plan.Features {
		if f.Name == featureName {
			feature = &f
			break
		}
	}

	if feature == nil {
		return types.SubscriptionFeatureFlag{}
	}

	var featureFlag types.SubscriptionFeatureFlag
	for _, ff := range feature.Flags {
		if ff.Key == featureFlagKey {
			featureFlag = ff
		}
	}

	return featureFlag
}

func GetUsageData(ctx context.Context, dbq *pgx.Conn, pq sq.StatementBuilderType, cognitoId string, plan types.SubscriptionPlan) types.SubscriptionUsage {
	// month cutoff
	cutoff := time.Now().AddDate(0, 0, -30)

	// board create monthly
	bcm := pq.Select("COUNT(*)").From("subscription_event")
	bcm = bcm.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = $1)", cognitoId)
	bcm = bcm.Where("event_type = 'board_create'")
	bcm = bcm.Where("created_at > $2", cutoff)

	bcmSql, bcmArgs, _ := bcm.ToSql()
	var bcmCurrent int
	bcmErr := dbq.QueryRow(ctx, bcmSql, bcmArgs...).Scan(&bcmCurrent)
	if bcmErr != nil {
		fmt.Println("bcmErr", bcmErr)
	}
	fmt.Printf("bcmCurrent %+v\n", bcmCurrent)

	boardCreateMonthlyFlag := GetFeatureFlag(plan, "board-create", "30-day-create-limit")
	boardCreateMonthly := types.SubscriptionUsageItem{
		Current: fmt.Sprint(bcmCurrent),
		Flag:    boardCreateMonthlyFlag,
	}

	// board total active
	bta := pq.Select("COUNT(*)").From("board")
	bta = bta.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = $1)", cognitoId)
	bta = bta.Where("active = true")

	btaSql, btqArgs, _ := bta.ToSql()
	var btaCurrent int
	btaErr := dbq.QueryRow(ctx, btaSql, btqArgs...).Scan(&btaCurrent)
	if btaErr != nil {
		fmt.Println("btaErr", btaErr)
	}
	fmt.Printf("btaCurrent %+v\n", btaCurrent)

	boardCreateTotalActiveFlag := GetFeatureFlag(plan, "board-create", "total-active-limit")
	boardCreateTotalActive := types.SubscriptionUsageItem{
		Current: fmt.Sprint(btaCurrent),
		Flag:    boardCreateTotalActiveFlag,
	}

	// upload requests monthly
	urm := pq.Select("COUNT(*)").From("subscription_event")
	urm = urm.Where("app_user_id = (SELECT id FROM app_user WHERE cognito_id = $1)", cognitoId)
	urm = urm.Where("event_type = 'image_upload_request'")
	urm = urm.Where("created_at > $2", cutoff)

	urmSql, bcmArgs, _ := urm.ToSql()
	var urmCurrent int
	urmErr := dbq.QueryRow(ctx, urmSql, bcmArgs...).Scan(&urmCurrent)
	if urmErr != nil {
		fmt.Println("urmErr", urmErr)
	}
	fmt.Printf("urmCurrent %+v\n", urmCurrent)

	imageUploadRequestMonthlyFlag := GetFeatureFlag(plan, "image-upload", "30-day-request-limit")
	imageUploadRequestMonthly := types.SubscriptionUsageItem{
		Current: fmt.Sprint(urmCurrent),
		Flag:    imageUploadRequestMonthlyFlag,
	}

	return types.SubscriptionUsage{
		BoardCreateMonthly:        boardCreateMonthly,
		BoardCreateTotalActive:    boardCreateTotalActive,
		ImageUploadRequestMonthly: imageUploadRequestMonthly,
	}
}
