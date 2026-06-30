import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { resolve } from "node:path"

const url = process.env.DATABASE_URL
if (!url) {
	console.error("DATABASE_URL is required")
	process.exit(1)
}

const folder = resolve(process.env.MIGRATIONS_FOLDER ?? "./server/database/migrations")

const db = drizzle(url)
await migrate(db, { migrationsFolder: folder })
await db.$client.end()

console.log("Migrations applied")
