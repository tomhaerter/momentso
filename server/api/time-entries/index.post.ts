import { eq, and, isNull } from "drizzle-orm"
import { timeEntries } from "~~/server/database/schema"
import { z } from "zod"

const timeEntrySchema = z.object({
  description: z.string().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  projectId: z.uuid().nullable().optional()
})

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  try {
    const timeEntry = await readValidatedBody(event, timeEntrySchema.parse)

    // If creating an active timer (no endTime), ensure no other active timer exists
    if (!timeEntry.endTime) {
      const activeTimers = await useDrizzle()
        .select()
        .from(timeEntries)
        .where(and(eq(timeEntries.workspaceId, secure.workspaceId), isNull(timeEntries.endTime)))

      if (activeTimers.length > 0) {
        throw createError({ statusCode: 400, message: "An active timer already exists" })
      }
    }

    const [result] = await useDrizzle()
      .insert(timeEntries)
      .values({
        ...timeEntry,
        workspaceId: secure.workspaceId
      })
      .returning()

    return result
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 400, message: "Invalid request body" })
  }
})
