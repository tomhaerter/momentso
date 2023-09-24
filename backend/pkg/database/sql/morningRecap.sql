-- name: MorningRecapFindUsers :many
select u.id, u.name, u.email from users u
inner join public.time_entries te on u.id = te.created_by and te.started_at > (now() - interval '1 day')
where u.morning_recap_opt_in is true and (u.morning_recap_last_sent_at < (now() - interval '1 day') or u.morning_recap_last_sent_at is null)
group by (u.id, u.name, u.email)
having count(te) > 0
limit 100;

-- name: MorningRecapSent :exec
update users set morning_recap_last_sent_at = now() where id = $1;

-- name: MorningRecapTimeEntriesForUser :many
select * from time_entries
where created_by = $1 and
      started_at > (now() - interval '1 day') and
      completed_at is not null
order by completed_at-started_at desc
limit 8;

-- name: UserUpdateMorningRecapOptIn :one
update users set morning_recap_opt_in = $1 where id = $2 returning *;