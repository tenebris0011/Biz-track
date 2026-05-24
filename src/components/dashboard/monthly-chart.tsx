'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function MonthlyChart({ data }: { data: { month: string; income: number; expenses: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis tickFormatter={v => `$${v}`} />
        <Tooltip formatter={(v) => typeof v === 'number' ? `$${v.toFixed(2)}` : v} />
        <Legend />
        <Bar dataKey="income" fill="#22c55e" name="Income" />
        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  )
}
