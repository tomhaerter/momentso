import { defineRelations } from "drizzle-orm"
import * as schema from "./schema"

export const relations = defineRelations(schema, (r) => ({
  accounts: {
    workspaceUsers: r.many.workspaceUsers(),
    sessions: r.many.sessions()
  },
  workspaces: {
    workspaceUsers: r.many.workspaceUsers(),
    sessions: r.many.sessions(),
    clients: r.many.clients(),
    projects: r.many.projects(),
    timeEntries: r.many.timeEntries()
  },
  workspaceUsers: {
    account: r.one.accounts({
      from: r.workspaceUsers.accountId,
      to: r.accounts.id
    }),
    workspace: r.one.workspaces({
      from: r.workspaceUsers.workspaceId,
      to: r.workspaces.id
    })
  },
  sessions: {
    account: r.one.accounts({
      from: r.sessions.accountId,
      to: r.accounts.id
    }),
    workspace: r.one.workspaces({
      from: r.sessions.workspaceId,
      to: r.workspaces.id
    })
  },
  clients: {
    workspace: r.one.workspaces({
      from: r.clients.workspaceId,
      to: r.workspaces.id
    }),
    projects: r.many.projects()
  },
  projects: {
    workspace: r.one.workspaces({
      from: r.projects.workspaceId,
      to: r.workspaces.id
    }),
    client: r.one.clients({
      from: r.projects.clientId,
      to: r.clients.id,
      optional: true
    }),
    timeEntries: r.many.timeEntries()
  },
  timeEntries: {
    workspace: r.one.workspaces({
      from: r.timeEntries.workspaceId,
      to: r.workspaces.id
    }),
    project: r.one.projects({
      from: r.timeEntries.projectId,
      to: r.projects.id,
      optional: true
    })
  }
}))
