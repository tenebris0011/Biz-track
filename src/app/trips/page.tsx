import { listTrips } from '@/actions/trips'
import { TripsPageClient } from '@/components/trips/trips-page-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function TripsPage() {
  const trips = await listTrips()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trips</h1>
        <Link href="/trips/new"><Button>Add Trip</Button></Link>
      </div>
      <TripsPageClient trips={trips} />
    </div>
  )
}
