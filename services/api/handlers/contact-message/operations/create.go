package operations

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox"
)

type createContactMessageInput struct {
	Subject string `json:"subject"`

	Body   *string `json:"body,omitempty"`
	Rating *int    `json:"rating,omitempty"`
}

type createInput struct {
	Input createContactMessageInput `json:"input"`
}

func Create(ctx context.Context, event types.LambdaEvent, dbq *pgx.Conn) types.LambdaResponse {
	fmt.Printf("create event: %+v\n", event)
	var eventArgs createInput
	gqlArgs := event.GQLArgs
	gqlArgsJson, err := json.Marshal(gqlArgs)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	json.Unmarshal(gqlArgsJson, &eventArgs)

	// requires subject
	trimmedSubject := strings.TrimSpace(eventArgs.Input.Subject)
	if len(trimmedSubject) < 1 {
		return types.LambdaResponse{StatusCode: 400, Error: "Requires subject"}
	}

	// get user info from cognito
	cognitoRes, err := toolbox.GetCognitoUserByUsername(event.Context.Identity.Username)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// iterate over the user attributes to extract `email` values
	var userEmail string
	atts := cognitoRes.UserAttributes
	for _, v := range atts {
		if *v.Name == "email" {
			userEmail = *v.Value
		}
	}

	// publish to sns topic
	snsTopicArn := os.Getenv("CONTACT_MESSAGE_TOPIC_ARN")
	snsSubject := fmt.Sprintf("Contact Form Message: %s", eventArgs.Input.Subject)
	ratingString := ""
	if eventArgs.Input.Rating != nil {
		ratingString = strconv.Itoa(*eventArgs.Input.Rating)
	}
	bodyString := ""
	if eventArgs.Input.Body != nil {
		bodyString = *eventArgs.Input.Body
	}
	snsMessage := fmt.Sprintf("From: %s\nRating: %s\n\n%s", userEmail, ratingString, bodyString)
	snsPublishErr := toolbox.PublishToSNSTopic(snsTopicArn, snsSubject, snsMessage)
	if snsPublishErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	// construct sql and args
	contactMessageQuery := psql.Insert("contact_message")
	contactMessageQuery = contactMessageQuery.Columns("app_user_id", "subject", "body", "rating")
	contactMessageQuery = contactMessageQuery.Values(
		// user id
		squirrel.Expr("(SELECT id FROM app_user WHERE cognito_id = ?)", event.Context.Identity.Username),

		// trimmed and validated subject
		trimmedSubject,

		// everything else
		eventArgs.Input.Body,
		eventArgs.Input.Rating,
	)

	// returning
	returning := []string{
		"id",
		"created_at",
		"updated_at",
		"subject",
		"body",
		"rating",
	}
	contactMessageQuery = contactMessageQuery.Suffix(fmt.Sprintf("RETURNING %s", strings.Join(returning, ",")))

	// sql and args
	contactMessageSql, contactMessageArgs, err := contactMessageQuery.ToSql()
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}
	fmt.Println("sql", contactMessageSql)
	fmt.Println("args", contactMessageArgs)

	// execute query
	rows, qErr := dbq.Query(ctx, contactMessageSql, contactMessageArgs...)
	if qErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: qErr.Error()}
	}
	defer rows.Close()
	// check for zero case
	fmt.Println("rows", rows)
	fmt.Printf("rows value %+v\n", rows)
	if rows.Next() == false {
		fmt.Println("rows after", rows)
		fmt.Printf("rows after value %+v\n", rows)
		return types.LambdaResponse{StatusCode: 500, Error: "Create failed"}
	}

	// scan return values into destinations
	var id int
	var createdAt time.Time
	var updatedAt time.Time
	var subject string
	var body *string
	var rating *int
	sErr := rows.Scan(&id, &createdAt, &updatedAt, &subject, &body, &rating)
	if sErr != nil {
		return types.LambdaResponse{StatusCode: 500, Error: sErr.Error()}
	}

	// construct output
	output := types.ContactMessageGQLOutput{
		Id:        id,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
		Subject:   subject,
		Body:      body,
		Rating:    rating,
	}

	// convert to output and return
	outputJson, err := json.Marshal(output)
	if err != nil {
		return types.LambdaResponse{StatusCode: 500, Error: err.Error()}
	}

	return types.LambdaResponse{
		StatusCode: 200,
		Data:       string(outputJson),
	}
}
