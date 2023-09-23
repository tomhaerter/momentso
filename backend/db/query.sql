-- name: ListUsers :many
SELECT * FROM users;

-- name: ListTimeEntries :many
SELECT * FROM time_entries;

-- name: CreateTimeEntry :one
INSERT INTO time_entries ()