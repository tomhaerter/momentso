import { eq } from "drizzle-orm"
import { workspaceInvites, workspaces } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token as string | undefined
  if (!token) throw createError({ statusCode: 400, message: "Missing token" })

  const [invite] = await useDrizzle()
    .select({
      id: workspaceInvites.id,
      email: workspaceInvites.email,
      role: workspaceInvites.role,
      expiresAt: workspaceInvites.expiresAt,
      acceptedAt: workspaceInvites.acceptedAt,
      deletedAt: workspaceInvites.deletedAt,
      workspaceName: workspaces.name
    })
    .from(workspaceInvites)
    .innerJoin(workspaces, eq(workspaceInvites.workspaceId, workspaces.id))
    .where(eq(workspaceInvites.token, token))
    .limit(1)

  if (!invite || invite.deletedAt) {
    return { valid: false, reason: "invalid" as const }
  }
  if (invite.acceptedAt) {
    return { valid: false, reason: "accepted" as const }
  }
  if (new Date(invite.expiresAt) < new Date()) {
    return { valid: false, reason: "expired" as const }
  }

  return {
    valid: true,
    email: invite.email,
    role: invite.role,
    workspaceName: invite.workspaceName,
    expiresAt: invite.expiresAt
  }
})
