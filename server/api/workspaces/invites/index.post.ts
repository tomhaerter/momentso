import { eq, and, isNull } from "drizzle-orm"
import { workspaceInvites, users, workspaces, accounts } from "~~/server/database/schema"
import { nanoid } from "nanoid"
import { z } from "zod"

const bodySchema = z.object({
  email: z.string().email(),
  role: z.enum(["member"]).default("member")
})

export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user || !secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const body = await readValidatedBody(event, bodySchema.parse)
  const email = body.email.toLowerCase()

  // Owner-only check
  const [membership] = await useDrizzle()
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.accountId, user.id), eq(users.workspaceId, secure.workspaceId)))
    .limit(1)

  if (!membership || membership.role !== "owner") {
    throw createError({ statusCode: 403, message: "Only owners can invite members" })
  }

  // Check if email is already a member
  const [existingMember] = await useDrizzle()
    .select({ id: users.id })
    .from(users)
    .innerJoin(accounts, eq(users.accountId, accounts.id))
    .where(and(
      eq(users.workspaceId, secure.workspaceId),
      eq(accounts.email, email),
      isNull(users.deletedAt)
    ))
    .limit(1)

  if (existingMember) {
    throw createError({ statusCode: 400, message: "Already a member" })
  }

  // Check for existing pending invite
  const [existingInvite] = await useDrizzle()
    .select({ id: workspaceInvites.id })
    .from(workspaceInvites)
    .where(and(
      eq(workspaceInvites.workspaceId, secure.workspaceId),
      eq(workspaceInvites.email, email),
      isNull(workspaceInvites.acceptedBy),
      isNull(workspaceInvites.deletedAt)
    ))
    .limit(1)

  if (existingInvite) {
    throw createError({ statusCode: 400, message: "Already invited" })
  }

  const config = useRuntimeConfig()
  const token = nanoid(64)

  const [invite] = await useDrizzle()
    .insert(workspaceInvites)
    .values({
      workspaceId: secure.workspaceId,
      email,
      token,
      role: body.role,
      createdBy: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    .returning()

  if (!invite) throw createError({ statusCode: 500, message: "Failed to create invite" })

  // Fetch workspace name for email
  const [workspace] = await useDrizzle()
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.id, secure.workspaceId))
    .limit(1)

  // Send invite email
  const mail = workspaceInviteEmail({
    to: email,
    inviterName: user.name,
    workspaceName: workspace?.name ?? "the workspace",
    token,
    appUrl: config.appUrl
  })
  await sendEmail({ to: email, subject: mail.subject, html: mail.html })

  return { id: invite.id, email: invite.email, role: invite.role, expiresAt: invite.expiresAt }
})
