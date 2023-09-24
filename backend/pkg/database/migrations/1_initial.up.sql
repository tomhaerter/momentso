create table users
(
    id         bigint primary key generated always as identity,
    name       text        not null,
    email      text        not null unique,
    password   text        not null,
    created_at timestamptz not null default now(),

    morning_recap_opt_in bool not null default false,
    morning_recap_last_sent_at timestamptz null
);

create table password_reset_tokens
(
    id         bigint primary key generated always as identity,
    user_id    bigint      not null references users (id),
    token      text        not null unique,
    created_at timestamptz not null default now(),

    unique (user_id),
    unique (token)
);

create table sessions
(
    id         bigint primary key generated always as identity,
    user_id    bigint      not null references users (id),
    token      text        not null unique,
    created_at timestamptz not null default now()
);

create table clients
(
    id         bigint primary key generated always as identity,
    user_id    bigint      not null references users (id),
    name       text        not null,
    created_at timestamptz not null default now(),

    unique (user_id, name)
);

create table projects
(
    id         bigint primary key generated always as identity,
    user_id    bigint      not null references users (id),
    created_at timestamptz not null default now(),

    name       text        not null,
    color      text        not null default '#666666',
    client_id  bigint references clients (id)
);

create table time_entries
(
    id           bigint primary key generated always as identity,
    description  text        not null,
    created_by   bigint      not null references users (id),
    created_at   timestamptz not null default now(),
    started_at   timestamptz not null default now(),
    completed_at timestamptz,
    project_id   bigint      null references projects (id),
    CHECK (completed_at > started_at)
);