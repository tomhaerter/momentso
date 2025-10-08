import { sessions, users } from "../database/schema"
import { isNull } from "drizzle-orm"
import { z } from "zod"

const bodySchema = z.object({
  password: z.string().min(8),
  token: z.string()
})

export default defineEventHandler(async (event) => {
  const { password, token } = await readValidatedBody(event, bodySchema.parse)

  const [user] = await useDrizzle().select().from(users).where(eq(users.resetPasswordToken, token)).limit(1)
  if (!user) throw createError({ statusCode: 401, message: "Invalid request" })

  // Check if both reset password token and expiration date are set
  if (!user.resetPasswordToken || !user.resetPasswordExpiresAt) throw createError({ statusCode: 401, message: "Invalid request" })

  // Check if the token is valid
  if (user.resetPasswordToken !== token) throw createError({ statusCode: 401, message: "Invalid request" })

  // Check if the token has expired
  if (user.resetPasswordExpiresAt < new Date()) throw createError({ statusCode: 401, message: "Invalid request" })

  // Update the password
  const hashedPassword = await hashPassword(password)

  // Reset the password token and expiration date
  await useDrizzle().update(users).set({ password: hashedPassword, resetPasswordToken: null, resetPasswordExpiresAt: null }).where(eq(users.id, user.id))

  // Soft delete all active sessions for the user
  await useDrizzle()
    .update(sessions)
    .set({ deletedAt: new Date() })
    .where(and(eq(sessions.userId, user.id), isNull(sessions.deletedAt)))

  return {}
})
