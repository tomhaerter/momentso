import { workspaces, users } from "~~/server/database/schema"
import { z } from "zod"

const bodySchema = z.object({
  name: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" })

  const body = await readValidatedBody(event, bodySchema.parse)

  const [workspace] = await useDrizzle()
    .insert(workspaces)
    .values({ name: body.name })
    .returning()

  if (!workspace) throw createError({ statusCode: 500, message: "Failed to create workspace" })

  // Link account to workspace as owner
  await useDrizzle().insert(users).values({
    accountId: user.id,
    workspaceId: workspace.id,
    role: "owner"
  })

  return workspace
})
