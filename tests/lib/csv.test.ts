import { describe, it, expect } from 'vitest'
import { parseCSVText, applyMappings } from '../../src/lib/csv'

const SAMPLE_CSV = `Date,Merchant,Amount,Notes
2026-01-15,Adobe,54.99,Creative Cloud
2026-01-20,B&H Photo,249.00,Filters`

describe('parseCSVText', () => {
  it('parses headers and rows', () => {
    const { headers, rows } = parseCSVText(SAMPLE_CSV)
    expect(headers).toEqual(['Date', 'Merchant', 'Amount', 'Notes'])
    expect(rows).toHaveLength(2)
    expect(rows[0].Merchant).toBe('Adobe')
  })
})

describe('applyMappings', () => {
  it('remaps csv columns to app fields', () => {
    const { rows } = parseCSVText(SAMPLE_CSV)
    const mapped = applyMappings(rows, { date: 'Date', description: 'Merchant', amount: 'Amount' })
    expect(mapped[0].date).toBe('2026-01-15')
    expect(mapped[0].description).toBe('Adobe')
    expect(mapped[0].amount).toBe('54.99')
  })

  it('uses empty string for unmapped fields', () => {
    const { rows } = parseCSVText(SAMPLE_CSV)
    const mapped = applyMappings(rows, { date: 'Date', notes: 'NonExistentCol' })
    expect(mapped[0].notes).toBe('')
  })
})
