# Momentso

time tracking software

## Development

Install [mise](https://mise.jdx.dev/getting-started.html) and activate it in your
shell. From the repository root, install the pinned Node.js 26.12.1 toolchain
and dependencies (npm is included with Node.js):

```sh
mise trust
mise install
npm ci
```

The Node.js pin matches production. CI separately checks Node.js 22.23.4.

Copy `.env.example` to `.env` and provide a local PostgreSQL database matching
`DATABASE_URL`. Then apply migrations and start the development server:

```sh
npm run db:migrate
npm run dev
```

Run the existing quality checks and production build:

```sh
npm run lint
npm run fmt:check
npm run build
```
