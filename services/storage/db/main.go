package db

import (
	"context"
	"fmt"
	"os"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v4"

	"project-oakwood/services/toolbox"
)

var PostgresBuilder = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

var cachedAppUserConfig *pgx.ConnConfig

func GetAppUserConnection(ctx context.Context) (*pgx.Conn, error) {
	config, err := GetAppUserConfig()
	if err != nil {
		return nil, err
	}

	conn, err := GetDBConn(ctx, config)
	if err != nil {
		return nil, err
	}

	return conn, nil
}

func GetAppUserConfig() (*pgx.ConnConfig, error) {
	if cachedAppUserConfig != nil {
		return cachedAppUserConfig, nil
	}

	config, err := GetDBConnConfig(os.Getenv("DB_APPUSER_SECRET_ID"))
	if err != nil {
		return nil, err
	}

	cachedAppUserConfig = config
	return cachedAppUserConfig, nil
}

func GetDBConn(ctx context.Context, config *pgx.ConnConfig) (*pgx.Conn, error) {
	conn, err := pgx.ConnectConfig(ctx, config)
	if err != nil {
		fmt.Println("config err", err)
		return nil, err
	}

	return conn, nil
}

func GetDBConnConfig(secretId string) (*pgx.ConnConfig, error) {
	secret, err := toolbox.GetSecret(secretId)
	if err != nil {
		return nil, err
	}

	config, err := pgx.ParseConfig(secret)
	if err != nil {
		return nil, err
	}

	return config, nil
}
