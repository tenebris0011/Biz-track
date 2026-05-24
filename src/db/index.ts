import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { mkdirSync } from 'fs'
import { dirname, resolve } from 'path'

const dbPath = resolve(process.env.DATABASE_URL ?? './data/biz-track.db')
mkdirSync(dirname(dbPath), { recursive: true })
const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
export const db = drizzle(sqlite, { schema })
