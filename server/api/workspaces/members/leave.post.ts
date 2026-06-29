import { eq, and, isNull, count, ne } from "drizzle-orm"
import { users } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  // Can't leave if you're the last owner
  const [myMembership] = await useDrizzle()
    .select({ role: users.role })
    .from(users)
    .where(and(
      eq(users.accountId, user.id),
      eq(users.workspaceId, secure.workspaceId),
      isNull(users.deletedAt)
    ))
    .limit(1)

  if (myMembership?.role === "owner") {
    const [ownerCount] = await useDrizzle()
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.workspaceId, secure.workspaceId),
        eq(users.role, "owner"),
        isNull(users.deletedAt)
      ))

    if (Number(ownerCount?.count) <= 1) {
      throw createError({ statusCode: 400, message: "You can't leave — transfer ownership first" })
    }
  }

  // Soft-delete own membership
  await useDrizzle()
    .update(users)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(users.accountId, user.id),
      eq(users.workspaceId, secure.workspaceId),
      isNull(users.deletedAt)
    ))

  // Find another workspace to switch to
  const [otherMembership] = await useDrizzle()
    .select({ workspaceId: users.workspaceId })
    .from(users)
    .where(and(
      eq(users.accountId, user.id),
      ne(users.workspaceId, secure.workspaceId),
      isNull(users.deletedAt)
    ))
    .limit(1)

  if (otherMembership) {
    return { redirect: "/api/workspaces/switch", workspaceId: otherMembership.workspaceId }
  }

  // No other workspaces — log out
  return { redirect: "/logout" }
})
