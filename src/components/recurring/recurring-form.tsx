'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRecurrenceRule } from '@/actions/recurring'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { InferSelectModel } from 'drizzle-orm'
import type { categories } from '@/db/schema'

type Category = InferSelectModel<typeof categories>

export function RecurringForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [isSubscription, setIsSubscription] = useState(true)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const [sy, sm, sd] = startDate.split('-').map(Number)
      await createRecurrenceRule({
        type,
        amount: parseFloat(amount),
        description,
        categoryId: categoryId || undefined,
        frequency,
        isSubscription,
        startDate: new Date(sy, sm - 1, sd),
        endDate: endDate ? (() => { const [y, m, d] = endDate.split('-').map(Number); return new Date(y, m - 1, d) })() : undefined,
      })
      router.push('/recurring')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rule')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Label>Type</Label>
        <Select value={type} onValueChange={v => setType(v as 'income' | 'expense')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Amount ($)</Label><Input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} required /></div>
      <div><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} required /></div>
      <div>
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {categories.filter(c => c.type === type).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Frequency</Label>
        <Select value={frequency} onValueChange={v => setFrequency(v as typeof frequency)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="sub" checked={isSubscription} onChange={e => setIsSubscription(e.target.checked)} />
        <Label htmlFor="sub">Auto-generate (subscription)</Label>
      </div>
      <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
      <div><Label>End Date (optional)</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit">Create Rule</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
