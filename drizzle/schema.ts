import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').default(false).notNull(),
    image: text('image'),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull()
});

export const session = pgTable("session", {
    id: uuid('id').primaryKey().defaultRandom(),
    expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: uuid('userId').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: uuid('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull()
});

export const verification = pgTable("verification", {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow()
});