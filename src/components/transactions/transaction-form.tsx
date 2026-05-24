'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTransaction, updateTransaction } from '@/actions/transactions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { InferSelectModel } from 'drizzle-orm'
import type { transactions, categories } from '@/db/schema'

type Transaction = InferSelectModel<typeof transactions>
type Category = InferSelectModel<typeof categories>

export function TransactionForm({
  categories,
  transaction,
}: {
  categories: Category[]
  transaction?: Transaction
}) {
  const router = useRouter()
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type ?? 'expense')
  const [date, setDate] = useState(transaction?.date.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState(String(transaction?.amount ?? ''))
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '')
  const [notes, setNotes] = useState(transaction?.notes ?? '')
  const [error, setError] = useState('')

  const filteredCats = categories.filter(c => c.type === type)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const data = {
        date: new Date(date),
        type,
        amount: parseFloat(amount),
        description,
        categoryId: categoryId || undefined,
        notes: notes || undefined,
      }
      if (transaction) {
        await updateTransaction(transaction.id, data)
      } else {
        await createTransaction(data)
      }
      router.push('/transactions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Label>Type</Label>
        <Select value={type} onValueChange={v => { setType(v as 'income' | 'expense'); setCategoryId('') }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
      <div><Label>Amount ($)</Label><Input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required /></div>
      <div><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} required /></div>
      <div>
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {filteredCats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit">{transaction ? 'Save Changes' : 'Add Transaction'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
