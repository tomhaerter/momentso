import { pgTable, timestamp, text, primaryKey, uuid, pgEnum, uniqueIndex } from "drizzle-orm/pg-core"
import { uuidv7 } from "uuidv7"

// Helpers — column names are explicitly aliased to snake_case to match DB
// convention. (Drizzle v1 RC removed the `casing` option from `drizzle()`
// config, and `pgTableCreator` isn't recognized by `drizzle-kit generate`.)
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
}

const workspaceId = {
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id)
}

export const workspaceUserRoleEnum = pgEnum("workspace_user_role", ["owner", "member"])

export const subscriptionStatusEnum = pgEnum("subscription_status", ["trialing", "active", "canceled"])

// Tables
export const accounts = pgTable("accounts", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  email: text().unique(),
  password: text(),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpiresAt: timestamp("reset_password_expires_at", { withTimezone: true }),
  ...timestamps
})

export const workspaces = pgTable("workspaces", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").notNull().default("trialing"),
  ...timestamps
})

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().$defaultFn(uuidv7),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    role: workspaceUserRoleEnum("role").notNull().default("member"),
    ...timestamps
  },
  (t) => [
    primaryKey({ columns: [t.accountId, t.workspaceId] }),
    uniqueIndex("users_id_idx").on(t.id)
  ]
)

export const sessions = pgTable(
  "sessions",
  {
    token: text().notNull().unique(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    ...timestamps
  },
  (t) => [primaryKey({ columns: [t.token, t.accountId] })]
)

export const clients = pgTable("clients", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  ...workspaceId,
  ...timestamps
})

export const projects = pgTable("projects", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  color: text().notNull().default("gray"),
  clientId: uuid("client_id").references(() => clients.id),
  ...workspaceId,
  ...timestamps
})

export const timeEntries = pgTable("time_entries", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  description: text(),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  projectId: uuid("project_id").references(() => projects.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  ...workspaceId,
  ...timestamps
})

export const workspaceInvites = pgTable(
  "workspace_invites",
  {
    id: uuid().primaryKey().$defaultFn(uuidv7),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    email: text().notNull(),
    token: text().notNull().unique(),
    role: workspaceUserRoleEnum("role").notNull().default("member"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => accounts.id),
    acceptedBy: uuid("accepted_by").references(() => accounts.id),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps
  },
  (t) => [uniqueIndex("workspace_invites_token_idx").on(t.token)]
)
