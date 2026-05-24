import cron from 'node-cron'
import { db } from '@/db'
import { recurrenceRules, transactions } from '@/db/schema'
import { and, eq, lte } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { advanceDate } from '@/actions/recurring'

export function startCronJobs() {
  cron.schedule('0 0 * * *', processDueSubscriptions)
  console.log('[cron] Subscription job scheduled (daily midnight)')
}

export async function processDueSubscriptions() {
  const now = new Date()
  const dueRules = await db
    .select()
    .from(recurrenceRules)
    .where(and(
      eq(recurrenceRules.isSubscription, true),
      eq(recurrenceRules.isActive, true),
      lte(recurrenceRules.nextRunAt, now)
    ))

  for (const rule of dueRules) {
    db.transaction(tx => {
      tx.insert(transactions).values({
        id: randomUUID(),
        userId: rule.userId,
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
      tx.update(recurrenceRules)
        .set({ nextRunAt, isActive })
        .where(eq(recurrenceRules.id, rule.id))
        .run()
    })
  }
}
