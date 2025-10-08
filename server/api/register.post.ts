import { organisations, sessions, users } from "~~/server/database/schema"
import { nanoid } from "nanoid"
import { z } from "zod"

const bodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  // return false
  const body = await readValidatedBody(event, bodySchema.parse)

  // check if the user already exists
  const [existing] = await useDrizzle().select().from(users).where(eq(users.email, body.email)).limit(1)
  if (existing) {
    throw createError({ statusCode: 400, message: "User already exists" })
  }

  // Create organisation
  const [createdOrg] = await useDrizzle()
    .insert(organisations)
    .values({
      name: `${body.name}'s Workspace`
    })
    .returning()

  const org = createdOrg

  const hashedPassword = await hashPassword(body.password)

  const [user] = await useDrizzle()
    .insert(users)
    .values({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      organisationId: createdOrg.id
    })
    .returning()

  const [session] = await useDrizzle()
    .insert(sessions)
    .values({
      userId: user.id,
      token: nanoid(64)
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

  sendRedirect(event, "/")
})
