import { and, eq, gt, isNotNull, isNull, lt, or } from "drizzle-orm"
import { accounts, projects, timeEntries, users } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const query = getQuery(event)
  const projectId = typeof query.projectId === "string" ? query.projectId : ""
  const start = typeof query.start === "string" ? new Date(query.start) : new Date(Number.NaN)
  const end = typeof query.end === "string" ? new Date(query.end) : new Date(Number.NaN)

  if (!projectId || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    throw createError({ statusCode: 400, message: "A project and valid date range are required" })
  }

  // Keep this reporting endpoint scoped to a reasonably small range.
  if (end.getTime() - start.getTime() > 1000 * 60 * 60 * 24 * 31) {
    throw createError({ statusCode: 400, message: "Date range cannot exceed 31 days" })
  }

  const [project] = await useDrizzle()
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.workspaceId, secure.workspaceId), isNull(projects.deletedAt)))
    .limit(1)

  if (!project) throw createError({ statusCode: 404, message: "Project not found" })

  const [members, entries] = await Promise.all([
    useDrizzle()
      .select({
        userId: users.id,
        name: accounts.name,
        email: accounts.email
      })
      .from(users)
      .innerJoin(accounts, eq(users.accountId, accounts.id))
      .where(and(eq(users.workspaceId, secure.workspaceId), isNull(users.deletedAt))),
    useDrizzle()
      .select({
        userId: timeEntries.userId,
        startTime: timeEntries.startTime,
        endTime: timeEntries.endTime
      })
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.workspaceId, secure.workspaceId),
          eq(timeEntries.projectId, projectId),
          isNull(timeEntries.deletedAt),
          isNotNull(timeEntries.startTime),
          lt(timeEntries.startTime, end),
          or(isNull(timeEntries.endTime), gt(timeEntries.endTime, start))
        )
      )
  ])

  const startMs = start.getTime()
  const endMs = end.getTime()
  const nowMs = Date.now()
  const secondsByUser = new Map<string, number>()

  for (const entry of entries) {
    if (!entry.startTime) continue

    // Clip entries at the requested week boundaries. Active timers run up to now.
    const entryStartMs = Math.max(startMs, entry.startTime.getTime())
    const entryEndMs = Math.min(endMs, entry.endTime?.getTime() ?? nowMs)
    const seconds = Math.max(0, Math.floor((entryEndMs - entryStartMs) / 1000))

    secondsByUser.set(entry.userId, (secondsByUser.get(entry.userId) ?? 0) + seconds)
  }

  const people = members
    .map((member) => ({
      ...member,
      totalSeconds: secondsByUser.get(member.userId) ?? 0
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds || a.name.localeCompare(b.name))

  return {
    projectId,
    start: start.toISOString(),
    end: end.toISOString(),
    totalSeconds: people.reduce((total, person) => total + person.totalSeconds, 0),
    people
  }
})
