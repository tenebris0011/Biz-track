import { NextRequest, NextResponse } from 'next/server'
import { calculateOneWayMiles } from '@/lib/mileage'

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const olat = parseFloat(p.get('olat') ?? '')
  const olon = parseFloat(p.get('olon') ?? '')
  const dlat = parseFloat(p.get('dlat') ?? '')
  const dlon = parseFloat(p.get('dlon') ?? '')
  if ([olat, olon, dlat, dlon].some(isNaN)) return NextResponse.json({ error: 'Invalid coords' }, { status: 400 })
  try {
    const oneWayMiles = await calculateOneWayMiles({ lat: olat, lon: olon }, { lat: dlat, lon: dlon })
    return NextResponse.json({ oneWayMiles })
  } catch {
    return NextResponse.json({ error: 'Routing failed' }, { status: 502 })
  }
}
