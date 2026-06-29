import { eq, and, isNull, asc } from "drizzle-orm"
import { users, accounts } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const rows = await useDrizzle()
    .select({
      id: users.id,
      accountId: accounts.id,
      name: accounts.name,
      email: accounts.email,
      role: users.role,
      createdAt: users.createdAt
    })
    .from(users)
    .innerJoin(accounts, eq(users.accountId, accounts.id))
    .where(and(eq(users.workspaceId, secure.workspaceId), isNull(users.deletedAt)))
    .orderBy(asc(users.createdAt))

  return rows
})
