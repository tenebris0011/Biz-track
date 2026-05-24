'use server'
import { db } from '@/db'
import { csvImportTemplates } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function listImportTemplates() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return db.select().from(csvImportTemplates).where(eq(csvImportTemplates.userId, session.user.id))
}

export async function saveImportTemplate(name: string, importType: 'income' | 'expense' | 'trip', columnMappings: Record<string, string>) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const trimmedName = name.trim()
  if (!trimmedName) throw new Error('Template name is required')
  await db.insert(csvImportTemplates).values({
    id: randomUUID(),
    userId: session.user.id,
    name: trimmedName,
    importType,
    columnMappings: JSON.stringify(columnMappings),
    createdAt: new Date(),
  })
}

export async function deleteImportTemplate(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  await db.delete(csvImportTemplates).where(and(eq(csvImportTemplates.id, id), eq(csvImportTemplates.userId, session.user.id)))
}
