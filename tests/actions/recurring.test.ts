import { describe, it, expect, beforeEach } from 'vitest'
import { testDb } from '../setup'
import { recurrenceRules, transactions } from '../../src/db/schema'
import { eq, and, lte } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { advanceDate } from '../../src/lib/date-utils'

async function runCron(db: typeof testDb) {
  const now = new Date()
  const dueRules = await db.select().from(recurrenceRules)
    .where(and(
      eq(recurrenceRules.isSubscription, true),
      eq(recurrenceRules.isActive, true),
      lte(recurrenceRules.nextRunAt, now)
    ))
  for (const rule of dueRules) {
    db.transaction(tx => {
      tx.insert(transactions).values({
        id: randomUUID(), userId: rule.userId, date: now, type: rule.type,
        amount: rule.amount, description: rule.description,
        categoryId: rule.categoryId, notes: rule.notes, recurrenceId: rule.id, createdAt: now,
      }).run()
      const next = advanceDate(rule.nextRunAt, rule.frequency)
      tx.update(recurrenceRules).set({ nextRunAt: next }).where(eq(recurrenceRules.id, rule.id)).run()
    })
  }
}

beforeEach(async () => {
  await testDb.delete(transactions).where(eq(transactions.userId, 'test-user-id'))
  await testDb.delete(recurrenceRules).where(eq(recurrenceRules.userId, 'test-user-id'))
})

describe('advanceDate', () => {
  it('advances monthly by one month', () => {
    const base = new Date('2026-01-15')
    const next = advanceDate(base, 'monthly')
    expect(next.getUTCMonth()).toBe(1) // February (0-indexed)
  })

  it('advances weekly by 7 days', () => {
    const base = new Date('2026-01-01')
    const next = advanceDate(base, 'weekly')
    expect(next.getUTCDate()).toBe(8)
  })
})

describe('cron auto-generation', () => {
  it('creates a transaction for a due subscription rule', async () => {
    const pastDate = new Date('2026-01-01')
    await testDb.insert(recurrenceRules).values({
      id: 'rule-1', userId: 'test-user-id', type: 'expense', amount: 54.99,
      description: 'Adobe CC', categoryId: null, notes: null,
      frequency: 'monthly', isSubscription: true, nextRunAt: pastDate,
      endDate: null, isActive: true, createdAt: new Date(),
    })
    await runCron(testDb)
    const created = await testDb.select().from(transactions).where(eq(transactions.recurrenceId, 'rule-1'))
    expect(created.length).toBe(1)
    expect(created[0].amount).toBe(54.99)
  })

  it('does not create duplicate entries when run twice', async () => {
    const pastDate = new Date('2026-01-01')
    await testDb.insert(recurrenceRules).values({
      id: 'rule-2', userId: 'test-user-id', type: 'expense', amount: 10,
      description: 'Test Sub', categoryId: null, notes: null,
      frequency: 'yearly', isSubscription: true, nextRunAt: pastDate,
      endDate: null, isActive: true, createdAt: new Date(),
    })
    await runCron(testDb)
    await runCron(testDb) // second run — nextRunAt now in the future (2027-01-01)
    const created = await testDb.select().from(transactions).where(eq(transactions.recurrenceId, 'rule-2'))
    expect(created.length).toBe(1)
  })
})
