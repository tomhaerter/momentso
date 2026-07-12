import { sessions } from "../database/schema"
import { eq, isNull, and } from "drizzle-orm"

// server/plugins/session.ts
export default defineNitroPlugin(() => {
  // Called when the session is fetched during SSR for the Vue composable (/api/_auth/session)
  // Or when we call useUserSession().fetch()
  sessionHooks.hook("fetch", async (session, _event) => {
    // Fetching the session while logged out is expected and should return an
    // anonymous session instead of failing the auth endpoint.
    if (!session.secure?.token) return

    const [existing] = await useDrizzle()
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, session.secure.token), isNull(sessions.deletedAt)))
      .limit(1)
    if (!existing) throw createError({ statusCode: 401, message: "Invalid token" })

    const expiresAt = existing.createdAt.getTime() + 1000 * 60 * 60 * 24 * 7
    if (Date.now() > expiresAt) throw createError({ statusCode: 401, message: "Invalid token" })
  })
  // Called when we call useUserSession().clear() or clearUserSession(event)
  sessionHooks.hook("clear", async (session, _event) => {
    if (!session.secure?.token) return

    // Log that user logged out
    await useDrizzle().update(sessions).set({ deletedAt: new Date() }).where(eq(sessions.token, session.secure.token))
  })
})
