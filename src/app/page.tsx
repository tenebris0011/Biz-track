import { getDashboardData } from '@/actions/dashboard'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { MonthlyChart } from '@/components/dashboard/monthly-chart'
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown'
import { TaxSummaryPanel } from '@/components/dashboard/tax-summary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { YearSelector } from '@/components/dashboard/year-selector'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const sp = await searchParams
  const year = parseInt(sp.year ?? String(new Date().getFullYear()))
  const data = await getDashboardData(isNaN(year) ? new Date().getFullYear() : year)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard — {year}</h1>
        <YearSelector currentYear={year} />
      </div>
      <SummaryCards {...data} />
      <Card>
        <CardHeader><CardTitle>Monthly Overview</CardTitle></CardHeader>
        <CardContent><MonthlyChart data={data.monthly} /></CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardContent className="pt-6"><CategoryBreakdown data={data.categoryBreakdown} /></CardContent></Card>
        <Card><CardContent className="pt-6"><TaxSummaryPanel summary={data.taxSummary} /></CardContent></Card>
      </div>
    </div>
  )
}
