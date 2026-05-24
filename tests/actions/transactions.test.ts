import { describe, it, expect, beforeEach } from 'vitest'
import { testDb } from '../setup'
import { transactions } from '../../src/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

beforeEach(async () => {
  await testDb.delete(transactions).where(eq(transactions.userId, 'test-user-id'))
})

async function insert(overrides: Record<string, unknown> = {}) {
  const [row] = await testDb.insert(transactions).values({
    id: randomUUID(),
    userId: 'test-user-id',
    date: new Date('2026-01-15'),
    type: 'expense',
    amount: 49.99,
    description: 'Adobe Subscription',
    categoryId: null,
    notes: null,
    createdAt: new Date(),
    ...overrides,
  }).returning()
  return row
}

describe('transactions', () => {
  it('inserts and retrieves a transaction', async () => {
    const row = await insert()
    const [found] = await testDb.select().from(transactions).where(eq(transactions.id, row.id))
    expect(found.description).toBe('Adobe Subscription')
    expect(found.amount).toBe(49.99)
  })

  it('updates a transaction', async () => {
    const row = await insert()
    await testDb.update(transactions).set({ amount: 59.99 }).where(eq(transactions.id, row.id))
    const [updated] = await testDb.select().from(transactions).where(eq(transactions.id, row.id))
    expect(updated.amount).toBe(59.99)
  })

  it('deletes a transaction', async () => {
    const row = await insert()
    await testDb.delete(transactions).where(eq(transactions.id, row.id))
    const result = await testDb.select().from(transactions).where(eq(transactions.id, row.id))
    expect(result.length).toBe(0)
  })

  it('filters by type', async () => {
    await insert({ type: 'expense' })
    await insert({ id: randomUUID(), type: 'income', description: 'Wedding shoot', amount: 1200 })
    const expenses = await testDb.select().from(transactions).where(eq(transactions.type, 'expense'))
    expect(expenses.every(t => t.type === 'expense')).toBe(true)
  })
})
