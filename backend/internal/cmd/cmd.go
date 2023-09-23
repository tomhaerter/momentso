package main

import (
	"context"
	"database/sql"
	"errors"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"os"

	"github.com/golang-migrate/migrate/v4"
	driverPgx "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/urfave/cli/v2"
	"golang.org/x/crypto/bcrypt"

	"github.com/openmomentso/momentso/pkg/app"
	"github.com/openmomentso/momentso/pkg/database"
	"github.com/openmomentso/momentso/pkg/database/db"
	"github.com/openmomentso/momentso/pkg/database/migrations"
)

func main() {
	log.Logger = log.With().Caller().Logger().Output(zerolog.ConsoleWriter{Out: os.Stderr})

	cliApp := &cli.App{
		Name:  "app",
		Usage: "",
		Commands: []*cli.Command{
			{
				Name: "app:start",
				Action: func(context *cli.Context) error {
					app.StartApp()
					return errors.New("app crashed")
				},
			},
			{
				Name: "migrate:up",
				Action: func(context *cli.Context) error {
					err := migrateUp()
					if err != nil && !errors.Is(err, migrate.ErrNoChange) {
						return err
					}

					return nil
				},
			},
			{
				Name: "migrate:resetAndSeed",
				Action: func(context *cli.Context) error {
					// todo: put safety check here or remove entirely
					dbI := database.NewClient()
					_, err := dbI.Db.Exec(context.Context, "DROP SCHEMA public CASCADE;CREATE SCHEMA public;")
					if err != nil {
						return err
					}

					err = migrateUp()
					if err != nil {
						return err
					}

					return seed(context.Context, dbI)
				},
			},
		},
	}

	if err := cliApp.Run(os.Args); err != nil {
		log.Fatal().Err(err).Msg("failed to run app")
	}
}

func migrateUp() error {
	dbI, err := sql.Open("pgx", "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable")
	if err != nil {
		return err
	}

	dbDriver, err := driverPgx.WithInstance(dbI, &driverPgx.Config{})
	if err != nil {
		return err
	}
	migrationDriver, err := iofs.New(migrations.Migrations, ".")
	if err != nil {
		return err
	}

	m, err := migrate.NewWithInstance(
		"iofs",
		migrationDriver,
		"postgres",
		dbDriver,
	)
	if err != nil {
		return err
	}

	return m.Up()
}
func seed(ctx context.Context, dbI *database.Db) error {
	userTable := []struct {
		Email string
	}{
		{Email: "fred@example.org"},
		{Email: "john@example.org"},
		{Email: "sofia@example.org"},
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("1234"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	for _, s := range userTable {
		_, err = dbI.UserCreate(ctx, db.UserCreateParams{
			Email:    s.Email,
			Password: string(hashedPassword),
		})
		if err != nil {
			return err
		}
	}

	return nil
}
