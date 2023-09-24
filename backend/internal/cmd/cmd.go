package main

import (
	"context"
	"database/sql"
	"errors"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"time"

	"github.com/caarlos0/env/v9"
	"github.com/golang-migrate/migrate/v4"
	driverPgx "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/urfave/cli/v2"
	"golang.org/x/crypto/bcrypt"

	"github.com/openmomentso/momentso/pkg/ai"
	"github.com/openmomentso/momentso/pkg/app"
	"github.com/openmomentso/momentso/pkg/database"
	"github.com/openmomentso/momentso/pkg/database/db"
	"github.com/openmomentso/momentso/pkg/database/migrations"
	"github.com/openmomentso/momentso/pkg/email"
)

type Config struct {
	MailConfig email.Config
	AIConfig   ai.Config
}

func loadDependencies() (Config, app.Dependencies) {
	cfg := Config{}
	err := env.Parse(&cfg)
	if err != nil {
		log.Fatal().Err(err)
	}

	dbI := database.NewClient()
	mail := email.New(cfg.MailConfig)
	aiI := ai.New(cfg.AIConfig)

	return cfg, app.Dependencies{
		DB:   dbI,
		Mail: mail,
		AI:   aiI,
	}
}

func main() {
	log.Logger = log.With().Caller().Logger().Output(zerolog.ConsoleWriter{Out: os.Stderr})

	cliApp := &cli.App{
		Name:  "app",
		Usage: "",
		Commands: []*cli.Command{
			{
				Name: "app:start",
				Action: func(context *cli.Context) error {
					_, deps := loadDependencies()
					app.StartApp(deps)
					return errors.New("app crashed")
				},
			},
			{
				Name: "app:sendMorningRecap",
				Action: func(context *cli.Context) error {
					cfg, deps := loadDependencies()

					if cfg.AIConfig.Key == "" {
						return errors.New("AI key is required to send morning recaps")
					}

					return app.SendMorningRecap(deps, context.Context)
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

					err = seed(context.Context, dbI)
					if err != nil {
						return err
					}

					log.Info().Msg("reset, migrated and seeded the database. You can login with {fred,john,sofia}@example.org:1234")
					return nil
				},
			},
		},
	}

	if err := cliApp.Run(os.Args); err != nil {
		log.Fatal().Err(err).Msg("failed to run app")
	}
}

func migrateUp() error {
	dbI, err := sql.Open("pgx", os.Getenv("DSN"))
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
	projects := []struct {
		DbID  int64
		Name  string
		Color string
	}{
		{Name: "Work", Color: "#69c797"},
		{Name: "Personal", Color: "#714cb5"},
		{Name: "Family", Color: "#38d1cf"},
	}

	entries := []struct {
		ProjectID   int64
		Description string
		Offset      time.Duration
		Length      time.Duration
	}{
		{ProjectID: 0, Description: "Worked on the app", Offset: -2 * time.Hour, Length: 1 * time.Hour},
		{ProjectID: 0, Description: "Setup the Frontend", Offset: -1 * time.Hour, Length: 1 * time.Hour},
		{ProjectID: 0, Description: "Setup the Backend", Offset: 0, Length: 0},

		{ProjectID: 1, Description: "Worked out", Offset: -8 * time.Hour, Length: 1 * time.Hour},
		{ProjectID: 1, Description: "Went for a walk", Offset: -7 * time.Hour, Length: 1 * time.Hour},
		{ProjectID: 1, Description: "Cooked food", Offset: -6 * time.Hour, Length: 1 * time.Hour},

		{ProjectID: 2, Description: "Spent time with my dog", Offset: -12 * time.Hour, Length: 1 * time.Hour},
		{ProjectID: 2, Description: "Spent time with my cat", Offset: -11 * time.Hour, Length: 2 * time.Hour},
		{ProjectID: 2, Description: "Spent time with my family", Offset: -9 * time.Hour, Length: 1 * time.Hour},
	}

	users := []struct {
		Email string
		Name  string
	}{
		{Name: "Fred", Email: "fred@example.org"},
		{Name: "John", Email: "john@example.org"},
		{Name: "Sofia", Email: "sofia@example.org"},
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("1234"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	for _, s := range users {
		user, err := dbI.UserCreate(ctx, db.UserCreateParams{
			Name:     s.Name,
			Email:    s.Email,
			Password: string(hashedPassword),
		})
		if err != nil {
			return err
		}

		for i, project := range projects {
			dbProject, err := dbI.ProjectCreate(ctx, db.ProjectCreateParams{
				Name:   project.Name,
				UserID: user.ID,
				Color:  project.Color,
			})
			if err != nil {
				return err
			}

			projects[i].DbID = dbProject.ID
		}

		for _, entry := range entries {
			dbEntry, err := dbI.TimeEntryCreate(ctx, db.TimeEntryCreateParams{
				ProjectID:   pgtype.Int8{Valid: true, Int64: projects[entry.ProjectID].DbID},
				CreatedBy:   user.ID,
				StartedAt:   time.Now().Add(entry.Offset),
				Description: entry.Description,
			})
			if err != nil {
				return err
			}

			if entry.Length > 0 {
				err = database.ExecUpdate(dbI, ctx, dbI.NewQueryBuilder().Update("time_entries").Set("completed_at", time.Now().Add(entry.Offset+entry.Length)).Where("id = ?", dbEntry.ID))
				if err != nil {
					return err
				}
			}
		}

	}

	return nil
}
