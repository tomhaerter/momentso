create table workspaces
(
    id         bigint primary key generated always as identity,
    name       text        not null,
    created_at timestamptz not null default now()
);

create table users
(
    id           bigint primary key generated always as identity,
    email        text        not null unique,
    password     text        not null,
    workspace_id bigint references workspaces (id),
    created_at   timestamptz not null default now()
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
    id           bigint primary key generated always as identity,
    name         text        not null,
    workspace_id bigint references workspaces (id),
    created_at   timestamptz not null default now()
);

create table projects
(
    id           bigint primary key generated always as identity,
    name         text        not null,
    color        text        not null default 'gray',
    client_id    bigint references clients (id),
    workspace_id bigint references workspaces (id),
    created_at   timestamptz not null default now()
);

create table time_entries
(
    id           bigint primary key generated always as identity,
    description  text        not null,
    workspace_id bigint references workspaces (id),
    created_by   bigint      not null references users (id),
    created_at   timestamptz not null default now(),
    started_at   timestamptz not null default now(),
    completed_at timestamptz,
    CHECK (completed_at > started_at)
);