import { accounts, sessions, workspaceUsers, workspaces } from "../database/schema"
import { eq, asc } from "drizzle-orm"
import { nanoid } from "nanoid"
import { z } from "zod"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)

  // Find account
  const results = await useDrizzle().select().from(accounts).where(eq(accounts.email, email.toLowerCase())).limit(1)
  if (results.length !== 1) throw createError({ statusCode: 401, message: "Bad credentials" })
  const account = results[0]!
  if (!account) throw createError({ statusCode: 401, message: "Bad credentials" })

  if (!account.password) throw createError({ statusCode: 401, message: "Bad credentials" })

  const isMatch = await verifyPassword(account.password, password)
  if (!isMatch) throw createError({ statusCode: 401, message: "Bad credentials" })

  // Pick a workspace the account belongs to (oldest membership first)
  const [membership] = await useDrizzle()
    .select({
      workspace: workspaces
    })
    .from(workspaceUsers)
    .innerJoin(workspaces, eq(workspaceUsers.workspaceId, workspaces.id))
    .where(eq(workspaceUsers.accountId, account.id))
    .orderBy(asc(workspaceUsers.createdAt))
    .limit(1)

  if (!membership) throw createError({ statusCode: 403, message: "Account has no workspaces" })

  const workspace = membership.workspace

  // Create a session bound to the workspace
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

  return {}
})
