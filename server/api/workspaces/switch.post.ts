import { eq, and } from "drizzle-orm"
import { sessions, users, workspaces } from "~~/server/database/schema"
import { nanoid } from "nanoid"
import { z } from "zod"

const bodySchema = z.object({
  workspaceId: z.string().uuid()
})

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const { workspaceId } = await readValidatedBody(event, bodySchema.parse)

  // No-op if already on this workspace
  if (workspaceId === secure.workspaceId) return { workspaceId }

  // Verify the account has access to the target workspace
  const [membership] = await useDrizzle()
    .select()
    .from(users)
    .where(and(eq(users.accountId, user.id), eq(users.workspaceId, workspaceId)))
    .limit(1)

  if (!membership) throw createError({ statusCode: 403, message: "No access to this workspace" })

  // Fetch the workspace
  const [workspace] = await useDrizzle()
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1)

  if (!workspace) throw createError({ statusCode: 404, message: "Workspace not found" })

  // Soft-delete the old session
  await useDrizzle()
    .update(sessions)
    .set({ deletedAt: new Date() })
    .where(eq(sessions.token, secure.token))

  // Create a new session bound to the target workspace
  const [session] = await useDrizzle()
    .insert(sessions)
    .values({
      token: nanoid(64),
      accountId: user.id,
      userId: membership.id,
      workspaceId: workspace.id
    })
    .returning()

  if (!session) throw createError({ statusCode: 500, message: "Failed to create session" })

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      workspaceId: workspace.id,
      userId: membership.id
    },
    secure: {
      token: session.token,
      workspaceId: workspace.id,
      userId: membership.id
    }
  })

  return { workspaceId: workspace.id, workspaceName: workspace.name }
})
