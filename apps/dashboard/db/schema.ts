// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const eventStore = sqliteTable('event_store', { id:text('id').primaryKey(), payload:text('payload').notNull(), version:integer('version').notNull().default(0), updatedAt:text('updated_at').notNull() });
export const operators = sqliteTable('operators', { userId:text('user_id').primaryKey(), role:text('role').notNull(), createdAt:text('created_at').notNull() });
export const staffAccounts=sqliteTable('staff_accounts',{id:text('id').primaryKey(),displayName:text('display_name').notNull(),passHash:text('pass_hash').notNull(),salt:text('salt').notNull(),active:integer('active').notNull().default(1),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()});
export const staffSessions=sqliteTable('staff_sessions',{tokenHash:text('token_hash').primaryKey(),staffId:text('staff_id').notNull(),expiresAt:integer('expires_at').notNull()});
export const staffLoginAttempts=sqliteTable('staff_login_attempts',{id:text('id').primaryKey(),attempts:integer('attempts').notNull(),windowStart:integer('window_start').notNull()});
