package app

import (
	"context"
	"fmt"
	"slices"

	"github.com/rs/zerolog/log"

	"github.com/openmomentso/momentso/pkg/ai"
	"github.com/openmomentso/momentso/pkg/database/db"
)

func SendMorningRecap(deps Dependencies, ctx context.Context) error {
	for {
		users, err := deps.DB.MorningRecapFindUsers(ctx)
		if err != nil {
			return err
		}

		if len(users) == 0 {
			log.Info().Msg("No users to send morning recap to")
			return nil
		}

		for _, user := range users {
			name := user.Name
			if len(name) > 15 {
				name = name[:15]
			}

			log.Info().Int64("user", user.ID).Msg("Sending morning recap")

			entries, err := deps.DB.MorningRecapTimeEntriesForUser(ctx, user.ID)
			if err != nil {
				return err
			}

			slices.SortFunc(entries, func(a, b db.TimeEntry) int {
				if a.StartedAt.Before(b.StartedAt) {
					return -1
				}
				return 1
			})

			mappedEntries := make([]ai.Entry, len(entries))
			for i, entry := range entries {
				description := entry.Description
				if len(description) > 25 {
					description = description[:25]
				}

				mappedEntries[i] = ai.Entry{
					From:        entry.StartedAt.Format("15:04"),
					To:          entry.CompletedAt.Time.Format("15:04"),
					Description: description,
				}
			}

			out, err := deps.AI.GenerateMorningRecap(ctx, name, mappedEntries)
			if err != nil {
				return err
			}

			fmt.Println(out)
			err = deps.Mail.SendMorningRecap(user.Name, user.Email, out)
			if err != nil {
				return err
			}

			err = deps.DB.MorningRecapSent(ctx, user.ID)
			if err != nil {
				return err
			}
		}
	}
}
