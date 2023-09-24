package database

import (
	"context"
	"os"

	"github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/openmomentso/momentso/pkg/database/db"
)

//go:generate sqlc generate

type Db struct {
	Db *pgxpool.Pool
	*db.Queries
}

func NewClient() *Db {
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, os.Getenv("DSN"))
	if err != nil {
		panic(err)
	}

	return &Db{
		Db:      pool,
		Queries: db.New(pool),
	}
}

func (db *Db) NewQueryBuilder() squirrel.StatementBuilderType {
	return squirrel.StatementBuilder.PlaceholderFormat(squirrel.Dollar)
}

func ExecUpdate(dbI *Db, ctx context.Context, query squirrel.UpdateBuilder) error {
	sql, args, err := query.ToSql()
	if err != nil {
		return err
	}

	_, err = dbI.Db.Exec(ctx, sql, args...)
	return err
}

func ScanUpdateOne[T any](dbI *Db, ctx context.Context, query squirrel.UpdateBuilder) (T, error) {
	var t T

	sql, args, err := query.ToSql()
	if err != nil {
		return t, err
	}

	rows, err := dbI.Db.Query(ctx, sql, args...)
	if err != nil {
		return t, err
	}

	return pgx.CollectOneRow(rows, pgx.RowToStructByPos[T])
}
