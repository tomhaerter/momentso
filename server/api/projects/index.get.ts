import { eq } from "drizzle-orm"
import { projects } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  return await useDrizzle()
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, secure.workspaceId))
})
