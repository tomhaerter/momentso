import { desc, asc, isNull, ne, like, ilike, eq, and } from "drizzle-orm"
import { timeEntries } from "~~/server/database/schema"
import { z } from "zod"

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const query = getQuery(event)
  const active = query.active === "true"

  const conditions = [eq(timeEntries.organisationId, secure.organisationId)]

  if (active) {
    conditions.push(isNull(timeEntries.endTime))
  }

  const timeEntryList = await useDrizzle()
    .select()
    .from(timeEntries)
    .where(and(...conditions))
    .orderBy(desc(timeEntries.startTime))

  return timeEntryList
})
