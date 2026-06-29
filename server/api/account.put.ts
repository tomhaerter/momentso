import { accounts } from "~~/server/database/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional()
})

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const body = await readValidatedBody(event, bodySchema.parse)

  // If email is changing, check uniqueness and lowercase
  let email: string | undefined
  if (body.email !== undefined) {
    email = body.email.toLowerCase()
    const [existing] = await useDrizzle()
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.email, email))
      .limit(1)
    if (existing && existing.id !== user.id) {
      throw createError({ statusCode: 400, message: "Email already in use" })
    }
  }

  const [updated] = await useDrizzle()
    .update(accounts)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(email !== undefined && { email })
    })
    .where(eq(accounts.id, user.id))
    .returning()

  if (!updated) throw createError({ statusCode: 500, message: "Failed to update account" })

  // Update session so UI reflects new name/email immediately
  await setUserSession(event, {
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email!,
      workspaceId: user.workspaceId,
      userId: user.userId
    },
    secure
  })

  return { id: updated.id, name: updated.name, email: updated.email }
})
