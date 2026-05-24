import { describe, it, expect, beforeEach } from 'vitest'
import { testDb } from '../setup'
import { trips } from '../../src/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

beforeEach(async () => {
  await testDb.delete(trips).where(eq(trips.userId, 'test-user-id'))
})

async function insertTrip(overrides: Record<string, unknown> = {}) {
  const [row] = await testDb.insert(trips).values({
    id: randomUUID(),
    userId: 'test-user-id',
    date: new Date('2026-03-10'),
    originAddress: '123 Test St, Nashville, TN',
    destinationAddress: '456 Oak Ave, Brentwood, TN',
    oneWayMiles: 12.4,
    purpose: 'Wedding shoot',
    notes: null,
    createdAt: new Date(),
    ...overrides,
  }).returning()
  return row
}

describe('trips', () => {
  it('stores one-way miles and round-trip is double', async () => {
    const trip = await insertTrip()
    expect(trip.oneWayMiles).toBe(12.4)
    expect(trip.oneWayMiles * 2).toBeCloseTo(24.8)
  })

  it('deletes a trip', async () => {
    const trip = await insertTrip()
    await testDb.delete(trips).where(eq(trips.id, trip.id))
    const result = await testDb.select().from(trips).where(eq(trips.id, trip.id))
    expect(result.length).toBe(0)
  })
})
