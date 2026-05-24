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
