import { eq, and } from "drizzle-orm"
import { timeEntries, users } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const id = getRouterParam(event, "id")
  if (!id) throw createError({ statusCode: 400, message: "Missing id" })

  // Check ownership or owner override
  const [existing] = await useDrizzle()
    .select({
      userId: timeEntries.userId,
      role: users.role
    })
    .from(timeEntries)
    .innerJoin(users, eq(timeEntries.userId, users.id))
    .where(and(eq(timeEntries.id, id), eq(timeEntries.workspaceId, secure.workspaceId)))
    .limit(1)

  if (!existing) throw createError({ statusCode: 404, message: "Time entry not found" })

  const isOwner = existing.role === "owner"
  if (existing.userId !== secure.userId && !isOwner) {
    throw createError({ statusCode: 403, message: "Not allowed to delete this time entry" })
  }

  const [result] = await useDrizzle()
    .update(timeEntries)
    .set({ deletedAt: new Date() })
    .where(and(eq(timeEntries.id, id), eq(timeEntries.workspaceId, secure.workspaceId)))
    .returning()

  if (!result) throw createError({ statusCode: 404, message: "Time entry not found" })

  return { success: true }
})
