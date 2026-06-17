import { eq, and } from "drizzle-orm"
import { projects } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const id = getRouterParam(event, "id")
  if (!id) throw createError({ statusCode: 400, message: "Missing id" })

  const [project] = await useDrizzle()
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.workspaceId, secure.workspaceId)))
    .limit(1)

  if (!project) throw createError({ statusCode: 404, message: "Project not found" })

  return project
})
