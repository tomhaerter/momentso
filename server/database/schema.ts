import { pgTable, timestamp, text, primaryKey, uuid, pgEnum } from "drizzle-orm/pg-core"
import { uuidv7 } from "uuidv7"

// Helpers
const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp({ withTimezone: true })
}

const organisationId = {
  organisationId: uuid()
    .notNull()
    .references(() => organisations.id)
}

export const subscriptionStatusEnum = pgEnum("subscription_status", ["trialing", "active", "canceled"])

// Tables
export const organisations = pgTable("organisations", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  stripeCustomerId: text().unique(),
  stripeSubscriptionId: text().unique(),
  subscriptionStatus: subscriptionStatusEnum().notNull().default("trialing"),
  ...timestamps
})

export const users = pgTable("users", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  email: text().unique(),
  password: text(),
  ...organisationId,
  ...timestamps
})

export const passwordResets = pgTable("password_resets", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  userId: uuid()
    .notNull()
    .references(() => users.id),
  token: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ...timestamps
})

export const sessions = pgTable(
  "sessions",
  {
    token: text().notNull().unique(),
    userId: uuid()
      .notNull()
      .references(() => users.id),
    ...timestamps
  },
  (t) => [primaryKey({ columns: [t.token, t.userId] })]
)

export const clients = pgTable("clients", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  ...organisationId,
  ...timestamps
})

export const projects = pgTable("projects", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  color: text().notNull().default("gray"),
  ...organisationId,
  ...timestamps
})

export const timeEntries = pgTable("time_entries", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  description: text(),
  startTime: timestamp({ withTimezone: true }),
  endTime: timestamp({ withTimezone: true }),
  projectId: uuid().references(() => projects.id),
  ...organisationId,
  ...timestamps
})
