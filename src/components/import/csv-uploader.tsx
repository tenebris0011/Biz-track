'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { parseCSVText, type ParsedCSV } from '@/lib/csv'

export function CSVUploader({ onParsed }: { onParsed: (data: ParsedCSV) => void }) {
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File) {
    const text = await file.text()
    onParsed(parseCSVText(text))
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center ${dragging ? 'border-primary bg-muted' : 'border-muted-foreground/30'}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
    >
      <p className="text-sm text-muted-foreground mb-3">Drop a CSV file here, or</p>
      <label>
        <Button type="button" variant="outline" asChild><span>Browse files</span></Button>
        <input type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </label>
    </div>
  )
}
