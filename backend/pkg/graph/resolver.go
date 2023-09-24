package graph

import (
	"github.com/openmomentso/momentso/pkg/database"
	"github.com/openmomentso/momentso/pkg/email"
)

//go:generate go run github.com/99designs/gqlgen

type Resolver struct {
	DB   *database.Db
	Mail *email.Mail
}
