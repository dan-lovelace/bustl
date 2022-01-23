package operations

import (
	"os"

	sq "github.com/Masterminds/squirrel"
)

// change statement placeholders from ? to numbered parameters $1, $2, etc.
var psql = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

var appuserSecret = os.Getenv("DB_APPUSER_SECRET_ID")
