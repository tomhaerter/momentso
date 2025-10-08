import { eq, and } from "drizzle-orm"
import { timeEntries } from "~~/server/database/schema"
import { z } from "zod"

const timeEntrySchema = z.object({
  description: z.string().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  projectId: z.string().uuid().nullable().optional()
})

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const id = getRouterParam(event, "id")
  if (!id) throw createError({ statusCode: 400, message: "Missing id" })

  try {
    const timeEntry = await readValidatedBody(event, timeEntrySchema.parse)

    const [result] = await useDrizzle()
      .update(timeEntries)
      .set(timeEntry)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.organisationId, secure.organisationId)))
      .returning()

    if (!result) {
      throw createError({ statusCode: 404, message: "Time entry not found" })
    }

    return result
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 400, message: "Invalid request body" })
  }
})
