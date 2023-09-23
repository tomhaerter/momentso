-- name: TimeEntryFind :many
select * from time_entries where created_by = $1;

-- name: TimeEntryFindById :one
select * from time_entries where id = $1 and created_by = $2;

-- name: TimeEntryCreate :one
insert into time_entries (created_by, started_at, description) values ($1, $2, $3) returning *;

-- name: TimeEntryFindRunning :one
select * from time_entries where created_by = $1 and completed_at is null limit 1;