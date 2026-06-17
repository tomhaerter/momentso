import { accounts } from "../database/schema"
import { nanoid } from "nanoid"
import { z } from "zod"
import type { H3Event } from "h3"

const bodySchema = z.object({
  email: z.email()
})

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, bodySchema.parse)

  await enforceForgotPasswordRateLimit(event, email)

  // schedule a background task without blocking the response
  event.waitUntil(backgroundProcessEmail({ email }))

  // immediately send the response to the client
  return {}
})

async function enforceForgotPasswordRateLimit(event: H3Event, email: string) {
  const rateLimiter = useRateLimiter()

  // Check global rate limit
  const globalLimit = await rateLimiter.checkLimit({
    key: "limit:forgot-password:global",
    limit: 100,
    ttl: 3600
  })

  // Check per-email rate limit
  const localLimit = await rateLimiter.checkLimit({
    key: `limit:forgot-password:${email}`,
    limit: 3,
    ttl: 3600
  })

  if (!globalLimit || !localLimit) {
    throw createError({
      statusCode: 429,
      message: "Too many requests. Please try again later."
    })
  }
}

async function backgroundProcessEmail({ email }: { email: string }) {
  await forgotPasswordProcess(email)
}

export async function forgotPasswordProcess(email: string) {
  const lowerCaseEmail = email.toLowerCase()
  const result = await useDrizzle().select().from(accounts).where(eq(accounts.email, lowerCaseEmail)).limit(1)
  if (result.length !== 1) throw createError({ statusCode: 401, message: "Bad credentials" })
  const account = result[0]!
  if (!account) throw createError({ statusCode: 401, message: "Bad credentials" })

  if (!account.email) return {}

  // Process the account's password reset request
  // const config = useRuntimeConfig()

  // const postmark = usePostmark({ serverToken: config.postmarkServerToken })

  const passwordResetToken = nanoid(64)
  const _resetLink = `https://app.momentso.com/reset-password?token=${passwordResetToken}`
  const _expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)

  // Set the reset password token and expiration date
  // await useDrizzle().update(accounts).set({ resetPasswordToken: passwordResetToken, resetPasswordExpiresAt: _expiresAt }).where(eq(accounts.id, account.id))

  try {
    // const emailResult = await resend.sendEmail({
    //   from: "Momentso Support <support@momentso.com>",
    //   to: account.email,
    //   subject: "Reset password",
    //   htmlBody:
    //     `<p>Hello ${account.name},</p>` +
    //     `<p>you have received a request to reset your password for Momentso. To reset your password, please click the following link:</p>` +
    //   `<p><a href="${_resetLink}">Reset password</a></p>` +
    //     `<p>If you did not request this email, you can ignore it.</p>` +
    //     `<p>Thank you<br />Your Momentso Team</p>`
    // })
    //
    // console.log(emailResult)
  } catch (error) {
    console.error(error)
  }

  return {}
}
