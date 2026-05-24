import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/mileage'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json([])
  try {
    const results = await geocodeAddress(q)
    return NextResponse.json(results)
  } catch {
    return NextResponse.json([], { status: 200 }) // degrade gracefully
  }
}
