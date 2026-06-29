import { eq, and, isNull, asc } from "drizzle-orm"
import { workspaceInvites, users, accounts } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  // Owner-only check
  const [membership] = await useDrizzle()
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.accountId, user.id), eq(users.workspaceId, secure.workspaceId)))
    .limit(1)

  if (!membership || membership.role !== "owner") {
    throw createError({ statusCode: 403, message: "Only owners can view invites" })
  }

  const rows = await useDrizzle()
    .select({
      id: workspaceInvites.id,
      email: workspaceInvites.email,
      role: workspaceInvites.role,
      createdAt: workspaceInvites.createdAt,
      expiresAt: workspaceInvites.expiresAt,
      acceptedAt: workspaceInvites.acceptedAt,
      acceptedByName: accounts.name
    })
    .from(workspaceInvites)
    .leftJoin(accounts, eq(workspaceInvites.acceptedBy, accounts.id))
    .where(and(
      eq(workspaceInvites.workspaceId, secure.workspaceId),
      isNull(workspaceInvites.deletedAt)
    ))
    .orderBy(asc(workspaceInvites.createdAt))

  return rows
})
