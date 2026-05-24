const IRS_LINE_LABELS: Record<string, string> = {
  advertising: 'Line 8 — Advertising',
  equipment: 'Line 13 — Depreciation / Section 179',
  insurance: 'Line 15 — Insurance',
  meals: 'Line 24b — Meals (50% deductible)',
  professional_services: 'Line 17 — Legal and professional services',
  rent_lease: 'Line 20a — Rent or lease',
  supplies: 'Line 22 — Supplies',
  travel: 'Line 24a — Travel',
  utilities: 'Line 25 — Utilities',
  other: 'Line 27a — Other expenses',
}

const MEALS_FACTOR = 0.5

export interface TaxLine {
  irsLine: string
  label: string
  amount: number
}

export interface TaxSummary {
  lines: TaxLine[]
  mileageDeduction: number
  totalDeductions: number
}

export function buildTaxSummary(
  expenses: Array<{ amount: number; irsLine: string | null }>,
  totalRoundTripMiles: number,
  mileageRate: number
): TaxSummary {
  const map = new Map<string, number>()
  for (const e of expenses) {
    const line = e.irsLine ?? 'other'
    const factor = line === 'meals' ? MEALS_FACTOR : 1
    map.set(line, (map.get(line) ?? 0) + e.amount * factor)
  }
  const lines: TaxLine[] = Array.from(map.entries()).map(([irsLine, amount]) => ({
    irsLine,
    label: IRS_LINE_LABELS[irsLine] ?? 'Line 27a — Other expenses',
    amount,
  }))
  const mileageDeduction = totalRoundTripMiles * mileageRate
  const totalDeductions = lines.reduce((s, l) => s + l.amount, 0) + mileageDeduction
  return { lines, mileageDeduction, totalDeductions }
}
