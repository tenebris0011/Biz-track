export function CategoryBreakdown({ data }: { data: { name: string; amount: number }[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0)
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Expenses by Category</h3>
      {data.map(d => (
        <div key={d.name} className="flex items-center justify-between text-sm">
          <span>{d.name}</span>
          <span className="text-muted-foreground">
            ${d.amount.toFixed(2)} ({total > 0 ? ((d.amount / total) * 100).toFixed(0) : 0}%)
          </span>
        </div>
      ))}
      {data.length === 0 && <p className="text-sm text-muted-foreground">No expense data.</p>}
    </div>
  )
}
