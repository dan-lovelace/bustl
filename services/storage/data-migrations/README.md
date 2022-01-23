# storage

Output: `out.zip`

Contains packages that perform administrative, root-level database operations.

**Features**

- Local database migrations
- Remote database migrations (starting the migrations CodeBuild project on a database inside an AWS VPC)
- Creating new database users with restricted privileges

### Local Migrations

Local migrations are run solely to test new migrations before pushing them to a remote environment.

**Requirements**

- `go-lang/migrate`'s CLI utility - https://github.com/golang-migrate/migrate#cli-usage
- A postgres instance running locally on port 5432
- An empty database named `oakwood`

**Steps**

Build your local connection string using the format: `postgres://<username>:<password>@localhost:5432/oakwood`

Then, from the `services/storage` directory:

- New migration
```
DB_CONNECTION_STRING=<my_connection_string> make newmigration name=my_new_migration
```
- Migrate UP
```
DB_CONNECTION_STRING=<my_connection_string> make migrateup
```
- Migrate DOWN with optional `count` parameter (also works for `migrateup`)
```
DB_CONNECTION_STRING=<my_connection_string> make migratedown count=1
```

**Tips**

- My personal connection is `psql -h localhost -d oakwood -U postgres` then the normal password. Use this to create a connection string, escape any special characters.
- It is not advised to `export` your connection string because you'll likely forget to `unset` it later, leaving your local database credentials vulnerable

### Deploying

Running the deploy command will package the necessary source files into a compressed `out.zip` file and upload it to S3. AWS CodeBuild will use its contents when running builds to perform the actions in `buildspec.yml`.

**Requirements**

- Environment variable `TERRAFORM_WORKSPACE` set to something like `development`

**Steps**

```sh
export TERRAFORM_WORKSPACE=development
make deploy
```

### Remote Migrations

After deploying a new build, it needs to be started before migrations will actually be run. Refer to the file `buildspec.yml` to see exactly what commands are executed.

**Requirements**

- You've tested any new migrations locally and verified everything is working as you like
- You've run `make deploy` with the target `TERRAFORM_WORKSPACE` environment variable

**Steps**

```sh
export TERRAFORM_WORKSPACE=development
export VPC_REGION=us-east-2
make migrateremote
```
