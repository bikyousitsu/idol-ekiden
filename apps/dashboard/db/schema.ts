// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const eventStore = sqliteTable('event_store', { id:text('id').primaryKey(), payload:text('payload').notNull(), version:integer('version').notNull().default(0), updatedAt:text('updated_at').notNull() });
export const operators = sqliteTable('operators', { userId:text('user_id').primaryKey(), role:text('role').notNull(), createdAt:text('created_at').notNull() });
