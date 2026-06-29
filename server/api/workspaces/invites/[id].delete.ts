import { eq, and } from "drizzle-orm"
import { workspaceInvites, users } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const id = getRouterParam(event, "id")
  if (!id) throw createError({ statusCode: 400, message: "Missing id" })

  // Owner-only check
  const [membership] = await useDrizzle()
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.accountId, user.id), eq(users.workspaceId, secure.workspaceId)))
    .limit(1)

  if (!membership || membership.role !== "owner") {
    throw createError({ statusCode: 403, message: "Only owners can revoke invites" })
  }

  await useDrizzle()
    .update(workspaceInvites)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(workspaceInvites.id, id),
      eq(workspaceInvites.workspaceId, secure.workspaceId)
    ))

  return { success: true }
})
