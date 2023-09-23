package database

import (
	"database/sql"

	_ "github.com/lib/pq"

	"github.com/openmomentso/momentso/pkg/database/db"
)

//go:generate sqlc generate

type Db struct {
	Db *sql.DB
	*db.Queries
}

func NewClient() *Db {
	dbI, err := sql.Open("postgres", "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable")
	if err != nil {
		panic(err)
	}

	return &Db{
		Db:      dbI,
		Queries: db.New(dbI),
	}
}
