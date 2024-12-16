import { relations, sql } from 'drizzle-orm'
import { int, mysqlTable, varchar, datetime, index } from 'drizzle-orm/mysql-core'

export const userRole = mysqlTable(
  'user_roles',
  {
    role: varchar('role', { length: 50 }).notNull().primaryKey(),
    isRoleActive: int('is_role_active').notNull(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
    deletedAt: datetime('deleted_at'),
  },
  (table) => {
    return {
      roleIndex: index('role_idx').on(table.role),
      isRoleActiveIndex: index('is_role_active_idx').on(table.isRoleActive),
    }
  }
)

export const user = mysqlTable(
  'users',
  {
    userId: int('id').primaryKey().notNull().autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    lastname: varchar('lastname', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 72 }).notNull(), // Adjusted length for bcrypt hash
    age: int('age'),
    role: varchar('role_id', { length: 50 })
      .notNull()
      .references(() => userRole.role),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
    deletedAt: datetime('deleted_at'),
  },
  (table) => {
    return {
      emailIndex: index('email_idx').on(table.email),
      roleIdIndex: index('role_id_idx').on(table.role),
    }
  }
)

export const userRoleRelationship = relations(userRole, ({ many }) => ({
  users: many(user),
}))

export const userRelationship = relations(user, ({ one }) => ({
  userRole: one(userRole, {
    fields: [user.role],
    references: [userRole.role],
  }),
}))

export const userTokenRelationship = relations(user, ({ one }) => ({
  userTokens: one(authAccessToken),
}))

export const authAccessToken = mysqlTable(
  'auth_access_tokens',
  {
    authTokenId: int('id')
      .primaryKey()
      .notNull()
      .references(() => user.userId),
    type: varchar('type', { length: 40 }).notNull(),
    hash: varchar('hash', { length: 255 }).notNull(),
    aliveBy: varchar('alive_by', { length: 14 }).notNull(),
    createdAt: datetime('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
    lastUsedAt: datetime('last_used_at'),
    expiresAt: datetime('expires_at').notNull(),
  },
  (table) => {
    return {
      authTokenIdIndex: index('auth_token_id_idx').on(table.authTokenId),
      typeIndex: index('type_idx').on(table.type),
      aliveByIndex: index('alive_by_idx').on(table.aliveBy),
    }
  }
)

export const authUserRelationship = relations(authAccessToken, ({ one }) => ({
  user: one(user, { fields: [authAccessToken.authTokenId], references: [user.userId] }),
}))
