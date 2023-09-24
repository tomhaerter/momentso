-- name: ProjectFind :many
select * from projects where user_id = $1;

-- name: ProjectCreate :one
insert into projects (name, user_id, color) values ($1, $2, $3) returning *;