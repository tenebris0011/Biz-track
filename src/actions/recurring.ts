'use server'
import { db } from '@/db'
import { recurrenceRules, transactions } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { advanceDate } from '@/lib/date-utils'

export type RecurrenceInput = {
  type: 'income' | 'expense'
  amount: number
  description: string
  categoryId?: string
  notes?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  isSubscription: boolean
  startDate: Date
  endDate?: Date
}

export async function listRecurrenceRules() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return db.select().from(recurrenceRules).where(eq(recurrenceRules.userId, session.user.id))
}

export async function createRecurrenceRule(data: RecurrenceInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const desc = data.description.trim()
  if (!desc) throw new Error('Description is required')
  const amount = Math.round(data.amount * 100) / 100
  if (!isFinite(amount) || amount <= 0) throw new Error('Amount must be a positive number')
  await db.insert(recurrenceRules).values({
    id: randomUUID(),
    userId: session.user.id,
    type: data.type,
    amount,
    description: desc,
    categoryId: data.categoryId ?? null,
    notes: data.notes ?? null,
    frequency: data.frequency,
    isSubscription: data.isSubscription,
    nextRunAt: data.startDate,
    endDate: data.endDate ?? null,
    isActive: true,
    createdAt: new Date(),
  })
  revalidatePath('/recurring')
}

export async function toggleRecurrenceRule(id: string, isActive: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  await db.update(recurrenceRules)
    .set({ isActive })
    .where(and(eq(recurrenceRules.id, id), eq(recurrenceRules.userId, session.user.id)))
  revalidatePath('/recurring')
}

export async function deleteRecurrenceRule(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  await db.delete(recurrenceRules)
    .where(and(eq(recurrenceRules.id, id), eq(recurrenceRules.userId, session.user.id)))
  revalidatePath('/recurring')
}

export async function logManualOccurrence(ruleId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const [rule] = await db.select().from(recurrenceRules)
    .where(and(eq(recurrenceRules.id, ruleId), eq(recurrenceRules.userId, session.user.id)))
  if (!rule) throw new Error('Rule not found')
  const now = new Date()
  db.transaction(tx => {
    tx.insert(transactions).values({
      id: randomUUID(),
      userId: session.user.id,
      date: now,
      type: rule.type,
      amount: rule.amount,
      description: rule.description,
      categoryId: rule.categoryId,
      notes: rule.notes,
      recurrenceId: rule.id,
      createdAt: now,
    }).run()
    const nextRunAt = advanceDate(rule.nextRunAt, rule.frequency)
    const isActive = !rule.endDate || nextRunAt <= rule.endDate
    tx.update(recurrenceRules).set({ nextRunAt, isActive }).where(eq(recurrenceRules.id, ruleId)).run()
  })
  revalidatePath('/recurring')
  revalidatePath('/transactions')
}
