import { eq, and, isNull, count } from "drizzle-orm"
import { users } from "~~/server/database/schema"
import { z } from "zod"

const bodySchema = z.object({
  role: z.enum(["owner", "member"])
})

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const targetUserId = getRouterParam(event, "userId")
  if (!targetUserId) throw createError({ statusCode: 400, message: "Missing userId" })

  const body = await readValidatedBody(event, bodySchema.parse)

  // Owner-only check
  const [myMembership] = await useDrizzle()
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.accountId, user.id), eq(users.workspaceId, secure.workspaceId)))
    .limit(1)

  if (!myMembership || myMembership.role !== "owner") {
    throw createError({ statusCode: 403, message: "Only owners can change roles" })
  }

  // Can't demote yourself if you're the last owner
  if (targetUserId === secure.userId && body.role === "member") {
    const [ownerCount] = await useDrizzle()
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.workspaceId, secure.workspaceId),
        eq(users.role, "owner"),
        isNull(users.deletedAt)
      ))

    if (Number(ownerCount?.count) <= 1) {
      throw createError({ statusCode: 400, message: "You can't demote yourself — transfer ownership first" })
    }
  }

  const [updated] = await useDrizzle()
    .update(users)
    .set({ role: body.role })
    .where(and(
      eq(users.id, targetUserId),
      eq(users.workspaceId, secure.workspaceId),
      isNull(users.deletedAt)
    ))
    .returning()

  if (!updated) throw createError({ statusCode: 404, message: "Member not found" })

  return { userId: targetUserId, role: body.role }
})
