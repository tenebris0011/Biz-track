import { db } from './index'
import { categories } from './schema'
import { isNull } from 'drizzle-orm'
import { randomUUID } from 'crypto'

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Advertising', irsLine: 'advertising' },
  { name: 'Equipment', irsLine: 'equipment' },
  { name: 'Insurance', irsLine: 'insurance' },
  { name: 'Meals', irsLine: 'meals' },
  { name: 'Professional Services', irsLine: 'professional_services' },
  { name: 'Rent / Lease', irsLine: 'rent_lease' },
  { name: 'Supplies', irsLine: 'supplies' },
  { name: 'Travel', irsLine: 'travel' },
  { name: 'Utilities', irsLine: 'utilities' },
  { name: 'Other', irsLine: 'other' },
]

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Photography Services', irsLine: null },
  { name: 'Licensing / Royalties', irsLine: null },
  { name: 'Other Income', irsLine: null },
]

export async function seedDefaults() {
  const existing = await db.select().from(categories).where(isNull(categories.userId))
  if (existing.length > 0) return

  const rows = [
    ...DEFAULT_EXPENSE_CATEGORIES.map(c => ({ id: randomUUID(), userId: null, type: 'expense' as const, ...c, createdAt: new Date() })),
    ...DEFAULT_INCOME_CATEGORIES.map(c => ({ id: randomUUID(), userId: null, type: 'income' as const, ...c, createdAt: new Date() })),
  ]
  await db.insert(categories).values(rows)
}
