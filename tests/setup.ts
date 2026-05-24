import { vi, beforeAll } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '../src/db/schema'
import { users } from '../src/db/schema'

const sqlite = new Database(':memory:')
export const testDb = drizzle(sqlite, { schema })

vi.mock('../src/db', () => ({ db: testDb }))
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: vi.fn() }),
}))
vi.mock('../src/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' },
        session: { id: 'test-session-id' },
      }),
    },
  },
}))

beforeAll(async () => {
  migrate(testDb, { migrationsFolder: './drizzle' })
  await testDb.insert(users).values({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: false,
    homeAddress: '123 Test St, Nashville, TN',
    defaultMileageRate: 0.67,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).onConflictDoNothing()
})
