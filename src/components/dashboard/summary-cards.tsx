import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SummaryCards({ totalIncome, totalExpenses, netProfit, totalRoundTripMiles, mileageRate }: {
  totalIncome: number; totalExpenses: number; netProfit: number; totalRoundTripMiles: number; mileageRate: number
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Income</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Expenses</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Net Profit</CardTitle></CardHeader>
        <CardContent><p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${netProfit.toFixed(2)}</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Miles (RT)</CardTitle></CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalRoundTripMiles.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">≈ ${(totalRoundTripMiles * mileageRate).toFixed(2)} deduction</p>
        </CardContent>
      </Card>
    </div>
  )
}
