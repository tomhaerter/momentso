import { desc, eq, and, isNull, inArray } from "drizzle-orm"
import { timeEntries, projects } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const query = getQuery(event)
  const active = query.active === "true"
  const projectId = typeof query.projectId === "string" ? query.projectId : undefined
  const clientId = typeof query.clientId === "string" ? query.clientId : undefined

  const conditions = [eq(timeEntries.workspaceId, secure.workspaceId), isNull(timeEntries.deletedAt)]

  if (active) {
    conditions.push(isNull(timeEntries.endTime))
  }

  if (projectId) {
    conditions.push(eq(timeEntries.projectId, projectId))
  }

  if (clientId) {
    // Filter entries whose project belongs to the given client
    const projectIds = await useDrizzle()
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.clientId, clientId), eq(projects.workspaceId, secure.workspaceId)))

    conditions.push(inArray(timeEntries.projectId, projectIds.map((p) => p.id)))
  }

  const timeEntryList = await useDrizzle()
    .select()
    .from(timeEntries)
    .where(and(...conditions))
    .orderBy(desc(timeEntries.startTime))

  return timeEntryList
})
