package toolbox

import (
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
)

func AddCognitoUserToGroup(username string, groupName string) (*cognitoidentityprovider.AdminAddUserToGroupOutput, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2"),
	})
	if err != nil {
		return nil, err
	}

	svc := cognitoidentityprovider.New(sess)
	poolId := os.Getenv("USER_POOL_ID")

	// group add input
	input := cognitoidentityprovider.AdminAddUserToGroupInput{
		UserPoolId: &poolId,
		Username:   &username,
		GroupName:  aws.String(groupName),
	}

	// add user to group
	req, err := svc.AdminAddUserToGroup(&input)
	if err != nil {
		fmt.Println("err", err)
		return nil, err
	}

	// return response
	return req, nil
}

func CreateCognitoUser(email string, password string) (*cognitoidentityprovider.AdminCreateUserOutput, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2"),
	})
	if err != nil {
		return nil, err
	}

	svc := cognitoidentityprovider.New(sess)
	poolId := os.Getenv("USER_POOL_ID")

	// username := uuid.New().String()
	var attributes []*cognitoidentityprovider.AttributeType

	// append email attribute
	attributes = append(attributes, &cognitoidentityprovider.AttributeType{
		Name:  aws.String("email"),
		Value: &email,
	})

	// verify email
	attributes = append(attributes, &cognitoidentityprovider.AttributeType{
		Name:  aws.String("email_verified"),
		Value: aws.String("true"),
	})

	// create user input. be careful logging this one..
	input := cognitoidentityprovider.AdminCreateUserInput{
		UserPoolId:        &poolId,
		Username:          &email,
		TemporaryPassword: &password,
		UserAttributes:    attributes,
	}

	// create cognito user
	req, err := svc.AdminCreateUser(&input)
	if err != nil {
		fmt.Println("err", err)
		return nil, err
	}

	// return response
	return req, nil
}

func InitiateCognitoAuth(username string, password string, secretHash string) (*cognitoidentityprovider.AdminInitiateAuthOutput, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2"),
	})
	if err != nil {
		return nil, err
	}

	svc := cognitoidentityprovider.New(sess)
	poolId := os.Getenv("USER_POOL_ID")
	clientId := os.Getenv("COGNITO_CLIENT_ID")

	input := cognitoidentityprovider.AdminInitiateAuthInput{
		UserPoolId: aws.String(poolId),
		ClientId:   aws.String(clientId),
		AuthFlow:   aws.String("ADMIN_NO_SRP_AUTH"),
		AuthParameters: aws.StringMap(map[string]string{
			"USERNAME":    username,
			"PASSWORD":    password,
			"SECRET_HASH": secretHash,
		}),
	}

	req, err := svc.AdminInitiateAuth(&input)
	if err != nil {
		return nil, err
	}

	return req, nil
}

func GetCognitoUsersByEmail(email string) (*cognitoidentityprovider.ListUsersOutput, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2"),
	})
	if err != nil {
		return nil, err
	}

	// initialize a new session
	svc := cognitoidentityprovider.New(sess)

	// get the user pool id from the environment
	poolId := os.Getenv("USER_POOL_ID")

	// create a filter expression with escaped double quotes around the value
	filter := fmt.Sprintf("email = \"%s\"", email)

	// create a list of attributes to return
	var attributesToGet []*string

	// add email as a return value
	emailAtt := "email"
	attributesToGet = append(attributesToGet, &emailAtt)

	// list users input
	input := cognitoidentityprovider.ListUsersInput{
		UserPoolId:      &poolId,
		Filter:          aws.String(filter),
		AttributesToGet: attributesToGet,
	}

	// list cognito users
	req, err := svc.ListUsers(&input)
	if err != nil {
		fmt.Println("err", err)
		return nil, err
	}

	// return response
	return req, nil
}

func GetCognitoUserByUsername(username string) (*cognitoidentityprovider.AdminGetUserOutput, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2"),
	})
	if err != nil {
		return nil, err
	}

	svc := cognitoidentityprovider.New(sess)
	poolId := os.Getenv("USER_POOL_ID")
	input := cognitoidentityprovider.AdminGetUserInput{
		UserPoolId: &poolId,
		Username:   &username,
	}

	req, err := svc.AdminGetUser(&input)
	if err != nil {
		fmt.Println("err", err)
		return nil, err
	}

	return req, nil
}

func RespondToAuthChallenge(username string, password string, secretHash string, authSession string) (*cognitoidentityprovider.AdminRespondToAuthChallengeOutput, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2"),
	})
	if err != nil {
		return nil, err
	}

	svc := cognitoidentityprovider.New(sess)
	poolId := os.Getenv("USER_POOL_ID")
	clientId := os.Getenv("COGNITO_CLIENT_ID")

	input := cognitoidentityprovider.AdminRespondToAuthChallengeInput{
		UserPoolId:    aws.String(poolId),
		ClientId:      aws.String(clientId),
		ChallengeName: aws.String("NEW_PASSWORD_REQUIRED"),
		ChallengeResponses: aws.StringMap(map[string]string{
			"USERNAME":     username,
			"NEW_PASSWORD": password,
			"SECRET_HASH":  secretHash,
		}),
		Session: aws.String(authSession),
	}

	req, err := svc.AdminRespondToAuthChallenge(&input)
	if err != nil {
		return nil, err
	}

	return req, nil
}

func UpdateCognitoUserEmail(username string, email string) (*cognitoidentityprovider.AdminUpdateUserAttributesOutput, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2"),
	})
	if err != nil {
		return nil, err
	}

	svc := cognitoidentityprovider.New(sess)
	poolId := os.Getenv("USER_POOL_ID")
	var attributes []*cognitoidentityprovider.AttributeType
	attributes = append(attributes, &cognitoidentityprovider.AttributeType{
		Name:  aws.String("email"),
		Value: aws.String(email),
	})
	input := cognitoidentityprovider.AdminUpdateUserAttributesInput{
		UserPoolId:     &poolId,
		Username:       &username,
		UserAttributes: attributes,
	}

	req, err := svc.AdminUpdateUserAttributes(&input)
	if err != nil {
		fmt.Println("err", err)
		return nil, err
	}

	return req, nil
}
