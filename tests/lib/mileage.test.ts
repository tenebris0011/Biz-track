import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geocodeAddress, calculateOneWayMiles } from '../../src/lib/mileage'

beforeEach(() => { vi.restoreAllMocks() })

describe('geocodeAddress', () => {
  it('returns parsed suggestions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ display_name: 'Nashville, TN', lat: '36.1627', lon: '-86.7816' }],
    }))
    const results = await geocodeAddress('Nashville TN')
    expect(results).toHaveLength(1)
    expect(results[0].displayName).toBe('Nashville, TN')
    expect(results[0].lat).toBeCloseTo(36.1627)
  })

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
    await expect(geocodeAddress('test')).rejects.toThrow('Nominatim error: 429')
  })
})

describe('calculateOneWayMiles', () => {
  it('converts meters to miles', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ routes: [{ distance: 16093.44 }] }), // exactly 10 miles
    }))
    const miles = await calculateOneWayMiles({ lat: 36.1, lon: -86.7 }, { lat: 36.2, lon: -86.8 })
    expect(miles).toBeCloseTo(10, 1)
  })

  it('throws when no route found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ routes: [] }),
    }))
    await expect(calculateOneWayMiles({ lat: 0, lon: 0 }, { lat: 1, lon: 1 })).rejects.toThrow('No route found')
  })
})
