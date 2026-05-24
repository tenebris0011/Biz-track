import { getProfile } from '@/actions/profile'
import { ProfileForm } from './profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage() {
  const profile = await getProfile()
  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ProfileForm profile={profile} />
    </div>
  )
}
