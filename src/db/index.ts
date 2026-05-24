import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { mkdirSync } from 'fs'
import { dirname, resolve } from 'path'

type Db = ReturnType<typeof drizzle<typeof schema>>

let _instance: Db | null = null

function getInstance(): Db {
  if (!_instance) {
    const dbPath = resolve(process.env.DATABASE_URL ?? './data/biz-track.db')
    mkdirSync(dirname(dbPath), { recursive: true })
    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    _instance = drizzle(sqlite, { schema })
  }
  return _instance
}

export const db: Db = new Proxy({} as Db, {
  get(_, prop: string | symbol) {
    return Reflect.get(getInstance(), prop)
  },
})
