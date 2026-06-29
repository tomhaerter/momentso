import { eq, asc } from "drizzle-orm"
import { users, workspaces } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" })

  const rows = await useDrizzle()
    .select({
      id: workspaces.id,
      name: workspaces.name,
      role: users.role
    })
    .from(users)
    .innerJoin(workspaces, eq(users.workspaceId, workspaces.id))
    .where(eq(users.accountId, user.id))
    .orderBy(asc(users.createdAt))

  return rows
})
