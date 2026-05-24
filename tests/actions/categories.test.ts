import { describe, it, expect, beforeEach } from 'vitest'
import { testDb } from '../setup'
import { categories } from '../../src/db/schema'
import { seedDefaults } from '../../src/db/seed'
import { isNull, eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

beforeEach(async () => {
  await testDb.delete(categories).where(eq(categories.userId, 'test-user-id'))
})

describe('seedDefaults', () => {
  it('inserts default categories on first run', async () => {
    await testDb.delete(categories).where(isNull(categories.userId))
    await seedDefaults()
    const defaults = await testDb.select().from(categories).where(isNull(categories.userId))
    expect(defaults.length).toBeGreaterThan(0)
    expect(defaults.some(c => c.name === 'Advertising')).toBe(true)
  })

  it('does not duplicate defaults on second run', async () => {
    await seedDefaults()
    await seedDefaults()
    const defaults = await testDb.select().from(categories).where(isNull(categories.userId))
    const advertising = defaults.filter(c => c.name === 'Advertising')
    expect(advertising.length).toBe(1)
  })
})

describe('createCategory', () => {
  it('creates a user-owned custom category', async () => {
    const [row] = await testDb.insert(categories).values({
      id: randomUUID(),
      userId: 'test-user-id',
      name: 'Props',
      type: 'expense',
      irsLine: null,
      createdAt: new Date(),
    }).returning()
    expect(row.name).toBe('Props')
    expect(row.userId).toBe('test-user-id')
  })
})
