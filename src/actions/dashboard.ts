'use server'
import { db } from '@/db'
import { transactions, trips, categories, users } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and, gte, lte } from 'drizzle-orm'
import { buildTaxSummary } from '@/lib/tax'

export async function getDashboardData(year: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const userId = session.user.id

  const from = new Date(year, 0, 1)        // Jan 1, local midnight
  const to = new Date(year, 11, 31, 23, 59, 59)  // Dec 31, 23:59:59, local

  const [allTransactions, allTrips, [user]] = await Promise.all([
    db.select({ t: transactions, c: categories })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(eq(transactions.userId, userId), gte(transactions.date, from), lte(transactions.date, to))),
    db.select().from(trips).where(and(eq(trips.userId, userId), gte(trips.date, from), lte(trips.date, to))),
    db.select().from(users).where(eq(users.id, userId)),
  ])

  const income = allTransactions.filter(r => r.t.type === 'income')
  const expenses = allTransactions.filter(r => r.t.type === 'expense')
  const totalIncome = income.reduce((s, r) => s + r.t.amount, 0)
  const totalExpenses = expenses.reduce((s, r) => s + r.t.amount, 0)
  const totalRoundTripMiles = allTrips.reduce((s, t) => s + t.oneWayMiles * 2, 0)
  const mileageRate = user?.defaultMileageRate ?? 0.67

  const monthly = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthIncome = income.filter(r => r.t.date.getMonth() + 1 === month).reduce((s, r) => s + r.t.amount, 0)
    const monthExpenses = expenses.filter(r => r.t.date.getMonth() + 1 === month).reduce((s, r) => s + r.t.amount, 0)
    return { month: new Date(year, i).toLocaleString('default', { month: 'short' }), income: monthIncome, expenses: monthExpenses }
  })

  const categoryMap = new Map<string, number>()
  for (const r of expenses) {
    const name = r.c?.name ?? 'Uncategorized'
    categoryMap.set(name, (categoryMap.get(name) ?? 0) + r.t.amount)
  }
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)

  const taxSummary = buildTaxSummary(
    expenses.map(r => ({ amount: r.t.amount, irsLine: r.c?.irsLine ?? null })),
    totalRoundTripMiles,
    mileageRate
  )

  return { totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses, totalRoundTripMiles, mileageRate, monthly, categoryBreakdown, taxSummary }
}
