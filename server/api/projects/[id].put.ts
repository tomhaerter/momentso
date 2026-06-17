import { eq, and } from "drizzle-orm"
import { projects } from "~~/server/database/schema"
import { z } from "zod"

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  clientId: z.uuid().nullable().optional()
})

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const id = getRouterParam(event, "id")
  if (!id) throw createError({ statusCode: 400, message: "Missing id" })

  try {
    const body = await readValidatedBody(event, bodySchema.parse)

    const [result] = await useDrizzle()
      .update(projects)
      .set(body)
      .where(and(eq(projects.id, id), eq(projects.workspaceId, secure.workspaceId)))
      .returning()

    if (!result) throw createError({ statusCode: 404, message: "Project not found" })

    return result
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 400, message: "Invalid request body" })
  }
})
