import { Resend } from "resend"

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}) {
  const config = useRuntimeConfig()
  if (!config.resendApiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send")
    return
  }
  const resend = new Resend(config.resendApiKey)
  const { data, error } = await resend.emails.send({
    from: config.resendFrom,
    to: opts.to,
    subject: opts.subject,
    html: opts.html
  })
  if (error) {
    console.error("[email] Resend error:", error)
    throw createError({ statusCode: 500, message: "Failed to send email" })
  }
  return data
}

export function passwordResetEmail(opts: {
  to: string
  name: string
  token: string
  appUrl: string
}) {
  const link = `${opts.appUrl}/reset-password?token=${opts.token}`
  return {
    subject: "Reset your Momentso password",
    html:
      `<p>Hello ${escapeHtml(opts.name)},</p>` +
      `<p>You received a request to reset your password for Momentso. To reset your password, please click the following link:</p>` +
      `<p><a href="${link}">Reset password</a></p>` +
      `<p>If you did not request this email, you can safely ignore it.</p>` +
      `<p>Thank you<br />The Momentso Team</p>`
  }
}

export function workspaceInviteEmail(opts: {
  to: string
  inviterName: string
  workspaceName: string
  token: string
  appUrl: string
}) {
  const link = `${opts.appUrl}/join?token=${opts.token}`
  return {
    subject: `${opts.inviterName} invited you to "${opts.workspaceName}" on Momentso`,
    html: `<p>${escapeHtml(opts.inviterName)} invited you to join the "${escapeHtml(opts.workspaceName)}" workspace on Momentso.</p><p><a href="${link}">Accept invite</a></p><p>This invite expires in 7 days. If you weren't expecting it, you can safely ignore this email.</p>`
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
