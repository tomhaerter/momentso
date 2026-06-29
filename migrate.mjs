import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { resolve } from "node:path"

const url = process.env.NUXT_DSN
if (!url) {
	console.error("NUXT_DSN is required")
	process.exit(1)
}

const folder = resolve(process.env.MIGRATIONS_FOLDER ?? "./server/database/migrations")

const db = drizzle(url)
await migrate(db, { migrationsFolder: folder })
await db.$client.end()

console.log("Migrations applied")
