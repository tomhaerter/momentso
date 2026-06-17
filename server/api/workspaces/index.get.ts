import { eq, asc } from "drizzle-orm"
import { workspaceUsers, workspaces } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" })

  const rows = await useDrizzle()
    .select({
      id: workspaces.id,
      name: workspaces.name,
      role: workspaceUsers.role
    })
    .from(workspaceUsers)
    .innerJoin(workspaces, eq(workspaceUsers.workspaceId, workspaces.id))
    .where(eq(workspaceUsers.accountId, user.id))
    .orderBy(asc(workspaceUsers.createdAt))

  return rows
})
