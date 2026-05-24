'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createTrip } from '@/actions/trips'
import { AddressAutocomplete } from './address-autocomplete'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AddressSuggestion } from '@/lib/mileage'

export function TripForm({ defaultOrigin }: { defaultOrigin: string }) {
  const router = useRouter()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [origin, setOrigin] = useState(defaultOrigin)
  const [originCoords, setOriginCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [destination, setDestination] = useState('')
  const [destCoords, setDestCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [purpose, setPurpose] = useState('')
  const [notes, setNotes] = useState('')
  const [manualMiles, setManualMiles] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!defaultOrigin) return
    fetch(`/api/geocode?q=${encodeURIComponent(defaultOrigin)}`)
      .then(r => r.ok ? r.json() : [])
      .then((results: AddressSuggestion[]) => {
        if (results[0]) setOriginCoords({ lat: results[0].lat, lon: results[0].lon })
      })
      .catch(() => {})
  }, [defaultOrigin])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    let oneWayMiles: number

    if (manualMiles) {
      oneWayMiles = parseFloat(manualMiles)
      if (!isFinite(oneWayMiles) || oneWayMiles <= 0) {
        setError('Miles must be a positive number')
        return
      }
    } else if (originCoords && destCoords) {
      setCalculating(true)
      try {
        const res = await fetch(`/api/osrm?olat=${originCoords.lat}&olon=${originCoords.lon}&dlat=${destCoords.lat}&dlon=${destCoords.lon}`)
        if (!res.ok) throw new Error('Routing failed')
        const json = await res.json()
        oneWayMiles = json.oneWayMiles
      } catch {
        setError('Could not calculate distance. Enter miles manually.')
        setCalculating(false)
        return
      }
      setCalculating(false)
    } else {
      setError('Select addresses from the suggestions or enter miles manually.')
      return
    }

    try {
      const [y, m, d] = date.split('-').map(Number)
      await createTrip({
        date: new Date(y, m - 1, d),
        originAddress: origin,
        destinationAddress: destination,
        oneWayMiles,
        purpose,
        notes: notes || undefined,
      })
      router.push('/trips')
    } catch (err) {
      setError((err instanceof Error && err.message) ? err.message : 'Failed to save trip')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
      <div>
        <Label>Origin</Label>
        <AddressAutocomplete
          value={origin}
          onChange={v => { setOrigin(v); setOriginCoords(null) }}
          onSelect={(s: AddressSuggestion) => { setOrigin(s.displayName); setOriginCoords({ lat: s.lat, lon: s.lon }) }}
          placeholder="Start address"
        />
      </div>
      <div>
        <Label>Destination</Label>
        <AddressAutocomplete
          value={destination}
          onChange={v => { setDestination(v); setDestCoords(null) }}
          onSelect={(s: AddressSuggestion) => { setDestination(s.displayName); setDestCoords({ lat: s.lat, lon: s.lon }) }}
          placeholder="End address"
        />
      </div>
      <div><Label>Purpose</Label><Input value={purpose} onChange={e => setPurpose(e.target.value)} required /></div>
      <div><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
      <div>
        <Label>One-way miles (manual override)</Label>
        <Input type="number" step="0.1" min="0.1" value={manualMiles} onChange={e => setManualMiles(e.target.value)} placeholder="Leave blank to calculate automatically" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={calculating}>{calculating ? 'Calculating…' : 'Add Trip'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
