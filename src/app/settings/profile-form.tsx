'use client'
import { useState } from 'react'
import { updateProfile, changePassword } from '@/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Profile = { name: string; homeAddress: string | null; defaultMileageRate: number }

export function ProfileForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name)
  const [homeAddress, setHomeAddress] = useState(profile.homeAddress ?? '')
  const [mileageRate, setMileageRate] = useState(String(profile.defaultMileageRate))
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [msg, setMsg] = useState('')

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateProfile({ name, homeAddress, defaultMileageRate: parseFloat(mileageRate) })
      setMsg('Profile saved.')
    } catch {
      setMsg('Failed to save profile.')
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    try {
      await changePassword(currentPw, newPw)
      setMsg('Password changed.')
      setCurrentPw('')
      setNewPw('')
    } catch {
      setMsg('Password change failed — check current password.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleProfile} className="space-y-4">
            <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
            <div><Label>Home Address</Label><Input value={homeAddress} onChange={e => setHomeAddress(e.target.value)} /></div>
            <div><Label>IRS Mileage Rate ($/mile)</Label><Input type="number" step="0.001" value={mileageRate} onChange={e => setMileageRate(e.target.value)} required /></div>
            <Button type="submit">Save Profile</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePassword} className="space-y-4">
            <div><Label>Current Password</Label><Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required /></div>
            <div><Label>New Password</Label><Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required /></div>
            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  )
}
