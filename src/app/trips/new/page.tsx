import { getProfile } from '@/actions/profile'
import { TripForm } from '@/components/trips/trip-form'

export default async function NewTripPage() {
  const profile = await getProfile()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New Trip</h1>
      <TripForm defaultOrigin={profile.homeAddress ?? ''} />
    </div>
  )
}
