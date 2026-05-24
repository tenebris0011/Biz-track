'use client'
import { useState } from 'react'
import { deleteTrip } from '@/actions/trips'
import { Button } from '@/components/ui/button'

type Trip = {
  id: string
  date: Date | string
  destinationAddress: string
  purpose: string
  oneWayMiles: number
}

export function TripsPageClient({ trips: initialTrips }: { trips: Trip[] }) {
  const [trips, setTrips] = useState(initialTrips)
  const [error, setError] = useState('')

  async function handleDelete(id: string) {
    if (!confirm('Delete this trip?')) return
    setError('')
    const prev = trips
    setTrips(trips.filter(t => t.id !== id))
    try {
      await deleteTrip(id)
    } catch (err) {
      setTrips(prev)
      setError(err instanceof Error ? err.message : 'Failed to delete trip')
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="border rounded-md divide-y">
        {trips.map(t => (
          <div key={t.id} className="p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug">{t.purpose}</p>
              <p className="text-sm font-semibold shrink-0">{(t.oneWayMiles * 2).toFixed(1)} mi RT</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground line-clamp-1">
                {new Date(t.date).toLocaleDateString()} · {t.destinationAddress}
              </p>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={() => handleDelete(t.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {trips.length === 0 && <p className="p-4 text-sm text-muted-foreground">No trips.</p>}
      </div>
    </div>
  )
}
