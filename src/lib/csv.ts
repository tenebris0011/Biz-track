import Papa from 'papaparse'

export interface ParsedCSV {
  headers: string[]
  rows: Record<string, string>[]
}

export function parseCSVText(text: string): ParsedCSV {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
  })
  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
  }
}

export type ColumnMappings = Record<string, string> // appField -> csvHeader

export function applyMappings(rows: Record<string, string>[], mappings: ColumnMappings): Record<string, string>[] {
  return rows.map(row => {
    const mapped: Record<string, string> = {}
    for (const [appField, csvHeader] of Object.entries(mappings)) {
      mapped[appField] = row[csvHeader] ?? ''
    }
    return mapped
  })
}

export function exportTransactionsCSV(
  rows: Array<{ date: Date; type: string; amount: number; description: string; categoryName: string | null; notes: string | null }>
): string {
  return Papa.unparse(rows.map(r => ({
    date: r.date.toISOString().slice(0, 10),
    type: r.type,
    amount: r.amount.toFixed(2),
    category: r.categoryName ?? '',
    description: r.description,
    notes: r.notes ?? '',
  })))
}

export function exportTripsCSV(
  rows: Array<{ date: Date; originAddress: string; destinationAddress: string; oneWayMiles: number; purpose: string; notes: string | null }>
): string {
  return Papa.unparse(rows.map(r => ({
    date: r.date.toISOString().slice(0, 10),
    origin: r.originAddress,
    destination: r.destinationAddress,
    one_way_miles: r.oneWayMiles.toFixed(2),
    round_trip_miles: (r.oneWayMiles * 2).toFixed(2),
    purpose: r.purpose,
    notes: r.notes ?? '',
  })))
}
