const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const OSRM_BASE = 'http://router.project-osrm.org'

export interface AddressSuggestion {
  displayName: string
  lat: number
  lon: number
}

export async function geocodeAddress(query: string): Promise<AddressSuggestion[]> {
  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=5`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'BizTrack/1.0 (local personal finance app)' },
  })
  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`)
  const data: Array<{ display_name: string; lat: string; lon: string }> = await res.json()
  return data.map(item => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  }))
}

export async function calculateOneWayMiles(
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number }
): Promise<number> {
  const url = `${OSRM_BASE}/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=false`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OSRM error: ${res.status}`)
  const data: { routes: Array<{ distance: number }> } = await res.json()
  if (!data.routes?.length) throw new Error('No route found')
  return data.routes[0].distance / 1609.344
}
