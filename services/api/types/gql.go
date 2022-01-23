package types

import "time"

type File struct {
	Name        string `json:"name"`
	ContentType string `json:"content_type"`
}

type AppUserGQLOutput struct {
	// common fields
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// required
	Email           string `json:"email"`
	EmailVerified   bool   `json:"email_verified"`
	CognitoId       string `json:"cognito_id"`
	MustAcceptTerms bool   `json:"must_accept_terms"`

	// optional
	StripeCustomerId *string `json:"stripe_customer_id"`
}

type BoardGQLOutput struct {
	// common fields
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// required
	Archived bool `json:"archived"`
	ImageId  int  `json:"image_id"`
}

type CalendarEventGQLOutput struct {
	// common fields
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// required
	Title        string    `json:"title"`
	StartTime    time.Time `json:"start_time"`
	CalendarType string    `json:"calendar_type"`
	Archived     bool      `json:"archived"`

	// optional
	EndTime     *time.Time `json:"end_time"`
	AllDay      *bool      `json:"all_day"`
	Description *string    `json:"description"`
}

type ContactMessageGQLOutput struct {
	// common fields
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// required
	Subject string `json:"subject"`

	// optional
	Body   *string `json:"body"`
	Rating *int    `json:"rating"`
}

type GraphQLResponse struct {
	Data   map[string]interface{}   `json:"data"`
	Errors []map[string]interface{} `json:"errors"`
}

type NoteGQLOutput struct {
	// common fields
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// required
	NoteTypeId int    `json:"note_type_id"`
	Title      string `json:"title"`
	Archived   bool   `json:"archived"`

	// optional
	Body         *string `json:"body,omitempty"`
	SortPosition *int    `json:"sort_position,omitempty"`
}

// NoteTypeGQLOutput provides output for the NoteType object described in schema.graphql
type NoteTypeGQLOutput struct {
	// common fields
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// required
	ProjectId int    `json:"project_id"`
	Name      string `json:"name"`

	// optional
	SortPosition *int `json:"sort_position,omitempty"`
}

type ProjectGQLOutput struct {
	// common fields
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// required
	Name string `json:"name"`

	// optional
	SortPosition *int `json:"sort_position,omitempty"`
}
