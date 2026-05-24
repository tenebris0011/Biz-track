import type { TaxSummary } from '@/lib/tax'

export function TaxSummaryPanel({ summary }: { summary: TaxSummary }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Schedule C Summary</h3>
      {summary.lines.map(l => (
        <div key={l.irsLine} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{l.label}</span>
          <span>${l.amount.toFixed(2)}</span>
        </div>
      ))}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Mileage deduction</span>
        <span>${summary.mileageDeduction.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-semibold border-t pt-2">
        <span>Total deductions</span>
        <span>${summary.totalDeductions.toFixed(2)}</span>
      </div>
      {summary.lines.length === 0 && summary.mileageDeduction === 0 && (
        <p className="text-sm text-muted-foreground">No deductible expenses this year.</p>
      )}
    </div>
  )
}
