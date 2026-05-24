import { describe, it, expect, beforeEach, vi } from 'vitest'
import { testDb } from '../setup'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))
import { transactions, trips } from '../../src/db/schema'
import { eq } from 'drizzle-orm'
import { importTransactions, importTrips } from '../../src/actions/import'

beforeEach(async () => {
  await testDb.delete(transactions).where(eq(transactions.userId, 'test-user-id'))
  await testDb.delete(trips).where(eq(trips.userId, 'test-user-id'))
})

describe('importTransactions', () => {
  it('imports valid rows', async () => {
    const rows = [{ date: '2026-01-15', amount: '49.99', description: 'Adobe CC', notes: '' }]
    const result = await importTransactions(rows, 'expense')
    expect(result.imported).toBe(1)
    expect(result.skipped).toBe(0)
  })

  it('skips rows with invalid amount', async () => {
    const rows = [{ date: '2026-01-15', amount: 'not-a-number', description: 'Test', notes: '' }]
    const result = await importTransactions(rows, 'expense')
    expect(result.skipped).toBe(1)
    expect(result.skippedRows[0].reason).toBe('Invalid amount')
  })

  it('skips rows with missing description', async () => {
    const rows = [{ date: '2026-01-15', amount: '10.00', description: '', notes: '' }]
    const result = await importTransactions(rows, 'expense')
    expect(result.skipped).toBe(1)
    expect(result.skippedRows[0].reason).toBe('Missing description')
  })

  it('imports valid and skips invalid in same batch', async () => {
    const rows = [
      { date: '2026-01-15', amount: '49.99', description: 'Valid', notes: '' },
      { date: 'bad-date', amount: '10.00', description: 'Bad date', notes: '' },
    ]
    const result = await importTransactions(rows, 'expense')
    expect(result.imported).toBe(1)
    expect(result.skipped).toBe(1)
  })
})

describe('importTrips', () => {
  it('imports valid trip rows', async () => {
    const rows = [{ date: '2026-03-10', origin: '123 Main St', destination: '456 Oak Ave', purpose: 'Shoot', miles: '12.4', notes: '' }]
    const result = await importTrips(rows)
    expect(result.imported).toBe(1)
  })

  it('skips rows with missing destination', async () => {
    const rows = [{ date: '2026-03-10', origin: '123 Main St', destination: '', purpose: 'Shoot', miles: '12.4', notes: '' }]
    const result = await importTrips(rows)
    expect(result.skipped).toBe(1)
    expect(result.skippedRows[0].reason).toBe('Missing destination')
  })
})
