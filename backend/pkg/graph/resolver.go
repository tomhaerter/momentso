package graph

import (
	"github.com/openmomentso/momentso/pkg/database"
)

//go:generate go run github.com/99designs/gqlgen

type Resolver struct {
	DB *database.Db
}
