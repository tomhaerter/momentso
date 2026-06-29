import { eq, and } from "drizzle-orm"
import { timeEntries, users } from "~~/server/database/schema"
import { z } from "zod"

const timeEntrySchema = z.object({
  description: z.string().nullable().optional(),
  startTime: z.coerce.date().nullable().optional(),
  endTime: z.coerce.date().nullable().optional(),
  projectId: z.uuid().nullable().optional(),
  // Apply a date (YYYY-MM-DD) to both start and end times, preserving HH:MM:SS
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
})

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const id = getRouterParam(event, "id")
  if (!id) throw createError({ statusCode: 400, message: "Missing id" })

  try {
    const body = await readValidatedBody(event, timeEntrySchema.parse)

    // Check ownership or owner override
    const [existing] = await useDrizzle()
      .select({
        entry: timeEntries,
        role: users.role
      })
      .from(timeEntries)
      .innerJoin(users, eq(timeEntries.userId, users.id))
      .where(and(eq(timeEntries.id, id), eq(timeEntries.workspaceId, secure.workspaceId)))
      .limit(1)

    if (!existing) throw createError({ statusCode: 404, message: "Time entry not found" })

    const isOwner = existing.role === "owner"
    if (existing.entry.userId !== secure.userId && !isOwner) {
      throw createError({ statusCode: 403, message: "Not allowed to edit this time entry" })
    }

    let updateData: Record<string, unknown> = { ...body }

    if (body.date) {
      const [y, m, d] = body.date.split("-").map(Number) as [number, number, number]

      if (existing.entry.startTime) {
        const dt = new Date(existing.entry.startTime)
        dt.setFullYear(y, m - 1, d)
        updateData.startTime = dt
      }
      if (existing.entry.endTime) {
        const dt = new Date(existing.entry.endTime)
        dt.setFullYear(y, m - 1, d)
        updateData.endTime = dt
      }

      delete updateData.date
    }

    const [result] = await useDrizzle()
      .update(timeEntries)
      .set(updateData)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.workspaceId, secure.workspaceId)))
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
