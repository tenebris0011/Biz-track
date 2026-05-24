'use server'
import { db } from '@/db'
import { transactions, categories } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

export type TransactionInput = {
  date: Date
  type: 'income' | 'expense'
  amount: number
  description: string
  categoryId?: string
  notes?: string
}

export async function listTransactions(filters?: {
  type?: 'income' | 'expense'
  from?: Date
  to?: Date
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  const conditions = [eq(transactions.userId, session.user.id)]
  if (filters?.type) conditions.push(eq(transactions.type, filters.type))
  if (filters?.from) conditions.push(gte(transactions.date, filters.from))
  if (filters?.to) conditions.push(lte(transactions.date, filters.to))

  return db
    .select({ transaction: transactions, category: categories })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date))
}

export async function createTransaction(data: TransactionInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  await db.insert(transactions).values({
    id: randomUUID(),
    userId: session.user.id,
    date: data.date,
    type: data.type,
    amount: data.amount,
    description: data.description,
    categoryId: data.categoryId ?? null,
    notes: data.notes ?? null,
    createdAt: new Date(),
  })
  revalidatePath('/transactions')
  revalidatePath('/')
}

export async function updateTransaction(id: string, data: TransactionInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  await db
    .update(transactions)
    .set({
      date: data.date,
      type: data.type,
      amount: data.amount,
      description: data.description,
      categoryId: data.categoryId ?? null,
      notes: data.notes ?? null,
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)))
  revalidatePath('/transactions')
  revalidatePath('/')
}

export async function deleteTransaction(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)))
  revalidatePath('/transactions')
  revalidatePath('/')
}

export async function getTransaction(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const [row] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)))
  return row
}
