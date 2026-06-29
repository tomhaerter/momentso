import { eq, and } from "drizzle-orm"
import { workspaces, users } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const [workspace] = await useDrizzle()
    .select({
      id: workspaces.id,
      name: workspaces.name,
      subscriptionStatus: workspaces.subscriptionStatus
    })
    .from(workspaces)
    .where(eq(workspaces.id, secure.workspaceId))
    .limit(1)

  if (!workspace) throw createError({ statusCode: 404, message: "Workspace not found" })

  const [membership] = await useDrizzle()
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.accountId, user.id), eq(users.workspaceId, secure.workspaceId)))
    .limit(1)

  return {
    ...workspace,
    role: membership?.role ?? "member"
  }
})
