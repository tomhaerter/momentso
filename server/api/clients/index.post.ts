import { clients } from "~~/server/database/schema"
import { z } from "zod"

const bodySchema = z.object({
  name: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  try {
    const body = await readValidatedBody(event, bodySchema.parse)

    const [result] = await useDrizzle()
      .insert(clients)
      .values({
        name: body.name,
        workspaceId: secure.workspaceId
      })
      .returning()

    if (!result) throw createError({ statusCode: 500, message: "Failed to create client" })

    return result
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 400, message: "Invalid request body" })
  }
})
