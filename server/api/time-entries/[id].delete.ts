import { eq, and } from "drizzle-orm"
import { timeEntries } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const id = getRouterParam(event, "id")
  if (!id) throw createError({ statusCode: 400, message: "Missing id" })

  const [result] = await useDrizzle()
    .update(timeEntries)
    .set({ deletedAt: new Date() })
    .where(and(eq(timeEntries.id, id), eq(timeEntries.workspaceId, secure.workspaceId)))
    .returning()

  if (!result) throw createError({ statusCode: 404, message: "Time entry not found" })

  return { success: true }
})
