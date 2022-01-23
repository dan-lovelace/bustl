package types

import (
	"time"
)

// database structs
type AppUser struct {
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Active    bool      `json:"active"`

	// not nullable
	CognitoId          string `json:"cognito_id" db:"cognito_id"`
	SubscriptionStatus string `json:"subscription_status" db:"subscription_status"`
	SubscriptionPlan   string `json:"subscription_plan" db:"subscription_plan"`

	// nullable
	StripeCustomerId  *string `json:"stripe_customer_id" db:"stripe_customer_id"`
	LastTermsAccepted *string `json:"last_terms_accepted" db:"last_terms_accepted"`
}

type Board struct {
	Id        int       `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Active    bool      `json:"active"`

	AppUserId int  `json:"app_user_id" db:"app_user_id"`
	Archived  bool `json:"archived" db:"archived"`
	ImageId   int  `json:"image_id" db:"image_id"`
}

type BoardMarker struct {
	Id        int       `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Active    bool      `json:"active" db:"active"`

	BoardId    int    `json:"board_id" db:"board_id"`
	MarkerType string `json:"marker_type" db:"marker_type"`
	XPosition  int    `json:"x_position" db:"x_position"`
	YPosition  int    `json:"y_position" db:"y_position"`
	Hidden     bool   `json:"hidden" db:"hidden"`

	NoteId          *int `json:"note_id" db:"note_id"`
	CalendarEventId *int `json:"calendar_event_id" db:"calendar_event_id"`
	SortPosition    *int `json:"sort_position" db:"sort_position"`
}

type CalendarEvent struct {
	Id        int       `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Active    bool      `json:"active" db:"active"`

	AppUserId    int       `json:"app_user_id" db:"app_user_id"`
	Archived     bool      `json:"archived" db:"archived"`
	Title        string    `json:"title" db:"title"`
	StartTime    time.Time `json:"start_time" db:"start_time"`
	CalendarType string    `json:"calendar_type" db:"calendar_type"`

	EndTime     *time.Time `json:"end_time" db:"end_time"`
	AllDay      *bool      `json:"all_day" db:"all_day"`
	Description *string    `json:"description" db:"description"`
}

type ContactMessage struct {
	Id        int       `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`

	AppUserId int    `json:"app_user_id" db:"app_user_id"`
	Subject   string `json:"subject" db:"subject"`

	Body   *string `json:"body" db:"body"`
	Rating *int    `json:"rating" db:"rating"`
}

type Image struct {
	Id        int       `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Active    bool      `json:"active" db:"active"`

	AppUserId       int    `json:"app_user_id" db:"app_user_id"`
	Filename        string `json:"filename" db:"filename"`
	ProcessingState string `json:"processing_state" db:"processing_state"`
}

type Note struct {
	Id        int       `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Active    bool      `json:"active" db:"active"`

	NoteTypeId int    `json:"note_type_id" db:"note_type_id"`
	Archived   bool   `json:"archived" db:"archived"`
	Title      string `json:"title" db:"title"`

	Body         *string `json:"body" db:"body"`
	SortPosition *int    `json:"sort_position" db:"sort_position"`
}

type NoteType struct {
	Id        int       `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Active    bool      `json:"active" db:"active"`

	ProjectId int    `json:"project_id" db:"project_id"`
	Name      string `json:"name" db:"name"`

	SortPosition *int `json:"sort_position" db:"sort_position"`
}

type Project struct {
	Id        int       `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Active    bool      `json:"active" db:"active"`

	AppUserId int    `json:"app_user_id" db:"app_user_id"`
	Name      string `json:"name" db:"name"`

	SortPosition *int `json:"sort_position" db:"sort_position"`
}

type SubscriptionEvent struct {
	Id        int       `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	Active    bool      `json:"active" db:"active"`

	EventType string `json:"event_type" db:"event_type"`

	AppUserId int `json:"app_user_id" db:"app_user_id"`
}
