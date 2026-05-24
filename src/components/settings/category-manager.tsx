'use client'
import { useState } from 'react'
import { createCategory, deleteCategory } from '@/actions/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { categories } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

type Category = InferSelectModel<typeof categories>

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [cats, setCats] = useState(initialCategories)
  const [name, setName] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const newCat = await createCategory({ name, type })
      setCats(prev => [...prev, newCat])
      setName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category')
    }
  }

  async function handleDelete(id: string) {
    setError('')
    const prev = cats
    setCats(cats.filter(c => c.id !== id))
    try {
      await deleteCategory(id)
    } catch (err) {
      setCats(prev)
      setError(err instanceof Error ? err.message : 'Failed to remove category')
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input placeholder="Category name" value={name} onChange={e => setName(e.target.value)} required />
        <Select value={type} onValueChange={v => setType(v as 'income' | 'expense')}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Add</Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ul className="space-y-1">
        {cats.map(cat => (
          <li key={cat.id} className="flex items-center justify-between py-1">
            <span className="text-sm">{cat.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant={cat.type === 'income' ? 'default' : 'secondary'}>{cat.type}</Badge>
              {cat.userId === null
                ? <span className="text-xs text-muted-foreground">default</span>
                : <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>Remove</Button>
              }
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
