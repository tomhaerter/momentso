CREATE TABLE workspaces
(
    id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name       text        NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users
(
    id           bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email        text        NOT NULL UNIQUE,
    password     text        NOT NULL,
    workspace_id bigint REFERENCES workspaces (id),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clients
(
    id           bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name         text        NOT NULL,
    workspace_id bigint REFERENCES workspaces (id),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE projects
(
    id           bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name         text        NOT NULL,
    color        text        NOT NULL DEFAULT 'gray',
    client_id    bigint REFERENCES clients (id),
    workspace_id bigint REFERENCES workspaces (id),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE time_entries
(
    id           bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    description  text        NOT NULL,
    workspace_id bigint REFERENCES workspaces (id),
    created_by   bigint REFERENCES users (id),
    created_at   timestamptz NOT NULL DEFAULT now(),
    started_at   timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    CHECK (completed_at > started_at)
);