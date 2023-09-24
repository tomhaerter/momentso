-- name: TimeEntryFind :many
select * from time_entries where created_by = $1 order by started_at desc;

-- name: TimeEntryFindById :one
select * from time_entries where id = $1 and created_by = $2;

-- name: TimeEntryCreate :one
insert into time_entries (created_by, started_at, description, project_id) values ($1, $2, $3, $4) returning *;

-- name: TimeEntryFindRunning :one
select * from time_entries where created_by = $1 and completed_at is null limit 1;