-- name: UserFind :many
select * from users;

-- name: UserFindById :one
select * from users where id = $1;

-- name: UserFindByEmail :one
select * from users where email = $1;

-- name: UserCreate :one
insert into users (email, password) values ($1, $2) returning *;

-- name: SessionCreate :one
insert into sessions (user_id, token) values ($1, $2) returning *;

-- name: UserFindBySession :one
select * from users where id = (select user_id from sessions where token = $1 and users.created_at > now() - interval '30 days');

-- name: ListTimeEntries :many
select * from time_entries;