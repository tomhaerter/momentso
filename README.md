
# Development
## Frontend


## Backend
### Local backend developing
for developing the backend, use a local go 1.21 development environment.
use the file `internal/cmd/cmd.go` as an entrypoint & make sure that you duplicate (`.env`), adjust and load `.env.template`
* `docker compose up -d db mailhog`: to start the datbase

### Backend while developing the frontend
for developing only the frontend, a dockerized version of the backend can be used.  
in the backend folder:
* `docker compose up --build -d`: to start the datbase & the backend
* `docker compose down`: to stop the datbase & the backend
* `docker compose run --build --rm backend /app/app migrate:resetAndSeed`: reset the database, to apply all migrations and seed
