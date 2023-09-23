package db

import (
	"database/sql"
	_ "github.com/lib/pq"
)

func NewClient() *Queries {
	db, err := sql.Open("postgres", "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable")
	if err != nil {
		panic(err)
	}

	return &Queries{
		db: db,
	}
}
