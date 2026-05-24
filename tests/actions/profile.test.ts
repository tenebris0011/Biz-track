import { describe, it, expect, beforeEach } from 'vitest'
import { testDb } from '../setup'
import { users } from '../../src/db/schema'
import { eq } from 'drizzle-orm'

beforeEach(async () => {
  await testDb
    .update(users)
    .set({ homeAddress: '123 Test St, Nashville, TN', defaultMileageRate: 0.67 })
    .where(eq(users.id, 'test-user-id'))
})

describe('profile', () => {
  it('updates home address', async () => {
    await testDb
      .update(users)
      .set({ homeAddress: '456 Oak Ave, Nashville, TN', updatedAt: new Date() })
      .where(eq(users.id, 'test-user-id'))
    const [user] = await testDb.select().from(users).where(eq(users.id, 'test-user-id'))
    expect(user.homeAddress).toBe('456 Oak Ave, Nashville, TN')
  })

  it('updates mileage rate', async () => {
    await testDb
      .update(users)
      .set({ defaultMileageRate: 0.70, updatedAt: new Date() })
      .where(eq(users.id, 'test-user-id'))
    const [user] = await testDb.select().from(users).where(eq(users.id, 'test-user-id'))
    expect(user.defaultMileageRate).toBe(0.70)
  })
})
