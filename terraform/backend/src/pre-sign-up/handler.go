package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(event events.CognitoEventUserPoolsPreSignup) (events.CognitoEventUserPoolsPreSignup, error) {
	fmt.Printf("PreSignup of user: %s\n", event.UserName)
	fmt.Printf("event %+v\n", event)
	// automatically confirm the user to allow sign in
	event.Response.AutoConfirmUser = true
	// return event, nil

	// get the terraform workspace
	env := os.Getenv("TERRAFORM_WORKSPACE")

	// get system admin user credentials
	secretId := fmt.Sprintf("oakwood-system-admin-%s", env)
	secretValue, err := toolbox.GetSecret(secretId)
	if err != nil {
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// get the user pool id from SSM
	poolId, err := toolbox.GetSSMParameter(env, "cognito_user_pool_id")
	if err != nil {
		fmt.Println("err", err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// get the cognito machine auth client id from SSM
	clientId, err := toolbox.GetSSMParameter(env, "cognito_machine_auth_client_id")
	if err != nil {
		fmt.Println("err", err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// set user pool environment variable for GetCognitoUsersByEmail function
	os.Setenv("USER_POOL_ID", poolId)
	os.Setenv("COGNITO_CLIENT_ID", clientId)

	var creds types.CognitoCredentials
	umErr := json.Unmarshal([]byte(secretValue), &creds)
	if umErr != nil {
		return events.CognitoEventUserPoolsPreSignup{}, umErr
	}

	// get the client secret from secrets manager
	clientSecretId := fmt.Sprintf("oakwood-machine-auth-client-secret-%s", env)
	clientSecret, err := toolbox.GetSecret(clientSecretId)
	if err != nil {
		fmt.Println("err", err)
		return events.CognitoEventUserPoolsPreSignup{}, umErr
	}

	// testing this, replace with creds.Email
	// sysAdminEmail := fmt.Sprintf("dlovelace085+system-admin-%s@gmail.com", env)
	sysAdminEmail := creds.Email

	// look up cognito user by email
	emailQuery, err := toolbox.GetCognitoUsersByEmail(sysAdminEmail)
	if err != nil {
		fmt.Println("err", err)
		return events.CognitoEventUserPoolsPreSignup{}, umErr
	}

	users := emailQuery.Users
	if len(users) < 1 {
		return events.CognitoEventUserPoolsPreSignup{}, errors.New("User doesn't exist")
	}

	sysAdminUser := users[0]
	fmt.Printf("sysAdminUser %+v\n", sysAdminUser)

	// create a secret hash using the cognito machine auth client secret
	hmac := hmac.New(sha256.New, []byte(clientSecret))
	hmac.Write([]byte(sysAdminEmail + clientId))
	secretHash := base64.StdEncoding.EncodeToString(hmac.Sum(nil))

	authInit, err := toolbox.InitiateCognitoAuth(sysAdminEmail, creds.Password, secretHash)
	if err != nil {
		fmt.Println("err", err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}
	fmt.Println("authInit", authInit)

	api, err := toolbox.GetGraphqlApi(env)
	if err != nil {
		fmt.Println("err", err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}
	graphqlUrl := *api.Uris["GRAPHQL"]
	fmt.Println("graphqlUrl", graphqlUrl)

	jsonData := map[string]string{
		"query": fmt.Sprintf(`
			mutation CreateAppUser {
				createAppUser(input: { cognito_group: system_user, cognito_id: "%s" }) {
					id
				}
			}
		`, event.UserName),
	}
	jsonValue, err := json.Marshal(jsonData)
	if err != nil {
		return events.CognitoEventUserPoolsPreSignup{}, err
	}
	fmt.Println("jsonValue", jsonValue)

	req, err := http.NewRequest("POST", graphqlUrl, bytes.NewBuffer(jsonValue))
	if err != nil {
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", *authInit.AuthenticationResult.IdToken)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return events.CognitoEventUserPoolsPreSignup{}, err
	}
	defer res.Body.Close()

	fmt.Printf("res %+v\n", res)

	// res, err := http.Post(graphqlUrl, "application/json", bytes.NewBuffer(jsonValue))
	// if err != nil {
	// 	return events.CognitoEventUserPoolsPreSignup{}, err
	// }
	// defer res.Body.Close()

	if res.StatusCode != 200 {
		return events.CognitoEventUserPoolsPreSignup{}, errors.New("User create failed")
	}

	data, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return events.CognitoEventUserPoolsPreSignup{}, err
	}
	fmt.Println("data", data)

	dataString := string(data)
	fmt.Println("dataString", dataString)

	var appsyncResponse types.GraphQLResponse
	resErr := json.Unmarshal([]byte(dataString), &appsyncResponse)
	if resErr != nil {
		return events.CognitoEventUserPoolsPreSignup{}, resErr
	}

	if len(appsyncResponse.Errors) > 0 {
		fmt.Println("dataString", dataString)
		return events.CognitoEventUserPoolsPreSignup{}, errors.New("GraphQL error")
	}

	// TODO: use event username as cognito_id for app_user insert

	return event, nil
}

func main() {
	lambda.Start(handler)
}

// google federated signup event
// {
// 	CognitoEventUserPoolsHeader:{
// 		Version:1
// 		TriggerSource:PreSignUp_ExternalProvider
// 		Region:us-east-2
// 		UserPoolID:us-east-2_qqqbKfYSl
// 		CallerContext:{
// 			AWSSDKVersion:aws-sdk-unknown-unknown
// 			ClientID:u7p0v4hjg6oqrk7l04qgjeo93
// 		}
// 		UserName:Google_102224196471225759026
// 	}
// 	Request:{
// 		UserAttributes:map[
// 			cognito:email_alias:
// 			cognito:phone_number_alias:
//			email:dlovelace085@gmail.com
// 			email_verified:false
// 		]
// 		ValidationData:map[]
// 		ClientMetadata:map[]
// 	}
// 	Response:{
// 		AutoConfirmUser:false
// 		AutoVerifyEmail:false
// 		AutoVerifyPhone:false
// 	}
// }

// non-federated signup event
// {
// 	CognitoEventUserPoolsHeader:{
// 		Version:1
// 		TriggerSource:PreSignUp_SignUp
// 		Region:us-east-2
// 		UserPoolID:us-east-2_qqqbKfYSl
// 		CallerContext:{
// 			AWSSDKVersion:aws-sdk-unknown-unknown
// 			ClientID:u7p0v4hjg6oqrk7l04qgjeo93
// 		}
// 		UserName:7e69388d-cb26-4cfc-9645-0097163da2f8
// 	}
// 	Request:{
// 		UserAttributes:map[
// 			email:dlovelace085+34565105@gmail.com
// 		]
// 		ValidationData:map[]
// 		ClientMetadata:map[]
// 	}
// 	Response:{
// 		AutoConfirmUser:false
// 		AutoVerifyEmail:false
// 		AutoVerifyPhone:false
// 	}
// }
