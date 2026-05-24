import type { ImportResult } from '@/actions/import'

export function ImportResults({ result }: { result: ImportResult }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{result.imported} rows imported, {result.skipped} skipped.</p>
      {result.skippedRows.length > 0 && (
        <div className="border rounded-md divide-y text-sm">
          {result.skippedRows.map(s => (
            <div key={s.row} className="px-3 py-2 flex gap-4">
              <span className="text-muted-foreground">Row {s.row}</span>
              <span className="text-destructive">{s.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
