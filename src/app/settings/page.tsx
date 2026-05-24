import { getProfile } from '@/actions/profile'
import { listCategories } from '@/actions/categories'
import { ProfileForm } from './profile-form'
import { CategoryManager } from '@/components/settings/category-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage() {
  const [profile, cats] = await Promise.all([getProfile(), listCategories()])
  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ProfileForm profile={profile} />
      <Card>
        <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
        <CardContent><CategoryManager initialCategories={cats} /></CardContent>
      </Card>
    </div>
  )
}
