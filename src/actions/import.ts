'use server'
import { db } from '@/db'
import { transactions, trips } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

export interface ImportResult {
  imported: number
  skipped: number
  skippedRows: Array<{ row: number; reason: string }>
}

type MappedRow = Record<string, string>

export async function importTransactions(rows: MappedRow[], type: 'income' | 'expense'): Promise<ImportResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const result: ImportResult = { imported: 0, skipped: 0, skippedRows: [] }

  const validRows: typeof transactions.$inferInsert[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const dateStr = row.date?.trim()
    const amount = parseFloat(row.amount)
    const description = row.description?.trim()

    if (!dateStr) { result.skipped++; result.skippedRows.push({ row: i + 1, reason: 'Missing date' }); continue }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) { result.skipped++; result.skippedRows.push({ row: i + 1, reason: 'Invalid date' }); continue }
    if (isNaN(amount) || amount <= 0) { result.skipped++; result.skippedRows.push({ row: i + 1, reason: 'Invalid amount' }); continue }
    if (!description) { result.skipped++; result.skippedRows.push({ row: i + 1, reason: 'Missing description' }); continue }

    validRows.push({
      id: randomUUID(), userId: session.user.id, date, type,
      amount: Math.round(amount * 100) / 100,
      description,
      categoryId: null, notes: row.notes?.trim() || null, recurrenceId: null, createdAt: new Date(),
    })
    result.imported++
  }

  if (validRows.length > 0) {
    db.transaction(tx => {
      for (const row of validRows) {
        tx.insert(transactions).values(row).run()
      }
    })
  }

  revalidatePath('/transactions')
  revalidatePath('/')
  return result
}

export async function importTrips(rows: MappedRow[]): Promise<ImportResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const result: ImportResult = { imported: 0, skipped: 0, skippedRows: [] }

  const validRows: typeof trips.$inferInsert[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const dateStr = row.date?.trim()
    const origin = row.origin?.trim()
    const destination = row.destination?.trim()
    const purpose = row.purpose?.trim()
    const oneWayMiles = parseFloat(row.miles)

    if (!dateStr) { result.skipped++; result.skippedRows.push({ row: i + 1, reason: 'Missing date' }); continue }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) { result.skipped++; result.skippedRows.push({ row: i + 1, reason: 'Invalid date' }); continue }
    if (!origin) { result.skipped++; result.skippedRows.push({ row: i + 1, reason: 'Missing origin' }); continue }
    if (!destination) { result.skipped++; result.skippedRows.push({ row: i + 1, reason: 'Missing destination' }); continue }
    if (!purpose) { result.skipped++; result.skippedRows.push({ row: i + 1, reason: 'Missing purpose' }); continue }
    if (isNaN(oneWayMiles) || oneWayMiles <= 0) { result.skipped++; result.skippedRows.push({ row: i + 1, reason: 'Invalid miles' }); continue }

    validRows.push({
      id: randomUUID(), userId: session.user.id, date, originAddress: origin,
      destinationAddress: destination, oneWayMiles: Math.round(oneWayMiles * 10) / 10,
      purpose, notes: row.notes?.trim() || null, createdAt: new Date(),
    })
    result.imported++
  }

  if (validRows.length > 0) {
    db.transaction(tx => {
      for (const row of validRows) {
        tx.insert(trips).values(row).run()
      }
    })
  }

  revalidatePath('/trips')
  revalidatePath('/')
  return result
}
