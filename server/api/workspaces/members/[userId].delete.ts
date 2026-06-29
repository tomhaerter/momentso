import { eq, and, isNull, count } from "drizzle-orm"
import { users, sessions } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const targetUserId = getRouterParam(event, "userId")
  if (!targetUserId) throw createError({ statusCode: 400, message: "Missing userId" })

  // Owner-only check
  const [myMembership] = await useDrizzle()
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.accountId, user.id), eq(users.workspaceId, secure.workspaceId)))
    .limit(1)

  if (!myMembership || myMembership.role !== "owner") {
    throw createError({ statusCode: 403, message: "Only owners can remove members" })
  }

  // Can't remove yourself
  if (targetUserId === secure.userId) {
    throw createError({ statusCode: 400, message: "Use leave workspace instead" })
  }

  // Fetch target membership to check role + get accountId for session cleanup
  const [targetMembership] = await useDrizzle()
    .select({ role: users.role, accountId: users.accountId })
    .from(users)
    .where(and(
      eq(users.id, targetUserId),
      eq(users.workspaceId, secure.workspaceId),
      isNull(users.deletedAt)
    ))
    .limit(1)

  if (!targetMembership) throw createError({ statusCode: 404, message: "Member not found" })

  // Can't remove the last owner
  if (targetMembership.role === "owner") {
    const [ownerCount] = await useDrizzle()
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.workspaceId, secure.workspaceId),
        eq(users.role, "owner"),
        isNull(users.deletedAt)
      ))

    if (Number(ownerCount?.count) <= 1) {
      throw createError({ statusCode: 400, message: "Can't remove the last owner — transfer ownership first" })
    }
  }

  // Soft-delete the membership
  await useDrizzle()
    .update(users)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(users.id, targetUserId),
      eq(users.workspaceId, secure.workspaceId)
    ))

  // Soft-delete any active sessions the removed user has on this workspace
  await useDrizzle()
    .update(sessions)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(sessions.accountId, targetMembership.accountId),
      eq(sessions.workspaceId, secure.workspaceId),
      isNull(sessions.deletedAt)
    ))

  return { success: true }
})
