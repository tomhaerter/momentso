import { defineRelations } from "drizzle-orm"
import * as schema from "./schema"

export const relations = defineRelations(schema, (r) => ({
  accounts: {
    users: r.many.users(),
    sessions: r.many.sessions(),
    createdInvites: r.many.workspaceInvites({ from: r.accounts.id, to: r.workspaceInvites.createdBy }),
    acceptedInvites: r.many.workspaceInvites({ from: r.accounts.id, to: r.workspaceInvites.acceptedBy })
  },
  workspaces: {
    users: r.many.users(),
    sessions: r.many.sessions(),
    clients: r.many.clients(),
    projects: r.many.projects(),
    timeEntries: r.many.timeEntries(),
    workspaceInvites: r.many.workspaceInvites()
  },
  users: {
    account: r.one.accounts({
      from: r.users.accountId,
      to: r.accounts.id
    }),
    workspace: r.one.workspaces({
      from: r.users.workspaceId,
      to: r.workspaces.id
    }),
    sessions: r.many.sessions(),
    timeEntries: r.many.timeEntries()
  },
  sessions: {
    account: r.one.accounts({
      from: r.sessions.accountId,
      to: r.accounts.id
    }),
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id
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
    }),
    user: r.one.users({
      from: r.timeEntries.userId,
      to: r.users.id,
      optional: true
    })
  },
  workspaceInvites: {
    workspace: r.one.workspaces({
      from: r.workspaceInvites.workspaceId,
      to: r.workspaces.id
    }),
    creator: r.one.accounts({
      from: r.workspaceInvites.createdBy,
      to: r.accounts.id
    }),
    accepter: r.one.accounts({
      from: r.workspaceInvites.acceptedBy,
      to: r.accounts.id,
      optional: true
    })
  }
}))
