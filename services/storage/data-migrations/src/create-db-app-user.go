package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"project-oakwood/services/storage/db"
	"project-oakwood/services/toolbox"
)

func createDBUser() (bool, error) {
	ctx := context.Background()

	// get target environment
	var env string
	args := os.Args

	if len(args) > 1 {
		env = strings.TrimSpace(args[1])
	}

	if len(env) == 0 {
		fmt.Println("No environment provided")
		os.Exit(1)
	}

	secretId := fmt.Sprintf("oakwood-db-superuser-%s", env)
	config, err := db.GetDBConnConfig(secretId)
	dbConn, err := db.GetDBConn(ctx, config)
	if err != nil {
		fmt.Println("Error getting db:", err)
		os.Exit(1)
	}
	defer dbConn.Close(ctx)

	query := "select usename from pg_catalog.pg_user;"
	rows, err := dbConn.Query(ctx, query)
	if err != nil {
		fmt.Fprintf(os.Stderr, "QueryRow failed: %v\n", err)
		os.Exit(1)
	}
	defer rows.Close()

	usenames := make(map[string]struct{})

	for rows.Next() {
		var usename string
		err := rows.Scan(&usename)
		if err != nil {
			fmt.Println("err:", err)
			os.Exit(1)
		}

		usenames[usename] = struct{}{}
	}

	if rows.Err() != nil {
		fmt.Fprintf(os.Stderr, "rows Error: %v\n", rows.Err())
		os.Exit(1)
	}

	_, exists := usenames["appuser"]
	if exists == true {
		fmt.Println("User already exists, skipping creation")
		return false, nil
	}

	// create new user
	password, err := toolbox.GenerateRandomPassword(true)
	if err != nil {
		fmt.Println("Error generating password:", err)
		os.Exit(1)
	}

	command := fmt.Sprintf(`
    create user appuser with encrypted password '%s';
    grant select on all tables in schema public to appuser;
    grant select, insert, update, delete on all tables in schema public to appuser;
    grant usage, select on all sequences in schema public to appuser;
  `, password)
	result, err := dbConn.Exec(ctx, command)
	if err != nil {
		fmt.Println("execute error:", err)
		os.Exit(1)
	}
	fmt.Println("exec result:", result)

	// save new connection info to secrets manager using the same protocol, host and db
	superuserSecret, err := toolbox.GetSecret(secretId)

	if err != nil {
		fmt.Printf("Error: %s", err)
		return false, err
	}

	protocol := "postgres://" // this could be better but fine for now
	hostIndex := strings.Index(superuserSecret, "@") + 1
	host := superuserSecret[hostIndex:]

	newSecret := fmt.Sprintf("%sappuser:%s@%s", protocol, password, host)
	update, err := toolbox.UpdateSecret(fmt.Sprintf("oakwood-db-appuser-%s", env), newSecret)
	if err != nil {
		fmt.Println("Error updating newSecret:", err)
		os.Exit(1)
	}

	fmt.Println("update:", update)

	return true, nil
}

func main() {
	createDBUser()
}
