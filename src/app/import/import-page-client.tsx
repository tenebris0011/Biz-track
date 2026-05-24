'use client'
import { useState } from 'react'
import { CSVUploader } from '@/components/import/csv-uploader'
import { ColumnMapper } from '@/components/import/column-mapper'
import { ImportResults } from '@/components/import/import-results'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { applyMappings, type ParsedCSV } from '@/lib/csv'
import { importTransactions, importTrips, type ImportResult } from '@/actions/import'
import { saveImportTemplate } from '@/actions/templates'
import type { InferSelectModel } from 'drizzle-orm'
import type { csvImportTemplates } from '@/db/schema'

type Template = InferSelectModel<typeof csvImportTemplates>

export function ImportPageClient({ initialTemplates }: { initialTemplates: Template[] }) {
  const [parsed, setParsed] = useState<ParsedCSV | null>(null)
  const [importType, setImportType] = useState<'income' | 'expense' | 'trip'>('expense')
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [templateName, setTemplateName] = useState('')
  const [templates, setTemplates] = useState(initialTemplates)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function applyTemplate(template: Template) {
    const mappings = JSON.parse(template.columnMappings) as Record<string, string>
    setImportType(template.importType)
    setMappings(mappings)
  }

  async function handleImport() {
    if (!parsed) return
    setLoading(true)
    setError('')
    try {
      const mapped = applyMappings(parsed.rows, mappings)
      const res = importType === 'trip'
        ? await importTrips(mapped)
        : await importTransactions(mapped, importType)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    }
    setLoading(false)
  }

  async function handleSaveTemplate() {
    if (!templateName.trim()) return
    setError('')
    try {
      await saveImportTemplate(templateName, importType, mappings)
      setTemplateName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Import CSV</h1>
      {!parsed ? (
        <div className="space-y-4">
          {templates.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Saved templates</p>
              <div className="flex flex-wrap gap-2">
                {templates.map(t => (
                  <Button key={t.id} variant="outline" size="sm" onClick={() => applyTemplate(t)}>
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <CSVUploader onParsed={setParsed} />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <Label>Import type</Label>
            <Select value={importType} onValueChange={v => setImportType(v as typeof importType)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="trip">Trip</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Preview (first 5 rows)</p>
            <div className="overflow-x-auto border rounded text-xs">
              <table className="w-full">
                <thead><tr>{parsed.headers.map(h => <th key={h} className="px-2 py-1 text-left bg-muted">{h}</th>)}</tr></thead>
                <tbody>{parsed.rows.slice(0, 5).map((row, i) => <tr key={i}>{parsed.headers.map(h => <td key={h} className="px-2 py-1 border-t">{row[h]}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
          <ColumnMapper csvHeaders={parsed.headers} importType={importType} mappings={mappings} onChange={setMappings} />
          <div className="flex gap-2">
            <Input placeholder="Save mapping as template…" value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-64" />
            <Button variant="outline" onClick={handleSaveTemplate} disabled={!templateName.trim()}>Save Template</Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {result ? (
            <div className="space-y-4">
              <ImportResults result={result} />
              <Button variant="outline" onClick={() => { setParsed(null); setResult(null); setMappings({}) }}>Import another file</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={loading}>{loading ? 'Importing…' : 'Import'}</Button>
              <Button variant="outline" onClick={() => setParsed(null)}>Start over</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
