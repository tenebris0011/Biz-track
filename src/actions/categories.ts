'use server'
import { db } from '@/db'
import { categories } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, or, isNull, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function listCategories(type?: 'income' | 'expense') {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return db
    .select()
    .from(categories)
    .where(
      or(isNull(categories.userId), eq(categories.userId, session.user.id))
    )
    .then(rows => type ? rows.filter(r => r.type === type) : rows)
}

export async function createCategory(data: { name: string; type: 'income' | 'expense' }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const name = data.name.trim()
  if (!name) throw new Error('Category name is required')
  if (name.length > 100) throw new Error('Category name must be 100 characters or fewer')
  const [row] = await db.insert(categories).values({
    id: randomUUID(),
    userId: session.user.id,
    name,
    type: data.type,
    irsLine: null,
    createdAt: new Date(),
  }).returning()
  return row
}

export async function deleteCategory(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  // Only allow deleting user-owned categories (userId = session.user.id)
  await db.delete(categories).where(
    and(eq(categories.id, id), eq(categories.userId, session.user.id))
  )
}
