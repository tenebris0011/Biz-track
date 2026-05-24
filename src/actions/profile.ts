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
  return user
}

export async function updateProfile(data: {
  name: string
  homeAddress: string
  defaultMileageRate: number
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  await db
    .update(users)
    .set({ name: data.name, homeAddress: data.homeAddress, defaultMileageRate: data.defaultMileageRate, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  await auth.api.changePassword({
    headers: await headers(),
    body: { currentPassword, newPassword, revokeOtherSessions: false },
  })
}
