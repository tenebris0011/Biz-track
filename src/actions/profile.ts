'use server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

export async function getProfile() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id))
  if (!user) throw new Error('User not found')
  return user
}

export async function updateProfile(data: {
  name: string
  homeAddress: string
  defaultMileageRate: number
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const rate = data.defaultMileageRate
  if (!isFinite(rate) || rate <= 0 || rate > 10) throw new Error('Invalid mileage rate')
  await db
    .update(users)
    .set({ name: data.name, homeAddress: data.homeAddress, defaultMileageRate: rate, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  if (!session) throw new Error('Unauthorized')
  await auth.api.changePassword({
    headers: h,
    body: { currentPassword, newPassword, revokeOtherSessions: false },
  })
}
