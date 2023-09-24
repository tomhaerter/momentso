-- name: UserFind :many
select * from users;

-- name: UserFindById :one
select * from users where id = $1;

-- name: UserFindByEmail :one
select * from users where email = $1;

-- name: UserCreate :one
insert into users (email, password, name) values ($1, $2, $3) returning *;

-- name: SessionCreate :one
insert into sessions (user_id, token) values ($1, $2) returning *;

-- name: UserFindBySession :one
select * from users where id = (select user_id from sessions where token = $1 and users.created_at > now() - interval '30 days');

-- name: ListTimeEntries :many
select * from time_entries;

-- name: PasswordResetSet :exec
insert into password_reset_tokens (user_id, token) values ($1, $2) on conflict (user_id) do update set token = $2, created_at = now();

-- name: PasswordResetDelete :exec
delete from password_reset_tokens where user_id = $1;

-- name: UserFindByPasswordResetToken :one
select u.* from password_reset_tokens p
inner join users u on u.id = p.user_id
where token = $1 and p.created_at > now() - interval '30 minutes';

-- name: UserUpdatePassword :exec
update users set password = $2 where id = $1;