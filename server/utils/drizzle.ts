import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "../database/schema"
import { relations } from "../database/relations"
export { sql, eq, and, or, gt, lt, gte, lte, isNull, ne, count, inArray, not, asc, desc } from "drizzle-orm"

export const tables = schema

const database = drizzle(process.env.DATABASE_URL!, { relations })

export function useDrizzle() {
  return database
}
