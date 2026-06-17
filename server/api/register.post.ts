import { accounts, sessions, workspaces, workspaceUsers } from "~~/server/database/schema"
import { nanoid } from "nanoid"
import { z } from "zod"

const bodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)

  // check if the account already exists
  const [existing] = await useDrizzle().select().from(accounts).where(eq(accounts.email, body.email)).limit(1)
  if (existing) {
    throw createError({ statusCode: 400, message: "User already exists" })
  }

  // Create workspace
  const [workspace] = await useDrizzle()
    .insert(workspaces)
    .values({
      name: `${body.name}'s Workspace`
    })
    .returning()

  if (!workspace) throw createError({ statusCode: 500, message: "Failed to create workspace" })

  const hashedPassword = await hashPassword(body.password)

  const [account] = await useDrizzle()
    .insert(accounts)
    .values({
      name: body.name,
      email: body.email,
      password: hashedPassword
    })
    .returning()

  if (!account) throw createError({ statusCode: 500, message: "Failed to create account" })

  // Link account to workspace as owner
  await useDrizzle().insert(workspaceUsers).values({
    accountId: account.id,
    workspaceId: workspace.id,
    role: "owner"
  })

  const [session] = await useDrizzle()
    .insert(sessions)
    .values({
      token: nanoid(64),
      accountId: account.id,
      workspaceId: workspace.id
    })
    .returning()

  if (!session) throw createError({ statusCode: 500, message: "Failed to create session" })

  await setUserSession(event, {
    user: {
      id: account.id,
      name: account.name,
      email: account.email!,
      workspaceId: workspace.id
    },
    secure: {
      token: session.token,
      workspaceId: workspace.id
    }
  })

  sendRedirect(event, "/")
})
