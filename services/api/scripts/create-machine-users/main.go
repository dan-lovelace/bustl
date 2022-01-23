package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"project-oakwood/services/api/types"
	"project-oakwood/services/toolbox"
)

func createMachineUsers() {
	// get target environment
	args := os.Args
	if len(args) < 2 {
		fmt.Println(("No environment provided"))
		os.Exit(1)
	}
	env := strings.TrimSpace(args[1])

	sysAdminEmail := fmt.Sprintf("dlovelace085+system-admin-%s@gmail.com", env)

	// get the user pool id from SSM
	poolId, err := toolbox.GetSSMParameter(env, "cognito_user_pool_id")
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// get the cognito machine auth client id from SSM
	clientId, err := toolbox.GetSSMParameter(env, "cognito_machine_auth_client_id")
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// set user pool environment variable for GetCognitoUsersByEmail function
	os.Setenv("USER_POOL_ID", poolId)
	os.Setenv("COGNITO_CLIENT_ID", clientId)

	// look up cognito user by email
	emailQuery, err := toolbox.GetCognitoUsersByEmail(sysAdminEmail)
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	users := emailQuery.Users
	if len(users) > 0 {
		// user already exists
		fmt.Println("User already exists, skipping creation")
		os.Exit(0)
	}

	// create a temporary password for the new user
	tempPassword, err := toolbox.GenerateRandomPassword(false)
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// create the user in cognito
	userInsert, err := toolbox.CreateCognitoUser(sysAdminEmail, tempPassword)
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// add the user to the system-admin group
	_, groupErr := toolbox.AddCognitoUserToGroup(*userInsert.User.Username, "system-admin")
	if groupErr != nil {
		fmt.Println("groupErr", groupErr)
		os.Exit(1)
	}

	// get the client secret from secrets manager
	clientSecretId := fmt.Sprintf("oakwood-machine-auth-client-secret-%s", env)
	clientSecret, err := toolbox.GetSecret(clientSecretId)

	// create a secret hash using the cognito machine auth client secret
	hmac := hmac.New(sha256.New, []byte(clientSecret))
	hmac.Write([]byte(sysAdminEmail + clientId))
	secretHash := base64.StdEncoding.EncodeToString(hmac.Sum(nil))

	// log in as the new user
	authInit, err := toolbox.InitiateCognitoAuth(sysAdminEmail, tempPassword, secretHash)
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// create a new password
	newPassword, err := toolbox.GenerateRandomPassword(false)
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// respond to the password update challenge with the new password
	_, challErr := toolbox.RespondToAuthChallenge(sysAdminEmail, newPassword, secretHash, *authInit.Session)
	if challErr != nil {
		fmt.Println("challErr", challErr)
		os.Exit(1)
	}

	// get system-admin credentials secret id from SSM params
	sysAdminSecretId, err := toolbox.GetSSMParameter(env, "system_admin_secret_id")
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// generate json with the user's credentials
	creds := types.CognitoCredentials{
		Email:    sysAdminEmail,
		Password: newPassword,
	}
	credsJson, err := json.Marshal(creds)
	if err != nil {
		fmt.Println("err", err)
		os.Exit(1)
	}

	// add credentials to secrets manager
	_, secretUpdateErr := toolbox.UpdateSecret(sysAdminSecretId, string(credsJson))
	if secretUpdateErr != nil {
		fmt.Println("secretUpdateErr", secretUpdateErr)
		os.Exit(1)
	}
}

func main() {
	createMachineUsers()
}
