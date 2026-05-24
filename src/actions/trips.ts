'use server'
import { db } from '@/db'
import { trips } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and, desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

export type TripInput = {
  date: Date
  originAddress: string
  destinationAddress: string
  oneWayMiles: number
  purpose: string
  notes?: string
}

export async function listTrips() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return db.select().from(trips).where(eq(trips.userId, session.user.id)).orderBy(desc(trips.date))
}

export async function createTrip(data: TripInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const purpose = data.purpose.trim()
  if (!purpose) throw new Error('Purpose is required')
  const oneWayMiles = Math.round(data.oneWayMiles * 10) / 10  // round to 1 decimal
  if (!isFinite(oneWayMiles) || oneWayMiles <= 0) throw new Error('Miles must be a positive number')
  await db.insert(trips).values({
    id: randomUUID(),
    userId: session.user.id,
    date: data.date,
    originAddress: data.originAddress.trim(),
    destinationAddress: data.destinationAddress.trim(),
    oneWayMiles,
    purpose,
    notes: data.notes?.trim() || null,
    createdAt: new Date(),
  })
  revalidatePath('/trips')
  revalidatePath('/')
}

export async function deleteTrip(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  await db.delete(trips).where(and(eq(trips.id, id), eq(trips.userId, session.user.id)))
  revalidatePath('/trips')
  revalidatePath('/')
}
