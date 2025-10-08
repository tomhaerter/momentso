import { sessions, users } from "../database/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { z } from "zod"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)

  // Find user
  const results = await useDrizzle().select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
  if (results.length !== 1) throw createError({ statusCode: 401, message: "Bad credentials" })
  const user = results[0]

  if (!user.password) throw createError({ statusCode: 401, message: "Bad credentials" })

  const isMatch = await verifyPassword(user.password, password)
  if (!isMatch) throw createError({ statusCode: 401, message: "Bad credentials" })

  // Create a user session
  const [session] = await useDrizzle()
    .insert(sessions)
    .values({
      token: nanoid(64),
      userId: user.id
    })
    .returning()

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email!,
      organisationId: user.organisationId
    },
    secure: {
      token: session.token,
      userId: user.id,
      organisationId: user.organisationId
    }
  })

  return {}
})
