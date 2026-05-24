import { describe, it, expect } from 'vitest'
import { buildTaxSummary } from '../../src/lib/tax'

describe('buildTaxSummary', () => {
  it('applies 50% factor to meals', () => {
    const summary = buildTaxSummary([{ amount: 100, irsLine: 'meals' }], 0, 0)
    const meals = summary.lines.find(l => l.irsLine === 'meals')
    expect(meals?.amount).toBe(50)
  })

  it('does not reduce non-meals expenses', () => {
    const summary = buildTaxSummary([{ amount: 200, irsLine: 'supplies' }], 0, 0)
    expect(summary.lines[0].amount).toBe(200)
  })

  it('calculates mileage deduction', () => {
    const summary = buildTaxSummary([], 100, 0.67)
    expect(summary.mileageDeduction).toBeCloseTo(67)
  })

  it('sums totalDeductions from lines and mileage', () => {
    const summary = buildTaxSummary([{ amount: 100, irsLine: 'supplies' }], 100, 0.67)
    expect(summary.totalDeductions).toBeCloseTo(167)
  })

  it('groups unknown irsLine under other', () => {
    const summary = buildTaxSummary([{ amount: 50, irsLine: null }], 0, 0)
    expect(summary.lines[0].irsLine).toBe('other')
  })
})
