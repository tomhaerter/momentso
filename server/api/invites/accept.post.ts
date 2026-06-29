import { eq, and, isNull } from "drizzle-orm"
import { workspaceInvites, users, workspaces, sessions, accounts } from "~~/server/database/schema"
import { nanoid } from "nanoid"
import { z } from "zod"

const bodySchema = z.object({
  token: z.string()
})

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const body = await readValidatedBody(event, bodySchema.parse)

  // Fetch invite
  const [invite] = await useDrizzle()
    .select()
    .from(workspaceInvites)
    .where(and(eq(workspaceInvites.token, body.token), isNull(workspaceInvites.deletedAt)))
    .limit(1)

  if (!invite) throw createError({ statusCode: 404, message: "Invite not found" })
  if (invite.acceptedAt) throw createError({ statusCode: 400, message: "Invite already used" })
  if (new Date(invite.expiresAt) < new Date()) throw createError({ statusCode: 400, message: "Invite expired" })

  // Strict: logged-in email must match invite email
  const { user: sessionUser } = await requireUserSession(event)
  if (!sessionUser) throw createError({ statusCode: 401, message: "Unauthorized" })

  // Fetch the account to verify email matches
  const [account] = await useDrizzle()
    .select({ email: accounts.email })
    .from(accounts)
    .where(eq(accounts.id, sessionUser.id))
    .limit(1)

  if (!account?.email || account.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw createError({ statusCode: 403, message: `This invite was sent to ${invite.email} but you're logged in as ${account?.email}. Log out and sign in with the correct email.` })
  }

  // Check if already a member
  const [existing] = await useDrizzle()
    .select({ id: users.id })
    .from(users)
    .where(and(
      eq(users.accountId, sessionUser.id),
      eq(users.workspaceId, invite.workspaceId),
      isNull(users.deletedAt)
    ))
    .limit(1)

  if (existing) {
    throw createError({ statusCode: 400, message: "Already a member of this workspace" })
  }

  // Add as member
  const [newUserRow] = await useDrizzle()
    .insert(users)
    .values({
      accountId: sessionUser.id,
      workspaceId: invite.workspaceId,
      role: invite.role
    })
    .returning()

  if (!newUserRow) throw createError({ statusCode: 500, message: "Failed to create membership" })

  // Mark invite as accepted
  await useDrizzle()
    .update(workspaceInvites)
    .set({ acceptedBy: sessionUser.id, acceptedAt: new Date() })
    .where(eq(workspaceInvites.id, invite.id))

  // Fetch workspace name
  const [workspace] = await useDrizzle()
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.id, invite.workspaceId))
    .limit(1)

  // Switch session to the new workspace (same pattern as switch.post.ts)
  await useDrizzle()
    .update(sessions)
    .set({ deletedAt: new Date() })
    .where(eq(sessions.token, secure.token))

  const [newSession] = await useDrizzle()
    .insert(sessions)
    .values({
      token: nanoid(64),
      accountId: sessionUser.id,
      userId: newUserRow.id,
      workspaceId: invite.workspaceId
    })
    .returning()

  if (!newSession) throw createError({ statusCode: 500, message: "Failed to create session" })

  await setUserSession(event, {
    user: {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      workspaceId: invite.workspaceId,
      userId: newUserRow.id
    },
    secure: {
      token: newSession.token,
      workspaceId: invite.workspaceId,
      userId: newUserRow.id
    }
  })

  return { workspaceId: invite.workspaceId, workspaceName: workspace?.name }
})
