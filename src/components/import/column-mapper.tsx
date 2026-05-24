'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const TRANSACTION_FIELDS = [
  { key: 'date', label: 'Date', required: true },
  { key: 'amount', label: 'Amount', required: true },
  { key: 'description', label: 'Description', required: true },
  { key: 'notes', label: 'Notes', required: false },
]

const TRIP_FIELDS = [
  { key: 'date', label: 'Date', required: true },
  { key: 'origin', label: 'Origin Address', required: true },
  { key: 'destination', label: 'Destination Address', required: true },
  { key: 'purpose', label: 'Purpose', required: true },
  { key: 'miles', label: 'One-way Miles', required: true },
  { key: 'notes', label: 'Notes', required: false },
]

export function ColumnMapper({
  csvHeaders, importType, mappings, onChange,
}: {
  csvHeaders: string[]
  importType: 'income' | 'expense' | 'trip'
  mappings: Record<string, string>
  onChange: (mappings: Record<string, string>) => void
}) {
  const fields = importType === 'trip' ? TRIP_FIELDS : TRANSACTION_FIELDS

  return (
    <div className="space-y-3">
      {fields.map(field => (
        <div key={field.key} className="flex items-center gap-4">
          <Label className="w-40 shrink-0">{field.label}{field.required ? ' *' : ''}</Label>
          <Select value={mappings[field.key] ?? ''} onValueChange={v => onChange({ ...mappings, [field.key]: v })}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Select CSV column" /></SelectTrigger>
            <SelectContent>
              {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  )
}
