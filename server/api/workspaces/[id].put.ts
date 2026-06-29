import { eq, and, isNull } from "drizzle-orm"
import { workspaces, users } from "~~/server/database/schema"
import { z } from "zod"

const bodySchema = z.object({
  name: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const id = getRouterParam(event, "id")
  if (!id) throw createError({ statusCode: 400, message: "Missing id" })

  const body = await readValidatedBody(event, bodySchema.parse)

  // Owner-only check
  const [membership] = await useDrizzle()
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.accountId, user.id), eq(users.workspaceId, id)))
    .limit(1)

  if (!membership || membership.role !== "owner") {
    throw createError({ statusCode: 403, message: "Only owners can rename the workspace" })
  }

  const [updated] = await useDrizzle()
    .update(workspaces)
    .set({ name: body.name })
    .where(and(eq(workspaces.id, id), isNull(workspaces.deletedAt)))
    .returning()

  if (!updated) throw createError({ statusCode: 404, message: "Workspace not found" })

  return { id: updated.id, name: updated.name }
})
