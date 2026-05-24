import { describe, it, expect } from 'vitest'
import { exportTransactionsCSV, exportTripsCSV } from '../../src/lib/csv'

describe('exportTransactionsCSV', () => {
  it('produces CSV with correct headers and values', () => {
    const csv = exportTransactionsCSV([{
      date: new Date('2026-01-15T12:00:00Z'), type: 'expense', amount: 49.99,
      description: 'Adobe CC', categoryName: 'Software', notes: null,
    }])
    expect(csv).toContain('date')
    expect(csv).toContain('2026-01-15')
    expect(csv).toContain('49.99')
    expect(csv).toContain('Adobe CC')
  })
})

describe('exportTripsCSV', () => {
  it('includes both one-way and round-trip miles', () => {
    const csv = exportTripsCSV([{
      date: new Date('2026-03-10T12:00:00Z'), originAddress: '123 Main St',
      destinationAddress: '456 Oak Ave', oneWayMiles: 12.4,
      purpose: 'Wedding shoot', notes: null,
    }])
    expect(csv).toContain('one_way_miles')
    expect(csv).toContain('round_trip_miles')
    expect(csv).toContain('12.40')
    expect(csv).toContain('24.80')
  })
})
