export default defineEventHandler(async (event) => {
  try {
    await requireUserSession(event)
    await clearUserSession(event)
  } catch {
    console.error("logout failed")
  }

  await sendRedirect(event, "/login", 302)
})
