import { accounts, sessions } from "../database/schema"
import { eq, and, isNull } from "drizzle-orm"
import { z } from "zod"

const bodySchema = z.object({
  password: z.string().min(8),
  token: z.string()
})

export default defineEventHandler(async (event) => {
  const { password, token } = await readValidatedBody(event, bodySchema.parse)

  const [account] = await useDrizzle().select().from(accounts).where(eq(accounts.resetPasswordToken, token)).limit(1)
  if (!account) throw createError({ statusCode: 401, message: "Invalid request" })

  // Check if both reset password token and expiration date are set
  if (!account.resetPasswordToken || !account.resetPasswordExpiresAt) throw createError({ statusCode: 401, message: "Invalid request" })

  // Check if the token is valid
  if (account.resetPasswordToken !== token) throw createError({ statusCode: 401, message: "Invalid request" })

  // Check if the token has expired
  if (account.resetPasswordExpiresAt < new Date()) throw createError({ statusCode: 401, message: "Invalid request" })

  // Update the password
  const hashedPassword = await hashPassword(password)

  // Reset the password token and expiration date
  await useDrizzle()
    .update(accounts)
    .set({ password: hashedPassword, resetPasswordToken: null, resetPasswordExpiresAt: null })
    .where(eq(accounts.id, account.id))

  // Soft delete all active sessions for the account
  await useDrizzle()
    .update(sessions)
    .set({ deletedAt: new Date() })
    .where(and(eq(sessions.accountId, account.id), isNull(sessions.deletedAt)))

  return {}
})
