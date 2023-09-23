package main

import (
	"errors"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"os"

	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/urfave/cli/v2"

	"github.com/openmomentso/momentso/pkg/app"
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
		},
	}

	if err := cliApp.Run(os.Args); err != nil {
		log.Fatal().Err(err).Msg("failed to run app")
	}
}
