import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { transactions, trips, categories } from '@/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { exportTransactionsCSV, exportTripsCSV } from '@/lib/csv'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const p = request.nextUrl.searchParams
  const dataType = p.get('type') as 'transactions' | 'trips' | null
  const fromStr = p.get('from')
  const toStr = p.get('to')

  if (!dataType || !['transactions', 'trips'].includes(dataType)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const userId = session.user.id
  const from = fromStr ? new Date(fromStr) : undefined
  const to = toStr ? new Date(toStr + 'T23:59:59.999Z') : undefined

  if (dataType === 'transactions') {
    const conditions = [eq(transactions.userId, userId)]
    if (from) conditions.push(gte(transactions.date, from))
    if (to) conditions.push(lte(transactions.date, to))

    const rows = await db
      .select({ t: transactions, c: categories })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))

    const csv = exportTransactionsCSV(rows.map(r => ({ ...r.t, categoryName: r.c?.name ?? null })))
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="transactions.csv"',
      },
    })
  }

  // dataType === 'trips'
  const conditions = [eq(trips.userId, userId)]
  if (from) conditions.push(gte(trips.date, from))
  if (to) conditions.push(lte(trips.date, to))

  const rows = await db.select().from(trips).where(and(...conditions))
  const csv = exportTripsCSV(rows)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="trips.csv"',
    },
  })
}
