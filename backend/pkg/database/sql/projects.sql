-- name: ProjectFind :many
select * from projects where user_id = $1;

-- name: ProjectFindByID :one
select * from projects where id = $1 and user_id = $2;

-- name: ProjectCreate :one
insert into projects (name, user_id, color) values ($1, $2, $3) returning *;