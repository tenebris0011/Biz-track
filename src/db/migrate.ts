import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './index'
import { resolve } from 'path'

export function runMigrations() {
  migrate(db, { migrationsFolder: resolve('./drizzle') })
}
