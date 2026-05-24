'use client'
import { useState } from 'react'
import Link from 'next/link'
import { deleteTransaction } from '@/actions/transactions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Row = {
  transaction: { id: string; date: Date; type: 'income' | 'expense'; amount: number; description: string }
  category: { name: string } | null
}

export function TransactionList({ rows: initialRows }: { rows: Row[] }) {
  const [rows, setRows] = useState(initialRows)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [error, setError] = useState('')
  const filtered = filter === 'all' ? rows : rows.filter(r => r.transaction.type === filter)

  async function handleDelete(id: string) {
    if (!confirm('Delete this transaction?')) return
    setError('')
    const prev = rows
    setRows(rows.filter(r => r.transaction.id !== id))
    try {
      await deleteTransaction(id)
    } catch (err) {
      setRows(prev)
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={filter} onValueChange={v => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/transactions/new"><Button>Add Transaction</Button></Link>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="border rounded-md divide-y">
        {filtered.map(({ transaction: t, category }) => (
          <div key={t.id} className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium">{t.description}</p>
              <p className="text-xs text-muted-foreground">{t.date.toLocaleDateString()} · {category?.name ?? '—'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={t.type === 'income' ? 'default' : 'secondary'}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </Badge>
              <Link href={`/transactions/${t.id}/edit`}><Button variant="ghost" size="sm">Edit</Button></Link>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>Delete</Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground">No transactions.</p>}
      </div>
    </div>
  )
}
