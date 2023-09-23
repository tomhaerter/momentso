-- name: TimeEntryFind :many
select * from time_entries where created_by = $1;

-- name: TimeEntryFindById :one
select * from time_entries where id = $1 and created_by = $2;

-- name: TimeEntryCreate :one
insert into time_entries (created_by, started_at, description) values ($1, $2, $3) returning *;

update time_entries set completed_at = $1 where id = $2 and created_by = $3 returning *;